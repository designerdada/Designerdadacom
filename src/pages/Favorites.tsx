import { Link } from 'react-router-dom';
import { useState, useMemo, useRef, useEffect } from 'react';
import { favorites } from '../data/favorites';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet';

type Category = 'All' | 'Products' | 'People' | 'Sites' | 'Fonts';

function SearchIcon({ isHovered }: { isHovered: boolean }) {
  const strokeColor = isHovered ? 'var(--foreground)' : '#64748B';

  return (
    <div className="relative shrink-0 size-4">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g>
          <path d="M11.3333 11.3333L14 14" stroke={strokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333Z" stroke={strokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function SearchAndFilters({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory 
}: { 
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categories: Category[] = ['All', 'Products', 'People', 'Sites', 'Fonts'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="content-stretch flex gap-4 items-center relative shrink-0 w-full" role="search">
      {/* Search Input */}
      <div 
        className="basis-0 content-stretch flex gap-3 grow items-center min-h-px min-w-px relative shrink-0"
        onMouseEnter={() => setIsInputHovered(true)}
        onMouseLeave={() => setIsInputHovered(false)}
      >
        <SearchIcon isHovered={isInputHovered || isInputFocused} />
        <input
          id="search-favorites"
          type="search"
          placeholder="Search links"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          className="font-normal leading-[1.4] not-italic relative shrink-0 text-[14px] text-justify bg-transparent border-none outline-none text-[var(--foreground)] placeholder:text-slate-400 w-full"
          aria-label="Search favorites"
        />
      </div>
      
      {/* Filter Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="content-stretch flex gap-0.5 items-center justify-center relative shrink-0 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
          aria-label="Filter by category"
          aria-haspopup="true"
          aria-expanded={showDropdown}
        >
          <p className="font-medium leading-[1.4] not-italic relative shrink-0 text-[var(--foreground)] text-[14px] text-justify text-nowrap whitespace-pre">
            {selectedCategory}
          </p>
          <ChevronDown className="size-4 text-[var(--foreground)]" strokeWidth={1.5} />
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]" role="menu">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-[14px] cursor-pointer transition-colors ${
                  selectedCategory === category 
                    ? 'font-medium text-[var(--foreground)] bg-gray-100 dark:bg-gray-800' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
                role="menuitem"
                aria-current={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FavoritesList({ searchQuery, selectedCategory }: { searchQuery: string; selectedCategory: Category }) {
  const filteredFavorites = useMemo(() => {
    let filtered = favorites;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      const categoryMap = {
        'Products': 'Product',
        'People': 'People',
        'Sites': 'Site',
        'Fonts': 'Font'
      };
      filtered = filtered.filter(fav => fav.category === categoryMap[selectedCategory as keyof typeof categoryMap]);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(fav => 
        fav.name.toLowerCase().includes(query) ||
        fav.description.toLowerCase().includes(query) ||
        fav.url.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  };

  if (filteredFavorites.length === 0) {
    return (
      <div className="content-stretch flex items-center justify-center py-8 w-full">
        <p className="text-[14px] text-slate-500">No favorites found</p>
      </div>
    );
  }

  return (
    <div className="content-stretch flex flex-col gap-3 items-start relative shrink-0 w-full">
      {filteredFavorites.map((favorite) => (
        <a
          key={favorite.id}
          href={favorite.url}
          target="_blank"
          rel={`noopener noreferrer${favorite.nofollow === false ? '' : ' nofollow'}`}
          className="content-stretch flex gap-4 items-center relative shrink-0 w-full hover:opacity-70 transition-opacity group"
        >
          <div className="basis-0 content-stretch flex gap-2 grow items-center min-h-px min-w-px relative shrink-0">
            <div className="relative shrink-0 size-5">
              <img 
                alt={`${favorite.name} favicon`}
                className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" 
                src={getFaviconUrl(favorite.url)}
              />
            </div>
            <p className="font-medium leading-[1.4] not-italic relative shrink-0 text-[var(--foreground)] text-[16px] text-justify text-nowrap whitespace-pre group-hover:underline underline-offset-4">
              {favorite.name}
            </p>
            <p className="leading-[1.4] not-italic relative shrink-0 text-[12px] text-justify text-nowrap text-slate-500 whitespace-pre">
              /
            </p>
            <p className="[white-space-collapse:collapse] basis-0 grow leading-[1.4] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[var(--foreground)] text-[14px] text-justify text-nowrap">
              {favorite.description}
            </p>
          </div>
          <p className="leading-[1.5] not-italic relative shrink-0 text-[14px] text-nowrap text-slate-500 whitespace-pre">
            {getDomain(favorite.url)}
          </p>
        </a>
      ))}
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

export function Favorites() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  return (
    <>
      <Helmet>
        <title>Favorites | Akash Bhadange</title>
        <meta name="description" content="A curated collection of beautifully designed products, inspiring people, and websites that have caught my attention." />
        <link rel="canonical" href="https://designerdada.com/favorites" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Favorites | Akash Bhadange" />
        <meta property="og:description" content="A curated collection of beautifully designed products, inspiring people, and websites that have caught my attention." />
        <meta property="og:url" content="https://designerdada.com/favorites" />
        <meta property="og:image" content="https://designerdada.com/assets/og-images/og-favorites.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Favorites | Akash Bhadange" />
        <meta name="twitter:description" content="A curated collection of beautifully designed products, inspiring people, and websites that have caught my attention." />
        <meta name="twitter:image" content="https://designerdada.com/assets/og-images/og-favorites.jpg" />
      </Helmet>
      <div className="bg-[var(--background)] relative size-full min-h-screen">
      <div className="box-border content-stretch flex flex-col gap-10 items-center mx-auto px-4 py-10 w-full max-w-[544px]">
        <Header activePage="favorites" />
        <p className="leading-[1.5] not-italic relative shrink-0 text-[var(--foreground)] text-[16px] text-justify w-full">
          I love discovering great things, whether it's a beautifully designed product, an inspiring person, or a website I keep coming back to. This is my collection of those gems I find on the internet and in the real world. Everything here has caught my attention and stuck with me for one reason or another.
        </p>
        <SearchAndFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <FavoritesList searchQuery={searchQuery} selectedCategory={selectedCategory} />
        <ColorDots />
        <Footer />
      </div>
    </div>
    </>
  );
}