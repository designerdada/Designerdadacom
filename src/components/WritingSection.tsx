import { Link } from "react-router-dom";
import { sortedArticles } from "../data/articles";

export function WritingSection() {
	// Show only the 5 most recent articles
	const recentArticles = sortedArticles.slice(0, 5);

	return (
		<div className='flex flex-col gap-3 items-start relative shrink-0 w-full'>
			<p className='text-olive-400 dark:text-olive-600 text-sm mb-3 uppercase font-mono'>Writing</p>
			<div className='flex flex-col gap-3 items-start relative shrink-0 w-full'>
				{recentArticles.map((article) => (
					<Link
						key={article.id}
						to={`/writing/${article.id}`}
						className='flex items-center justify-between relative shrink-0 text-justify text-nowrap w-full whitespace-pre group'>
						<p className='font-semibold relative shrink-0 text-olive-800 dark:text-olive-100 text-sm group-hover:underline underline-offset-4'>
							{article.title}
						</p>
						<p className='relative shrink-0 text-sm text-olive-500 dark:text-olive-400 font-mono uppercase'>
							{article.date}
						</p>
					</Link>
				))}
			</div>
			<Link
				to='/writing'
				className='font-normal relative shrink-0 text-olive-500 hover:text-olive-800 dark:text-olive-500 hover:dark:text-olive-100 text-sm text-justify text-nowrap whitespace-pre hover:underline underline-offset-4 transition-all'>
				View all &rarr;
			</Link>
		</div>
	);
}
