import { useMemo } from 'react';
import { Photo } from '../data/cloudflare-config';
import { PhotoCard } from './PhotoCard';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  loading?: boolean;
}

// Number of images to prioritize per column
const PRIORITY_PER_COLUMN = 3;

export function PhotoGrid({ photos, onPhotoClick, loading }: PhotoGridProps) {
  // Split photos into two columns (alternating)
  const { leftColumn, rightColumn } = useMemo(() => {
    const left: Photo[] = [];
    const right: Photo[] = [];
    photos.forEach((photo, index) => {
      if (index % 2 === 0) {
        left.push(photo);
      } else {
        right.push(photo);
      }
    });
    return { leftColumn: left, rightColumn: right };
  }, [photos]);

  // Show skeleton placeholders while loading
  if (loading) {
    return (
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={`left-${i}`}
              className="animate-pulse rounded-lg bg-[var(--muted)]/10"
              style={{ aspectRatio: i % 2 === 0 ? '2/3' : '3/2' }}
            />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={`right-${i}`}
              className="animate-pulse rounded-lg bg-[var(--muted)]/10"
              style={{ aspectRatio: i % 2 === 0 ? '3/2' : '2/3' }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Show empty state
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-[var(--muted)]">No photos found</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {/* Left column */}
      <div className="flex flex-1 flex-col gap-4">
        {leftColumn.map((photo, columnIndex) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => onPhotoClick(photo)}
            priority={columnIndex < PRIORITY_PER_COLUMN}
          />
        ))}
      </div>
      {/* Right column */}
      <div className="flex flex-1 flex-col gap-4">
        {rightColumn.map((photo, columnIndex) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => onPhotoClick(photo)}
            priority={columnIndex < PRIORITY_PER_COLUMN}
          />
        ))}
      </div>
    </div>
  );
}
