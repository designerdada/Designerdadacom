"use client";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type FormEvent } from "react";

export const CATEGORIES = ["Product", "People", "Site", "Font", "Movie"] as const;

type FavoriteDraft = Pick<
	Doc<"favorites">,
	"name" | "description" | "url" | "category" | "nofollow" | "previewImageUrl"
>;

const EMPTY: FavoriteDraft = { name: "", description: "", url: "", category: "Product", nofollow: true };

const inputClass =
	"w-full rounded-lg border border-olive-300 dark:border-olive-700 bg-transparent px-3 py-2 text-sm placeholder:text-olive-400 focus:border-olive-800 dark:focus:border-olive-200 focus:outline-none";
const labelClass = "flex flex-col gap-1.5 text-xs text-olive-500";

/** Adds a favorite, or edits one when `editing` is given. */
export function FavoriteForm({
	editing,
	onDone,
}: {
	editing?: { id: Id<"favorites"> } & FavoriteDraft;
	onDone: () => void;
}) {
	const create = useMutation(api.favorites.create);
	const update = useMutation(api.favorites.update);
	const [draft, setDraft] = useState<FavoriteDraft>(() =>
		editing
			? {
					name: editing.name,
					description: editing.description,
					url: editing.url,
					category: editing.category,
					nofollow: editing.nofollow,
					previewImageUrl: editing.previewImageUrl,
				}
			: EMPTY,
	);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const set = <K extends keyof FavoriteDraft>(key: K, value: FavoriteDraft[K]) =>
		setDraft((current) => ({ ...current, [key]: value }));

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setSaving(true);
		setError(null);
		try {
			if (editing) await update({ id: editing.id, favorite: draft });
			else await create({ favorite: draft });
			onDone();
		} catch (err) {
			setError(err instanceof ConvexError ? String(err.data) : "Couldn't save. Try again.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='flex flex-col gap-4 rounded-xl border border-olive-200 dark:border-olive-800 p-4'>
			<label className={labelClass}>
				Link
				<input
					type='url'
					required
					autoFocus
					placeholder='https://'
					value={draft.url}
					onChange={(e) => set("url", e.target.value)}
					className={inputClass}
				/>
			</label>
			<div className='grid gap-4 sm:grid-cols-[1fr_10rem]'>
				<label className={labelClass}>
					Name
					<input
						required
						value={draft.name}
						onChange={(e) => set("name", e.target.value)}
						className={inputClass}
					/>
				</label>
				<label className={labelClass}>
					Category
					<select
						value={draft.category}
						onChange={(e) => set("category", e.target.value as FavoriteDraft["category"])}
						className={inputClass}>
						{CATEGORIES.map((category) => (
							<option key={category}>{category}</option>
						))}
					</select>
				</label>
			</div>
			<label className={labelClass}>
				Why it&apos;s a favorite
				<input
					value={draft.description}
					onChange={(e) => set("description", e.target.value)}
					className={inputClass}
				/>
			</label>
			<label className={labelClass}>
				Preview image
				<input
					type='url'
					placeholder='Found automatically from the page. Paste an image URL to override.'
					value={draft.previewImageUrl ?? ""}
					onChange={(e) => set("previewImageUrl", e.target.value || undefined)}
					className={inputClass}
				/>
			</label>
			<label className='flex items-center gap-2 text-sm'>
				<input type='checkbox' checked={draft.nofollow} onChange={(e) => set("nofollow", e.target.checked)} />
				Add <code className='font-mono text-xs'>rel=&quot;nofollow&quot;</code>
				<span className='text-xs text-olive-500'>(untick to pass on search ranking)</span>
			</label>

			{error && <p className='text-sm text-red-600'>{error}</p>}

			<div className='flex items-center gap-2'>
				<button
					type='submit'
					disabled={saving}
					className='rounded-lg bg-olive-900 px-3 py-1.5 text-sm font-medium text-olive-50 hover:opacity-85 disabled:opacity-50 dark:bg-olive-100 dark:text-olive-900'>
					{saving ? "Saving…" : editing ? "Save changes" : "Add link"}
				</button>
				<button
					type='button'
					onClick={onDone}
					className='rounded-lg px-3 py-1.5 text-sm text-olive-500 hover:text-olive-800 dark:hover:text-olive-100'>
					Cancel
				</button>
			</div>
		</form>
	);
}
