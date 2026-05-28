"use client";

import { useState, useEffect } from "react";
import {
  fetchF1DriverStandings,
  fetchF1ConstructorStandings,
  fetchF1Calendar,
  fetchF1RaceResults,
  fetchF1SprintResults,
  type F1DriverRow,
  type F1ConstructorRow,
  type F1RaceRow,
  type F1RaceResultRow,
  type F1SprintResultRow,
} from "../../lib/fetch-standings-client";
import { F1_TEAM_COLORS, todayStr } from "../../lib/team-meta";
import { driverCode, constructorCode } from "../../lib/f1-codes";
import { useCompactTables } from "../../lib/use-compact-tables";

type Tab = "schedule" | "teams" | "drivers";
type ResultTab = "race" | "sprint";

const TABS: { id: Tab; label: string }[] = [
  { id: "schedule", label: "F1 Schedule" },
  { id: "teams", label: "Teams" },
  { id: "drivers", label: "Drivers" },
];

const ACCENT = "#e10600";
const SPRINT_COLOR = "#f59e0b";

const CIRCUIT_TO_GP_NAME: Record<string, string> = {
  "Albert Park Circuit": "Australian Grand Prix",
  "Shanghai International Circuit": "Chinese Grand Prix",
  "Suzuka Circuit": "Japanese Grand Prix",
  "Bahrain International Circuit": "Bahrain Grand Prix",
  "Jeddah Corniche Circuit": "Saudi Arabian Grand Prix",
  "Miami International Autodrome": "Miami Grand Prix",
  "Circuit Gilles Villeneuve": "Canadian Grand Prix",
  "Circuit de Monaco": "Monaco Grand Prix",
  "Circuit de Barcelona-Catalunya": "Spanish Grand Prix",
  "Red Bull Ring": "Austrian Grand Prix",
  "Silverstone Circuit": "British Grand Prix",
  "Circuit de Spa-Francorchamps": "Belgian Grand Prix",
  "Hungaroring": "Hungarian Grand Prix",
  "Circuit Zandvoort": "Dutch Grand Prix",
  "Autodromo Nazionale Monza": "Italian Grand Prix",
  "Circuit de Madrid": "Madrid Grand Prix",
  "Baku City Circuit": "Azerbaijan Grand Prix",
  "Marina Bay Street Circuit": "Singapore Grand Prix",
  "Circuit of The Americas": "United States Grand Prix",
  "Autodromo Hermanos Rodriguez": "Mexico City Grand Prix",
  "Autodromo Jose Carlos Pace": "São Paulo Grand Prix",
  "Las Vegas Strip Circuit": "Las Vegas Grand Prix",
  "Losail International Circuit": "Qatar Grand Prix",
  "Yas Marina Circuit": "Abu Dhabi Grand Prix",
};

function raceName(race: { name?: string | null; circuit: string; country: string }): string {
  if (race.name) return race.name;
  return CIRCUIT_TO_GP_NAME[race.circuit] ?? `${race.country} Grand Prix`;
}

const COUNTRY_FLAGS: Record<string, string> = {
  Australia: "🇦🇺", China: "🇨🇳", Japan: "🇯🇵", Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦", USA: "🇺🇸", "United States": "🇺🇸",
  Canada: "🇨🇦", Monaco: "🇲🇨", Spain: "🇪🇸", Austria: "🇦🇹",
  "Great Britain": "🇬🇧", "United Kingdom": "🇬🇧", Hungary: "🇭🇺",
  Belgium: "🇧🇪", Netherlands: "🇳🇱", Italy: "🇮🇹", Azerbaijan: "🇦🇿",
  Singapore: "🇸🇬", Mexico: "🇲🇽", Brazil: "🇧🇷", "Las Vegas": "🇺🇸",
  Qatar: "🇶🇦", UAE: "🇦🇪", "Abu Dhabi": "🇦🇪", "United Arab Emirates": "🇦🇪",
};

function driverLastName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  return parts[parts.length - 1];
}

