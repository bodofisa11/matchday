// Module-level cache of team codes (TLA) loaded from `fb_clubs`.
// One fetch per session — DB is the source of truth, not the static
// TEAM_CODE_MAP in team-meta.ts (which now serves only as fallback for
// teams missing from the DB / non-football competitions).
//
// Clubs are global in the Matchday schema (one row per club, not per
// competition), so lookups are keyed by normalized name only. The optional
// `competitionShort` arg is kept for signature compatibility but unused.

import { createSupabaseClient } from "@/app/lib/supabase-client";

interface ClubRow {
  common_name: string;
  full_name: string | null;
  short_code: string | null;
}

// Keyed by normalized name (both common and full name resolve to the row).
const global = new Map<string, ClubRow>();

let loaded = false;
let inflight: Promise<void> | null = null;

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isTeamCodesLoaded(): boolean {
  return loaded;
}

export async function loadTeamCodes(): Promise<void> {
  if (loaded) return;
  if (inflight) return inflight;
  inflight = (async () => {
    const supabase = createSupabaseClient();
    if (!supabase) {
      loaded = true;
      return;
    }
    const { data } = await supabase
      .from("fb_clubs")
      .select("common_name,full_name,short_code");
    const rows = (data as ClubRow[]) ?? [];
    for (const r of rows) {
      const keys = [r.common_name, r.full_name].filter(Boolean) as string[];
      for (const k of keys) {
        global.set(norm(k), r);
      }
    }
    // National teams live in fb_nations (WC etc.), not fb_clubs — fold them in
    // so their codes resolve too. `name` maps onto both club name keys.
    const { data: nat } = await supabase
      .from("fb_nations")
      .select("name,short_code");
    for (const n of (nat as { name: string; short_code: string | null }[]) ?? []) {
      if (!n.name) continue;
      global.set(norm(n.name), {
        common_name: n.name,
        full_name: n.name,
        short_code: n.short_code,
      });
    }
    loaded = true;
  })();
  return inflight;
}

export function getTeamCodeFromDB(
  name: string,
  _competitionShort?: string,
): string | null {
  if (!name) return null;
  return global.get(norm(name))?.short_code ?? null;
}

export function getTeamShortNameFromDB(
  name: string,
  _competitionShort?: string,
): string | null {
  if (!name) return null;
  return global.get(norm(name))?.common_name ?? null;
}
