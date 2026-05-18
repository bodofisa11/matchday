"use client";

import { useEffect, useState } from "react";
import {
  fetchFootballScorers,
  type FootballScorerRow,
} from "../lib/fetch-standings-client";
import { countryDisplay } from "../lib/football-terms";
import { teamCode } from "../lib/team-meta";
import { TeamName } from "./TeamName";

interface Props {
  competitionShort: string;
  accent: string;
  limit?: number;
}

export function TopScorersTable({ competitionShort, accent, limit = 20 }: Props) {
  const [rows, setRows] = useState<FootballScorerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const propKey = `${competitionShort}|${limit}`;
  const [prevKey, setPrevKey] = useState(propKey);
  if (prevKey !== propKey) {
    setPrevKey(propKey);
    setRows([]);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    fetchFootballScorers(competitionShort, limit).then((data) => {
      if (cancelled) return;
      setRows(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [competitionShort, limit]);

  return (
    <div className="grid-12 fade-in fd2">
      <div className="card span-12">
        <div className="card-header">
          <div className="card-title" style={{ color: accent }}>Top Scorers</div>
        </div>
        {loading ? (
          <div style={{ color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No scorer data yet.</div>
        ) : (
          <table className="standings-table scorers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Team</th>
                <th>MP</th>
                <th>A</th>
                <th>G</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.position}-${r.player_name}-${r.team_name}`}>
                  <td><span className="pos-num">{r.position}</span></td>
                  <td>
                    <div className="team-cell">
                      {r.player_name}
                      {r.player_nationality && (
                        <span style={{ marginLeft: "0.4rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                          {countryDisplay(r.player_nationality)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td><TeamName code={teamCode(r.team_name)} name={r.team_name} /></td>
                  <td>{r.played_matches}</td>
                  <td>{r.assists ?? "—"}</td>
                  <td className="points-cell">{r.goals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
