/**
 * Predictions data client.
 *
 * Iteration 1 (this file): localStorage-backed dummy implementation so the
 * UI can be developed without a backend. The follow-up PR swaps the bodies
 * of these four functions to call Supabase RPCs (submit_phase1, update_phase2)
 * and a SELECT on wc2026_predictions — the surface contract stays identical.
 */
import type {
  Prediction,
  SubmitPhase1Input,
  SubmitPhase1Result,
  KoPicks,
  LocalIdentity,
} from "@/app/lib/v1/predictions-types";

// Bump the v2 suffix when storage shape changes — old keys are abandoned so
// stale tuples don't crash the picker.
const LS_DUMMY = "wc2026.predict.dummy.v3";
const LS_ME = "wc2026.predict.me.v3";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function uuid(): string {
  if (isBrowser() && "crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readAll(): Prediction[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(LS_DUMMY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Prediction[];
  } catch {
    return [];
  }
}

function writeAll(rows: Prediction[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(LS_DUMMY, JSON.stringify(rows));
}

function readMe(): LocalIdentity | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(LS_ME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalIdentity;
  } catch {
    return null;
  }
}

function writeMe(identity: LocalIdentity): void {
  if (!isBrowser()) return;
  localStorage.setItem(LS_ME, JSON.stringify(identity));
}

export async function getAllPredictions(): Promise<Prediction[]> {
  const rows = readAll();
  // Tie-break: total points then earliest created_at — total is recomputed
  // outside, so here we just sort by created_at desc for now.
  return rows.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getMyPrediction(): Promise<Prediction | null> {
  const me = readMe();
  if (!me) return null;
  const all = readAll();
  return all.find((p) => p.id === me.id) ?? null;
}

export function getLocalIdentity(): LocalIdentity | null {
  return readMe();
}

export async function submitPhase1(input: SubmitPhase1Input): Promise<SubmitPhase1Result> {
  const id = uuid();
  const edit_token = uuid();
  const now = new Date().toISOString();
  const row: Prediction = {
    id,
    display_name: input.display_name,
    created_at: now,
    updated_at: now,
    group_picks: input.group_picks,
    semifinalists: input.semifinalists,
    top_scorers: input.top_scorers,
    champion_pick: input.champion_pick,
    ko_picks: null,
    champion: null,
  };
  const all = readAll();
  all.unshift(row);
  writeAll(all);
  writeMe({ id, edit_token });
  return { id, edit_token };
}

export async function updateMyPhase1(input: SubmitPhase1Input): Promise<void> {
  const me = readMe();
  if (!me) throw new Error("no local identity");
  const all = readAll();
  const idx = all.findIndex((p) => p.id === me.id);
  if (idx === -1) throw new Error("prediction not found");
  all[idx] = {
    ...all[idx],
    display_name: input.display_name,
    group_picks: input.group_picks,
    semifinalists: input.semifinalists,
    top_scorers: input.top_scorers,
    champion_pick: input.champion_pick,
    updated_at: new Date().toISOString(),
  };
  writeAll(all);
}

export async function updatePhase2(ko_picks: KoPicks): Promise<void> {
  const me = readMe();
  if (!me) throw new Error("no local identity");
  const all = readAll();
  const idx = all.findIndex((p) => p.id === me.id);
  if (idx === -1) throw new Error("prediction not found");
  all[idx] = {
    ...all[idx],
    ko_picks,
    champion: ko_picks["final"] ?? null,
    updated_at: new Date().toISOString(),
  };
  writeAll(all);
}

/** Dev helper — wipes local dummy state. Not used by the UI. */
export function _resetLocalPredictions(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(LS_DUMMY);
  localStorage.removeItem(LS_ME);
}
