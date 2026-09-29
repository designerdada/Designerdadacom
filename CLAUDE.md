# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimal, SEO-optimized personal website built with Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, and Convex. The site features a centered single-column layout (544px max width), dark mode support, and a blog whose articles are written in a built-in editor at `/admin` and stored in Convex.

**Tech Stack:**
- Next.js 16 App Router with `cacheComponents` (all public pages are prerendered and cached)
- React 19 with TypeScript
- Convex (database, file storage, auth via Convex Auth, scheduled publishing)
- TipTap 3 (visual editor) + CodeMirror (Markdown mode)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Deployed on Vercel

## Fork Setup (For New Users)

When someone forks this repo, they need to customize these files:

### Configuration Files
- `src/config/site.ts` - Main site configuration (name, URL, author, social links)

### Personal Content
- `public/assets/profile.png` - Profile photo
- `public/assets/footer-signature.png` - Footer signature/logo
- `public/assets/og-images/` - Open Graph images for static pages
- `src/app/(site)/page.tsx` - Bio text
- `src/components/Header.tsx` - Name display
- `src/app/(site)/layout.tsx` - Analytics IDs

### Convex setup
1. `npx convex dev` (creates the deployment and writes `NEXT_PUBLIC_CONVEX_URL` to `.env.local`)
2. `npx @convex-dev/auth` (sets `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL` on the deployment)
3. `npx convex env set ADMIN_EMAIL you@example.com`, `AUTOSEND_API_KEY …` (sends the sign-in email), and `REVALIDATE_SECRET <random>` (same secret in the Next.js env)

See `.env.example` for all variables.

## Development Commands

```bash
npm install
npm run dev          # convex dev + next dev (http://localhost:3000)
npm run build        # production build (Vercel runs `npx convex deploy --cmd 'npm run build'`)
npm run typecheck    # next typegen + tsc
npm test             # vitest (editor Markdown round-trip)
```

## Architecture

### Content & publishing

- **Source of truth**: the `articles` table in Convex (`convex/schema.ts`). The body is Markdown.
- **Working copy vs. `live` snapshot**: the editor autosaves the working copy; public queries only read `live`, which is written by `publish`. Editing a published article never changes the site until "Update".
- **Revalidation**: publish/unpublish/remove schedule `convex/revalidate.ts`, which POSTs cache tags to `/api/revalidate`. Tags: `articles` (lists, sitemap, RSS, llms) and `article:<slug>`.
- **Scheduling**: `ctx.scheduler.runAt` + a 10-minute safety sweep in `convex/crons.ts`.
- **Slug changes** create `slugRedirects` rows; old URLs return 308.
- **Data access in Next.js** goes only through `src/lib/content/` (`'use cache'` + `cacheTag`).
- **Favorites** live in the Convex `favorites` table, edited at `/admin/favorites`. Adding a link (or changing its URL) runs `favorites.fetchPreview`, which stores the page's `og:image` as `previewImageUrl` (can be overridden by hand). Changes revalidate the `favorites` tag.
- **Auth**: Convex Auth email magic link (sent via AutoSend, `convex/lib/magicLink.ts`), restricted to `ADMIN_EMAIL`. On localhost without `AUTOSEND_API_KEY`, the link is printed to the Convex logs. Every admin function calls `requireAdmin` (`convex/lib/admin.ts`). Auth providers are mounted only in `src/app/admin/layout.tsx` so public pages stay static.

### Markdown dialect (one pipeline everywhere)

- `src/lib/markdown/plugins.ts`: remark-gfm + remark-directive + `remark-custom-blocks` + rehype-sanitize.
- `src/lib/markdown/ArticleBody.tsx` renders it (server pages and the editor preview use the same component).
- Custom blocks: `:::callout{type="note|tip|warning"}` … `:::`, `::youtube{id="…"}`, and images with captions `![alt](src "caption")`.
- The TipTap nodes in `src/lib/editor/directives.ts` read/write exactly this syntax. If you add a block, add it in both places and extend `src/lib/editor/__tests__/fixture.md`.

### Routing Structure

- `/`, `/writing`, `/writing/[slug]`, `/favorites`, `/photography` - public pages in `src/app/(site)/`
- `/admin`, `/admin/articles/[id]`, `/admin/favorites`, `/admin/login`, `/admin/photos` - writing desk
- `/rss.xml`, `/sitemap.xml`, `/llms-full.txt`, `/og/[slug]` (generated OG image) - route handlers
- `/api/subscribe`, `/api/confirm` (newsletter), `/api/revalidate` (called by Convex)

