import type { PhaseState } from "@/app/lib/v1/predictions-types";

/** Lock at first WC2026 kickoff. */
export const PHASE1_LOCK_ISO = "2026-06-11T00:00:00Z";

/** First R32 kickoff (refine when FIFA confirms). */
export const FIRST_R32_KICKOFF_ISO = "2026-06-27T16:00:00Z";

export interface PhaseInputs {
  now: number;
  groupAllFinished: boolean;
  phase1LockIso?: string;
  firstR32KickoffIso?: string;
}

export function derivePhaseState({
  now,
  groupAllFinished,
  phase1LockIso = PHASE1_LOCK_ISO,
  firstR32KickoffIso = FIRST_R32_KICKOFF_ISO,
}: PhaseInputs): PhaseState {
  const phase1Lock = Date.parse(phase1LockIso);
  const r32Kickoff = Date.parse(firstR32KickoffIso);
  if (now < phase1Lock) return "phase1_open";
  if (!groupAllFinished) return "phase1_locked";
  if (now < r32Kickoff) return "phase2_open";
  return "all_locked";
}

export function lockCountdown(targetIso: string, now: number = Date.now()): string {
  const ms = Date.parse(targetIso) - now;
  if (ms <= 0) return "Locked";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
