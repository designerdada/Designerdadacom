import { ReactNode } from 'react';

interface ComponentProps {
  children?: ReactNode;
}

interface ParagraphProps extends ComponentProps {
  node?: any;
}

interface LinkProps extends ComponentProps {
  href?: string;
}

interface ImageProps {
  src?: string;
  alt?: string;
  title?: string;
}

// Track first paragraph
let paragraphCount = 0;

export const resetFirstParagraph = () => {
  paragraphCount = 0;
};

// Headings
export const H1 = ({ children }: ComponentProps) => (
  <h1 className="font-medium leading-[1.4] not-italic text-[var(--foreground)] text-[22px] text-justify w-full pb-4 pt-2">
    {children}
  </h1>
);

export const H2 = ({ children }: ComponentProps) => (
  <h2 className="font-semibold leading-[1.5] not-italic text-[var(--foreground)] text-[22px] text-justify w-full pb-3 pt-6">
    {children}
  </h2>
);

export const H3 = ({ children }: ComponentProps) => (
  <h3 className="font-semibold leading-[1.45] not-italic text-[var(--foreground)] text-[20px] text-justify w-full pb-2 pt-4">
    {children}
  </h3>
);

// Paragraph with drop cap support
export const P = ({ children }: ParagraphProps) => {
  const isFirstPara = paragraphCount === 0;
  paragraphCount++;
  
  if (isFirstPara && children) {
    // Extract first letter and rest of content
    const processChildren = (child: any): any => {
      if (typeof child === 'string' && child.trim().length > 0) {
        const firstLetter = child.charAt(0);
        const rest = child.slice(1);
        return (
          <>
            <span className="float-left text-5xl leading-none font-medium mr-1 -mt-1 text-[var(--foreground)]">
              {firstLetter}
            </span>
            {rest}
          </>
        );
      }
      return child;
    };

    // Process children to find first text node
    let processed = false;
    const processedChildren = Array.isArray(children) 
      ? children.map((child, index) => {
          if (!processed && typeof child === 'string' && child.trim().length > 0) {
            processed = true;
            return processChildren(child);
          }
          return child;
        })
      : typeof children === 'string' 
        ? processChildren(children)
        : children;

    return (
      <p className="font-normal leading-[1.4] not-italic text-[var(--foreground)] text-base text-justify w-full pb-4">
        {processedChildren}
      </p>
    );
  }

  return (
    <p className="font-normal leading-[1.4] not-italic text-[var(--foreground)] text-base text-justify w-full pb-4">
      {children}
    </p>
  );
};

// Lists
export const UL = ({ children }: ComponentProps) => (
  <ul className="font-normal leading-[0] not-italic text-[var(--foreground)] text-base text-justify w-full list-disc pl-6 pb-4">
    {children}
  </ul>
);

export const OL = ({ children }: ComponentProps) => (
  <ol className="font-normal leading-[0] list-decimal not-italic text-[var(--foreground)] text-base text-justify w-full pl-6 pb-4">
    {children}
  </ol>
);

export const LI = ({ children }: ComponentProps) => (
  <li className="mb-2 last:mb-0">
    <span className="leading-[1.4]">{children}</span>
  </li>
);

// Horizontal Rule
export const HR = () => (
  <div className="h-8 relative shrink-0 w-full my-4">
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 512 32">
      <line stroke="var(--border)" x2="512" y1="15.5" y2="15.5" />
    </svg>
  </div>
);

// Blockquote
export const Blockquote = ({ children }: ComponentProps) => (
  <div className="box-border content-stretch flex flex-col gap-1 items-start justify-center pl-4 pr-0 py-2 relative shrink-0 w-full border-l-4 border-[var(--foreground)] my-4">
    <blockquote className="italic leading-[1.5] relative shrink-0 text-[var(--foreground)] text-base w-full [&>div]:pb-0 [&>div]:pt-0 [&_p]:italic [&_p:only-child]:pb-0">
      {children}
    </blockquote>
  </div>
);

// Link
export const A = ({ href, children }: LinkProps) => (
  <a
    href={href}
    className="[text-underline-position:from-font] decoration-solid font-medium italic underline underline-offset-4 hover:opacity-70 transition-opacity"
    target={href?.startsWith('http') ? '_blank' : undefined}
    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
  >
    {children}
  </a>
);

// Strong/Bold
export const Strong = ({ children }: ComponentProps) => (
  <strong className="font-semibold">{children}</strong>
);

// Em/Italic
export const Em = ({ children }: ComponentProps) => (
  <em className="italic">{children}</em>
);

// Code
export const Code = ({ children }: ComponentProps) => (
  <code className="bg-[var(--accent)] px-1.5 py-0.5 rounded text-sm">
    {children}
  </code>
);

// Pre (code block)
export const Pre = ({ children }: ComponentProps) => (
  <pre className="bg-[var(--accent)] p-4 rounded overflow-x-auto text-sm mb-4">
    {children}
  </pre>
);

// Image
export const Img = ({ src, alt, title }: ImageProps) => (
  <div className="box-border content-stretch flex flex-col gap-2 items-start justify-center px-0 py-6 relative shrink-0 w-full">
    <div className="relative shrink-0 w-full">
      <img src={src} alt={alt || ''} className="w-full h-auto object-cover" />
    </div>
    {title && (
      <p className="leading-[1.5] not-italic relative shrink-0 text-xs text-center text-[var(--muted)] w-full">
        {title}
      </p>
    )}
  </div>
);

// Iframe (for YouTube embeds, etc.)
interface IframeProps {
  src?: string;
  width?: string | number;
  height?: string | number;
  title?: string;
  allow?: string;
  allowFullScreen?: boolean;
  frameBorder?: string | number;
}

export const Iframe = ({ src, width, height, title, allow, allowFullScreen, frameBorder }: IframeProps) => {
  // Check if it's a YouTube embed
  const isYouTube = src?.includes('youtube.com') || src?.includes('youtu.be');

  return (
    <div className="box-border content-stretch flex items-start justify-center px-0 py-6 relative shrink-0 w-full">
      <div className="relative w-full" style={{ paddingBottom: isYouTube ? '56.25%' : '0', height: isYouTube ? '0' : 'auto' }}>
        <iframe
          src={src}
          width={isYouTube ? undefined : width}
          height={isYouTube ? undefined : height}
          title={title || 'Embedded content'}
          allow={allow || 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'}
          allowFullScreen={allowFullScreen !== false}
          frameBorder={frameBorder || '0'}
          className={isYouTube ? 'absolute top-0 left-0 w-full h-full rounded-lg' : 'w-full rounded-lg'}
          style={!isYouTube ? { maxWidth: '100%' } : undefined}
        />
      </div>
    </div>
  );
};

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
  iframe: Iframe,
};