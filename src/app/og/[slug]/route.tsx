import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getArticleBySlug, publishedSlugParams } from "@/lib/content/articles";
import { ArticleOgImage, OG_FONT, OG_SIZE } from "@/lib/og/ArticleOgImage";

export const generateStaticParams = publishedSlugParams;

/**
 * Auto-generated Open Graph image for articles without an uploaded one. The `?v=` query
 * (see lib/og/version.ts) is only a cache key, so edits to the title/description get a new URL.
 */
export async function GET(request: Request, { params }: RouteContext<"/og/[slug]">) {
	const { slug } = await params;
	const result = await getArticleBySlug(slug);
	if (!result?.article) return new Response("Not found", { status: 404 });
	const { title, description } = result.article;

	const [serifItalic, sansRegular, sansMedium, avatar] = await Promise.all([
		// Literal paths so file tracing bundles just these files, not the whole project.
		readFile(join(process.cwd(), "src/assets/fonts/IMFellGreatPrimer-Italic.ttf")),
		readFile(join(process.cwd(), "src/assets/fonts/SchibstedGrotesk-Regular.woff")),
		readFile(join(process.cwd(), "src/assets/fonts/SchibstedGrotesk-Medium.woff")),
		readFile(join(process.cwd(), "public/assets/og-avatar.png")),
	]);

	return new ImageResponse(
		(
			<ArticleOgImage
				title={title}
				description={description}
				avatarSrc={`data:image/png;base64,${avatar.toString("base64")}`}
			/>
		),
		{
			...OG_SIZE,
			headers: { "Cache-Control": cacheControl(request) },
			fonts: [
				{ name: OG_FONT.serif, data: serifItalic, style: "italic", weight: 400 },
				{ name: OG_FONT.sans, data: sansRegular, style: "normal", weight: 400 },
				{ name: OG_FONT.sans, data: sansMedium, style: "normal", weight: 500 },
			],
		},
	);
}

/** Versioned URLs never change content, so they can be cached for a long time; bare ones briefly. */
function cacheControl(request: Request) {
	return new URL(request.url).searchParams.has("v")
		? "public, max-age=86400, s-maxage=31536000, immutable"
		: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";
}
