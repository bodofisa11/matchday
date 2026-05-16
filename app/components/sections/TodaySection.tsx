"use client";

import { useState, useEffect } from "react";
import { fetchFixturesByISTDateRange } from "../../lib/fetch-fixtures-client";
import { istTodayStr, addDaysToDateStr } from "../../lib/timezone";
import type { Fixture } from "../../lib/fixtures";

function formatDateLong(dateStr: string) {
  const [y, m, day] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const COMP_ACCENT: Record<string, string> = {
  "Premier League": "#3dffa2",
  "UEFA Champions League": "#ffd700",
  "La Liga": "#ff4b44",
  "Serie A": "#008fd5",
  "Bundesliga": "#d20515",
  "Ligue 1": "#2293D1",
  "Indian Super League": "#f5a623",
  "UEFA Europa League": "#f97316",
  "FIFA World Cup 2026": "#10b981",
  "Formula 1": "#e10600",
  "IPL": "#f5a623",
};

const COMP_ORDER = [
  "Premier League",
  "UEFA Champions League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "UEFA Europa League",
  "Indian Super League",
  "FIFA World Cup 2026",
  "Formula 1",
  "IPL",
];

function compRank(comp: string): number {
  const i = COMP_ORDER.indexOf(comp);
  return i === -1 ? 999 : i;
}

function accentFor(comp: string): string {
  return COMP_ACCENT[comp] ?? "#8b5cf6";
}

function compLabelOf(f: Fixture): string {
  return f.sport === "f1" ? "Formula 1" : f.competition;
}

function StatusBadge({ status }: { status: Fixture["status"] }) {
  if (status === "live") {
    return (
      <span style={{
        fontSize: "0.54rem", fontWeight: 700, textTransform: "uppercase",
        padding: "0.12rem 0.38rem", borderRadius: "5px", letterSpacing: "1px",
        background: "var(--accent-f1)", color: "#fff",
        animation: "pulse-live 1.5s infinite",
      }}>
        LIVE
      </span>
    );
  }
  return null;
}

/** Compact upcoming card. */
function MiniFixtureCard({ fixture }: { fixture: Fixture }) {
  const accent = accentFor(compLabelOf(fixture));
  const isF1 = fixture.sport === "f1";

  return (
    <div
      className="card"
      style={{
        borderTop: `2px solid ${accent}`,
        padding: "0.7rem 0.85rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        minHeight: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{
          fontSize: "0.62rem",
          fontWeight: 700,
          color: accent,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {fixture.competitionShort ?? compLabelOf(fixture)}
        </div>
        <StatusBadge status={fixture.status} />
      </div>

      {isF1 ? (
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.82rem", lineHeight: 1.2 }}>
            {fixture.awayTeam} GP
          </div>
          <div style={{ fontSize: "0.66rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
            {fixture.homeTeam}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <div style={{
            fontWeight: 600,
            fontSize: "0.78rem",
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {fixture.homeTeam}
          </div>
          <div style={{
            fontWeight: 600,
            fontSize: "0.78rem",
            lineHeight: 1.2,
            color: "var(--text-secondary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {fixture.awayTeam}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "0.3rem", borderTop: "1px solid var(--border-subtle)" }}>
        <span style={{
          fontFamily: 'var(--font-jetbrains-mono, monospace)',
          fontSize: "0.72rem",
          fontWeight: 600,
        }}>
          {fixture.kickoff}
        </span>
        {fixture.venue && (
          <span style={{
            fontSize: "0.58rem",
            color: "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "60%",
          }}>
            {fixture.venue}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultRow({ fixture }: { fixture: Fixture }) {
  const accent = accentFor(compLabelOf(fixture));
  const isF1 = fixture.sport === "f1";
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.55rem 0",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <span style={{ width: "3px", alignSelf: "stretch", background: accent, borderRadius: "2px" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "0.58rem",
          fontWeight: 700,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "0.2rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {fixture.competitionShort ?? compLabelOf(fixture)}
        </div>
        {isF1 ? (
          <div style={{ fontWeight: 600, fontSize: "0.74rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fixture.awayTeam} GP
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 600, fontSize: "0.72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fixture.homeTeam}
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.72rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fixture.awayTeam}
            </div>
          </>
        )}
      </div>
      {!isF1 && (
        <div style={{
          fontFamily: 'var(--font-bebas-neue, "Bebas Neue", sans-serif)',
          fontSize: "1.1rem",
          letterSpacing: "1px",
          lineHeight: 1,
          flexShrink: 0,
          padding: "0 0.3rem",
          textAlign: "center",
        }}>
          {fixture.homeScore ?? 0}<span style={{ color: "var(--text-muted)" }}>:</span>{fixture.awayScore ?? 0}
          <div style={{ fontSize: "0.5rem", color: "var(--text-muted)", letterSpacing: "0.5px", marginTop: "0.15rem", fontFamily: "var(--font-outfit, sans-serif)" }}>FT</div>
        </div>
      )}
    </div>
  );
}

function groupByComp(fixtures: Fixture[]): { comp: string; items: Fixture[] }[] {
  const map = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const c = compLabelOf(f);
    if (!map.has(c)) map.set(c, []);
    map.get(c)!.push(f);
  }
  return Array.from(map.entries())
    .map(([comp, items]) => ({
      comp,
      items: items.sort((a, b) => a.kickoff.localeCompare(b.kickoff)),
    }))
    .sort((a, b) => compRank(a.comp) - compRank(b.comp));
}

function ResultsPanel({ fixtures, loading }: { fixtures: Fixture[]; loading: boolean }) {
  const [open, setOpen] = useState(true);
  const grouped = groupByComp(fixtures);

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignSelf: "start",
        position: "sticky",
        top: "calc(var(--navbar-h, 60px) + var(--compbar-h, 56px) + 1rem)",
      }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "0.85rem 1.1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          borderBottom: open ? "1px solid var(--border-color)" : "none",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Results</span>
          {fixtures.length > 0 && (
            <span style={{
              fontSize: "0.58rem",
              fontWeight: 700,
              background: "#22c55e22",
              color: "#22c55e",
              padding: "0.1rem 0.4rem",
              borderRadius: "20px",
            }}>
              {fixtures.length}
            </span>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s", color: "var(--text-muted)" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div style={{ padding: "0.4rem 1.1rem 0.8rem", maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
          {loading ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", padding: "1rem 0" }}>Loading…</div>
          ) : fixtures.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", padding: "0.6rem 0" }}>
              No finished matches today.
            </div>
          ) : (
            grouped.map(({ comp, items }) => (
              <div key={comp} style={{ marginTop: "0.4rem" }}>
                <div style={{
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  color: accentFor(comp),
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "0.4rem 0 0.2rem",
                }}>
                  {comp}
                </div>
                {items.map((f) => <ResultRow key={`${f.sport}-${f.id}`} fixture={f} />)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function UpcomingPanel({ fixtures, loading, dateLabel }: { fixtures: Fixture[]; loading: boolean; dateLabel: string }) {
  const grouped = groupByComp(fixtures);

  if (loading) {
    return (
      <div className="upcoming-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card" style={{ opacity: 0.5, padding: "0.7rem 0.85rem", minHeight: "100px" }}>
            <div style={{ height: "0.7rem", background: "var(--bg-secondary)", borderRadius: "4px", width: "40%", marginBottom: "0.6rem" }} />
            <div style={{ height: "0.7rem", background: "var(--bg-secondary)", borderRadius: "4px", width: "75%", marginBottom: "0.4rem" }} />
            <div style={{ height: "0.7rem", background: "var(--bg-secondary)", borderRadius: "4px", width: "60%" }} />
          </div>
        ))}
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="card fade-in" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
        <div style={{ fontSize: "1.6rem", marginBottom: "0.4rem" }}>🗓️</div>
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
          No upcoming fixtures for {dateLabel}.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      {grouped.map(({ comp, items }) => (
        <div key={comp}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.55rem",
          }}>
            <span style={{ width: "3px", height: "14px", background: accentFor(comp), borderRadius: "2px" }} />
            <h4 style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--text-primary)",
            }}>
              {comp}
            </h4>
            <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>
              {items.length}
            </span>
          </div>
          <div className="upcoming-grid">
            {items.map((f) => <MiniFixtureCard key={`${f.sport}-${f.id}`} fixture={f} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TodaySection() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const todayStr = istTodayStr();
  const tomorrowStr = addDaysToDateStr(todayStr, 1);

  function load() {
    setLoading(true);
    fetchFixturesByISTDateRange("all", todayStr, tomorrowStr)
      .then(({ fixtures: range, updatedAt }) => {
        setFixtures(range);
        setLastUpdated(updatedAt);
      })
      .catch(() => setFixtures([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchFixturesByISTDateRange("all", todayStr, tomorrowStr)
      .then(({ fixtures: range, updatedAt }) => {
        setFixtures(range);
        setLastUpdated(updatedAt);
      })
      .catch(() => setFixtures([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const todayAll = fixtures.filter((f) => f.date === todayStr);
  const todayFinished = todayAll.filter((f) => f.status === "finished");
  const todayUpcoming = todayAll.filter((f) => f.status !== "finished");
  const tomorrowFixtures = fixtures.filter((f) => f.date === tomorrowStr && f.status !== "finished");
  const liveCount = todayAll.filter((f) => f.status === "live").length;

  return (
    <>
      <style>{`
        .upcoming-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(clamp(180px, 22vw, 220px), 1fr));
          gap: clamp(0.5rem, 1.2vw, 0.85rem);
        }
        .today-split {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: clamp(1rem, 2.5vw, 1.5rem);
          align-items: start;
        }
        @media (max-width: 900px) {
          .today-split { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="section-hero fade-in">
        <div className="hero-bar" style={{ background: "var(--accent-pl)" }} />
        <div className="hero-icon">📅</div>
        <div className="hero-text">
          <h2>TODAY</h2>
          <p>{formatDateLong(todayStr)} (IST)</p>
        </div>
        {liveCount > 0 && (
          <div className="hero-badge" style={{ background: "#e1060020", color: "var(--accent-f1)" }}>
            {liveCount} LIVE
          </div>
        )}
        {lastUpdated && (
          <div style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
        <button
          className="icon-btn"
          onClick={load}
          disabled={loading}
          title="Refresh"
          style={{ marginLeft: "auto", opacity: loading ? 0.5 : 1 }}
          aria-label="Refresh fixtures"
        >
          <svg viewBox="0 0 24 24" style={{ transform: loading ? "rotate(360deg)" : "none", transition: loading ? "transform 1s linear" : "none" }}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
      </div>

      <section style={{ marginBottom: "2rem" }} className="fade-in fd2">
        <div className="today-split">
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>
                Upcoming Today
              </h3>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "auto" }}>
                {todayUpcoming.length} match{todayUpcoming.length !== 1 ? "es" : ""}
              </span>
            </div>
            <UpcomingPanel fixtures={todayUpcoming} loading={loading} dateLabel="today" />
          </div>

          <ResultsPanel fixtures={todayFinished} loading={loading} />
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }} className="fade-in fd2">
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "0.85rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>
            Tomorrow
          </h3>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {formatDateLong(tomorrowStr)}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "auto" }}>
            {tomorrowFixtures.length} match{tomorrowFixtures.length !== 1 ? "es" : ""}
          </span>
        </div>
        <UpcomingPanel fixtures={tomorrowFixtures} loading={loading} dateLabel="tomorrow" />
      </section>
    </>
  );
}
