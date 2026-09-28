import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import { getCanonicalUrl, getImageUrl, siteConfig } from "@/config/site";
import { ogImageVersion } from "@/lib/og/version";

/**
 * The only module public pages use to read articles. Everything is cached indefinitely and
 * invalidated by tag when Convex publishes a change (see convex/lib/revalidate.ts).
 */

export async function getPublishedArticles() {
	"use cache";
	cacheLife("max");
	cacheTag("articles");
	return fetchQuery(api.articles.listPublished, {});
}

export async function getPublishedArticlesWithBody() {
	"use cache";
	cacheLife("max");
	cacheTag("articles");
	return fetchQuery(api.articles.listPublished, { withBody: true });
}

export async function getArticleBySlug(slug: string) {
	"use cache";
	cacheLife("max");
	cacheTag(`article:${slug}`);
	return fetchQuery(api.articles.getPublishedBySlug, { slug });
}

/**
 * Params for the article routes. Cache Components rejects an empty list at build time, so a
 * brand-new site with nothing published gets a placeholder that simply renders a 404.
 */
export async function publishedSlugParams() {
	const slugs = (await getPublishedArticles()).map(({ slug }) => ({ slug }));
	return slugs.length ? slugs : [{ slug: "no-articles-yet" }];
}

export type PublishedArticle = Awaited<ReturnType<typeof getPublishedArticles>>[number];

export function articleUrl(article: Pick<PublishedArticle, "slug" | "canonicalUrl">) {
	return article.canonicalUrl || getCanonicalUrl(`/writing/${article.slug}`);
}

/** Uploaded image if there is one, otherwise the generated card (versioned by its text). */
export function articleOgImage(
	article: Pick<PublishedArticle, "slug" | "ogImageUrl" | "title" | "description">,
) {
	if (article.ogImageUrl) return getImageUrl(article.ogImageUrl);
	return `${siteConfig.url}/og/${article.slug}?v=${ogImageVersion(article)}`;
}
