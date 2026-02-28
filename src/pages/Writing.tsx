import { Link } from "react-router-dom";
import { sortedArticles } from "../data/articles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Helmet } from "react-helmet";

function ArticleList() {
	return (
		<div className='flex flex-col gap-3 items-start w-full' data-name='Article List'>
			{sortedArticles.map((article) => (
				<Link
					key={article.id}
					to={`/writing/${article.id}`}
					className='flex items-center justify-between relative shrink-0 text-justify text-nowrap w-full whitespace-pre group'>
					<p className='font-semibold relative shrink-0 text-olive-800 dark:text-olive-100 text-sm group-hover:underline underline-offset-4'>
						{article.title}
					</p>
					<p className='relative shrink-0 text-sm text-olive-500 dark:text-olive-400 font-mono uppercase'>
						{article.date}
					</p>
				</Link>
			))}
		</div>
	);
}

function ColorDots() {
	return (
		<div className='flex gap-2 items-center justify-center py-2 w-full'>
			<div className='size-2'>
				<svg className='block size-full' fill='none' preserveAspectRatio='none' viewBox='0 0 8 8'>
					<circle cx='4' cy='4' fill='#E9573F' id='Ellipse 1' r='4' />
				</svg>
			</div>
			<div className='size-2'>
				<svg className='block size-full' fill='none' preserveAspectRatio='none' viewBox='0 0 8 8'>
					<circle cx='4' cy='4' fill='#F0BF2E' id='Ellipse 2' r='4' />
				</svg>
			</div>
			<div className='size-2'>
				<svg className='block size-full' fill='none' preserveAspectRatio='none' viewBox='0 0 8 8'>
					<circle cx='4' cy='4' fill='#4E964E' id='Ellipse 3' r='4' />
				</svg>
			</div>
		</div>
	);
}

export function Writing() {
	return (
		<>
			<Helmet>
				<title>Writing | Akash Bhadange</title>
				<meta
					name='description'
					content='Raw thoughts on design, building products, and the startup journey by Akash Bhadange.'
				/>
				<link rel='canonical' href='https://designerdada.com/writing' />

				{/* Open Graph */}
				<meta property='og:type' content='website' />
				<meta property='og:title' content='Writing | Akash Bhadange' />
				<meta
					property='og:description'
					content='Raw thoughts on design, building products, and the startup journey by Akash Bhadange.'
				/>
				<meta property='og:url' content='https://designerdada.com/writing' />
				<meta
					property='og:image'
					content='https://designerdada.com/assets/og-images/og-writing.jpg'
				/>

				{/* Twitter */}
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:title' content='Writing | Akash Bhadange' />
				<meta
					name='twitter:description'
					content='Raw thoughts on design, building products, and the startup journey by Akash Bhadange.'
				/>
				<meta
					name='twitter:image'
					content='https://designerdada.com/assets/og-images/og-writing.jpg'
				/>
			</Helmet>
			<div
				className='bg-olive-50 dark:bg-olive-950 relative size-full min-h-screen'
				data-name='designerdada.com/writing'>
				<div className='flex flex-col gap-6 items-center mx-auto px-4 py-10 w-full max-w-xl'>
					<div className='animate-in w-full'>
						<Header activePage='writing' />
					</div>
					<p className='relative shrink-0 text-olive-800 dark:text-olive-100 text-sm/6 text-justify w-full animate-in animate-delay-1'>
						I write whenever inspiration strikes, which means I'm pretty irregular about it. These
						are my raw thoughts on design, building products, and the startup journey. Some are
						polished, others are more stream-of-consciousness, but they all capture what I was
						thinking about at the time.
					</p>
					<div className='animate-in animate-delay-2 w-full'>
						<ArticleList />
					</div>
					{/* <MailingList /> */}
					<div className='animate-in animate-delay-3'>
						<ColorDots />
					</div>
					<div className='animate-in animate-delay-4 w-full'>
						<Footer />
					</div>
				</div>
			</div>
		</>
	);
}
