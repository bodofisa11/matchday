// Module-level cache of team codes (TLA) loaded from football_team_details.
// One fetch per session — DB is the source of truth, not the static
// TEAM_CODE_MAP in team-meta.ts (which now serves only as fallback for
// teams missing from the DB / non-football competitions).

import { createSupabaseClient } from "./supabase-client";

interface TeamRow {
  competition_short: string;
  name: string;
  short_name: string | null;
  tla: string | null;
}

// Compound key: `${competition_short}::${normalized name}` for disambiguation
// across leagues where two teams share a partial name.
const byCompetition = new Map<string, TeamRow>();
// Global fallback keyed by normalized name only.
const global = new Map<string, TeamRow>();

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
      .from("football_team_details")
      .select("competition_short,name,short_name,tla");
    const rows = (data as TeamRow[]) ?? [];
    for (const r of rows) {
      const keys = [r.name, r.short_name].filter(Boolean) as string[];
      for (const k of keys) {
        const n = norm(k);
        byCompetition.set(`${r.competition_short}::${n}`, r);
        global.set(n, r);
      }
    }
    loaded = true;
  })();
  return inflight;
}

export function getTeamCodeFromDB(
  name: string,
  competitionShort?: string,
): string | null {
  if (!name) return null;
  const n = norm(name);
  if (competitionShort) {
    const r = byCompetition.get(`${competitionShort}::${n}`);
    if (r?.tla) return r.tla;
  }
  const r = global.get(n);
  return r?.tla ?? null;
}

export function getTeamShortNameFromDB(
  name: string,
  competitionShort?: string,
): string | null {
  if (!name) return null;
  const n = norm(name);
  if (competitionShort) {
    const r = byCompetition.get(`${competitionShort}::${n}`);
    if (r?.short_name) return r.short_name;
  }
  const r = global.get(n);
  return r?.short_name ?? null;
}
