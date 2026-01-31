import { useState, useRef } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import { WORKER_API_URL } from '../../data/cloudflare-config';
import { getAuthToken } from './AdminAuthGuard';

interface PhotoUploadFormProps {
  onUploadComplete: () => void;
}

interface SelectedPhoto {
  file: File;
  preview: string;
  title: string;
  uploaded?: boolean;
}

const CAMERAS = ['Leica M6', 'Pentax 17', 'Yashica FX-3'] as const;
const FILMS = [
  'Kodak Gold 200',
  'Kodak Ultramax 400',
  'Kodak Portra 400',
  'Kodak Tmax 400',
  'Kodacolor 100',
  'Kodacolor 200',
  'Fujifilm Superia 400',
] as const;

export function PhotoUploadForm({ onUploadComplete }: PhotoUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared form fields
  const [camera, setCamera] = useState<typeof CAMERAS[number]>('Leica M6');
  const [film, setFilm] = useState<typeof FILMS[number]>('Kodak Gold 200');

  const getFilenameWithoutExtension = (filename: string): string => {
    return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    const newPhotos: SelectedPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Create preview
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newPhotos.push({
        file,
        preview,
        title: getFilenameWithoutExtension(file.name),
      });
    }

    if (newPhotos.length === 0) {
      setError('Please select valid image files');
      return;
    }

    setSelectedPhotos((prev) => [...prev, ...newPhotos]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePhotoTitle = (index: number, newTitle: string) => {
    setSelectedPhotos((prev) =>
      prev.map((photo, i) => (i === index ? { ...photo, title: newTitle } : photo))
    );
  };

  const clearAllPhotos = () => {
    setSelectedPhotos([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all photos have titles
    const photosWithoutTitles = selectedPhotos.filter((p) => !p.title.trim());
    if (photosWithoutTitles.length > 0) {
      setError('Please provide titles for all photos');
      return;
    }

    if (selectedPhotos.length === 0) {
      setError('Please select at least one photo');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress({ current: 0, total: selectedPhotos.length });

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];
        setUploadProgress({ current: i + 1, total: selectedPhotos.length });

        // Get aspect ratio
        const aspectRatio = await new Promise<number>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img.width / img.height);
          img.src = URL.createObjectURL(photo.file);
        });

        const metadata = {
          title: photo.title,
          camera,
          film,
          aspectRatio,
        };

        const formData = new FormData();
        formData.append('file', photo.file);
        formData.append('metadata', JSON.stringify(metadata));

        const response = await fetch(`${WORKER_API_URL}/api/photos`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(`Failed to upload "${photo.title}": ${data.error || 'Upload failed'}`);
        }

        // Mark as uploaded
        setSelectedPhotos((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, uploaded: true } : p))
        );
      }

      // Reset form
      setCamera('Leica M6');
      setFilm('Kodak Gold 200');
      clearAllPhotos();
      setUploadProgress(null);

      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const hasPhotos = selectedPhotos.length > 0;
  const allTitlesValid = selectedPhotos.every((p) => p.title.trim());

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* File upload area */}
      <div>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--muted)]/30 px-4 py-8 transition-colors hover:border-[var(--foreground)]">
          <Upload className="mb-2 size-8 text-[var(--muted)]" />
          <span className="text-sm text-[var(--muted)]">
            {hasPhotos ? 'Click to add more photos' : 'Click to upload photos'}
          </span>
          <span className="mt-1 text-xs text-[var(--muted)]/60">Select multiple files at once</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Selected photos grid */}
      {hasPhotos && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted)]">
              {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              onClick={clearAllPhotos}
              className="text-sm text-red-500 hover:text-red-400"
              disabled={isUploading}
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {selectedPhotos.map((photo, index) => (
              <div
                key={index}
                className={`relative rounded-lg border ${
                  photo.uploaded
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-[var(--muted)]/30'
                }`}
              >
                <div className="relative">
                  <img
                    src={photo.preview}
                    alt={photo.title}
                    className="h-32 w-full rounded-t-lg object-cover"
                  />
                  {photo.uploaded && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-t-lg bg-green-500/20">
                      <CheckCircle className="size-8 text-green-500" />
                    </div>
                  )}
                  {!isUploading && !photo.uploaded && (
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
                <div className="p-2">
                  <input
                    type="text"
                    value={photo.title}
                    onChange={(e) => updatePhotoTitle(index, e.target.value)}
                    placeholder="Photo title"
                    disabled={isUploading || photo.uploaded}
                    className="w-full rounded border border-[var(--muted)]/30 bg-transparent px-2 py-1 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--foreground)] focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared form fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Camera (all photos)</label>
          <select
            value={camera}
            onChange={(e) => setCamera(e.target.value as typeof CAMERAS[number])}
            disabled={isUploading}
            className="w-full rounded-lg border border-[var(--muted)]/30 bg-transparent px-3 py-2 text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-none disabled:opacity-50"
          >
            {CAMERAS.map((cam) => (
              <option key={cam} value={cam}>
                {cam}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Film (all photos)</label>
          <select
            value={film}
            onChange={(e) => setFilm(e.target.value as typeof FILMS[number])}
            disabled={isUploading}
            className="w-full rounded-lg border border-[var(--muted)]/30 bg-transparent px-3 py-2 text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-none disabled:opacity-50"
          >
            {FILMS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {uploadProgress && (
        <div className="flex flex-col gap-2">
          <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]/20">
            <div
              className="h-full bg-[var(--foreground)] transition-all"
              style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-[var(--muted)]">
            Uploading {uploadProgress.current} of {uploadProgress.total}...
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isUploading || !hasPhotos || !allTitlesValid}
        className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-[var(--background)] transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {isUploading
          ? `Uploading...`
          : `Upload ${selectedPhotos.length} Photo${selectedPhotos.length !== 1 ? 's' : ''}`}
      </button>
    </form>
  );
}
