"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/** Class-based dark mode. Uses the same `theme` localStorage key as the old site, so choices carry over. */
export function ThemeProvider({ children }: { children: ReactNode }) {
	return (
		<NextThemesProvider attribute='class' storageKey='theme' defaultTheme='system' enableSystem>
			{children}
		</NextThemesProvider>
	);
}
