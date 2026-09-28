import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./lib/admin";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		await requireAdmin(ctx);
		return ctx.storage.generateUploadUrl();
	},
});

/** Registers an uploaded image and returns its public URL. Rejects anything that isn't an image. */
export const saveImage = mutation({
	args: { storageId: v.id("_storage"), articleId: v.optional(v.id("articles")) },
	handler: async (ctx, { storageId, articleId }) => {
		await requireAdmin(ctx);
		const file = await ctx.db.system.get(storageId);
		if (!file?.contentType?.startsWith("image/") || file.size > MAX_IMAGE_BYTES) {
			await ctx.storage.delete(storageId);
			throw new Error("Upload an image up to 10 MB.");
		}
		const url = await ctx.storage.getUrl(storageId);
		if (!url) throw new Error("Upload failed");
		await ctx.db.insert("assets", {
			storageId,
			url,
			articleId,
			contentType: file.contentType,
			createdAt: Date.now(),
		});
		return url;
	},
});

/** Sets (or clears, with `null`) an article's uploaded Open Graph image. */
export const setOgImage = mutation({
	args: { articleId: v.id("articles"), storageId: v.union(v.id("_storage"), v.null()) },
	handler: async (ctx, { articleId, storageId }) => {
		await requireAdmin(ctx);
		const article = await ctx.db.get(articleId);
		if (!article) throw new Error("Article not found");
		// The published copy keeps pointing at the old image until the next publish, so only
		// delete it once nothing live uses it.
		const previous = article.ogImageStorageId;
		const previousUrl = article.ogImageUrl;
		if (previous && previous !== storageId && article.live?.ogImageUrl !== previousUrl) {
			await ctx.storage.delete(previous);
		}
		const url = storageId ? await ctx.storage.getUrl(storageId) : null;
		await ctx.db.patch(articleId, {
			ogImageStorageId: storageId ?? undefined,
			ogImageUrl: url ?? undefined,
			updatedAt: Date.now(),
		});
	},
});
