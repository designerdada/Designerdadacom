// Cloudflare R2 Configuration for Photography

// Worker API URL - set via NEXT_PUBLIC_WORKER_API_URL (the legacy VITE_WORKER_API_URL is mapped
// onto it in next.config.ts). For local development use http://localhost:8787.
// Empty string means photography API is not configured
export const WORKER_API_URL = process.env.NEXT_PUBLIC_WORKER_API_URL || "";

// Photo categories
export const PHOTO_CATEGORIES = [
	"All",
	"Street",
	"Portrait",
	"Travel",
	"Architecture",
	"Other",
] as const;
export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];

// Photo interface matching the R2 photos.json structure
export interface Photo {
	id: string;
	title: string;
	description?: string;
	date: string; // DD.MMM.YYYY format
	camera?: string;
	film?: string;
	location?: string;
	category: Exclude<PhotoCategory, "All">;
	aspectRatio: number; // width / height
	urls: {
		thumbnail: string; // 300px wide
		medium: string; // 800px wide
		large: string; // 1600px wide
	};
	createdAt: string; // ISO date
}

// Helper to get full URL for a photo variant
export function getPhotoUrl(photo: Photo, variant: keyof Photo["urls"] = "medium"): string {
	return photo.urls[variant];
}

// Helper to sort photos by date (newest first)
export function sortPhotosByDate(photos: Photo[]): Photo[] {
	return [...photos].sort((a, b) => {
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});
}

// Helper to filter photos by category
export function filterPhotosByCategory(photos: Photo[], category: PhotoCategory): Photo[] {
	if (category === "All") return photos;
	return photos.filter((photo) => photo.category === category);
}
