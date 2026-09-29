"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { useSpringPosition } from "@/lib/useSpringPosition";

const WIDTH = 240;
const PADDING = 4;
const DEFAULT_RATIO = 1.91; // Open Graph's 1200×630
const MIN_RATIO = 0.8; // Taller images are letterboxed instead of making a very tall card
const CURSOR_OFFSET = 28;
const EDGE = 16;

function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(false);
	useEffect(() => {
		const media = window.matchMedia(query);
		const update = () => setMatches(media.matches);
		update();
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, [query]);
	return matches;
}

/**
 * Loads and decodes every preview once the page is idle, so the first hover never waits on the network.
 * Returns each image's aspect ratio (0 when it failed to load).
 */
function usePreloadedImages(previews: Record<string, string>, enabled: boolean) {
	const [ready, setReady] = useState(false);
	const [ratios, setRatios] = useState<Record<string, number>>({});

	useEffect(() => {
		if (!enabled) return;
		let cancelled = false;
		const start = () => {
			setReady(true);
			for (const src of new Set(Object.values(previews))) {
				const image = new Image();
				image.referrerPolicy = "no-referrer";
				image.src = src;
				image
					.decode()
					.then(() => image.naturalWidth / image.naturalHeight)
					.catch(() => 0)
					.then((ratio) => !cancelled && setRatios((current) => ({ ...current, [src]: ratio })));
			}
		};
		if ("requestIdleCallback" in window) {
			const id = requestIdleCallback(start, { timeout: 2000 });
			return () => {
				cancelled = true;
				cancelIdleCallback(id);
			};
		}
		const id = setTimeout(start, 300);
		return () => {
			cancelled = true;
			clearTimeout(id);
		};
	}, [previews, enabled]);

	return { ready, ratios };
}

function imageHeight(ratio: number | undefined) {
	return Math.round((WIDTH - PADDING * 2) / Math.max(ratio || DEFAULT_RATIO, MIN_RATIO));
}

/**
 * Hover state for a list of links with one shared preview card. On wide windows the card sits beside
 * the list, lines up with the hovered row and slides between rows; where there is no room for that,
 * it follows the cursor instead. Rows need `data-preview-url`.
 */
