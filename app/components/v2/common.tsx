/** Shared presentational primitives for the v2 UI. */
import type { TeamRef } from "@/app/lib/v2/types";

export function SportDot({ sport }: { sport: "foot" | "f1" | "crk" }) {
  return <span className={`wf-dot ${sport}`} />;
}

export function Crest({ team, lg }: { team: TeamRef; lg?: boolean }) {
  return (
    <span
      className={`wf-crest${lg ? " lg" : ""}`}
      style={{ background: team.color }}
      title={team.name}
      aria-hidden
    >
      {team.code}
    </span>
  );
}

export function FormBadge({ r }: { r: "W" | "D" | "L" }) {
  return <span className={`wf-fbadge ${r.toLowerCase()}`}>{r}</span>;
}

export function TeamCell({ team }: { team: TeamRef }) {
  return (
    <span className="wf-vsteam">
      <Crest team={team} />
      <span className="nm">{team.name}</span>
    </span>
  );
}

/**
 * Season picker — a dropdown. Renders the available seasons (newest first) and
 * stays invisible only when the list is empty, so callers can mount it
 * unconditionally. Single-season competitions still show their one season.
 */
export function SeasonSelector({
  seasons,
  value,
  onChange,
}: {
  seasons: string[];
  value: string;
  onChange: (season: string) => void;
}) {
  if (seasons.length === 0) return null;
  return (
    <div className="wf-select-wrap">
      <select
        className="wf-select"
        aria-label="Season"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {seasons.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <span className="wf-select-caret" aria-hidden>
        ▾
      </span>
    </div>
  );
}
