import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { requireAdmin } from "./lib/admin";
import { articleTags, scheduleRevalidate } from "./lib/revalidate";

const DEFAULT_AUTHOR = "Akash Bhadange";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type LiveArticle = NonNullable<Doc<"articles">["live"]>;

// ---------------------------------------------------------------------------
// Public queries: they only ever read the published `live` snapshot.
// ---------------------------------------------------------------------------

export const listPublished = query({
	args: { withBody: v.optional(v.boolean()) },
	handler: async (ctx, { withBody }) => {
		const docs = await ctx.db
			.query("articles")
			.withIndex("by_live_publishedAt", (q) => q.gt("live.publishedAt", 0))
			.order("desc")
			.collect();
		return docs.map(({ live }) => {
			const article = live as LiveArticle;
			return withBody ? article : { ...article, body: "" };
		});
	},
});

export const getPublishedBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, { slug }) => {
		const doc = await ctx.db
			.query("articles")
			.withIndex("by_live_slug", (q) => q.eq("live.slug", slug))
			.unique();
		if (doc?.live) return { article: doc.live };

		const redirect = await ctx.db
			.query("slugRedirects")
			.withIndex("by_from", (q) => q.eq("from", slug))
			.unique();
		if (redirect) {
			const target = await ctx.db.get(redirect.articleId);
			if (target?.live) return { redirectTo: target.live.slug };
		}
		return null;
	},
});

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const list = query({
	args: {},
	handler: async (ctx) => {
		await requireAdmin(ctx);
		const docs = await ctx.db.query("articles").collect();
		return docs
			.map((doc) => ({
				_id: doc._id,
				title: doc.title,
				slug: doc.slug,
				status: doc.status,
				updatedAt: doc.updatedAt,
				publishedAt: doc.publishedAt,
				publishAt: doc.publishAt,
				isLive: !!doc.live,
				hasUnpublishedChanges: hasUnpublishedChanges(doc),
				publishError: doc.publishError,
			}))
			.sort(compareForDashboard);
	},
});

export const get = query({
	args: { id: v.id("articles") },
	handler: async (ctx, { id }) => {
		await requireAdmin(ctx);
		const doc = await ctx.db.get(id);
		return doc && { ...doc, hasUnpublishedChanges: hasUnpublishedChanges(doc) };
	},
});

export const create = mutation({
	args: {},
	handler: async (ctx) => {
		await requireAdmin(ctx);
		const slug = await uniqueSlug(ctx, "untitled");
		return ctx.db.insert("articles", {
			slug,
			title: "",
			description: "",
			body: "",
			keywords: [],
			author: DEFAULT_AUTHOR,
			status: "draft",
			updatedAt: Date.now(),
		});
	},
});

export const saveDraft = mutation({
	args: {
		id: v.id("articles"),
		patch: v.object({
			title: v.optional(v.string()),
			description: v.optional(v.string()),
			body: v.optional(v.string()),
			slug: v.optional(v.string()),
			seoTitle: v.optional(v.string()),
			keywords: v.optional(v.array(v.string())),
			canonicalUrl: v.optional(v.string()),
			author: v.optional(v.string()),
			publishedAt: v.optional(v.union(v.number(), v.null())), // null clears it
		}),
	},
	handler: async (ctx, { id, patch }) => {
		await requireAdmin(ctx);
		const doc = await getOrThrow(ctx, id);
		const { slug, publishedAt, ...rest } = patch;

		// A bad slug must not block saving everything else (autosave would otherwise stall).
		let slugError: string | undefined;
		const slugChange: { slug?: string } = {};
		if (slug !== undefined && slug !== doc.slug) {
			slugError = (await slugProblem(ctx, slug, id)) ?? undefined;
			if (!slugError) slugChange.slug = slug;
		}

		// Empty strings clear optional fields instead of storing "". Only keys that were sent are
		// touched, because patching with `undefined` removes a field.
		const cleaned: Partial<Doc<"articles">> = { ...rest, ...slugChange };
		if ("seoTitle" in rest) cleaned.seoTitle = rest.seoTitle?.trim() || undefined;
		if ("canonicalUrl" in rest) cleaned.canonicalUrl = rest.canonicalUrl?.trim() || undefined;
		if (publishedAt !== undefined) cleaned.publishedAt = publishedAt ?? undefined;
		await ctx.db.patch(id, { ...cleaned, updatedAt: Date.now() });
		return { slug: slugChange.slug ?? doc.slug, slugError };
	},
});

export const publish = mutation({
	args: { id: v.id("articles") },
	handler: async (ctx, { id }) => {
		await requireAdmin(ctx);
		await publishArticle(ctx, id);
	},
});

