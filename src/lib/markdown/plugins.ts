import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { PluggableList } from "unified";
import { remarkCustomBlocks } from "./remark-custom-blocks";
import { sanitizeSchema } from "./sanitize-schema";

/** The single Markdown dialect used by the site, the editor preview, and the RSS feed. */
export const remarkPlugins: PluggableList = [remarkGfm, remarkDirective, remarkCustomBlocks];
export const rehypePlugins: PluggableList = [[rehypeSanitize, sanitizeSchema]];
