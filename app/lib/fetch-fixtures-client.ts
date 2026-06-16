/**
 * Browser-safe fixture fetching against the normalized Matchday schema.
 *
 * Queries Supabase directly (works in dev and the static production build).
 * Returns empty when Supabase is not configured — the UI renders its empty
 * states. No server / API route is involved.
 */
import { createSupabaseClient } from "@/app/lib/supabase-client";
import type { Fixture } from "@/app/lib/fixtures";
import { utcToIST, istDateRangeToUTCDateRange } from "@/app/lib/timezone";
import { getEventIndex, type EventRow } from "@/app/lib/events";

export type SportId = "all" | "football" | "f1";

type FootballStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";

interface FbClubRef {
  common_name: string | null;
  full_name?: string | null;
}

interface FbNationRef {
  name: string | null;
}

interface FbFixtureRow {
  id: string;
  event_id: string;
  home_team_id: string;
  away_team_id: string;
  kickoff_time_utc: string; // ISO timestamptz
  match_date: string; // YYYY-MM-DD
  stadium_name: string | null;
  status: FootballStatus;
  home_score: number | null;
  away_score: number | null;
  home_team: FbClubRef | FbClubRef[] | null;
  away_team: FbClubRef | FbClubRef[] | null;
  // National-team competitions (WC) fill these instead of home_team/away_team.
  home_nation: FbNationRef | FbNationRef[] | null;
  away_nation: FbNationRef | FbNationRef[] | null;
}

type F1Status =
  | "scheduled"
  | "practice"
  | "qualifying"
  | "sprint"
  | "race"
  | "completed"
  | "cancelled";

interface F1CircuitRef {
  name: string | null;
  country: string | null;
}

interface F1FixtureRow {
  id: string;
  event_id: string;
  round: number;
  circuit_id: string;
  start_at: string; // ISO timestamptz
  end_at: string | null;
  status: F1Status;
  place: string | null;
  circuit: F1CircuitRef | F1CircuitRef[] | null;
}

function unwrapRef<T>(ref: T | T[] | null): T | null {
  if (!ref) return null;
  return Array.isArray(ref) ? ref[0] ?? null : ref;
}

function competitionLabels(
  events: Map<string, EventRow>,
  eventId: string,
): { competition: string; competitionShort: string } {
  const event = events.get(eventId);
  if (!event) return { competition: "Football", competitionShort: "FB" };
  return {
    competition: event.name ?? event.short_code,
    competitionShort: event.short_code,
  };
}

function mapFootballStatus(status: FootballStatus): Fixture["status"] {
  if (status === "live") return "live";
  if (status === "finished" || status === "cancelled") return "finished";
  return "scheduled"; // scheduled | postponed
}

function mapF1Status(status: F1Status): Fixture["status"] {
  if (status === "scheduled") return "scheduled";
  if (["practice", "qualifying", "sprint", "race"].includes(status)) return "live";
  return "finished"; // completed | cancelled
}

function splitIsoTimestamp(iso: string): { date: string; time: string } {
  // Treat as UTC. Supabase returns ISO with `+00` or `Z`; new Date() handles both.
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return { date: iso.slice(0, 10), time: "00:00" };
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  const H = String(dt.getUTCHours()).padStart(2, "0");
  const M = String(dt.getUTCMinutes()).padStart(2, "0");
  return { date: `${y}-${m}-${d}`, time: `${H}:${M}` };
}

function mapFootballRow(row: FbFixtureRow, events: Map<string, EventRow>): Fixture {
  const { date: utcDate, time: utcKickoff } = splitIsoTimestamp(row.kickoff_time_utc);
  const ist = utcToIST(utcDate, utcKickoff);
  const home = unwrapRef(row.home_team);
  const away = unwrapRef(row.away_team);
  const homeNation = unwrapRef(row.home_nation);
  const awayNation = unwrapRef(row.away_nation);
  const labels = competitionLabels(events, row.event_id);
  return {
    id: String(row.id),
    sport: "football",
    homeTeam: home?.common_name ?? home?.full_name ?? homeNation?.name ?? "TBD",
    awayTeam: away?.common_name ?? away?.full_name ?? awayNation?.name ?? "TBD",
    competition: labels.competition,
    competitionShort: labels.competitionShort,
    kickoff: ist.kickoff,
    date: ist.date,
    venue: row.stadium_name ?? undefined,
    status: mapFootballStatus(row.status),
    homeScore: row.home_score ?? undefined,
    awayScore: row.away_score ?? undefined,
  };
}

function mapF1Row(row: F1FixtureRow): Fixture {
  // Bucket by start_at (race-weekend start).
  const { date: utcDate, time: utcKickoff } = splitIsoTimestamp(row.start_at);
  const ist = utcToIST(utcDate, utcKickoff);
  const circuit = unwrapRef(row.circuit);
  return {
    id: String(row.id),
    sport: "f1",
    homeTeam: circuit?.name ?? row.place ?? "TBD",
    awayTeam: circuit?.country ?? row.place ?? "",
    competition: `Round ${row.round}`,
    competitionShort: "F1",
    kickoff: ist.kickoff,
    date: ist.date,
    venue: circuit?.country ?? row.place ?? undefined,
    status: mapF1Status(row.status),
  };
}

async function fetchFromSupabase(
  sportId: SportId,
  utcRange?: { utcStart: string; utcEnd: string },
): Promise<Fixture[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const events = await getEventIndex();
  const allFixtures: Fixture[] = [];

  if (sportId === "f1" || sportId === "all") {
    let q = supabase
      .from("f1_fixtures")
      .select(
        "id, event_id, round, circuit_id, start_at, end_at, status, place, circuit:f1_circuits!circuit_id(name, country)",
      )
      .order("start_at", { ascending: true });
    if (utcRange) {
      q = q
        .gte("start_at", `${utcRange.utcStart}T00:00:00Z`)
        .lte("start_at", `${utcRange.utcEnd}T23:59:59Z`);
    }
    const { data } = await q;
    if (data) allFixtures.push(...(data as unknown as F1FixtureRow[]).map(mapF1Row));
  }

  if (sportId === "football" || sportId === "all") {
    let q = supabase
      .from("fb_fixtures")
      .select(
        "id, event_id, home_team_id, away_team_id, kickoff_time_utc, match_date, stadium_name, status, home_score, away_score, home_team:fb_clubs!home_team_id(common_name, full_name), away_team:fb_clubs!away_team_id(common_name, full_name), home_nation:fb_nations!home_nation_id(name), away_nation:fb_nations!away_nation_id(name)",
      )
      .order("match_date", { ascending: true })
      .order("kickoff_time_utc", { ascending: true });
    if (utcRange) {
      q = q.gte("match_date", utcRange.utcStart).lte("match_date", utcRange.utcEnd);
    }
    const { data } = await q;
    if (data) {
      allFixtures.push(
        ...(data as unknown as FbFixtureRow[]).map((r) => mapFootballRow(r, events)),
      );
    }
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
  const all = await fetchFromSupabase(sportId, utcRange);
  const fixtures = all.filter((f) => f.date >= istStart && f.date <= istEnd);
  return { fixtures, updatedAt };
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
    tables.push("fb_fixtures");
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
  const fixtures = await fetchFromSupabase(sportId);
  return { fixtures, updatedAt };
}
