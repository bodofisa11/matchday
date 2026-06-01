/**
 * v2 query layer. Single entry point the v2 UI uses for data.
 *
 * Fixtures: live from the v2 Supabase schema ([fetch-fixtures.ts]); falls back
 * to dummy fixtures when Supabase is unconfigured (local dev / build) so the
 * pages still render.
 * Standings, squads, top events, competitions: dummy ([dummy.ts]) — no v2
 * tables yet. Marked TODO; swap for live queries once the schema lands.
 */
import { fetchFromSupabaseV2 } from "./fetch-fixtures";
import type { Fixture } from "@/app/lib/fixtures";
import {
  COMPETITIONS,
  TOP_EVENTS,
  competitionsForSport,
  dummyMatches,
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

function teamRefFromName(name: string): TeamRef {
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
  const sportId = sport === "all" ? "all" : sport === "f1" ? "f1" : "football";
  try {
    const fixtures = await fetchFromSupabaseV2(sportId, { utcStart: date, utcEnd: date });
    if (fixtures.length > 0) return fixtures.map(mapFixture);
  } catch {
    /* fall through to dummy */
  }
  // dummy fallback (local dev / unconfigured Supabase)
  const dummy = dummyMatches(date);
  return sport === "all" ? dummy : dummy.filter((m) => m.sport === sport);
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
