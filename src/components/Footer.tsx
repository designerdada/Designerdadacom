import { MailingList } from "./MailingList";

export function Footer() {
	return (
		<div className='flex flex-col gap-6 items-center justify-center w-full'>
			{/* Logo Image */}
			<img
				alt='Akash Bhadange'
				className='h-10 w-auto object-contain pointer-events-none dark:invert'
				src='/assets/footer-signature.png'
			/>

			{/* Newsletter */}
			<MailingList />
		</div>
	);
}
