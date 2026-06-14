"use client";

import { useEffect, useState } from "react";
import {
  getCompetitionTeamDetails,
  getTeamSquad,
  type FootballSquadPlayerRow,
  type FootballTeamDetailRow,
} from "@/app/lib/v2/queries";
import {
  POSITION_GROUP_ORDER,
  countryDisplay,
  positionGroup,
  shortPosition,
} from "@/app/lib/v1/football-terms";

const SQUAD_COLS = "32px 1fr 56px 1fr 96px";

function TeamCrest({ team, size = 56 }: { team: FootballTeamDetailRow; size?: number }) {
  if (team.crest) {
    return <img src={team.crest} alt={team.name} style={{ width: size, height: size, objectFit: "contain" }} />;
  }
  return (
    <span className="wf-crest lg" style={{ width: size, height: size }}>
      {team.tla ?? team.name.slice(0, 3).toUpperCase()}
    </span>
  );
}

function TeamDetail({ team, onBack }: { team: FootballTeamDetailRow; onBack: () => void }) {
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

  return (
    <div className="wf-col wf-gap20">
      <button className="wf-chip" style={{ alignSelf: "flex-start", cursor: "pointer" }} onClick={onBack}>
        ← Back
      </button>

      <div className="wf-center wf-gap20">
        <TeamCrest team={team} size={64} />
        <div className="wf-col wf-gap6" style={{ minWidth: 0 }}>
          <span className="wf-h3">{team.name}</span>
          <span className="wf-mono-sm wf-muted">
            {[team.tla, team.founded && `Founded ${team.founded}`, team.venue]
              .filter(Boolean)
              .join(" · ")}
          </span>
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
              <span>Pos</span>
              <span>Nationality</span>
              <span>DOB</span>
            </div>
            {grouped[g].map((p) => (
              <div key={p.id} className="wf-trow" style={{ gridTemplateColumns: SQUAD_COLS }}>
                <span className="wf-rank">{p.shirt_number ?? "—"}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </span>
                <span className="wf-mono-sm">{shortPosition(p.position) ?? p.position ?? "—"}</span>
                <span className="wf-mono-sm">{countryDisplay(p.nationality)}</span>
                <span className="wf-mono-sm wf-muted">{p.dob ?? "—"}</span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export function TeamsPanel({ competitionSlug }: { competitionSlug: string }) {
  const [teams, setTeams] = useState<FootballTeamDetailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FootballTeamDetailRow | null>(null);

  const [prevKey, setPrevKey] = useState(competitionSlug);
  if (prevKey !== competitionSlug) {
    setPrevKey(competitionSlug);
    setTeams([]);
    setSelected(null);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    getCompetitionTeamDetails(competitionSlug).then((data) => {
      if (cancelled) return;
      setTeams(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [competitionSlug]);

  if (selected) {
    return <TeamDetail team={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="wf-col wf-gap12">
      <div className="wf-shead" style={{ marginBottom: 0 }}>
        <span className="wf-h3">Teams</span>
        {!loading && teams.length > 0 && (
          <span className="wf-mono-sm wf-muted">{teams.length} teams</span>
        )}
      </div>
      {loading ? (
        <div className="wf-empty">Loading…</div>
      ) : teams.length === 0 ? (
        <div className="wf-empty">No team data yet.</div>
      ) : (
        <div className="wf-teamgrid">
          {teams.map((t) => (
            <button key={t.id} className="wf-teamcard" onClick={() => setSelected(t)}>
              <TeamCrest team={t} />
              <span className="wf-teamcard-nm">{t.short_name ?? t.name}</span>
              {t.tla && <span className="wf-mono-sm wf-muted">{t.tla}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
