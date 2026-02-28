import { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PhotoGrid } from "../components/PhotoGrid";
import { PhotoLightbox } from "../components/PhotoLightbox";
import { Helmet } from "react-helmet";
import { Photo, sortPhotosByDate } from "../data/cloudflare-config";
import { usePhotos } from "../hooks/usePhotos";

export function Photography() {
	const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

	// Use mock data for development - switch to usePhotos() when API is ready
	const { photos, loading, error } = usePhotos();

	// Sort photos by date
	const displayedPhotos = useMemo(() => {
		return sortPhotosByDate(photos);
	}, [photos]);

	return (
		<>
			<Helmet>
				<title>Photography | Akash Bhadange</title>
				<meta
					name='description'
					content='Photography by Akash Bhadange. A collection of moments captured through my lens.'
				/>
				<link rel='canonical' href='https://designerdada.com/photography' />

				{/* Open Graph */}
				<meta property='og:type' content='website' />
				<meta property='og:title' content='Photography | Akash Bhadange' />
				<meta
					property='og:description'
					content='Photography by Akash Bhadange. A collection of moments captured through my lens.'
				/>
				<meta property='og:url' content='https://designerdada.com/photography' />
				<meta
					property='og:image'
					content='https://designerdada.com/assets/og-images/og-photography.jpg'
				/>

				{/* Twitter */}
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:title' content='Photography | Akash Bhadange' />
				<meta
					name='twitter:description'
					content='Photography by Akash Bhadange. A collection of moments captured through my lens.'
				/>
				<meta
					name='twitter:image'
					content='https://designerdada.com/assets/og-images/og-photography.jpg'
				/>
			</Helmet>
			<div className='bg-olive-50 dark:bg-olive-950 relative size-full min-h-screen flex flex-col items-center'>
				{/* Header and description - constrained width */}
				<div className='flex flex-col gap-10 items-center px-4 pt-10 w-full max-w-xl'>
					<div className='animate-in w-full'>
						<Header activePage='photography' />
					</div>
					<div className='flex flex-col gap-4 w-full animate-in animate-delay-1'>
						<p className='relative shrink-0 text-olive-800 dark:text-olive-100 text-sm text-justify w-full'>
							There's something about shooting film that forces you to slow down. With my Leica M6,
							there's no chimping at the back of the screen to check if I nailed it. That constraint
							is the whole point. I've found that limitations make me a better photographer.
						</p>
						<p className='relative shrink-0 text-olive-800 dark:text-olive-100 text-sm text-justify w-full'>
							Most of what you'll see here is street photography, candid moments and quiet scenes I
							stumbled into while walking around with no particular agenda. Film has a texture and
							honesty to it that I've never been able to replicate digitally. These photos aren't
							perfect, but they're real.
						</p>
					</div>
				</div>

				{/* Photo grid - full width */}
				<main className='w-full px-4 py-10 animate-in animate-delay-2'>
					{/* Error state */}
					{error && (
						<div className='text-center py-8'>
							<p className='text-red-500 text-xs'>{error}</p>
						</div>
					)}

					{/* Photo grid */}
					<PhotoGrid photos={displayedPhotos} onPhotoClick={setSelectedPhoto} loading={loading} />
				</main>

				{/* Footer - constrained width */}
				<div className='px-4 pb-10 w-full max-w-xl'>
					<div className='animate-in animate-delay-3 w-full'>
						<Footer />
					</div>
				</div>
			</div>

			{/* Lightbox */}
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
