import type { FootballFixtureRow } from "./fetch-standings-client";
import type { Prediction, GroupPicks } from "./predictions-types";
import { GROUP_LETTERS } from "./wc2026-groups";
import { KO_BRACKET, KO_ROUND_POINTS, CHAMPION_POINTS } from "./wc2026-ko-bracket";
import { teamCode } from "./team-meta";

/**
 * Scoring constants (max ~285 pts):
 *   Phase 1:
 *     - exact qualifier slot (1st or 2nd): 5 pt each × 2 × 12   = 120
 *     - correct semifinalist: 5 pt each × 4                     =  20
 *     - correct top scorer:  15 pt each × 2                     =  30
 *     - correct Phase-1 champion pick                           =  20
 *   Phase 2:
 *     - R32 winner:  2 × 16 = 32
 *     - R16 winner:  3 × 8  = 24
 *     - QF winner:   5 × 4  = 20
 *     - SF winner:   8 × 2  = 16
 *     - Final winner:12 × 1 = 12
 *     - Champion (KO):   15
 */
export const POINTS_PER_GROUP_SLOT = 5;
export const POINTS_PER_SEMIFINALIST = 5;
export const POINTS_PER_TOP_SCORER = 15;
export const POINTS_PHASE1_CHAMPION = 20;

export interface ActualResults {
  /** Actual final group standings: groupLetter → [1st..4th] team codes. */
  group_standings: GroupPicks;
  /** Actual semifinalist team codes (any order). */
  semifinalists: string[];
  /** Actual golden boot winner names. */
  top_scorers: string[];
  /** Actual KO winners keyed by match id (r32_m1 …). */
  ko_winners: Record<string, string>;
  /** Actual champion code. */
  champion: string | null;
}

export interface ScoreBreakdown {
  group_points: number;
  semi_points: number;
  scorer_points: number;
  champion_pick_points: number;
  ko_points: number;
  champion_points: number;
  total: number;
}

const EMPTY_SCORE: ScoreBreakdown = {
  group_points: 0,
  semi_points: 0,
  scorer_points: 0,
  champion_pick_points: 0,
  ko_points: 0,
  champion_points: 0,
  total: 0,
};

export function scorePhase1(p: Prediction, actual: ActualResults): ScoreBreakdown {
  let gp = 0;
  for (const g of GROUP_LETTERS) {
    const picks = p.group_picks[g];
    const real = actual.group_standings[g];
    if (!picks || !real) continue;
    for (let i = 0; i < 2; i++) {
      if (picks[i] && real[i] && picks[i] === real[i]) gp += POINTS_PER_GROUP_SLOT;
    }
  }
  const semiSet = new Set(actual.semifinalists);
  const sp = p.semifinalists.filter((t) => semiSet.has(t)).length * POINTS_PER_SEMIFINALIST;
  const scorerSet = new Set(actual.top_scorers.map((s) => s.toLowerCase()));
  const sc = p.top_scorers.filter((s) => scorerSet.has(s.toLowerCase())).length * POINTS_PER_TOP_SCORER;
  const cpp = p.champion_pick && actual.champion && p.champion_pick === actual.champion
    ? POINTS_PHASE1_CHAMPION
    : 0;
  return {
    ...EMPTY_SCORE,
    group_points: gp,
    semi_points: sp,
    scorer_points: sc,
    champion_pick_points: cpp,
    total: gp + sp + sc + cpp,
  };
}

export function scorePhase2(p: Prediction, actual: ActualResults): ScoreBreakdown {
  if (!p.ko_picks) return { ...EMPTY_SCORE };
  let kop = 0;
  for (const slot of KO_BRACKET) {
    const pick = p.ko_picks[slot.id];
    const real = actual.ko_winners[slot.id];
    if (pick && real && pick === real) kop += KO_ROUND_POINTS[slot.round];
  }
  const cp = p.champion && actual.champion && p.champion === actual.champion
    ? CHAMPION_POINTS
    : 0;
  return {
    ...EMPTY_SCORE,
    ko_points: kop,
    champion_points: cp,
    total: kop + cp,
  };
}

export function scoreTotal(p: Prediction, actual: ActualResults): ScoreBreakdown {
  const a = scorePhase1(p, actual);
  const b = scorePhase2(p, actual);
  return {
    group_points: a.group_points,
    semi_points: a.semi_points,
    scorer_points: a.scorer_points,
    champion_pick_points: a.champion_pick_points,
    ko_points: b.ko_points,
    champion_points: b.champion_points,
    total: a.total + b.total,
  };
}

/**
 * Derive actual results from finished football_fixtures rows.
 * Returns empty/partial structure when no fixtures are finished — scoring
 * functions simply award 0 in that case.
 */
export function deriveActualResults(
  fixtures: FootballFixtureRow[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _opts: { goldenBoot?: string[] } = {},
): ActualResults {
  void fixtures;
  // Group standings + KO winners derivation will be wired when real fixtures
  // are present. For dummy iteration we return an empty actual-results scaffold.
  return {
    group_standings: {},
    semifinalists: [],
    top_scorers: [],
    ko_winners: {},
    champion: null,
  };
}

// Re-export teamCode so callers don't need a separate import path
export { teamCode };
