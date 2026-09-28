import { ArticleList } from "@/components/ArticleList";
import { ColorDots } from "@/components/Divider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/lib/content/articles";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
	title: "Writing",
	description: "Raw thoughts on design, building products, and the startup journey by Akash Bhadange.",
	path: "/writing",
	ogImage: siteConfig.images.ogWriting,
});

export default async function Writing() {
	const articles = await getPublishedArticles();

	return (
		<div className='bg-olive-50 dark:bg-olive-950 relative size-full min-h-screen'>
			<div className='flex flex-col gap-6 items-center mx-auto px-4 py-10 w-full max-w-xl'>
				<div className='animate-in w-full'>
					<Header activePage='writing' />
				</div>
				<p className='relative shrink-0 text-olive-800 dark:text-olive-100 text-sm/6 text-justify w-full animate-in animate-delay-1'>
					I write whenever inspiration strikes, which means I'm pretty irregular about it. These are
					my raw thoughts on design, building products, and the startup journey. Some are polished,
					others are more stream-of-consciousness, but they all capture what I was thinking about at
					the time.
				</p>
				<div className='animate-in animate-delay-3 w-full'>
					<ArticleList articles={articles} />
				</div>
				<div className='animate-in animate-delay-4'>
					<ColorDots />
				</div>
				<div className='animate-in animate-delay-4 w-full'>
					<Footer />
				</div>
			</div>
		</div>
	);
}
