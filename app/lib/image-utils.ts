/**
 * Deterministic URL builders for logo assets.
 *
 * Logos are static files served from /public/logos/. GitHub Pages (Fastly CDN)
 * caches them — no separate CDN or DB query needed. Missing files return a
 * deterministic 404 that <TeamLogo> handles via onError fallback.
 *
 * basePath note: assetPrefix only auto-prefixes Next-managed assets (CSS/JS).
 * Raw <img src="..."> needs manual prefix. We mirror next.config's basePath
 * logic: production builds always target /matchday (GitHub Pages),
 * dev runs from "/". Next inlines NODE_ENV at build, so the literal is
 * baked into client bundles — no extra env var or workflow plumbing needed.
 */

const BASE_PATH = process.env.NODE_ENV === "production" ? "/matchday" : "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_BUCKET = "sport-assets";

function logoPath(rel: string): string {
  return `${BASE_PATH}/logos/${rel}`;
}

/**
 * Build a Supabase Storage public URL for a given path.
 * Used by dynamic site_content (CMS) — not for logos.
 * Returns null if Supabase is not configured.
 */
export function getStorageUrl(path: string): string | null {
  if (!SUPABASE_URL || !path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
}

/**
 * Get the logo URL for a team by sport, code, and optional league code.
 *
 * Examples:
 *   teamLogoUrl("football", "ARS", "epl")  → /logos/teams/epl/ARS.png
 *   teamLogoUrl("f1", "MCL")               → /logos/teams/f1/MCL.png
 *   teamLogoUrl("cricket", "CSK", "ipl")   → /logos/teams/cricket/ipl/CSK.png
 */
export function teamLogoUrl(
  sport: "football" | "f1" | "cricket",
  code: string,
  leagueCode?: string
): string | null {
  if (sport === "football" && leagueCode) {
    return logoPath(`teams/${leagueCode}/${code}.png`);
  }
  if (sport === "f1") {
    return logoPath(`teams/f1/${code}.png`);
  }
  if (sport === "cricket" && leagueCode) {
    return logoPath(`teams/cricket/${leagueCode}/${code}.png`);
  }
  return null;
}

/**
 * Get the logo URL for a competition by its short code.
 *
 * Example: competitionLogoUrl("EPL") → /logos/competition/EPL.png
 */
export function competitionLogoUrl(code: string): string | null {
  if (!code) return null;
  return logoPath(`competition/${code}.png`);
}

/**
 * Get the photo URL for an F1 driver by their 3-letter code.
 *
 * Example: driverPhotoUrl("VER") → /logos/drivers/VER.png
 */
export function driverPhotoUrl(code: string): string | null {
  return logoPath(`drivers/${code}.png`);
}
