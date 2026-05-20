"use client";

import { useEffect, useState } from "react";
import { GroupPicker } from "./GroupPicker";
import { SemifinalistsPicker } from "./SemifinalistsPicker";
import { TopScorerPicker } from "./TopScorerPicker";
import { ChampionPicker } from "./ChampionPicker";
import { KnockoutBracket } from "./KnockoutBracket";
import { SubmitBar } from "./SubmitBar";
import {
  getMyPrediction,
  submitPhase1,
  updateMyPhase1,
  updatePhase2,
} from "../../../lib/predictions-client";
import {
  derivePhaseState,
  PHASE1_LOCK_ISO,
  FIRST_R32_KICKOFF_ISO,
} from "../../../lib/predictions-state";
import { GROUP_LETTERS } from "../../../lib/wc2026-groups";
import { fetchWcFixturesByStage } from "../../../lib/fetch-standings-client";
import type {
  GroupPicks,
  GroupStandingPicks,
  KoPicks,
  PhaseState,
  Prediction,
} from "../../../lib/predictions-types";

const ACCENT = "#0066cc";

function padSemis(s: string[]): [string, string, string, string] {
  const clean = s.filter(Boolean).slice(0, 4);
  while (clean.length < 4) clean.push("");
  return clean as [string, string, string, string];
}

function defaultGroupPicks(): GroupPicks {
  const out: GroupPicks = {};
  for (const g of GROUP_LETTERS) {
    out[g] = ["", ""] as GroupStandingPicks;
  }
  return out;
}

function SectionHeader({ title, subtitle, optional }: { title: string; subtitle?: string; optional?: boolean }) {
  return (
    <div style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>
      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {title}
        {optional && (
          <span style={{
            fontSize: "0.62rem",
            fontWeight: 700,
            padding: "0.1rem 0.4rem",
            borderRadius: "4px",
            background: "var(--bg-elevated)",
            color: "var(--text-muted)",
            border: "1px solid var(--border-subtle)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>Optional</span>
        )}
      </div>
      {subtitle && (
        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{subtitle}</div>
      )}
    </div>
  );
}

function PhaseBanner({ phase }: { phase: PhaseState }) {
  const map: Record<PhaseState, { label: string; hint: string; color: string }> = {
    phase1_open: {
      label: "Phase 1 — Group Stage Picks open",
      hint: "Fill any number of picks. Only your name is required. Locks 11 Jun 2026.",
      color: "#16a34a",
    },
    phase1_locked: {
      label: "Phase 1 locked — Phase 2 waiting",
      hint: "Knockout picks open once the group stage finishes.",
      color: "#f59e0b",
    },
    phase2_open: {
      label: "Phase 2 — Knockout Picks open",
      hint: "Pick any matches you want. Empty picks score 0; no penalty.",
      color: "#0066cc",
    },
    all_locked: {
      label: "All picks locked",
      hint: "Watch the leaderboard — picks can no longer change.",
      color: "var(--text-muted)",
    },
  };
  const m = map[phase];
  return (
    <div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderLeft: `4px solid ${m.color}` }}>
      <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{m.label}</div>
      <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{m.hint}</div>
    </div>
  );
}

