export interface ArticleMetadata {
  title: string;
  description: string;
  publishDate: string;
  modifiedDate?: string;
  author?: string;
  ogImage?: string;
  keywords?: string;
}

export interface ArticleData {
  metadata: ArticleMetadata;
  content: string;
}
