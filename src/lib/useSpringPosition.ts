"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

const STIFFNESS = 500;
const DAMPING = 40;
const MASS = 0.6;
const MAX_STEP = 1 / 120;

/**
 * Moves an element toward a target position on a spring, writing `transform` directly (no re-renders).
 * `jump` places it immediately, e.g. when it first appears.
 */
export function useSpringPosition(ref: RefObject<HTMLElement | null>, instant: boolean) {
	const state = useRef({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, frame: 0, last: 0 });

	const write = useCallback(() => {
		const s = state.current;
		if (ref.current) ref.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
	}, [ref]);

	const tick = useCallback(
		(now: number) => {
			const s = state.current;
			let dt = Math.min((now - s.last) / 1000, 1 / 30);
			s.last = now;
			while (dt > 0) {
				const step = Math.min(dt, MAX_STEP);
				s.vx += ((-STIFFNESS * (s.x - s.tx) - DAMPING * s.vx) / MASS) * step;
				s.vy += ((-STIFFNESS * (s.y - s.ty) - DAMPING * s.vy) / MASS) * step;
				s.x += s.vx * step;
				s.y += s.vy * step;
				dt -= step;
			}
			const settled =
				Math.abs(s.x - s.tx) < 0.1 && Math.abs(s.y - s.ty) < 0.1 && Math.abs(s.vx) + Math.abs(s.vy) < 1;
			if (settled) {
				s.x = s.tx;
				s.y = s.ty;
				s.vx = s.vy = 0;
				s.frame = 0;
			} else {
				s.frame = requestAnimationFrame(tick);
			}
			write();
		},
		[write],
	);

	const jump = useCallback(
		(x: number, y: number) => {
			const s = state.current;
			cancelAnimationFrame(s.frame);
			Object.assign(s, { x, y, tx: x, ty: y, vx: 0, vy: 0, frame: 0 });
			write();
		},
		[write],
	);

	const moveTo = useCallback(
		(x: number, y: number) => {
			if (instant) return jump(x, y);
			const s = state.current;
			s.tx = x;
			s.ty = y;
			if (!s.frame) {
				s.last = performance.now();
				s.frame = requestAnimationFrame(tick);
			}
		},
		[instant, jump, tick],
	);

	useEffect(() => () => cancelAnimationFrame(state.current.frame), []);

	return { jump, moveTo };
}
