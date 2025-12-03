import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read articles from articles.ts
const articlesPath = path.join(__dirname, '../data/articles.ts');
const articlesContent = fs.readFileSync(articlesPath, 'utf-8');

// Extract article IDs from the articles array
const articleMatches = articlesContent.matchAll(/id:\s*['"](.+?)['"]/g);
const articleIds = Array.from(articleMatches, m => m[1]);

// Read base index.html from build directory
const buildDir = path.join(__dirname, '../../build');
const baseHtmlPath = path.join(buildDir, 'index.html');

if (!fs.existsSync(baseHtmlPath)) {
  console.error('❌ Build directory not found. Run `npm run build` first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');

// Parse MDX frontmatter
function parseFrontmatter(mdxContent) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = mdxContent.match(frontmatterRegex);

  if (!match) return {};

  const frontmatter = {};
  const lines = match[1].split('\n');

  lines.forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      frontmatter[key.trim()] = valueParts.join(':').trim();
    }
  });

  return frontmatter;
}

// Inject meta tags into HTML
function injectMetaTags(html, metadata) {
  const $ = cheerio.load(html);

  // Remove existing meta tags that we'll replace
  $('meta[property^="og:"]').remove();
  $('meta[name^="twitter:"]').remove();
  $('meta[property^="article:"]').remove();
  $('meta[name="description"]').remove();
  $('meta[name="keywords"]').remove();
  $('meta[name="author"]').remove();
  $('link[rel="canonical"]').remove();
  $('script[type="application/ld+json"]').remove();

  // Update title
  $('title').text(`${metadata.title} | Akash Bhadange`);

  // Add basic meta tags
  $('head').append(`
    <meta name="description" content="${metadata.description}" />
    <meta name="author" content="${metadata.author || 'Akash Bhadange'}" />
    ${metadata.keywords ? `<meta name="keywords" content="${metadata.keywords}" />` : ''}
    <link rel="canonical" href="${metadata.canonicalUrl}" />

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${metadata.title}" />
    <meta property="og:description" content="${metadata.description}" />
    <meta property="og:url" content="${metadata.canonicalUrl}" />
    <meta property="og:site_name" content="Akash Bhadange" />
    <meta property="og:image" content="${metadata.ogImage}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@designerdada" />
    <meta name="twitter:creator" content="@designerdada" />
    <meta name="twitter:title" content="${metadata.title}" />
    <meta name="twitter:description" content="${metadata.description}" />
    <meta name="twitter:image" content="${metadata.ogImage}" />

    <!-- Article specific -->
    <meta property="article:published_time" content="${metadata.publishDate}" />
    <meta property="article:modified_time" content="${metadata.modifiedDate || metadata.publishDate}" />
    <meta property="article:author" content="${metadata.author || 'Akash Bhadange'}" />

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": metadata.title,
      "description": metadata.description,
      "image": metadata.ogImage,
      "datePublished": metadata.publishDate,
      "dateModified": metadata.modifiedDate || metadata.publishDate,
      "author": {
        "@type": "Person",
        "name": metadata.author || "Akash Bhadange",
        "url": "https://designerdada.com"
      },
      "publisher": {
        "@type": "Person",
        "name": "Akash Bhadange",
        "url": "https://designerdada.com"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": metadata.canonicalUrl
      },
      "keywords": metadata.keywords || ""
    })}
    </script>
  `);

  return $.html();
}

