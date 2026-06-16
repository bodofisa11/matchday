/**
 * Event-id lookup cache for v2 schema.
 *
 * The v2 backend replaces v1's per-league physical tables with a single
 * `events` table keyed by (sport, short_code, season). Frontend prefetches
 * the small set once per session and resolves UUIDs locally so query code
 * stays free of hardcoded IDs.
 */
import { createSupabaseClient } from "./supabase-client";

export type EventSport = "fb" | "f1";

/** Default season filters for the live editions seeded in `events`. */
export const DEFAULT_FB_SEASON = "2025-26";
export const DEFAULT_F1_SEASON = "2026";
export const WC_SEASON = "2026";

export interface EventRow {
  id: string;
  sport: EventSport;
  short_code: string;
  season: string;
  status: string;
  name?: string | null;
}

let cache: Promise<EventRow[]> | null = null;

export function resetEventsCache(): void {
  cache = null;
}

export async function loadEvents(): Promise<EventRow[]> {
  if (!cache) {
    cache = (async () => {
      const supabase = createSupabaseClient();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("events")
        .select("id, sport, short_code, season, status, name:competition_name");
      if (error || !data) return [];
      return data as EventRow[];
    })();
  }
  return cache;
}

/**
 * Resolve a single event UUID. Returns `null` when no row matches —
 * callers should treat that as "feature not seeded yet" and render empty.
 */
export async function getEventId(
  sport: EventSport,
  shortCode: string,
  season: string,
): Promise<string | null> {
  const rows = await loadEvents();
  const match = rows.find(
    (r) => r.sport === sport && r.short_code === shortCode && r.season === season,
  );
  return match?.id ?? null;
}

/**
 * Resolve a full football event row by its `short_code`. Season defaults by
 * code (World Cup uses {@link WC_SEASON}, leagues/cups use
 * {@link DEFAULT_FB_SEASON}). Returns `null` when not seeded.
 */
export async function getFbEvent(shortCode: string): Promise<EventRow | null> {
  const rows = await loadEvents();
  const season = shortCode === "WC" ? WC_SEASON : DEFAULT_FB_SEASON;
  return (
    rows.find(
      (r) => r.sport === "fb" && r.short_code === shortCode && r.season === season,
    ) ?? null
  );
}

/** Resolve the Formula 1 event row for a season (defaults to the live season). */
export async function getF1Event(season: string = DEFAULT_F1_SEASON): Promise<EventRow | null> {
  const rows = await loadEvents();
  return (
    rows.find((r) => r.sport === "f1" && r.short_code === "F1" && r.season === season) ?? null
  );
}

/**
 * All seasons seeded for a competition, newest first (string-desc, which is
 * correct for both `YYYY` and `YYYY-YY` forms). Drives the season selector —
 * callers render it only when more than one season is returned. Empty when
 * Supabase is unconfigured or nothing is seeded.
 */
export async function getSeasonsForCompetition(
  sport: EventSport,
  shortCode: string,
): Promise<string[]> {
  const rows = await loadEvents();
  return rows
    .filter((r) => r.sport === sport && r.short_code === shortCode)
    .map((r) => r.season)
    .filter((s, i, a) => a.indexOf(s) === i)
    .sort((a, b) => b.localeCompare(a));
}

/**
 * Resolve every event UUID for a sport in a season. Used when the daily
 * view aggregates fixtures across multiple competitions.
 */
export async function getEventIdsForSeason(
  sport: EventSport,
  season: string,
): Promise<string[]> {
  const rows = await loadEvents();
  return rows.filter((r) => r.sport === sport && r.season === season).map((r) => r.id);
}

/**
 * Build an `id -> EventRow` lookup so query result mappers can resolve
 * competition display info without re-scanning the cached list per row.
 */
export async function getEventIndex(): Promise<Map<string, EventRow>> {
  const rows = await loadEvents();
  return new Map(rows.map((r) => [r.id, r]));
}
