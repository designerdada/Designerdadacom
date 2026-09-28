/** The editable fields of an article, as held by the editor before autosave. */
export interface ArticleDraft {
	title: string;
	description: string;
	body: string;
	slug: string;
	seoTitle: string;
	keywords: string[];
	canonicalUrl: string;
	author: string;
	publishedAt?: number | null; // null = cleared by the author
}
