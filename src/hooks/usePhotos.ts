import { useState, useEffect, useCallback } from 'react';
import { Photo, WORKER_API_URL } from '../data/cloudflare-config';

interface UsePhotosResult {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Cache for photos to avoid refetching
let photosCache: Photo[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function usePhotos(): UsePhotosResult {
  const [photos, setPhotos] = useState<Photo[]>(photosCache || []);
  const [loading, setLoading] = useState(!photosCache);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    const now = Date.now();

    // Use cache if valid
    if (photosCache && now - lastFetchTime < CACHE_DURATION) {
      setPhotos(photosCache);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${WORKER_API_URL}/api/photos`);

      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.statusText}`);
      }

      const data = await response.json();
      const fetchedPhotos: Photo[] = data.photos || [];

      // Update cache
      photosCache = fetchedPhotos;
      lastFetchTime = now;

      setPhotos(fetchedPhotos);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load photos';
      setError(message);

      // If we have cached data, use it even if stale
      if (photosCache) {
        setPhotos(photosCache);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return {
    photos,
    loading,
    error,
    refetch: fetchPhotos,
  };
}

// Mock photos for development - remove after Worker is set up
export const MOCK_PHOTOS: Photo[] = [
  {
    id: '1',
    title: 'Morning Light',
    description: 'Early morning in the city',
    date: '15.Jan.2025',
    camera: 'Leica M6',
    film: 'Kodak Portra 400',
    location: 'Mumbai',
    category: 'Street',
    aspectRatio: 1.5,
    urls: {
      thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300',
      medium: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
      large: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600',
    },
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'The Wait',
    description: 'Waiting for the train',
    date: '10.Jan.2025',
    camera: 'Leica M6',
    film: 'Ilford HP5',
    location: 'Tokyo',
    category: 'Street',
    aspectRatio: 0.67,
    urls: {
      thumbnail: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=300',
      medium: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800',
      large: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1600',
    },
    createdAt: '2025-01-10T14:30:00Z',
  },
  {
    id: '3',
    title: 'Old Town',
    description: 'Historic architecture',
    date: '05.Jan.2025',
    camera: 'Leica M6',
    film: 'Kodak Ektar 100',
    category: 'Architecture',
    aspectRatio: 1.5,
    urls: {
      thumbnail: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=300',
      medium: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
      large: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
    },
    createdAt: '2025-01-05T09:00:00Z',
  },
  {
    id: '4',
    title: 'Portrait Study',
    date: '01.Jan.2025',
    camera: 'Leica M6',
    film: 'Kodak Tri-X 400',
    category: 'Portrait',
    aspectRatio: 0.8,
    urls: {
      thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300',
      medium: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
      large: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600',
    },
    createdAt: '2025-01-01T16:00:00Z',
  },
  {
    id: '5',
    title: 'Mountain Vista',
    date: '25.Dec.2024',
    camera: 'Leica M6',
    film: 'Kodak Portra 160',
    location: 'Himalayas',
    category: 'Travel',
    aspectRatio: 1.5,
    urls: {
      thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300',
      medium: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      large: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600',
    },
    createdAt: '2024-12-25T08:00:00Z',
  },
  {
    id: '6',
    title: 'Night Market',
    date: '20.Dec.2024',
    camera: 'Leica M6',
    film: 'Cinestill 800T',
    location: 'Bangkok',
    category: 'Street',
    aspectRatio: 1,
    urls: {
      thumbnail: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=300',
      medium: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=800',
      large: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=1600',
    },
    createdAt: '2024-12-20T20:00:00Z',
  },
];

// Use this hook for development with mock data
export function usePhotosMock(): UsePhotosResult {
  return {
    photos: MOCK_PHOTOS,
    loading: false,
    error: null,
    refetch: async () => {},
  };
}
