/**
 * World Cup knockout-bracket helpers.
 *
 * The DB stores a fixture's stage in `fb_fixtures.match_type`, sourced from
 * football-data.org's `stage` field lowercased (e.g. `group_stage`, `last_32`,
 * `last_16`, `quarter_finals`, `semi_finals`, `third_place`, `final`). The
 * matching `fb_knockout_standings.round` carries the same stage UPPERCASED.
 * Everything here normalizes case/punctuation first so the UI never has to care
 * which side a value came from, and tolerates the older `r32`/`r16`/`qf`… ids
 * the v2 view used before this module existed.
 */
import type { FootballFixtureRow, WcKnockoutRow } from "./queries";

/** Canonical knockout rounds, in bracket order (group stage excluded). */
export const KO_ROUNDS = [
  "last_32",
  "last_16",
  "quarter_finals",
  "semi_finals",
  "final",
] as const;
export type KoRound = (typeof KO_ROUNDS)[number];

/** Column titles (plural) for the bracket. */
export const ROUND_TITLE: Record<string, string> = {
  last_32: "Round of 32",
  last_16: "Round of 16",
  quarter_finals: "Quarter-finals",
  semi_finals: "Semi-finals",
  third_place: "Third place",
  final: "Final",
};

/** Chip labels (singular) for a single fixture row. */
const CHIP_LABEL: Record<string, string> = {
  group_stage: "Group",
  last_32: "Round of 32",
  last_16: "Round of 16",
  quarter_finals: "Quarter-final",
  semi_finals: "Semi-final",
  third_place: "Third place",
  final: "Final",
};

/**
 * Fold any stage spelling onto a canonical id. Handles FD strings in either
 * case, hyphen/space variants, and the legacy short ids (`r32`, `qf`, …).
 */
export function normalizeStage(raw?: string | null): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase().replace(/[\s-]+/g, "_");
  if (s.startsWith("group")) return "group_stage";
  if (s === "last_32" || s === "round_of_32" || s === "r32") return "last_32";
  if (s === "last_16" || s === "round_of_16" || s === "r16") return "last_16";
  if (s.startsWith("quarter") || s === "qf") return "quarter_finals";
  if (s.startsWith("semi") || s === "sf") return "semi_finals";
  if (s.startsWith("third") || s === "3rd_place" || s === "third") return "third_place";
  if (s === "final" || s === "f") return "final";
  return s;
}

/** True for any knockout stage (i.e. not the group stage). */
export function isKnockout(stage?: string | null): boolean {
  const n = normalizeStage(stage);
  return n === "third_place" || KO_ROUNDS.includes(n as KoRound);
}

/** Display label for a fixture's stage chip ("Group A", "Quarter-final", …). */
export function stageChipLabel(stage?: string | null, group?: string | null): string | null {
  const n = normalizeStage(stage);
  if (!n) return null;
  if (n === "group_stage") {
    const letter = (group ?? "").replace(/^group[\s_-]*/i, "").trim();
    return letter ? `Group ${letter}` : "Group";
  }
  return CHIP_LABEL[n] ?? n;
}

/** Stable key for a two-team tie within a round (order-independent). */
function tieKey(stage: string | null, a: string, b: string): string {
  const round = normalizeStage(stage) ?? "";
  return `${round}|${[a, b].sort().join("__")}`;
}

/**
 * Map of tie → advancing team name, built from `fb_knockout_standings`. The
 * `qualified` row names the team that went through — the only reliable signal
 * when a single-leg tie is level after 90/120' and decided on penalties.
 */
export function buildWinnerLookup(rows: WcKnockoutRow[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const r of rows) {
    if (r.qualified && r.team && r.opponent) {
      m.set(tieKey(r.round, r.team, r.opponent), r.team);
    }
  }
  return m;
}

export type Side = "home" | "away" | null;

/**
 * Which side advanced. Decided by score first; for a level/missing score on a
 * finished tie, falls back to the `fb_knockout_standings` winner lookup
 * (penalties). Null while the tie is unplayed or the winner is unknown.
 */
export function tieWinner(f: FootballFixtureRow, winners: Map<string, string>): Side {
  if (f.status !== "finished") return null;
  const { home_score: hs, away_score: as } = f;
  if (hs != null && as != null) {
    if (hs > as) return "home";
    if (as > hs) return "away";
  }
  const q = winners.get(tieKey(f.stage ?? null, f.home_team, f.away_team));
  if (q && q === f.home_team) return "home";
  if (q && q === f.away_team) return "away";
  return null;
}

export interface BracketRound {
  id: string;
  title: string;
  ties: FootballFixtureRow[];
}

/**
 * Bucket knockout fixtures into ordered rounds. Within a round, ties keep
 * schedule order (date then kickoff) so the tree reads top-to-bottom. The
 * third-place play-off is returned separately — it hangs off the final, not in
 * the main ladder.
 */
