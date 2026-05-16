"use client";

import { useEffect, useState } from "react";
import {
  fetchSquadByTeamApiId,
  type FootballSquadPlayerRow,
  type FootballTeamDetailRow,
} from "../lib/fetch-standings-client";

interface Props {
  team: FootballTeamDetailRow;
  accent: string;
  onClose: () => void;
}

const POSITION_ORDER = ["Goalkeeper", "Defence", "Midfield", "Offence"];

function positionGroup(pos: string | null): string {
  if (!pos) return "Other";
  const p = pos.toLowerCase();
  if (p.includes("keeper")) return "Goalkeeper";
  if (p.includes("back") || p.includes("defence") || p.includes("defender")) return "Defence";
  if (p.includes("midfield")) return "Midfield";
  if (p.includes("forward") || p.includes("offence") || p.includes("wing") || p.includes("striker") || p.includes("attack")) return "Offence";
  return "Other";
}

export function TeamDetailModal({ team, accent, onClose }: Props) {
  const [players, setPlayers] = useState<FootballSquadPlayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSquadByTeamApiId(team.team_api_id).then((data) => {
      if (cancelled) return;
      setPlayers(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [team.team_api_id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const grouped: Record<string, FootballSquadPlayerRow[]> = {};
  for (const p of players) {
    const g = positionGroup(p.position);
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(p);
  }
  const groupKeys = [...POSITION_ORDER, "Other"].filter((k) => grouped[k]?.length);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2rem 1rem",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          borderRadius: "12px",
          maxWidth: "880px",
          width: "100%",
          padding: "1.5rem",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          {team.crest && (
            // eslint-disable-next-line @next/next/no-img-element
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
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: "1.1rem",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {(team.coach_name || team.club_colors) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {team.coach_name && (
              <div>
                <span style={{ color: "var(--text-muted)" }}>Coach: </span>
                {team.coach_name}
                {team.coach_nationality && <span style={{ color: "var(--text-muted)" }}> ({team.coach_nationality})</span>}
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
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No squad data available.</div>
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
                    <th>Position</th>
                    <th>Nationality</th>
                    <th>DOB</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[g].map((p) => (
                    <tr key={p.player_api_id}>
                      <td><span className="pos-num">{p.shirt_number ?? "—"}</span></td>
                      <td>{p.name}</td>
                      <td>{p.position ?? "—"}</td>
                      <td>{p.nationality ?? "—"}</td>
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
