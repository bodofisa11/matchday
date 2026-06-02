"use client";

import { useEffect, useState } from "react";
import {
  fetchSquadByTeamApiId,
  type FootballSquadPlayerRow,
  type FootballTeamDetailRow,
} from "@/app/lib/v1/fetch-standings-client";
import {
  POSITION_GROUP_ORDER,
  countryDisplay,
  positionGroup,
  shortPosition,
} from "@/app/lib/v1/football-terms";

interface Props {
  team: FootballTeamDetailRow;
  accent: string;
  onBack: () => void;
}

export function TeamDetailPanel({ team, accent, onBack }: Props) {
  const [players, setPlayers] = useState<FootballSquadPlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [prevId, setPrevId] = useState(team.team_api_id);
  if (prevId !== team.team_api_id) {
    setPrevId(team.team_api_id);
    setPlayers([]);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    fetchSquadByTeamApiId(team.team_api_id).then((data) => {
      if (cancelled) return;
      setPlayers(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [team.team_api_id]);

  const grouped: Record<string, FootballSquadPlayerRow[]> = {};
  for (const p of players) {
    const g = positionGroup(p.position);
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(p);
  }
  const groupKeys = [...POSITION_GROUP_ORDER, "Other"].filter((k) => grouped[k]?.length);

  return (
    <div className="grid-12 fade-in fd2">
      <div className="card span-12">
        <button
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "transparent",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
            borderRadius: 8,
            padding: "0.35rem 0.7rem",
            cursor: "pointer",
            fontSize: "0.8rem",
            marginBottom: "1rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = accent;
            e.currentTarget.style.color = accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          ← Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          {team.crest && (

            <img src={team.crest} alt={team.name} style={{ width: 64, height: 64, objectFit: "contain" }} />
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: accent, fontSize: "1.4rem" }}>{team.name}</h2>
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 4 }}>
              {team.tla && <span>{team.tla}</span>}
              {team.founded && <span> · Founded {team.founded}</span>}
              {team.venue && <span> · {team.venue}</span>}
            </div>
          </div>
        </div>

        {(team.coach_name || team.club_colors) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {team.coach_name && (
              <div>
                <span style={{ color: "var(--text-muted)" }}>Coach: </span>
                {team.coach_name}
                {team.coach_nationality && <span style={{ color: "var(--text-muted)" }}> ({countryDisplay(team.coach_nationality)})</span>}
              </div>
            )}
            {team.club_colors && (
              <div>
                <span style={{ color: "var(--text-muted)" }}>Colors: </span>
                {team.club_colors}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>Loading squad…</div>
        ) : players.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Coming soon.</div>
        ) : (
          groupKeys.map((g) => (
            <div key={g} style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                {g} ({grouped[g].length})
              </div>
              <table className="standings-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Name</th>
                    <th>Pos</th>
                    <th>Nat</th>
                    <th>DOB</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[g].map((p) => (
                    <tr key={p.player_api_id}>
                      <td><span className="pos-num">{p.shirt_number ?? "—"}</span></td>
                      <td>{p.name}</td>
                      <td>{shortPosition(p.position) ?? p.position ?? "—"}</td>
                      <td>{countryDisplay(p.nationality)}</td>
                      <td>{p.dob ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