function driverWinsByTeam(drivers: F1DriverRow[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const d of drivers) {
    m[d.team] = (m[d.team] ?? 0) + Number(d.wins ?? 0);
  }
  return m;
}

function raceDisplayStatus(
  race: F1RaceRow,
  today: string,
  nextScheduledRound: number | null,
): "completed" | "next" | "upcoming" | "live" {
  if (race.status === "completed" || race.status === "cancelled") return "completed";
  if (["practice", "qualifying", "race"].includes(race.status)) return "live";
  if (race.round === nextScheduledRound) return "next";
  return "upcoming";
}

function formatRaceDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${String(d).padStart(2, "0")} ${months[m - 1]}`;
}

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

function Loading() {
  return <div style={{ color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>Loading…</div>;
}

function Breadcrumb({ race, onBack }: { race: F1RaceRow; onBack: () => void }) {
  const flag = COUNTRY_FLAGS[race.country] ?? "🏁";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          background: "none",
          border: "1px solid var(--border-subtle)",
          borderRadius: "6px",
          padding: "0.25rem 0.6rem",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontSize: "0.78rem",
          fontWeight: 500,
        }}
      >
        ← Back
      </button>
      <span style={{ color: "var(--text-muted)" }}>F1 Schedule</span>
      <span style={{ color: "var(--text-muted)" }}>/</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
        {flag} R{race.round} — {raceName(race)}
      </span>
    </div>
  );
}

function ResultsTable({
  rows,
  showFastestLap,
}: {
  rows: (F1RaceResultRow | F1SprintResultRow)[];
  showFastestLap: boolean;
}) {
  return (
    <table className="standings-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Driver</th>
          <th>Team</th>
          <th>Grid</th>
          <th>Laps</th>
          <th>Status</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const color = F1_TEAM_COLORS[r.constructor] ?? "#888";
          const isFastest = showFastestLap && "is_fastest_lap" in r && r.is_fastest_lap;
          return (
            <tr key={i}>
              <td><span className="pos-num">{r.position ?? "—"}</span></td>
              <td>
                <div className="team-cell">
                  <div className="driver-team-line" style={{ background: color }} />
                  {r.driver}
                  {isFastest && (
                    <span style={{ marginLeft: "0.4rem", color: "#a855f7", fontSize: "0.7rem", fontWeight: 700 }}>⚡FL</span>
                  )}
                </div>
              </td>
              <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{r.constructor}</td>
              <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{r.grid ?? "—"}</td>
              <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{r.laps}</td>
              <td style={{ color: r.status_text === "Finished" ? "var(--text-secondary)" : "#f87171", fontSize: "0.8rem" }}>{r.status_text}</td>
              <td className="points-cell">{Number(r.points)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function F1Section() {
  const compact = useCompactTables();
  const [activeTab, setActiveTab] = useState<Tab>("drivers");
  const [drivers, setDrivers] = useState<F1DriverRow[]>([]);
  const [constructors, setConstructors] = useState<F1ConstructorRow[]>([]);
  const [calendar, setCalendar] = useState<F1RaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<F1RaceRow | null>(null);
  const [raceResults, setRaceResults] = useState<F1RaceResultRow[]>([]);
  const [sprintResults, setSprintResults] = useState<F1SprintResultRow[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>("race");

  useEffect(() => {
    Promise.all([
      fetchF1DriverStandings(),
      fetchF1ConstructorStandings(),
      fetchF1Calendar(),
    ]).then(([d, c, cal]) => {
      setDrivers([...d].sort((a, b) => Number(b.points) - Number(a.points)));
      setConstructors([...c].sort((a, b) => Number(b.points) - Number(a.points)));
      setCalendar(cal);
      setLoading(false);
    });
  }, []);

  function handleRoundClick(race: F1RaceRow) {
    if (race.status !== "completed") return;
    setSelectedRound(race);
    setRaceResults([]);
    setSprintResults([]);
    setActiveResultTab("race");
    setResultsLoading(true);
    const fetches: [Promise<F1RaceResultRow[]>, Promise<F1SprintResultRow[]>] = [
      fetchF1RaceResults(String(race.season), race.round),
      race.has_sprint ? fetchF1SprintResults(String(race.season), race.round) : Promise.resolve([]),
    ];
    Promise.all(fetches).then(([race_r, sprint_r]) => {
      setRaceResults([...race_r].sort((a, b) => (a.position ?? 99) - (b.position ?? 99)));
      setSprintResults([...sprint_r].sort((a, b) => (a.position ?? 99) - (b.position ?? 99)));
      setResultsLoading(false);
    });
  }

  function handleBack() {
    setSelectedRound(null);
    setRaceResults([]);
    setSprintResults([]);
  }

  function handleTabChange(tab: Tab) {
    if (tab !== "schedule") setSelectedRound(null);
    setActiveTab(tab);
  }

  const today = todayStr();
  const maxPts = drivers.length > 0 ? Number(drivers[0].points) : 1;
  const nextScheduledRound = calendar.find(
    (r) => r.status === "scheduled" && r.date >= today,
  )?.round ?? null;

  const currentRound = calendar.filter(
    (r) => r.status === "completed" || ["practice", "qualifying", "race"].includes(r.status),
  ).length;

  return (
    <>
      <div className="section-hero fade-in">
        <div className="hero-bar" style={{ background: ACCENT }} />
        <div className="hero-icon">🏎️</div>
        <div className="hero-text">
          <h2>FORMULA 1</h2>
          <p>2026 World Championship</p>
        </div>
        {calendar.length > 0 && (
          <div className="hero-badge" style={{ background: "#e1060020", color: ACCENT }}>
            Round {currentRound} of {calendar.length}
          </div>
        )}
      </div>

      <TabBar active={activeTab} onChange={handleTabChange} />

      {activeTab === "drivers" && (
        <div className="grid-12 fade-in fd2">
          <div className="card span-12">
            <div className="card-header">
              <div className="card-title">Driver Standings</div>
            </div>
            {loading ? <Loading /> : drivers.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No standings data yet.</div>
            ) : drivers.map((d) => {
              const pct = maxPts > 0 ? Math.round((Number(d.points) / maxPts) * 100) : 0;
              const color = F1_TEAM_COLORS[d.team] ?? "#888";
              return (
                <div className="driver-bar-row" key={d.driver}>
                  <div className="driver-bar-pos">{d.position}</div>
                  <div
                    className="driver-bar-name"
                    title={d.driver}
                    style={{ fontFamily: compact ? "var(--font-jetbrains-mono)" : undefined, fontWeight: 700 }}
                  >
                    {compact ? driverCode(d.driver) : driverLastName(d.driver)}
                  </div>
                  <div className="driver-bar-track">
                    <div
                      className="driver-bar-fill"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                    >
                      {Number(d.points) > 0 ? `${Number(d.points)}${d.wins ? ` · ${d.wins}W` : ""}` : ""}
                    </div>
                  </div>
                  <div className="driver-bar-pts">{Number(d.points)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "teams" && (
        <div className="grid-12 fade-in fd2">
          <div className="card span-12">
            <div className="card-header">
              <div className="card-title">Constructor Standings</div>
            </div>
            {loading ? <Loading /> : constructors.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No standings data yet.</div>
            ) : (
              <table className="standings-table f1-constructors">
                <thead>
                  <tr><th>#</th><th>Team</th><th>Code</th><th>Wins</th><th>Pts</th></tr>
                </thead>
                <tbody>
                  {(() => {
                    const winsMap = driverWinsByTeam(drivers);
                    return constructors.map((c) => {
                      const color = F1_TEAM_COLORS[c.driver] ?? "#888";
                      const code = constructorCode(c.driver);
                      return (
                        <tr key={c.driver}>
                          <td><span className="pos-num">{c.position}</span></td>
                          <td>
                            <div className="team-cell">
                              <div className="driver-team-line" style={{ background: color }} />
                              {compact ? code : c.driver}
                            </div>
                          </td>
                          <td style={{ fontFamily: "var(--font-jetbrains-mono)", fontWeight: 700 }}>{code}</td>
                          <td>{winsMap[c.driver] ?? 0}</td>
                          <td className="points-cell">{Number(c.points)}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "schedule" && !selectedRound && (
        <div className="grid-12 fade-in fd2">
          <div className="card span-12">
            <div className="card-header">
              <div className="card-title">2026 Race Calendar</div>
            </div>
            {loading ? <Loading /> : calendar.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No calendar data yet.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 2rem" }}>
                {calendar.map((r) => {
                  const displayStatus = raceDisplayStatus(r, today, nextScheduledRound);
                  const flag = COUNTRY_FLAGS[r.country] ?? "🏁";
                  const isCompleted = r.status === "completed";
                  return (
                    <div
                      className="race-item"
                      key={r.round}
                      onClick={() => handleRoundClick(r)}
                      style={{ cursor: isCompleted ? "pointer" : "default", transition: "background 0.15s" }}
                    >
                      <div className="race-round">R{r.round}</div>
                      <div className="race-flag">{flag}</div>
                      <div className="race-info">
                        <div className="race-name" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          {raceName(r)}
                          {r.has_sprint && (
                            <span style={{
                              fontSize: "0.62rem",
                              fontWeight: 700,
                              background: `${SPRINT_COLOR}25`,
                              color: SPRINT_COLOR,
                              borderRadius: "4px",
                              padding: "0 0.3rem",
                              lineHeight: "1.6",
                            }}>
                              SPRINT
                            </span>
                          )}
                        </div>
                        <div className="race-circuit">{r.circuit}</div>
                      </div>
                      <div>
                        <div className="race-date">{formatRaceDate(r.date)}</div>
                        <div className={`race-status ${displayStatus}`}>
                          {displayStatus === "next" ? "NEXT" : displayStatus === "completed" ? "Results ›" : displayStatus === "live" ? "LIVE" : "Upcoming"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === "schedule" && selectedRound && (
        <div className="grid-12 fade-in fd2">
          <div className="span-12">
            <Breadcrumb race={selectedRound} onBack={handleBack} />
          </div>
          <div className="card span-12">
            <div className="card-header">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {raceName(selectedRound)}
                  {selectedRound.has_sprint && (
                    <span style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      background: `${SPRINT_COLOR}25`,
                      color: SPRINT_COLOR,
                      borderRadius: "4px",
                      padding: "0 0.35rem",
                      lineHeight: "1.6",
                    }}>
                      SPRINT WEEKEND
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Round {selectedRound.round} · {formatRaceDate(selectedRound.date)} · {selectedRound.circuit}
                </div>
              </div>
            </div>

            {selectedRound.has_sprint && (
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                {(["race", "sprint"] as ResultTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveResultTab(t)}
                    style={{
                      padding: "0.3rem 0.9rem",
                      borderRadius: "20px",
                      border: activeResultTab === t ? "none" : "1px solid var(--border-subtle)",
                      background: activeResultTab === t
                        ? (t === "sprint" ? SPRINT_COLOR : ACCENT)
                        : "transparent",
                      color: activeResultTab === t ? "#fff" : "var(--text-secondary)",
                      fontWeight: activeResultTab === t ? 700 : 500,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {t === "race" ? "Race" : "Sprint"}
                  </button>
                ))}
              </div>
            )}

            {resultsLoading ? <Loading /> : (
              <>
                {activeResultTab === "race" && (
                  raceResults.length === 0
                    ? <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No race results available yet.</div>
                    : <ResultsTable rows={raceResults} showFastestLap={true} />
                )}
                {activeResultTab === "sprint" && (
                  sprintResults.length === 0
                    ? <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No sprint results available yet.</div>
                    : <ResultsTable rows={sprintResults} showFastestLap={false} />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
