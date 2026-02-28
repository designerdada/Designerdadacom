import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { favorites, Favorite } from "../data/favorites";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ChevronDown } from "lucide-react";
import { Helmet } from "react-helmet";

// Cache for OG images to avoid refetching
const ogImageCache: Record<string, { image: string | null; loading: boolean }> = {};

// Prefetch OG image for a URL
async function prefetchOgImage(url: string): Promise<string | null> {
	if (ogImageCache[url]) {
		return ogImageCache[url].image;
	}

	ogImageCache[url] = { image: null, loading: true };

	try {
		const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
		const data = await response.json();
		const imageUrl = data?.data?.image?.url || data?.data?.logo?.url || null;
		ogImageCache[url] = { image: imageUrl, loading: false };
		return imageUrl;
	} catch {
		ogImageCache[url] = { image: null, loading: false };
		return null;
	}
}

// Prefetch all favorites' OG images in background
let prefetchStarted = false;
function prefetchAllOgImages() {
	if (prefetchStarted) return;
	prefetchStarted = true;

	// Stagger requests to avoid rate limiting (50ms between each)
	favorites.forEach((fav, index) => {
		setTimeout(() => {
			prefetchOgImage(fav.url);
		}, index * 50);
	});
}

type Category = "All" | "Products" | "People" | "Sites" | "Fonts";

function SearchIcon({ isHovered }: { isHovered: boolean }) {
	const strokeColor = isHovered ? "currentColor" : "#7c7c67";

	return (
		<div className='relative shrink-0 size-4'>
			<svg className='block size-full' fill='none' preserveAspectRatio='none' viewBox='0 0 16 16'>
				<g>
					<path
						d='M11.3333 11.3333L14 14'
						stroke={strokeColor}
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='1.5'
					/>
					<path
						d='M12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333Z'
						stroke={strokeColor}
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='1.5'
					/>
				</g>
			</svg>
		</div>
	);
}

