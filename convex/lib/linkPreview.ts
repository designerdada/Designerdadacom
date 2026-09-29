const USER_AGENT = "Mozilla/5.0 (compatible; designerdada-preview/1.0)";

function decodeEntities(text: string) {
	return text
		.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
		.replaceAll("&quot;", '"')
		.replaceAll("&#39;", "'")
		.replaceAll("&apos;", "'")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&amp;", "&");
}

/** Content of the first `<meta property|name="key">` found, trying keys in order. */
function findMeta(html: string, keys: string[]) {
	for (const key of keys) {
		const tag = html.match(new RegExp(`<meta\\s[^>]*(?:property|name)=["']${key}["'][^>]*>`, "i"))?.[0];
		const content = tag?.match(/content=["']([^"']+)["']/i)?.[1]?.trim();
		if (content) return decodeEntities(content);
	}
	return null;
}

const GENERIC_PAGE_TITLES = /^(home|homepage|home page|welcome|index)$/i;

/** "Time.fyi — World clock" → "Time.fyi", "Seline Analytics: The simple…" → "Seline Analytics", "Home \ Anthropic" → "Anthropic" */
function siteNameFromTitle(title: string) {
	const parts = title
		.split(/\s+[|—–·\\/-]\s+|:\s+/)
		.map((part) => part.trim())
		.filter(Boolean);
	if (parts.length > 1 && GENERIC_PAGE_TITLES.test(parts[0])) return parts[parts.length - 1];
	return parts[0] ?? title.trim();
}

async function fetchPage(url: string) {
	const res = await fetch(url, { headers: { "user-agent": USER_AGENT }, signal: AbortSignal.timeout(8000) });
	if (!res.ok) return null;
	return { html: await res.text(), finalUrl: res.url };
}

function imageFromHtml(html: string, baseUrl: string) {
	const image = findMeta(html, ["og:image", "og:image:url", "twitter:image", "twitter:image:src"]);
	return image ? new URL(image, baseUrl).href : null;
}

/** For sites that block plain fetches or render their meta tags client-side. */
async function fromMicrolink(url: string) {
	const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
		signal: AbortSignal.timeout(10000),
	});
	const data = (await res.json())?.data;
	const image: string | undefined = data?.image?.url;
	return {
		// Logos and SVG icons look broken stretched across the preview card.
		image: image && !/\.svg($|\?)/i.test(image) ? image : null,
		name: (data?.publisher as string | undefined) || (data?.title ? siteNameFromTitle(data.title) : null),
	};
}

/** The page's Open Graph image, or null when it has none we can use. */
export async function findPreviewImage(url: string) {
	const page = await fetchPage(url).catch(() => null);
	const image = page && imageFromHtml(page.html, page.finalUrl);
	return image ?? (await fromMicrolink(url).catch(() => null))?.image ?? null;
}

/** What the admin form shows after a link is pasted: the site's name and preview image. */
export async function inspectLink(url: string) {
	const page = await fetchPage(url).catch(() => null);
	let name: string | null = null;
	let image: string | null = null;
	if (page) {
		const title = page.html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
		name =
			findMeta(page.html, ["og:site_name", "application-name"]) ??
			(title ? siteNameFromTitle(decodeEntities(title)) : null) ??
			findMeta(page.html, ["og:title"]);
		image = imageFromHtml(page.html, page.finalUrl);
	}
	if (!name || !image) {
		const fallback = await fromMicrolink(url).catch(() => null);
		name ??= fallback?.name ?? null;
		image ??= fallback?.image ?? null;
	}
	return { reachable: page !== null, name: name || null, image };
}
