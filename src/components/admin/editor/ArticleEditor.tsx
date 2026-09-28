"use client";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Columns2, Settings2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ArticleBody } from "@/lib/markdown/ArticleBody";
import { slugify } from "@/lib/slug";
import { StatusBadge } from "../StatusBadge";
import { MarkdownEditor } from "./MarkdownEditor";
import { cleanError, PublishControls } from "./PublishControls";
import { SettingsPanel } from "./SettingsPanel";
import type { ArticleDraft } from "./types";
import { useArticleImageUpload } from "./useImageUpload";
import { VisualEditor } from "./VisualEditor";

type Article = Doc<"articles"> & { hasUnpublishedChanges: boolean };
type Mode = "visual" | "markdown";
type SaveState = "saved" | "unsaved" | "saving" | "error";

const AUTOSAVE_MS = 800;
const MODE_KEY = "editor-mode";

export function ArticleEditor({ id }: { id: Id<"articles"> }) {
	const article = useQuery(api.articles.get, { id });

	if (article === undefined) return <CenteredMessage>Loading…</CenteredMessage>;
	if (article === null) {
		return (
			<CenteredMessage>
				This article doesn&apos;t exist. <Link href='/admin' className='underline'>Back to articles</Link>
			</CenteredMessage>
		);
	}
	return <Workspace article={article} />;
}

function Workspace({ article }: { article: Article }) {
	const saveDraft = useMutation(api.articles.saveDraft);
	const uploadImage = useArticleImageUpload(article._id);

	const [draft, setDraft] = useState<ArticleDraft>(() => toDraft(article));
	const [saveState, setSaveState] = useState<SaveState>("saved");
	const [mode, setMode] = useState<Mode>("visual");
	const [showPreview, setShowPreview] = useState(true);
	const [showSettings, setShowSettings] = useState(false);
	const [error, setError] = useState<string | null>(null);
	// Follow the title with the slug until the slug is edited by hand or the article goes live.
	const [slugFollowsTitle, setSlugFollowsTitle] = useState(
		() => !article.live && (article.slug.startsWith("untitled") || article.slug === slugify(article.title)),
	);

	const pending = useRef<Partial<ArticleDraft>>({});
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const inFlight = useRef<Promise<boolean> | null>(null);

	const flush = useCallback(async (): Promise<boolean> => {
		if (timer.current) clearTimeout(timer.current);
		timer.current = null;
		if (inFlight.current) await inFlight.current;
		const patch = pending.current;
		if (Object.keys(patch).length === 0) return true;
		pending.current = {};
		setSaveState("saving");
		const request = saveDraft({ id: article._id, patch })
			.then((result) => {
				if (result.slugError) {
					// Everything else saved; put the slug back unless it has been edited again since.
					setError(result.slugError);
					setSlugFollowsTitle(false);
					if (!("slug" in pending.current)) setDraft((d) => ({ ...d, slug: result.slug }));
				}
				setSaveState(Object.keys(pending.current).length ? "unsaved" : "saved");
				return true;
			})
			.catch((err: unknown) => {
				pending.current = { ...patch, ...pending.current };
				setSaveState("error");
				setError(cleanError(err));
				return false;
			});
		inFlight.current = request;
		const ok = await request;
		inFlight.current = null;
		return ok;
	}, [article._id, saveDraft]);

	const update = useCallback(
		(patch: Partial<ArticleDraft>) => {
			setDraft((current) => ({ ...current, ...patch }));
			pending.current = { ...pending.current, ...patch };
			setSaveState("unsaved");
			if (timer.current) clearTimeout(timer.current);
			timer.current = setTimeout(() => void flush(), AUTOSAVE_MS);
		},
		[flush],
	);

	const updateTitle = (title: string) =>
		update(slugFollowsTitle && slugify(title) ? { title, slug: slugify(title) } : { title });

	const updateSettings = (patch: Partial<ArticleDraft>) => {
		if (patch.slug !== undefined) setSlugFollowsTitle(false);
		update(patch);
	};

	// Remember the preferred editing mode per browser.
	useEffect(() => {
		try {
			const saved = localStorage.getItem(MODE_KEY);
			if (saved === "visual" || saved === "markdown") setMode(saved);
		} catch {}
	}, []);
	const changeMode = (next: Mode) => {
		setMode(next);
		try {
			localStorage.setItem(MODE_KEY, next);
		} catch {}
	};

	// ⌘S / Ctrl+S saves immediately; warn before leaving with unsaved edits.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				void flush();
			}
		};
		const onBeforeUnload = (e: BeforeUnloadEvent) => {
			if (Object.keys(pending.current).length) e.preventDefault();
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("beforeunload", onBeforeUnload);
			void flush();
		};
	}, [flush]);

	useEffect(() => {
		if (!error) return;
		const t = setTimeout(() => setError(null), 6000);
		return () => clearTimeout(t);
	}, [error]);

	const previewBody = useDeferredValue(draft.body);
	const previewTitle = useDeferredValue(draft.title);
	const onBodyChange = useCallback((body: string) => update({ body }), [update]);

	const editorPane = (
		<div className='h-full overflow-y-auto'>
			<div className='mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-10'>
				<AutoGrowTitle value={draft.title} onChange={updateTitle} />
				{mode === "visual" ? (
					<VisualEditor
						markdown={draft.body}
						onChange={onBodyChange}
						onUploadImage={uploadImage}
						onError={setError}
					/>
				) : (
					<MarkdownEditor value={draft.body} onChange={onBodyChange} />
				)}
			</div>
		</div>
	);

	return (
		<div className='flex h-screen flex-col'>
			<header className='flex items-center gap-3 border-b border-olive-200 px-4 py-2.5 dark:border-olive-800'>
				<Link href='/admin' onClick={() => void flush()} aria-label='Back to articles' className='rounded p-1 hover:bg-olive-100 dark:hover:bg-olive-900'>
					<ArrowLeft className='size-4' />
				</Link>
				<StatusBadge status={article.status} />
				<SaveIndicator state={saveState} />
				{article.publishError && (
					<span className='truncate text-xs text-red-600' title={article.publishError}>
						Scheduled publish failed: {article.publishError}
					</span>
				)}

				<div className='ml-auto flex items-center gap-2'>
					<div className='flex rounded-lg bg-olive-100 p-0.5 text-xs dark:bg-olive-900'>
						{(["visual", "markdown"] as const).map((m) => (
							<button
								key={m}
								type='button'
								onClick={() => changeMode(m)}
								className={`rounded-md px-2.5 py-1 capitalize ${
									mode === m ? "bg-olive-50 font-medium shadow-sm dark:bg-olive-800" : "text-olive-500"
								}`}>
								{m}
							</button>
						))}
					</div>
					<IconToggle label='Toggle preview' active={showPreview} onClick={() => setShowPreview((p) => !p)}>
						<Columns2 className='size-4' />
					</IconToggle>
					<IconToggle label='Article settings' active={showSettings} onClick={() => setShowSettings((s) => !s)}>
						<Settings2 className='size-4' />
					</IconToggle>
					<PublishControls
						article={article}
						flush={flush}
						hasLocalChanges={saveState !== "saved"}
						onError={setError}
					/>
				</div>
			</header>

			<div className='min-h-0 flex-1'>
				{showPreview ? (
					<PanelGroup direction='horizontal' autoSaveId='article-editor'>
						<Panel defaultSize={50} minSize={30}>
							{editorPane}
						</Panel>
						<PanelResizeHandle className='w-px bg-olive-200 transition-colors hover:bg-olive-400 dark:bg-olive-800' />
						<Panel defaultSize={50} minSize={25}>
							<Preview title={previewTitle} body={previewBody} />
						</Panel>
					</PanelGroup>
				) : (
					editorPane
				)}
			</div>

			{showSettings && (
				<SettingsPanel
					articleId={article._id}
					draft={draft}
					liveSlug={article.live?.slug}
					savedSlug={article.slug}
					ogImageUrl={article.ogImageUrl}
					onChange={updateSettings}
					onClose={() => setShowSettings(false)}
					onError={setError}
				/>
			)}

			{error && (
				<div role='alert' className='fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg'>
					{error}
				</div>
			)}
		</div>
	);
}

