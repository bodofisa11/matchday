"use client";

import { TeamLogo } from "./TeamLogo";
import { TeamName } from "./TeamName";
import { teamCode, teamColor, formatGD } from "../lib/team-meta";

// Lightweight row shape — accepts both FootballStandingRow and
// WcGroupStandingRow without dragging their imports in.
export interface LeagueStandingRow {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

interface Props {
  rows: LeagueStandingRow[];
  leagueCode: string;
  // Highlight rows whose position is <= this number (e.g. top 2 qualifying
  // out of a WC group). Renders the position number on an accent chip.
  highlightTopN?: number;
  accent?: string;
}

export function LeagueStandingsTable({
  rows,
  leagueCode,
  highlightTopN,
  accent,
}: Props) {
  return (
    <table className="standings-table football-standings">
      <thead>
        <tr>
          <th>#</th>
          <th>Team</th>
          <th>P</th>
          <th>W</th>
          <th>D</th>
          <th>L</th>
          <th>GF</th>
          <th>GA</th>
          <th>GD</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const code = teamCode(row.team);
          const highlight =
            highlightTopN !== undefined &&
            row.position <= highlightTopN &&
            accent;
          return (
            <tr key={row.position}>
              <td>
                <span
                  className="pos-num"
                  style={highlight ? { background: `${accent}33`, color: accent } : undefined}
                >
                  {row.position}
                </span>
              </td>
              <td>
                <div className="team-cell">
                  <TeamLogo code={code} sport="football" leagueCode={leagueCode} color={teamColor(code)} />
                  <TeamName code={code} name={row.team} />
                </div>
              </td>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.drawn}</td>
              <td>{row.lost}</td>
              <td>{row.goals_for}</td>
              <td>{row.goals_against}</td>
              <td>{formatGD(row.goal_difference)}</td>
              <td className="points-cell">{row.points}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
