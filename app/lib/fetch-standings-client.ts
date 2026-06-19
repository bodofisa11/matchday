/**
 * Browser-safe standings / fixtures / squads / scorers fetching against the
 * normalized Matchday schema (events hub + FK-joined reference tables).
 *
 * Every function resolves an `events` row (via [events.ts]) then queries the
 * matching `fb_*` / `f1_*` table, joining reference tables for display names.
 * Return shapes are stable so both the v1 sections and the v2 query layer
 * ([v2/queries.ts]) consume them unchanged.
 */
import { createSupabaseClient } from "@/app/lib/supabase-client";
import { utcToIST } from "@/app/lib/timezone";
import {
  DEFAULT_F1_SEASON,
  getEventIndex,
  getF1Event,
  getFbEvent,
  type EventRow,
} from "@/app/lib/events";

export interface FootballStandingRow {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string | null;
}

export interface FootballFixtureRow {
  id: string;
  home_team: string;
  away_team: string;
  competition: string;
  competition_short: string;
  kickoff: string;
  date: string;
  venue: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  stage?: string | null;
  group_name?: string | null;
}

export interface WcGroupStandingRow {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  group_name: string;
}

export interface F1DriverRow {
  position: number;
  driver: string;
  team: string;
  points: number;
  wins: number;
}

export interface F1ConstructorRow {
  position: number;
  driver: string; // constructor name stored in driver column
  points: number;
}

export interface F1RaceRow {
  id: string;
  season: number;
  round: number;
  circuit: string;
  country: string;
  date: string;
  status: string;
  has_sprint: boolean;
  name?: string | null;
}

export interface FootballScorerRow {
  position: number;
  player_name: string;
  player_nationality: string | null;
  player_position: string | null;
  team_name: string;
  played_matches: number;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

export interface FootballTeamDetailRow {
  id: string;
  name: string;
  short_name: string | null;
  tla: string | null;
  crest: string | null;
  founded: number | null;
  venue: string | null;
  club_colors: string | null;
  website: string | null;
  address: string | null;
  coach_name: string | null;
  coach_nationality: string | null;
  coach_dob: string | null;
  coach_contract_start: string | null;
  coach_contract_until: string | null;
}

export interface FootballSquadPlayerRow {
  id: string;
  name: string;
  position: string | null;
  dob: string | null;
  nationality: string | null;
  shirt_number: number | null;
}

export interface IPLStandingRow {
  position: number;
  team: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  no_result: number;
  points: number;
  net_run_rate: number;
}

export interface NewsArticleRow {
  id: string;
  sport: string;
  competition: string | null;
  title: string;
  summary: string | null;
  source: string | null;
  source_url: string | null;
  image_path: string | null;
  published_at: string;
}

export interface F1RaceResultRow {
  position: number | null;
  driver: string;
  constructor: string;
  grid: number | null;
  laps: number;
  status_text: string;
  points: number;
  time: string | null;
  is_fastest_lap: boolean;
}

export interface F1SprintResultRow {
  position: number | null;
  driver: string;
  constructor: string;
  grid: number | null;
  laps: number;
  status_text: string;
  points: number;
  time: string | null;
}

// ---------------------------------------------------------------------------
// Competition identifier resolution.
// Callers pass either a v1 display name (e.g. "Premier League"), a v1 short
// code (e.g. "EPL"), or a v2/canonical event code (e.g. "PL"). All resolve to
// the canonical `events.short_code`. Unmapped identifiers (ISL, FA Cup, …)
// return null → empty results, which the UI renders as an empty state.
// ---------------------------------------------------------------------------

const NAME_TO_EVENT_SHORT: Record<string, string> = {
  "Premier League": "PL",
  "La Liga": "PD",
  Bundesliga: "BL1",
  "Serie A": "SA",
  "Ligue 1": "FL1",
  "UEFA Champions League": "CL",
  "UEFA Europa League": "EL",
  "FIFA World Cup": "WC",
};

const CODE_TO_EVENT_SHORT: Record<string, string> = {
  // v1 short codes
  EPL: "PL",
  LAL: "PD",
  SRA: "SA",
  LIG: "FL1",
  BUN: "BL1",
  UCL: "CL",
  UEL: "EL",
  WC2026: "WC",
  // canonical / v2 codes (identity)
  PL: "PL",
  PD: "PD",
  SA: "SA",
  FL1: "FL1",
  BL1: "BL1",
  CL: "CL",
  EL: "EL",
  WC: "WC",
};

function unwrapOne<T>(ref: T | T[] | null | undefined): T | null {
  if (!ref) return null;
  return Array.isArray(ref) ? ref[0] ?? null : ref;
}

function splitIso(iso: string): { date: string; time: string } {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return { date: iso.slice(0, 10), time: "00:00" };
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  const H = String(dt.getUTCHours()).padStart(2, "0");
  const M = String(dt.getUTCMinutes()).padStart(2, "0");
  return { date: `${y}-${m}-${d}`, time: `${H}:${M}` };
}

/** Resolve a football event from a display name or short code. */
async function eventFromName(competition: string): Promise<EventRow | null> {
  const short = NAME_TO_EVENT_SHORT[competition];
  return short ? getFbEvent(short) : null;
}

async function eventFromCode(competitionShort: string): Promise<EventRow | null> {
  const short = CODE_TO_EVENT_SHORT[competitionShort];
  return short ? getFbEvent(short) : null;
}

// ---------------------------------------------------------------------------
// Football: standings
// ---------------------------------------------------------------------------

interface StandingQueryRow {
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  last5: string | null;
  club: { common_name: string | null } | { common_name: string | null }[] | null;
}

export async function fetchFootballStandings(competition: string): Promise<FootballStandingRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const event = await eventFromName(competition);
  if (!event) return [];
  const { data } = await supabase
    .from("fb_league_club_standings")
    .select(
      "position,played,wins,draws,losses,goals_for,goals_against,goal_difference,points,last5,club:fb_clubs!club_id(common_name)",
    )
    .eq("event_id", event.id)
    .order("position");
  return ((data as StandingQueryRow[]) ?? []).map((r) => ({
    position: r.position,
    team: unwrapOne(r.club)?.common_name ?? "—",
    played: r.played,
    won: r.wins,
    drawn: r.draws,
    lost: r.losses,
    goals_for: r.goals_for,
    goals_against: r.goals_against,
    goal_difference: r.goal_difference,
    points: r.points,
    form: r.last5,
  }));
}

