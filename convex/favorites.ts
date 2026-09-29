import { ConvexError, v, type Infer } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
	action,
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
	type MutationCtx,
} from "./_generated/server";
import { requireAdmin } from "./lib/admin";
import { findPreviewImage, inspectLink } from "./lib/linkPreview";
import { FAVORITES_TAG, scheduleRevalidate } from "./lib/revalidate";
import { favoriteFields } from "./schema";

const favoriteInput = v.object(favoriteFields);

type FavoriteInput = Infer<typeof favoriteInput>;

function assertHttpUrl(url: string) {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new ConvexError("Enter a full URL, starting with https://");
	}
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
		throw new ConvexError("Only http and https links are allowed.");
	}
}

/** Trims text, checks the URL, and turns an empty preview into "none". */
function clean(input: FavoriteInput): FavoriteInput {
	const name = input.name.trim();
	const url = input.url.trim();
	if (!name) throw new ConvexError("Add a name.");
	assertHttpUrl(url);
	return {
		...input,
		name,
		url,
		description: input.description.trim(),
		previewImageUrl: input.previewImageUrl?.trim() || undefined,
	};
}

async function assertUniqueUrl(ctx: MutationCtx, url: string, except?: Id<"favorites">) {
	const existing = await ctx.db
		.query("favorites")
		.withIndex("by_url", (q) => q.eq("url", url))
		.first();
	if (existing && existing._id !== except) throw new ConvexError(`"${existing.name}" already uses this link.`);
}

async function schedulePreviewFetch(ctx: MutationCtx, id: Id<"favorites">) {
	await ctx.scheduler.runAfter(0, internal.favorites.fetchPreview, { id });
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export const list = query({
	args: {},
	handler: async (ctx) => {
		const docs = await ctx.db.query("favorites").collect();
		return docs
			.map(({ _id, _creationTime, name, description, url, category, nofollow, previewImageUrl }) => ({
				_id,
				_creationTime,
				name,
				description,
				url,
				category,
				nofollow,
				previewImageUrl,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	},
});

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const create = mutation({
	args: { favorite: favoriteInput },
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const favorite = clean(args.favorite);
		await assertUniqueUrl(ctx, favorite.url);
		const now = Date.now();
		const id = await ctx.db.insert("favorites", { ...favorite, createdAt: now, updatedAt: now });
		if (!favorite.previewImageUrl) await schedulePreviewFetch(ctx, id);
		await scheduleRevalidate(ctx, [FAVORITES_TAG]);
		return id;
	},
});

export const update = mutation({
	args: { id: v.id("favorites"), favorite: favoriteInput },
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const doc = await ctx.db.get(args.id);
		if (!doc) throw new Error("Favorite not found");
		const favorite = clean(args.favorite);
		await assertUniqueUrl(ctx, favorite.url, args.id);
		// A new link needs a new preview, unless one was set by hand in the same edit.
		const refetch = favorite.url !== doc.url && favorite.previewImageUrl === doc.previewImageUrl;
		if (refetch) favorite.previewImageUrl = undefined;
		await ctx.db.patch(args.id, { ...favorite, updatedAt: Date.now() });
		if (refetch) await schedulePreviewFetch(ctx, args.id);
		await scheduleRevalidate(ctx, [FAVORITES_TAG]);
	},
});

export const remove = mutation({
	args: { id: v.id("favorites") },
	handler: async (ctx, { id }) => {
		await requireAdmin(ctx);
		await ctx.db.delete(id);
		await scheduleRevalidate(ctx, [FAVORITES_TAG]);
	},
});

/** Looks up the link's Open Graph image again, replacing the current preview. */
export const refreshPreview = mutation({
	args: { id: v.id("favorites") },
	handler: async (ctx, { id }) => {
		await requireAdmin(ctx);
		await schedulePreviewFetch(ctx, id);
	},
});

/** Fetches a pasted link's name and preview image for the admin form. Nothing is saved. */
export const inspect = action({
	args: { url: v.string() },
	handler: async (ctx, { url }) => {
		await ctx.runQuery(internal.favorites.assertAdmin, {});
		assertHttpUrl(url.trim());
		return inspectLink(url.trim());
	},
});

/** Actions can't read the database, so they check access through this query (it runs as the caller). */
export const assertAdmin = internalQuery({
	args: {},
	handler: async (ctx) => {
		await requireAdmin(ctx);
	},
});

// ---------------------------------------------------------------------------
// Preview images
// ---------------------------------------------------------------------------

export const fetchPreview = internalAction({
	args: { id: v.id("favorites") },
	handler: async (ctx, { id }) => {
		const doc = await ctx.runQuery(internal.favorites.getForPreview, { id });
		if (!doc) return;
		const image = await findPreviewImage(doc.url);
		// A failed lookup (site down, timeout) keeps whatever preview is there now.
		if (!image) return;
		await ctx.runMutation(internal.favorites.setPreview, {
			id,
			url: doc.url,
			previous: doc.previewImageUrl,
			image,
		});
	},
});

export const getForPreview = internalQuery({
	args: { id: v.id("favorites") },
	handler: async (ctx, { id }) => {
		const doc = await ctx.db.get(id);
		return doc && { url: doc.url, previewImageUrl: doc.previewImageUrl };
	},
});

export const setPreview = internalMutation({
	args: { id: v.id("favorites"), url: v.string(), previous: v.optional(v.string()), image: v.string() },
	handler: async (ctx, { id, url, previous, image }) => {
		const doc = await ctx.db.get(id);
		// Skip if the link was deleted, its URL changed, or a preview was set by hand while we were
		// fetching: an edit made in the meantime always wins over the lookup.
		if (!doc || doc.url !== url || doc.previewImageUrl !== previous || previous === image) return;
		await ctx.db.patch(id, { previewImageUrl: image });
		await scheduleRevalidate(ctx, [FAVORITES_TAG]);
	},
});

/**
 * One-off import of the old hard-coded list (src/scripts/import-favorites.js). Links that already
 * exist are skipped, so it is safe to run again.
 */
export const importMany = internalMutation({
	args: { favorites: v.array(favoriteInput) },
	handler: async (ctx, args) => {
		let added = 0;
		for (const input of args.favorites) {
			const favorite = clean(input);
			const existing = await ctx.db
				.query("favorites")
				.withIndex("by_url", (q) => q.eq("url", favorite.url))
				.first();
			if (existing) continue;
			const now = Date.now();
			const id = await ctx.db.insert("favorites", { ...favorite, createdAt: now, updatedAt: now });
			if (!favorite.previewImageUrl) await schedulePreviewFetch(ctx, id);
			added++;
		}
		if (added) await scheduleRevalidate(ctx, [FAVORITES_TAG]);
		return { added, skipped: args.favorites.length - added };
	},
});
