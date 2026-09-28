import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/config/site";
import { getPublishedArticles } from "@/lib/content/articles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const articles = await getPublishedArticles();
	const latest = articles[0] ? new Date(articles[0].modifiedAt ?? articles[0].publishedAt) : undefined;

	return [
		{ url: getCanonicalUrl("/"), changeFrequency: "weekly", priority: 1, lastModified: latest },
		{ url: getCanonicalUrl("/writing"), changeFrequency: "weekly", priority: 0.9, lastModified: latest },
		{ url: getCanonicalUrl("/favorites"), changeFrequency: "monthly", priority: 0.7 },
		{ url: getCanonicalUrl("/photography"), changeFrequency: "monthly", priority: 0.7 },
		...articles.map((article) => ({
			url: getCanonicalUrl(`/writing/${article.slug}`),
			lastModified: new Date(article.modifiedAt ?? article.publishedAt),
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
	];
}
