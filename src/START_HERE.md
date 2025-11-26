# 👋 Start Here - Your MDX-Powered Website

Welcome! Your website now has an automated content management system. Here's everything you need to know.

## 🎯 What Changed?

Your articles are now stored as **clean MDX files** instead of hardcoded strings. A build script automatically processes them when you deploy.

## ✍️ Publishing a New Article (2 Steps)

### Step 1: Create Your MDX File

Create `/content/writing/my-article-name.mdx`:

```mdx
---
title: My Article Title
description: A compelling description for SEO and social sharing
publishDate: 26.Nov.2025
author: Akash Bhadange
ogImage: https://designerdada.com/media/og-images/my-article.jpg
keywords: design, product, startups
---

Your article content goes here using standard Markdown.

## Section Heading

Write naturally. Use:
- **Bold** for emphasis
- *Italic* for subtle emphasis
- [Links](https://example.com)
- Lists and quotes

> Blockquotes look great too!

That's it. Simple and clean.
```

### Step 2: Register the Article

Edit `/data/articles.ts` and add your article to the top:

```typescript
export const articles: Article[] = [
  // New article at the top (shows first)
  {
    id: 'my-article-name',        // Must match .mdx filename
    title: 'My Article Title',
    date: '26.Nov.2025'
  },
  // ... existing articles below
];
```

### Done!

Commit and push. Your deployment platform (Vercel, Netlify, etc.) automatically:
1. Runs the build script
2. Processes your MDX files
3. Publishes your new article

## 🚀 Quick Commands

```bash
# Test locally
npm run dev

# Build for production
npm run build

# Test the MDX system
npm run test-mdx

# Regenerate content index
npm run generate-mdx
```

## 📝 MDX Frontmatter Reference

### Required
- `title` - Article title
- `description` - SEO description (aim for 150-160 characters)
- `publishDate` - Format: `DD.MMM.YYYY` (e.g., `26.Nov.2025`)

### Optional
- `modifiedDate` - Last update date
- `author` - Your name (defaults to "Akash Bhadange")
- `ogImage` - Image for social sharing
- `keywords` - Comma-separated keywords for SEO

## 📁 File Structure

```
/content/writing/
├── index.ts                    # Auto-generated - DON'T EDIT
├── _template.mdx              # Copy this for new articles
├── your-article-1.mdx         # Your articles
├── your-article-2.mdx
└── ...
```

## ⚡ Pro Tips

### Use the Template
Copy `/content/writing/_template.mdx` as a starting point for new articles.

### File Naming
- Use kebab-case: `design-is-the-moat.mdx`
- No spaces or special characters
- The filename becomes the URL: `/writing/design-is-the-moat`

### Preview Locally
Always run `npm run dev` to preview before deploying.

### Keep Descriptions Short
Aim for 150-160 characters for optimal display on social media.

### Add OG Images
Include `ogImage` in frontmatter for better social sharing.

## 🔍 Troubleshooting

### Article not showing up?

1. **Check the MDX file exists** in `/content/writing/`
2. **Verify frontmatter** has title, description, publishDate
3. **Confirm it's registered** in `/data/articles.ts`
4. **Test the system**: `npm run test-mdx`

### Build failing?

Run the generator manually to see errors:
```bash
npm run generate-mdx
```

### Content not updating?

The build script should run automatically, but force it:
```bash
npm run generate-mdx
npm run dev
```

## 📚 Full Documentation

- **[QUICK_START.md](QUICK_START.md)** - Fastest guide to adding articles
- **[MDX_SETUP_SUMMARY.md](MDX_SETUP_SUMMARY.md)** - Complete system overview
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - How to deploy your site
- **[content/README.md](content/README.md)** - Detailed content guide
- **[CHANGELOG.md](CHANGELOG.md)** - What changed and why

## ✅ Checklist for Your Next Article

- [ ] Create `.mdx` file in `/content/writing/`
- [ ] Add frontmatter (title, description, publishDate)
- [ ] Write your content using Markdown
- [ ] Add to `/data/articles.ts`
- [ ] Test locally: `npm run test-mdx`
- [ ] Preview: `npm run dev`
- [ ] Commit and push
- [ ] Deploy!

## 🎉 That's It!

You're all set. The system handles everything automatically.

**Next Steps:**
1. Try editing an existing article in `/content/writing/`
2. Run `npm run dev` to see your changes
3. When ready, create your first new article

**Questions?** Check the documentation files above.

---

Happy writing! ✍️
