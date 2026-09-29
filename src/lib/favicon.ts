export function getFaviconUrl(url: string) {
	try {
		return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
	} catch {
		return "";
	}
}

export function getDomain(url: string) {
	try {
		return new URL(url).hostname.replace("www.", "");
	} catch {
		return url;
	}
}
