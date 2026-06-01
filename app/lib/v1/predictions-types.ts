/**
 * Types for the WC2026 predictions game.
 * Storage shape is identical to the planned Supabase table so the swap
 * from localStorage → Supabase only touches `predictions-client.ts`.
 */

export type PhaseState =
  | "phase1_open"
  | "phase1_locked"
  | "phase2_open"
  | "all_locked";

export type GroupLetter =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

/** Ordered tuple [1st, 2nd] of 3-letter team codes. Empty string = not picked. */
export type GroupStandingPicks = [string, string];

export interface GroupPicks {
  [groupLetter: string]: GroupStandingPicks;
}

/**
 * KO match keys:
 *   r32_m1..r32_m16, r16_m1..r16_m8, qf_m1..qf_m4, sf_m1..sf_m2, final
 * Value: 3-letter winner code.
 */
export interface KoPicks {
  [matchId: string]: string;
}

export interface Prediction {
  id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
  group_picks: GroupPicks;
  semifinalists: [string, string, string, string];
  top_scorers: [string, string];
  /** Phase-1 single-team champion pick. Empty string = not picked. */
  champion_pick: string;
  ko_picks: KoPicks | null;
  /** Denormalized champion from KO bracket final (Phase 2). */
  champion: string | null;
}

export interface SubmitPhase1Input {
  display_name: string;
  group_picks: GroupPicks;
  semifinalists: [string, string, string, string];
  top_scorers: [string, string];
  champion_pick: string;
}

export interface SubmitPhase1Result {
  id: string;
  edit_token: string;
}

export interface LocalIdentity {
  id: string;
  edit_token: string;
}
