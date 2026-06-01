"use client";

import { useEffect, useState } from "react";
import { getAllPredictions, getLocalIdentity } from "@/app/lib/v1/predictions-client";
import { deriveActualResults, scoreTotal } from "@/app/lib/v1/predictions-scoring";
import type { Prediction } from "@/app/lib/v1/predictions-types";

const ACCENT = "#0066cc";

export function LeaderboardView() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPredictions().then((p) => {
      setPredictions(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>Loading…</div>;
  }

  const actual = deriveActualResults([]);
  const myId = getLocalIdentity()?.id ?? null;

  const scored = predictions
    .map((p) => ({ p, total: scoreTotal(p, actual).total }))
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return a.p.created_at.localeCompare(b.p.created_at);
    });

  return (
    <div className="fade-in fd2">
      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
        All entries public. Sorted by points; ties broken by earliest submission.
      </div>

      {scored.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem 1.5rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "1.6rem", marginBottom: "0.3rem" }}>🏆</div>
          <div style={{ fontWeight: 600 }}>No predictions yet</div>
          <div style={{ fontSize: "0.78rem", marginTop: "0.3rem" }}>Be the first to submit.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {scored.map(({ p, total }, idx) => {
            const isMine = p.id === myId;
            const rank = idx + 1;
            return (
              <div
                key={p.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.6rem 0.9rem",
                  border: isMine ? `1px solid ${ACCENT}` : "1px solid var(--border-subtle)",
                  background: isMine ? `${ACCENT}08` : undefined,
                }}
              >
                <div style={{
                  minWidth: "2rem",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: rank <= 3 ? ACCENT : "var(--text-muted)",
                  fontFamily: "var(--font-jetbrains-mono)",
                }}>
                  #{rank}
                </div>
                <div style={{ flex: 1, fontWeight: 600, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.display_name}</span>
                  {isMine && (
                    <span style={{
                      fontSize: "0.58rem", fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: "4px",
                      background: ACCENT, color: "#fff", flexShrink: 0,
                    }}>YOU</span>
                  )}
                </div>
                <div style={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: ACCENT,
                  fontFamily: "var(--font-jetbrains-mono)",
                }}>
                  {total}
                  <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginLeft: "0.25rem", fontWeight: 600 }}>pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
