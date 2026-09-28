"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { slugify } from "@/lib/slug";
import { OgImagePreview } from "./OgImagePreview";
import type { ArticleDraft } from "./types";
import { useStorageUpload } from "./useImageUpload";

interface SettingsPanelProps {
	articleId: Id<"articles">;
	draft: ArticleDraft;
	liveSlug?: string;
	savedSlug: string;
	ogImageUrl?: string;
	onChange: (patch: Partial<ArticleDraft>) => void;
	onClose: () => void;
	onError: (message: string) => void;
}

const inputClass =
	"w-full rounded-lg border border-olive-200 bg-white px-3 py-2 text-sm outline-none focus:border-olive-400 dark:border-olive-700 dark:bg-olive-950 dark:focus:border-olive-500";

export function SettingsPanel({
	articleId,
	draft,
	liveSlug,
	savedSlug,
	ogImageUrl,
	onChange,
	onClose,
	onError,
}: SettingsPanelProps) {
	const seoTitle = draft.seoTitle || draft.title;

	return (
		<aside className='fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-olive-200 bg-olive-50 shadow-2xl dark:border-olive-800 dark:bg-olive-950'>
			<div className='flex items-center justify-between border-b border-olive-200 px-5 py-3 dark:border-olive-800'>
				<h2 className='text-sm font-semibold'>Article settings</h2>
				<button type='button' onClick={onClose} aria-label='Close settings' className='rounded p-1 hover:bg-olive-100 dark:hover:bg-olive-900'>
					<X className='size-4' />
				</button>
			</div>

			<div className='flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5'>
				<Field label='URL slug' hint={`${siteConfig.url.replace("https://", "")}/writing/${draft.slug}`}>
					<input
						className={inputClass}
						value={draft.slug}
						onChange={(e) => onChange({ slug: slugify(e.target.value) || e.target.value.toLowerCase() })}
						// An emptied field falls back to the last saved slug rather than sending "".
						onBlur={(e) => onChange({ slug: slugify(e.target.value) || savedSlug })}
					/>
					{liveSlug && liveSlug !== draft.slug && (
						<p className='text-xs text-amber-700 dark:text-amber-400'>
							On update, /writing/{liveSlug} will permanently redirect here.
						</p>
					)}
				</Field>

				<Field label='SEO title' hint={`${seoTitle.length}/60 · defaults to the article title`}>
					<input
						className={inputClass}
						value={draft.seoTitle}
						placeholder={draft.title}
						onChange={(e) => onChange({ seoTitle: e.target.value })}
					/>
				</Field>

				<Field label='Description' hint={`${draft.description.length}/160 · used for search results and social cards`}>
					<textarea
						className={`${inputClass} min-h-24 resize-y`}
						value={draft.description}
						onChange={(e) => onChange({ description: e.target.value })}
					/>
				</Field>

				<SearchPreview title={seoTitle} description={draft.description} slug={draft.slug} />

				<Field
					label='Social image'
					hint={
						ogImageUrl
							? "Uploaded image (1200 × 630 recommended)."
							: "Generated from the title and description; updates when you publish changes."
					}>
					<OgImagePicker
						articleId={articleId}
						ogImageUrl={ogImageUrl}
						title={draft.title}
						description={draft.description}
						onError={onError}
					/>
				</Field>

				<Field label='Keywords' hint='Press Enter or comma to add'>
					<KeywordInput keywords={draft.keywords} onChange={(keywords) => onChange({ keywords })} />
				</Field>

				<Field label='Publish date' hint='Shown on the article and in structured data'>
					<input
						type='date'
						className={inputClass}
						value={draft.publishedAt ? new Date(draft.publishedAt).toISOString().slice(0, 10) : ""}
						onChange={(e) =>
							onChange({ publishedAt: e.target.value ? Date.parse(`${e.target.value}T00:00:00Z`) : null })
						}
					/>
				</Field>

				<Field label='Author'>
					<input className={inputClass} value={draft.author} onChange={(e) => onChange({ author: e.target.value })} />
				</Field>

				<Field label='Canonical URL' hint='Only if this was first published elsewhere'>
					<input
						className={inputClass}
						type='url'
						value={draft.canonicalUrl}
						placeholder={`${siteConfig.url}/writing/${draft.slug}`}
						onChange={(e) => onChange({ canonicalUrl: e.target.value })}
					/>
				</Field>
			</div>
		</aside>
	);
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
	return (
		<label className='flex flex-col gap-1.5'>
			<span className='text-xs font-semibold uppercase tracking-wide text-olive-500'>{label}</span>
			{children}
			{hint && <span className='text-xs text-olive-500'>{hint}</span>}
		</label>
	);
}

