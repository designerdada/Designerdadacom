import { Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { Tooltip } from "./Tooltip";
import Moon from "../imports/Moon";
import Sun from "../imports/Sun";

interface HeaderProps {
	activePage?: "home" | "writing" | "favorites" | "photography";
}

export function Header({ activePage }: HeaderProps = {}) {
	const { toggleTheme, theme } = useTheme();

	const navLinks = [
		{ to: "/", label: "Home", key: "home" },
		{ to: "/writing", label: "Writing", key: "writing" },
		{ to: "/favorites", label: "Favorites", key: "favorites" },
		{ to: "/photography", label: "Photography", key: "photography" },
	] as const;

	const navLinkClass = (key: string) =>
		`font-medium relative shrink-0 text-sm text-justify text-nowrap whitespace-pre transition-all ${
			activePage === key
				? "text-olive-800 dark:text-olive-100 font-semibold"
				: "text-olive-500 hover:text-olive-800 dark:hover:text-olive-100"
		}`;

	return (
		<div className='flex flex-col gap-4 items-start relative shrink-0 w-full'>
			{/* Profile Image */}
			<Link
				to='/'
				className='flex h-10 items-center justify-start relative shrink-0 w-full'
				aria-label='Go to home'>
				<img
					alt='Akash Bhadange profile picture'
					className='size-10 rounded-full'
					src='/assets/profile.png'
					loading='eager'
				/>
			</Link>

			{/* Name */}
			<Link
				to='/'
				className='flex gap-1 h-6 items-center w-full hover:opacity-70 transition-opacity'
				aria-label='Akash Bhadange home'>
				<p className='font-medium relative shrink-0 text-olive-800 dark:text-olive-100 text-xl text-justify text-nowrap whitespace-pre'>
					<span className='font-medium'>Akash Bhadange </span>
					<span className='font-normal italic'>aka</span>
					<span className='font-medium'> @designerdada</span>
				</p>
			</Link>

			{/* Navigation */}
			<nav
				className='flex gap-4 items-center relative shrink-0 w-full'
				aria-label='Main navigation'>
				{navLinks.map(({ to, label, key }) => (
					<Link
						key={key}
						to={to}
						className={navLinkClass(key)}
						aria-current={activePage === key ? "page" : undefined}>
						{label}
					</Link>
				))}
				<Tooltip content={theme === "dark" ? "Delight" : "Go Dark"} className='ml-auto'>
					<button
						onClick={toggleTheme}
						className='group relative cursor-pointer bg-transparent border-none p-0 transition-all text-olive-500 hover:text-olive-800 dark:text-olive-500 dark:hover:text-olive-100 flex items-center'
						aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
						<div className='size-4'>{theme === "dark" ? <Sun /> : <Moon />}</div>
					</button>
				</Tooltip>
			</nav>
		</div>
	);
}
