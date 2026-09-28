import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";
import { rehypePlugins, remarkPlugins } from "./plugins";

/** Plain HTML for feeds: custom elements become portable HTML (a link for videos, a blockquote for callouts). */
function rehypePortableBlocks() {
	return (tree: Root) => {
		visit(tree, "element", (node: Element) => {
			if (node.tagName === "youtube") {
				const url = `https://www.youtube.com/watch?v=${node.properties.video}`;
				node.tagName = "p";
				node.properties = {};
				node.children = [
					{ type: "element", tagName: "a", properties: { href: url }, children: [{ type: "text", value: url }] },
				];
			} else if (node.tagName === "callout") {
				node.tagName = "blockquote";
				node.properties = {};
			}
		});
	};
}

export function markdownToHtml(markdown: string): string {
	return String(
		unified()
			.use(remarkParse)
			.use(remarkPlugins)
			.use(remarkRehype)
			.use(rehypePlugins)
			.use(rehypePortableBlocks)
			.use(rehypeStringify)
			.processSync(markdown),
	);
}
