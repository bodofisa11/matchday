/**
 * Browser-safe fixture fetching.
 *
 * - Production (static build / GitHub Pages): queries Supabase directly.
 * - Development: calls the local /api/fixtures route → Docker Postgres.
 */
import { createSupabaseClient } from "@/app/lib/supabase-client";
import type { Fixture } from "@/app/lib/fixtures";
import { utcToIST, istDateRangeToUTCDateRange } from "@/app/lib/timezone";
import { getEventIndex, type EventRow } from "@/app/lib/events";

export type SportId = "all" | "football" | "f1";

const DB_VERSION = process.env.NEXT_PUBLIC_DB_VERSION ?? "v1";
const IS_V2 = DB_VERSION === "v2";

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
  if (IS_V2) return fetchFromSupabaseV2(sportId, utcRange);
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

// ---------------------------------------------------------------------------
// v2 schema path (NEXT_PUBLIC_DB_VERSION=v2)
// ---------------------------------------------------------------------------

type V2FootballStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";

interface V2FbClubRef {
  common_name: string | null;
  full_name?: string | null;
}

interface V2FbFixtureRow {
  id: string;
  event_id: string;
  home_team_id: string;
  away_team_id: string;
  kickoff_time_utc: string; // ISO timestamptz
  match_date: string; // YYYY-MM-DD
  stadium_name: string | null;
  status: V2FootballStatus;
  home_score: number | null;
  away_score: number | null;
  home_team: V2FbClubRef | V2FbClubRef[] | null;
  away_team: V2FbClubRef | V2FbClubRef[] | null;
}

type V2F1Status =
  | "scheduled"
  | "practice"
  | "qualifying"
  | "race"
  | "completed"
  | "cancelled";

interface V2F1CircuitRef {
  name: string | null;
  country: string | null;
}

interface V2F1FixtureRow {
  id: string;
  event_id: string;
  round: number;
  circuit_id: string;
  start_at: string; // ISO timestamptz
  end_at: string | null;
  status: V2F1Status;
  place: string | null;
  circuit: V2F1CircuitRef | V2F1CircuitRef[] | null;
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

function mapV2FootballStatus(status: V2FootballStatus): Fixture["status"] {
  if (status === "live") return "live";
  if (status === "finished" || status === "cancelled") return "finished";
  return "scheduled"; // scheduled | postponed
}

function mapV2F1Status(status: V2F1Status): Fixture["status"] {
  if (status === "scheduled") return "scheduled";
  if (["practice", "qualifying", "race"].includes(status)) return "live";
  return "finished";
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

function mapV2FootballRow(
  row: V2FbFixtureRow,
  events: Map<string, EventRow>,
): Fixture {
  const { date: utcDate, time: utcKickoff } = splitIsoTimestamp(row.kickoff_time_utc);
  const ist = utcToIST(utcDate, utcKickoff);
  const home = unwrapRef(row.home_team);
  const away = unwrapRef(row.away_team);
  const labels = competitionLabels(events, row.event_id);
  return {
    id: String(row.id),
    sport: "football",
    homeTeam: home?.common_name ?? home?.full_name ?? "TBD",
    awayTeam: away?.common_name ?? away?.full_name ?? "TBD",
    competition: labels.competition,
    competitionShort: labels.competitionShort,
    kickoff: ist.kickoff,
    date: ist.date,
    venue: row.stadium_name ?? undefined,
    status: mapV2FootballStatus(row.status),
    homeScore: row.home_score ?? undefined,
    awayScore: row.away_score ?? undefined,
  };
}

function mapV2F1Row(row: V2F1FixtureRow): Fixture {
  // Bucket by start_at::date per backend guidance (race-weekend Friday).
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
    status: mapV2F1Status(row.status),
  };
}

async function fetchFromSupabaseV2(
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
      // start_at is timestamptz; compare against day bounds.
      q = q.gte("start_at", `${utcRange.utcStart}T00:00:00Z`).lte(
        "start_at",
        `${utcRange.utcEnd}T23:59:59Z`,
      );
    }
    const { data } = await q;
    if (data) allFixtures.push(...(data as unknown as V2F1FixtureRow[]).map(mapV2F1Row));
  }

  if (sportId === "football" || sportId === "all") {
    let q = supabase
      .from("fb_fixtures")
      .select(
        "id, event_id, home_team_id, away_team_id, kickoff_time_utc, match_date, stadium_name, status, home_score, away_score, home_team:fb_clubs!home_team_id(common_name, full_name), away_team:fb_clubs!away_team_id(common_name, full_name)",
      )
      .order("match_date", { ascending: true })
      .order("kickoff_time_utc", { ascending: true });
    if (utcRange) {
      q = q.gte("match_date", utcRange.utcStart).lte("match_date", utcRange.utcEnd);
    }
    const { data } = await q;
    if (data) {
      allFixtures.push(
        ...(data as unknown as V2FbFixtureRow[]).map((r) => mapV2FootballRow(r, events)),
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
    tables.push(IS_V2 ? "fb_fixtures" : "football_fixtures");
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
