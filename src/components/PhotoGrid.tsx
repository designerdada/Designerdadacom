import { Photo } from '../data/cloudflare-config';
import { PhotoCard } from './PhotoCard';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  loading?: boolean;
}

// Number of images to prioritize (first N images get loading="eager")
const PRIORITY_COUNT = 8;

export function PhotoGrid({ photos, onPhotoClick, loading }: PhotoGridProps) {
  // Show skeleton placeholders while loading
  if (loading) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={`skeleton-${i}`}
            className="mb-4 break-inside-avoid animate-pulse rounded-lg bg-[var(--muted)]/10"
            style={{ aspectRatio: i % 3 === 0 ? '2/3' : i % 3 === 1 ? '3/2' : '1/1' }}
          />
        ))}
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
    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
      {photos.map((photo, index) => (
        <div key={photo.id} className="mb-4 break-inside-avoid">
          <PhotoCard
            photo={photo}
            onClick={() => onPhotoClick(photo)}
            priority={index < PRIORITY_COUNT}
          />
        </div>
      ))}
    </div>
  );
}
