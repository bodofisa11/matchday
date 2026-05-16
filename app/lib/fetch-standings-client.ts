import { createSupabaseClient } from "./supabase-client";
import { utcToIST } from "./timezone";

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
  team_api_id: number;
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
  player_api_id: number;
  name: string;
  position: string | null;
  dob: string | null;
  nationality: string | null;
  shirt_number: number | null;
}

export async function fetchTeamsForCompetition(
  competitionShort: string,
): Promise<FootballTeamDetailRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("football_team_details")
    .select("team_api_id,name,short_name,tla,crest,founded,venue,club_colors,website,address,coach_name,coach_nationality,coach_dob,coach_contract_start,coach_contract_until")
    .eq("competition_short", competitionShort)
    .order("name");
  return (data as FootballTeamDetailRow[]) ?? [];
}

export async function fetchSquadByTeamApiId(
  teamApiId: number,
): Promise<FootballSquadPlayerRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("football_squad_players")
    .select("player_api_id,name,position,dob,nationality,shirt_number")
    .eq("team_api_id", teamApiId)
    .order("shirt_number", { ascending: true, nullsFirst: false });
  const rows = (data as FootballSquadPlayerRow[]) ?? [];
  // Dedup by player_api_id (player may appear in multiple competitions)
  const seen = new Set<number>();
  return rows.filter((r) => {
    if (seen.has(r.player_api_id)) return false;
    seen.add(r.player_api_id);
    return true;
  });
}

export async function fetchFootballScorers(
  competitionShort: string,
  limit = 20,
): Promise<FootballScorerRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("football_scorers")
    .select("position,player_name,player_nationality,player_position,team_name,played_matches,goals,assists,penalties")
    .eq("competition_short", competitionShort)
    .order("position")
    .limit(limit);
  return (data as FootballScorerRow[]) ?? [];
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

const FOOTBALL_TABLE_MAP: Record<string, string> = {
  "Premier League": "premier_league_standings",
  "La Liga": "la_liga_standings",
  "Bundesliga": "bundesliga_standings",
  "Serie A": "serie_a_standings",
  "Ligue 1": "ligue_1_standings",
  "Indian Super League": "isl_standings",
  "UEFA Europa League": "europa_league_standings",
};

async function getStandingId(competition: string): Promise<string | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("standings")
    .select("id")
    .eq("competition", competition)
    .limit(1)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function fetchFootballStandings(competition: string): Promise<FootballStandingRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const tableName = FOOTBALL_TABLE_MAP[competition];
  if (!tableName) return [];
  const standingId = await getStandingId(competition);
  if (!standingId) return [];
  const { data } = await supabase
    .from(tableName)
    .select("position,team,played,won,drawn,lost,goals_for,goals_against,goal_difference,points,form")
    .eq("standing_id", standingId)
    .order("position");
  return (data as FootballStandingRow[]) ?? [];
}

export async function fetchFootballFixtures(
  competitionShort: string,
  status: "scheduled" | "finished" | "live",
  limit: number,
  today?: string,
): Promise<FootballFixtureRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const cols = "id,home_team,away_team,competition,competition_short,kickoff,date,venue,status,home_score,away_score";
  function applyIST(rows: FootballFixtureRow[]): FootballFixtureRow[] {
    return rows.map((r) => {
      const dateStr = typeof r.date === "string" ? r.date.split("T")[0] : r.date;
      const ist = utcToIST(dateStr, r.kickoff);
      return { ...r, date: ist.date, kickoff: ist.kickoff };
    });
  }

  if (status === "scheduled") {
    const { data } = await supabase
      .from("football_fixtures")
      .select(cols)
      .eq("competition_short", competitionShort)
      .eq("status", "scheduled")
      .gte("date", today ?? new Date().toISOString().split("T")[0])
      .order("date")
      .order("kickoff")
      .limit(limit);
    return applyIST((data as FootballFixtureRow[]) ?? []);
  }
  if (status === "finished") {
    const { data } = await supabase
      .from("football_fixtures")
      .select(cols)
      .eq("competition_short", competitionShort)
      .eq("status", "finished")
      .order("date", { ascending: false })
      .limit(limit);
    return applyIST((data as FootballFixtureRow[]) ?? []);
  }
  const { data } = await supabase
    .from("football_fixtures")
    .select(cols)
    .eq("competition_short", competitionShort)
    .eq("status", status)
    .order("date")
    .order("kickoff")
    .limit(limit);
  return applyIST((data as FootballFixtureRow[]) ?? []);
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

  const cols = "id,home_team,away_team,competition,competition_short,kickoff,date,venue,status,home_score,away_score";
  const from = page * pageSize;
  const to = from + pageSize; // fetch one extra to detect hasMore

  function applyIST(rows: FootballFixtureRow[]): FootballFixtureRow[] {
    return rows.map((r) => {
      const dateStr = typeof r.date === "string" ? r.date.split("T")[0] : r.date;
      const ist = utcToIST(dateStr, r.kickoff);
      return { ...r, date: ist.date, kickoff: ist.kickoff };
    });
  }

  let query = supabase
    .from("football_fixtures")
    .select(cols)
    .eq("competition_short", competitionShort)
    .eq("status", status);

  if (fromDate) query = query.gte("date", fromDate);
  if (toDate) query = query.lte("date", toDate);

  if (status === "finished") {
    query = query.order("date", { ascending: false }).order("kickoff", { ascending: false });
  } else {
    query = query.order("date").order("kickoff");
  }

  query = query.range(from, to);

  const { data } = await query;
  const raw = (data as FootballFixtureRow[]) ?? [];
  const hasMore = raw.length > pageSize;
  return { rows: applyIST(raw.slice(0, pageSize)), hasMore };
}

