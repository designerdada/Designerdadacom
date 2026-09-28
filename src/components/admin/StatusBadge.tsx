const STYLES = {
	draft: "bg-olive-200 text-olive-700 dark:bg-olive-800 dark:text-olive-300",
	scheduled: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
	published: "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300",
} as const;

export function StatusBadge({ status }: { status: keyof typeof STYLES }) {
	return (
		<span className={`rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${STYLES[status]}`}>
			{status}
		</span>
	);
}
