import Ai from '@/components/ai';
import 'tailwindcss/tailwind.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
	return (
		<>
			<Ai />
			<Component {...pageProps} />
		</>
	);
}
