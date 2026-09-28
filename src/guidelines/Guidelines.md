# General guidelines

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.
* Make sure the code is optimised for SEO and AIO. Use correct og and twitter meta tags.
* Use correct JSON-ld appropriate for the page for proper indexing.

## Content Management

* Articles are written in the editor at `/admin` and stored in Convex (see `CLAUDE.md`)

## Documentation

* Keep documentation minimal and consolidated
* All instructions are in `/README.md` - do not create additional documentation files
* Only create new .md files if explicitly requested by the user

 Some of the base components you are using may have styling(eg. gap/typography) baked in as defaults.
So make sure you explicitly set any styling information from the guidelines in the generated react to override the defaults.