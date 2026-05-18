"use client";

import { useState, useEffect } from "react";
import { TeamLogo } from "../TeamLogo";
import { TeamName } from "../TeamName";
import { competitionLogoUrl } from "../../lib/image-utils";
import {
  fetchFootballStandings,
  type FootballStandingRow,
} from "../../lib/fetch-standings-client";
import { teamCode, teamColor, formatGD } from "../../lib/team-meta";
import { FixturesTabPanel } from "../FixturesTabPanel";
import { TeamsTabPanel } from "../TeamsTabPanel";

type Tab = "upcoming" | "results" | "standings" | "stats" | "teams";

const TABS: { id: Tab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "results", label: "Results" },
  { id: "standings", label: "Standings" },
  { id: "stats", label: "Stats" },
  { id: "teams", label: "Teams" },
];

const ACCENT = "#ff6900";
const LEAGUE = "uel";

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="fade-in fd1" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: "0.4rem 1.1rem",
            borderRadius: "20px",
            border: active === tab.id ? "none" : "1px solid var(--border-subtle)",
            background: active === tab.id ? ACCENT : "transparent",
            color: active === tab.id ? "#fff" : "var(--text-secondary)",
            fontWeight: active === tab.id ? 700 : 500,
            fontSize: "0.78rem",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="card fade-in" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚧</div>
      <div style={{ fontWeight: 600 }}>{label} — Coming soon</div>
    </div>
  );
}

function Loading() {
  return <div style={{ color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>Loading…</div>;
}

export function EuropaLeagueSection() {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [standings, setStandings] = useState<FootballStandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFootballStandings("UEFA Europa League").then((s) => {
      setStandings(s);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <div className="section-hero fade-in">
        <div className="hero-bar" style={{ background: ACCENT }} />
        <div className="hero-icon"><img src={competitionLogoUrl("UEL") ?? ""} alt="UEL" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>
        <div className="hero-text">
          <h2>UEFA EUROPA LEAGUE</h2>
          <p>Europe — 2025/26 Season</p>
        </div>
        <div className="hero-badge" style={{ background: "#ff690020", color: ACCENT }}>
          UEL
        </div>
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "upcoming" && (
        <FixturesTabPanel competitionShort="UEL" leagueCode={LEAGUE} accent={ACCENT} mode="upcoming" />
      )}

      {activeTab === "results" && (
        <FixturesTabPanel competitionShort="UEL" leagueCode={LEAGUE} accent={ACCENT} mode="results" />
      )}

      {activeTab === "standings" && (
        <div className="grid-12 fade-in fd2">
          <div className="card span-12">
            <div className="card-header">
              <div className="card-title">League Phase</div>
            </div>
            {loading ? <Loading /> : standings.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No standings data yet.</div>
            ) : (
              <table className="standings-table league-table">
                <thead>
                  <tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>
                </thead>
                <tbody>
                  {standings.map((row) => {
                    const code = teamCode(row.team);
                    return (
                      <tr key={row.position}>
                        <td><span className="pos-num">{row.position}</span></td>
                        <td>
                          <div className="team-cell">
                            <TeamLogo code={code} sport="football" leagueCode={LEAGUE} color={teamColor(code)} />
                            <TeamName code={code} name={row.team} />
                          </div>
                        </td>
                        <td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td>
                        <td>{formatGD(row.goal_difference)}</td>
                        <td className="points-cell">{row.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "stats" && <Placeholder label="Stats" />}
      {activeTab === "teams" && <TeamsTabPanel competitionShort="UEL" accent={ACCENT} />}
    </>
  );
}
