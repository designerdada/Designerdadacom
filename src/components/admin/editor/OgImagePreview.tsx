"use client";

import { useEffect, useRef, useState } from "react";
import { ArticleOgImage, OG_SIZE } from "@/lib/og/ArticleOgImage";

/** The generated OG card rendered live in the DOM (same component as /og/[slug]), scaled to fit. */
export function OgImagePreview({ title, description }: { title: string; description: string }) {
	const ref = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / OG_SIZE.width));
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={ref} className='relative aspect-[1200/630] w-full overflow-hidden' aria-label='Generated social image preview'>
			<div
				className='absolute left-0 top-0 origin-top-left'
				style={{ transform: `scale(${scale})`, visibility: scale ? "visible" : "hidden" }}>
				<ArticleOgImage title={title} description={description} avatarSrc='/assets/og-avatar.png' />
			</div>
		</div>
	);
}
