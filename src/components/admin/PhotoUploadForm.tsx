import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { WORKER_API_URL, PhotoCategory, PHOTO_CATEGORIES } from '../../data/cloudflare-config';
import { getAuthToken } from './AdminAuthGuard';

interface PhotoUploadFormProps {
  onUploadComplete: () => void;
}

const categories = PHOTO_CATEGORIES.filter((c): c is Exclude<PhotoCategory, 'All'> => c !== 'All');

export function PhotoUploadForm({ onUploadComplete }: PhotoUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [camera, setCamera] = useState('Leica M6');
  const [film, setFilm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<Exclude<PhotoCategory, 'All'>>('Street');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Get aspect ratio from image
    const img = new Image();
    img.onload = () => {
      // Store aspect ratio for later use
      (file as File & { aspectRatio?: number }).aspectRatio = img.width / img.height;
    };
    img.src = URL.createObjectURL(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title || !date || !category) {
      setError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Get aspect ratio
      const aspectRatio = await new Promise<number>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.width / img.height);
        img.src = URL.createObjectURL(selectedFile);
      });

      const metadata = {
        title,
        description: description || undefined,
        date,
        camera: camera || undefined,
        film: film || undefined,
        location: location || undefined,
        category,
        aspectRatio,
      };

      const formData = new FormData();
      formData.append('file', selectedFile);
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
        throw new Error(data.error || 'Upload failed');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setDate('');
      setFilm('');
      setLocation('');
      setCategory('Street');
      clearFile();

      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* File upload area */}
      <div className="relative">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--muted)]/30 px-4 py-12 transition-colors hover:border-[var(--foreground)]">
            <Upload className="mb-2 size-8 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">Click to upload photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Form fields */}
      <div className="grid gap-4">
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Photo title"
            className="w-full rounded-lg border border-[var(--muted)]/30 bg-transparent px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--foreground)] focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={2}
            className="w-full rounded-lg border border-[var(--muted)]/30 bg-transparent px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--foreground)] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Date *</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="DD.MMM.YYYY"
              className="w-full rounded-lg border border-[var(--muted)]/30 bg-transparent px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--foreground)] focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Exclude<PhotoCategory, 'All'>)}
              className="w-full rounded-lg border border-[var(--muted)]/30 bg-transparent px-3 py-2 text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Camera</label>
            <input
              type="text"
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              placeholder="e.g., Leica M6"
              className="w-full rounded-lg border border-[var(--muted)]/30 bg-transparent px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--foreground)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Film</label>
            <input
              type="text"
              value={film}
              onChange={(e) => setFilm(e.target.value)}
              placeholder="e.g., Kodak Portra 400"
              className="w-full rounded-lg border border-[var(--muted)]/30 bg-transparent px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--foreground)] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Mumbai, India"
            className="w-full rounded-lg border border-[var(--muted)]/30 bg-transparent px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--foreground)] focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isUploading || !selectedFile || !title || !date}
        className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-[var(--background)] transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </form>
  );
}
