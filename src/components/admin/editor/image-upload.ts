import { Extension, type Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface ImageUploadOptions {
	upload: (file: File) => Promise<string>;
	onError: (message: string) => void;
}

declare module "@tiptap/core" {
	interface Storage {
		imageUpload: ImageUploadOptions;
	}
}

const imageFiles = (files: FileList | null | undefined) =>
	Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));

/** Uploads images that are pasted, dropped, or picked, and inserts them as image nodes. */
export const ImageUpload = Extension.create<ImageUploadOptions>({
	name: "imageUpload",

	addOptions() {
		return {
			upload: async () => {
				throw new Error("No upload handler configured");
			},
			onError: (message) => console.error(message),
		};
	},

	addStorage() {
		return { upload: this.options.upload, onError: this.options.onError };
	},

	addProseMirrorPlugins() {
		const editor = this.editor;
		return [
			new Plugin({
				key: new PluginKey("imageUpload"),
				props: {
					handlePaste(_view, event) {
						const files = imageFiles(event.clipboardData?.files);
						if (files.length === 0) return false;
						event.preventDefault();
						files.forEach((file) => void insertImageFile(editor, file));
						return true;
					},
					handleDrop(view, event) {
						const files = imageFiles(event.dataTransfer?.files);
						if (files.length === 0) return false;
						event.preventDefault();
						const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
						files.forEach((file) => void insertImageFile(editor, file, pos));
						return true;
					},
				},
			}),
		];
	},
});

export async function insertImageFile(editor: Editor, file: File, pos?: number) {
	const { upload, onError } = editor.storage.imageUpload;
	try {
		const src = await upload(file);
		const node = { type: "image", attrs: { src, alt: file.name.replace(/\.[^.]+$/, "") } };
		if (pos === undefined) editor.chain().focus().insertContent(node).run();
		else editor.chain().focus().insertContentAt(pos, node).run();
	} catch (error) {
		onError(error instanceof Error ? error.message : "Image upload failed");
	}
}

export function pickAndInsertImage(editor: Editor) {
	const input = document.createElement("input");
	input.type = "file";
	input.accept = "image/*";
	input.onchange = () => {
		const file = input.files?.[0];
		if (file) void insertImageFile(editor, file);
	};
	input.click();
}
