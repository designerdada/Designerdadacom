"use client";

import Image from "@tiptap/extension-image";
import {
	NodeViewContent,
	NodeViewWrapper,
	ReactNodeViewRenderer,
	type NodeViewProps,
} from "@tiptap/react";
import { Callout } from "@/lib/editor/directives";
import { CALLOUT_TYPES } from "@/lib/markdown/remark-custom-blocks";

function CalloutView({ node, updateAttributes }: NodeViewProps) {
	return (
		<NodeViewWrapper as='aside' data-callout='' data-type={node.attrs.type} className='editor-callout'>
			<select
				contentEditable={false}
				value={node.attrs.type}
				onChange={(e) => updateAttributes({ type: e.target.value })}
				className='editor-callout-type'
				aria-label='Callout type'>
				{CALLOUT_TYPES.map((type) => (
					<option key={type} value={type}>
						{type}
					</option>
				))}
			</select>
			<NodeViewContent />
		</NodeViewWrapper>
	);
}

function FigureView({ node, updateAttributes, selected }: NodeViewProps) {
	return (
		<NodeViewWrapper className={`editor-figure ${selected ? "is-selected" : ""}`}>
			<img src={node.attrs.src} alt={node.attrs.alt ?? ""} data-drag-handle='' />
			<div className='editor-figure-fields'>
				<input
					value={node.attrs.title ?? ""}
					onChange={(e) => updateAttributes({ title: e.target.value || null })}
					placeholder='Add a caption…'
					aria-label='Image caption'
				/>
				<input
					value={node.attrs.alt ?? ""}
					onChange={(e) => updateAttributes({ alt: e.target.value || null })}
					placeholder='Alt text (describe the image)'
					aria-label='Image alt text'
				/>
			</div>
		</NodeViewWrapper>
	);
}

/** The shared nodes, plus the in-editor React UI for them. */
export const CalloutWithView = Callout.extend({
	addNodeView: () => ReactNodeViewRenderer(CalloutView),
});

export const ImageWithCaption = Image.extend({
	addNodeView: () => ReactNodeViewRenderer(FigureView),
}).configure({ inline: false });
