"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * The anti-flash script only needs to run from the server HTML. On the client, React 19 warns about any
 * executable <script> it renders, so it gets a non-executable type there (the script sets suppressHydrationWarning).
 */
const scriptProps = { type: typeof window === "undefined" ? "text/javascript" : "text/plain" } as const;

/** Class-based dark mode. Uses the same `theme` localStorage key as the old site, so choices carry over. */
export function ThemeProvider({ children }: { children: ReactNode }) {
	return (
		<NextThemesProvider
			attribute='class'
			storageKey='theme'
			defaultTheme='system'
			enableSystem
			scriptProps={scriptProps}
		>
			{children}
		</NextThemesProvider>
	);
}
