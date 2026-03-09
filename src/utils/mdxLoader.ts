import { ArticleData, ArticleMetadata } from './mdx';

// Eagerly import all MDX files as raw strings via Vite's import.meta.glob
const mdxModules = import.meta.glob('../content/writing/*.mdx', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

// Build slug → raw content map from glob results
const allMDXContent: Record<string, string> = {};
for (const [filePath, content] of Object.entries(mdxModules)) {
  const slug = filePath.split('/').pop()!.replace('.mdx', '');
  if (!slug.startsWith('_')) {
    allMDXContent[slug] = content;
  }
}

// Parse frontmatter from MDX content
function parseFrontmatter(content: string): { metadata: ArticleMetadata; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid MDX file: No frontmatter found');
  }

  const [, frontmatterStr, bodyContent] = match;
  const metadata: Partial<ArticleMetadata> = {};

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
  if (articleCache[slug]) {
    return articleCache[slug];
  }

  const rawContent = allMDXContent[slug];
  if (!rawContent) {
    throw new Error(`Article "${slug}" not found`);
  }

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
