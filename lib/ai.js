async function transcribe(id) {
	try {
		const response = await fetch(process.env.VOSK_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id }),
		});
		const data = await response.json();

		if (data.error && data.status != 200) {
			return { status: data.status, error: data.error };
		} else {
			return { text: data.text };
		}
	} catch (error) {
		return { status: 500, error: 'An error occurred.' };
	}
}

async function speak(text, id) {
	console.log(process.env.TTS_URL);
	try {
		const response = await fetch(process.env.TTS_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ text, id }),
		});
		const data = await response.json();

		if (data.error && data.status != 200) {
			return { status: data.status, error: data.error };
		} else {
			return { url: '/api/' + id };
		}
	} catch (error) {
		return { status: 500, error: 'An error occurred.' };
	}
}

export default async function ai(id) {
	const { text, status, error } = await transcribe(id);
	console.log(text, status, error);
	if (!error) {
		const { url, status, error } = await speak(text, id);
		console.log(url, status, error);
		if (!error) {
			return { text, url };
		} else {
			return { status, error };
		}
	} else {
		return { status, error };
	}
}
