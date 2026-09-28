import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";

/**
 * Article Open Graph card (Figma: Designerdada › "outcomes", node 222:48).
 * Inline styles only, so the same markup renders through next/og (Satori) on the server
 * and as regular DOM for the live preview in the editor.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_FONT = { serif: "IM Fell Great Primer", sans: "Schibsted Grotesk" } as const;

const COLOR = { background: "#f4f4f0", title: "#2b2b22", description: "#7c7c67", byline: "#0d0d0d" };

// Works in both Satori and browsers; long copy ends in an ellipsis instead of overflowing.
const clamp = (lines: number): CSSProperties => ({
	display: "-webkit-box",
	WebkitBoxOrient: "vertical",
	WebkitLineClamp: lines,
	overflow: "hidden",
	textOverflow: "ellipsis",
});

interface ArticleOgImageProps {
	title: string;
	description: string;
	avatarSrc: string;
}

export function ArticleOgImage({ title, description, avatarSrc }: ArticleOgImageProps) {
	return (
		<div
			style={{
				width: OG_SIZE.width,
				height: OG_SIZE.height,
				display: "flex",
				background: COLOR.background,
				padding: "80px 318px 81px 120px",
			}}>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					width: "100%",
					height: "100%",
				}}>
				<div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
					<div
						style={{
							...clamp(3),
							fontFamily: OG_FONT.serif,
							fontStyle: "italic",
							fontSize: 64,
							lineHeight: 1.2,
							color: COLOR.title,
						}}>
						{title || "Untitled"}
					</div>
					{description && (
						<div
							style={{
								...clamp(3),
								fontFamily: OG_FONT.sans,
								fontWeight: 400,
								fontSize: 32,
								lineHeight: 1.4,
								color: COLOR.description,
							}}>
							{description}
						</div>
					)}
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<img
						src={avatarSrc}
						alt=''
						width={40}
						height={40}
						style={{ width: 40, height: 40, borderRadius: 360, objectFit: "cover" }}
					/>
					<div
						style={{
							display: "flex",
							alignItems: "baseline",
							whiteSpace: "pre",
							color: COLOR.byline,
							lineHeight: 1.4,
						}}>
						<span style={{ fontFamily: OG_FONT.sans, fontWeight: 500, fontSize: 24 }}>
							{`${siteConfig.author.name} `}
						</span>
						<span style={{ fontFamily: OG_FONT.serif, fontStyle: "italic", fontSize: 28 }}>aka</span>
						<span style={{ fontFamily: OG_FONT.sans, fontWeight: 500, fontSize: 24 }}>
							{` ${siteConfig.author.handle}`}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
