# Content Directory

This directory contains all MDX content for the website, organized by section.

## Structure

```
/content
  ├── README.md
  └── /writing
      ├── index.ts              # Auto-generated - DO NOT EDIT
      ├── _template.mdx         # Template for new articles
      └── *.mdx                 # Your article files
```

## Adding a New Article

**It's simple - just 2 steps:**

1. **Create your MDX file** in `/content/writing/your-article-slug.mdx`
2. **Add to articles list** in `/data/articles.ts`:
   ```typescript
   {
     id: 'your-article-slug',
     title: 'Your Article Title',
     date: '15.Nov.2025'
   }
   ```

That's it! The build script automatically handles the rest.

## MDX File Format

Each MDX file must start with frontmatter:

```mdx
---
title: Your Article Title
description: A brief description for SEO and previews
publishDate: DD.MMM.YYYY
modifiedDate: DD.MMM.YYYY
author: Akash Bhadange
ogImage: https://designerdada.com/media/og-images/your-image.jpg
keywords: keyword1, keyword2, keyword3
---

Your article content goes here...

## Section Heading

Write your content using standard Markdown syntax.
```

### Required Fields

- `title` - The article title
- `description` - SEO description (shown in previews)
- `publishDate` - Publication date in format: `DD.MMM.YYYY` (e.g., `15.Nov.2025`)

### Optional Fields

- `modifiedDate` - Last modified date
- `author` - Author name (defaults to "Akash Bhadange")
- `ogImage` - Open Graph image URL for social sharing
- `keywords` - Comma-separated keywords for SEO

## How It Works

When you run `npm run dev` or `npm run build`:

1. The build script scans `/content/writing/*.mdx` files
2. Automatically generates `/content/writing/index.ts` with all articles
3. Your app loads articles from the generated index

**IMPORTANT:** Never edit `index.ts` manually - it's auto-generated and your changes will be overwritten!

## File Naming

- Use kebab-case: `my-article-title.mdx`
- The filename becomes the URL slug: `/writing/my-article-title`
- Files starting with `_` are ignored (like `_template.mdx`)

## Markdown Features

Full Markdown support:

- **Headings**: `#`, `##`, `###`
- **Lists**: Ordered and unordered
- **Links**: `[text](url)`
- **Bold**: `**text**` and **Italic**: `*text*`
- **Blockquotes**: `> quote`
- **Code blocks**: ` ```language `
- **Horizontal rules**: `---`
- **Images**: `![alt](url)`

## Template

Use `/content/writing/_template.mdx` as a starting point for new articles.

## Examples

See existing articles in `/content/writing/` for reference:
- `design-is-the-moat.mdx`
- `growth-without-hacks.mdx`
- `make-something-you-want.mdx`
