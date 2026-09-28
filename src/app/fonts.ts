import { IM_Fell_Great_Primer, Schibsted_Grotesk, Sono } from "next/font/google";

/** Self-hosted at build time by next/font; exposed as CSS variables consumed by @theme in globals.css. */
export const sans = Schibsted_Grotesk({
	subsets: ["latin"],
	style: ["normal", "italic"],
	variable: "--font-schibsted-grotesk",
	display: "swap",
});

export const serif = IM_Fell_Great_Primer({
	subsets: ["latin"],
	weight: "400",
	style: ["normal", "italic"],
	variable: "--font-im-fell",
	display: "swap",
});

export const mono = Sono({
	subsets: ["latin"],
	variable: "--font-sono",
	display: "swap",
});

export const fontVariables = `${sans.variable} ${serif.variable} ${mono.variable}`;
