"use client";

import { useState, useMemo } from "react";
import { PhotoGrid } from "./PhotoGrid";
import { PhotoLightbox } from "./PhotoLightbox";
import { Photo, sortPhotosByDate } from "../data/cloudflare-config";
import { usePhotos } from "../hooks/usePhotos";

/** Client-fetched photo grid (from the Cloudflare Worker) plus the lightbox. */
export function PhotographyGallery() {
	const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
	const { photos, loading, error } = usePhotos();
	const displayedPhotos = useMemo(() => sortPhotosByDate(photos), [photos]);

	return (
		<>
			<main className='w-full px-4 py-10 animate-in animate-delay-2'>
				{error && (
					<div className='text-center py-8'>
						<p className='text-red-500 text-xs'>{error}</p>
					</div>
				)}
				<PhotoGrid photos={displayedPhotos} onPhotoClick={setSelectedPhoto} loading={loading} />
			</main>

			<PhotoLightbox
				photo={selectedPhoto}
				photos={displayedPhotos}
				isOpen={!!selectedPhoto}
				onClose={() => setSelectedPhoto(null)}
				onNavigate={setSelectedPhoto}
			/>
		</>
	);
}
