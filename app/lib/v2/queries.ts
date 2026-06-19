/**
 * v2 query layer. Single entry point the v2 UI uses for data.
 *
 * Everything live-data is sourced from the normalized Matchday schema via the
 * v1 fetch modules ([v1/fetch-fixtures-client], [v1/fetch-standings-client]);
 * returns empty when Supabase is unconfigured so pages render empty states.
 * The static `[team]` route still reads dummy profiles ([dummy.ts]) — the new
 * schema has no club-honours source for it.
 */
import { fetchFixturesByISTDateRange, type SportId } from "@/app/lib/fetch-fixtures-client";
import { getSeasonsForCompetition } from "@/app/lib/events";
import {
  fetchF1Calendar,
  fetchF1ConstructorStandings,
  fetchF1DriverStandings,
  fetchF1RaceResults,
  fetchF1SprintResults,
  fetchFootballMatchById,
  fetchFootballFixturesPaged,
  fetchFootballScorers,
  fetchFootballStandings,
  fetchSquadByClubId,
  fetchTeamsForCompetition,
  fetchWcFixturesByStage,
  fetchWcGroupStandings,
  type F1ConstructorRow,
  type F1DriverRow,
  type F1RaceResultRow,
  type F1RaceRow,
  type F1SprintResultRow,
  type FootballFixtureRow,
  type FootballMatchDetail,
  type FootballScorerRow,
  type FootballStandingRow,
  type FootballSquadPlayerRow,
  type FootballTeamDetailRow,
  type WcGroupStandingRow,
} from "@/app/lib/fetch-standings-client";
import type { Fixture } from "@/app/lib/fixtures";
import { cachedQuery, TTL } from "@/app/lib/cache";
import {
  COMPETITIONS,
  TOP_EVENTS,
  competitionsForSport,
  standingsFor,
  teamProfileFor,
  teamsForCompetition,
} from "./dummy";
import type {
  CompetitionMeta,
  EventCardItem,
  MatchV2,
  SportSlug,
  StandingRow,
  TeamProfile,
  TeamRef,
} from "./types";

const CREST_COLORS = ["#4f7a52", "#c14b3f", "#c79a3a", "#4a6fa5", "#8a5a83", "#a5683a"];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return parts.slice(0, 3).map((p) => p[0]).join("").toUpperCase();
}

export function teamRefFromName(name: string): TeamRef {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return {
    slug: slugify(name),
    name,
    shortName: name,
    code: initials(name),
    color: CREST_COLORS[h % CREST_COLORS.length],
  };
}

function mapFixture(f: Fixture): MatchV2 {
  return {
    id: f.id,
    sport: f.sport === "f1" ? "f1" : "football",
    competitionSlug: slugify(f.competition || f.competitionShort || "match"),
    competitionShort: f.competitionShort || f.competition || "",
    home: teamRefFromName(f.homeTeam),
    away: teamRefFromName(f.awayTeam),
    date: f.date,
    kickoff: f.kickoff,
    status: f.status,
    homeScore: f.homeScore,
    awayScore: f.awayScore,
    clock: f.status === "live" ? "LIVE" : undefined,
  };
}

async function liveMatches(sport: SportSlug | "all", date: string): Promise<MatchV2[]> {
  if (sport === "cricket") return [];
  const sportId: SportId = sport === "all" ? "all" : sport === "f1" ? "f1" : "football";
  // `date` is an IST day string; the v1 client handles IST↔UTC and returns
  // fixtures already mapped to the shared `Fixture` shape. Empty when Supabase
  // is unconfigured — the UI renders its empty states.
  // Cached at LIVE TTL: these rails carry live scores, and all daily views
  // (schedule, ticker, top, sport) share this one cache by (sport, date).
  return cachedQuery(`liveMatches:${sportId}:${date}`, TTL.LIVE, async () => {
    const { fixtures } = await fetchFixturesByISTDateRange(sportId, date, date);
    return fixtures.map(mapFixture);
  });
}

// ---- public API ----------------------------------------------------------

export async function getScheduleByCompetition(
  date: string,
): Promise<{ competition: CompetitionMeta; matches: MatchV2[] }[]> {
  const matches = await liveMatches("all", date);
  const byComp = new Map<string, MatchV2[]>();
  for (const m of matches) {
    if (!byComp.has(m.competitionSlug)) byComp.set(m.competitionSlug, []);
    byComp.get(m.competitionSlug)!.push(m);
  }
  const groups: { competition: CompetitionMeta; matches: MatchV2[] }[] = [];
  for (const [slug, ms] of byComp) {
    const meta =
      COMPETITIONS.find((c) => c.slug === slug) ??
      ({ slug, name: ms[0].competitionShort || slug, shortName: ms[0].competitionShort, sport: ms[0].sport, country: "", season: "" } as CompetitionMeta);
    groups.push({ competition: meta, matches: ms });
  }
  return groups;
}

