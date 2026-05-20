"use client";

import { TeamLogo } from "../../TeamLogo";
import { teamColor } from "../../../lib/team-meta";
import { WC2026_GROUPS, GROUP_LETTERS } from "../../../lib/wc2026-groups";
import type { GroupLetter, GroupPicks, GroupStandingPicks } from "../../../lib/predictions-types";

const ACCENT = "#0066cc";

interface Props {
  value: GroupPicks;
  onChange: (next: GroupPicks) => void;
  readOnly?: boolean;
}

/**
 * Pick the top 2 (qualifiers) per group. Click a team to assign it to the
 * next free slot (1st, then 2nd). Click an already-picked team to clear it.
 */
export function GroupPicker({ value, onChange, readOnly }: Props) {
  function toggle(g: GroupLetter, code: string) {
    if (readOnly) return;
    const current: GroupStandingPicks = value[g] ?? ["", ""];
    let next: GroupStandingPicks;
    if (current[0] === code) {
      // Clear 1st — promote 2nd up
      next = [current[1], ""];
    } else if (current[1] === code) {
      next = [current[0], ""];
    } else if (!current[0]) {
      next = [code, current[1]];
    } else if (!current[1]) {
      next = [current[0], code];
    } else {
      // Both slots full — replace 2nd
      next = [current[0], code];
    }
    onChange({ ...value, [g]: next });
  }

  return (
    <div className="predict-grid-groups">
      {GROUP_LETTERS.map((g) => {
        const picks: GroupStandingPicks = value[g] ?? ["", ""];
        return (
          <div key={g} className="card" style={{ padding: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: ACCENT }}>Group {g}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                {picks.filter(Boolean).length}/2 picked
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {WC2026_GROUPS[g].map((team) => {
                const slot = picks[0] === team.code ? 1 : picks[1] === team.code ? 2 : null;
                return (
                  <button
                    key={team.code}
                    type="button"
                    onClick={() => toggle(g, team.code)}
                    disabled={readOnly}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.4rem 0.55rem",
                      borderRadius: "6px",
                      background: slot ? `${ACCENT}18` : "transparent",
                      border: `1px solid ${slot ? ACCENT : "var(--border-subtle)"}`,
                      cursor: readOnly ? "not-allowed" : "pointer",
                      color: "var(--text-primary)",
                      fontSize: "0.82rem",
                      fontWeight: slot ? 700 : 500,
                      textAlign: "left",
                      transition: "all 0.12s",
                    }}
                  >
                    <TeamLogo code={team.code} sport="football" leagueCode="wc2026" color={teamColor(team.code)} size={20} />
                    <span style={{ flex: 1 }}>{team.name}</span>
                    {slot && (
                      <span style={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        padding: "0.1rem 0.4rem",
                        borderRadius: "4px",
                        background: ACCENT,
                        color: "#fff",
                      }}>
                        {slot === 1 ? "1st" : "2nd"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
