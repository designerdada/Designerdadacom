"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
	{ href: "/admin", label: "Articles" },
	{ href: "/admin/favorites", label: "Favorites" },
	{ href: "/admin/photos", label: "Photos" },
];

export function AdminNav() {
	const pathname = usePathname();
	const { signOut } = useAuthActions();

	return (
		<nav className='flex items-center gap-4 text-sm'>
			{LINKS.map(({ href, label }) => (
				<Link
					key={href}
					href={href}
					className={
						pathname === href
							? "font-semibold"
							: "text-olive-500 hover:text-olive-800 dark:hover:text-olive-100"
					}>
					{label}
				</Link>
			))}
			<a href='/' target='_blank' className='text-olive-500 hover:text-olive-800 dark:hover:text-olive-100'>
				View site ↗
			</a>
			<button
				type='button'
				onClick={() => void signOut()}
				className='ml-auto text-olive-500 hover:text-olive-800 dark:hover:text-olive-100'>
				Sign out
			</button>
		</nav>
	);
}
