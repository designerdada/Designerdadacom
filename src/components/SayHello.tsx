"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";

const IDLE = "Copy email";

/** "Say hello" link that copies the email address, with a small tooltip. */
export function SayHello() {
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipText, setTooltipText] = useState(IDLE);

	const handleCopyEmail = async (e: React.MouseEvent) => {
		e.preventDefault();
		try {
			await navigator.clipboard.writeText(siteConfig.author.email);
			setTooltipText("Copied!");
			setShowTooltip(true);
			setTimeout(() => {
				setTooltipText(IDLE);
				setShowTooltip(false);
			}, 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<span
			className='relative inline-block'
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => {
				if (tooltipText === IDLE) setShowTooltip(false);
			}}>
			<button
				onClick={handleCopyEmail}
				className='link cursor-pointer bg-transparent border-none p-0 text-olive-800 dark:text-olive-100 text-sm font-medium'>
				Say hello
			</button>
			{showTooltip && (
				<span className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-olive-800 dark:bg-olive-200 text-olive-50 dark:text-olive-800 rounded whitespace-nowrap'>
					{tooltipText}
				</span>
			)}
		</span>
	);
}