export async function getLiveTicker(date: string): Promise<MatchV2[]> {
  const matches = await liveMatches("all", date);
  return matches.filter((m) => m.status === "live");
}

export async function getSportFixtures(
  sport: SportSlug,
  date: string,
): Promise<{ topFixtures: MatchV2[]; recentResults: MatchV2[] }> {
  const matches = await liveMatches(sport, date);
  return {
    topFixtures: matches.filter((m) => m.status !== "finished").slice(0, 6),
    recentResults: matches.filter((m) => m.status === "finished").slice(0, 6),
  };
}

export function getTopEvents(): EventCardItem[] {
  return TOP_EVENTS;
}

/**
 * Top matches for the given IST date. Ranks live first (by kickoff), then
 * scheduled (by kickoff), then finished (most recent kickoff first). Used by
 * the v2 Home "Top events" rail.
 */
export async function getTopMatches(date: string, limit = 8): Promise<MatchV2[]> {
  const matches = await liveMatches("all", date);
  const rank = (s: MatchV2["status"]) => (s === "live" ? 0 : s === "scheduled" ? 1 : 2);
  const sorted = [...matches].sort((a, b) => {
    const r = rank(a.status) - rank(b.status);
    if (r !== 0) return r;
    return a.status === "finished"
      ? b.kickoff.localeCompare(a.kickoff)
      : a.kickoff.localeCompare(b.kickoff);
  });
  return sorted.slice(0, limit);
}

export function getCompetitions(sport: SportSlug): CompetitionMeta[] {
  return competitionsForSport(sport);
}

export function getCompetition(slug: string): CompetitionMeta | undefined {
  return COMPETITIONS.find((c) => c.slug === slug);
}

// TODO(v2-db): replace with live standings query once the table exists.
export function getStandings(competitionSlug: string): StandingRow[] {
  return standingsFor(competitionSlug);
}

// TODO(v2-db): replace with live squad query once the table exists.
export function getTeamProfile(teamSlug: string): TeamProfile | null {
  return teamProfileFor(teamSlug);
}

export function getTeamsForCompetition(competitionSlug: string): TeamRef[] {
  return teamsForCompetition(competitionSlug);
}

// ---- live competition queries (fixtures / results / stats / teams) --------
// Maps a v2 competition slug to the canonical `events.short_code` understood by
// the fetch-standings layer. Unmapped slugs return empty.

interface CompDbInfo {
  /** canonical events.short_code */
  short: string;
  /** competition display name for the league standings query.
   *  Omitted for competitions with no league table. */
  standings?: string;
}

const COMP_DB: Record<string, CompDbInfo> = {
  "premier-league": { short: "PL", standings: "Premier League" },
  "champions-league": { short: "CL" },
  "la-liga": { short: "PD", standings: "La Liga" },
  "serie-a": { short: "SA", standings: "Serie A" },
  bundesliga: { short: "BL1", standings: "Bundesliga" },
  "ligue-1": { short: "FL1", standings: "Ligue 1" },
  "europa-league": { short: "EL", standings: "UEFA Europa League" },
  "world-cup": { short: "WC" },
};

/** DB `competition_short` for a v2 slug, or null if not wired to live data. */
export function competitionDbShort(competitionSlug: string): string | null {
  return COMP_DB[competitionSlug]?.short ?? null;
}

/**
 * Seasons seeded in `events` for a football competition slug, newest first.
 * Drives the season selector. Empty when the slug isn't wired to live data;
 * callers fall back to the competition's own season so the dropdown always
 * shows at least one entry.
 */
export async function getCompetitionSeasons(competitionSlug: string): Promise<string[]> {
  const short = competitionDbShort(competitionSlug);
  if (!short) return [];
  return cachedQuery(`compSeasons:${short}`, TTL.REFERENCE, () =>
    getSeasonsForCompetition("fb", short),
  );
}

export type {
  FootballFixtureRow,
  FootballMatchDetail,
  FootballScorerRow,
  FootballStandingRow,
  FootballSquadPlayerRow,
  FootballTeamDetailRow,
  WcGroupStandingRow,
};

/**
 * Single football match by UUID, for the dedicated match page. Null when not
 * found / unconfigured. The URL carries the fixture's UUID as its unique code:
 * see {@link matchHref}.
 */
export async function getMatchById(id: string): Promise<FootballMatchDetail | null> {
  // SCHEDULE TTL: a match may be live; keep it short so scores don't stick.
  return cachedQuery(`match:${id}`, TTL.SCHEDULE, () => fetchFootballMatchById(id));
}

/** Route to a fixture's dedicated detail page (uuid = unique code). */
export function matchHref(id: string): string {
  return `/match/?id=${encodeURIComponent(id)}`;
}

/** League standings (all teams) for a competition. Empty for cup/group-stage
 *  competitions with no league table, or when no data source is configured. */
