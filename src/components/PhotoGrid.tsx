import { Photo } from '../data/cloudflare-config';
import { PhotoCard } from './PhotoCard';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  loading?: boolean;
}

export function PhotoGrid({ photos, onPhotoClick, loading }: PhotoGridProps) {
  // Show skeleton placeholders while loading
  if (loading) {
    return (
      <div className="columns-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="mb-4 animate-pulse rounded-lg bg-[var(--muted)]/10"
            style={{ aspectRatio: i % 2 === 0 ? '2/3' : '3/2' }}
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
    <div className="columns-2 gap-4">
      {photos.map((photo, index) => (
        <div key={photo.id} className="mb-4 break-inside-avoid">
          <PhotoCard photo={photo} onClick={() => onPhotoClick(photo)} priority={index < 4} />
        </div>
      ))}
    </div>
  );
}
