"use client";

import { useState, useEffect } from "react";
import { TeamLogo } from "../TeamLogo";
import { competitionLogoUrl } from "../../lib/image-utils";
import {
  fetchFootballStandings,
  type FootballStandingRow,
} from "../../lib/fetch-standings-client";
import { teamCode, teamColor, formatGD } from "../../lib/team-meta";
import { FixturesTabPanel } from "../FixturesTabPanel";

type Tab = "fixtures" | "standings" | "stats" | "teams";

const TABS: { id: Tab; label: string }[] = [
  { id: "fixtures", label: "Fixtures" },
  { id: "standings", label: "Standings" },
  { id: "stats", label: "Stats" },
  { id: "teams", label: "Teams" },
];

const ACCENT = "#d20515";
const LEAGUE = "bundesliga";

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

export function BundesligaSection() {
  const [activeTab, setActiveTab] = useState<Tab>("fixtures");
  const [standings, setStandings] = useState<FootballStandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFootballStandings("Bundesliga").then((s) => {
      setStandings(s);
      setLoading(false);
    });
  }, []);

  const matchday = standings.length > 0 ? Math.max(...standings.map((r) => r.played)) : null;

  return (
    <>
      <div className="section-hero fade-in">
        <div className="hero-bar" style={{ background: ACCENT }} />
        <div className="hero-icon"><img src={competitionLogoUrl("BUN") ?? ""} alt="Bundesliga" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>
        <div className="hero-text">
          <h2>BUNDESLIGA</h2>
          <p>Germany — 2025/26 Season</p>
        </div>
        {matchday !== null && (
          <div className="hero-badge" style={{ background: "#d2051520", color: ACCENT }}>
            Matchday {matchday}
          </div>
        )}
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "fixtures" && (
        <FixturesTabPanel competitionShort="BUN" leagueCode={LEAGUE} accent={ACCENT} />
      )}

      {activeTab === "standings" && (
        <div className="grid-12 fade-in fd2">
          <div className="card span-12">
            <div className="card-header">
              <div className="card-title">Standings</div>
            </div>
            {loading ? <Loading /> : standings.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No standings data yet.</div>
            ) : (
              <table className="standings-table">
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
                            {row.team}
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
      {activeTab === "teams" && <Placeholder label="Teams" />}
    </>
  );
}
