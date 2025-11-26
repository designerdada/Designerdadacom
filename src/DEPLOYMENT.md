# Deployment Guide

## Quick Start

Your site uses an automated build process that handles MDX content generation.

## Prerequisites

Make sure you have Node.js installed (v16 or higher).

## Local Development

```bash
# Start development server (auto-generates MDX index)
npm run dev
```

The dev server will:
1. Automatically scan and process all MDX files
2. Generate the content index
3. Start the development server

## Production Build

```bash
# Build for production (auto-generates MDX index)
npm run build
```

The build process will:
1. Automatically process all MDX articles
2. Generate optimized production build
3. Output to `/dist` directory

## Deploy to Any Platform

### Vercel

1. Connect your repository to Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Done! Vercel will automatically run the build script

### Netlify

1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Done! Netlify will automatically run the build script

### Other Platforms

Any platform that supports Node.js builds will work:
- Build command: `npm run build`
- Output: `dist/`

## Publishing a New Article

1. Create `/content/writing/your-article.mdx`
2. Add entry to `/data/articles.ts`
3. Commit and push to your repository
4. Your deployment platform automatically rebuilds

That's it! No manual steps needed.

## Build Script

The `/scripts/generate-mdx-index.js` script runs automatically before every build. It:
- Scans for `.mdx` files
- Generates `/content/writing/index.ts`
- Makes articles available to your app

## Troubleshooting

### Articles not showing up?

1. Check that the MDX file exists in `/content/writing/`
2. Verify the article is added to `/data/articles.ts`
3. Ensure frontmatter is valid (title, description, publishDate required)
4. Try running `npm run generate-mdx` manually to see any errors

### Build failing?

Run the generator manually to see detailed errors:
```bash
npm run generate-mdx
```

This will show exactly which MDX file has issues.
