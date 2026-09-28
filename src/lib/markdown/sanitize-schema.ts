import { defaultSchema, type Options } from "rehype-sanitize";

/** GitHub-style sanitisation plus the two custom elements produced by remarkCustomBlocks. */
export const sanitizeSchema: Options = {
	...defaultSchema,
	tagNames: [...(defaultSchema.tagNames ?? []), "callout", "youtube"],
	attributes: {
		...defaultSchema.attributes,
		callout: ["type"],
		youtube: ["video"],
	},
};
