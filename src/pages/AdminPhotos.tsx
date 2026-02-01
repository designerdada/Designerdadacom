import { useState, useEffect, useCallback } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { AdminAuthGuard, getAuthToken } from '../components/admin/AdminAuthGuard';
import { PhotoUploadForm } from '../components/admin/PhotoUploadForm';
import { Photo, WORKER_API_URL } from '../data/cloudflare-config';

function AdminPhotosContent() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${WORKER_API_URL}/api/photos`);
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    setDeleteId(id);
    try {
      const token = getAuthToken();
      const response = await fetch(`${WORKER_API_URL}/api/photos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-[var(--foreground)]">Photo Admin</h1>
        <button
          type="button"
          onClick={fetchPhotos}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[var(--muted)]/30 px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)] disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload form */}
        <div>
          <h2 className="mb-4 text-lg font-medium text-[var(--foreground)]">Upload New Photo</h2>
          <PhotoUploadForm onUploadComplete={fetchPhotos} />
        </div>

        {/* Photos list */}
        <div>
          <h2 className="mb-4 text-lg font-medium text-[var(--foreground)]">
            Uploaded Photos ({photos.length})
          </h2>
          {loading && photos.length === 0 ? (
            <p className="text-[var(--muted)]">Loading...</p>
          ) : photos.length === 0 ? (
            <p className="text-[var(--muted)]">No photos uploaded yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-3 rounded-lg border border-[var(--muted)]/20 p-3"
                >
                  <img
                    src={photo.urls.thumbnail}
                    alt={photo.title}
                    className="size-16 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--foreground)]">{photo.title}</p>
                    {(photo.camera || photo.film) && (
                      <p className="text-sm text-[var(--muted)]">
                        {[photo.camera, photo.film].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deleteId === photo.id}
                    className="rounded p-2 text-[var(--muted)] transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminPhotos() {
  return (
    <AdminAuthGuard>
      <AdminPhotosContent />
    </AdminAuthGuard>
  );
}
