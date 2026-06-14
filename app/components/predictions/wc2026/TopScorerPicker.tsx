"use client";

import { useState } from "react";
import { TOP_SCORER_CANDIDATES, OTHER_SCORER_VALUE } from "@/app/lib/predictions/wc2026-scorer-candidates";

const ACCENT = "#0066cc";

interface Props {
  value: [string, string];
  onChange: (next: [string, string]) => void;
  readOnly?: boolean;
}

function SlotPicker({
  slotLabel,
  value,
  onChange,
  readOnly,
}: {
  slotLabel: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  const isCustom = value !== "" && !TOP_SCORER_CANDIDATES.some((c) => c.name === value);
  const [mode, setMode] = useState<"list" | "other">(isCustom ? "other" : "list");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: ACCENT }}>
        {slotLabel}
      </div>
      {mode === "list" ? (
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === OTHER_SCORER_VALUE) {
              setMode("other");
              onChange("");
            } else {
              onChange(e.target.value);
            }
          }}
          disabled={readOnly}
          style={{
            padding: "0.5rem 0.65rem",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            fontSize: "0.85rem",
            cursor: readOnly ? "not-allowed" : "pointer",
          }}
        >
          <option value="">— select player —</option>
          {TOP_SCORER_CANDIDATES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.team})
            </option>
          ))}
          <option value={OTHER_SCORER_VALUE}>Other (type a name)</option>
        </select>
      ) : (
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Player name"
            disabled={readOnly}
            maxLength={60}
            style={{
              flex: 1,
              padding: "0.5rem 0.65rem",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
            }}
          />
          {!readOnly && (
            <button
              type="button"
              onClick={() => { setMode("list"); onChange(""); }}
              style={{
                padding: "0.5rem 0.7rem",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                background: "transparent",
                color: "var(--text-secondary)",
                fontSize: "0.72rem",
                cursor: "pointer",
              }}
            >
              From list
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function TopScorerPicker({ value, onChange, readOnly }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      <SlotPicker
        slotLabel="Pick #1"
        value={value[0]}
        onChange={(v) => onChange([v, value[1]])}
        readOnly={readOnly}
      />
      <SlotPicker
        slotLabel="Pick #2"
        value={value[1]}
        onChange={(v) => onChange([value[0], v])}
        readOnly={readOnly}
      />
    </div>
  );
}
