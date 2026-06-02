"use client";

import { PredictionCard } from "@/app/components/v1/sections/wc2026/PredictionCard";
import type { Prediction } from "@/app/lib/v1/predictions-types";
import type { ActualResults } from "@/app/lib/v1/predictions-scoring";
import { scoreTotal } from "@/app/lib/v1/predictions-scoring";

interface Props {
  predictions: Prediction[];
  actual: ActualResults;
  myId: string | null;
}

export function PredictionsLeaderboard({ predictions, actual, myId }: Props) {
  const scored = predictions
    .map((p) => ({ p, s: scoreTotal(p, actual) }))
    .sort((a, b) => {
      if (b.s.total !== a.s.total) return b.s.total - a.s.total;
      // Tie-break: earliest created_at
      return a.p.created_at.localeCompare(b.p.created_at);
    });

  if (scored.length === 0) {
    return (
      <div className="card fade-in" style={{ textAlign: "center", padding: "2rem 1.5rem", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "1.6rem", marginBottom: "0.3rem" }}>🏆</div>
        <div style={{ fontWeight: 600 }}>No predictions yet</div>
        <div style={{ fontSize: "0.78rem", marginTop: "0.3rem" }}>Be the first to submit.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {scored.map(({ p, s }, idx) => (
        <PredictionCard
          key={p.id}
          rank={idx + 1}
          prediction={p}
          score={s}
          isMine={p.id === myId}
        />
      ))}
    </div>
  );
}
