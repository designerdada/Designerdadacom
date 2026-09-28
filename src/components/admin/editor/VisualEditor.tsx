"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Code, Italic, Link2, Strikethrough } from "lucide-react";
import { useRef } from "react";
import { createEditorExtensions } from "@/lib/editor/extensions";
import { ImageUpload } from "./image-upload";
import { CalloutWithView, ImageWithCaption } from "./node-views";
import { SlashCommand } from "./slash-command";

interface VisualEditorProps {
	markdown: string;
	onChange: (markdown: string) => void;
	onUploadImage: (file: File) => Promise<string>;
	onError: (message: string) => void;
}

/** Rich-text editing over the article's Markdown. Created once from `markdown`, then emits changes. */
export function VisualEditor({ markdown, onChange, onUploadImage, onError }: VisualEditorProps) {
	// Keep callbacks fresh without recreating the editor.
	const callbacks = useRef({ onChange, onUploadImage, onError });
	callbacks.current = { onChange, onUploadImage, onError };

	const editor = useEditor({
		immediatelyRender: false,
		content: markdown,
		contentType: "markdown",
		extensions: [
			...createEditorExtensions({ placeholder: "Write, or press “/” for blocks…" }).filter(
				(ext) => ext.name !== "callout" && ext.name !== "image",
			),
			CalloutWithView,
			ImageWithCaption,
			SlashCommand,
			ImageUpload.configure({
				upload: (file) => callbacks.current.onUploadImage(file),
				onError: (message) => callbacks.current.onError(message),
			}),
		],
		editorProps: { attributes: { class: "editor-content", spellcheck: "true" } },
		onUpdate: ({ editor }) => callbacks.current.onChange(editor.getMarkdown()),
	});

	if (!editor) return null;

	return (
		<>
			<TextBubbleMenu editor={editor} />
			<TableBubbleMenu editor={editor} />
			<EditorContent editor={editor} />
		</>
	);
}

const menuClass =
	"flex items-center gap-0.5 rounded-lg border border-olive-200 bg-olive-50 p-1 shadow-md dark:border-olive-700 dark:bg-olive-900";

function MenuButton({
	active,
	onClick,
	label,
	children,
}: {
	active?: boolean;
	onClick: () => void;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<button
			type='button'
			onMouseDown={(e) => e.preventDefault()}
			onClick={onClick}
			aria-label={label}
			title={label}
			className={`rounded px-2 py-1 text-xs ${
				active ? "bg-olive-200 dark:bg-olive-700" : "hover:bg-olive-100 dark:hover:bg-olive-800"
			}`}>
			{children}
		</button>
	);
}

function TextBubbleMenu({ editor }: { editor: Editor }) {
	const setLink = () => {
		const previous = editor.getAttributes("link").href as string | undefined;
		const url = window.prompt("Link URL (leave empty to remove)", previous ?? "https://");
		if (url === null) return;
		if (url.trim() === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
		else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
	};

	return (
		<BubbleMenu
			editor={editor}
			pluginKey='textMenu'
			shouldShow={({ editor, state }) =>
				!state.selection.empty &&
				!editor.isActive("codeBlock") &&
				!editor.isActive("image") &&
				!editor.isActive("youtube")
			}
			className={menuClass}>
			<MenuButton label='Bold' active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
				<Bold className='size-3.5' />
			</MenuButton>
			<MenuButton label='Italic' active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
				<Italic className='size-3.5' />
			</MenuButton>
			<MenuButton label='Strikethrough' active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
				<Strikethrough className='size-3.5' />
			</MenuButton>
			<MenuButton label='Inline code' active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
				<Code className='size-3.5' />
			</MenuButton>
			<MenuButton label='Link' active={editor.isActive("link")} onClick={setLink}>
				<Link2 className='size-3.5' />
			</MenuButton>
		</BubbleMenu>
	);
}

function TableBubbleMenu({ editor }: { editor: Editor }) {
	const run = (fn: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) =>
		fn(editor.chain().focus()).run();

	return (
		<BubbleMenu
			editor={editor}
			pluginKey='tableMenu'
			shouldShow={({ editor, state }) => state.selection.empty && editor.isActive("table")}
			options={{ placement: "top" }}
			className={menuClass}>
			<MenuButton label='Add row below' onClick={() => run((c) => c.addRowAfter())}>+ Row</MenuButton>
			<MenuButton label='Add column right' onClick={() => run((c) => c.addColumnAfter())}>+ Col</MenuButton>
			<MenuButton label='Delete row' onClick={() => run((c) => c.deleteRow())}>− Row</MenuButton>
			<MenuButton label='Delete column' onClick={() => run((c) => c.deleteColumn())}>− Col</MenuButton>
			<MenuButton label='Delete table' onClick={() => run((c) => c.deleteTable())}>Delete</MenuButton>
		</BubbleMenu>
	);
}
