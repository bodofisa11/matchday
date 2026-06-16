/**
 * Build the club-logo manifest from football-logos.cc.
 *
 * Each country index page (e.g. https://football-logos.cc/england/) renders one
 * card per club whose <img> already points at the 256x256 asset URL, which
 * carries a per-image content hash:
 *
 *   https://assets.football-logos.cc/logos/{country}/256x256/{slug}.{hash}.png
 *
 * We fetch each country page once, regex out every (slug, country, hash) triple,
 * and write them keyed by slug to app/lib/logos-manifest.json. The frontend
 * (app/lib/team-logos.ts) maps a team name -> slug -> this entry -> URL, and the
 * browser caches each immutable asset for a year.
 *
 * Run manually to (re)generate; hashes only change when a logo is re-uploaded,
 * in which case the old URL 404s and the UI falls back to the initials badge
 * until this is re-run:
 *
 *   node scripts/build-logos-manifest.mjs
 *
 * Add countries to COUNTRIES to widen coverage (CL/EL opponents, World Cup
 * national teams — national teams live on their own country's page).
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// Countries to scrape. Big-5 leagues + common CL/EL nations; national teams are
// included automatically (they appear on their own country page).
const COUNTRIES = [
  "england",
  "spain",
  "germany",
  "italy",
  "france",
  "portugal",
  "netherlands",
  "scotland",
  "belgium",
  "turkey",
  "austria",
  "switzerland",
  "greece",
  "czech-republic",
  "ukraine",
  "denmark",
  "norway",
  "sweden",
  "croatia",
  "serbia",
  "poland",
  "russia",
  "brazil",
  "argentina",
];

const URL_RE = /logos\/([a-z-]+)\/256x256\/([a-z0-9-]+)\.([0-9a-f]{6,8})\.png/g;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a listing page and return its (slug, country, hash) logo triples at
 * 256x256. `expectCategory` filters to the page's own category (country pages
 * cross-link to others); pass null for the curated /tournaments/ and
 * /national-teams/ pages, whose entries carry varied categories. Variant logos
 * (slugs containing "--": white/no-text/historical kits) are skipped.
 */
async function scrapePage(path, expectCategory) {
  const res = await fetch(`https://football-logos.cc/${path}/`, {
    headers: { "user-agent": UA },
  });
  if (!res.ok) {
    console.warn(`  ! ${path}: HTTP ${res.status} — skipped`);
    return [];
  }
  const html = (await res.text()).replace(/&quot;/g, '"');
  const out = [];
  let m;
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(html))) {
    const [, c, slug, h] = m;
    if (slug.includes("--")) continue;
    if (expectCategory && c !== expectCategory) continue;
    out.push({ slug, c, h });
  }
  return out;
}

async function main() {
  const manifest = {};
  let total = 0;
  // First write wins; `realSlug` is recorded as `s` when it differs from the
  // manifest key (e.g. the national-team alias "portugal-national-team" whose
  // file is actually "portuguese-football-federation").
  const add = (key, c, h, realSlug) => {
    if (manifest[key]) return;
    manifest[key] = realSlug && realSlug !== key ? { c, h, s: realSlug } : { c, h };
    total++;
  };

  // 1. Per-country pages: club crests + domestic league/cup logos.
  for (const country of COUNTRIES) {
    const rows = await scrapePage(country, country);
    for (const { slug, c, h } of rows) add(slug, c, h);
    console.log(`  ${country}: ${rows.length} logos`);
    await sleep(400);
  }

  // 2. National teams: full set, keyed by both the real slug and a stable
  //    "{country}-national-team" alias so the frontend can resolve from a
  //    country name even when the site uses a federation name.
  const nations = await scrapePage("national-teams", null);
  for (const { slug, c, h } of nations) {
    add(slug, c, h);
    add(`${c}-national-team`, c, h, slug);
  }
  console.log(`  national-teams: ${nations.length} logos`);
  await sleep(400);

  // 3. Tournaments: continental + international competitions (CL/EL/WC/...).
  const tournaments = await scrapePage("tournaments", "tournaments");
  for (const { slug, c, h } of tournaments) add(slug, c, h);
  console.log(`  tournaments: ${tournaments.length} logos`);

  const here = dirname(fileURLToPath(import.meta.url));
  const outPath = join(here, "..", "app", "lib", "logos-manifest.json");
  const sorted = Object.fromEntries(
    Object.keys(manifest)
      .sort()
      .map((k) => [k, manifest[k]]),
  );
  await writeFile(outPath, JSON.stringify(sorted, null, 0) + "\n", "utf8");
  console.log(`\nWrote ${total} logos -> ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