// ---------------------------------------------------------------------------
// Football: fixtures
// ---------------------------------------------------------------------------

interface FixtureQueryRow {
  id: string;
  match_date: string;
  kickoff_time_utc: string;
  stadium_name: string | null;
  match_type: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home: { common_name: string | null } | { common_name: string | null }[] | null;
  away: { common_name: string | null } | { common_name: string | null }[] | null;
  // National-team competitions (WC) fill these instead of home/away.
  home_nation: { name: string | null } | { name: string | null }[] | null;
  away_nation: { name: string | null } | { name: string | null }[] | null;
}

const FIXTURE_COLS =
  "id,match_date,kickoff_time_utc,stadium_name,match_type,status,home_score,away_score,home:fb_clubs!home_team_id(common_name),away:fb_clubs!away_team_id(common_name),home_nation:fb_nations!home_nation_id(name),away_nation:fb_nations!away_nation_id(name)";

function toFixtureRow(r: FixtureQueryRow, event: EventRow): FootballFixtureRow {
  const { date: utcDate, time: utcKickoff } = splitIso(r.kickoff_time_utc);
  const ist = utcToIST(utcDate, utcKickoff);
  return {
    id: String(r.id),
    home_team: unwrapOne(r.home)?.common_name ?? unwrapOne(r.home_nation)?.name ?? "TBD",
    away_team: unwrapOne(r.away)?.common_name ?? unwrapOne(r.away_nation)?.name ?? "TBD",
    competition: event.name ?? event.short_code,
    competition_short: event.short_code,
    kickoff: ist.kickoff,
    date: ist.date,
    venue: r.stadium_name,
    status: r.status,
    home_score: r.home_score,
    away_score: r.away_score,
    stage: r.match_type,
    group_name: null,
  };
}

/** A single fixture with its event season attached, for the match detail page. */
export interface FootballMatchDetail extends FootballFixtureRow {
  season: string;
}

/**
 * Resolve a single football fixture by its UUID, with competition + season.
 * Returns null when Supabase is unconfigured or no row matches (caller renders
 * a "match not found" empty state). Works for any competition incl. World Cup.
 */
