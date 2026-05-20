"use client";

import { TeamLogo } from "../../TeamLogo";
import { teamColor } from "../../../lib/team-meta";
import { WC2026_TEAMS } from "../../../lib/wc2026-groups";

const ACCENT = "#0066cc";

interface Props {
  value: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

export function ChampionPicker({ value, onChange, readOnly }: Props) {
  const sorted = [...WC2026_TEAMS].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
        Pick one team to lift the trophy. {value ? `Selected: ` : "None picked."}
        {value && <strong style={{ color: ACCENT }}>{WC2026_TEAMS.find((t) => t.code === value)?.name ?? value}</strong>}
      </div>
      <div className="predict-grid-teams">
        {sorted.map((t) => {
          const selected = value === t.code;
          return (
            <button
              key={t.code}
              type="button"
              onClick={() => onChange(selected ? "" : t.code)}
              disabled={readOnly}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.45rem 0.6rem",
                borderRadius: "8px",
                background: selected ? `${ACCENT}25` : "transparent",
                border: `1px solid ${selected ? ACCENT : "var(--border-subtle)"}`,
                color: selected ? ACCENT : "var(--text-primary)",
                fontWeight: selected ? 700 : 500,
                fontSize: "0.78rem",
                cursor: readOnly ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              <TeamLogo code={t.code} sport="football" leagueCode="wc2026" color={teamColor(t.code)} size={18} />
              <span style={{ flex: 1, textAlign: "left" }}>{t.name}</span>
              {selected && <span style={{ fontSize: "0.8rem" }}>🏆</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
