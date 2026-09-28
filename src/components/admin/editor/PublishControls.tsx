"use client";

import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface PublishControlsProps {
	article: Doc<"articles"> & { hasUnpublishedChanges: boolean };
	/** Saves pending edits; resolves false if saving failed. */
	flush: () => Promise<boolean>;
	hasLocalChanges: boolean;
	onError: (message: string) => void;
}

const primary =
	"rounded-lg bg-olive-900 px-3 py-1.5 text-sm font-medium text-olive-50 hover:opacity-85 disabled:opacity-40 dark:bg-olive-100 dark:text-olive-900";
const secondary =
	"rounded-lg border border-olive-300 px-3 py-1.5 text-sm hover:bg-olive-100 disabled:opacity-40 dark:border-olive-700 dark:hover:bg-olive-900";

function toLocalInputValue(ms: number) {
	const d = new Date(ms - new Date().getTimezoneOffset() * 60_000);
	return d.toISOString().slice(0, 16);
}

export function PublishControls({ article, flush, hasLocalChanges, onError }: PublishControlsProps) {
	const publish = useMutation(api.articles.publish);
	const unpublish = useMutation(api.articles.unpublish);
	const schedule = useMutation(api.articles.schedule);
	const unschedule = useMutation(api.articles.unschedule);
	const [busy, setBusy] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [scheduling, setScheduling] = useState(false);
	const [when, setWhen] = useState(() => toLocalInputValue(Date.now() + 24 * 60 * 60 * 1000));

	const act = async (fn: () => Promise<unknown>, { save = true } = {}) => {
		setBusy(true);
		setMenuOpen(false);
		try {
			if (save && !(await flush())) return;
			await fn();
			setScheduling(false);
		} catch (error) {
			onError(cleanError(error));
		} finally {
			setBusy(false);
		}
	};

	const id = article._id;

	if (article.status === "scheduled") {
		return (
			<div className='flex items-center gap-2'>
				<span className='hidden text-xs text-amber-700 sm:inline dark:text-amber-400'>
					Goes live {article.publishAt ? new Date(article.publishAt).toLocaleString() : ""}
				</span>
				<button type='button' className={secondary} disabled={busy} onClick={() => act(() => unschedule({ id }), { save: false })}>
					Unschedule
				</button>
				<button type='button' className={primary} disabled={busy} onClick={() => act(() => publish({ id }))}>
					Publish now
				</button>
			</div>
		);
	}

	if (article.live) {
		const canUpdate = article.hasUnpublishedChanges || hasLocalChanges;
		return (
			<div className='relative flex items-center gap-2'>
				<a href={`/writing/${article.live.slug}`} target='_blank' className='hidden text-xs text-olive-500 hover:underline sm:inline'>
					View live ↗
				</a>
				<button type='button' className={primary} disabled={busy || !canUpdate} onClick={() => act(() => publish({ id }))}>
					{canUpdate ? "Update" : "Up to date"}
				</button>
				<button type='button' className={secondary} aria-label='More publishing options' onClick={() => setMenuOpen((o) => !o)}>
					<ChevronDown className='size-4' />
				</button>
				{menuOpen && (
					<div className='absolute right-0 top-full z-40 mt-2 w-44 rounded-lg border border-olive-200 bg-olive-50 p-1 shadow-lg dark:border-olive-700 dark:bg-olive-900'>
						<button
							type='button'
							className='w-full rounded-md px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-500/10'
							onClick={() => {
								if (confirm("Unpublish this article? Its URL will stop working.")) {
									void act(() => unpublish({ id }), { save: false });
								}
							}}>
							Unpublish
						</button>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className='relative flex items-center gap-2'>
			<button type='button' className={secondary} disabled={busy} onClick={() => setScheduling((s) => !s)}>
				Schedule
			</button>
			<button type='button' className={primary} disabled={busy} onClick={() => act(() => publish({ id }))}>
				Publish
			</button>
			{scheduling && (
				<div className='absolute right-0 top-full z-40 mt-2 flex w-72 flex-col gap-3 rounded-lg border border-olive-200 bg-olive-50 p-3 shadow-lg dark:border-olive-700 dark:bg-olive-900'>
					<label className='flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-olive-500'>
						Go live at
						<input
							type='datetime-local'
							value={when}
							min={toLocalInputValue(Date.now())}
							onChange={(e) => setWhen(e.target.value)}
							className='rounded-md border border-olive-200 bg-white px-2 py-1.5 text-sm font-normal normal-case tracking-normal text-olive-800 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-100'
						/>
					</label>
					<button
						type='button'
						className={primary}
						disabled={busy || !when}
						onClick={() => act(() => schedule({ id, publishAt: new Date(when).getTime() }))}>
						Schedule
					</button>
				</div>
			)}
		</div>
	);
}

/** Convex wraps thrown errors with request metadata; show just the message. */
export function cleanError(error: unknown) {
	const message = error instanceof Error ? error.message : String(error);
	// Errors thrown inside nested Convex calls carry the prefix more than once.
	return message.match(/(?:Uncaught Error: )+(.*?)(?:\n|\s+at |$)/)?.[1] ?? message;
}
