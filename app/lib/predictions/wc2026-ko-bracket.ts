/**
 * Fixed R32 → Final bracket shape for WC2026 (48-team format).
 *
 * Slot labels reference group-stage qualifiers:
 *   "A1" = 1st of group A, "A2" = 2nd of group A,
 *   "3ABCD" = best 3rd-placed from groups A/B/C/D, etc.
 *
 * This is a placeholder bracket layout — refine when FIFA publishes the
 * official pairings. Only used as the visual frame for the Phase 2 picker;
 * real seeding fills in from actual `football_fixtures` rows by stage.
 */

export interface KoMatchSlot {
  id: string;
  round: "r32" | "r16" | "qf" | "sf" | "final";
  /** Slot label or upstream match id. */
  top: string;
  bot: string;
}

export const KO_BRACKET: KoMatchSlot[] = [
  // R32 (16 matches)
  { id: "r32_m1",  round: "r32", top: "A1",      bot: "3CDEFG" },
  { id: "r32_m2",  round: "r32", top: "C1",      bot: "3ABFKL" },
  { id: "r32_m3",  round: "r32", top: "E1",      bot: "F2" },
  { id: "r32_m4",  round: "r32", top: "B1",      bot: "3HIJK" },
  { id: "r32_m5",  round: "r32", top: "G1",      bot: "3HIJL" },
  { id: "r32_m6",  round: "r32", top: "D1",      bot: "3BEFI" },
  { id: "r32_m7",  round: "r32", top: "F1",      bot: "E2" },
  { id: "r32_m8",  round: "r32", top: "H1",      bot: "3ACDG" },
  { id: "r32_m9",  round: "r32", top: "I1",      bot: "J2" },
  { id: "r32_m10", round: "r32", top: "K1",      bot: "L2" },
  { id: "r32_m11", round: "r32", top: "A2",      bot: "C2" },
  { id: "r32_m12", round: "r32", top: "B2",      bot: "D2" },
  { id: "r32_m13", round: "r32", top: "G2",      bot: "H2" },
  { id: "r32_m14", round: "r32", top: "I2",      bot: "K2" },
  { id: "r32_m15", round: "r32", top: "J1",      bot: "L1" },
  { id: "r32_m16", round: "r32", top: "3EFGH",   bot: "3BCDI" },
  // R16
  { id: "r16_m1", round: "r16", top: "r32_m1",  bot: "r32_m2" },
  { id: "r16_m2", round: "r16", top: "r32_m3",  bot: "r32_m4" },
  { id: "r16_m3", round: "r16", top: "r32_m5",  bot: "r32_m6" },
  { id: "r16_m4", round: "r16", top: "r32_m7",  bot: "r32_m8" },
  { id: "r16_m5", round: "r16", top: "r32_m9",  bot: "r32_m10" },
  { id: "r16_m6", round: "r16", top: "r32_m11", bot: "r32_m12" },
  { id: "r16_m7", round: "r16", top: "r32_m13", bot: "r32_m14" },
  { id: "r16_m8", round: "r16", top: "r32_m15", bot: "r32_m16" },
  // QF
  { id: "qf_m1", round: "qf", top: "r16_m1", bot: "r16_m2" },
  { id: "qf_m2", round: "qf", top: "r16_m3", bot: "r16_m4" },
  { id: "qf_m3", round: "qf", top: "r16_m5", bot: "r16_m6" },
  { id: "qf_m4", round: "qf", top: "r16_m7", bot: "r16_m8" },
  // SF
  { id: "sf_m1", round: "sf", top: "qf_m1", bot: "qf_m2" },
  { id: "sf_m2", round: "sf", top: "qf_m3", bot: "qf_m4" },
  // Final
  { id: "final", round: "final", top: "sf_m1", bot: "sf_m2" },
];

export const KO_ROUND_LABEL: Record<KoMatchSlot["round"], string> = {
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-finals",
  sf: "Semi-finals",
  final: "Final",
};

export const KO_ROUND_POINTS: Record<KoMatchSlot["round"], number> = {
  r32: 2,
  r16: 3,
  qf: 5,
  sf: 8,
  final: 12,
};

export const CHAMPION_POINTS = 15;
