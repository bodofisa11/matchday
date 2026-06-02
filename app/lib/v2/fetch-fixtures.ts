/**
 * v2 schema fetch path (Supabase).
 *
 * Reads from `fb_fixtures` / `f1_fixtures` v2 tables joined with `events`,
 * `fb_clubs`, `f1_circuits`. Gated by `NEXT_PUBLIC_USE_V2_SCHEMA=1`.
 *
 * F1 status enum values pending from DB side — currently passes through.
 */
import { createSupabaseClient } from "@/app/lib/supabase-client";
import type { Fixture } from "@/app/lib/fixtures";
import { utcToIST } from "@/app/lib/timezone";
import type { SportId } from "@/app/lib/v1/fetch-fixtures-client";

type EventRow = { competition_name: string; short_code: string };
type ClubRow = { common_name: string; full_name: string };
type CircuitRow = { name: string; country: string | null };

type FbRow = {
  id: string;
  match_date: string;
  kickoff_time_utc: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  venue: string | null;
  event: EventRow | null;
  home: ClubRow | null;
  away: ClubRow | null;
};

type F1Row = {
  id: string;
  round: number | null;
  start_at: string;
  status: string;
  event: EventRow | null;
  circuit: CircuitRow | null;
};

function mapFbStatus(s: string): Fixture["status"] {
  if (s === "postponed") return "scheduled";
  if (s === "cancelled") return "finished";
  if (s === "live" || s === "finished" || s === "scheduled") return s;
  return "scheduled";
}

function mapF1Status(s: string): Fixture["status"] {
  if (s === "completed" || s === "cancelled" || s === "finished") return "finished";
  if (s === "scheduled") return "scheduled";
  return "live";
}

function splitUtc(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const H = String(d.getUTCHours()).padStart(2, "0");
  const M = String(d.getUTCMinutes()).padStart(2, "0");
  return { date: `${y}-${m}-${day}`, time: `${H}:${M}` };
}

function mapFb(row: FbRow): Fixture {
  const utc = row.kickoff_time_utc
    ? splitUtc(row.kickoff_time_utc)
    : { date: row.match_date, time: "00:00" };
  const ist = utcToIST(utc.date, utc.time);
  return {
    id: String(row.id),
    sport: "football",
    homeTeam: row.home?.common_name ?? row.home?.full_name ?? "",
    awayTeam: row.away?.common_name ?? row.away?.full_name ?? "",
    competition: row.event?.competition_name ?? row.event?.short_code ?? "",
    competitionShort: row.event?.short_code ?? "",
    kickoff: ist.kickoff,
    date: ist.date,
    venue: row.venue ?? undefined,
    status: mapFbStatus(row.status),
    homeScore: row.home_score ?? undefined,
    awayScore: row.away_score ?? undefined,
  };
}

function mapF1(row: F1Row): Fixture {
  const utc = splitUtc(row.start_at);
  const ist = utcToIST(utc.date, utc.time);
  const compName = row.event?.competition_name ?? "F1";
  return {
    id: String(row.id),
    sport: "f1",
    homeTeam: row.circuit?.name ?? "",
    awayTeam: row.circuit?.country ?? "",
    competition: row.round != null ? `Round ${row.round}` : compName,
    competitionShort: row.event?.short_code ?? "F1",
    kickoff: ist.kickoff,
    date: ist.date,
    venue: row.circuit?.country ?? undefined,
    status: mapF1Status(row.status),
  };
}

export function isV2Enabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_V2_SCHEMA === "1";
}

export async function fetchFromSupabaseV2(
  sportId: SportId,
  utcRange?: { utcStart: string; utcEnd: string },
): Promise<Fixture[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const all: Fixture[] = [];

  if (sportId === "football" || sportId === "all") {
    let q = supabase
      .from("fb_fixtures")
      .select(
        "id, match_date, kickoff_time_utc, status, home_score, away_score, venue, " +
          "event:events(competition_name, short_code), " +
          "home:fb_clubs!home_club_id(common_name, full_name), " +
          "away:fb_clubs!away_club_id(common_name, full_name)",
      )
      .order("match_date", { ascending: true })
      .order("kickoff_time_utc", { ascending: true });
    if (utcRange) q = q.gte("match_date", utcRange.utcStart).lte("match_date", utcRange.utcEnd);
    const { data } = await q;
    if (data) all.push(...(data as unknown as FbRow[]).map(mapFb));
  }

  if (sportId === "f1" || sportId === "all") {
    let q = supabase
      .from("f1_fixtures")
      .select(
        "id, round, start_at, status, " +
          "event:events(competition_name, short_code), " +
          "circuit:f1_circuits(name, country)",
      )
      .order("start_at", { ascending: true });
    if (utcRange) q = q.gte("start_at", utcRange.utcStart).lte("start_at", utcRange.utcEnd);
    const { data } = await q;
    if (data) all.push(...(data as unknown as F1Row[]).map(mapF1));
  }

  all.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.kickoff.localeCompare(b.kickoff);
  });
  return all;
}
