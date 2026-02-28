export function Footer() {
	return (
		<div className='flex flex-col gap-4 items-center justify-center w-full'>
			{/* Logo Image */}
			<img
				alt='Akash Bhadange'
				className='h-6 w-auto object-contain pointer-events-none'
				src='/assets/footer-signature.png'
			/>

			{/* Footer Note */}
			<p className='text-xs font-mono text-center text-olive-500 dark:text-olive-400 w-full'>
				This site template is open sourced and available on{" "}
				<a
					href='https://github.com/designerdada/Designerdadacom'
					target='_blank'
					rel='noopener noreferrer'
					className='font-medium hover:text-olive-800 dark:hover:text-olive-100 transition-colors'>
					GitHub
				</a>
				.
			</p>
		</div>
	);
}