export const unpublish = mutation({
	args: { id: v.id("articles") },
	handler: async (ctx, { id }) => {
		await requireAdmin(ctx);
		const doc = await getOrThrow(ctx, id);
		await cancelScheduledJob(ctx, doc);
		await ctx.db.patch(id, { status: "draft", live: undefined, publishAt: undefined });
		if (doc.live) await scheduleRevalidate(ctx, await liveTags(ctx, doc));
	},
});

export const schedule = mutation({
	args: { id: v.id("articles"), publishAt: v.number() },
	handler: async (ctx, { id, publishAt }) => {
		await requireAdmin(ctx);
		const doc = await getOrThrow(ctx, id);
		if (doc.live) throw new Error("This article is already live. Use Update to publish changes.");
		if (publishAt <= Date.now()) throw new Error("Pick a time in the future.");
		assertPublishable(doc);
		await cancelScheduledJob(ctx, doc);
		const scheduledJobId = await ctx.scheduler.runAt(publishAt, internal.articles.publishScheduled, {
			id,
		});
		await ctx.db.patch(id, { status: "scheduled", publishAt, scheduledJobId, publishError: undefined });
	},
});

export const unschedule = mutation({
	args: { id: v.id("articles") },
	handler: async (ctx, { id }) => {
		await requireAdmin(ctx);
		const doc = await getOrThrow(ctx, id);
		await cancelScheduledJob(ctx, doc);
		await ctx.db.patch(id, { status: "draft", publishAt: undefined });
	},
});

export const remove = mutation({
	args: { id: v.id("articles") },
	handler: async (ctx, { id }) => {
		await requireAdmin(ctx);
		const doc = await getOrThrow(ctx, id);
		await cancelScheduledJob(ctx, doc);
		const tags = doc.live ? await liveTags(ctx, doc) : [];
		const redirects = await ctx.db
			.query("slugRedirects")
			.withIndex("by_article", (q) => q.eq("articleId", id))
			.collect();
		for (const redirect of redirects) await ctx.db.delete(redirect._id);
		const assets = await ctx.db
			.query("assets")
			.withIndex("by_article", (q) => q.eq("articleId", id))
			.collect();
		for (const asset of assets) {
			await ctx.storage.delete(asset.storageId);
			await ctx.db.delete(asset._id);
		}
		if (doc.ogImageStorageId) await ctx.storage.delete(doc.ogImageStorageId);
		await ctx.db.delete(id);
		if (tags.length) await scheduleRevalidate(ctx, tags);
	},
});

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

export const publishScheduled = internalMutation({
	args: { id: v.id("articles") },
	handler: async (ctx, { id }) => {
		const doc = await ctx.db.get(id);
		if (doc?.status !== "scheduled") return; // unscheduled or already published meanwhile
		try {
			await publishArticle(ctx, id);
		} catch (error) {
			// e.g. the description was cleared after scheduling. publishArticle validates before
			// writing, so nothing was half-applied; surface the reason in the dashboard instead.
			await ctx.db.patch(id, {
				status: "draft",
				publishAt: undefined,
				scheduledJobId: undefined,
				publishError: error instanceof Error ? error.message : String(error),
			});
		}
	},
});

