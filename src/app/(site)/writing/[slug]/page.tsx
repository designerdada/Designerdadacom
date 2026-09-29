import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleList } from "@/components/ArticleList";
import { ColorDots } from "@/components/Divider";
import { Footer } from "@/components/Footer";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getCanonicalUrl, siteConfig } from "@/config/site";
import {
	articleOgImage,
	articleUrl,
	getArticleBySlug,
	getPublishedArticles,
	publishedSlugParams,
	type PublishedArticle,
} from "@/lib/content/articles";
import { formatDisplayDate, toISO } from "@/lib/dates";
import { JsonLd } from "@/lib/json-ld";
import { ArticleBody } from "@/lib/markdown/ArticleBody";
import { openGraphDefaults, rssAlternate, twitterDefaults } from "@/lib/metadata";

type Props = PageProps<"/writing/[slug]">;

export const generateStaticParams = publishedSlugParams;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const result = await getArticleBySlug(slug);
	if (!result?.article) return {};
	const article = result.article;
	const url = articleUrl(article);
	const ogImage = articleOgImage(article);
	const title = article.seoTitle || article.title;
	const publishedTime = toISO(article.publishedAt);
	const modifiedTime = toISO(article.modifiedAt ?? article.publishedAt);

	return {
		title,
		description: article.description,
		authors: [{ name: article.author, url: siteConfig.url }],
		keywords: article.keywords,
		alternates: { canonical: url, types: rssAlternate },
		openGraph: {
			...openGraphDefaults,
			type: "article",
			title,
			description: article.description,
			url,
			images: [{ url: ogImage, width: 1200, height: 630 }],
			publishedTime,
			modifiedTime,
			authors: [article.author],
			tags: article.keywords,
		},
		twitter: {
			...twitterDefaults,
			title,
			description: article.description,
			images: [ogImage],
		},
	};
}

/**
 * The article is resolved before rendering (not inside <Suspense>) so unknown slugs get a real
 * 404 status and renamed slugs a real 308, instead of a streamed soft-404 or meta refresh.
 */
export default async function WritingDetail({ params }: Props) {
	const { slug } = await params;
	const result = await getArticleBySlug(slug);
	if (!result) notFound();
	if (result.redirectTo) permanentRedirect(`/writing/${result.redirectTo}`);
	const article = result.article!;

	return (
		<div className='bg-olive-50 dark:bg-olive-950 relative size-full min-h-screen'>
			<div className='flex flex-col gap-6 items-start mx-auto px-4 py-10 w-full max-w-xl'>
				<JsonLd data={articleJsonLd(article)} />
				<JsonLd data={breadcrumbJsonLd(article)} />

				<div className='animate-in w-full'>
					<ArticleBreadcrumb title={article.title} />
				</div>

				<div className='animate-in animate-delay-1 flex flex-col gap-1 items-start relative shrink-0 w-full'>
					<h1 className='font-serif italic relative shrink-0 text-olive-800 dark:text-olive-100 text-4xl w-full'>
						{article.title}
					</h1>
					<time
						dateTime={toISO(article.publishedAt)}
						className='font-mono text-sm text-olive-500 dark:text-olive-400 uppercase'>
						{formatDisplayDate(article.publishedAt)}
					</time>
				</div>

				<article className='animate-in animate-delay-2 w-full'>
					<ArticleBody markdown={article.body} />
				</article>

				<div className='animate-in animate-delay-3 w-full'>
					<ColorDots />
				</div>
				<div className='animate-in animate-delay-4 w-full'>
					<ReadMore currentSlug={article.slug} />
				</div>
				<div className='animate-in animate-delay-5 w-full'>
					<ColorDots />
				</div>
				<div className='animate-in animate-delay-6 w-full'>
					<Footer />
				</div>
			</div>
		</div>
	);
}

function ArticleBreadcrumb({ title }: { title: string }) {
	return (
		<Breadcrumb>
			<BreadcrumbList className='gap-2'>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href='/' className='flex gap-2 items-center'>
							<div className='relative rounded-full shrink-0 size-6'>
								<img
									alt={siteConfig.author.name}
									className='absolute inset-0 max-w-none object-cover pointer-events-none rounded-full size-full'
									src={siteConfig.images.profile}
								/>
							</div>
							<span className='text-sm'>{siteConfig.author.name}</span>
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator>
					<span className='text-xs text-olive-500'>/</span>
				</BreadcrumbSeparator>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href='/writing' className='text-sm'>
							Writing
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator>
					<span className='text-xs text-olive-500'>/</span>
				</BreadcrumbSeparator>
				<BreadcrumbItem>
					<BreadcrumbPage className='text-sm'>{title}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

async function ReadMore({ currentSlug }: { currentSlug: string }) {
	const others = (await getPublishedArticles()).filter((a) => a.slug !== currentSlug).slice(0, 5);
	if (others.length === 0) return null;

	return (
		<div className='flex flex-col gap-4 items-end relative shrink-0 w-full'>
			<p className='font-medium relative shrink-0 w-full text-olive-500 text-sm'>Further reading</p>
			<ArticleList articles={others} />
		</div>
	);
}

function articleJsonLd(article: PublishedArticle) {
	const url = articleUrl(article);
	const person = { "@id": `${siteConfig.url}/#person` };
	// Guest authors get their own name; the site owner links to the Person node (with sameAs profiles).
	const author =
		article.author === siteConfig.author.name
			? person
			: { "@type": "Person", name: article.author };
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: article.title,
		description: article.description,
		image: articleOgImage(article),
		url,
		datePublished: toISO(article.publishedAt),
		dateModified: toISO(article.modifiedAt ?? article.publishedAt),
		author,
		publisher: person,
		isPartOf: { "@id": `${siteConfig.url}/#website` },
		mainEntityOfPage: { "@type": "WebPage", "@id": url },
		keywords: article.keywords.join(", "),
		wordCount: article.body.split(/\s+/).filter(Boolean).length,
		inLanguage: siteConfig.locale,
	};
}

function breadcrumbJsonLd(article: PublishedArticle) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
			{ "@type": "ListItem", position: 2, name: "Writing", item: getCanonicalUrl("/writing") },
			{ "@type": "ListItem", position: 3, name: article.title, item: articleUrl(article) },
		],
	};
}
