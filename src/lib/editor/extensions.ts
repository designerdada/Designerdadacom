import type { Extensions } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import { Callout, YouTube } from "./directives";

/**
 * Everything the visual editor can represent. Only constructs the public renderer supports are
 * enabled (no underline, no h4+), so what you see in the editor is what gets published.
 */
export function createEditorExtensions({ placeholder }: { placeholder?: string } = {}): Extensions {
	return [
		StarterKit.configure({
			heading: { levels: [1, 2, 3] },
			underline: false,
			link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
		}),
		Image.configure({ inline: false }),
		TableKit.configure({ table: { resizable: false } }),
		Callout,
		YouTube,
		Markdown.configure({ indentation: { style: "space", size: 2 } }),
		...(placeholder ? [Placeholder.configure({ placeholder })] : []),
	];
}
