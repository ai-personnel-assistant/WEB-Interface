import Head from 'next/head';

export default function Index() {
	return (
		<>
			<Head>
				<title>PasswordGame</title>
				<meta name="description" content="Can you find the password ??" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="flex flex-col w-full items-center justify-center min-h-screen bg-white dark:bg-[#171719]"></div>
		</>
	);
}
