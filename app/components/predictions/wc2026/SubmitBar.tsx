"use client";

import { useEffect, useState } from "react";
import { lockCountdown } from "@/app/lib/predictions/predictions-state";

const ACCENT = "#0066cc";

interface Props {
  phaseLabel: string;
  lockIso: string | null;
  primaryLabel: string;
  primaryDisabled?: boolean;
  primaryOnClick?: () => void;
  status?: string | null;
}

export function SubmitBar({ phaseLabel, lockIso, primaryLabel, primaryDisabled, primaryOnClick, status }: Props) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!lockIso) return;
    const t = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(t);
  }, [lockIso]);
  void tick;

  return (
    <div
      style={{
        position: "sticky",
        bottom: "0.75rem",
        zIndex: 5,
        marginTop: "1.2rem",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        padding: "0.7rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", flex: 1, minWidth: "180px" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: ACCENT }}>
          {phaseLabel}
        </div>
        {lockIso && (
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            Locks in <strong>{lockCountdown(lockIso)}</strong>
          </div>
        )}
        {status && (
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{status}</div>
        )}
      </div>
      <button
        type="button"
        disabled={primaryDisabled}
        onClick={primaryOnClick}
        style={{
          padding: "0.55rem 1.2rem",
          borderRadius: "8px",
          border: "none",
          background: primaryDisabled ? "var(--border-subtle)" : ACCENT,
          color: primaryDisabled ? "var(--text-muted)" : "#fff",
          fontWeight: 700,
          fontSize: "0.85rem",
          cursor: primaryDisabled ? "not-allowed" : "pointer",
        }}
      >
        {primaryLabel}
      </button>
    </div>
  );
}
