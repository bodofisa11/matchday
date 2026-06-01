"use client";

import { useCompactTables } from "@/app/lib/v1/use-compact-tables";

interface Props {
  form: string | null | undefined;
  limit?: number;
}

// Renders a team's recent form string (e.g. "WWDLW") as colored pills.
// Each character: W = win (green), D = draw (yellow), L = loss (red),
// other (e.g. "-") = neutral grey. Newest result on the right per
// football-data.org convention.
export function FormBar({ form, limit = 5 }: Props) {
  const compact = useCompactTables();
  if (!form) {
    return <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>—</span>;
  }
  // Form strings can contain spaces, commas, or hyphens — sanitize to letters only.
  const chars = form
    .toUpperCase()
    .replace(/[^WDL]/g, "")
    .slice(-limit)
    .split("");
  if (chars.length === 0) {
    return <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>—</span>;
  }
  return (
    <span className={`form-bar${compact ? " form-bar-compact" : ""}`} title={chars.join("")}>
      {chars.map((c, i) => (
        <span key={i} className={`form-dot form-${c.toLowerCase()}`}>
          {compact ? "" : c}
        </span>
      ))}
    </span>
  );
}
