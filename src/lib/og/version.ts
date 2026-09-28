/**
 * Short fingerprint of the text shown on the generated OG image. It goes into the og:image URL
 * (`/og/<slug>?v=…`), so social networks and the CDN fetch a fresh image whenever it changes.
 */
export function ogImageVersion({ title, description }: { title: string; description: string }) {
	let hash = 0x811c9dc5; // FNV-1a
	for (const char of `${title}\u0000${description}`) {
		hash ^= char.codePointAt(0)!;
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0).toString(36);
}
