import Link from "next/link";
import { getPublishedArticles } from "@/lib/content/articles";
import { ArticleList } from "./ArticleList";

export async function WritingSection() {
	// Show only the 5 most recent articles
	const recentArticles = (await getPublishedArticles()).slice(0, 5);

	return (
		<div className='flex flex-col gap-3 items-start relative shrink-0 w-full'>
			<p className='text-olive-400 dark:text-olive-600 text-sm mb-3 uppercase font-mono'>Writing</p>
			<ArticleList articles={recentArticles} />
			<Link
				href='/writing'
				className='font-normal relative shrink-0 text-olive-500 hover:text-olive-800 dark:text-olive-500 hover:dark:text-olive-100 text-sm text-justify text-nowrap whitespace-pre hover:underline underline-offset-4 transition-all'>
				View all &rarr;
			</Link>
		</div>
	);
}
