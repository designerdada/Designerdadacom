import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { siteConfig } from "@/config/site";
import { rssAlternate } from "@/lib/metadata";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: {
		default: siteConfig.title,
		template: `%s | ${siteConfig.author.name}`,
	},
	description: siteConfig.description,
	authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
	alternates: { types: rssAlternate },
	icons: { icon: "/favicon.png", apple: "/favicon.png" },
	openGraph: {
		type: "website",
		siteName: siteConfig.name,
		title: siteConfig.title,
		description: siteConfig.description,
		url: "/",
		locale: "en_US",
		images: [{ url: siteConfig.images.ogDefault, width: 1200, height: 630 }],
	},
	twitter: {
		card: "summary_large_image",
		site: siteConfig.author.handle,
		creator: siteConfig.author.handle,
		title: siteConfig.title,
		description: siteConfig.description,
		images: [siteConfig.images.ogDefault],
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#fbfbf7" },
		{ media: "(prefers-color-scheme: dark)", color: "#1f1f1a" },
	],
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='en' className={fontVariables} suppressHydrationWarning>
			<body>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
