import { Node, mergeAttributes, parseAttributes, type MarkdownTokenizer } from "@tiptap/core";
import { toCalloutType } from "@/lib/markdown/remark-custom-blocks";
import { isYouTubeId } from "@/lib/markdown/youtube";

/**
 * Editor nodes for the site's two Markdown directives. They read and write exactly the syntax
 * remark-directive understands on the public site:
 *   :::callout{type="note"}      ::youtube{id="VIDEO_ID"}
 *   …content…
 *   :::
 * Node views (the in-editor UI) are attached separately in components/admin/editor.
 */

const calloutTokenizer: MarkdownTokenizer = {
	name: "callout",
	level: "block",
	start: (src) => src.match(/^:::callout\b/m)?.index ?? -1,
	tokenize(src, _tokens, lexer) {
		const open = src.match(/^:::callout(?:\{([^}\n]*)\})?[ \t]*\n/);
		if (!open) return undefined;
		const rest = src.slice(open[0].length);
		const close = rest.match(/^:::[ \t]*(?:\n|$)/m);
		if (!close || close.index === undefined) return undefined;
		const inner = rest.slice(0, close.index);
		return {
			type: "callout",
			raw: src.slice(0, open[0].length + close.index + close[0].length),
			attributes: parseAttributes(open[1] ?? ""),
			tokens: lexer.blockTokens(inner),
		};
	},
};

export const Callout = Node.create({
	name: "callout",
	group: "block",
	content: "block+",
	defining: true,

	addAttributes() {
		return {
			type: {
				default: "note",
				parseHTML: (el) => toCalloutType(el.getAttribute("data-type")),
				renderHTML: (attrs) => ({ "data-type": attrs.type }),
			},
		};
	},

	parseHTML() {
		return [{ tag: "aside[data-callout]" }];
	},

	renderHTML({ HTMLAttributes }) {
		return ["aside", mergeAttributes(HTMLAttributes, { "data-callout": "" }), 0];
	},

	markdownTokenName: "callout",
	markdownTokenizer: calloutTokenizer,
	parseMarkdown: (token, h) =>
		h.createNode(
			"callout",
			{ type: toCalloutType(token.attributes?.type) },
			h.parseChildren(token.tokens ?? []),
		),
	renderMarkdown: (node, h) =>
		`:::callout{type="${toCalloutType(node.attrs?.type)}"}\n${h.renderChildren(node.content ?? [], "\n\n")}\n:::`,
});

const youtubeTokenizer: MarkdownTokenizer = {
	name: "youtube",
	level: "block",
	start: (src) => src.match(/^::youtube\{/m)?.index ?? -1,
	tokenize(src) {
		const match = src.match(/^::youtube\{([^}\n]*)\}[ \t]*(?:\n|$)/);
		if (!match) return undefined;
		const { id } = parseAttributes(match[1]);
		if (!isYouTubeId(id)) return undefined;
		return { type: "youtube", raw: match[0], attributes: { id } };
	},
};

export const YouTube = Node.create({
	name: "youtube",
	group: "block",
	atom: true,
	draggable: true,

	addAttributes() {
		return { id: { default: null } };
	},

	parseHTML() {
		return [{ tag: "div[data-youtube]", getAttrs: (el) => ({ id: el.getAttribute("data-youtube") }) }];
	},

	renderHTML({ node }) {
		return [
			"div",
			{ "data-youtube": node.attrs.id, class: "editor-youtube" },
			[
				"iframe",
				{
					src: `https://www.youtube-nocookie.com/embed/${node.attrs.id}`,
					frameborder: "0",
					allowfullscreen: "true",
				},
			],
		];
	},

	markdownTokenName: "youtube",
	markdownTokenizer: youtubeTokenizer,
	parseMarkdown: (token, h) => h.createNode("youtube", { id: token.attributes?.id }),
	renderMarkdown: (node) => `::youtube{id="${node.attrs?.id}"}`,
});