export async function fetchFootballMatchById(id: string): Promise<FootballMatchDetail | null> {
  const supabase = createSupabaseClient();
  if (!supabase || !id) return null;
  const { data } = await supabase
    .from("fb_fixtures")
    .select(`event_id,${FIXTURE_COLS}`)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const row = data as FixtureQueryRow & { event_id: string };
  const events = await getEventIndex();
  const event = events.get(row.event_id);
  if (!event) return null;
  return { ...toFixtureRow(row, event), season: event.season };
}

export async function fetchFootballFixtures(
  competitionShort: string,
  status: "scheduled" | "finished" | "live",
  limit: number,
  today?: string,
): Promise<FootballFixtureRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const event = await eventFromCode(competitionShort);
  if (!event) return [];

  let q = supabase.from("fb_fixtures").select(FIXTURE_COLS).eq("event_id", event.id).eq("status", status);
  if (status === "finished") {
    q = q.order("match_date", { ascending: false }).order("kickoff_time_utc", { ascending: false });
  } else {
    if (status === "scheduled") q = q.gte("match_date", today ?? new Date().toISOString().split("T")[0]);
    q = q.order("match_date").order("kickoff_time_utc");
  }
  const { data } = await q.limit(limit);
  return ((data as FixtureQueryRow[]) ?? []).map((r) => toFixtureRow(r, event));
}

export async function fetchFootballFixturesPaged(
  competitionShort: string,
  status: "scheduled" | "finished",
  page: number,
  pageSize = 10,
  fromDate?: string,
  toDate?: string,
): Promise<{ rows: FootballFixtureRow[]; hasMore: boolean }> {
  const supabase = createSupabaseClient();
  if (!supabase) return { rows: [], hasMore: false };
  const event = await eventFromCode(competitionShort);
  if (!event) return { rows: [], hasMore: false };

  const from = page * pageSize;
  const to = from + pageSize; // fetch one extra to detect hasMore

  let q = supabase.from("fb_fixtures").select(FIXTURE_COLS).eq("event_id", event.id).eq("status", status);
  if (fromDate) q = q.gte("match_date", fromDate);
  if (toDate) q = q.lte("match_date", toDate);
  if (status === "finished") {
    q = q.order("match_date", { ascending: false }).order("kickoff_time_utc", { ascending: false });
  } else {
    q = q.order("match_date").order("kickoff_time_utc");
  }
  q = q.range(from, to);

  const { data } = await q;
  const raw = (data as FixtureQueryRow[]) ?? [];
  const hasMore = raw.length > pageSize;
  return { rows: raw.slice(0, pageSize).map((r) => toFixtureRow(r, event)), hasMore };
}

// ---------------------------------------------------------------------------
// Football: teams + squads
// ---------------------------------------------------------------------------

interface ClubQueryRow {
  id: string;
  full_name: string | null;
  common_name: string;
  short_code: string | null;
  crest_url: string | null;
  founded_year: number | null;
  stadium_name: string | null;
  head_coach_name: string | null;
  manager_name: string | null;
  primary_color: string | null;
}

function mapClub(c: ClubQueryRow): FootballTeamDetailRow {
  return {
    id: c.id,
    name: c.common_name,
    short_name: c.full_name ?? null,
    tla: c.short_code ?? null,
    crest: c.crest_url ?? null,
    founded: c.founded_year ?? null,
    venue: c.stadium_name ?? null,
    club_colors: c.primary_color ?? null,
    website: null,
    address: null,
    coach_name: c.head_coach_name ?? c.manager_name ?? null,
    coach_nationality: null,
    coach_dob: null,
    coach_contract_start: null,
    coach_contract_until: null,
  };
}

