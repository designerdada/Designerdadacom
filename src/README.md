# Personal Website

A minimal, SEO-optimized personal website built with React, TypeScript, and Tailwind CSS. Features MDX-powered blog content with automatic build-time generation.

## ✨ Features

- **MDX Content System** - Write articles in Markdown with frontmatter
- **Automatic Build** - Content automatically processed during build
- **SEO Optimized** - Twitter cards, Open Graph tags, JSON-LD structured data
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Mobile-first, centered single-column layout (544px max width)
- **Type-Safe** - Full TypeScript support
- **Fast & Clean** - Minimal dependencies, optimized for performance

## 🚀 Quick Start

### Development

```bash
# Install dependencies (if needed)
npm install

# Start dev server
npm run dev
```

The dev server automatically:
1. Generates content index from MDX files
2. Starts development server
3. Watches for changes

### Production Build

```bash
npm run build
```

Output will be in `/dist` directory.

## 📝 Adding a New Article

### Step 1: Create MDX File

Create `/content/writing/your-article-slug.mdx`:

```mdx
---
title: Your Article Title
description: A compelling description for SEO
publishDate: 26.Nov.2025
author: Akash Bhadange
---

Your article content here...

## Section Heading

Write using standard Markdown syntax.
```

### Step 2: Register in Articles List

Add to `/data/articles.ts`:

```typescript
{
  id: 'your-article-slug',  // Must match MDX filename
  title: 'Your Article Title',
  date: '26.Nov.2025'
}
```

### Step 3: Build

```bash
npm run dev    # For development
npm run build  # For production
```

That's it! The build script automatically processes your MDX files.

## 📁 Project Structure

```
/
├── content/
│   └── writing/
│       ├── index.ts              # Auto-generated
│       ├── _template.mdx         # Template for new articles
│       └── *.mdx                 # Your articles
├── components/                   # React components
├── data/
│   ├── articles.ts              # Article metadata
│   └── favorites.ts             # Favorites data
├── pages/                       # Page components
├── scripts/
│   └── generate-mdx-index.js   # Build script
├── utils/                       # Utility functions
└── styles/
    └── globals.css              # Global styles & design tokens
```

## 🛠️ Build Script

The `/scripts/generate-mdx-index.js` script:
- Runs automatically before every build
- Scans `/content/writing/*.mdx` files
- Generates `/content/writing/index.ts`
- Parses frontmatter and content
- Creates TypeScript exports

### Manual Run

```bash
npm run generate-mdx
```

## 📚 Documentation

- **[QUICK_START.md](/QUICK_START.md)** - Fast guide to adding articles
- **[DEPLOYMENT.md](/DEPLOYMENT.md)** - Deployment instructions
- **[content/README.md](/content/README.md)** - Content system documentation
- **[scripts/README.md](/scripts/README.md)** - Build script documentation

## 🎨 Design

- **Font**: Source Serif 4
- **Layout**: Centered single-column (544px max width)
- **Colors**: Defined in `/styles/globals.css`
- **Framework**: Tailwind CSS v4.0

## 🔧 Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **MDX** - Content format
- **Vite** - Build tool (or your bundler)

## 📄 License

Private project - All rights reserved

## 👤 Author

**Akash Bhadange**

---

## Development Notes

### Important Files

- **Never edit** `/content/writing/index.ts` manually - it's auto-generated
- **Always run** `npm run generate-mdx` after adding new articles
- **Template available** at `/content/writing/_template.mdx`

### Frontmatter Fields

**Required:**
- `title` - Article title
- `description` - SEO description
- `publishDate` - Format: `DD.MMM.YYYY`

**Optional:**
- `modifiedDate` - Last modified date
- `author` - Author name
- `ogImage` - Social sharing image URL
- `keywords` - Comma-separated keywords

### Adding Other Content Types

To add Press or Favorites content:
1. Create `/content/press/` or `/content/favorites/` directories
2. Add MDX files
3. Update build script to process those directories
4. Create corresponding loaders in `/utils/`

## 🤝 Contributing

This is a personal project, but if you'd like to use this setup for your own site:

1. Fork the repository
2. Update content in `/content/writing/`
3. Update personal info in components
4. Update `/data/articles.ts` and `/data/favorites.ts`
5. Customize styles in `/styles/globals.css`
6. Deploy!

---

**Happy writing!** ✍️
