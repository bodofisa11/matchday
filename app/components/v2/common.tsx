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
