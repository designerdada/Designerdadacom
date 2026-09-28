import { getCanonicalUrl, siteConfig } from "@/config/site";
import { getPublishedArticlesWithBody } from "@/lib/content/articles";
import { formatDisplayDate } from "@/lib/dates";

/** Full-text dump of the site for AI crawlers (https://llmstxt.org). */
export async function GET() {
	const articles = await getPublishedArticlesWithBody();
	const { url, name, author, social } = siteConfig;

	const sections = [
		`# ${name}\n\n${author.shortBio}\n\n> ${url}`,
		`## About\n\nI'm ${author.name} (${author.handle}), ${author.bio}\n\nI write about design, building products, and the startup journey. When not designing, I shoot street photography on film.`,
		`## Navigation\n\n- Home: ${url}\n- Writing: ${url}/writing\n- Favorites: ${url}/favorites\n- Photography: ${url}/photography\n- RSS: ${url}/rss.xml`,
		`## Articles`,
		...articles.map((article) =>
			[
				`### ${article.title}`,
				"",
				`URL: ${getCanonicalUrl(`/writing/${article.slug}`)}`,
				`Published: ${formatDisplayDate(article.publishedAt)}`,
				`Description: ${article.description}`,
				"",
				article.body.trim(),
			].join("\n"),
		),
		`## Contact\n\n- Email: ${author.email}\n- X: ${social.twitter}\n- Peerlist: ${social.peerlist}\n- Instagram: ${social.instagram}`,
	];

	return new Response(sections.join("\n\n---\n\n") + "\n", {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
