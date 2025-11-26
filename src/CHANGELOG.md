# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-11-26

### ✨ Added - MDX Content System

Major update to move from hardcoded article content to proper MDX file structure.

#### New Features

- **Automated MDX Processing** - Build script automatically generates content index from MDX files
- **Simple Workflow** - Just add `.mdx` file and update articles list, everything else is automatic
- **Build Script** - `scripts/generate-mdx-index.js` processes MDX files at build time
- **NPM Scripts** - Added `generate-mdx`, `dev`, `build` commands with automatic MDX generation

#### New Files

- `/content/writing/*.mdx` - Individual MDX files for each article
- `/content/writing/_template.mdx` - Template for new articles
- `/scripts/generate-mdx-index.js` - Build-time MDX processor
- `/scripts/README.md` - Build script documentation
- `/utils/mdx.ts` - Type definitions for articles
- `/utils/mdxLoader.ts` - MDX loading and parsing utilities
- `/package.json` - NPM scripts for build automation
- `/.github/workflows/build.yml` - Example CI/CD workflow
- `/README.md` - Comprehensive project documentation
- `/QUICK_START.md` - Quick guide for adding articles
- `/DEPLOYMENT.md` - Deployment instructions
- `/content/README.md` - Content system documentation

#### Modified Files

- `/data/articleContent.ts` - Simplified to load from generated index
- `/guidelines/Guidelines.md` - Added content management guidelines

#### Migration

All existing articles converted from hardcoded strings to MDX files:
- `design-is-the-moat.mdx`
- `minimalism.mdx`
- `growth-without-hacks.mdx`
- `make-something-you-want.mdx`
- `getting-started.mdx`

### 🎯 Benefits

- **Easier Content Management** - Write articles in clean MDX format
- **Better SEO** - Frontmatter metadata for all articles
- **Less Error-Prone** - Automatic processing eliminates manual steps
- **Scalable** - Easy to add new articles without touching multiple files
- **Developer-Friendly** - Clear separation between content and code

### 📝 How to Add Articles Now

**Before (Old Way):**
1. Edit `/data/articleContent.ts`
2. Add metadata and content as JavaScript strings
3. Register in `/data/articles.ts`
4. Deploy

**Now (New Way):**
1. Create `/content/writing/article-name.mdx` with frontmatter
2. Add to `/data/articles.ts`
3. Deploy (build script handles the rest)

### ⚙️ Technical Details

- Build script runs automatically before dev/build
- Parses MDX frontmatter for metadata
- Generates TypeScript exports with proper escaping
- Caches parsed articles for performance
- Full TypeScript type safety maintained

---

## [1.0.0] - 2025-11-15

### Initial Release

- Personal website with Home, Writing, Press, and Favorites sections
- Dark mode support
- SEO optimization with meta tags and JSON-LD
- Responsive design with Source Serif 4 typography
- Centered single-column layout (544px max width)
- Hardcoded article content in TypeScript files

---

## Future Considerations

### Potential Enhancements

- [ ] Hot reload for MDX content in development
- [ ] Syntax highlighting for code blocks
- [ ] Table of contents generation
- [ ] Reading time estimation
- [ ] Tag/category system
- [ ] Search functionality
- [ ] RSS feed generation
- [ ] Related articles suggestions
- [ ] Comments system
- [ ] Analytics integration