export async function fetchTeamsForCompetition(
  competitionShort: string,
): Promise<FootballTeamDetailRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const event = await eventFromCode(competitionShort);
  if (!event) return [];

  // Leagues: club set comes from the standings table. Cups / World Cup have no
  // league table — derive the club set from the fixtures' home/away teams.
  let clubIds: string[] = [];
  const { data: st } = await supabase
    .from("fb_league_club_standings")
    .select("club_id")
    .eq("event_id", event.id);
  clubIds = ((st as { club_id: string | null }[]) ?? [])
    .map((r) => r.club_id)
    .filter((v): v is string => Boolean(v));

  if (clubIds.length === 0) {
    const { data: fx } = await supabase
      .from("fb_fixtures")
      .select("home_team_id,away_team_id,home_nation_id,away_nation_id")
      .eq("event_id", event.id);
    const clubSet = new Set<string>();
    const nationSet = new Set<string>();
    for (const r of (fx as {
      home_team_id: string | null;
      away_team_id: string | null;
      home_nation_id: string | null;
      away_nation_id: string | null;
    }[]) ?? []) {
      if (r.home_team_id) clubSet.add(r.home_team_id);
      if (r.away_team_id) clubSet.add(r.away_team_id);
      if (r.home_nation_id) nationSet.add(r.home_nation_id);
      if (r.away_nation_id) nationSet.add(r.away_nation_id);
    }
    clubIds = [...clubSet];

    // National-team competition (WC): teams are nations, not clubs.
    if (clubIds.length === 0 && nationSet.size > 0) {
      const { data: nat } = await supabase
        .from("fb_nations")
        .select("id,name,short_code,manager_name")
        .in("id", [...nationSet])
        .order("name");
      return ((nat as NationQueryRow[]) ?? []).map(mapNation);
    }
  }
  if (clubIds.length === 0) return [];

  const { data } = await supabase
    .from("fb_clubs")
    .select(
      "id,full_name,common_name,short_code,crest_url,founded_year,stadium_name,head_coach_name,manager_name,primary_color",
    )
    .in("id", clubIds)
    .order("common_name");
  return ((data as ClubQueryRow[]) ?? []).map(mapClub);
}

interface NationQueryRow {
  id: string;
  name: string;
  short_code: string | null;
  manager_name: string | null;
}

function mapNation(n: NationQueryRow): FootballTeamDetailRow {
  return {
    id: n.id,
    name: n.name,
    short_name: n.name,
    tla: n.short_code ?? null,
    crest: null,
    founded: null,
    venue: null,
    club_colors: null,
    website: null,
    address: null,
    coach_name: n.manager_name ?? null,
    coach_nationality: null,
    coach_dob: null,
    coach_contract_start: null,
    coach_contract_until: null,
  };
}

interface SquadQueryRow {
  jersey_number: number | null;
  position: string | null;
  player:
    | {
        id: string;
        full_name: string;
        common_name: string | null;
        date_of_birth: string | null;
        position: string | null;
        nation: { name: string | null } | { name: string | null }[] | null;
      }
    | {
        id: string;
        full_name: string;
        common_name: string | null;
        date_of_birth: string | null;
        position: string | null;
        nation: { name: string | null } | { name: string | null }[] | null;
      }[]
    | null;
}

export async function fetchSquadByClubId(teamId: string): Promise<FootballSquadPlayerRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  // `teamId` is a club id for domestic comps, or a nation id for national-team
  // comps (WC) — TeamsPanel passes whichever `team.id` it has. Match either.
  const { data } = await supabase
    .from("fb_squads")
    .select(
      "jersey_number,position,player:fb_players!player_id(id,full_name,common_name,date_of_birth,position,nation:fb_nations!nation_id(name))",
    )
    .or(`team_id.eq.${teamId},nation_id.eq.${teamId}`)
    .order("jersey_number", { ascending: true, nullsFirst: false });

  const rows = ((data as SquadQueryRow[]) ?? []).map((r) => {
    const p = unwrapOne(r.player);
    return {
      id: p?.id ?? "",
      name: p?.full_name ?? p?.common_name ?? "—",
      position: r.position ?? p?.position ?? null,
      dob: p?.date_of_birth ?? null,
      nationality: unwrapOne(p?.nation)?.name ?? null,
      shirt_number: r.jersey_number ?? null,
    } satisfies FootballSquadPlayerRow;
  });

  // Dedup by player id (a player may appear via multiple squad rows).
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (!r.id || seen.has(r.id)) return r.id ? false : true;
    seen.add(r.id);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Football: top scorers
// ---------------------------------------------------------------------------

interface ScorerQueryRow {
  position: number;
  matches_played: number;
  goals: number;
  player:
    | {
        common_name: string | null;
        full_name: string;
        position: string | null;
        nation: { name: string | null } | { name: string | null }[] | null;
      }
    | {
        common_name: string | null;
        full_name: string;
        position: string | null;
        nation: { name: string | null } | { name: string | null }[] | null;
      }[]
    | null;
  club: { common_name: string | null } | { common_name: string | null }[] | null;
  nation: { name: string | null } | { name: string | null }[] | null;
}

