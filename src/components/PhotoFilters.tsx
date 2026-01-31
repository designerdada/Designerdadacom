import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { PHOTO_CATEGORIES, PhotoCategory } from '../data/cloudflare-config';

interface PhotoFiltersProps {
  selectedCategory: PhotoCategory;
  onCategoryChange: (category: PhotoCategory) => void;
}

export function PhotoFilters({ selectedCategory, onCategoryChange }: PhotoFiltersProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="flex w-full items-center justify-end">
      {/* Category dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <span>{selectedCategory}</span>
          <ChevronDown
            className={`size-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full z-10 mt-2 min-w-[120px] rounded-lg border border-[var(--muted)]/20 bg-[var(--background)] py-1 shadow-lg">
            {PHOTO_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  onCategoryChange(category);
                  setShowDropdown(false);
                }}
                className={`block w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-[var(--muted)]/10 ${
                  selectedCategory === category
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--muted)]'
                }`}
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
