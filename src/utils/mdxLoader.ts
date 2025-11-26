import { ArticleData, ArticleMetadata } from './mdx';
import { allMDXContent } from '../content/writing/index';

// Parse frontmatter from MDX content
function parseFrontmatter(content: string): { metadata: ArticleMetadata; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid MDX file: No frontmatter found');
  }

  const [, frontmatterStr, bodyContent] = match;
  const metadata: Partial<ArticleMetadata> = {};

  // Parse frontmatter key-value pairs
  frontmatterStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key && value) {
      metadata[key as keyof ArticleMetadata] = value;
    }
  });

  if (!metadata.title || !metadata.description || !metadata.publishDate) {
    throw new Error('Invalid MDX file: Missing required metadata (title, description, publishDate)');
  }

  return {
    metadata: metadata as ArticleMetadata,
    content: bodyContent.trim()
  };
}

// Cache for parsed articles
const articleCache: Record<string, ArticleData> = {};

// Get article by slug
export function getArticle(slug: string): ArticleData {
  // Return from cache if available
  if (articleCache[slug]) {
    return articleCache[slug];
  }

  // Get raw MDX content
  const rawContent = allMDXContent[slug];
  if (!rawContent) {
    throw new Error(`Article "${slug}" not found`);
  }

  // Parse and cache
  const article = parseFrontmatter(rawContent);
  articleCache[slug] = article;
  return article;
}

// Get all articles
export function getAllArticles(): Record<string, ArticleData> {
  const allArticles: Record<string, ArticleData> = {};
  
  Object.keys(allMDXContent).forEach(slug => {
    allArticles[slug] = getArticle(slug);
  });
  
  return allArticles;
}
