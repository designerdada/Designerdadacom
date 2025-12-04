import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { sortedArticles } from '../data/articles';
import { articleContents } from '../data/articleContent';
import { markdownComponents, resetFirstParagraph } from '../components/MarkdownComponents';
import { useTheme } from '../hooks/useTheme';
import { Tooltip } from '../components/Tooltip';
// import { MailingList } from '../components/MailingList';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '../components/ui/breadcrumb';
import Moon from '../imports/Moon';
import Sun from '../imports/Sun';
function ArticleHeader({ title }: { title: string }) {
  return (
    <div className="content-stretch flex flex-col gap-1 items-start relative shrink-0 w-full">
      <h1 className="font-medium leading-[1.5] not-italic relative shrink-0 text-[var(--foreground)] text-[28px] w-full">
        {title}
      </h1>
    </div>
  );
}

function ColorDots() {
  return (
    <div className="box-border content-stretch flex gap-2 items-center justify-center px-0 py-2 relative shrink-0 w-full">
      <div className="relative shrink-0 size-2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="#E9573F" r="4" />
        </svg>
      </div>
      <div className="relative shrink-0 size-2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="#F0BF2E" r="4" />
        </svg>
      </div>
      <div className="relative shrink-0 size-2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="#4E964E" r="4" />
        </svg>
      </div>
    </div>
  );
}

