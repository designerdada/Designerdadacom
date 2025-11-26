import { Link } from "react-router-dom";
import imgImage1 from "figma:asset/6ecdfba3f00b0a9cd14b86fd7e537539b9517b3b.png";

export function Footer() {
  return (
    <div className="content-stretch flex flex-col gap-4 items-center justify-center relative shrink-0 w-full">
      {/* Logo Image */}
      <div className="h-6 relative shrink-0 w-[91px]">
        <img 
          alt="designerdada.com" 
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" 
          src={imgImage1} 
        />
      </div>

      {/* Footer Note */}
      <div className="content-stretch flex gap-1 items-center relative shrink-0 w-full">
        <p className="basis-0 font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-xs text-center text-[var(--muted)]">
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