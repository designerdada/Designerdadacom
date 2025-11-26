# General guidelines

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

## Documentation

* Keep documentation minimal and consolidated
* All instructions are in `/README.md` - do not create additional documentation files
* Only create new .md files if explicitly requested by the user

 Some of the base components you are using may have styling(eg. gap/typography) baked in as defaults.
So make sure you explicitly set any styling information from the guidelines in the generated react to override the defaults.