import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PhotographyGallery } from "@/components/PhotographyGallery";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
	title: "Photography",
	description: "Photography by Akash Bhadange. A collection of moments captured through my lens.",
	path: "/photography",
	ogImage: siteConfig.images.ogPhotography,
});

export default function Photography() {
	return (
		<div className='bg-olive-50 dark:bg-olive-950 relative size-full min-h-screen flex flex-col items-center'>
			{/* Header and description - constrained width */}
			<div className='flex flex-col gap-10 items-center px-4 pt-10 w-full max-w-xl'>
				<div className='animate-in w-full'>
					<Header activePage='photography' />
				</div>
				<div className='flex flex-col gap-4 w-full animate-in animate-delay-1'>
					<p className='relative shrink-0 text-olive-800 dark:text-olive-100 text-sm/6 text-justify w-full'>
						There's something about shooting film that forces you to slow down. With my Leica M6,
						there's no chimping at the back of the screen to check if I nailed it. That constraint is
						the whole point. I've found that limitations make me a better photographer.
					</p>
					<p className='relative shrink-0 text-olive-800 dark:text-olive-100 text-sm/6 text-justify w-full'>
						Most of what you'll see here is street photography, candid moments and quiet scenes I
						stumbled into while walking around with no particular agenda. Film has a texture and
						honesty to it that I've never been able to replicate digitally. These photos aren't
						perfect, but they're real.
					</p>
				</div>
			</div>

			{/* Photo grid - full width */}
			<PhotographyGallery />

			{/* Footer - constrained width */}
			<div className='px-4 pb-10 w-full max-w-xl'>
				<div className='animate-in animate-delay-3 w-full'>
					<Footer />
				</div>
			</div>
		</div>
	);
}
