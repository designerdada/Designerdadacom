import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import { filterSlashItems, type SlashItem } from "./slash-items";
import { SlashMenu, type SlashMenuHandle, type SlashMenuProps } from "./SlashMenu";

/** Type "/" at the start of a line (or after a space) to insert a block. */
export const SlashCommand = Extension.create({
	name: "slashCommand",

	addProseMirrorPlugins() {
		return [
			Suggestion<SlashItem, SlashItem>({
				editor: this.editor,
				char: "/",
				allowSpaces: false,
				items: ({ query }) => filterSlashItems(query),
				// Don't offer blocks inside code, where "/" is just a character.
				allow: ({ editor }) => !editor.isActive("codeBlock") && !editor.isActive("code"),
				command: ({ editor, range, props }) => props.run(editor, range),
				render: () => {
					let renderer: ReactRenderer<SlashMenuHandle, SlashMenuProps> | null = null;

					const place = (props: SuggestionProps<SlashItem, SlashItem>) => {
						const rect = props.clientRect?.();
						const el = renderer?.element as HTMLElement | undefined;
						if (!rect || !el) return;
						const below = rect.bottom + 6;
						const fitsBelow = below + el.offsetHeight < window.innerHeight;
						el.style.left = `${Math.min(rect.left, window.innerWidth - el.offsetWidth - 8)}px`;
						el.style.top = `${fitsBelow ? below : rect.top - el.offsetHeight - 6}px`;
					};

					return {
						onStart(props) {
							renderer = new ReactRenderer(SlashMenu, {
								props: { items: props.items, editor: props.editor, range: props.range },
								editor: props.editor,
							});
							const el = renderer.element as HTMLElement;
							el.style.position = "fixed";
							el.style.zIndex = "60";
							document.body.appendChild(el);
							requestAnimationFrame(() => place(props));
						},
						onUpdate(props) {
							renderer?.updateProps({ items: props.items, editor: props.editor, range: props.range });
							requestAnimationFrame(() => place(props));
						},
						onKeyDown({ event }) {
							if (event.key === "Escape") {
								renderer?.destroy();
								renderer?.element.remove();
								renderer = null;
								return true;
							}
							return renderer?.ref?.onKeyDown(event) ?? false;
						},
						onExit() {
							renderer?.destroy();
							renderer?.element.remove();
							renderer = null;
						},
					};
				},
			}),
		];
	},
});
