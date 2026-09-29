import { ColorDots } from "@/components/Divider";
import { FavoritesBrowser } from "@/components/FavoritesBrowser";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { siteConfig } from "@/config/site";
import { getFavorites } from "@/lib/content/favorites";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
	title: "Favorites",
	description:
		"A curated collection of beautifully designed products, inspiring people, and websites that have caught my attention.",
	path: "/favorites",
	ogImage: siteConfig.images.ogFavorites,
});

export default async function Favorites() {
	const favorites = await getFavorites();
	return (
		<div className='bg-olive-50 dark:bg-olive-950 relative size-full min-h-screen'>
			<div className='flex flex-col gap-6 items-center mx-auto px-4 py-10 w-full max-w-xl'>
				<div className='animate-in w-full'>
					<Header activePage='favorites' />
				</div>
				<p className='relative shrink-0 text-olive-800 dark:text-olive-100 text-sm/6 text-justify w-full animate-in animate-delay-1'>
					I love discovering great things, whether it's a beautifully designed product, an inspiring
					person, or a website I keep coming back to. This is my collection of those gems I find on
					the internet and in the real world. Everything here has caught my attention and stuck with
					me for one reason or another.
				</p>
				<FavoritesBrowser favorites={favorites} />
				<div className='animate-in animate-delay-4'>
					<ColorDots />
				</div>
				<div className='animate-in animate-delay-5 w-full'>
					<Footer />
				</div>
			</div>
		</div>
	);
}
