import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/lib/json-ld";

const GA_ID = "G-SRE9SMCM6N";

const siteJsonLd = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "Person",
			"@id": `${siteConfig.url}/#person`,
			name: siteConfig.author.name,
			alternateName: siteConfig.author.handle,
			url: siteConfig.url,
			image: `${siteConfig.url}${siteConfig.images.profile}`,
			jobTitle: siteConfig.author.jobTitle,
			description: siteConfig.description,
			address: {
				"@type": "PostalAddress",
				addressLocality: "San Francisco",
				addressRegion: "CA",
				addressCountry: "US",
			},
			sameAs: [siteConfig.social.twitter, siteConfig.social.peerlist, siteConfig.social.instagram],
		},
		{
			"@type": "WebSite",
			"@id": `${siteConfig.url}/#website`,
			url: siteConfig.url,
			name: `${siteConfig.author.name} - ${siteConfig.author.handle}`,
			description: siteConfig.description,
			publisher: { "@id": `${siteConfig.url}/#person` },
			inLanguage: siteConfig.locale,
		},
	],
};

/** Public site chrome: structured data and analytics (kept out of /admin). */
export default function SiteLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<JsonLd data={siteJsonLd} />
			{children}

			{/* GA4 tracks client-side navigations through its enhanced measurement history events */}
			<Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy='afterInteractive' />
			<Script id='gtag-init' strategy='afterInteractive'>
				{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
			</Script>
			<Script
				src='https://cloud.umami.is/script.js'
				data-website-id='7f8ad883-9255-44a6-8863-a8ce9bac7e8f'
				strategy='afterInteractive'
			/>
			<Script
				src='https://ghostlyx.com/js/script.min.js'
				data-domain='designerdada.com'
				data-site-id='gx_EjWdC5dS0Z0t'
				strategy='afterInteractive'
			/>
			<Analytics />
		</>
	);
}
