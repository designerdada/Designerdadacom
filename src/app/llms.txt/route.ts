import { getCanonicalUrl, siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/lib/content/articles";

/** Index for AI crawlers (https://llmstxt.org); the full text lives in /llms-full.txt. */
export async function GET() {
	const articles = await getPublishedArticles();
	const { url, author } = siteConfig;

	const sections = [
		`# ${author.name} (${author.handle})`,
		`> ${author.bio}`,
		`Essays on design, building products, and the startup journey. Every article, in full, as Markdown: ${getCanonicalUrl("/llms-full.txt")}`,
		[
			"## Writing",
			"",
			...articles.map(
				(article) =>
					`- [${article.title}](${getCanonicalUrl(`/writing/${article.slug}`)}): ${article.description}`,
			),
		].join("\n"),
		[
			"## Pages",
			"",
			`- [Home](${url}): About ${author.name}`,
			`- [Favorites](${getCanonicalUrl("/favorites")}): Products, people, and websites I admire`,
			`- [Photography](${getCanonicalUrl("/photography")}): Street photography shot on film`,
			`- [RSS](${getCanonicalUrl("/rss.xml")}): Feed of all articles`,
		].join("\n"),
	];

	return new Response(sections.join("\n\n") + "\n", {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
