# Personal Website of Akash Bhadange

A minimal, SEO-optimized personal website built with React, TypeScript, Vite, and Tailwind CSS.

[Demo](https://designerdada.com)

## Features

- ✨ Minimal, centered single-column layout (544px max width)
- 🌙 Dark mode support with system preference detection
- 📝 MDX-powered blog with automatic content indexing
- 🔍 SEO-optimized with Open Graph, Twitter Cards, and JSON-LD
- 📱 Fully responsive design
- ⚡ Fast builds with Vite

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v6
- **Content**: MDX for blog posts
- **UI Components**: Radix UI primitives
- **Deployment**: Vercel

## Project Structure

```
/
├── components/        # React components
│   ├── ui/           # Radix UI components
│   └── figma/        # Figma import components
├── content/          # MDX content files
│   └── writing/      # Blog articles (*.mdx)
├── data/             # Static data and article metadata
├── hooks/            # Custom React hooks
├── imports/          # SVG imports from Figma
├── pages/            # Page components
├── scripts/          # Build scripts
│   ├── generate-mdx-index.js  # Auto-generates content index
│   └── fix-imports.js         # Fixes versioned imports
├── styles/           # Global styles and Tailwind config
├── utils/            # Utility functions
├── App.tsx           # Main app component
├── main.tsx          # React entry point
└── index.html        # HTML entry point
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Content Management

### Adding New Articles

1. Create a new `.mdx` file in `/content/writing/`
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

3. Add the article entry to `/data/articles.ts`
4. Run `npm run generate-mdx` to rebuild the content index

### Content Scripts

- `npm run generate-mdx` - Generates content index from MDX files
- `npm run fix-imports` - Fixes versioned package imports
- `npm run test-mdx` - Tests MDX generation

**Note**: The content index (`/content/writing/index.ts`) is auto-generated. Never edit it manually!

## Build Process

The build process runs automatically in this order:

1. **Fix Imports** - Removes version numbers from import statements
2. **Generate MDX Index** - Creates the content index from MDX files
3. **Vite Build** - Builds the production bundle

## Deployment

### Vercel (Recommended)

The project is configured for zero-config deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy! Vercel will automatically:
   - Install dependencies
   - Run build scripts
   - Deploy to production

### Manual Deployment

```bash
npm run build
```

The build output will be in the `/dist` directory.

## Configuration Files

- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment settings

## SEO Features

- Server-side meta tags (Open Graph, Twitter Cards)
- JSON-LD structured data for Person and WebSite
- Semantic HTML with proper heading hierarchy
- Optimized images with alt text
- Canonical URLs for all pages
- Dynamic meta tags per page/article

## License

Open source - feel free to use as a template for your own site!

## Credits

Built by Akash Bhadange ([@designerdada](https://designerdada.com))
