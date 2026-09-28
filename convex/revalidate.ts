import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const MAX_ATTEMPTS = 5;

/** Tells the Next.js site to drop cached pages for the given tags, retrying with backoff. */
export const run = internalAction({
	args: { tags: v.array(v.string()), attempt: v.number() },
	handler: async (ctx, { tags, attempt }) => {
		const siteUrl = process.env.SITE_URL;
		const secret = process.env.REVALIDATE_SECRET;
		if (!siteUrl || !secret) {
			console.warn("SITE_URL or REVALIDATE_SECRET is not set; skipping revalidation", tags);
			return;
		}

		try {
			const res = await fetch(`${siteUrl.replace(/\/$/, "")}/api/revalidate`, {
				method: "POST",
				headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
				body: JSON.stringify({ tags }),
			});
			if (!res.ok) throw new Error(`Revalidate responded ${res.status}`);
		} catch (error) {
			if (attempt + 1 >= MAX_ATTEMPTS) {
				console.error("Giving up on revalidation", tags, error);
				return;
			}
			const delayMs = 2 ** attempt * 5_000;
			console.warn(`Revalidation failed, retrying in ${delayMs}ms`, error);
			await ctx.scheduler.runAfter(delayMs, internal.revalidate.run, { tags, attempt: attempt + 1 });
		}
	},
});
