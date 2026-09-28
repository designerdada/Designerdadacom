const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Visible date style used across the site, e.g. `29.Jul.2026` (always UTC to avoid hydration drift). */
export function formatDisplayDate(ms: number): string {
	const d = new Date(ms);
	const day = String(d.getUTCDate()).padStart(2, "0");
	return `${day}.${MONTHS[d.getUTCMonth()]}.${d.getUTCFullYear()}`;
}

export function toISO(ms: number): string {
	return new Date(ms).toISOString();
}
