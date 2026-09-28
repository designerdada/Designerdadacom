import ReactMarkdown from "react-markdown";
import { markdownComponents } from "./components";
import { rehypePlugins, remarkPlugins } from "./plugins";

/**
 * Renders article Markdown. Hook-free and browser-API-free on purpose, so the exact same
 * component runs on the server for public pages and in the client for the editor preview.
 */
export function ArticleBody({ markdown }: { markdown: string }) {
	return (
		<div className='article-body flex flex-col items-start relative shrink-0 w-full'>
			<ReactMarkdown
				remarkPlugins={remarkPlugins}
				rehypePlugins={rehypePlugins}
				components={markdownComponents}>
				{markdown}
			</ReactMarkdown>
		</div>
	);
}
