"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { getDomain, getFaviconUrl } from "@/lib/favicon";
import { AdminNav } from "./AdminNav";
import { CATEGORIES, FavoriteForm } from "./FavoriteForm";

const FILTERS = ["All", ...CATEGORIES] as const;
type Filter = (typeof FILTERS)[number];

const iconButton =
	"rounded p-2 text-olive-400 transition hover:bg-olive-200/60 hover:text-olive-800 dark:hover:bg-olive-800 dark:hover:text-olive-100";

export function AdminFavorites() {
	const favorites = useQuery(api.favorites.list);
	const remove = useMutation(api.favorites.remove);
	const refreshPreview = useMutation(api.favorites.refreshPreview);
	const [filter, setFilter] = useState<Filter>("All");
	// "new" shows the add form; an id shows that row's edit form.
	const [editing, setEditing] = useState<"new" | Id<"favorites"> | null>(null);

	const visible = favorites?.filter((f) => filter === "All" || f.category === filter);

	const handleDelete = async (id: Id<"favorites">, name: string) => {
		if (!confirm(`Remove "${name}" from favorites?`)) return;
		await remove({ id });
	};

	return (
		<div className='mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10'>
			<AdminNav />

			<div className='flex items-center justify-between gap-4'>
				<h1 className='font-serif text-3xl italic'>Favorites</h1>
				<button
					type='button'
					onClick={() => setEditing("new")}
					disabled={editing === "new"}
					className='flex items-center gap-1.5 rounded-lg bg-olive-900 px-3 py-1.5 text-sm font-medium text-olive-50 hover:opacity-85 disabled:opacity-50 dark:bg-olive-100 dark:text-olive-900'>
					<Plus className='size-4' /> New link
				</button>
			</div>

			{editing === "new" && <FavoriteForm onDone={() => setEditing(null)} />}

			<div className='flex w-fit flex-wrap gap-1 rounded-lg bg-olive-100 p-1 text-sm dark:bg-olive-900'>
				{FILTERS.map((f) => (
					<button
						key={f}
						type='button'
						onClick={() => setFilter(f)}
						className={`rounded-md px-3 py-1 ${
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
					{visible.map((favorite) =>
						editing === favorite._id ? (
							<li key={favorite._id} className='py-3'>
								<FavoriteForm
									editing={{ id: favorite._id, ...favorite }}
									onDone={() => setEditing(null)}
								/>
							</li>
						) : (
							<li key={favorite._id} className='group flex items-center gap-4 py-3'>
								<div className='flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-olive-100 dark:bg-olive-900'>
									{favorite.previewImageUrl ? (
										<img
											src={favorite.previewImageUrl}
											alt=''
											referrerPolicy='no-referrer'
											className='size-full object-cover'
										/>
									) : (
										<span className='text-[10px] text-olive-400'>No preview</span>
									)}
								</div>
								<div className='flex min-w-0 flex-1 flex-col gap-1'>
									<span className='flex items-center gap-2 font-semibold'>
										<img src={getFaviconUrl(favorite.url)} alt='' className='size-4' />
										<span className='truncate'>{favorite.name}</span>
									</span>
									<span className='flex flex-wrap items-center gap-2 text-xs text-olive-500'>
										<span className='rounded bg-olive-200 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-olive-700 dark:bg-olive-800 dark:text-olive-300'>
											{favorite.category}
										</span>
										<a href={favorite.url} target='_blank' rel='noreferrer' className='font-mono hover:underline'>
											{getDomain(favorite.url)}
										</a>
										{favorite.description && <span className='truncate'>• {favorite.description}</span>}
									</span>
								</div>
								<div className='flex shrink-0 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100'>
									<button
										type='button'
										onClick={() => void refreshPreview({ id: favorite._id })}
										className={iconButton}
										aria-label='Find preview image again'
										title='Find preview image again'>
										<RefreshCw className='size-4' />
									</button>
									<button
										type='button'
										onClick={() => setEditing(favorite._id)}
										className={iconButton}
										aria-label='Edit'>
										<Pencil className='size-4' />
									</button>
									<button
										type='button'
										onClick={() => handleDelete(favorite._id, favorite.name)}
										className='rounded p-2 text-olive-400 transition hover:bg-red-500/10 hover:text-red-500'
										aria-label='Delete'>
										<Trash2 className='size-4' />
									</button>
								</div>
							</li>
						),
					)}
				</ul>
			)}
		</div>
	);
}