### Component Organization

- `src/app/` - routes (App Router)
- `src/components/` - site components; `components/admin/` - dashboard and editor
- `src/lib/` - content access, Markdown pipeline, editor extensions, SEO helpers
- `src/config/site.ts` - site configuration
- `src/data/` - static data (projects)
- `convex/` - backend (schema, queries/mutations, auth, crons)

### Styling System

- Tailwind CSS v4 configured in `src/app/globals.css` (`@theme`, class-based dark mode via next-themes)
- Fonts: Schibsted Grotesk (sans), Sono (mono), IM Fell Great Primer (serif), self-hosted via `next/font` in `src/app/fonts.ts` (don't use a Google Fonts `@import`; the CSS pipeline drops it)
- Article drop cap is CSS (`.article-body > p:first-of-type::first-letter`)
- Editor content styles: `src/app/admin/admin.css`

### SEO Implementation

- Metadata API (`generateMetadata`) for titles, canonical, Open Graph, Twitter
- JSON-LD: Person + WebSite (site layout), BlogPosting + BreadcrumbList (article page), dates in ISO 8601
- Per-article SEO title, description, keywords, canonical, and OG image are set in the editor's settings panel
- Generated OG images: `src/lib/og/ArticleOgImage.tsx` (Figma "outcomes" frame, node 222:48) is the single template, rendered by `/og/[slug]` via next/og and live in the editor settings panel. The og:image URL carries `?v=<hash of title+description>` (`src/lib/og/version.ts`) so edits get a fresh, long-cacheable URL. An uploaded image overrides it.

## Development Guidelines

1. **Layout**: Use flexbox and grid by default. Only use absolute positioning when necessary.
2. **Code Quality**: Refactor as you go. Keep files small. Put helpers in separate files.
3. **SEO/AIO**: Use correct Open Graph and Twitter meta tags. Use appropriate JSON-LD schemas for each page type.
4. **Content**: Write articles at `/admin`. Never read articles in pages directly from Convex; go through `src/lib/content/articles.ts` so caching and tags stay correct.
5. **Public pages must stay cacheable**: no `cookies()`/`headers()` or uncached fetches in `src/app/(site)`.
6. **Documentation**: Keep minimal and consolidated. Don't create new .md files unless explicitly requested.
7. **Component Styling**: Some base components have default styling (gap, typography). Explicitly override these in your React components.

## Important Files

- `src/config/site.ts` - Centralized site configuration
- `convex/schema.ts`, `convex/articles.ts` - Content model and publishing logic
- `src/lib/content/articles.ts` - Cached data access for public pages
- `src/lib/markdown/` - Markdown renderer shared by the site, preview, and RSS
- `src/components/admin/editor/` - Editor UI (visual/Markdown modes, slash menu, settings, publishing)

## Security Notes

- `.env*` files are gitignored - never commit secrets
- `cloudflare-worker/.dev.vars` is gitignored - use `.dev.vars.example` as template
- Admin access is enforced server-side in Convex (`requireAdmin`); the `/admin` UI gate is only UX
- The photography Worker does not yet validate its Bearer token (known gap)

## Deployment

Vercel (Next.js preset). `vercel.json`: production builds run `npx convex deploy && npm run build` (functions first, so the build prerenders against current queries); preview builds only run `npm run build` and never touch Convex.

- Vercel env: `CONVEX_DEPLOY_KEY` (Production only), `NEXT_PUBLIC_CONVEX_URL` (all environments; the production deployment URL), `REVALIDATE_SECRET`, `AUTOSEND_API_KEY`, `AUTOSEND_NEWSLETTER_LIST_ID`, `NEWSLETTER_TOKEN_SECRET`, `VITE_WORKER_API_URL` or `NEXT_PUBLIC_WORKER_API_URL`
- Convex (prod) env: `SITE_URL`, `ADMIN_EMAIL`, `AUTOSEND_API_KEY`, `REVALIDATE_SECRET`, `JWT_PRIVATE_KEY`, `JWKS`
- Preview deployments read production data (public queries) and their revalidation calls go to production only.

### Setting Up Photography Feature (Optional)

See `cloudflare-worker/README.md` for Cloudflare R2 and Worker setup.