export async function fetchF1DriverStandings(): Promise<F1DriverRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const standingId = await getStandingId("F1 Drivers Championship");
  if (!standingId) return [];
  const { data } = await supabase
    .from("f1_driver_standings")
    .select("position,driver,team,points,wins")
    .eq("standing_id", standingId)
    .order("position");
  return (data as F1DriverRow[]) ?? [];
}

export async function fetchF1ConstructorStandings(): Promise<F1ConstructorRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const standingId = await getStandingId("F1 Constructors Championship");
  if (!standingId) return [];
  const { data } = await supabase
    .from("f1_constructor_standings")
    .select("position,driver,points")
    .eq("standing_id", standingId)
    .order("position");
  return (data as F1ConstructorRow[]) ?? [];
}

export async function fetchF1Calendar(): Promise<F1RaceRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("f1_fixtures")
    .select("id,season,round,circuit,country,date,status,has_sprint")
    .order("round");
  return (data as F1RaceRow[]) ?? [];
}

export interface F1RaceResultRow {
  position: number | null;
  driver: string;
  constructor: string;
  grid: number | null;
  laps: number;
  status_text: string;
  points: number;
  is_fastest_lap: boolean;
}

export async function fetchF1RaceResults(season: string, round: number): Promise<F1RaceResultRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("f1_race_results")
    .select("position,driver,constructor,grid,laps,status_text,points,is_fastest_lap")
    .eq("season", season)
    .eq("round", round)
    .order("position", { ascending: true });
  return (data as F1RaceResultRow[]) ?? [];
}

export interface F1SprintResultRow {
  position: number | null;
  driver: string;
  constructor: string;
  grid: number | null;
  laps: number;
  status_text: string;
  points: number;
}

export async function fetchF1SprintResults(season: string, round: number): Promise<F1SprintResultRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("f1_sprint_results")
    .select("position,driver,constructor,grid,laps,status_text,points")
    .eq("season", season)
    .eq("round", round)
    .order("position", { ascending: true });
  return (data as F1SprintResultRow[]) ?? [];
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

export async function fetchNews(competition: string, limit = 8): Promise<NewsArticleRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("news_articles")
    .select("id,sport,competition,title,summary,source,source_url,image_path,published_at")
    .eq("competition", competition)
    .eq("is_active", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data as NewsArticleRow[]) ?? [];
}

export async function fetchWcGroupStandings(
  competitionShort = "WC2026",
): Promise<Record<string, WcGroupStandingRow[]>> {
  const supabase = createSupabaseClient();
  if (!supabase) return {};
  const { data } = await supabase
    .from("wc_group_standings")
    .select(
      "position,team,played,won,drawn,lost,goals_for,goals_against,goal_difference,points,group_name",
    )
    .eq("competition_short", competitionShort)
    .order("group_name")
    .order("position");
  const rows = (data as WcGroupStandingRow[]) ?? [];
  const grouped: Record<string, WcGroupStandingRow[]> = {};
  for (const r of rows) {
    if (!grouped[r.group_name]) grouped[r.group_name] = [];
    grouped[r.group_name].push(r);
  }
  return grouped;
}

export async function fetchWcFixturesByStage(
  stage: string | null,
  limit = 200,
): Promise<FootballFixtureRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const cols =
    "id,home_team,away_team,competition,competition_short,kickoff,date,venue,status,home_score,away_score,stage,group_name";
  let query = supabase
    .from("football_fixtures")
    .select(cols)
    .eq("competition_short", "WC2026")
    .order("date")
    .order("kickoff")
    .limit(limit);
  if (stage) query = query.eq("stage", stage);
  const { data } = await query;
  return ((data as FootballFixtureRow[]) ?? []).map((r) => {
    const dateStr = typeof r.date === "string" ? r.date.split("T")[0] : r.date;
    const ist = utcToIST(dateStr, r.kickoff);
    return { ...r, date: ist.date, kickoff: ist.kickoff };
  });
}

export async function fetchIPLStandings(): Promise<IPLStandingRow[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const standingId = await getStandingId("Indian Premier League");
  if (!standingId) return [];
  const { data } = await supabase
    .from("ipl_standings")
    .select("position,team,played,won,lost,tied,no_result,points,net_run_rate")
    .eq("standing_id", standingId)
    .order("position");
  return (data as IPLStandingRow[]) ?? [];
}
