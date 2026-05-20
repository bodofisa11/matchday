"use client";

import { useState } from "react";
import { TeamLogo } from "../../TeamLogo";
import { teamColor } from "../../../lib/team-meta";
import { teamNameByCode, GROUP_LETTERS } from "../../../lib/wc2026-groups";
import type { Prediction } from "../../../lib/predictions-types";
import type { ScoreBreakdown } from "../../../lib/predictions-scoring";

const ACCENT = "#0066cc";

interface Props {
  rank: number;
  prediction: Prediction;
  score: ScoreBreakdown;
  isMine: boolean;
}

export function PredictionCard({ rank, prediction: p, score, isMine }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="card"
      style={{
        padding: "0.85rem 1rem",
        border: isMine ? `1px solid ${ACCENT}` : "1px solid var(--border-subtle)",
        background: isMine ? `${ACCENT}08` : undefined,
      }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          cursor: "pointer",
        }}
      >
        <div style={{
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "var(--text-muted)",
          minWidth: "1.8rem",
        }}>
          #{rank}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.15rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {p.display_name}
            {isMine && (
              <span style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                padding: "0.1rem 0.35rem",
                borderRadius: "4px",
                background: ACCENT,
                color: "#fff",
              }}>YOU</span>
            )}
            {p.ko_picks && (
              <span style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                padding: "0.1rem 0.35rem",
                borderRadius: "4px",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
              }}>KO ✓</span>
            )}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            Champion: {p.champion_pick ? teamNameByCode(p.champion_pick) : p.champion ? teamNameByCode(p.champion) : "—"}
            {"  ·  "}Scorers: {p.top_scorers.filter(Boolean).join(", ") || "—"}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: ACCENT, fontFamily: "var(--font-jetbrains-mono)" }}>
            {score.total}
          </div>
          <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>pts</div>
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
          {open ? "▾" : "▸"}
        </div>
      </div>

      {open && (
        <div style={{ marginTop: "0.85rem", paddingTop: "0.85rem", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            Group standings
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem", marginBottom: "0.9rem" }}>
            {GROUP_LETTERS.map((g) => {
              const picks = p.group_picks[g];
              if (!picks) return null;
              return (
                <div key={g} style={{ fontSize: "0.72rem" }}>
                  <strong style={{ color: ACCENT }}>{g}:</strong>{" "}
                  {picks.filter(Boolean).map((c, i) => (
                    <span key={c + i} style={{ marginRight: "0.25rem" }}>
                      {i + 1}.{c}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            Semifinalists
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.8rem" }}>
            {p.semifinalists.map((code) => (
              <div key={code} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.2rem 0.5rem",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "5px",
                fontSize: "0.74rem",
              }}>
                <TeamLogo code={code} sport="football" leagueCode="wc2026" color={teamColor(code)} size={14} />
                {teamNameByCode(code)}
              </div>
            ))}
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            Score breakdown
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", flexWrap: "wrap", gap: "0.9rem" }}>
            <span>Groups: <strong>{score.group_points}</strong></span>
            <span>Semis: <strong>{score.semi_points}</strong></span>
            <span>Top scorers: <strong>{score.scorer_points}</strong></span>
            <span>Champion pick: <strong>{score.champion_pick_points}</strong></span>
            <span>KO: <strong>{score.ko_points}</strong></span>
            <span>KO champion: <strong>{score.champion_points}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
