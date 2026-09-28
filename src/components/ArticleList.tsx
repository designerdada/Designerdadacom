import Link from "next/link";
import { formatDisplayDate } from "@/lib/dates";

interface ArticleListItem {
	slug: string;
	title: string;
	publishedAt: number;
}

export function ArticleList({ articles }: { articles: ArticleListItem[] }) {
	return (
		<div className='flex flex-col gap-3 items-start relative shrink-0 w-full'>
			{articles.map((article) => (
				<Link
					key={article.slug}
					href={`/writing/${article.slug}`}
					className='flex items-center justify-between gap-4 relative shrink-0 text-justify w-full group'>
					<p className='font-semibold relative min-w-0 truncate text-olive-800 dark:text-olive-100 text-sm group-hover:underline underline-offset-4'>
						{article.title}
					</p>
					<p className='relative shrink-0 text-sm text-olive-500 dark:text-olive-400 font-mono uppercase'>
						{formatDisplayDate(article.publishedAt)}
					</p>
				</Link>
			))}
		</div>
	);
}
