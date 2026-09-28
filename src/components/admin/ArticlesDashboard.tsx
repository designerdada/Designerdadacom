"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDisplayDate } from "@/lib/dates";
import { AdminNav } from "./AdminNav";
import { StatusBadge } from "./StatusBadge";

const FILTERS = ["all", "draft", "scheduled", "published"] as const;
type Filter = (typeof FILTERS)[number];

export function ArticlesDashboard() {
	const articles = useQuery(api.articles.list);
	const create = useMutation(api.articles.create);
	const remove = useMutation(api.articles.remove);
	const router = useRouter();
	const [filter, setFilter] = useState<Filter>("all");
	const [creating, setCreating] = useState(false);

	const handleCreate = async () => {
		setCreating(true);
		try {
			const id = await create();
			router.push(`/admin/articles/${id}`);
		} finally {
			setCreating(false);
		}
	};

	const handleDelete = async (id: Id<"articles">, title: string) => {
		if (!confirm(`Delete "${title || "Untitled"}" permanently? This can't be undone.`)) return;
		await remove({ id });
	};

	const visible = articles?.filter((a) => filter === "all" || a.status === filter);

	return (
		<div className='mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10'>
			<AdminNav />

			<div className='flex items-center justify-between gap-4'>
				<h1 className='font-serif text-3xl italic'>Writing</h1>
				<button
					type='button'
					onClick={handleCreate}
					disabled={creating}
					className='flex items-center gap-1.5 rounded-lg bg-olive-900 px-3 py-1.5 text-sm font-medium text-olive-50 hover:opacity-85 disabled:opacity-50 dark:bg-olive-100 dark:text-olive-900'>
					<Plus className='size-4' /> New article
				</button>
			</div>

			<div className='flex gap-1 rounded-lg bg-olive-100 p-1 text-sm dark:bg-olive-900 w-fit'>
				{FILTERS.map((f) => (
					<button
						key={f}
						type='button'
						onClick={() => setFilter(f)}
						className={`rounded-md px-3 py-1 capitalize ${
							filter === f
								? "bg-olive-50 font-medium shadow-sm dark:bg-olive-800"
								: "text-olive-500 hover:text-olive-800 dark:hover:text-olive-100"
						}`}>
						{f}
					</button>
				))}
			</div>

			{visible === undefined ? (
				<p className='text-sm text-olive-500'>Loading…</p>
			) : visible.length === 0 ? (
				<p className='text-sm text-olive-500'>Nothing here yet.</p>
			) : (
				<ul className='flex flex-col divide-y divide-olive-200 dark:divide-olive-800'>
					{visible.map((article) => (
						<li key={article._id} className='group flex items-center gap-4 py-3'>
							<Link href={`/admin/articles/${article._id}`} className='flex min-w-0 flex-1 flex-col gap-1'>
								<span className='truncate font-semibold group-hover:underline underline-offset-4'>
									{article.title || "Untitled"}
								</span>
								<span className='flex flex-wrap items-center gap-2 text-xs text-olive-500'>
									<StatusBadge status={article.status} />
									{article.hasUnpublishedChanges && <span>• Unpublished changes</span>}
									{article.publishError && (
										<span className='text-red-600'>• Scheduled publish failed: {article.publishError}</span>
									)}
									{article.status === "scheduled" && article.publishAt && (
										<span>• Goes live {new Date(article.publishAt).toLocaleString()}</span>
									)}
									{article.isLive && article.publishedAt && (
										<span className='font-mono uppercase'>{formatDisplayDate(article.publishedAt)}</span>
									)}
									<span>• Edited {new Date(article.updatedAt).toLocaleString()}</span>
								</span>
							</Link>
							<button
								type='button'
								onClick={() => handleDelete(article._id, article.title)}
								className='rounded p-2 text-olive-400 opacity-0 transition hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 focus:opacity-100'
								aria-label='Delete article'>
								<Trash2 className='size-4' />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