function ReadMore({ currentSlug }: { currentSlug: string }) {
  const otherArticles = sortedArticles.filter(article => article.id !== currentSlug).slice(0, 5);
  
  if (otherArticles.length === 0) return null;

  return (
    <div className="content-stretch flex flex-col gap-4 items-end relative shrink-0 w-full">
      <div className="content-stretch flex gap-1 items-center relative shrink-0 w-full">
        <p className="font-medium leading-[1.4] not-italic relative shrink-0 text-gray-500 text-sm text-justify text-nowrap whitespace-pre">
          Further reading
        </p>
      </div>
      <div className="content-stretch flex flex-col gap-3 items-start relative shrink-0 w-full">
        {otherArticles.map((article) => (
          <Link
            key={article.id}
            to={`/writing/${article.id}`}
            className="content-stretch flex items-center justify-between leading-[1.4] not-italic relative shrink-0 text-justify text-nowrap w-full whitespace-pre hover:opacity-70 transition-opacity group"
          >
            <p className="font-medium relative shrink-0 text-[var(--foreground)] text-base group-hover:underline underline-offset-4">
              {article.title}
            </p>
            <p className="relative shrink-0 text-sm text-[var(--muted)]">
              {article.date}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  const { toggleTheme, theme } = useTheme();

  return (
    <div className="content-stretch flex flex-col gap-4 items-center justify-center relative shrink-0 w-full">
      <div className="h-6 relative shrink-0 w-[91px]">
        <img alt="designerdada.com" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src="/assets/footer-signature.png" />
      </div>
      <div className="content-stretch flex gap-4 items-center relative shrink-0">
        <Link 
          to="/writing" 
          className="font-normal leading-[1.4] not-italic relative shrink-0 text-gray-500 hover:text-[var(--foreground)] text-[14px] text-justify text-nowrap whitespace-pre hover:underline underline-offset-4 transition-all"
        >
          Writing
        </Link>
        <Link
          to="/favorites"
          className="font-normal leading-[1.4] not-italic relative shrink-0 text-gray-500 hover:text-[var(--foreground)] text-[14px] text-justify text-nowrap whitespace-pre hover:underline underline-offset-4 transition-all"
        >
          Favorites
        </Link>
        <Tooltip content={theme === 'dark' ? 'Delight' : 'Go Dark'}>
          <button
            onClick={toggleTheme}
            className="group relative cursor-pointer bg-transparent border-none p-0 transition-all duration-200 text-gray-500 hover:text-[var(--foreground)] flex items-center"
            aria-label="Toggle dark mode"
          >
            <div className="size-4">
              {theme === 'dark' ? <Sun /> : <Moon />}
            </div>
          </button>
        </Tooltip>
      </div>
      <div className="content-stretch flex gap-1 items-center relative shrink-0 w-full">
        <p className="basis-0 font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-xs text-center text-[var(--muted)]">
          This site template is open sourced and available on{' '}
          <a
            href="https://github.com/designerdada/Designerdadacom"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-[var(--foreground)] transition-colors"
          >
            GitHub
          </a>.
        </p>
      </div>
    </div>
  );
}

export function WritingDetail() {
  const { id } = useParams<{ id: string }>();
  const [isPrerendered, setIsPrerendered] = useState(false);

  // Check if content is prerendered (to skip animations on hydration)
  useEffect(() => {
    const root = document.getElementById('root');
    if (root?.hasAttribute('data-prerendered')) {
      setIsPrerendered(true);
      // Remove attribute so subsequent navigations work normally
      root.removeAttribute('data-prerendered');
    }
  }, []);

  // Reset drop cap tracker when component mounts or id changes
  useEffect(() => {
    resetFirstParagraph();
  }, [id]);

  if (!id || !articleContents[id]) {
    return <Navigate to="/writing" replace />;
  }

  const articleData = articleContents[id];
  const canonicalUrl = `https://designerdada.com/writing/${id}`;
  const ogImage = articleData.metadata.ogImage || 'https://designerdada.com/media/og-images/og-default.jpg';
  const publishDate = articleData.metadata.publishDate;
  const modifiedDate = articleData.metadata.modifiedDate || publishDate;

  // Skip animations if content is prerendered to avoid flicker
  const animateClass = (delay?: string) => isPrerendered ? '' : `animate-in ${delay || ''}`;

  // JSON-LD structured data for Article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": articleData.metadata.title,
    "description": articleData.metadata.description,
    "image": ogImage,
    "datePublished": publishDate,
    "dateModified": modifiedDate,
    "author": {
      "@type": "Person",
      "name": articleData.metadata.author || "Akash Bhadange",
      "url": "https://designerdada.com"
    },
    "publisher": {
      "@type": "Person",
      "name": "Akash Bhadange",
      "url": "https://designerdada.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "keywords": articleData.metadata.keywords || ""
  };

  return (
    <>
      <Helmet>
        <title>{articleData.metadata.title} | Akash Bhadange</title>
        <meta name="description" content={articleData.metadata.description} />
        <meta name="author" content={articleData.metadata.author || 'Akash Bhadange'} />
        {articleData.metadata.keywords && <meta name="keywords" content={articleData.metadata.keywords} />}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={articleData.metadata.title} />
        <meta property="og:description" content={articleData.metadata.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Akash Bhadange" />
        <meta property="og:image" content={ogImage} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@designerdada" />
        <meta name="twitter:creator" content="@designerdada" />
        <meta name="twitter:title" content={articleData.metadata.title} />
        <meta name="twitter:description" content={articleData.metadata.description} />
        <meta name="twitter:image" content={ogImage} />
        
        {/* Article specific */}
        <meta property="article:published_time" content={publishDate} />
        <meta property="article:modified_time" content={modifiedDate} />
        <meta property="article:author" content={articleData.metadata.author || 'Akash Bhadange'} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(articleJsonLd)}
        </script>
      </Helmet>
      <div className="bg-[var(--background)] relative size-full min-h-screen">
        <div className="box-border content-stretch flex flex-col gap-6 items-start mx-auto px-4 py-10 w-full max-w-[544px]">
          {/* Breadcrumb */}
          <div className={`${animateClass()} w-full`}>
            <Breadcrumb>
              <BreadcrumbList className="gap-2">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="flex gap-2 items-center">
                      <div className="relative rounded-full shrink-0 size-6">
                        <img
                          alt="Akash Bhadange"
                          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-full size-full"
                          src="/assets/profile.png"
                        />
                      </div>
                      <span className="leading-[1.4] text-[14px]">Akash Bhadange</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <span className="leading-[1.4] text-[12px] text-gray-500">/</span>
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/writing" className="leading-[1.4] text-[14px]">Writing</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <span className="leading-[1.4] text-[12px] text-gray-500">/</span>
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="leading-[1.4] text-[14px]">{articleData.metadata.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className={`${animateClass('animate-delay-1')} w-full`}>
            <ArticleHeader
              title={articleData.metadata.title}
            />
          </div>

          {/* Article Content */}
          <div className={`content-stretch flex flex-col items-start relative shrink-0 w-full ${animateClass('animate-delay-2')}`}>
            <ReactMarkdown components={markdownComponents}>
              {articleData.content}
            </ReactMarkdown>
          </div>

          <div className={`${animateClass('animate-delay-3')} w-full`}>
            <ColorDots />
          </div>
          <div className={`${animateClass('animate-delay-4')} w-full`}>
            <ReadMore currentSlug={id} />
          </div>
          <div className={`${animateClass('animate-delay-5')} w-full`}>
            <ColorDots />
          </div>
          {/* <MailingList /> */}
          {/* <ColorDots /> */}
          <div className={`${animateClass('animate-delay-6')} w-full`}>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}