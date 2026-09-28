const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function isYouTubeId(value: string | undefined | null): value is string {
	return !!value && YOUTUBE_ID.test(value);
}

/** Accepts a bare video ID or any common YouTube URL (watch, youtu.be, embed, shorts). */
export function parseYouTubeId(input: string): string | null {
	const value = input.trim();
	if (isYouTubeId(value)) return value;
	try {
		const url = new URL(value);
		const host = url.hostname.replace(/^www\.|^m\./, "");
		let id: string | null = null;
		if (host === "youtu.be") id = url.pathname.slice(1);
		else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
			id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ?? null;
		}
		return isYouTubeId(id) ? id : null;
	} catch {
		return null;
	}
}
