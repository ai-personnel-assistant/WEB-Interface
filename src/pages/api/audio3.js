import multer from 'multer';
import fs from 'fs';
import { exec } from 'child_process';
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

			const inputFilePath = `audio1.ogg`;
			fs.writeFileSync(inputFilePath, audioData);

			const outputFilePath = `audio/output.wav`;

			// Convert Opus to WAV using ffmpeg
			const ffmpegCommand = `ffmpeg -i ${inputFilePath} ${outputFilePath}`;

			exec(ffmpegCommand, async (error, stdout, stderr) => {
				if (error) {
					console.error('Error converting file to WAV:', error);
					res.status(500).json({ message: 'An error occurred during file conversion.' });
					return;
				}

				// Perform any additional operations, e.g., saving to a database
				const response = await insertQuiz(outputFilePath, session);
				setTimeout(() => {
					res.status(response.code).send(response);
				}, 3000);
			});
		} else {
			res.status(400).json({ message: 'Please send a file.' });
		}
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ message: 'An error has occurred while processing the file.' });
	}
}
