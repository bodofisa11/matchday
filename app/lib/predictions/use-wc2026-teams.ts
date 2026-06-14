"use client";

import { useEffect, useState } from "react";
import { fetchWcGroupStandings } from "@/app/lib/fetch-standings-client";
import { teamCode } from "@/app/lib/team-meta";
import { WC2026_GROUPS, GROUP_LETTERS } from "@/app/lib/predictions/wc2026-groups";
import type { GroupLetter } from "@/app/lib/predictions/predictions-types";

export interface TeamEntry {
  code: string;
  name: string;
}

export interface TeamWithGroup extends TeamEntry {
  group: GroupLetter;
}

export interface Wc2026Teams {
  groups: Record<GroupLetter, TeamEntry[]>;
  teams: TeamWithGroup[];
  byCode: (code: string) => string;
  loading: boolean;
  source: "db" | "fallback";
}

interface CacheState {
  groups: Record<GroupLetter, TeamEntry[]>;
  teams: TeamWithGroup[];
  source: "db" | "fallback";
}

function buildFallback(): CacheState {
  const teams: TeamWithGroup[] = GROUP_LETTERS.flatMap((g) =>
    WC2026_GROUPS[g].map((t) => ({ ...t, group: g })),
  );
  return { groups: WC2026_GROUPS, teams, source: "fallback" };
}

let cache: CacheState | null = null;
let inflight: Promise<CacheState> | null = null;
const subscribers = new Set<(s: CacheState) => void>();

async function loadFromDb(): Promise<CacheState> {
  const grouped = await fetchWcGroupStandings();
  const groupKeys = Object.keys(grouped);
  if (groupKeys.length === 0) return buildFallback();

  const groups: Record<string, TeamEntry[]> = {};
  const teams: TeamWithGroup[] = [];
  for (const groupName of groupKeys) {
    const letter = groupName.replace(/^Group\s+/i, "").trim().toUpperCase() as GroupLetter;
    const rows = grouped[groupName];
    const entries: TeamEntry[] = rows.map((r) => ({
      code: teamCode(r.team, "WC2026"),
      name: r.team,
    }));
    groups[letter] = entries;
    for (const e of entries) teams.push({ ...e, group: letter });
  }
  // Fill any missing groups from static fallback so UI stays stable mid-draw.
  const fallback = buildFallback();
  for (const g of GROUP_LETTERS) {
    if (!groups[g]) groups[g] = fallback.groups[g];
  }
  return { groups: groups as Record<GroupLetter, TeamEntry[]>, teams, source: "db" };
}

function ensureLoad(): Promise<CacheState> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = loadFromDb()
    .catch(() => buildFallback())
    .then((result) => {
      cache = result;
      inflight = null;
      for (const fn of subscribers) fn(result);
      return result;
    });
  return inflight;
}

export function useWc2026Teams(): Wc2026Teams {
  const [state, setState] = useState<CacheState>(() => cache ?? buildFallback());
  const [loading, setLoading] = useState<boolean>(!cache);

  useEffect(() => {
    let active = true;
    const sub = (s: CacheState) => {
      if (active) {
        setState(s);
        setLoading(false);
      }
    };
    subscribers.add(sub);
    ensureLoad().then((s) => {
      if (active) {
        setState(s);
        setLoading(false);
      }
    });
    return () => {
      active = false;
      subscribers.delete(sub);
    };
  }, []);

  return {
    groups: state.groups,
    teams: state.teams,
    byCode: (code: string) => state.teams.find((t) => t.code === code)?.name ?? code,
    loading,
    source: state.source,
  };
}
