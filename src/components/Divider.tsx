const DOT_COLORS = ["#E9573F", "#F0BF2E", "#4E964E"];

/** The three coloured dots used to separate page sections. */
export function ColorDots({ className = "py-2" }: { className?: string }) {
	return (
		<div className={`flex gap-2 items-center justify-center w-full ${className}`}>
			{DOT_COLORS.map((color) => (
				<div key={color} className='relative shrink-0 size-2'>
					<svg className='block size-full' fill='none' preserveAspectRatio='none' viewBox='0 0 8 8'>
						<circle cx='4' cy='4' fill={color} r='4' />
					</svg>
				</div>
			))}
		</div>
	);
}

export function Divider() {
	return <ColorDots className='py-4' />;
}
