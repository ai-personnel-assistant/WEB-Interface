import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
	const [isRecording, setIsRecording] = useState(false);
	const [audioBlob, setAudioBlob] = useState(null);
	const [audioUrl, setAudioUrl] = useState(null);
	const [text, setText] = useState(null);
	const [error, setError] = useState(null);

	const mediaRecorderRef = useRef(null);
	const chunksRef = useRef([]);

	const startRecording = () => {
		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/ogg' });
				mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
				mediaRecorderRef.current.start();
				setIsRecording(true);
			})
			.catch((error) => {
				console.error('Error accessing microphone:', error);
				setError('Error accessing microphone. Please check your browser permissions.');
			});
	};

	const stopRecording = () => {
		mediaRecorderRef.current.stop();
		setIsRecording(false);
	};

	const handleDataAvailable = (e) => {
		if (e.data.size > 0) {
			chunksRef.current.push(e.data);
			console.log(chunksRef.current);
			setAudioBlob(new Blob(chunksRef.current, { type: 'audio/ogg' }));
			var url = URL.createObjectURL(new Blob(chunksRef.current, { type: 'audio/ogg' }));
			console.log(url);
			setAudioUrl(url);
			chunksRef.current = [];
		}
	};

	const uploadAudio = async () => {
		if (audioBlob) {
			const formData = new FormData();
			formData.append('audio', audioBlob);

			const controller = new AbortController();
			const signal = controller.signal;

			// Set a timeout of 30 seconds (adjust as needed)
			const timeoutId = setTimeout(() => {
				controller.abort();
				console.log('Request timed out');
			}, 30000); // 30 seconds

			try {
				const response = await fetch('/api/audio', {
					method: 'POST',
					body: formData,
					signal: signal,
				});
				clearTimeout(timeoutId); // Clear timeout if request succeeds before timeout

				const data = await response.json();
				console.log(data);
				if (data.error) {
					setError(data.error);
				} else {
					setText(data.text);
					setAudioUrl(data.url);
				}
			} catch (error) {
				console.error('Fetch error:', error);
				// Handle fetch error here
				setError('An error occurred while uploading audio.');
			}
		}
	};

	return (
		<>
			<Head>
				<title>AI</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main>
				<div className="flex gap-5 flex-col w-full items-center justify-center min-h-screen bg-white dark:bg-[#171719]">
					{isRecording ? (
						<button onClick={stopRecording} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
							Stop Recording
						</button>
					) : (
						<button onClick={startRecording} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
							Start Recording
						</button>
					)}
					{audioBlob && (
						<button onClick={uploadAudio} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
							Upload Recorded Audio
						</button>
					)}
					<audio controls src={audioUrl}></audio>
					{text && <p className="text-white">{text}</p>}
					{error && <p className="text-red-500">{error}</p>}
				</div>
			</main>
		</>
	);
}
