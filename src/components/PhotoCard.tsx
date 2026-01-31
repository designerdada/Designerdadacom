import { useState, useCallback, useRef } from 'react';
import { Photo } from '../data/cloudflare-config';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  priority?: boolean;
}

export function PhotoCard({ photo, onClick, priority = false }: PhotoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefetchedRef = useRef(false);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Prefetch large image on hover for faster lightbox opening
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (!prefetchedRef.current) {
      prefetchedRef.current = true;
      const img = new Image();
      img.src = photo.urls.large;
    }
  }, [photo.urls.large]);

  return (
    <button
      type="button"
      className="relative w-full overflow-hidden rounded-lg bg-[var(--muted)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
      style={{ aspectRatio: photo.aspectRatio }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`View ${photo.title}`}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-[var(--muted)]/20" />
      )}

      {/* Photo image */}
      <img
        src={photo.urls.thumbnail}
        alt={photo.title}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleImageLoad}
        className={`absolute inset-0 size-full object-cover transition-all duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${isHovered ? 'scale-105' : 'scale-100'}`}
      />

      {/* Hover overlay with title */}
      <div
        className={`absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-full">
          <h3 className="truncate text-sm font-medium text-white">{photo.title}</h3>
          {photo.location && (
            <p className="truncate text-xs text-white/70">{photo.location}</p>
          )}
        </div>
      </div>
    </button>
  );
}
