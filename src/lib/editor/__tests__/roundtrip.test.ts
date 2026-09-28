import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { markdownToHtml } from "@/lib/markdown/to-html";
import { createEditorExtensions } from "../extensions";

/** Markdown → visual editor → Markdown must render to the same HTML on the public site. */
function roundTrip(markdown: string) {
	const editor = new Editor({
		extensions: createEditorExtensions(),
		content: markdown,
		contentType: "markdown",
	});
	const output = editor.getMarkdown();
	editor.destroy();
	return output;
}

// Whitespace differences and mark nesting order (`**[x](y)**` vs `[**x**](y)`) look identical.
const normalize = (html: string) =>
	html
		.replace(/>\s+</g, "><")
		.replace(/\s+/g, " ")
		.replace(/<(strong|em)><a ([^>]*)>([^<]*)<\/a><\/\1>/g, "<a $2><$1>$3</$1></a>")
		.trim();

const fixtures: [string, string][] = [["fixture.md", readFileSync(path.join(import.meta.dirname, "fixture.md"), "utf8")]];

// Also exercise any real articles passed via ROUNDTRIP_DIR (e.g. an export of published posts).
const extraDir = process.env.ROUNDTRIP_DIR;
if (extraDir) {
	for (const file of readdirSync(extraDir).filter((f) => /\.mdx?$/.test(f))) {
		fixtures.push([file, readFileSync(path.join(extraDir, file), "utf8").replace(/^---[\s\S]*?---\n/, "")]);
	}
}

describe("markdown round trip", () => {
	it.each(fixtures)("%s renders identically after a round trip", (_name, markdown) => {
		const once = roundTrip(markdown);
		expect(normalize(markdownToHtml(once))).toBe(normalize(markdownToHtml(markdown)));
		// Serialising again must be stable, so autosave never produces spurious diffs.
		expect(roundTrip(once)).toBe(once);
	});
});
