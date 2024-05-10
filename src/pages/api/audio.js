import multer from 'multer';
import fs from 'fs';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
const upload = multer();

export const config = {
	api: {
		bodyParser: false,
	},
};

export const uploadMiddleware = upload.single('audio');

export default async function handler(req, res) {
	try {
		await new Promise((resolve, reject) => {
			uploadMiddleware(req, res, (err) => {
				if (err) reject(err);
				resolve();
			});
		});

		const file = req.file;
		const session = 'your_session_value'; // Declare the session variable

		if (file) {
			const audioData = file.buffer;
			const id = uuidv4();
			const inputFilePath = `audio/ogg/${id}.ogg`;
			fs.writeFileSync(inputFilePath, audioData);

			const outputFilePath = `audio/wav/${id}.wav`;

			// Convert Opus to WAV using ffmpeg
			const ffmpegCommand = `ffmpeg -i ${inputFilePath} ${outputFilePath}`;

			exec(ffmpegCommand, async (error, stdout, stderr) => {
				if (error) {
					console.error('Error converting file to WAV:', error);
					res.status(500).json({ message: 'An error occurred during file conversion.' });
					return;
				}

				res.status(200).send('Audio file received.');
			});
		} else {
			res.status(400).json({ message: 'Please send a file.' });
		}
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ message: 'An error has occurred while processing the file.' });
	}
}