export function useLinkPreview(previews: Record<string, string>) {
	const listRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const enabled = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 768px)");
	const mode = useMediaQuery("(min-width: 1152px)") ? "beside" : "cursor";
	const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
	const { jump, moveTo } = useSpringPosition(cardRef, reduceMotion);
	const { ready, ratios } = usePreloadedImages(previews, enabled);
	const [hovered, setHovered] = useState<string | null>(null);
	const pointer = useRef<{ x: number; y: number } | null>(null);
	const visible = useRef(false);

	const heightFor = useCallback((url: string | null) => imageHeight(url ? ratios[previews[url]] : undefined), [
		ratios,
		previews,
	]);
	const src = hovered ? previews[hovered] : undefined;
	const active = enabled && src && ratios[src] !== 0 ? hovered : null;
	const height = heightFor(hovered);

	// Keep the last image and size while the card fades out, instead of blanking it first.
	const [shown, setShown] = useState<{ url: string; height: number } | null>(null);
	if (active && (active !== shown?.url || height !== shown.height)) setShown({ url: active, height });

	// Beside mode: line up with the hovered row.
	useLayoutEffect(() => {
		if (!active) {
			visible.current = false;
			return;
		}
		if (mode === "cursor") {
			visible.current = true;
			return;
		}
		const list = listRef.current;
		const row = list?.querySelector<HTMLElement>(`[data-preview-url="${CSS.escape(active)}"]`);
		if (!list || !row) return;
		const rowRect = row.getBoundingClientRect();
		const y = rowRect.top - list.getBoundingClientRect().top + rowRect.height / 2 - (height + PADDING * 2) / 2;
		// A hidden card appears next to its row instead of sliding in from the last one.
		(visible.current ? moveTo : jump)(0, y);
		visible.current = true;
	}, [active, height, mode, jump, moveTo]);

	// Cursor mode: beside the pointer, flipped to its left near the window edge.
	const followCursor = useCallback(
		(clientX: number, clientY: number, url: string | null) => {
			if (mode !== "cursor") return;
			const cardHeight = heightFor(url) + PADDING * 2;
			const flip = clientX + CURSOR_OFFSET + WIDTH > window.innerWidth - EDGE;
			const x = flip ? clientX - CURSOR_OFFSET - WIDTH : clientX + CURSOR_OFFSET;
			const y = Math.min(Math.max(clientY - cardHeight / 2, EDGE), window.innerHeight - cardHeight - EDGE);
			// A hidden card appears at the cursor instead of flying in from its last spot.
			(visible.current ? moveTo : jump)(x, y);
		},
		[mode, heightFor, jump, moveTo],
	);

	const onRowEnter = useCallback(
		(url: string, event: PointerEvent) => {
			if (event.pointerType !== "mouse") return;
			followCursor(event.clientX, event.clientY, url);
			setHovered(url);
		},
		[followCursor],
	);

	const onListMove = useCallback(
		(event: PointerEvent) => {
			if (event.pointerType !== "mouse") return;
			pointer.current = { x: event.clientX, y: event.clientY };
			followCursor(event.clientX, event.clientY, hovered);
		},
		[followCursor, hovered],
	);

	const onListLeave = useCallback(() => {
		pointer.current = null;
		setHovered(null);
	}, []);

	// Scrolling moves rows under a still cursor, so pick the row that is under it now.
	useEffect(() => {
		let frame = 0;
		const onScroll = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const point = pointer.current;
				if (!point) return;
				const row = document.elementFromPoint(point.x, point.y)?.closest<HTMLElement>("[data-preview-url]");
				setHovered(row?.dataset.previewUrl ?? null);
			});
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", onScroll);
		};
	}, []);

	return { listRef, cardRef, enabled, mode, ready, active, shown, hovered, onRowEnter, onListMove, onListLeave };
}

/**
 * Render inside the list's positioned container. Beside the list it is positioned in there; when it
 * follows the cursor it is portaled to <body>, because animated ancestors would break `position: fixed`.
 */
export function LinkPreviewCard({
	previews,
	preview,
}: {
	previews: Record<string, string>;
	preview: ReturnType<typeof useLinkPreview>;
}) {
	const { cardRef, enabled, mode, ready, active, shown } = preview;
	if (!enabled) return null;

	const card = (
		<div
			ref={cardRef}
			aria-hidden
			className={`pointer-events-none z-50 ${
				mode === "beside" ? "absolute top-0 right-full mr-6" : "fixed top-0 left-0"
			}`}
			style={{ width: WIDTH }}>
			<div
				className={`${mode === "beside" ? "origin-right" : "origin-center"} rounded-xl bg-olive-50 dark:bg-olive-900 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_8px_24px_-6px_rgb(0_0_0/0.18)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_8px_24px_-6px_rgb(0_0_0/0.5)] transition-[opacity,scale,filter,height] duration-300 ease-out motion-reduce:transition-opacity motion-reduce:scale-100 motion-reduce:blur-none ${
					active ? "opacity-100 scale-100 blur-none" : "opacity-0 scale-95 blur-[6px] duration-150"
				}`}
				style={{ padding: PADDING, height: (shown?.height ?? 0) + PADDING * 2 }}>
				<div className='relative size-full overflow-hidden rounded-lg bg-olive-100 dark:bg-olive-800'>
					{ready &&
						Object.entries(previews).map(([url, src]) => (
							<img
								key={url}
								src={src}
								alt=''
								referrerPolicy='no-referrer'
								decoding='async'
								className='absolute inset-0 size-full object-contain transition-opacity duration-150'
								style={{ opacity: url === shown?.url ? 1 : 0 }}
							/>
						))}
				</div>
			</div>
		</div>
	);
	return mode === "beside" ? card : createPortal(card, document.body);
}