export async function fetchFootballScorers(
  competitionShort: string,
  limit = 20,
): Promise<FootballScorerRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const event = await eventFromCode(competitionShort);
  if (!event) return [];
  const { data } = await supabase
    .from("fb_top_scorers")
    .select(
      "position,matches_played,goals,player:fb_players!player_id(common_name,full_name,position,nation:fb_nations!nation_id(name)),club:fb_clubs!team_id(common_name),nation:fb_nations!nation_id(name)",
    )
    .eq("event_id", event.id)
    .order("position")
    .limit(limit);
  return ((data as ScorerQueryRow[]) ?? []).map((r) => {
    const p = unwrapOne(r.player);
    return {
      position: r.position,
      player_name: p?.full_name ?? p?.common_name ?? "—",
      player_nationality: unwrapOne(p?.nation)?.name ?? null,
      player_position: p?.position ?? null,
      team_name: unwrapOne(r.club)?.common_name ?? unwrapOne(r.nation)?.name ?? "—",
      played_matches: r.matches_played,
      goals: r.goals,
      assists: null,
      penalties: null,
    };
  });
}

// ---------------------------------------------------------------------------
// World Cup: group standings + fixtures by stage
// ---------------------------------------------------------------------------

interface GroupQueryRow {
  group_label: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  team: { common_name: string | null } | { common_name: string | null }[] | null;
  nation: { name: string | null } | { name: string | null }[] | null;
}

export async function fetchWcGroupStandings(): Promise<Record<string, WcGroupStandingRow[]>> {
  const supabase = createSupabaseClient();
  if (!supabase) return {};
  const event = await getFbEvent("WC");
  if (!event) return {};
  const { data } = await supabase
    .from("fb_group_standings")
    .select(
      "group_label,position,played,wins,draws,losses,goals_for,goals_against,goal_difference,points,team:fb_clubs!team_id(common_name),nation:fb_nations!nation_id(name)",
    )
    .eq("event_id", event.id)
    .order("group_label")
    .order("position");
  const grouped: Record<string, WcGroupStandingRow[]> = {};
  for (const r of (data as GroupQueryRow[]) ?? []) {
    const row: WcGroupStandingRow = {
      position: r.position,
      team: unwrapOne(r.team)?.common_name ?? unwrapOne(r.nation)?.name ?? "—",
      played: r.played,
      won: r.wins,
      drawn: r.draws,
      lost: r.losses,
      goals_for: r.goals_for,
      goals_against: r.goals_against,
      goal_difference: r.goal_difference,
      points: r.points,
      group_name: r.group_label,
    };
    (grouped[r.group_label] ??= []).push(row);
  }
  return grouped;
}

export async function fetchWcFixturesByStage(
  stage: string | null,
  limit = 200,
): Promise<FootballFixtureRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const event = await getFbEvent("WC");
  if (!event) return [];
  let q = supabase
    .from("fb_fixtures")
    .select(FIXTURE_COLS)
    .eq("event_id", event.id)
    .order("match_date")
    .order("kickoff_time_utc")
    .limit(limit);
  if (stage) q = q.eq("match_type", stage);
  const { data } = await q;
  return ((data as FixtureQueryRow[]) ?? []).map((r) => toFixtureRow(r, event));
}

// ---------------------------------------------------------------------------
// Formula 1
// ---------------------------------------------------------------------------

interface F1CalendarQueryRow {
  id: string;
  round: number;
  status: string;
  start_at: string;
  has_sprint: boolean;
  circuit: { name: string | null; country: string | null } | { name: string | null; country: string | null }[] | null;
}

export async function fetchF1Calendar(season: string = DEFAULT_F1_SEASON): Promise<F1RaceRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const event = await getF1Event(season);
  if (!event) return [];
  const { data } = await supabase
    .from("f1_fixtures")
    .select("id,round,status,start_at,has_sprint,circuit:f1_circuits!circuit_id(name,country)")
    .eq("event_id", event.id)
    .order("round");
  return ((data as F1CalendarQueryRow[]) ?? []).map((r) => {
    const c = unwrapOne(r.circuit);
    return {
      id: String(r.id),
      season: Number(event.season),
      round: r.round,
      circuit: c?.name ?? "—",
      country: c?.country ?? "",
      date: splitIso(r.start_at).date,
      status: r.status,
      has_sprint: r.has_sprint,
    };
  });
}

interface DriverStandingQueryRow {
  points: number | string;
  wins: number;
  driver: { full_name: string; common_name: string | null } | { full_name: string; common_name: string | null }[] | null;
  team: { name: string | null } | { name: string | null }[] | null;
}

