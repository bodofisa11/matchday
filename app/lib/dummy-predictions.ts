import type { Prediction, GroupPicks, GroupStandingPicks, KoPicks } from "./predictions-types";
import { WC2026_GROUPS, GROUP_LETTERS, WC2026_TEAMS } from "./wc2026-groups";
import { KO_BRACKET } from "./wc2026-ko-bracket";
import { TOP_SCORER_CANDIDATES } from "./wc2026-scorer-candidates";

const FAKE_NAMES = [
  "Akira", "Ben", "Chen", "Diego", "Emma", "Faiz", "Gita", "Hugo",
  "Iqbal", "Jess", "Kabir", "Lila", "Marco", "Niko", "Omar", "Priya",
  "Quentin", "Riya", "Sven", "Tara",
];

function shuffle<T>(arr: T[], seed: number): T[] {
  // Deterministic shuffle so repeated reloads give same dummy data
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickRandomGroupStandings(seed: number): GroupPicks {
  const out: GroupPicks = {};
  for (let i = 0; i < GROUP_LETTERS.length; i++) {
    const g = GROUP_LETTERS[i];
    const teams = WC2026_GROUPS[g];
    const shuffled = shuffle(teams, seed + i * 7);
    out[g] = [shuffled[0].code, shuffled[1].code] as GroupStandingPicks;
  }
  return out;
}

function pickRandomSemis(gp: GroupPicks): [string, string, string, string] {
  // Pick 4 distinct 1st-placed teams from random groups
  const winners = GROUP_LETTERS.map((g) => gp[g][0]);
  return [winners[0], winners[3], winners[6], winners[9]];
}

function pickRandomScorers(seed: number): [string, string] {
  const shuffled = shuffle(TOP_SCORER_CANDIDATES, seed);
  return [shuffled[0].name, shuffled[1].name];
}

function pickRandomKo(seed: number): KoPicks {
  const out: KoPicks = {};
  let s = seed;
  for (const m of KO_BRACKET) {
    s = (s * 1103515245 + 12345) % 2147483648;
    // For dummy, just pick a random team from the full pool
    const t = WC2026_TEAMS[s % WC2026_TEAMS.length];
    out[m.id] = t.code;
  }
  return out;
}

export function generateDummyPredictions(n: number): Prediction[] {
  const out: Prediction[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const gp = pickRandomGroupStandings(i + 1);
    const semis = pickRandomSemis(gp);
    const scorers = pickRandomScorers(i + 11);
    const includeKo = i % 3 === 0; // ~1/3 have phase-2 picks
    const ko = includeKo ? pickRandomKo(i + 91) : null;
    out.push({
      id: `dummy-${i + 1}`,
      display_name: FAKE_NAMES[i % FAKE_NAMES.length] + (i >= FAKE_NAMES.length ? ` ${Math.floor(i / FAKE_NAMES.length) + 1}` : ""),
      created_at: new Date(now - (n - i) * 3_600_000).toISOString(),
      updated_at: new Date(now - (n - i) * 3_600_000).toISOString(),
      group_picks: gp,
      semifinalists: semis,
      top_scorers: scorers,
      champion_pick: semis[0],
      ko_picks: ko,
      champion: ko ? ko["final"] : null,
    });
  }
  return out;
}
