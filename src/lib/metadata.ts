import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/** Nested `alternates` replace the parent's, so every page re-declares the feed link. */
export const rssAlternate = {
	"application/rss+xml": [{ url: "/rss.xml", title: `${siteConfig.author.name} - Writing` }],
};

/**
 * Nested `openGraph`/`twitter` objects also replace the root layout's, so pages spread these back in
 * (otherwise og:locale and twitter:site/creator silently disappear).
 */
export const openGraphDefaults = { siteName: siteConfig.name, locale: "en_US" } as const;
export const twitterDefaults = {
	card: "summary_large_image",
	site: siteConfig.author.handle,
	creator: siteConfig.author.handle,
} as const;

interface PageMetadataInput {
	title: string;
	description: string;
	path: string;
	ogImage: string;
}

/** Metadata for simple top-level pages (Writing, Favorites, Photography). */
export function pageMetadata({ title, description, path, ogImage }: PageMetadataInput): Metadata {
	return {
		title,
		description,
		alternates: { canonical: path, types: rssAlternate },
		openGraph: {
			...openGraphDefaults,
			type: "website",
			title: `${title} | ${siteConfig.author.name}`,
			description,
			url: path,
			images: [{ url: ogImage, width: 1200, height: 630 }],
		},
		twitter: {
			...twitterDefaults,
			title: `${title} | ${siteConfig.author.name}`,
			description,
			images: [ogImage],
		},
	};
}
