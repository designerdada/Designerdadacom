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

/** The page's Open Graph image, or null when it has none we can use. */
export async function findPreviewImage(url: string) {
	return (await fromPage(url).catch(() => null)) ?? (await fromMicrolink(url).catch(() => null));
}