export function PredictionsView() {
  const [name, setName] = useState("");
  const [groupPicks, setGroupPicks] = useState<GroupPicks>(defaultGroupPicks);
  const [semis, setSemis] = useState<string[]>([]);
  const [scorers, setScorers] = useState<[string, string]>(["", ""]);
  const [championPick, setChampionPick] = useState<string>("");
  const [koPicks, setKoPicks] = useState<KoPicks>({});

  const [me, setMe] = useState<Prediction | null>(null);
  const [phase, setPhase] = useState<PhaseState>("phase1_open");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [modalName, setModalName] = useState("");

  async function refresh() {
    setLoading(true);
    const groupFx = await fetchWcFixturesByStage("group", 200);
    const groupAllFinished = groupFx.length > 0 && groupFx.every((f) => f.status === "finished");
    setPhase(derivePhaseState({ now: Date.now(), groupAllFinished }));
    const mine = await getMyPrediction();
    setMe(mine);
    if (mine) {
      setName(mine.display_name);
      // Fill any missing groups with empty pair so the picker UI is stable
      const filled = { ...defaultGroupPicks(), ...mine.group_picks };
      setGroupPicks(filled);
      setSemis(mine.semifinalists.filter(Boolean));
      setScorers(mine.top_scorers);
      setChampionPick(mine.champion_pick ?? "");
      if (mine.ko_picks) setKoPicks(mine.ko_picks);
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const hasSubmittedPhase1 = !!me;

  const phase1Editable = phase === "phase1_open";
  const phase2Editable = phase === "phase2_open" && hasSubmittedPhase1;

  function openSubmitModal() {
    setModalName(name || me?.display_name || "");
    setNameModalOpen(true);
  }

  async function confirmPhase1Submit() {
    // Submit always allowed — empty name falls back to "Anonymous", empty
    // picks are persisted as-is (empty strings = "none").
    const safeName = modalName.trim() || "Anonymous";
    setName(safeName);
    setNameModalOpen(false);
    try {
      if (me) {
        await updateMyPhase1({
          display_name: safeName,
          group_picks: groupPicks,
          semifinalists: padSemis(semis),
          top_scorers: scorers,
          champion_pick: championPick,
        });
        setStatus("Updated.");
      } else {
        await submitPhase1({
          display_name: safeName,
          group_picks: groupPicks,
          semifinalists: padSemis(semis),
          top_scorers: scorers,
          champion_pick: championPick,
        });
        setStatus("Submitted! You're on the leaderboard.");
      }
      await refresh();
    } catch (e) {
      setStatus("Error: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  async function handlePhase2Submit() {
    try {
      await updatePhase2(koPicks);
      setStatus("Knockout picks saved.");
      await refresh();
    } catch (e) {
      setStatus("Error: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  if (loading) {
    return <div style={{ color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>Loading…</div>;
  }

  const koSeeds: Record<string, string> = {};

  return (
    <div className="fade-in fd2">
      <PhaseBanner phase={phase} />

      <div className="card" style={{ padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
          <div style={{
            fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
            color: "#fff", background: ACCENT, padding: "0.18rem 0.5rem", borderRadius: "5px",
          }}>Phase 1</div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>Group stage + semis + top scorer</div>
        </div>

        {me && (
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
            Submitting as <strong style={{ color: "var(--text-primary)" }}>{me.display_name}</strong>. You can change the name on submit.
          </div>
        )}

        <SectionHeader title="Group standings" subtitle="Order each group 1st → 4th. Top 2 (highlighted) advance. Skip any group you're unsure about." optional />
        <GroupPicker value={groupPicks} onChange={setGroupPicks} readOnly={!phase1Editable} />

        <SectionHeader title="Semifinalists" subtitle="Pick up to 4 teams that will reach the semi-finals." optional />
        <SemifinalistsPicker value={semis} onChange={setSemis} readOnly={!phase1Editable} />

        <SectionHeader title="Top scorers" subtitle="Up to two picks. Each correct = 15 pts." optional />
        <TopScorerPicker value={scorers} onChange={setScorers} readOnly={!phase1Editable} />

        <SectionHeader title="Champion" subtitle="Pick the team you think will win the cup. Correct = 20 pts." optional />
        <ChampionPicker value={championPick} onChange={setChampionPick} readOnly={!phase1Editable} />
      </div>

      {phase !== "phase1_open" && (
        <div className="card" style={{ padding: "1rem", marginTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <div style={{
              fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
              color: "#fff", background: ACCENT, padding: "0.18rem 0.5rem", borderRadius: "5px",
            }}>Phase 2</div>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>Knockout bracket</div>
          </div>

          {phase === "phase1_locked" && (
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", padding: "1.2rem 0" }}>
              Opens when the group stage finishes.
            </div>
          )}
          {phase === "phase2_open" && !hasSubmittedPhase1 && (
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", padding: "1.2rem 0" }}>
              Sign-ups closed — only users who submitted Phase 1 can pick the knockout bracket.
            </div>
          )}
          {(phase === "phase2_open" && hasSubmittedPhase1) || phase === "all_locked" ? (
            <KnockoutBracket seeds={koSeeds} value={koPicks} onChange={setKoPicks} readOnly={!phase2Editable} />
          ) : null}
        </div>
      )}

      {phase === "phase1_open" && (
        <SubmitBar
          phaseLabel={hasSubmittedPhase1 ? "Phase 1 — edit your picks" : "Phase 1 — make your picks"}
          lockIso={PHASE1_LOCK_ISO}
          primaryLabel={hasSubmittedPhase1 ? "Update picks" : "Submit picks"}
          primaryOnClick={openSubmitModal}
          status={status}
        />
      )}

      {nameModalOpen && (
        <div
          onClick={() => setNameModalOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "1.4rem",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.3rem" }}>
              {hasSubmittedPhase1 ? "Update your name" : "Save as"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.9rem" }}>
              Shown publicly on the leaderboard. Leave blank to save as &ldquo;Anonymous&rdquo;.
            </div>
            <input
              type="text"
              value={modalName}
              onChange={(e) => setModalName(e.target.value)}
              maxLength={40}
              placeholder="e.g. Alex"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") confirmPhase1Submit(); }}
              style={{
                width: "100%",
                padding: "0.65rem 0.8rem",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                marginBottom: "1rem",
              }}
            />
            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setNameModalOpen(false)}
                style={{
                  padding: "0.55rem 1rem", borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  background: "transparent", color: "var(--text-secondary)",
                  fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPhase1Submit}
                style={{
                  padding: "0.55rem 1.2rem", borderRadius: "8px",
                  border: "none", background: ACCENT, color: "#fff",
                  fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                }}
              >
                {hasSubmittedPhase1 ? "Save changes" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
      {phase === "phase2_open" && hasSubmittedPhase1 && (
        <SubmitBar
          phaseLabel="Phase 2 — knockout picks"
          lockIso={FIRST_R32_KICKOFF_ISO}
          primaryLabel="Save knockout picks"
          primaryOnClick={handlePhase2Submit}
          status={status}
        />
      )}
    </div>
  );
}
