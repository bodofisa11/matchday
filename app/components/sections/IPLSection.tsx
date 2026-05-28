"use client";

import { useState, useEffect } from "react";
import { TeamLogo } from "../TeamLogo";
import { TeamName } from "../TeamName";
import { fetchIPLStandings, type IPLStandingRow } from "../../lib/fetch-standings-client";
import { teamCode, teamColor } from "../../lib/team-meta";
import { NewsTab } from "../NewsTab";

type Tab = "news" | "fixtures" | "stats" | "teams";

const TABS: { id: Tab; label: string }[] = [
  { id: "news", label: "News" },
  { id: "fixtures", label: "Fixtures" },
  { id: "stats", label: "Stats" },
  { id: "teams", label: "Teams" },
];

const ACCENT = "#f5a623";

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="fade-in fd1 section-tabbar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: "0.4rem 1.1rem",
            borderRadius: "20px",
            border: active === tab.id ? "none" : "1px solid var(--border-subtle)",
            background: active === tab.id ? ACCENT : "transparent",
            color: active === tab.id ? "#000" : "var(--text-secondary)",
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

function formatNRR(nrr: number): string {
  return (nrr >= 0 ? "+" : "") + Number(nrr).toFixed(3);
}

export function IPLSection() {
  const [activeTab, setActiveTab] = useState<Tab>("fixtures");
  const [standings, setStandings] = useState<IPLStandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIPLStandings().then((s) => {
      setStandings(s);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <div className="section-hero fade-in">
        <div className="hero-bar" style={{ background: ACCENT }} />
        <div className="hero-icon">🏏</div>
        <div className="hero-text">
          <h2>TATA IPL 2026</h2>
          <p>Indian Premier League — Season 19</p>
        </div>
        <div className="hero-badge" style={{ background: "#f5a62320", color: ACCENT }}>
          IPL
        </div>
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "news" && <NewsTab competition="Indian Premier League" accent={ACCENT} />}

      {activeTab === "fixtures" && (
        <div className="grid-12 fade-in fd2">
          <div className="card span-12">
            <div className="card-header">
              <div className="card-title">Points Table</div>
            </div>
            {loading ? (
              <div style={{ color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>Loading…</div>
            ) : standings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏏</div>
                <div style={{ fontWeight: 600 }}>IPL data coming soon</div>
                <div style={{ fontSize: "0.78rem", marginTop: "0.4rem" }}>
                  Standings will appear once the season data is loaded.
                </div>
              </div>
            ) : (
              <table className="standings-table cricket-standings">
                <thead>
                  <tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>T</th><th>NR</th><th>NRR</th><th>Pts</th></tr>
                </thead>
                <tbody>
                  {standings.map((row) => {
                    const code = teamCode(row.team);
                    return (
                      <tr key={row.position}>
                        <td><span className="pos-num">{row.position}</span></td>
                        <td>
                          <div className="team-cell">
                            <TeamLogo code={code} sport="cricket" leagueCode="ipl" color={teamColor(code)} />
                            <TeamName code={code} name={row.team} />
                          </div>
                        </td>
                        <td>{row.played}</td>
                        <td>{row.won}</td>
                        <td>{row.lost}</td>
                        <td>{row.tied}</td>
                        <td>{row.no_result}</td>
                        <td>{formatNRR(row.net_run_rate)}</td>
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
