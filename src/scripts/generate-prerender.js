import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure marked to not escape HTML (allow iframes, etc.)
marked.setOptions({
  mangle: false,
  headerIds: false
});

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

// Extract markdown content (without frontmatter)
function extractMarkdownContent(mdxContent) {
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
  const content = mdxContent.replace(frontmatterRegex, '').trim();
  return content;
}

// Inject meta tags and article content into HTML
function injectMetaTags(html, metadata, articleContent = null) {
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

  // Add basic meta tags with data-react-helmet attribute to prevent duplicates
  $('head').append(`
    <meta name="description" content="${metadata.description}" data-react-helmet="true" />
    <meta name="author" content="${metadata.author || 'Akash Bhadange'}" data-react-helmet="true" />
    ${metadata.keywords ? `<meta name="keywords" content="${metadata.keywords}" data-react-helmet="true" />` : ''}
    <link rel="canonical" href="${metadata.canonicalUrl}" data-react-helmet="true" />

    <!-- Open Graph -->
    <meta property="og:type" content="article" data-react-helmet="true" />
    <meta property="og:title" content="${metadata.title}" data-react-helmet="true" />
    <meta property="og:description" content="${metadata.description}" data-react-helmet="true" />
    <meta property="og:url" content="${metadata.canonicalUrl}" data-react-helmet="true" />
    <meta property="og:site_name" content="Akash Bhadange" data-react-helmet="true" />
    <meta property="og:image" content="${metadata.ogImage}" data-react-helmet="true" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" data-react-helmet="true" />
    <meta name="twitter:site" content="@designerdada" data-react-helmet="true" />
    <meta name="twitter:creator" content="@designerdada" data-react-helmet="true" />
    <meta name="twitter:title" content="${metadata.title}" data-react-helmet="true" />
    <meta name="twitter:description" content="${metadata.description}" data-react-helmet="true" />
    <meta name="twitter:image" content="${metadata.ogImage}" data-react-helmet="true" />

    <!-- Article specific -->
    <meta property="article:published_time" content="${metadata.publishDate}" data-react-helmet="true" />
    <meta property="article:modified_time" content="${metadata.modifiedDate || metadata.publishDate}" data-react-helmet="true" />
    <meta property="article:author" content="${metadata.author || 'Akash Bhadange'}" data-react-helmet="true" />

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

  // Inject article content into body if provided
  if (articleContent) {
    // Convert markdown to HTML
    const htmlContent = marked.parse(articleContent);

    // Wrap content in semantic HTML structure for LLMs
    // Add data-prerendered attribute to indicate this content is already rendered
    const wrappedContent = `
      <div id="root" data-prerendered="true">
        <article style="max-width: 65ch; margin: 0 auto; padding: 2rem; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333;">
          <header>
            <h1 style="font-size: 2rem; font-weight: 600; margin-bottom: 0.5rem;">${metadata.title}</h1>
            <p style="color: #666; font-size: 0.9rem;">By ${metadata.author || 'Akash Bhadange'} • ${metadata.publishDate}</p>
          </header>
          <main style="margin-top: 2rem;">
            ${htmlContent}
          </main>
        </article>
        <!-- React will hydrate this container -->
      </div>
    `;

    // Replace the empty root div with our content
    $('#root').replaceWith(wrappedContent);
  }

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
      const markdownContent = extractMarkdownContent(mdxContent);

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

      // Generate HTML with injected meta tags and article content
      const htmlWithMeta = injectMetaTags(baseHtml, metadata, markdownContent);

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
    },
    {
      path: 'photography',
      title: 'Photography | Akash Bhadange',
      description: 'A collection of photographs capturing moments and perspectives.',
      ogImage: 'https://designerdada.com/assets/og-images/og-default.jpg'
    }
  ];

  pages.forEach(page => {
    try {
      const $ = cheerio.load(baseHtml);

      // Update title
      $('title').text(page.title);

      // Add/update meta tags
      if ($('meta[name="description"]').length) {
        $('meta[name="description"]').attr('content', page.description).attr('data-react-helmet', 'true');
      } else {
        $('head').append(`<meta name="description" content="${page.description}" data-react-helmet="true" />`);
      }

      // Add canonical and Open Graph tags with data-react-helmet to prevent duplicates
      $('head').append(`
        <link rel="canonical" href="https://designerdada.com/${page.path}" data-react-helmet="true" />

        <meta property="og:type" content="website" data-react-helmet="true" />
        <meta property="og:title" content="${page.title}" data-react-helmet="true" />
        <meta property="og:description" content="${page.description}" data-react-helmet="true" />
        <meta property="og:url" content="https://designerdada.com/${page.path}" data-react-helmet="true" />
        <meta property="og:image" content="${page.ogImage}" data-react-helmet="true" />

        <meta name="twitter:card" content="summary_large_image" data-react-helmet="true" />
        <meta name="twitter:title" content="${page.title}" data-react-helmet="true" />
        <meta name="twitter:description" content="${page.description}" data-react-helmet="true" />
        <meta name="twitter:image" content="${page.ogImage}" data-react-helmet="true" />
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
console.log('🤖 Articles are now readable by LLMs and search engines without JavaScript!');
