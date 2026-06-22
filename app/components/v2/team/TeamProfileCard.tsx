"use client";

import { useEffect, useState } from "react";
import {
  getTeamSquad,
  type FootballSquadPlayerRow,
  type FootballTeamDetailRow,
} from "@/app/lib/v2/queries";
import {
  POSITION_GROUP_ORDER,
  countryDisplay,
  positionGroup,
  shortPosition,
} from "@/app/lib/football-terms";
import { logoUrl } from "@/app/lib/team-logos";

const SQUAD_COLS = "32px 1fr 56px 1fr 96px";

/** Age from a date-of-birth string as "Ny Md" (years and remaining days). */
function ageYearsDays(dob: string | null): string {
  if (!dob) return "—";
  const b = new Date(dob);
  if (Number.isNaN(b.getTime())) return "—";
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  let lastBirthday = new Date(b.getFullYear() + years, b.getMonth(), b.getDate());
  if (lastBirthday > now) {
    years -= 1;
    lastBirthday = new Date(b.getFullYear() + years, b.getMonth(), b.getDate());
  }
  const days = Math.floor((now.getTime() - lastBirthday.getTime()) / 86_400_000);
  return `${years}y ${days}d`;
}

export function TeamCrest({ team, size = 56 }: { team: FootballTeamDetailRow; size?: number }) {
  // Prefer a real football-logos.cc logo; fall back to the DB crest, then initials.
  const src = logoUrl(team.name) ?? team.crest;
  if (src) {
    return <img src={src} alt={team.name} style={{ width: size, height: size, objectFit: "contain" }} />;
  }
  return (
    <span className="wf-crest lg" style={{ width: size, height: size }}>
      {team.tla ?? team.name.slice(0, 3).toUpperCase()}
    </span>
  );
}

/** Team header (crest + meta) plus squad grouped by position. Loads its own
 *  squad by club/nation id, so it works for both the Teams tab and the
 *  dedicated team route. */
export function TeamProfileCard({
  team,
  eyebrow,
}: {
  team: FootballTeamDetailRow;
  eyebrow?: string;
}) {
  const [players, setPlayers] = useState<FootballSquadPlayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [prevId, setPrevId] = useState(team.id);
  if (prevId !== team.id) {
    setPrevId(team.id);
    setPlayers([]);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    getTeamSquad(team.id).then((data) => {
      if (cancelled) return;
      setPlayers(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [team.id]);

  const grouped: Record<string, FootballSquadPlayerRow[]> = {};
  for (const p of players) {
    const g = positionGroup(p.position);
    (grouped[g] ??= []).push(p);
  }
  const groupKeys = [...POSITION_GROUP_ORDER, "Other"].filter((k) => grouped[k]?.length);

  const metaLine = [team.tla, team.founded && `Founded ${team.founded}`, team.venue]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <section className="wf-hero">
        <div className="wf-col wf-gap12" style={{ minWidth: 0 }}>
          <div className="wf-center wf-gap8">
            <span className="wf-dot foot" />
            <span className="wf-eyebrow">{eyebrow ?? "Team"}</span>
          </div>
          <h1 className="wf-h1">{team.name}</h1>
          <div className="wf-col wf-gap6">
            {metaLine && <span className="wf-mono-sm wf-muted">{metaLine}</span>}
            {(team.coach_name || team.club_colors) && (
              <span className="wf-mono-sm wf-muted">
                {team.coach_name &&
                  `Coach: ${team.coach_name}${team.coach_nationality ? ` (${countryDisplay(team.coach_nationality)})` : ""}`}
                {team.coach_name && team.club_colors && " · "}
                {team.club_colors && `Colors: ${team.club_colors}`}
              </span>
            )}
          </div>
        </div>
        <TeamCrest team={team} size={120} />
      </section>

      <div className="wf-col wf-gap20">
        {loading ? (
          <div className="wf-empty">Loading squad…</div>
        ) : players.length === 0 ? (
          <div className="wf-empty">Squad coming soon.</div>
        ) : (
          groupKeys.map((g) => (
          <div key={g} className="wf-box">
            <div className="wf-trow head" style={{ gridTemplateColumns: SQUAD_COLS }}>
              <span>#</span>
              <span>
                {g} ({grouped[g].length})
              </span>
              <span style={{ textAlign: "center" }}>Pos</span>
              <span>Nationality</span>
              <span style={{ textAlign: "center" }}>Age</span>
            </div>
            {grouped[g].map((p) => (
              <div key={p.id} className="wf-trow" style={{ gridTemplateColumns: SQUAD_COLS }}>
                <span className="wf-rank">{p.shirt_number ?? "—"}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </span>
                <span className="wf-mono-sm" style={{ textAlign: "center" }}>
                  {shortPosition(p.position) ?? p.position ?? "—"}
                </span>
                <span className="wf-mono-sm">{countryDisplay(p.nationality)}</span>
                <span className="wf-mono-sm wf-muted" style={{ textAlign: "center" }}>
                  {ageYearsDays(p.dob)}
                </span>
              </div>
            ))}
          </div>
          ))
        )}
      </div>
    </>
  );
}
