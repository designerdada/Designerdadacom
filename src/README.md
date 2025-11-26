# Personal Website Template

A minimal, SEO-optimized personal website with automated MDX content management. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Automated MDX System** - Write articles in Markdown, build script handles the rest
- **SEO Optimized** - Meta tags, Open Graph, Twitter cards, JSON-LD structured data
- **Dark Mode** - Toggle between light and dark themes
- **Responsive** - Mobile-first design with centered layout (544px max width)
- **Type-Safe** - Full TypeScript support
- **Clean Design** - Source Serif 4 typography, minimal aesthetic

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

The dev server automatically generates the content index from MDX files and starts the development server at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Build output goes to `/dist` directory.

### Testing the MDX System

```bash
npm run test-mdx
```

Validates that all MDX files are properly formatted and registered.

## Publishing a New Article

### 1. Create MDX File

Create `/content/writing/my-article-name.mdx`:

```mdx
---
title: My Article Title
description: A compelling description for SEO (150-160 characters ideal)
publishDate: 26.Nov.2025
author: Akash Bhadange
ogImage: https://example.com/og-image.jpg
keywords: keyword1, keyword2, keyword3
---

Your article content goes here using standard Markdown.

## Section Heading

Write naturally with:
- **Bold** and *italic* text
- [Links](https://example.com)
- Lists and blockquotes
- Code blocks

> Blockquotes for emphasis

Simple and clean.
```

**Frontmatter Fields:**
- **Required:** `title`, `description`, `publishDate` (format: DD.MMM.YYYY)
- **Optional:** `modifiedDate`, `author`, `ogImage`, `keywords`

### 2. Register in Articles List

Edit `/data/articles.ts` and add to the array:

```typescript
export const articles: Article[] = [
  {
    id: 'my-article-name',      // Must match .mdx filename
    title: 'My Article Title',
    date: '26.Nov.2025'
  },
  // ... existing articles
];
```

### 3. Deploy

Commit and push. Your deployment platform automatically runs the build script and publishes your article.

## Project Structure

```
/
├── content/
│   └── writing/
│       ├── index.ts              # Auto-generated - DO NOT EDIT
│       ├── _template.mdx         # Template for new articles
│       └── *.mdx                 # Your articles
│
├── components/                   # React components
├── pages/                        # Page components (Home, Writing, Press, etc.)
├── data/
│   ├── articles.ts              # Article metadata & registration
│   └── favorites.ts             # Favorites data
│
├── scripts/
│   ├── generate-mdx-index.js    # Auto-generates content index
│   └── test-mdx-generation.js   # Validates MDX system
│
├── utils/
│   ├── mdx.ts                   # Type definitions
│   └── mdxLoader.ts             # MDX loader utilities
│
├── styles/
│   └── globals.css              # Global styles & design tokens
│
└── package.json                 # NPM scripts
```

## How It Works

### Automatic Content Processing

When you run `npm run dev` or `npm run build`:

1. **Build script runs** (`scripts/generate-mdx-index.js`)
2. **Scans** `/content/writing/*.mdx` files
3. **Parses** frontmatter and content
4. **Generates** `/content/writing/index.ts` with TypeScript exports
5. **App loads** articles from the generated index

### Key Points

- ⚠️ **Never edit** `/content/writing/index.ts` - it's auto-generated
- ✅ **Always edit** `.mdx` files and `/data/articles.ts`
- 📝 Files starting with `_` are ignored (templates, drafts)
- 🔗 Filename becomes URL slug: `my-article.mdx` → `/writing/my-article`

## Deployment

Works with any platform that supports Node.js builds:

### Vercel / Netlify / etc.

- **Build command:** `npm run build`
- **Output directory:** `dist`

The build script runs automatically before every build.

### CI/CD Example

See `/.github/workflows/build.yml` for a GitHub Actions example.

## Customization

### Design Tokens

Edit `/styles/globals.css` to customize:
- Colors
- Typography
- Spacing
- Border radius

### Components

Create reusable components in `/components/` and import them:

```tsx
import { ComponentName } from './components/component-name';
```

### Pages

Add new pages in `/pages/` and configure routing in `/App.tsx`.

### Content Types

To add Press or Favorites content:
1. Create `/content/press/` or `/content/favorites/` directories
2. Add MDX files
3. Update build script to process those directories
4. Create loaders in `/utils/`

## Troubleshooting

### Articles not showing up?

1. Check MDX file exists in `/content/writing/`
2. Verify frontmatter is valid (required fields present)
3. Confirm article is registered in `/data/articles.ts`
4. Run `npm run test-mdx` to see specific errors

### Build failing?

```bash
npm run generate-mdx
```

This shows detailed error messages from the content processor.

### Content not updating?

Force regeneration:

```bash
npm run generate-mdx
npm run dev
```

## Tips & Best Practices

- **Use the template:** Copy `/content/writing/_template.mdx` for new articles
- **Preview locally:** Always test with `npm run dev` before deploying
- **Optimize descriptions:** Keep SEO descriptions 150-160 characters
- **Add OG images:** Include `ogImage` for better social sharing
- **Use kebab-case:** File names should be lowercase with hyphens

## Available Commands

```bash
npm run dev          # Start development server (auto-generates MDX)
npm run build        # Build for production (auto-generates MDX)
npm run generate-mdx # Manually regenerate content index
npm run test-mdx     # Test and validate MDX system
```

## Technology Stack

- React 18+ - UI framework
- TypeScript - Type safety
- Tailwind CSS v4.0 - Styling
- MDX - Content format
- React Router - Client-side routing
- Vite - Build tool

## License

Private project - All rights reserved

## Author

**Akash Bhadange**

---

## For Template Users

If you're using this as a template for your own site:

1. **Update personal info:**
   - Replace name/bio in components
   - Update `/data/articles.ts` and `/data/favorites.ts`
   - Change author in frontmatter

2. **Customize design:**
   - Edit `/styles/globals.css` for colors/typography
   - Modify layout components as needed

3. **Add your content:**
   - Create your MDX articles in `/content/writing/`
   - Register them in `/data/articles.ts`

4. **Deploy:**
   - Push to GitHub
   - Connect to Vercel/Netlify
   - Done!

---

**Questions or issues?** The build scripts provide detailed error messages to help you debug.