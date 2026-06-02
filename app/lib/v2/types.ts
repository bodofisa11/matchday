/**
 * v2 UI domain types. Shape mirrors the planned v2 Supabase schema so that
 * dummy sources here can later be swapped for live queries without changing
 * component contracts.
 */

export type SportSlug = "football" | "f1" | "cricket";

export interface SportMeta {
  slug: SportSlug;
  label: string;
  /** color token key used for the sport dot: foot | f1 | crk */
  dot: "foot" | "f1" | "crk";
}

export const SPORTS: SportMeta[] = [
  { slug: "football", label: "Football", dot: "foot" },
  { slug: "f1", label: "Formula 1", dot: "f1" },
  { slug: "cricket", label: "Cricket", dot: "crk" },
];

export function sportDot(slug: SportSlug): "foot" | "f1" | "crk" {
  return SPORTS.find((s) => s.slug === slug)?.dot ?? "foot";
}

export interface CompetitionMeta {
  slug: string;
  name: string;
  shortName: string;
  sport: SportSlug;
  country: string;
  season: string;
}

/** A team/club/circuit reference used across cards and rows. */
export interface TeamRef {
  slug: string;
  name: string;
  shortName: string;
  /** 2–3 char initials for the crest placeholder */
  code: string;
  /** hex color for the crest placeholder background */
  color: string;
}

export type MatchStatus = "scheduled" | "live" | "finished";

export interface MatchV2 {
  id: string;
  sport: SportSlug;
  competitionSlug: string;
  competitionShort: string;
  home: TeamRef;
  away: TeamRef;
  /** ISO date YYYY-MM-DD (IST) */
  date: string;
  /** HH:MM (IST) */
  kickoff: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  /** display clock for live chips, e.g. "67'", "HT", "L41" */
  clock?: string;
}

export interface EventCardItem {
  competitionSlug: string;
  sport: SportSlug;
  title: string;
  subtitle: string;
  meta: string;
}

export interface StandingRow {
  rank: number;
  team: TeamRef;
  played: number;
  won: number;
  drawn: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  /** recent form, most recent last */
  form: ("W" | "D" | "L")[];
}

export type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";

export interface SquadPlayer {
  number: number;
  name: string;
  position: PlayerPosition;
  nationality: string;
  age: number;
}

export interface TeamStat {
  value: string;
  label: string;
}

export interface TeamProfile {
  team: TeamRef;
  sport: SportSlug;
  country: string;
  stadium: string;
  founded: number;
  coach: string;
  stats: TeamStat[];
  squad: SquadPlayer[];
}
