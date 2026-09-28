"use client";

import { useTheme } from "next-themes";
import Moon from "../imports/Moon";
import Sun from "../imports/Sun";
import { Tooltip } from "./Tooltip";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<Tooltip content={isDark ? "Delight" : "Go Dark"} className='ml-auto'>
			<button
				onClick={() => setTheme(isDark ? "light" : "dark")}
				className='group relative cursor-pointer bg-transparent border-none px-2 py-1 -mx-2 -my-1 transition-all text-olive-500 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-50 flex items-center'
				aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
				{/* Both icons render on the server; CSS picks one so there is no hydration flash */}
				<div className='size-4 hidden dark:block'>
					<Sun />
				</div>
				<div className='size-4 dark:hidden'>
					<Moon />
				</div>
			</button>
		</Tooltip>
	);
}
