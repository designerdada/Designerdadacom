import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const articleStatus = v.union(
	v.literal("draft"),
	v.literal("scheduled"),
	v.literal("published"),
);

/** Fields shared by the editable working copy and the published `live` snapshot. */
export const articleContentFields = {
	slug: v.string(),
	title: v.string(),
	description: v.string(),
	body: v.string(), // Markdown, the single source of truth
	seoTitle: v.optional(v.string()),
	keywords: v.array(v.string()),
	canonicalUrl: v.optional(v.string()),
	ogImageUrl: v.optional(v.string()), // uploaded (Convex storage URL) or legacy absolute URL
	author: v.string(),
};

export default defineSchema({
	...authTables,

	articles: defineTable({
		...articleContentFields,
		status: articleStatus,
		ogImageStorageId: v.optional(v.id("_storage")),
		publishedAt: v.optional(v.number()), // public "publish date", editable
		modifiedAt: v.optional(v.number()), // last time an update went live
		publishAt: v.optional(v.number()), // scheduled go-live time
		scheduledJobId: v.optional(v.id("_scheduled_functions")),
		publishError: v.optional(v.string()), // why the last scheduled publish failed
		updatedAt: v.number(), // last autosave of the working copy
		// What the public site reads. Autosaving the working copy never touches this.
		live: v.optional(
			v.object({
				...articleContentFields,
				publishedAt: v.number(),
				modifiedAt: v.optional(v.number()),
			}),
		),
	})
		.index("by_slug", ["slug"])
		.index("by_live_slug", ["live.slug"])
		.index("by_live_publishedAt", ["live.publishedAt"])
		.index("by_status_publishAt", ["status", "publishAt"]),

	// Old public slugs that should 308 to an article's current slug.
	slugRedirects: defineTable({
		from: v.string(),
		articleId: v.id("articles"),
	})
		.index("by_from", ["from"])
		.index("by_article", ["articleId"]),

	assets: defineTable({
		storageId: v.id("_storage"),
		url: v.string(),
		articleId: v.optional(v.id("articles")),
		contentType: v.optional(v.string()),
		createdAt: v.number(),
	}).index("by_article", ["articleId"]),
});
