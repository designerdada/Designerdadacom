# Personal Website Template

A minimal, SEO-optimized personal website built with React, TypeScript, Vite, and Tailwind CSS. Originally created by [Akash Bhadange](https://designerdada.com).

## Features

- Minimal, centered single-column layout (544px max width)
- Dark mode support with system preference detection
- MDX-powered blog with automatic content indexing
- SEO-optimized with Open Graph, Twitter Cards, and JSON-LD
- Fully responsive design
- Fast builds with Vite
- Optional: Photography gallery with Cloudflare R2 storage

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v6
- **Content**: MDX for blog posts
- **UI Components**: Radix UI primitives
- **Deployment**: Vercel

## Quick Start (Fork Setup)

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
```

### 2. Configure Your Site

Update the following files with your information:

#### Required: Site Configuration

Edit `src/config/site.ts` with your details:
- Site name and URL
- Author name, email, and bio
- Social media links
- Project URLs

Edit `src/scripts/site-config.js` with the same information (used by build scripts).

#### Required: Personal Content

1. Replace `public/assets/profile.png` with your profile photo
2. Replace `public/assets/footer-signature.png` with your signature/logo
3. Update `public/assets/og-images/` with your Open Graph images
4. Update `src/pages/Home.tsx` with your bio text
5. Update `src/components/Header.tsx` with your name

#### Required: Meta Tags

Search and replace these values across the codebase:
- `designerdada.com` → your domain
- `Akash Bhadange` → your name
- `@designerdada` → your handle
- `akash@peerlist.io` → your email

Files to update:
- `src/App.tsx` (JSON-LD and meta tags)
- `src/pages/*.tsx` (page-specific meta tags)
- `src/scripts/generate-prerender.js`

### 3. Environment Variables (Optional)

Copy `.env.example` to `.env` if you're using the photography feature:

```bash
cp .env.example .env
```

### 4. Run Development Server

```bash
npm run dev
```

## Project Structure

```
/
├── src/
│   ├── components/     # React components
│   │   ├── ui/        # Radix UI components
│   │   └── figma/     # Figma import components
│   ├── config/        # Site configuration
│   ├── content/       # MDX content files
│   │   └── writing/   # Blog articles (*.mdx)
│   ├── data/          # Static data and article metadata
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── scripts/       # Build scripts
│   └── utils/         # Utility functions
├── public/            # Static assets
└── cloudflare-worker/ # Optional: Photography API
```

## Content Management

### Adding New Articles

1. Create a new `.mdx` file in `/src/content/writing/`
2. Add frontmatter with required fields:

```mdx
---
title: Your Article Title
description: Brief description for SEO
publishDate: DD.MMM.YYYY
author: Your Name
ogImage: https://yourdomain.com/og-image.jpg
keywords: keyword1, keyword2, keyword3
---

Your article content here...
```

3. Add the article entry to `/src/data/articles.ts`
4. Run `npm run generate:mdx` to rebuild the content index

**Note**: The content index (`/src/content/writing/index.ts`) is auto-generated. Never edit it manually!

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Generate all build artifacts
npm run generate

# Individual generators
npm run generate:mdx      # MDX content index
npm run generate:sitemap  # Sitemap
npm run generate:llms     # llms.txt for AI crawlers
```

## Photography Feature (Optional)

The photography gallery requires Cloudflare R2 and Workers. See `cloudflare-worker/README.md` for setup instructions.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy! Vercel will automatically handle the build.

### Manual Deployment

```bash
npm run build
```

The build output will be in the `/build` directory.

## Security Notes

- Never commit `.env` files or `cloudflare-worker/.dev.vars`
- The `.gitignore` is configured to exclude sensitive files
- All secrets should be set via environment variables or platform secrets

## License

Open source - feel free to use as a template for your own site!

## Credits

Originally built by [Akash Bhadange](https://designerdada.com) ([@designerdada](https://x.com/designerdada))
