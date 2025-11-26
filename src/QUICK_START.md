# Quick Start: Adding a New Article

## Step 1: Create Your MDX File

Create a new file in `/content/writing/` with a kebab-case name:

```
/content/writing/my-new-article.mdx
```

## Step 2: Add Frontmatter and Content

```mdx
---
title: My New Article
description: A compelling description for SEO
publishDate: 26.Nov.2025
author: Akash Bhadange
---

Your article content goes here...

## Section Heading

Write using standard Markdown.
```

## Step 3: Register in Articles List

Add to `/data/articles.ts`:

```typescript
export const articles: Article[] = [
  // Add at the top for newest first
  {
    id: 'my-new-article',        // Must match filename
    title: 'My New Article',
    date: '26.Nov.2025'
  },
  // ... existing articles
];
```

## Step 4: Build/Deploy

```bash
# For local development
npm run dev

# For production build
npm run build
```

## That's It! 🎉

The build script automatically:
- Finds your new MDX file
- Processes the frontmatter
- Generates the TypeScript exports
- Makes it available to your app

## Pro Tips

- Use `/content/writing/_template.mdx` as a starting point
- The `id` in articles.ts must exactly match the MDX filename (without .mdx)
- Files starting with `_` are ignored
- Required frontmatter: `title`, `description`, `publishDate`
- Optional: `modifiedDate`, `author`, `ogImage`, `keywords`

## Need Help?

- See `/content/README.md` for detailed documentation
- Check `/DEPLOYMENT.md` for deployment info
- Look at existing articles for examples
