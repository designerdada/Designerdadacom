"use client";

import { useState, useMemo, useRef, useEffect, type PointerEvent } from "react";
import { favorites, Favorite } from "../data/favorites";
import { ChevronDown } from "lucide-react";
import { getDomain, getFaviconUrl } from "@/lib/favicon";
import { LinkPreviewCard, useLinkPreview } from "./LinkPreviewCard";

type Category = "All" | "Products" | "People" | "Sites" | "Fonts" | "Movies";

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
	const categories: Category[] = ["All", "Products", "People", "Sites", "Fonts", "Movies"];

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
					className='flex gap-0.5 items-center justify-center relative shrink-0 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity px-2 py-1 -mx-2 -my-1'
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
										: "text-olive-500 hover:text-olive-800 dark:hover:text-olive-100 hover:bg-olive-100 dark:hover:bg-olive-800/50"
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
				rel={`noopener noreferrer${favorite.nofollow === false ? "" : " nofollow"}`}
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
	searchQuery,
	selectedCategory,
	previews,
}: {
	searchQuery: string;
	selectedCategory: Category;
	previews: Record<string, string>;
}) {
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

		// Sort alphabetically by name
		return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
	}, [searchQuery, selectedCategory]);

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
					key={favorite.id}
					favorite={favorite}
					isActive={preview.hovered === favorite.url}
					onPointerEnter={preview.onRowEnter}
				/>
			))}
			<LinkPreviewCard previews={previews} preview={preview} />
		</div>
	);
}

/** Search, category filter, and the favorites list. `previews` maps a favorite's URL to its preview image. */
export function FavoritesBrowser({ previews }: { previews: Record<string, string> }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<Category>("All");

	return (
		<>
			<div className='animate-in animate-delay-2 w-full relative z-50'>
				<SearchAndFilters
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					selectedCategory={selectedCategory}
					setSelectedCategory={setSelectedCategory}
				/>
			</div>
			<div className='animate-in animate-delay-3 w-full relative z-10'>
				<FavoritesList searchQuery={searchQuery} selectedCategory={selectedCategory} previews={previews} />
			</div>
		</>
	);
}
