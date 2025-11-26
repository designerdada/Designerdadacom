# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.
* Make sure the code is optimised for SEO and AIO. Use correct og and twitter meta tags.
* Use correct JSON-ld appropriate for the page for proper indexing.

## Content Management

* Articles are stored as MDX files in `/content/writing/`
* The build script (`scripts/generate-mdx-index.js`) automatically processes MDX files
* Never manually edit `/content/writing/index.ts` - it's auto-generated
* To add new articles: create the `.mdx` file and add entry to `/data/articles.ts`
* Run `npm run generate-mdx` to rebuild the content index