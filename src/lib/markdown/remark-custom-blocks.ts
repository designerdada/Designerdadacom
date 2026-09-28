import type { Root, RootContent, PhrasingContent } from "mdast";
import type { ContainerDirective, LeafDirective, TextDirective } from "mdast-util-directive";
import { visit, SKIP } from "unist-util-visit";
import { isYouTubeId } from "./youtube";

export const CALLOUT_TYPES = ["note", "tip", "warning"] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

export function toCalloutType(value: unknown): CalloutType {
	return CALLOUT_TYPES.includes(value as CalloutType) ? (value as CalloutType) : "note";
}

type Directive = ContainerDirective | LeafDirective | TextDirective;

/**
 * Maps the directives we support onto custom elements that the component map renders:
 *   :::callout{type="note"} … :::   → <callout type="note">
 *   ::youtube{id="VIDEO_ID"}        → <youtube video="VIDEO_ID">
 * Any other directive is turned back into plain text so stray colons in prose never vanish.
 */
export function remarkCustomBlocks() {
	return (tree: Root) => {
		visit(tree, (node, index, parent) => {
			if (!isDirective(node)) return;

			if (node.type === "containerDirective" && node.name === "callout") {
				node.data = { hName: "callout", hProperties: { type: toCalloutType(node.attributes?.type) } };
				return;
			}

			if (node.type === "leafDirective" && node.name === "youtube") {
				const id = node.attributes?.id;
				node.data = isYouTubeId(id)
					? { hName: "youtube", hProperties: { video: id } }
					: { hName: "div", hChildren: [] };
				node.children = [];
				return SKIP;
			}

			if (!parent || index === undefined) return;
			const restored = restoreAsText(node);
			parent.children.splice(index, 1, ...(restored as never[]));
			return [SKIP, index + restored.length];
		});
	};
}

function isDirective(node: { type: string }): node is Directive {
	return (
		node.type === "containerDirective" || node.type === "leafDirective" || node.type === "textDirective"
	);
}

function restoreAsText(node: Directive): RootContent[] {
	if (node.type === "textDirective") {
		return [{ type: "text", value: `:${node.name}` }, ...node.children];
	}
	if (node.type === "leafDirective") {
		const children: PhrasingContent[] = [{ type: "text", value: `::${node.name}` }, ...node.children];
		return [{ type: "paragraph", children }];
	}
	return [{ type: "paragraph", children: [{ type: "text", value: `:::${node.name}` }] }, ...node.children];
}
