import { cacheLife } from "next/cache";

const USER_AGENT = "Mozilla/5.0 (compatible; designerdada-preview/1.0)";

/** Reads `og:image` (or `twitter:image`) from a page's HTML. */
function findMetaImage(html: string, baseUrl: string) {
	for (const key of ["og:image", "twitter:image"]) {
		const tag = html.match(new RegExp(`<meta\\s[^>]*(?:property|name)=["']${key}(?::src)?["'][^>]*>`, "i"))?.[0];
		const content = tag?.match(/content=["']([^"']+)["']/i)?.[1];
		if (content) return new URL(content.replaceAll("&amp;", "&"), baseUrl).href;
	}
	return null;
}

async function fromPage(url: string) {
	const res = await fetch(url, { headers: { "user-agent": USER_AGENT }, signal: AbortSignal.timeout(8000) });
	if (!res.ok) return null;
	return findMetaImage(await res.text(), res.url);
}

/** For sites that block plain fetches or render their meta tags client-side. */
async function fromMicrolink(url: string) {
	const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
		signal: AbortSignal.timeout(10000),
	});
	const data = await res.json();
	const image: string | undefined = data?.data?.image?.url;
	// Logos and SVG icons look broken stretched across the preview card.
	return image && !/\.svg($|\?)/i.test(image) ? image : null;
}

/**
 * Preview image for each URL, resolved on the server and cached for days, so visitors get the image
 * URLs in the HTML instead of calling an API per link. URLs without a preview are left out.
 */
export async function getLinkPreviews(urls: string[]): Promise<Record<string, string>> {
	"use cache";
	cacheLife("days");

	const entries = await Promise.all(
		urls.map(async (url) => {
			const image =
				(await fromPage(url).catch(() => null)) ?? (await fromMicrolink(url).catch(() => null));
			return [url, image] as const;
		}),
	);
	return Object.fromEntries(entries.filter((entry): entry is [string, string] => entry[1] !== null));
}
