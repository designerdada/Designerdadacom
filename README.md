# Personal Website Template

A minimal, SEO-optimized personal website built with React, TypeScript, Vite, and Tailwind CSS. Originally created by [Akash Bhadange](https://designerdada.com).

A minimal, SEO-optimized personal website built with Next.js, Convex, and Tailwind CSS, with a built-in writing desk. Originally created by [Akash Bhadange](https://designerdada.com).

## Features

- Minimal, centered single-column layout (544px max width)
- Dark mode support with system preference detection
- Writing desk at `/admin`: visual and Markdown editing modes, `/` slash menu (headings, tables, quotes, callouts, images with captions, YouTube, code, dividers), live preview, image uploads
- Per-article SEO settings: slug, SEO title, description, keywords, canonical URL, social image (uploaded or auto-generated)
- Drafts, instant publish, scheduled publish, and slug redirects
- Real server rendering: every article is prerendered and refreshed within seconds of publishing
- Open Graph, Twitter Cards, JSON-LD, sitemap, RSS, and `llms-full.txt`
- Optional: Photography gallery with Cloudflare R2 storage

## Tech Stack

- **Framework**: Next.js 16 (App Router, Cache Components) with React 19 and TypeScript
- **Backend**: Convex (database, file storage, auth, scheduling)
- **Editor**: TipTap + CodeMirror
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

## Quick Start (Fork Setup)

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
npx convex dev            # creates your Convex deployment, then Ctrl+C
npx @convex-dev/auth      # sets up auth keys on the deployment
npm run dev               # http://localhost:3000
```

Then:

1. Edit `src/config/site.ts` with your name, URL, bio, and links.
2. Replace `public/assets/profile.png`, `public/assets/footer-signature.png`, and `public/assets/og-images/`.
3. Update the bio in `src/app/(site)/page.tsx` and analytics IDs in `src/app/(site)/layout.tsx`.
4. Set the Convex env vars listed in `.env.example` (`ADMIN_EMAIL`, `AUTOSEND_API_KEY`, `REVALIDATE_SECRET`, `SITE_URL`). The sign-in email is sent from the address in `convex/lib/magicLink.ts`.
5. Sign in at `/admin` with an email magic link and start writing.

## Writing

Articles are Markdown stored in Convex. The visual editor and the Markdown mode edit the same text, so you can switch at any time. Beyond standard Markdown (GFM tables included), two custom blocks are supported:

```md
:::callout{type="tip"}
Callouts can be `note`, `tip`, or `warning`.
:::

::youtube{id="tA6MB1y1DDM"}
```

Autosave never changes the live site. Press **Publish** (or **Update** for a published article), or **Schedule** a time.

## Commands

```bash
npm run dev         # Convex + Next.js dev servers
npm run build       # production build
npm run typecheck   # type-check
npm test            # editor Markdown round-trip tests
```

## Photography Feature (Optional)

The photography gallery requires Cloudflare R2 and Workers. See `cloudflare-worker/README.md` for setup instructions.

## Deployment

Import the repo in Vercel. Production builds run `npx convex deploy && npm run build` (see `vercel.json`), so add `CONVEX_DEPLOY_KEY` (Production only), `NEXT_PUBLIC_CONVEX_URL`, and `REVALIDATE_SECRET` to the Vercel project. The full list of variables is in `CLAUDE.md` → Deployment.

## Security Notes

- Never commit `.env` files or `cloudflare-worker/.dev.vars`
- The `.gitignore` is configured to exclude sensitive files
- All secrets should be set via environment variables or platform secrets

## License

Open source - feel free to use as a template for your own site!

## Credits

Originally built by [Akash Bhadange](https://designerdada.com) ([@designerdada](https://x.com/designerdada))
