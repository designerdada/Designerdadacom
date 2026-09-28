"use client";

import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";

const extensions = [markdown(), EditorView.lineWrapping];

/** Raw Markdown source editing (the stored format), with the same directives as the visual mode. */
export function MarkdownEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
	const { resolvedTheme } = useTheme();
	return (
		<CodeMirror
			value={value}
			onChange={onChange}
			extensions={extensions}
			theme={resolvedTheme === "dark" ? "dark" : "light"}
			basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false }}
			className='editor-markdown'
			placeholder='Write Markdown…'
			autoFocus
		/>
	);
}
