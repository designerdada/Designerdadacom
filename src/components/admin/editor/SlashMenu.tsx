"use client";

import type { Editor, Range } from "@tiptap/core";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { SlashItem } from "./slash-items";

export interface SlashMenuProps {
	items: SlashItem[];
	editor: Editor;
	range: Range;
}

export interface SlashMenuHandle {
	onKeyDown: (event: KeyboardEvent) => boolean;
}

export const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>(function SlashMenu(
	{ items, editor, range },
	ref,
) {
	const [selected, setSelected] = useState(0);
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => setSelected(0), [items]);
	useEffect(() => {
		listRef.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" });
	}, [selected]);

	const choose = (index: number) => items[index]?.run(editor, range);

	useImperativeHandle(ref, () => ({
		onKeyDown(event) {
			if (items.length === 0) return false;
			if (event.key === "ArrowDown") {
				setSelected((s) => (s + 1) % items.length);
				return true;
			}
			if (event.key === "ArrowUp") {
				setSelected((s) => (s - 1 + items.length) % items.length);
				return true;
			}
			if (event.key === "Enter" || event.key === "Tab") {
				choose(selected);
				return true;
			}
			return false;
		},
	}));

	return (
		<div
			ref={listRef}
			role='listbox'
			className='max-h-80 w-64 overflow-y-auto rounded-xl border border-olive-200 bg-olive-50 p-1 shadow-lg dark:border-olive-700 dark:bg-olive-900'>
			{items.length === 0 ? (
				<p className='px-3 py-2 text-sm text-olive-500'>No matching blocks</p>
			) : (
				items.map((item, index) => (
					<button
						key={item.title}
						type='button'
						role='option'
						aria-selected={index === selected}
						data-index={index}
						onMouseEnter={() => setSelected(index)}
						onMouseDown={(e) => {
							e.preventDefault();
							choose(index);
						}}
						className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left ${
							index === selected ? "bg-olive-200/70 dark:bg-olive-800" : ""
						}`}>
						<span className='flex size-8 shrink-0 items-center justify-center rounded-md border border-olive-200 bg-white dark:border-olive-700 dark:bg-olive-950'>
							<item.icon className='size-4' strokeWidth={1.75} />
						</span>
						<span className='flex min-w-0 flex-col'>
							<span className='text-sm font-medium'>{item.title}</span>
							<span className='truncate text-xs text-olive-500'>{item.description}</span>
						</span>
					</button>
				))
			)}
		</div>
	);
});