function SearchPreview({ title, description, slug }: { title: string; description: string; slug: string }) {
	return (
		<div className='flex flex-col gap-0.5 rounded-lg border border-olive-200 bg-white p-3 dark:border-olive-800 dark:bg-olive-900'>
			<span className='truncate text-xs text-olive-500'>
				{siteConfig.url.replace("https://", "")} › writing › {slug}
			</span>
			<span className='truncate text-base text-blue-800 dark:text-blue-300'>
				{title || "Untitled"} | {siteConfig.author.name}
			</span>
			<span className='line-clamp-2 text-xs text-olive-600 dark:text-olive-400'>
				{description || "Add a description to control how this article appears in search."}
			</span>
		</div>
	);
}

function KeywordInput({ keywords, onChange }: { keywords: string[]; onChange: (k: string[]) => void }) {
	const [value, setValue] = useState("");

	const commit = () => {
		const next = value
			.split(",")
			.map((k) => k.trim())
			.filter((k) => k && !keywords.includes(k));
		if (next.length) onChange([...keywords, ...next]);
		setValue("");
	};

	return (
		<div className={`${inputClass} flex flex-wrap gap-1.5`}>
			{keywords.map((keyword) => (
				<span key={keyword} className='flex items-center gap-1 rounded bg-olive-100 px-1.5 py-0.5 text-xs dark:bg-olive-800'>
					{keyword}
					<button
						type='button'
						aria-label={`Remove ${keyword}`}
						onClick={() => onChange(keywords.filter((k) => k !== keyword))}
						className='text-olive-500 hover:text-olive-900 dark:hover:text-olive-100'>
						×
					</button>
				</span>
			))}
			<input
				className='min-w-24 flex-1 bg-transparent text-sm outline-none'
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onBlur={commit}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === ",") {
						e.preventDefault();
						commit();
					} else if (e.key === "Backspace" && !value && keywords.length) {
						onChange(keywords.slice(0, -1));
					}
				}}
			/>
		</div>
	);
}

function OgImagePicker({
	articleId,
	ogImageUrl,
	title,
	description,
	onError,
}: {
	articleId: Id<"articles">;
	ogImageUrl?: string;
	title: string;
	description: string;
	onError: (message: string) => void;
}) {
	const upload = useStorageUpload();
	const setOgImage = useMutation(api.files.setOgImage);
	const inputRef = useRef<HTMLInputElement>(null);
	const [busy, setBusy] = useState(false);

	const handleFile = async (file: File) => {
		setBusy(true);
		try {
			await setOgImage({ articleId, storageId: await upload(file) });
		} catch (error) {
			onError(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className='flex flex-col gap-2'>
			<div className='overflow-hidden rounded-lg border border-olive-200 bg-olive-100 dark:border-olive-800 dark:bg-olive-900'>
				{ogImageUrl ? (
					<img src={ogImageUrl} alt='' className='aspect-[1200/630] w-full object-cover' />
				) : (
					<OgImagePreview title={title} description={description} />
				)}
			</div>
			<div className='flex gap-2 text-xs'>
				<button
					type='button'
					disabled={busy}
					onClick={() => inputRef.current?.click()}
					className='rounded-md border border-olive-300 px-2.5 py-1 hover:bg-olive-100 disabled:opacity-50 dark:border-olive-700 dark:hover:bg-olive-900'>
					{busy ? "Uploading…" : ogImageUrl ? "Replace" : "Upload image"}
				</button>
				{ogImageUrl && (
					<button
						type='button'
						onClick={() => void setOgImage({ articleId, storageId: null })}
						className='rounded-md px-2.5 py-1 text-olive-500 hover:text-red-600'>
						Use generated image
					</button>
				)}
			</div>
			<input
				ref={inputRef}
				type='file'
				accept='image/*'
				hidden
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) void handleFile(file);
					e.target.value = "";
				}}
			/>
		</div>
	);
}
