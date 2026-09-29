#!/usr/bin/env node
// One-off: copies the old hard-coded favorites (src/data/favorites.ts) into Convex.
// Links that already exist are skipped, so it is safe to run again.
//   node src/scripts/import-favorites.js          # the dev deployment in .env.local
//   node src/scripts/import-favorites.js --prod   # production
// Delete this script and src/data/favorites.ts once production has been imported.
import { execFileSync } from "node:child_process";
import { favorites } from "../data/favorites.ts";

const payload = favorites.map(({ name, description, url, category, nofollow }) => ({
	name,
	description,
	url,
	category,
	nofollow: nofollow !== false,
}));

execFileSync(
	"npx",
	["convex", "run", ...process.argv.slice(2), "favorites:importMany", JSON.stringify({ favorites: payload })],
	{ stdio: "inherit" },
);
