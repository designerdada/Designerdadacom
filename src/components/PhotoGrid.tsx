import { useMemo } from 'react';
import { Photo } from '../data/cloudflare-config';
import { PhotoCard } from './PhotoCard';
import { useColumnCount } from '../hooks/useColumnCount';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  loading?: boolean;
}

// Number of images to prioritize (first N images get loading="eager")
const PRIORITY_COUNT = 12;

/**
 * Distributes photos into columns in row-first order so that
 * the newest photos (first in the array) appear across the top row.
 */
function distributeToColumns(photos: Photo[], columnCount: number): Photo[][] {
  const columns: Photo[][] = Array.from({ length: columnCount }, () => []);
  photos.forEach((photo, index) => {
    columns[index % columnCount].push(photo);
  });
  return columns;
}

export function PhotoGrid({ photos, onPhotoClick, loading }: PhotoGridProps) {
  const columnCount = useColumnCount(300);

  const columns = useMemo(
    () => distributeToColumns(photos, columnCount),
    [photos, columnCount]
  );

  // Show skeleton placeholders while loading
  if (loading) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: columnCount }, (_, colIdx) => (
          <div key={`skeleton-col-${colIdx}`} className="flex-1 flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div
                key={`skeleton-${colIdx}-${i}`}
                className="animate-pulse rounded-lg bg-olive-500 dark:bg-olive-400/10"
                style={{ aspectRatio: (colIdx + i) % 3 === 0 ? '2/3' : (colIdx + i) % 3 === 1 ? '3/2' : '1/1' }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Show empty state
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-olive-500 dark:text-olive-400">No photos found</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {columns.map((columnPhotos, colIdx) => (
        <div key={colIdx} className="flex-1 flex flex-col gap-4">
          {columnPhotos.map((photo) => {
            const originalIndex = photos.indexOf(photo);
            return (
              <div key={photo.id}>
                <PhotoCard
                  photo={photo}
                  onClick={() => onPhotoClick(photo)}
                  priority={originalIndex < PRIORITY_COUNT}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
