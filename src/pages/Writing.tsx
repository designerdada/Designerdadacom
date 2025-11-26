import { Link } from 'react-router-dom';
import { sortedArticles } from '../data/articles';
import { useTheme } from '../hooks/useTheme';
import { Tooltip } from '../components/Tooltip';
import { MailingList } from '../components/MailingList';
import { Header } from '../components/Header';
import { Helmet } from 'react-helmet';
import Moon from '../imports/Moon';
import Sun from '../imports/Sun';
import imgAkashDpIndigo1 from 'figma:asset/d473e31c6d7da66b93f4778079bb0bf21a691da4.png';
import imgImage1 from 'figma:asset/6ecdfba3f00b0a9cd14b86fd7e537539b9517b3b.png';

function ArticleList() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Article List">
      {sortedArticles.map((article) => (
        <Link 
          key={article.id}
          to={`/writing/${article.id}`}
          className="content-stretch flex items-center justify-between leading-[1.4] not-italic relative shrink-0 text-justify text-nowrap w-full whitespace-pre hover:opacity-70 transition-opacity group"
        >
          <p className="font-medium relative shrink-0 text-[var(--foreground)] text-[16px] group-hover:underline underline-offset-4">{article.title}</p>
          <p className="relative shrink-0 text-[14px] text-[var(--muted)]">{article.date}</p>
        </Link>
      ))}
    </div>
  );
}

function ColorDots() {
  return (
    <div className="box-border content-stretch flex gap-[8px] items-center justify-center px-0 py-[8px] relative shrink-0 w-full">
      <div className="relative shrink-0 size-[8px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="#E9573F" id="Ellipse 1" r="4" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[8px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="#F0BF2E" id="Ellipse 2" r="4" />
        </svg>
      </div>
      <div className="relative shrink-0 size-[8px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="#4E964E" id="Ellipse 3" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Footer() {
  const { toggleTheme, theme } = useTheme();

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center relative shrink-0 w-full" data-name="Footer">
      <div className="h-[24px] relative shrink-0 w-[91px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Footer note">
        <p className="basis-0 font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[12px] text-center text-[var(--muted)]">
          This site template is open sourced and available on{' '}
          <a 
            href="https://github.com/designerdada/designerdada.com" 
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

export function Writing() {
  const { toggleTheme, theme } = useTheme();
  
  return (
    <>
      <Helmet>
        <title>Writing | Akash Bhadange</title>
        <meta name="description" content="Raw thoughts on design, building products, and the startup journey by Akash Bhadange." />
        <link rel="canonical" href="https://designerdada.com/writing" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Writing | Akash Bhadange" />
        <meta property="og:description" content="Raw thoughts on design, building products, and the startup journey by Akash Bhadange." />
        <meta property="og:url" content="https://designerdada.com/writing" />
        <meta property="og:image" content="https://designerdada.com/media/og-images/og-writing.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Writing | Akash Bhadange" />
        <meta name="twitter:description" content="Raw thoughts on design, building products, and the startup journey by Akash Bhadange." />
        <meta name="twitter:image" content="https://designerdada.com/media/og-images/og-writing.jpg" />
      </Helmet>
      <div className="bg-[var(--background)] relative size-full min-h-screen" data-name="designerdada.com/writing">
        <div className="box-border content-stretch flex flex-col gap-[40px] items-center mx-auto px-[16px] py-[40px] w-full max-w-[544px]">
          <Header activePage="writing" />
          <p className="leading-[1.4] not-italic relative shrink-0 text-[var(--foreground)] text-[16px] text-justify w-full">
            I write whenever inspiration strikes, which means I'm pretty irregular about it. These are my raw thoughts on design, building products, and the startup journey. Some are polished, others are more stream-of-consciousness, but they all capture what I was thinking about at the time.
          </p>
          <ArticleList />
          <MailingList />
          <ColorDots />
          <Footer />
        </div>
      </div>
    </>
  );
}