/** Safety net in case a scheduled job was lost: publishes anything overdue. */
export const sweepOverdue = internalMutation({
	args: {},
	handler: async (ctx) => {
		const overdue = await ctx.db
			.query("articles")
			.withIndex("by_status_publishAt", (q) =>
				q.eq("status", "scheduled").lte("publishAt", Date.now()),
			)
			.collect();
		// Separate jobs, so one failing article can't block the others.
		for (const doc of overdue) {
			await ctx.scheduler.runAfter(0, internal.articles.publishScheduled, { id: doc._id });
		}
	},
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function publishArticle(ctx: MutationCtx, id: Id<"articles">) {
	const doc = await getOrThrow(ctx, id);
	assertPublishable(doc);
	await assertSlugAvailable(ctx, doc.slug, id);

	const now = Date.now();
	const previous = doc.live;
	const publishedAt = doc.publishedAt ?? previous?.publishedAt ?? doc.publishAt ?? now;
	const live: LiveArticle = {
		slug: doc.slug,
		title: doc.title,
		description: doc.description,
		body: doc.body,
		seoTitle: doc.seoTitle,
		keywords: doc.keywords,
		canonicalUrl: doc.canonicalUrl,
		ogImageUrl: doc.ogImageUrl,
		author: doc.author,
		publishedAt,
		modifiedAt: previous ? now : undefined,
	};

	await cancelScheduledJob(ctx, doc);
	await ctx.db.patch(id, {
		status: "published",
		live,
		publishedAt,
		modifiedAt: live.modifiedAt,
		publishAt: undefined,
		publishError: undefined,
	});

	// The new slug may have been an old redirect; the article now owns it.
	const claimed = await ctx.db
		.query("slugRedirects")
		.withIndex("by_from", (q) => q.eq("from", doc.slug))
		.unique();
	if (claimed) await ctx.db.delete(claimed._id);

	if (previous && previous.slug !== doc.slug) {
		await ctx.db.insert("slugRedirects", { from: previous.slug, articleId: id });
	}
	// Includes every older slug, so earlier redirects point straight at the new URL.
	await scheduleRevalidate(ctx, await liveTags(ctx, { ...doc, live }));
}

/** The article's own tags plus every old slug that redirects to it (those pages are cached too). */
async function liveTags(ctx: MutationCtx, doc: Doc<"articles">) {
	const redirects = await ctx.db
		.query("slugRedirects")
		.withIndex("by_article", (q) => q.eq("articleId", doc._id))
		.collect();
	return [...articleTags(doc.live?.slug ?? doc.slug), ...redirects.map((r) => `article:${r.from}`)];
}

function assertPublishable(doc: Doc<"articles">) {
	const missing = [
		!doc.title.trim() && "title",
		!doc.description.trim() && "description",
		!doc.body.trim() && "body",
	].filter(Boolean);
	if (missing.length) throw new Error(`Add a ${missing.join(", ")} before publishing.`);
}

async function assertSlugAvailable(ctx: MutationCtx, slug: string, id: Id<"articles">) {
	const problem = await slugProblem(ctx, slug, id);
	if (problem) throw new Error(problem);
}

/** Why `slug` can't be used by article `id`, or null if it's fine. */
async function slugProblem(ctx: MutationCtx, slug: string, id: Id<"articles">) {
	if (!SLUG_PATTERN.test(slug)) {
		return "Slugs can only contain lowercase letters, numbers, and single dashes.";
	}
	const [working, live, redirect] = await Promise.all([
		ctx.db
			.query("articles")
			.withIndex("by_slug", (q) => q.eq("slug", slug))
			.collect(),
		ctx.db
			.query("articles")
			.withIndex("by_live_slug", (q) => q.eq("live.slug", slug))
			.collect(),
		ctx.db
			.query("slugRedirects")
			.withIndex("by_from", (q) => q.eq("from", slug))
			.unique(),
	]);
	const takenByOther = [...working, ...live].some((doc) => doc._id !== id);
	if (takenByOther || (redirect && redirect.articleId !== id)) {
		return `The slug "${slug}" is already used by another article.`;
	}
	return null;
}

async function uniqueSlug(ctx: MutationCtx, base: string) {
	for (let n = 1; ; n++) {
		const candidate = n === 1 ? base : `${base}-${n}`;
		const existing = await ctx.db
			.query("articles")
			.withIndex("by_slug", (q) => q.eq("slug", candidate))
			.first();
		if (!existing) return candidate;
	}
}

async function cancelScheduledJob(ctx: MutationCtx, doc: Doc<"articles">) {
	if (!doc.scheduledJobId) return;
	const job = await ctx.db.system.get(doc.scheduledJobId);
	if (job?.state.kind === "pending") await ctx.scheduler.cancel(doc.scheduledJobId);
	await ctx.db.patch(doc._id, { scheduledJobId: undefined });
}

async function getOrThrow(ctx: MutationCtx, id: Id<"articles">) {
	const doc = await ctx.db.get(id);
	if (!doc) throw new Error("Article not found");
	return doc;
}

/**
 * Work in progress first (drafts by last edit, scheduled by go-live time), then published
 * articles by publish date, newest first.
 */
function compareForDashboard(
	a: { status: Doc<"articles">["status"]; updatedAt: number; publishedAt?: number; publishAt?: number },
	b: typeof a,
) {
	const rank = { draft: 0, scheduled: 1, published: 2 } as const;
	if (a.status !== b.status) return rank[a.status] - rank[b.status];
	if (a.status === "draft") return b.updatedAt - a.updatedAt;
	if (a.status === "scheduled") return (a.publishAt ?? 0) - (b.publishAt ?? 0);
	return (b.publishedAt ?? 0) - (a.publishedAt ?? 0);
}

const CONTENT_KEYS = [
	"slug",
	"title",
	"description",
	"body",
	"seoTitle",
	"canonicalUrl",
	"ogImageUrl",
	"author",
	"publishedAt",
] as const;

function hasUnpublishedChanges(doc: Doc<"articles">) {
	if (!doc.live) return false;
	const live = doc.live;
	return (
		CONTENT_KEYS.some((key) => doc[key] !== live[key]) ||
		doc.keywords.join("\n") !== live.keywords.join("\n")
	);
}
