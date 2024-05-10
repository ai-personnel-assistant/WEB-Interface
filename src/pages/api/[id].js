import fs from 'fs';
import path from 'path';

export default async function getTrack(req, res) {
	if (req.method === 'GET') {
		try {
			const filePath = path.join(process.cwd(), 'audio/output/' + req.query.id + '.wav');
			const audioFile = fs.readFileSync(filePath);

			res.setHeader('Content-Type', 'audio/wav');
			res.status(200).send(audioFile);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'Erreur interne du serveur' });
		}
	} else {
		res.setHeader('Allow', ['GET']);
		res.status(405).json({ error: `The ${req.method} method is not allowed` });
	}
}
