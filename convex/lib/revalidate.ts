import { internal } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";

/** Cache tags used by the Next.js site: every list view shares `articles`, each page has its own tag. */
export function articleTags(slug: string): string[] {
	return ["articles", `article:${slug}`];
}

/** Runs after the mutation commits, so the site never re-fetches stale data. */
export async function scheduleRevalidate(ctx: MutationCtx, tags: string[]) {
	await ctx.scheduler.runAfter(0, internal.revalidate.run, { tags, attempt: 0 });
}
