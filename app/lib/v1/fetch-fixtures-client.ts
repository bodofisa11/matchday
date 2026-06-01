/**
 * Browser-safe fixture fetching.
 *
 * - Production (static build / GitHub Pages): queries Supabase directly.
 * - Development: calls the local /api/fixtures route → Docker Postgres.
 */
import { createSupabaseClient } from "@/app/lib/supabase-client";
import type { Fixture } from "@/app/lib/fixtures";
import { utcToIST, istDateRangeToUTCDateRange } from "@/app/lib/timezone";
import { fetchFromSupabaseV2, isV2Enabled } from "@/app/lib/v2/fetch-fixtures";

export type SportId = "all" | "football" | "f1";

function mapF1Status(status: string): Fixture["status"] {
  if (status === "scheduled") return "scheduled";
  if (["practice", "qualifying", "race"].includes(status)) return "live";
  return "finished";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFootballRow(row: Record<string, any>): Fixture {
  const dateStr = typeof row.date === "string"
    ? row.date.split("T")[0]
    : (row.date as Date).toISOString().split("T")[0];
  const ist = utcToIST(dateStr, row.kickoff);
  return {
    id: String(row.id),
    sport: "football",
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    competition: row.competition,
    competitionShort: row.competition_short,
    kickoff: ist.kickoff,
    date: ist.date,
    venue: row.venue ?? undefined,
    status: row.status as Fixture["status"],
    homeScore: row.home_score ?? undefined,
    awayScore: row.away_score ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapF1Row(row: Record<string, any>): Fixture {
  const dateStr = typeof row.date === "string"
    ? row.date.split("T")[0]
    : (row.date as Date).toISOString().split("T")[0];
  const ist = utcToIST(dateStr, "14:00");
  return {
    id: String(row.id),
    sport: "f1",
    homeTeam: row.circuit,
    awayTeam: row.country,
    competition: `Round ${row.round}`,
    competitionShort: "F1",
    kickoff: ist.kickoff,
    date: ist.date,
    venue: row.country,
    status: mapF1Status(row.status),
  };
}

async function fetchFromSupabase(
  sportId: SportId,
  utcRange?: { utcStart: string; utcEnd: string },
): Promise<Fixture[]> {
  if (isV2Enabled()) return fetchFromSupabaseV2(sportId, utcRange);
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const allFixtures: Fixture[] = [];

  if (sportId === "f1" || sportId === "all") {
    let q = supabase.from("f1_fixtures").select("*").order("date", { ascending: true });
    if (utcRange) q = q.gte("date", utcRange.utcStart).lte("date", utcRange.utcEnd);
    const { data } = await q;
    if (data) allFixtures.push(...data.map(mapF1Row));
  }

  if (sportId === "football" || sportId === "all") {
    let q = supabase
      .from("football_fixtures")
      .select("*")
      .order("date", { ascending: true })
      .order("kickoff", { ascending: true });
    if (utcRange) q = q.gte("date", utcRange.utcStart).lte("date", utcRange.utcEnd);
    const { data } = await q;
    if (data) allFixtures.push(...data.map(mapFootballRow));
  }

  allFixtures.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.kickoff.localeCompare(b.kickoff);
  });

  return allFixtures;
}

/**
 * Fetch fixtures whose IST date falls in [istStart, istEnd] inclusive.
 * Converts the IST window into the UTC range the database needs to scan,
 * then filters mapped (already-IST) results back down to the requested window.
 */
export async function fetchFixturesByISTDateRange(
  sportId: SportId,
  istStart: string,
  istEnd: string,
): Promise<{ fixtures: Fixture[]; updatedAt: string }> {
  const updatedAt = new Date().toISOString();
  const utcRange = istDateRangeToUTCDateRange(istStart, istEnd);

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const all = await fetchFromSupabase(sportId, utcRange);
    const fixtures = all.filter((f) => f.date >= istStart && f.date <= istEnd);
    return { fixtures, updatedAt };
  }

  // Local dev fallback: fetch all from API route then filter client-side.
  const res = await fetch(`/api/fixtures/${sportId}`);
  if (!res.ok) return { fixtures: [], updatedAt };
  const json = (await res.json()) as { fixtures: Fixture[]; updatedAt: string };
  return {
    fixtures: json.fixtures.filter((f) => f.date >= istStart && f.date <= istEnd),
    updatedAt: json.updatedAt ?? updatedAt,
  };
}

/**
 * Returns the most recent updated_at timestamp across the data tables for the
 * given sport. Used by the data-freshness badge in the header.
 */
export async function fetchLastUpdated(sportId: SportId = "all"): Promise<string | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const tables: string[] = [];
  if (sportId === "f1" || sportId === "all") {
    tables.push("f1_fixtures", "f1_driver_standings", "f1_race_results");
  }
  if (sportId === "football" || sportId === "all") {
    tables.push("football_fixtures");
  }

  const stamps = await Promise.all(
    tables.map(async (t) => {
      const { data } = await supabase
        .from(t)
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1);
      return data?.[0]?.updated_at as string | undefined;
    }),
  );
  const valid = stamps.filter((s): s is string => Boolean(s));
  if (valid.length === 0) return null;
  valid.sort((a, b) => b.localeCompare(a));
  return valid[0];
}

export async function fetchFixturesClient(sportId: SportId = "all"): Promise<{
  fixtures: Fixture[];
  updatedAt: string;
}> {
  const updatedAt = new Date().toISOString();

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Supabase configured: query directly (works in both dev and production).
    const fixtures = await fetchFromSupabase(sportId);
    return { fixtures, updatedAt };
  }

  // Fallback: local dev API route → Docker Postgres.
  const res = await fetch(`/api/fixtures/${sportId}`);
  if (!res.ok) return { fixtures: [], updatedAt };
  return res.json();
}