function SearchAndFilters({
	searchQuery,
	setSearchQuery,
	selectedCategory,
	setSelectedCategory,
}: {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedCategory: Category;
	setSelectedCategory: (category: Category) => void;
}) {
	const [showDropdown, setShowDropdown] = useState(false);
	const [isInputHovered, setIsInputHovered] = useState(false);
	const [isInputFocused, setIsInputFocused] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const categories: Category[] = ["All", "Products", "People", "Sites", "Fonts"];

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};

		if (showDropdown) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showDropdown]);

	return (
		<div className='flex gap-4 items-center relative shrink-0 w-full' role='search'>
			{/* Search Input */}
			<div
				className='basis-0 flex gap-3 grow items-center min-h-px min-w-px relative shrink-0'
				onMouseEnter={() => setIsInputHovered(true)}
				onMouseLeave={() => setIsInputHovered(false)}>
				<SearchIcon isHovered={isInputHovered || isInputFocused} />
				<input
					id='search-favorites'
					type='search'
					placeholder='Search links'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() => setIsInputFocused(true)}
					onBlur={() => setIsInputFocused(false)}
					className='font-normal relative shrink-0 text-sm text-justify bg-transparent border-none outline-none text-olive-800 dark:text-olive-100 placeholder:text-olive-400 dark:placeholder:text-olive-600 w-full'
					aria-label='Search favorites'
				/>
			</div>

			{/* Filter Dropdown */}
			<div className='relative z-50' ref={dropdownRef}>
				<button
					onClick={() => setShowDropdown(!showDropdown)}
					className='flex gap-0.5 items-center justify-center relative shrink-0 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity'
					aria-label='Filter by category'
					aria-haspopup='true'
					aria-expanded={showDropdown}>
					<p className='font-medium relative shrink-0 text-olive-800 dark:text-olive-100 text-sm text-justify text-nowrap whitespace-pre'>
						{selectedCategory}
					</p>
					<ChevronDown className='size-4 text-olive-800 dark:text-olive-100' strokeWidth={1.5} />
				</button>

				{showDropdown && (
					<div
						className='absolute right-0 top-full mt-2 bg-olive-50 dark:bg-olive-950 border border-olive-200 dark:border-olive-700 rounded-lg shadow-lg py-1 z-50 min-w-32'
						role='menu'>
						{categories.map((category) => (
							<button
								key={category}
								onClick={() => {
									setSelectedCategory(category);
									setShowDropdown(false);
								}}
								className={`w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors ${
									selectedCategory === category
										? "font-medium text-olive-800 dark:text-olive-100 bg-olive-100 dark:bg-olive-800"
										: "text-olive-500 hover:bg-olive-50 dark:hover:bg-olive-800/50"
								}`}
								role='menuitem'
								aria-current={selectedCategory === category}>
								{category}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function FavoriteItem({
	favorite,
	getDomain,
	getFaviconUrl,
}: {
	favorite: Favorite;
	getDomain: (url: string) => string;
	getFaviconUrl: (url: string) => string;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const [ogImage, setOgImage] = useState<string | null>(() => {
		// Initialize from cache if available
		const cached = ogImageCache[favorite.url];
		return cached && !cached.loading ? cached.image : null;
	});
	const [isLoading, setIsLoading] = useState(false);
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleMouseEnter = useCallback(() => {
		// Shorter delay since images are likely prefetched
		hoverTimeoutRef.current = setTimeout(async () => {
			setIsHovered(true);

			// Check cache first
			const cached = ogImageCache[favorite.url];
			if (cached && !cached.loading) {
				setOgImage(cached.image);
				return;
			}

			// If not in cache or still loading, fetch it
			setIsLoading(true);
			const image = await prefetchOgImage(favorite.url);
			setOgImage(image);
			setIsLoading(false);
		}, 100);
	}, [favorite.url]);

	const handleMouseLeave = useCallback(() => {
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}
		setIsHovered(false);
	}, []);

	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div className='relative w-full'>
			{/* OG Image Preview - outside the anchor to avoid opacity inheritance */}
			<div
				className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none transition-all duration-200 ease-out ${
					isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
				}`}
				style={{ height: "120px" }}>
				{isLoading ? (
					<div className='h-30 w-40 bg-olive-100 dark:bg-olive-800 rounded-lg animate-pulse flex items-center justify-center'>
						<div className='size-6 border-2 border-olive-300 dark:border-olive-600 border-t-transparent rounded-full animate-spin' />
					</div>
				) : ogImage ? (
					<img
						src={ogImage}
						alt={`${favorite.name} preview`}
						className='h-30 w-auto max-w-60 object-contain rounded-xl border border-olive-200 dark:border-olive-700 bg-olive-50 dark:bg-olive-950'
					/>
				) : null}
			</div>

			<a
				href={favorite.url}
				target='_blank'
				rel={`noopener noreferrer${favorite.nofollow === false ? "" : " nofollow"}`}
				className='flex gap-4 items-center relative shrink-0 w-full group'
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}>
				<div className='basis-0 flex gap-4 grow items-center min-h-px min-w-px relative shrink-0'>
					<div className='relative shrink-0 size-5'>
						<img
							alt={`${favorite.name} favicon`}
							className='absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full'
							src={getFaviconUrl(favorite.url)}
						/>
					</div>
					<div className='basis-0 flex gap-2 grow items-center min-h-px min-w-px relative shrink-0'>
						<p className='font-semibold relative shrink-0 text-olive-800 dark:text-olive-100 text-sm text-justify text-nowrap whitespace-pre group-hover:underline underline-offset-4'>
							{favorite.name}
						</p>
						<p className='relative shrink-0 text-xs text-justify text-nowrap text-olive-500 whitespace-pre'>
							/
						</p>
						<p className='[white-space-collapse:collapse] basis-0 grow min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-olive-500 dark:text-olive-100 text-sm text-justify text-nowrap'>
							{favorite.description}
						</p>
					</div>
				</div>
				<p className='relative shrink-0 text-sm text-nowrap text-olive-400 whitespace-pre font-mono'>
					{getDomain(favorite.url)}
				</p>
			</a>
		</div>
	);
}

function FavoritesList({
	searchQuery,
	selectedCategory,
}: {
	searchQuery: string;
	selectedCategory: Category;
}) {
	// Prefetch all OG images on mount
	useEffect(() => {
		// Small delay to not block initial render
		const timer = setTimeout(prefetchAllOgImages, 100);
		return () => clearTimeout(timer);
	}, []);

	const filteredFavorites = useMemo(() => {
		let filtered = favorites;

		// Filter by category
		if (selectedCategory !== "All") {
			const categoryMap = {
				Products: "Product",
				People: "People",
				Sites: "Site",
				Fonts: "Font",
			};
			filtered = filtered.filter(
				(fav) => fav.category === categoryMap[selectedCategory as keyof typeof categoryMap],
			);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(fav) =>
					fav.name.toLowerCase().includes(query) ||
					fav.description.toLowerCase().includes(query) ||
					fav.url.toLowerCase().includes(query),
			);
		}

		// Sort alphabetically by name
		return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
	}, [searchQuery, selectedCategory]);

	const getDomain = (url: string) => {
		try {
			const urlObj = new URL(url);
			return urlObj.hostname.replace("www.", "");
		} catch {
			return url;
		}
	};

	const getFaviconUrl = (url: string) => {
		try {
			const urlObj = new URL(url);
			const domain = urlObj.hostname;
			return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
		} catch {
			return "";
		}
	};

	if (filteredFavorites.length === 0) {
		return (
			<div className='flex items-center justify-center py-8 w-full'>
				<p className='text-sm text-olive-500'>No favorites found</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-3 items-start relative shrink-0 w-full isolate'>
			{filteredFavorites.map((favorite) => (
				<FavoriteItem
					key={favorite.id}
					favorite={favorite}
					getDomain={getDomain}
					getFaviconUrl={getFaviconUrl}
				/>
			))}
		</div>
	);
}

function ColorDots() {
	return (
		<div className='flex gap-2 items-center justify-center px-0 py-2 relative shrink-0 w-full'>
			<div className='relative shrink-0 size-2'>
				<svg className='block size-full' fill='none' preserveAspectRatio='none' viewBox='0 0 8 8'>
					<circle cx='4' cy='4' fill='#E9573F' r='4' />
				</svg>
			</div>
			<div className='relative shrink-0 size-2'>
				<svg className='block size-full' fill='none' preserveAspectRatio='none' viewBox='0 0 8 8'>
					<circle cx='4' cy='4' fill='#F0BF2E' r='4' />
				</svg>
			</div>
			<div className='relative shrink-0 size-2'>
				<svg className='block size-full' fill='none' preserveAspectRatio='none' viewBox='0 0 8 8'>
					<circle cx='4' cy='4' fill='#4E964E' r='4' />
				</svg>
			</div>
		</div>
	);
}

export function Favorites() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<Category>("All");

	return (
		<>
			<Helmet>
				<title>Favorites | Akash Bhadange</title>
				<meta
					name='description'
					content='A curated collection of beautifully designed products, inspiring people, and websites that have caught my attention.'
				/>
				<link rel='canonical' href='https://designerdada.com/favorites' />

				{/* Open Graph */}
				<meta property='og:type' content='website' />
				<meta property='og:title' content='Favorites | Akash Bhadange' />
				<meta
					property='og:description'
					content='A curated collection of beautifully designed products, inspiring people, and websites that have caught my attention.'
				/>
				<meta property='og:url' content='https://designerdada.com/favorites' />
				<meta
					property='og:image'
					content='https://designerdada.com/assets/og-images/og-favorites.jpg'
				/>

				{/* Twitter */}
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:title' content='Favorites | Akash Bhadange' />
				<meta
					name='twitter:description'
					content='A curated collection of beautifully designed products, inspiring people, and websites that have caught my attention.'
				/>
				<meta
					name='twitter:image'
					content='https://designerdada.com/assets/og-images/og-favorites.jpg'
				/>
			</Helmet>
			<div className='bg-olive-50 dark:bg-olive-950 relative size-full min-h-screen'>
				<div className='flex flex-col gap-6 items-center mx-auto px-4 py-10 w-full max-w-xl'>
					<div className='animate-in w-full'>
						<Header activePage='favorites' />
					</div>
					<p className='relative shrink-0 text-olive-800 dark:text-olive-100 text-sm/6 text-justify w-full animate-in animate-delay-1'>
						I love discovering great things, whether it's a beautifully designed product, an
						inspiring person, or a website I keep coming back to. This is my collection of those
						gems I find on the internet and in the real world. Everything here has caught my
						attention and stuck with me for one reason or another.
					</p>
					<div className='animate-in animate-delay-2 w-full relative z-50'>
						<SearchAndFilters
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							selectedCategory={selectedCategory}
							setSelectedCategory={setSelectedCategory}
						/>
					</div>
					<div className='animate-in animate-delay-3 w-full relative z-10'>
						<FavoritesList searchQuery={searchQuery} selectedCategory={selectedCategory} />
					</div>
					<div className='animate-in animate-delay-4'>
						<ColorDots />
					</div>
					<div className='animate-in animate-delay-5 w-full'>
						<Footer />
					</div>
				</div>
			</div>
		</>
	);
}