export async function getCompetitionStandings(
  competitionSlug: string,
): Promise<FootballStandingRow[]> {
  const name = COMP_DB[competitionSlug]?.standings;
  if (!name) return [];
  return cachedQuery(`standings:${name}`, TTL.STANDINGS, () => fetchFootballStandings(name));
}

/** All World Cup fixtures (every stage), oldest first. */
export async function getWcFixtures(): Promise<FootballFixtureRow[]> {
  return cachedQuery("wcFixtures", TTL.STANDINGS, () => fetchWcFixturesByStage(null, 250));
}

/** World Cup group standings keyed by group name (A, B, …). */
export async function getWcGroupStandings(): Promise<Record<string, WcGroupStandingRow[]>> {
  return cachedQuery("wcGroupStandings", TTL.STANDINGS, () => fetchWcGroupStandings());
}

// ---- live Formula 1 queries ----------------------------------------------

export type {
  F1ConstructorRow,
  F1DriverRow,
  F1RaceResultRow,
  F1RaceRow,
  F1SprintResultRow,
};

/** Full F1 race calendar for a season, ordered by round. */
export async function getF1Calendar(season?: string): Promise<F1RaceRow[]> {
  return cachedQuery(`f1Calendar:${season ?? "default"}`, TTL.REFERENCE, () =>
    fetchF1Calendar(season),
  );
}

/** Driver championship standings for a season, highest points first. */
export async function getF1DriverStandings(season?: string): Promise<F1DriverRow[]> {
  return cachedQuery(`f1Drivers:${season ?? "default"}`, TTL.STANDINGS, async () => {
    const rows = await fetchF1DriverStandings(season);
    return [...rows].sort((a, b) => Number(b.points) - Number(a.points));
  });
}

/** Constructor championship standings for a season, highest points first. */
export async function getF1ConstructorStandings(season?: string): Promise<F1ConstructorRow[]> {
  return cachedQuery(`f1Constructors:${season ?? "default"}`, TTL.STANDINGS, async () => {
    const rows = await fetchF1ConstructorStandings(season);
    return [...rows].sort((a, b) => Number(b.points) - Number(a.points));
  });
}

/** F1 seasons seeded in `events`, newest first. Drives the season selector. */
export async function getF1Seasons(): Promise<string[]> {
  return cachedQuery("f1Seasons", TTL.REFERENCE, () => getSeasonsForCompetition("f1", "F1"));
}

/** Race classification for a given season/round, sorted by finish position. */
export async function getF1RaceResults(season: string, round: number): Promise<F1RaceResultRow[]> {
  // STANDINGS TTL: results finalize after a race; avoid 7d-caching a mid-race snapshot.
  return cachedQuery(`f1RaceResults:${season}:${round}`, TTL.STANDINGS, async () => {
    const rows = await fetchF1RaceResults(season, round);
    return [...rows].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  });
}

/** Sprint classification for a given season/round, sorted by finish position. */
export async function getF1SprintResults(season: string, round: number): Promise<F1SprintResultRow[]> {
  return cachedQuery(`f1SprintResults:${season}:${round}`, TTL.STANDINGS, async () => {
    const rows = await fetchF1SprintResults(season, round);
    return [...rows].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  });
}

/** Paged fixtures/results for a competition. Empty when the slug is unmapped. */
export async function getCompetitionFixtures(
  competitionSlug: string,
  status: "scheduled" | "finished",
  page: number,
  pageSize = 12,
  fromDate?: string,
  toDate?: string,
): Promise<{ rows: FootballFixtureRow[]; hasMore: boolean }> {
  const short = competitionDbShort(competitionSlug);
  if (!short) return { rows: [], hasMore: false };
  const key = `compFixtures:${short}:${status}:${page}:${pageSize}:${fromDate ?? ""}:${toDate ?? ""}`;
  return cachedQuery(key, TTL.STANDINGS, () =>
    fetchFootballFixturesPaged(short, status, page, pageSize, fromDate, toDate),
  );
}

/** Top scorers for a competition. Empty when the slug is unmapped. */
export async function getCompetitionScorers(
  competitionSlug: string,
  limit = 20,
): Promise<FootballScorerRow[]> {
  const short = competitionDbShort(competitionSlug);
  if (!short) return [];
  return cachedQuery(`compScorers:${short}:${limit}`, TTL.STANDINGS, () =>
    fetchFootballScorers(short, limit),
  );
}

/** Team list (with crests) for a competition. Empty when unmapped. */
export async function getCompetitionTeamDetails(
  competitionSlug: string,
): Promise<FootballTeamDetailRow[]> {
  const short = competitionDbShort(competitionSlug);
  if (!short) return [];
  return cachedQuery(`compTeams:${short}`, TTL.REFERENCE, () => fetchTeamsForCompetition(short));
}

/** Squad for a club (by club UUID). */
export async function getTeamSquad(clubId: string): Promise<FootballSquadPlayerRow[]> {
  return cachedQuery(`squad:${clubId}`, TTL.REFERENCE, () => fetchSquadByClubId(clubId));
}
