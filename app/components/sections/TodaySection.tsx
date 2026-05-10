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
  "Formula 1": "#e10600",
};

function accentFor(comp: string): string {
  return COMP_ACCENT[comp] ?? "#8b5cf6";
}

function StatusBadge({ status }: { status: Fixture["status"] }) {
  if (status === "live") {
    return (
      <span style={{
        fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase",
        padding: "0.15rem 0.45rem", borderRadius: "6px", letterSpacing: "1px",
        background: "var(--accent-f1)", color: "#fff",
        animation: "pulse-live 1.5s infinite",
      }}>
        LIVE
      </span>
    );
  }
  if (status === "finished") {
    return (
      <span style={{
        fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase",
        padding: "0.15rem 0.45rem", borderRadius: "6px", letterSpacing: "1px",
        background: "#22c55e20", color: "#22c55e",
      }}>
        FT
      </span>
    );
  }
  return null;
}

function FixtureCard({ fixture }: { fixture: Fixture }) {
  const compLabel = fixture.sport === "f1" ? "Formula 1" : fixture.competition;
  const accent = accentFor(compLabel);
  const isScheduled = fixture.status === "scheduled";
  const isF1 = fixture.sport === "f1";

  return (
    <div className="card" style={{ borderTop: `3px solid ${accent}`, height: "100%" }}>
      <div className="card-header" style={{ marginBottom: "0.6rem" }}>
        <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="cdot" style={{ background: accent, width: "8px", height: "8px" }} />
          {compLabel}
        </div>
        <StatusBadge status={fixture.status} />
      </div>

      {isF1 ? (
        <>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            {fixture.awayTeam} Grand Prix
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            {fixture.homeTeam}
          </div>
          <div className="fixture-time" style={{ marginTop: "0.6rem" }}>
            {fixture.kickoff} IST
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6rem" }}>
            <div style={{ flex: 1, fontWeight: 600 }}>{fixture.homeTeam}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>vs</div>
            <div style={{ flex: 1, fontWeight: 600, textAlign: "right" }}>{fixture.awayTeam}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.6rem" }}>
            {isScheduled ? (
              <div className="fixture-time">{fixture.kickoff} IST</div>
            ) : (
              <div className="fixture-score">
                {fixture.homeScore ?? 0} — {fixture.awayScore ?? 0}
              </div>
            )}
            {fixture.venue && (
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                {fixture.venue}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ opacity: 0.5 }}>
      <div style={{ height: "0.9rem", background: "var(--bg-secondary)", borderRadius: "4px", width: "40%", marginBottom: "1rem" }} />
      <div style={{ height: "0.75rem", background: "var(--bg-secondary)", borderRadius: "4px", width: "70%", marginBottom: "0.5rem" }} />
      <div style={{ height: "0.75rem", background: "var(--bg-secondary)", borderRadius: "4px", width: "50%" }} />
    </div>
  );
}

function DayBlock({
  label,
  dateStr,
  fixtures,
  loading,
}: {
  label: string;
  dateStr: string;
  fixtures: Fixture[];
  loading: boolean;
}) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>
          {label}
        </h3>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {formatDateLong(dateStr)}
        </span>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "auto" }}>
          {fixtures.length} match{fixtures.length !== 1 ? "es" : ""}
        </span>
      </div>

      {loading ? (
        <div className="grid-12 fade-in fd2">
          {[1, 2, 3].map((i) => (
            <div className="span-4" key={i}><SkeletonCard /></div>
          ))}
        </div>
      ) : fixtures.length === 0 ? (
        <div className="card fade-in" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>🗓️</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            No fixtures.
          </div>
        </div>
      ) : (
        <div className="grid-12 fade-in fd2">
          {fixtures.map((f) => (
            <div className="span-4" key={`${f.sport}-${f.id}`}>
              <FixtureCard fixture={f} />
            </div>
          ))}
        </div>
      )}
    </section>
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

  const todayFixtures = fixtures.filter((f) => f.date === todayStr);
  const tomorrowFixtures = fixtures.filter((f) => f.date === tomorrowStr);
  const liveCount = todayFixtures.filter((f) => f.status === "live").length;

  return (
    <>
      <div className="section-hero fade-in">
        <div className="hero-bar" style={{ background: "var(--accent-pl)" }} />
        <div className="hero-icon">📅</div>
        <div className="hero-text">
          <h2>TODAY & TOMORROW</h2>
          <p>{formatDateLong(todayStr)} → {formatDateLong(tomorrowStr)} (IST)</p>
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

      <DayBlock label="Today" dateStr={todayStr} fixtures={todayFixtures} loading={loading} />
      <DayBlock label="Tomorrow" dateStr={tomorrowStr} fixtures={tomorrowFixtures} loading={loading} />
    </>
  );
}
