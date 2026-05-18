"use client";

import { useEffect, useState } from "react";
import {
  fetchTeamsForCompetition,
  type FootballTeamDetailRow,
} from "../lib/fetch-standings-client";
import { TeamDetailPanel } from "./TeamDetailPanel";

interface Props {
  competitionShort: string;
  accent: string;
}

export function TeamsTabPanel({ competitionShort, accent }: Props) {
  const [teams, setTeams] = useState<FootballTeamDetailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FootballTeamDetailRow | null>(null);
  const [prevKey, setPrevKey] = useState(competitionShort);
  if (prevKey !== competitionShort) {
    setPrevKey(competitionShort);
    setTeams([]);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    fetchTeamsForCompetition(competitionShort).then((data) => {
      if (cancelled) return;
      setTeams(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [competitionShort]);

  if (selected) {
    return <TeamDetailPanel team={selected} accent={accent} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="grid-12 fade-in fd2">
      <div className="card span-12">
        <div className="card-header">
          <div className="card-title" style={{ color: accent }}>Teams</div>
          {!loading && teams.length > 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{teams.length} teams</div>
          )}
        </div>

        {loading ? (
          <div style={{ color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>Loading…</div>
        ) : teams.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No team data yet.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            {teams.map((t) => (
              <button
                key={t.team_api_id}
                onClick={() => setSelected(t)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem 0.75rem",
                  background: "var(--bg-elevated, rgba(255,255,255,0.02))",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  color: "var(--text-primary)",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accent;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {t.crest ? (
                   
                  <img src={t.crest} alt={t.name} style={{ width: 56, height: 56, objectFit: "contain" }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: accent }}>
                    {t.tla ?? t.name.slice(0, 3).toUpperCase()}
                  </div>
                )}
                <div style={{ fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.2 }}>
                  {t.short_name ?? t.name}
                </div>
                {t.tla && (
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>{t.tla}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