// Generate prerendered HTML for each article
function prerenderArticles() {
  let successCount = 0;

  articleIds.forEach(articleId => {
    try {
      // Read MDX file
      const mdxPath = path.join(__dirname, `../content/writing/${articleId}.mdx`);
      if (!fs.existsSync(mdxPath)) {
        console.warn(`⚠️  MDX file not found for ${articleId}`);
        return;
      }

      const mdxContent = fs.readFileSync(mdxPath, 'utf-8');
      const frontmatter = parseFrontmatter(mdxContent);

      // Prepare metadata
      const metadata = {
        title: frontmatter.title,
        description: frontmatter.description,
        author: frontmatter.author || 'Akash Bhadange',
        publishDate: frontmatter.publishDate,
        modifiedDate: frontmatter.modifiedDate,
        keywords: frontmatter.keywords,
        ogImage: frontmatter.ogImage || 'https://designerdada.com/assets/og-images/og-default.jpg',
        canonicalUrl: `https://designerdada.com/writing/${articleId}`
      };

      // Generate HTML with injected meta tags
      const htmlWithMeta = injectMetaTags(baseHtml, metadata);

      // Create directory structure: build/writing/article-slug/index.html
      const articleDir = path.join(buildDir, 'writing', articleId);
      if (!fs.existsSync(articleDir)) {
        fs.mkdirSync(articleDir, { recursive: true });
      }

      // Write the prerendered HTML
      const outputPath = path.join(articleDir, 'index.html');
      fs.writeFileSync(outputPath, htmlWithMeta);

      successCount++;
    } catch (error) {
      console.error(`❌ Error prerendering ${articleId}:`, error.message);
    }
  });

  return successCount;
}

// Add meta tags for static pages
function prerenderStaticPages() {
  const pages = [
    {
      path: '',
      title: 'Akash Bhadange',
      description: 'Product designer, founder, and builder. Currently building Peerlist.',
      ogImage: 'https://designerdada.com/assets/og-images/og-default.jpg'
    },
    {
      path: 'writing',
      title: 'Writing | Akash Bhadange',
      description: 'Thoughts on design, products, and building things that matter.',
      ogImage: 'https://designerdada.com/assets/og-images/og-writing.jpg'
    },
    {
      path: 'favorites',
      title: 'Favorites | Akash Bhadange',
      description: 'A curated collection of beautifully designed products, inspiring people, and websites that have caught my attention.',
      ogImage: 'https://designerdada.com/assets/og-images/og-favorites.jpg'
    }
  ];

  pages.forEach(page => {
    try {
      const $ = cheerio.load(baseHtml);

      // Update title
      $('title').text(page.title);

      // Add/update meta tags
      if ($('meta[name="description"]').length) {
        $('meta[name="description"]').attr('content', page.description);
      } else {
        $('head').append(`<meta name="description" content="${page.description}" />`);
      }

      // Add canonical and Open Graph tags
      $('head').append(`
        <link rel="canonical" href="https://designerdada.com/${page.path}" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="${page.title}" />
        <meta property="og:description" content="${page.description}" />
        <meta property="og:url" content="https://designerdada.com/${page.path}" />
        <meta property="og:image" content="${page.ogImage}" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${page.title}" />
        <meta name="twitter:description" content="${page.description}" />
        <meta name="twitter:image" content="${page.ogImage}" />
      `);

      const html = $.html();

      // Write to appropriate location
      let outputPath;
      if (page.path === '') {
        outputPath = path.join(buildDir, 'index.html');
      } else {
        const pageDir = path.join(buildDir, page.path);
        if (!fs.existsSync(pageDir)) {
          fs.mkdirSync(pageDir, { recursive: true });
        }
        outputPath = path.join(pageDir, 'index.html');
      }

      fs.writeFileSync(outputPath, html);
    } catch (error) {
      console.error(`❌ Error prerendering ${page.path}:`, error.message);
    }
  });
}

// Main execution
console.log('🚀 Starting prerendering...\n');

// Prerender static pages
console.log('📄 Prerendering static pages...');
prerenderStaticPages();
console.log('✅ Static pages prerendered\n');

// Prerender article pages
console.log('📝 Prerendering articles...');
const count = prerenderArticles();
console.log(`✅ Successfully prerendered ${count}/${articleIds.length} articles\n`);

console.log('🎉 Prerendering complete!');
console.log('💡 All pages now have SEO-friendly meta tags for social media crawlers.');
