#!/usr/bin/env node
// Downloads the latest disposable email domain list from
// https://github.com/disposable/disposable-email-domains
// Saved to src/data/disposable-domains.json — imported by src/app/api/subscribe/route.ts.

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../data/disposable-domains.json");
const URL = "https://disposable.github.io/disposable-email-domains/domains_mx.json";

console.log("Fetching disposable email domain list...");

const res = await fetch(URL);
if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

const domains = await res.json();
writeFileSync(OUT_PATH, JSON.stringify(domains));
console.log(`Saved ${domains.length} disposable domains to src/data/disposable-domains.json`);
