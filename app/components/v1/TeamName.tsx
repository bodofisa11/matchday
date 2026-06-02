"use client";

import { useCompactTables } from "@/app/lib/v1/use-compact-tables";

interface Props {
  code: string;
  name: string;
  title?: boolean;
}

// Renders the full team name normally; collapses to the team code (TLA)
// when compact-tables mode is active. Used inside standings/stats tables
// to free up horizontal room on narrow viewports.
export function TeamName({ code, name, title = true }: Props) {
  const compact = useCompactTables();
  return (
    <span title={title && compact ? name : undefined}>
      {compact ? code : name}
    </span>
  );
}
