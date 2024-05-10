import multer from 'multer';
import fs from 'fs';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import ai from '../../../lib/ai';
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

		if (file) {
			const audioData = file.buffer;
			const id = uuidv4();
			const inputFilePath = `audio/ogg/${id}.ogg`;
			const outputFilePath = `audio/wav/${id}.wav`;

			fs.writeFileSync(inputFilePath, audioData);

			const ffmpegCommand = `ffmpeg -i ${inputFilePath} ${outputFilePath}`;

			exec(ffmpegCommand, async (ffmpegError, stdout, stderr) => {
				if (ffmpegError) {
					res.status(500).json({ status: 500, error: 'An error occurred during file conversion.' });
					return;
				}
				fs.unlinkSync(inputFilePath);
				const { text, url, status, error } = await ai(id);
				if (!error) {
					res.status(200).send({ text, url });
				} else {
					res.status(status).json({ error, status });
				}
			});
		} else {
			res.status(400).json({ status: 400, error: 'Please send a file.' });
		}
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ status: 500, error: 'An error has occurred while processing the file.' });
	}
}
