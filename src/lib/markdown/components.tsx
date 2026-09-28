import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import { toCalloutType, type CalloutType } from "./remark-custom-blocks";

interface ComponentProps {
	children?: ReactNode;
}

interface LinkProps extends ComponentProps {
	href?: string;
}

interface ImageProps {
	src?: string | Blob;
	alt?: string;
	title?: string;
}

// Headings
export const H1 = ({ children }: ComponentProps) => (
	<h1 className='font-medium text-olive-800 dark:text-olive-100 text-xl text-justify w-full pb-4 pt-2'>
		{children}
	</h1>
);

export const H2 = ({ children }: ComponentProps) => (
	<h2 className='font-semibold text-olive-800 dark:text-olive-100 text-xl text-justify w-full pb-3 pt-6'>
		{children}
	</h2>
);

export const H3 = ({ children }: ComponentProps) => (
	<h3 className='font-semibold text-olive-800 dark:text-olive-100 text-2xl text-justify w-full pb-2 pt-4'>
		{children}
	</h3>
);

// Paragraph (the drop cap on the first paragraph is pure CSS, see `.article-body` in globals.css)
export const P = ({ children }: ComponentProps) => (
	<p className='font-normal text-olive-800 dark:text-olive-100 text-base text-justify w-full pb-4'>
		{children}
	</p>
);

// Lists
export const UL = ({ children }: ComponentProps) => (
	<ul className='font-normal leading-none text-olive-800 dark:text-olive-100 text-base text-justify w-full list-disc pl-6 pb-4'>
		{children}
	</ul>
);

export const OL = ({ children }: ComponentProps) => (
	<ol className='font-normal leading-none list-decimal text-olive-800 dark:text-olive-100 text-base text-justify w-full pl-6 pb-4'>
		{children}
	</ol>
);

export const LI = ({ children }: ComponentProps) => (
	<li className='mb-2 last:mb-0'>
		<span>{children}</span>
	</li>
);

// Horizontal Rule
export const HR = () => (
	<div className='h-8 relative shrink-0 w-full my-4'>
		<svg className='block size-full' fill='none' preserveAspectRatio='none' viewBox='0 0 512 32'>
			<line className='stroke-olive-200 dark:stroke-olive-800' x2='512' y1='15.5' y2='15.5' />
		</svg>
	</div>
);

// Blockquote
export const Blockquote = ({ children }: ComponentProps) => (
	<div className='flex flex-col gap-1 items-start justify-center pl-4 pr-0 py-2 relative shrink-0 w-full border-l-4 border-yellow-300 dark:border-olive-100 my-4'>
		<blockquote className='font-serif relative shrink-0 text-olive-800 dark:text-olive-100 w-full text-xl [&>div]:pb-0 [&>div]:pt-0 [&_p]:italic [&_p]:text-xl [&_p:only-child]:pb-0'>
			{children}
		</blockquote>
	</div>
);

// Link
export const A = ({ href, children }: LinkProps) => (
	<a
		href={href}
		className='[text-underline-position:from-font] decoration-solid font-medium italic underline underline-offset-4 hover:opacity-70 transition-opacity'
		target={href?.startsWith("http") ? "_blank" : undefined}
		rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
		{children}
	</a>
);

// Strong/Bold
export const Strong = ({ children }: ComponentProps) => (
	<strong className='font-semibold'>{children}</strong>
);

// Em/Italic
export const Em = ({ children }: ComponentProps) => <em className='italic'>{children}</em>;

// Code
export const Code = ({ children }: ComponentProps) => (
	<code className='bg-olive-100 dark:bg-olive-900 px-1.5 py-0.5 rounded text-sm'>{children}</code>
);

// Pre (code block)
export const Pre = ({ children }: ComponentProps) => (
	<pre className='bg-olive-100 dark:bg-olive-900 p-4 rounded overflow-x-auto text-sm mb-4 w-full [&>code]:bg-transparent [&>code]:p-0'>
		{children}
	</pre>
);

// Image with optional caption (from the Markdown title: ![alt](src "caption")).
// Spans only, so it stays valid HTML when Markdown wraps the image in a <p>.
export const Img = ({ src, alt, title }: ImageProps) => (
	<span className='flex flex-col gap-2 items-start justify-center px-0 py-6 relative shrink-0 w-full'>
		<img
			src={typeof src === "string" ? src : undefined}
			alt={alt || ""}
			loading='lazy'
			className='w-full h-auto object-cover'
		/>
		{title && (
			<span className='block relative shrink-0 text-xs text-center text-olive-500 dark:text-olive-400 w-full'>
				{title}
			</span>
		)}
	</span>
);

// Tables (GFM)
export const Table = ({ children }: ComponentProps) => (
	<div className='w-full overflow-x-auto pb-4'>
		<table className='w-full border-collapse text-sm text-olive-800 dark:text-olive-100'>{children}</table>
	</div>
);

export const Th = ({ children }: ComponentProps) => (
	<th className='border-b border-olive-300 dark:border-olive-700 px-3 py-2 text-left font-semibold'>
		{children}
	</th>
);

export const Td = ({ children }: ComponentProps) => (
	<td className='border-b border-olive-200 dark:border-olive-800 px-3 py-2 align-top'>{children}</td>
);

// Callout (:::callout{type="note"})
const calloutStyles: Record<CalloutType, string> = {
	note: "border-olive-300 bg-olive-100 dark:border-olive-700 dark:bg-olive-900",
	tip: "border-lime-400 bg-lime-50 dark:border-lime-700 dark:bg-lime-950/40",
	warning: "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40",
};

export const Callout = ({ type, children }: ComponentProps & { type?: string }) => (
	<aside
		className={`w-full rounded-lg border px-4 pt-4 my-4 [&_p]:pb-4 ${calloutStyles[toCalloutType(type)]}`}>
		{children}
	</aside>
);

// YouTube (::youtube{id="VIDEO_ID"})
export const YouTube = ({ video }: { video?: string }) => (
	<div className='flex items-start justify-center px-0 py-6 relative shrink-0 w-full'>
		<div className='relative w-full aspect-video'>
			<iframe
				src={`https://www.youtube-nocookie.com/embed/${video}`}
				title='YouTube video player'
				allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
				allowFullScreen
				loading='lazy'
				className='absolute inset-0 w-full h-full rounded-lg border-0'
			/>
		</div>
	</div>
);

export const markdownComponents = {
	h1: H1,
	h2: H2,
	h3: H3,
	p: P,
	ul: UL,
	ol: OL,
	li: LI,
	hr: HR,
	blockquote: Blockquote,
	a: A,
	strong: Strong,
	em: Em,
	code: Code,
	pre: Pre,
	img: Img,
	table: Table,
	th: Th,
	td: Td,
	callout: Callout,
	youtube: YouTube,
} as Components;