export async function fetchF1DriverStandings(season: string = DEFAULT_F1_SEASON): Promise<F1DriverRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const event = await getF1Event(season);
  if (!event) return [];
  const { data } = await supabase
    .from("f1_driver_standings")
    .select("points,wins,driver:f1_drivers!driver_id(full_name,common_name),team:f1_teams!team_id(name)")
    .eq("event_id", event.id)
    .order("points", { ascending: false });
  return ((data as DriverStandingQueryRow[]) ?? []).map((r, i) => {
    const d = unwrapOne(r.driver);
    return {
      position: i + 1,
      driver: d?.full_name ?? d?.common_name ?? "—",
      team: unwrapOne(r.team)?.name ?? "—",
      points: Number(r.points),
      wins: r.wins,
    };
  });
}

interface ConstructorStandingQueryRow {
  points: number | string;
  team: { name: string | null } | { name: string | null }[] | null;
}

export async function fetchF1ConstructorStandings(season: string = DEFAULT_F1_SEASON): Promise<F1ConstructorRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const event = await getF1Event(season);
  if (!event) return [];
  const { data } = await supabase
    .from("f1_constructor_standings")
    .select("points,team:f1_teams!team_id(name)")
    .eq("event_id", event.id)
    .order("points", { ascending: false });
  return ((data as ConstructorStandingQueryRow[]) ?? []).map((r, i) => ({
    position: i + 1,
    driver: unwrapOne(r.team)?.name ?? "—",
    points: Number(r.points),
  }));
}

interface RaceResultQueryRow {
  position: number | null;
  total_time: string | null;
  status: string | null;
  grid: number | null;
  points: number | string;
  laps_completed: number | null;
  driver: { full_name: string; common_name: string | null } | { full_name: string; common_name: string | null }[] | null;
  team: { name: string | null } | { name: string | null }[] | null;
}

async function f1FixtureId(season: string, round: number): Promise<string | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;
  const event = await getF1Event(season);
  if (!event) return null;
  const { data } = await supabase
    .from("f1_fixtures")
    .select("id")
    .eq("event_id", event.id)
    .eq("round", round)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

async function fetchF1Results(season: string, round: number, isSprint: boolean): Promise<RaceResultQueryRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const fixtureId = await f1FixtureId(season, round);
  if (!fixtureId) return [];
  const { data } = await supabase
    .from("f1_race_results")
    .select(
      "position,total_time,status,grid,points,laps_completed,driver:f1_drivers!driver_id(full_name,common_name),team:f1_teams!team_id(name)",
    )
    .eq("fixture_id", fixtureId)
    .eq("is_sprint", isSprint)
    .order("position");
  return (data as RaceResultQueryRow[]) ?? [];
}

export async function fetchF1RaceResults(season: string, round: number): Promise<F1RaceResultRow[]> {
  const rows = await fetchF1Results(season, round, false);
  return rows.map((r) => {
    const d = unwrapOne(r.driver);
    return {
      position: r.position,
      driver: d?.full_name ?? d?.common_name ?? "—",
      constructor: unwrapOne(r.team)?.name ?? "—",
      grid: r.grid,
      laps: r.laps_completed ?? 0,
      status_text: r.status ?? "",
      points: Number(r.points),
      time: r.total_time,
      is_fastest_lap: false,
    };
  });
}

export async function fetchF1SprintResults(season: string, round: number): Promise<F1SprintResultRow[]> {
  const rows = await fetchF1Results(season, round, true);
  return rows.map((r) => {
    const d = unwrapOne(r.driver);
    return {
      position: r.position,
      driver: d?.full_name ?? d?.common_name ?? "—",
      constructor: unwrapOne(r.team)?.name ?? "—",
      grid: r.grid,
      laps: r.laps_completed ?? 0,
      status_text: r.status ?? "",
      points: Number(r.points),
      time: r.total_time,
    };
  });
}

// ---------------------------------------------------------------------------
// Dead features — no source in the new schema. Keep signatures, return empty so
// the UI shows its empty state.
// ---------------------------------------------------------------------------

export async function fetchNews(_competition: string, _limit = 8): Promise<NewsArticleRow[]> {
  void _competition;
  void _limit;
  return [];
}

export async function fetchIPLStandings(): Promise<IPLStandingRow[]> {
  return [];
}
