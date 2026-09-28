import { getCanonicalUrl, siteConfig } from "@/config/site";
import { getPublishedArticlesWithBody } from "@/lib/content/articles";
import { markdownToHtml } from "@/lib/markdown/to-html";

export async function GET() {
	const articles = await getPublishedArticlesWithBody();
	const feedUrl = getCanonicalUrl("/rss.xml");

	const items = articles
		.map((article) => {
			const url = getCanonicalUrl(`/writing/${article.slug}`);
			return `
		<item>
			<title>${escapeXml(article.title)}</title>
			<link>${url}</link>
			<guid isPermaLink="true">${url}</guid>
			<description>${escapeXml(article.description)}</description>
			<pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
			<dc:creator>${escapeXml(article.author)}</dc:creator>
			${article.keywords.map((k) => `<category>${escapeXml(k)}</category>`).join("")}
			<content:encoded><![CDATA[${cdata(markdownToHtml(article.body))}]]></content:encoded>
		</item>`;
		})
		.join("");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
	<channel>
		<title>${escapeXml(`${siteConfig.author.name} - Writing`)}</title>
		<link>${getCanonicalUrl("/writing")}</link>
		<description>${escapeXml("Raw thoughts on design, building products, and the startup journey.")}</description>
		<language>en-us</language>
		<atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
		${articles[0] ? `<lastBuildDate>${new Date(articles[0].modifiedAt ?? articles[0].publishedAt).toUTCString()}</lastBuildDate>` : ""}${items}
	</channel>
</rss>`;

	return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

function escapeXml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

/** A literal `]]>` would end the CDATA section early. */
function cdata(value: string) {
	return value.replace(/]]>/g, "]]]]><![CDATA[>");
}