/** Same markup and styles as the public article page. */
function Preview({ title, body }: { title: string; body: string }) {
	return (
		<div className='h-full overflow-y-auto bg-olive-50 dark:bg-olive-950'>
			<div className='mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10'>
				<p className='text-xs font-mono uppercase text-olive-400'>Preview</p>
				<h1 className='font-serif italic text-olive-800 dark:text-olive-100 text-4xl w-full'>
					{title || "Untitled"}
				</h1>
				<article className='w-full'>
					<ArticleBody markdown={body} />
				</article>
			</div>
		</div>
	);
}

function AutoGrowTitle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	const ref = useRef<HTMLTextAreaElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	}, [value]);
	return (
		<textarea
			ref={ref}
			rows={1}
			value={value}
			onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
			placeholder='Title'
			aria-label='Title'
			className='w-full resize-none overflow-hidden bg-transparent font-serif text-4xl italic outline-none placeholder:text-olive-300 dark:placeholder:text-olive-700'
		/>
	);
}

function SaveIndicator({ state }: { state: SaveState }) {
	const label = { saved: "Saved", unsaved: "Unsaved changes", saving: "Saving…", error: "Not saved" }[state];
	return <span className={`text-xs ${state === "error" ? "text-red-600" : "text-olive-500"}`}>{label}</span>;
}

function IconToggle({
	label,
	active,
	onClick,
	children,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type='button'
			aria-label={label}
			aria-pressed={active}
			title={label}
			onClick={onClick}
			className={`rounded-lg p-1.5 ${active ? "bg-olive-200 dark:bg-olive-800" : "text-olive-500 hover:bg-olive-100 dark:hover:bg-olive-900"}`}>
			{children}
		</button>
	);
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
	return <div className='flex min-h-screen items-center justify-center text-sm text-olive-500'>{children}</div>;
}

function toDraft(article: Article): ArticleDraft {
	return {
		title: article.title,
		description: article.description,
		body: article.body,
		slug: article.slug,
		seoTitle: article.seoTitle ?? "",
		keywords: article.keywords,
		canonicalUrl: article.canonicalUrl ?? "",
		author: article.author,
		publishedAt: article.publishedAt,
	};
}
