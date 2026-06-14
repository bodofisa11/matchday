/**
 * Static config + placeholder data for the v2 UI. Competitions list and top-
 * events rail are static config; team profiles back the standalone `[team]`
 * route, which the normalized schema has no club-honours source for. Live data
 * (fixtures, standings, squads, scorers) comes from [queries.ts], not here.
 */
import type {
  CompetitionMeta,
  EventCardItem,
  SportSlug,
  StandingRow,
  SquadPlayer,
  TeamProfile,
  TeamRef,
} from "./types";

function t(slug: string, name: string, code: string, color: string): TeamRef {
  return { slug, name, shortName: name, code, color };
}

// ---- teams ---------------------------------------------------------------
export const TEAMS: Record<string, TeamRef> = {
  arsenal: t("arsenal", "Arsenal", "ARS", "#ef0107"),
  liverpool: t("liverpool", "Liverpool", "LIV", "#c8102e"),
  mancity: t("mancity", "Manchester City", "MCI", "#6cabdd"),
  spurs: t("spurs", "Tottenham", "TOT", "#132257"),
  chelsea: t("chelsea", "Chelsea", "CHE", "#034694"),
  newcastle: t("newcastle", "Newcastle", "NEW", "#241f20"),
  villa: t("villa", "Aston Villa", "AVL", "#95bfe5"),
  brighton: t("brighton", "Brighton", "BHA", "#0057b8"),
  barcelona: t("barcelona", "FC Barcelona", "BAR", "#a50044"),
  realmadrid: t("realmadrid", "Real Madrid", "RMA", "#febe10"),
  atletico: t("atletico", "Atlético Madrid", "ATM", "#cb3524"),
  sevilla: t("sevilla", "Sevilla", "SEV", "#d8231f"),
  bayern: t("bayern", "Bayern München", "BAY", "#dc052d"),
  dortmund: t("dortmund", "Dortmund", "BVB", "#fde100"),
  inter: t("inter", "Inter", "INT", "#0068a8"),
  milan: t("milan", "AC Milan", "MIL", "#fb090b"),
};

// ---- competitions --------------------------------------------------------
export const COMPETITIONS: CompetitionMeta[] = [
  { slug: "premier-league", name: "Premier League", shortName: "PL", sport: "football", country: "England", season: "2025/26" },
  { slug: "champions-league", name: "Champions League", shortName: "UCL", sport: "football", country: "Europe", season: "2025/26" },
  { slug: "la-liga", name: "La Liga", shortName: "LAL", sport: "football", country: "Spain", season: "2025/26" },
  { slug: "serie-a", name: "Serie A", shortName: "SEA", sport: "football", country: "Italy", season: "2025/26" },
  { slug: "bundesliga", name: "Bundesliga", shortName: "BUN", sport: "football", country: "Germany", season: "2025/26" },
  { slug: "ligue-1", name: "Ligue 1", shortName: "FL1", sport: "football", country: "France", season: "2025/26" },
  { slug: "europa-league", name: "Europa League", shortName: "UEL", sport: "football", country: "Europe", season: "2025/26" },
  { slug: "indian-super-league", name: "Indian Super League", shortName: "ISL", sport: "football", country: "India", season: "2025/26" },
  { slug: "ipl", name: "Indian Premier League", shortName: "IPL", sport: "cricket", country: "India", season: "2026" },
];
// FIFA World Cup is not a league competition — it has its own top-level route
// (`/world-cup`, see [WorldCupView]) and is intentionally excluded here.

export function competitionsForSport(sport: SportSlug): CompetitionMeta[] {
  return COMPETITIONS.filter((c) => c.sport === sport);
}

// ---- standings (dummy) ---------------------------------------------------
const STANDINGS_TEAMS: Record<string, string[]> = {
  "premier-league": ["liverpool", "arsenal", "mancity", "spurs", "chelsea", "newcastle", "villa", "brighton"],
  "la-liga": ["realmadrid", "barcelona", "atletico", "sevilla"],
  "serie-a": ["inter", "milan"],
  bundesliga: ["bayern", "dortmund"],
};

function form(seed: number): ("W" | "D" | "L")[] {
  const opts: ("W" | "D" | "L")[] = ["W", "W", "D", "L", "W"];
  return opts.map((_, i) => opts[(seed + i) % 3 === 0 ? 0 : (seed + i) % 3 === 1 ? 1 : 2]);
}

