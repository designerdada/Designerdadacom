import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Divider } from '../components/Divider';
import { WritingSection } from '../components/WritingSection';
import { useState } from 'react';

export function Home() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState('Copy email');

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    const email = 'akash@peerlist.io';
    
    // Fallback method using textarea
    const textArea = document.createElement('textarea');
    textArea.value = email;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setTooltipText('Copied!');
        setTimeout(() => {
          setTooltipText('Copy email');
          setShowTooltip(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="bg-[var(--background)] min-h-screen w-full flex justify-center py-10">
      <div className="flex flex-col gap-10 items-center w-full max-w-[544px] px-4 m-0">
        {/* Header */}
        <div className="animate-in w-full">
          <Header />
        </div>

        {/* Bio Content */}
        <div className="font-normal min-w-full relative shrink-0 text-[var(--foreground)] text-lg text-justify flex flex-col gap-4">
          <p className="leading-normal relative animate-in animate-delay-1">
            <span>I'm a product designer and founder building </span>
            <a
              href="https://peerlist.io"
              target="_blank"
              rel="noopener noreferrer"
              className="[text-underline-position:from-font] decoration-solid decoration-[var(--muted)] font-medium italic underline underline-offset-4 hover:decoration-[var(--foreground)] transition-colors"
            >
              Peerlist
            </a>
            <span> and </span>
            <a
              href="https://autosend.com"
              target="_blank"
              rel="noopener noreferrer"
              className="[text-underline-position:from-font] decoration-solid decoration-[var(--muted)] font-medium italic underline underline-offset-4 hover:decoration-[var(--foreground)] transition-colors"
            >
              AutoSend
            </a>
            <span>. Over the past 15 years, I've focused on designing beautiful software that people love to use.</span>
          </p>
          <p className="leading-normal animate-in animate-delay-2">
            <span>I regularly </span>
            <a
              href="/writing"
              className="[text-underline-position:from-font] decoration-solid decoration-[var(--muted)] font-normal italic underline underline-offset-4 hover:decoration-[var(--foreground)] transition-colors"
            >
              write
            </a>
            <span> about my design philosophy, approach to building products, and hard-won lessons from my journey as a founder. These essays are my way of thinking through challenges and sharing what I've learned along the way.</span>
          </p>
          <p className="leading-normal animate-in animate-delay-3">
            <span>When I'm not designing, I love shooting street </span>
            <a
              href="https://retrolens.me"
              target="_blank"
              rel="noopener noreferrer"
              className="[text-underline-position:from-font] decoration-solid decoration-[var(--muted)] font-medium italic underline underline-offset-4 hover:decoration-[var(--foreground)] transition-colors"
            >
              photography
            </a>
            <span> on film with my Leica M6. There's something special about slowing down and capturing everyday moments on analog.</span>
          </p>
          <p className="leading-normal animate-in animate-delay-4">
            <span>Always open to interesting conversations about design, startups, and photography. </span>
            <span
              className="relative inline-block"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => {
                if (tooltipText === 'Copy email') {
                  setShowTooltip(false);
                }
              }}
            >
              <button
                onClick={handleCopyEmail}
                className="[text-underline-position:from-font] decoration-solid decoration-[var(--muted)] font-medium italic underline underline-offset-4 hover:decoration-[var(--foreground)] transition-colors cursor-pointer bg-transparent border-none p-0 text-[var(--foreground)] text-lg"
              >
                Say hello
              </button>
              {showTooltip && (
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-[var(--foreground)] text-[var(--background)] rounded whitespace-nowrap">
                  {tooltipText}
                </span>
              )}
            </span>
            <span> or follow me on </span>
            <a
              href="https://peerlist.io/designerdada"
              target="_blank"
              rel="noopener noreferrer"
              className="[text-underline-position:from-font] decoration-solid decoration-[var(--muted)] font-medium italic underline underline-offset-4 hover:decoration-[var(--foreground)] transition-colors"
            >
              Peerlist
            </a>
            <span>, </span>
            <a
              href="https://x.com/designerdada"
              target="_blank"
              rel="noopener noreferrer"
              className="[text-underline-position:from-font] decoration-solid decoration-[var(--muted)] font-medium italic underline underline-offset-4 hover:decoration-[var(--foreground)] transition-colors"
            >
              X
            </a>
            <span>, or </span>
            <a
              href="https://instagram.com/designerdada"
              target="_blank"
              rel="noopener noreferrer"
              className="[text-underline-position:from-font] decoration-solid decoration-[var(--muted)] font-medium italic underline underline-offset-4 hover:decoration-[var(--foreground)] transition-colors"
            >
              Instagram
            </a>
            <span>.</span>
          </p>
        </div>

        {/* Divider */}
        <div className="animate-in animate-delay-5">
          <Divider />
        </div>

        {/* Writing Section */}
        <div className="animate-in animate-delay-6 w-full">
          <WritingSection />
        </div>

        {/* Divider */}
        <div className="animate-in animate-delay-7">
          <Divider />
        </div>

        {/* Footer */}
        <div className="animate-in animate-delay-8 w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
}