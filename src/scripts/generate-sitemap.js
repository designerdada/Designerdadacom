import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { siteConfig } from './site-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = siteConfig.url;

// Read articles from articles.ts
const articlesPath = path.join(__dirname, '../data/articles.ts');
const articlesContent = fs.readFileSync(articlesPath, 'utf-8');

// Extract article IDs and dates from the articles array
const articleEntries = [];
const articleRegex = /id:\s*['"](.+?)['"][\s\S]*?date:\s*['"](.+?)['"]/g;
let match;
while ((match = articleRegex.exec(articlesContent)) !== null) {
  const [, id, dateStr] = match;
  // Parse date like "07.Dec.2025" to ISO format
  const parsed = new Date(dateStr.replace(/\./g, ' '));
  const isoDate = !isNaN(parsed.getTime()) ? parsed.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  articleEntries.push({ id, date: isoDate });
}

// Current date in ISO format (for static pages)
const currentDate = new Date().toISOString().split('T')[0];

// Static pages
const staticPages = [
  { url: '', changefreq: 'weekly', priority: '1.0' },
  { url: 'writing', changefreq: 'weekly', priority: '0.9' },
  { url: 'photography', changefreq: 'weekly', priority: '0.8' },
  { url: 'favorites', changefreq: 'monthly', priority: '0.7' },
];

// Generate sitemap XML
const generateSitemap = () => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add article pages with per-article dates
  articleEntries.forEach(({ id, date }) => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/writing/${id}</loc>\n`;
    xml += `    <lastmod>${date}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
};

// Write sitemap to public folder
const sitemapPath = path.join(__dirname, '../../public/sitemap.xml');
const sitemap = generateSitemap();
fs.writeFileSync(sitemapPath, sitemap);

console.log(`✅ Sitemap generated with ${articleEntries.length} articles`);
console.log(`📍 Location: public/sitemap.xml`);
