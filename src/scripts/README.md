# Build Scripts

This directory contains build-time scripts for the project.

## generate-mdx-index.js

Automatically generates `/content/writing/index.ts` from all MDX files in `/content/writing/`.

### Usage

```bash
node scripts/generate-mdx-index.js
```

Or use the npm script:

```bash
npm run generate-mdx
```

### What It Does

1. Scans `/content/writing/` for all `.mdx` files
2. Reads each file's content
3. Generates TypeScript exports for each article
4. Creates a map of all articles in `index.ts`

### Automatic Execution

This script runs automatically:
- Before every build (`npm run build`)
- When starting dev server (`npm run dev`)

## test-mdx-generation.js

Tests and validates the MDX generation system.

### Usage

```bash
npm run test-mdx
```

### What It Tests

1. ✅ MDX files exist in `/content/writing/`
2. ✅ `index.ts` has been generated
3. ✅ All MDX files are properly exported
4. ✅ Frontmatter is valid in all articles
5. ✅ Articles are registered in `/data/articles.ts`

Run this after adding new articles to verify everything is set up correctly.