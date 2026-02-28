import { useEffect, useCallback, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "../data/cloudflare-config";

interface PhotoLightboxProps {
	photo: Photo | null;
	photos: Photo[];
	isOpen: boolean;
	onClose: () => void;
	onNavigate: (photo: Photo) => void;
}

// Preload an image and return a promise
function preloadImage(src: string): void {
	const img = new Image();
	img.src = src;
}

export function PhotoLightbox({ photo, photos, isOpen, onClose, onNavigate }: PhotoLightboxProps) {
	const [imageLoaded, setImageLoaded] = useState(false);

	const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1;
	const hasPrev = currentIndex > 0;
	const hasNext = currentIndex < photos.length - 1;

	// Preload adjacent images for instant navigation
	useEffect(() => {
		if (!isOpen || currentIndex === -1) return;

		// Preload next image
		if (hasNext) {
			preloadImage(photos[currentIndex + 1].urls.large);
		}
		// Preload previous image
		if (hasPrev) {
			preloadImage(photos[currentIndex - 1].urls.large);
		}
	}, [isOpen, currentIndex, hasNext, hasPrev, photos]);

	const goToPrev = useCallback(() => {
		if (hasPrev) {
			setImageLoaded(false);
			onNavigate(photos[currentIndex - 1]);
		}
	}, [hasPrev, currentIndex, photos, onNavigate]);

	const goToNext = useCallback(() => {
		if (hasNext) {
			setImageLoaded(false);
			onNavigate(photos[currentIndex + 1]);
		}
	}, [hasNext, currentIndex, photos, onNavigate]);

	// Keyboard navigation
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowLeft":
					e.preventDefault();
					goToPrev();
					break;
				case "ArrowRight":
					e.preventDefault();
					goToNext();
					break;
				case "Escape":
					e.preventDefault();
					onClose();
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, goToPrev, goToNext, onClose]);

	// Reset image loaded state when photo changes
	useEffect(() => {
		setImageLoaded(false);
	}, [photo?.id]);

	if (!photo) return null;

	return (
		<Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className='fixed inset-0 z-50 bg-olive-50 dark:bg-olive-950 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
				<Dialog.Content
					className='fixed inset-0 z-50 flex items-center justify-center focus:outline-none'
					{...(!photo.description && { "aria-describedby": undefined })}>
					{/* Close button */}
					<Dialog.Close asChild>
						<button
							type='button'
							className='absolute right-4 top-4 z-10 rounded-full bg-black/10 p-2 text-black/60 transition-colors hover:bg-black/20 hover:text-black dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/20 dark:hover:text-white'
							aria-label='Close'>
							<X className='size-6' />
						</button>
					</Dialog.Close>

					{/* Navigation buttons */}
					{hasPrev && (
						<button
							type='button'
							onClick={goToPrev}
							className='absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/10 p-2 text-black/60 transition-colors hover:bg-black/20 hover:text-black dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/20 dark:hover:text-white'
							aria-label='Previous photo'>
							<ChevronLeft className='size-6' />
						</button>
					)}
					{hasNext && (
						<button
							type='button'
							onClick={goToNext}
							className='absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/10 p-2 text-black/60 transition-colors hover:bg-black/20 hover:text-black dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/20 dark:hover:text-white'
							aria-label='Next photo'>
							<ChevronRight className='size-6' />
						</button>
					)}

					{/* Main image area */}
					<div className='flex size-full flex-col items-center justify-center px-16 py-4'>
						{/* Image container */}
						<div className='relative flex flex-1 w-full items-center justify-center min-h-0'>
							{/* Blur-up placeholder using thumbnail */}
							{!imageLoaded && (
								<img
									src={photo.urls.thumbnail}
									alt=''
									aria-hidden='true'
									className='absolute object-contain blur-md scale-105'
									style={{
										maxHeight: "calc(100vh - 140px)",
										maxWidth: "calc(100vw - 128px)",
									}}
								/>
							)}

							<img
								src={photo.urls.large}
								alt={photo.title}
								decoding='async'
								onLoad={() => setImageLoaded(true)}
								className={`object-contain transition-opacity duration-300 ${
									imageLoaded ? "opacity-100" : "opacity-0"
								}`}
								style={{
									maxHeight: "calc(100vh - 140px)",
									maxWidth: "calc(100vw - 128px)",
								}}
							/>
						</div>

						{/* Photo info */}
						<div className='mt-4 w-full max-w-5xl text-center text-olive-800 dark:text-olive-100 shrink-0'>
							<Dialog.Title className='text-base font-medium'>{photo.title}</Dialog.Title>
							<div className='mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-olive-500 dark:text-olive-400'>
								{photo.date && <span className='font-mono'>{photo.date}</span>}
								{photo.camera && <span>{photo.camera}</span>}
								{photo.film && <span>{photo.film}</span>}
								{photo.location && <span>{photo.location}</span>}
							</div>
							{photo.description && (
								<Dialog.Description className='mt-2 text-xs text-olive-700 dark:text-olive-300'>
									{photo.description}
								</Dialog.Description>
							)}
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
