import { ArticleData } from '../utils/mdx';
import { getAllArticles } from '../utils/mdxLoader';

// Load all articles from MDX files
export const articleContents: Record<string, ArticleData> = getAllArticles();
