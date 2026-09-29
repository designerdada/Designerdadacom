"use client";

import { useEffect, useState, useMemo, type PointerEvent } from "react";
import type { Favorite } from "@/lib/content/favorites";
import { ArrowUpDown } from "lucide-react";
import { getDomain, getFaviconUrl } from "@/lib/favicon";
import { LinkPreviewCard, useLinkPreview } from "./LinkPreviewCard";
import { MenuDropdown } from "./MenuDropdown";

type Category = "All" | "Products" | "People" | "Sites" | "Fonts" | "Movies";

const CATEGORIES = (["All", "Products", "People", "Sites", "Fonts", "Movies"] as const).map((value) => ({
	value,
	label: value,
}));

const SORTS = [
	{ value: "latest", label: "Latest" },
	{ value: "alphabetical", label: "A–Z" },
] as const;

type Sort = (typeof SORTS)[number]["value"];

const SORT_PARAM = "sort";
const SORT_AZ = "az";

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
	sort,
	setSort,
}: {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedCategory: Category;
	setSelectedCategory: (category: Category) => void;
	sort: Sort;
	setSort: (sort: Sort) => void;
}) {
	const [isInputHovered, setIsInputHovered] = useState(false);
	const [isInputFocused, setIsInputFocused] = useState(false);

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

			<MenuDropdown
				value={sort}
				options={SORTS}
				onChange={setSort}
				label='Sort favorites'
				icon={<ArrowUpDown className='size-3.5' strokeWidth={1.5} />}
			/>
			<MenuDropdown
				value={selectedCategory}
				options={CATEGORIES}
				onChange={setSelectedCategory}
				label='Filter by category'
			/>
		</div>
	);
}

function FavoriteItem({
	favorite,
	isActive,
	onPointerEnter,
}: {
	favorite: Favorite;
	isActive: boolean;
	onPointerEnter: (url: string, event: PointerEvent) => void;
}) {
	return (
		<div className='relative w-full'>
			<a
				href={favorite.url}
				target='_blank'
				rel={`noopener noreferrer${favorite.nofollow ? " nofollow" : ""}`}
				data-preview-url={favorite.url}
				data-active={isActive ? "" : undefined}
				className='flex gap-4 items-center relative shrink-0 w-full group transition-opacity duration-200 group-data-hovering/list:opacity-45 data-active:opacity-100!'
				onPointerEnter={(event) => onPointerEnter(favorite.url, event)}>
				<div className='basis-0 flex gap-4 grow items-center min-h-px min-w-px relative shrink-0'>
					<div className='relative shrink-0 size-5'>
						<img
							alt={`${favorite.name} favicon`}
							className='absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full'
							src={getFaviconUrl(favorite.url)}
							width={20}
							height={20}
							loading='lazy'
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
	favorites,
	searchQuery,
	selectedCategory,
	sort,
}: {
	favorites: Favorite[];
	searchQuery: string;
	selectedCategory: Category;
	sort: Sort;
}) {
	const previews = useMemo(
		() =>
			Object.fromEntries(
				favorites.flatMap(({ url, previewImageUrl }) => (previewImageUrl ? [[url, previewImageUrl]] : [])),
			) as Record<string, string>,
		[favorites],
	);
	const preview = useLinkPreview(previews);

	const filteredFavorites = useMemo(() => {
		let filtered = favorites;

		// Filter by category
		if (selectedCategory !== "All") {
			const categoryMap = {
				Products: "Product",
				People: "People",
				Sites: "Site",
				Fonts: "Font",
				Movies: "Movie",
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

		// The query returns them A–Z; "latest" puts the most recently added first.
		return sort === "latest" ? [...filtered].sort((a, b) => b._creationTime - a._creationTime) : filtered;
	}, [favorites, searchQuery, selectedCategory, sort]);

	if (filteredFavorites.length === 0) {
		return (
			<div className='flex items-center justify-center py-8 w-full'>
				<p className='text-sm text-olive-500'>No favorites found</p>
			</div>
		);
	}

	return (
		<div
			ref={preview.listRef}
			className='group/list flex flex-col gap-3 items-start relative shrink-0 w-full isolate'
			data-hovering={preview.hovered ? "" : undefined}
			onPointerMove={preview.onListMove}
			onPointerLeave={preview.onListLeave}>
			{filteredFavorites.map((favorite) => (
				<FavoriteItem
					key={favorite._id}
					favorite={favorite}
					isActive={preview.hovered === favorite.url}
					onPointerEnter={preview.onRowEnter}
				/>
			))}
			<LinkPreviewCard previews={previews} preview={preview} />
		</div>
	);
}

/** Search, sort, category filter, and the favorites list. */
export function FavoritesBrowser({ favorites }: { favorites: Favorite[] }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<Category>("All");
	const [sort, setSort] = useState<Sort>("latest");

	// Sort lives in the URL (?sort=az) so it survives reloads and can be shared. It's read in the browser
	// rather than on the server so the page stays static.
	useEffect(() => {
		if (new URLSearchParams(window.location.search).get(SORT_PARAM) === SORT_AZ) setSort("alphabetical");
	}, []);

	const changeSort = (next: Sort) => {
		setSort(next);
		const url = new URL(window.location.href);
		if (next === "alphabetical") url.searchParams.set(SORT_PARAM, SORT_AZ);
		else url.searchParams.delete(SORT_PARAM);
		window.history.replaceState(null, "", url);
	};

	return (
		<>
			<div className='animate-in animate-delay-2 w-full relative z-50'>
				<SearchAndFilters
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					selectedCategory={selectedCategory}
					setSelectedCategory={setSelectedCategory}
					sort={sort}
					setSort={changeSort}
				/>
			</div>
			<div className='animate-in animate-delay-3 w-full relative z-10'>
				<FavoritesList
					favorites={favorites}
					searchQuery={searchQuery}
					selectedCategory={selectedCategory}
					sort={sort}
				/>
			</div>
		</>
	);
}
