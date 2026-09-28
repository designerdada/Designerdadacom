import type { Editor, Range } from "@tiptap/core";
import {
	Code,
	Heading1,
	Heading2,
	Heading3,
	ImageIcon,
	Info,
	List,
	ListOrdered,
	Minus,
	Quote,
	Table,
	Youtube,
	type LucideIcon,
} from "lucide-react";
import { parseYouTubeId } from "@/lib/markdown/youtube";
import { pickAndInsertImage } from "./image-upload";

export interface SlashItem {
	title: string;
	description: string;
	icon: LucideIcon;
	keywords: string[];
	run: (editor: Editor, range: Range) => void;
}

const focus = (editor: Editor, range: Range) => editor.chain().focus().deleteRange(range);

export const SLASH_ITEMS: SlashItem[] = [
	{
		title: "Heading 1",
		description: "Large section heading",
		icon: Heading1,
		keywords: ["h1", "title"],
		run: (e, r) => focus(e, r).setNode("heading", { level: 1 }).run(),
	},
	{
		title: "Heading 2",
		description: "Section heading",
		icon: Heading2,
		keywords: ["h2", "section"],
		run: (e, r) => focus(e, r).setNode("heading", { level: 2 }).run(),
	},
	{
		title: "Heading 3",
		description: "Subsection heading",
		icon: Heading3,
		keywords: ["h3", "subsection"],
		run: (e, r) => focus(e, r).setNode("heading", { level: 3 }).run(),
	},
	{
		title: "Bullet list",
		description: "Unordered list",
		icon: List,
		keywords: ["ul", "unordered", "bullets"],
		run: (e, r) => focus(e, r).toggleBulletList().run(),
	},
	{
		title: "Numbered list",
		description: "Ordered list",
		icon: ListOrdered,
		keywords: ["ol", "ordered", "numbers"],
		run: (e, r) => focus(e, r).toggleOrderedList().run(),
	},
	{
		title: "Quote",
		description: "Blockquote",
		icon: Quote,
		keywords: ["blockquote", "citation"],
		run: (e, r) => focus(e, r).toggleBlockquote().run(),
	},
	{
		title: "Callout",
		description: "Highlighted note, tip, or warning",
		icon: Info,
		keywords: ["note", "tip", "warning", "aside", "admonition"],
		run: (e, r) => focus(e, r).wrapIn("callout", { type: "note" }).run(),
	},
	{
		title: "Table",
		description: "3 × 3 table with a header row",
		icon: Table,
		keywords: ["grid", "columns"],
		run: (e, r) => focus(e, r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
	},
	{
		title: "Image",
		description: "Upload an image (add a caption below it)",
		icon: ImageIcon,
		keywords: ["photo", "picture", "upload", "figure", "caption"],
		run: (e, r) => {
			focus(e, r).run();
			pickAndInsertImage(e);
		},
	},
	{
		title: "YouTube",
		description: "Embed a video by URL",
		icon: Youtube,
		keywords: ["video", "embed"],
		run: (e, r) => {
			const input = window.prompt("YouTube URL or video ID");
			const id = input ? parseYouTubeId(input) : null;
			if (input && !id) window.alert("That doesn't look like a YouTube link.");
			const chain = focus(e, r);
			if (id) chain.insertContent({ type: "youtube", attrs: { id } });
			chain.run();
		},
	},
	{
		title: "Code block",
		description: "Monospaced code",
		icon: Code,
		keywords: ["code", "snippet", "pre"],
		run: (e, r) => focus(e, r).toggleCodeBlock().run(),
	},
	{
		title: "Divider",
		description: "Horizontal rule",
		icon: Minus,
		keywords: ["hr", "separator", "line", "rule"],
		run: (e, r) => focus(e, r).setHorizontalRule().run(),
	},
];

export function filterSlashItems(query: string): SlashItem[] {
	const q = query.toLowerCase().trim();
	if (!q) return SLASH_ITEMS;
	return SLASH_ITEMS.filter(
		(item) => item.title.toLowerCase().includes(q) || item.keywords.some((k) => k.startsWith(q)),
	);
}