export function buildBracket(fixtures: FootballFixtureRow[]): {
  rounds: BracketRound[];
  thirdPlace: FootballFixtureRow | null;
} {
  const byStage = new Map<string, FootballFixtureRow[]>();
  for (const f of fixtures) {
    const n = normalizeStage(f.stage);
    if (!n || n === "group_stage") continue;
    (byStage.get(n) ?? byStage.set(n, []).get(n)!).push(f);
  }
  const sortTies = (a: FootballFixtureRow, b: FootballFixtureRow) =>
    a.date === b.date ? a.kickoff.localeCompare(b.kickoff) : a.date.localeCompare(b.date);
  const rounds: BracketRound[] = KO_ROUNDS.filter((id) => byStage.has(id)).map((id) => ({
    id,
    title: ROUND_TITLE[id],
    ties: byStage.get(id)!.slice().sort(sortTies),
  }));
  const tp = byStage.get("third_place");
  return { rounds, thirdPlace: tp && tp.length ? tp.slice().sort(sortTies)[0] : null };
}

// ---- offline demo data ----------------------------------------------------
// A fully-played sample bracket for offline development / `?demo=1`, mirroring
// the philosophy of generateDummyFixtures(). Never used against live data.

const DEMO_TEAMS = [
  "Argentina", "Australia", "Brazil", "Croatia", "England", "France", "Germany",
  "Spain", "Netherlands", "Portugal", "Belgium", "Morocco", "USA", "Mexico",
  "Japan", "Senegal", "Denmark", "Switzerland", "Colombia", "Ecuador", "Serbia",
  "Poland", "South Korea", "Canada", "Uruguay", "Nigeria", "Ghana", "Cameroon",
  "Qatar", "Saudi Arabia", "Iran", "Tunisia",
];

// How many ties in each round are already played in the demo. The rest are
// seeded as skeleton rows — exactly what the DB now stores before qualifiers
// are known — so `?demo=1` exercises decided, partially-TBD, and all-TBD slots.
const DEMO_PLAYED: Record<KoRound, number> = {
  last_32: 16, // Round of 32 fully decided
  last_16: 5, //  Round of 16 partway through (3 ties still to come)
  quarter_finals: 0,
  semi_finals: 0,
  final: 0,
};

/**
 * Deterministic mid-knockout sample bracket for previews. The Round of 32 is
 * complete, the Round of 16 is partway (one tie on penalties), and the later
 * rounds are skeleton slots — some with one qualifier known, some all-TBD —
 * mirroring how the live bracket fills in left-to-right.
 */
export function generateDemoBracket(): {
  fixtures: FootballFixtureRow[];
  winners: Map<string, string>;
} {
  const fixtures: FootballFixtureRow[] = [];
  const winners = new Map<string, string>();
  let n = 0;

  const push = (
    stage: string,
    home: string,
    away: string,
    opts: { hs?: number; as?: number; pens?: [number, number]; played?: boolean },
  ) => {
    const played = opts.played ?? false;
    fixtures.push({
      id: `demo-${stage}-${n++}`,
      home_team: home,
      away_team: away,
      competition: "FIFA World Cup",
      competition_short: "WC",
      kickoff: "20:30",
      date: `2026-07-${String(2 + (n % 16)).padStart(2, "0")}`,
      venue: "Sample Stadium",
      status: played ? "finished" : "scheduled",
      home_score: played ? (opts.hs ?? null) : null,
      away_score: played ? (opts.as ?? null) : null,
      home_score_pen: opts.pens ? opts.pens[0] : null,
      away_score_pen: opts.pens ? opts.pens[1] : null,
      stage,
      group_name: null,
    });
    if (played && opts.pens && opts.hs === opts.as) {
      const w = opts.pens[0] > opts.pens[1] ? home : away;
      winners.set(`${stage}|${[home, away].sort().join("__")}`, w);
    }
  };

  // Walk the ladder; an unplayed tie yields a "TBD" occupant for the next round.
  let slots: string[] = DEMO_TEAMS.slice();
  KO_ROUNDS.forEach((stage) => {
    const playedCount = DEMO_PLAYED[stage];
    const next: string[] = [];
    for (let i = 0; i < slots.length; i += 2) {
      const home = slots[i];
      const away = slots[i + 1];
      const ti = i / 2;
      const decided = ti < playedCount && home !== "TBD" && away !== "TBD";
      if (!decided) {
        push(stage, home, away, { played: false });
        next.push("TBD");
        continue;
      }
      const pens = stage === "last_16" && ti === 1 ? ([4, 2] as [number, number]) : undefined;
      // Decisive scoreline (home advances); one R16 tie goes to penalties.
      push(stage, home, away, pens ? { hs: 1, as: 1, pens, played: true } : { hs: 2, as: 1, played: true });
      next.push(home);
    }
    slots = next;
  });

  // Third-place play-off — its participants (the losing semi-finalists) are not
  // known yet in this snapshot, so it renders as an all-TBD skeleton slot.
  push("third_place", "TBD", "TBD", { played: false });

  return { fixtures, winners };
}
