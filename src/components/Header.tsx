import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { Tooltip } from './Tooltip';
import Moon from '../imports/Moon';
import Sun from '../imports/Sun';

interface HeaderProps {
  activePage?: 'writing' | 'favorites';
}

export function Header({ activePage }: HeaderProps = {}) {
  const { toggleTheme, theme } = useTheme();
  
  return (
    <div className="content-stretch flex flex-col gap-4 items-start relative shrink-0 w-full">
      {/* Profile Image */}
      <Link to="/" className="content-stretch flex h-10 items-center justify-start relative shrink-0 w-full" aria-label="Go to home">
        <div className="relative rounded-full shrink-0 size-10">
          <img
            alt="Akash Bhadange profile picture"
            className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-full size-full"
            src="/assets/profile.png"
            loading="eager"
          />
        </div>
      </Link>

      {/* Name */}
      <Link to="/" className="content-stretch flex gap-1 h-[25px] items-center justify-start relative shrink-0 w-full hover:opacity-70 transition-opacity" aria-label="Akash Bhadange home">
        <p className="font-medium leading-normal not-italic relative shrink-0 text-[var(--foreground)] text-xl text-justify text-nowrap whitespace-pre">
          <span className="font-medium">Akash Bhadange </span>
          <span className="font-normal italic">aka</span>
          <span className="font-medium"> @designerdada</span>
        </p>
      </Link>

      {/* Navigation */}
      <nav className="content-stretch flex gap-4 items-center relative shrink-0" aria-label="Main navigation">
        <Link 
          to="/writing" 
          className={`font-normal leading-normal not-italic relative shrink-0 text-base text-justify text-nowrap whitespace-pre hover:underline underline-offset-4 transition-all ${
            activePage === 'writing' ? 'text-[var(--foreground)] underline decoration-[var(--muted)]' : 'text-gray-500 hover:text-[var(--foreground)]'
          }`}
          aria-current={activePage === 'writing' ? 'page' : undefined}
        >
          Writing
        </Link>
        <Link
          to="/favorites"
          className={`font-normal leading-normal not-italic relative shrink-0 text-base text-justify text-nowrap whitespace-pre hover:underline underline-offset-4 transition-all ${
            activePage === 'favorites' ? 'text-[var(--foreground)] underline decoration-[var(--muted)]' : 'text-gray-500 hover:text-[var(--foreground)]'
          }`}
          aria-current={activePage === 'favorites' ? 'page' : undefined}
        >
          Favorites
        </Link>
        <Tooltip content={theme === 'dark' ? 'Delight' : 'Go Dark'}>
          <button
            onClick={toggleTheme}
            className="group relative cursor-pointer bg-transparent border-none p-0 transition-all duration-200 text-gray-500 hover:text-[var(--foreground)] flex items-center"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="size-4">
              {theme === 'dark' ? <Sun /> : <Moon />}
            </div>
          </button>
        </Tooltip>
      </nav>
    </div>
  );
}