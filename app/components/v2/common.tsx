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
 * Season picker — a row of chips. Renders nothing unless more than one season
 * is available, so callers can mount it unconditionally and it stays invisible
 * for single-season competitions (football, World Cup) until more are seeded.
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
  if (seasons.length < 2) return null;
  return (
    <div className="wf-center wf-gap6" role="tablist" aria-label="Season">
      {seasons.map((s) => (
        <button
          key={s}
          role="tab"
          aria-selected={s === value}
          className={`wf-chip${s === value ? " on" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => onChange(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
