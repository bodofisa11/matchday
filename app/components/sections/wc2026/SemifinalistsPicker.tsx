"use client";

import { TeamLogo } from "../../TeamLogo";
import { teamColor } from "../../../lib/team-meta";
import { WC2026_TEAMS } from "../../../lib/wc2026-groups";

const ACCENT = "#0066cc";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  readOnly?: boolean;
}

export function SemifinalistsPicker({ value, onChange, readOnly }: Props) {
  // Filter empty strings — they only exist because the storage type is a
  // fixed-length tuple, not because the user has picked something.
  const picked = value.filter(Boolean);

  function toggle(code: string) {
    if (readOnly) return;
    if (picked.includes(code)) {
      onChange(picked.filter((c) => c !== code));
    } else if (picked.length < 4) {
      onChange([...picked, code]);
    }
  }

  const sorted = [...WC2026_TEAMS].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
        Pick up to 4 teams that will reach the semi-finals. Selected: <strong>{picked.length}/4</strong>
      </div>
      <div className="predict-grid-teams">
        {sorted.map((t) => {
          const selected = picked.includes(t.code);
          const disabled = !selected && picked.length >= 4;
          return (
            <button
              key={t.code}
              type="button"
              onClick={() => toggle(t.code)}
              disabled={readOnly || disabled}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.45rem 0.6rem",
                borderRadius: "8px",
                background: selected ? `${ACCENT}20` : "transparent",
                border: `1px solid ${selected ? ACCENT : "var(--border-subtle)"}`,
                color: selected ? ACCENT : "var(--text-primary)",
                fontWeight: selected ? 700 : 500,
                fontSize: "0.78rem",
                cursor: readOnly || disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.45 : 1,
                transition: "all 0.15s",
              }}
            >
              <TeamLogo code={t.code} sport="football" leagueCode="wc2026" color={teamColor(t.code)} size={18} />
              <span style={{ flex: 1, textAlign: "left" }}>{t.name}</span>
              <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>{t.group}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
