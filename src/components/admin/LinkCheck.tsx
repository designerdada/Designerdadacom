"use client";

import { AlertTriangle, ImageOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { getDomain, getFaviconUrl } from "@/lib/favicon";
import type { Inspection } from "./useLinkInspection";

/**
 * How the pasted link will look: favicon, name, domain and preview image, plus any problem found
 * while checking it.
 */
export function LinkCheck({
	url,
	name,
	image,
	inspection,
}: {
	url: string;
	name: string;
	image?: string;
	inspection: Inspection;
}) {
	const [failedImage, setFailedImage] = useState<string | null>(null);
	const [failedFavicon, setFailedFavicon] = useState<string | null>(null);
	const favicon = getFaviconUrl(url);
	const loading = inspection.status === "loading";
	const details = inspection.status === "done" ? inspection.details : null;

	const warning =
		inspection.status === "error"
			? "Couldn't check this link. Fill in the details yourself."
			: details && !details.reachable
				? "This site didn't let us load the page, so open the link to make sure it's right."
				: null;

	return (
		<div className='flex flex-col gap-3 rounded-lg bg-olive-100/70 p-3 dark:bg-olive-900/60'>
			<div className='flex items-center gap-3'>
				<div className='flex size-8 shrink-0 items-center justify-center rounded-md bg-olive-50 dark:bg-olive-800'>
					{failedFavicon === favicon ? (
						<ImageOff className='size-4 text-olive-400' />
					) : (
						<img
							src={favicon}
							alt=''
							className='size-5'
							onError={() => setFailedFavicon(favicon)}
						/>
					)}
				</div>
				<div className='flex min-w-0 flex-1 flex-col'>
					<span className='truncate text-sm font-semibold'>
						{name || (loading ? "Checking link…" : "No name found")}
					</span>
					<a
						href={url}
						target='_blank'
						rel='noreferrer'
						className='truncate font-mono text-xs text-olive-500 hover:underline'>
						{getDomain(url)} ↗
					</a>
				</div>
				{loading && <Loader2 className='size-4 shrink-0 animate-spin text-olive-400' />}
			</div>

			{image && failedImage !== image ? (
				<img
					src={image}
					alt=''
					referrerPolicy='no-referrer'
					onError={() => setFailedImage(image)}
					className='block h-auto max-h-72 w-full rounded-md bg-olive-50 object-contain dark:bg-olive-950'
				/>
			) : (
				!loading && (
					<p className='flex items-center gap-2 rounded-md border border-dashed border-olive-300 px-3 py-4 text-xs text-olive-500 dark:border-olive-700'>
						<ImageOff className='size-4 shrink-0' />
						{image
							? "This preview image didn't load. Paste a different one below."
							: "No preview image found, so nothing will show on hover. Paste one below if you like."}
					</p>
				)
			)}

			{warning && (
				<p className='flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400'>
					<AlertTriangle className='size-4 shrink-0' />
					{warning}
				</p>
			)}
		</div>
	);
}
