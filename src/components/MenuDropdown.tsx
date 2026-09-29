"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** A text button that opens a small menu of options (used for the favorites filter and sort). */
export function MenuDropdown<T extends string>({
	value,
	options,
	onChange,
	label,
	icon,
}: {
	value: T;
	options: readonly { value: T; label: string }[];
	onChange: (value: T) => void;
	label: string;
	icon?: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const current = options.find((option) => option.value === value);

	useEffect(() => {
		if (!open) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [open]);

	return (
		<div className='relative z-50' ref={ref}>
			<button
				onClick={() => setOpen(!open)}
				className='flex gap-1 items-center justify-center relative shrink-0 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity px-2 py-1 -mx-2 -my-1 text-olive-800 dark:text-olive-100'
				aria-label={label}
				aria-haspopup='true'
				aria-expanded={open}>
				{icon}
				<p className='font-medium relative shrink-0 text-sm text-justify text-nowrap whitespace-pre'>
					{current?.label}
				</p>
				<ChevronDown className='size-4' strokeWidth={1.5} />
			</button>

			{open && (
				<div
					className='absolute right-0 top-full mt-2 bg-olive-50 dark:bg-olive-950 border border-olive-200 dark:border-olive-700 rounded-lg shadow-lg py-1 z-50 min-w-32'
					role='menu'>
					{options.map((option) => (
						<button
							key={option.value}
							onClick={() => {
								onChange(option.value);
								setOpen(false);
							}}
							className={`w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors ${
								value === option.value
									? "font-medium text-olive-800 dark:text-olive-100 bg-olive-100 dark:bg-olive-800"
									: "text-olive-500 hover:text-olive-800 dark:hover:text-olive-100 hover:bg-olive-100 dark:hover:bg-olive-800/50"
							}`}
							role='menuitem'
							aria-current={value === option.value}>
							{option.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
