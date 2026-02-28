import { ReactNode } from "react";

interface TooltipProps {
	content: string;
	children: ReactNode;
	className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
	return (
		<div className={`group/tooltip relative inline-block ${className || ""}`}>
			{children}
			<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-olive-950 dark:bg-olive-100 text-olive-50 dark:text-olive-800 text-xs rounded opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap'>
				{content}
				<div className='absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-olive-950 dark:border-t-olive-100' />
			</div>
		</div>
	);
}