export function standingsFor(competitionSlug: string): StandingRow[] {
  const slugs = STANDINGS_TEAMS[competitionSlug];
  if (!slugs) return [];
  return slugs.map((slug, i) => {
    const won = 28 - i * 2;
    const drawn = 6 + (i % 3);
    return {
      rank: i + 1,
      team: TEAMS[slug],
      played: 38,
      won,
      drawn,
      goalsFor: 92 - i * 6,
      goalsAgainst: 30 + i * 5,
      points: won * 3 + drawn,
      form: form(i),
    };
  });
}

// ---- squads (dummy) ------------------------------------------------------
const SQUAD_BARCELONA: SquadPlayer[] = [
  { number: 1, name: "Marc-André ter Stegen", position: "GK", nationality: "Germany", age: 33 },
  { number: 13, name: "Iñaki Peña", position: "GK", nationality: "Spain", age: 26 },
  { number: 25, name: "Wojciech Szczęsny", position: "GK", nationality: "Poland", age: 35 },
  { number: 2, name: "Jules Koundé", position: "DEF", nationality: "France", age: 27 },
  { number: 3, name: "Alejandro Balde", position: "DEF", nationality: "Spain", age: 22 },
  { number: 4, name: "Ronald Araújo", position: "DEF", nationality: "Uruguay", age: 26 },
  { number: 5, name: "Iñigo Martínez", position: "DEF", nationality: "Spain", age: 34 },
  { number: 23, name: "Jules Koundé", position: "DEF", nationality: "France", age: 27 },
  { number: 8, name: "Pedri", position: "MID", nationality: "Spain", age: 23 },
  { number: 6, name: "Gavi", position: "MID", nationality: "Spain", age: 21 },
  { number: 21, name: "Frenkie de Jong", position: "MID", nationality: "Netherlands", age: 28 },
  { number: 16, name: "Fermín López", position: "MID", nationality: "Spain", age: 22 },
  { number: 9, name: "Robert Lewandowski", position: "FWD", nationality: "Poland", age: 37 },
  { number: 11, name: "Raphinha", position: "FWD", nationality: "Brazil", age: 29 },
  { number: 10, name: "Lamine Yamal", position: "FWD", nationality: "Spain", age: 18 },
];

export function teamProfileFor(teamSlug: string): TeamProfile | null {
  const team = TEAMS[teamSlug];
  if (!team) return null;
  // Only Barcelona has a hand-authored squad; others reuse the same shape.
  return {
    team,
    sport: "football",
    country: teamSlug === "barcelona" ? "Spain" : "England",
    stadium: teamSlug === "barcelona" ? "Spotify Camp Nou" : "Stadium",
    founded: teamSlug === "barcelona" ? 1899 : 1900,
    coach: teamSlug === "barcelona" ? "Hansi Flick" : "—",
    stats: [
      { value: "26", label: "League" },
      { value: "31", label: "Cups" },
      { value: "5", label: "UCL" },
      { value: "14", label: "Super Cup" },
      { value: "3", label: "Club WC" },
    ],
    squad: SQUAD_BARCELONA,
  };
}

/** teams that have a profile page (for generateStaticParams) */
export function teamsForCompetition(competitionSlug: string): TeamRef[] {
  const slugs = STANDINGS_TEAMS[competitionSlug] ?? [];
  return slugs.map((s) => TEAMS[s]);
}

// ---- top events (dummy) --------------------------------------------------
export const TOP_EVENTS: EventCardItem[] = [
  { competitionSlug: "premier-league", sport: "football", title: "Premier League", subtitle: "Matchweek 31", meta: "10 fixtures" },
  { competitionSlug: "champions-league", sport: "football", title: "Champions League", subtitle: "Quarter-finals", meta: "4 fixtures" },
  { competitionSlug: "la-liga", sport: "football", title: "La Liga", subtitle: "El Clásico", meta: "Sat 21:00" },
  { competitionSlug: "f1-monaco", sport: "f1", title: "Monaco GP", subtitle: "Round 8", meta: "Sun 14:00" },
  { competitionSlug: "ipl-final", sport: "cricket", title: "IPL Final", subtitle: "Playoffs", meta: "Sun 19:30" },
  { competitionSlug: "serie-a", sport: "football", title: "Serie A", subtitle: "Derby della Madonnina", meta: "Sun 20:45" },
];
