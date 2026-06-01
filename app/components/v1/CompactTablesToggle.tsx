"use client";

import { useCompactTables, toggleCompactTables } from "@/app/lib/v1/use-compact-tables";

export function CompactTablesToggle() {
  const compact = useCompactTables();
  return (
    <button
      type="button"
      onClick={toggleCompactTables}
      className="icon-btn"
      aria-pressed={compact}
      aria-label={compact ? "Switch tables to full team names" : "Switch tables to compact view"}
      title={compact ? "Compact view: on — tap for full names" : "Compact view: off — tap for team codes"}
      style={{
        fontSize: "0.62rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "0.25rem 0.5rem",
        borderRadius: 6,
        border: "1px solid var(--border-subtle)",
        background: compact ? "var(--accent-blue, #3dffa2)" : "transparent",
        color: compact ? "#000" : "var(--text-muted)",
        fontFamily: "var(--font-jetbrains-mono)",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {compact ? "ABC" : "···"}
    </button>
  );
}
