import { Link } from 'react-router-dom';
import { sortedArticles } from '../data/articles';

export function WritingSection() {
  // Show only the 5 most recent articles
  const recentArticles = sortedArticles.slice(0, 5);

  return (
    <div className="flex flex-col gap-3 items-start relative shrink-0 w-full">
      <div className="flex flex-col gap-3 items-start relative shrink-0 w-full">
        {recentArticles.map((article) => (
          <Link
            key={article.id}
            to={`/writing/${article.id}`}
            className="flex items-center justify-between relative shrink-0 text-justify text-nowrap w-full whitespace-pre hover:opacity-70 transition-opacity group"
          >
            <p className="font-medium relative shrink-0 text-[var(--foreground)] text-base group-hover:underline underline-offset-4">
              {article.title}
            </p>
            <p className="relative shrink-0 text-sm text-[var(--muted)] font-mono uppercase">
              {article.date}
            </p>
          </Link>
        ))}
      </div>
      <Link
        to="/writing"
        className="font-normal relative shrink-0 text-gray-500 hover:text-[var(--foreground)] text-sm text-justify text-nowrap whitespace-pre hover:underline underline-offset-4 transition-all"
      >
        View all →
      </Link>
    </div>
  );
}