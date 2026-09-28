import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

/** Called by Convex (convex/revalidate.ts) after an article is published, updated, or removed. */
export async function POST(request: Request) {
	const secret = process.env.REVALIDATE_SECRET;
	const provided = request.headers.get("x-revalidate-secret") ?? "";
	if (!secret || !safeEqual(provided, secret)) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
	const tags = Array.isArray(body?.tags)
		? body.tags.filter((t): t is string => typeof t === "string" && t.length <= 256)
		: [];
	if (tags.length === 0) return Response.json({ error: "No tags" }, { status: 400 });

	// expire: 0 so the next visitor gets the new version, not a stale one.
	for (const tag of tags) revalidateTag(tag, { expire: 0 });
	return Response.json({ revalidated: tags });
}

function safeEqual(a: string, b: string) {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	return left.length === right.length && timingSafeEqual(left, right);
}
