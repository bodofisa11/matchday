"use client";

import { useState, useEffect, useCallback } from "react";
import { TeamLogo } from "@/app/components/v1/TeamLogo";
import {
  fetchFootballFixturesPaged,
  type FootballFixtureRow,
} from "@/app/lib/v1/fetch-standings-client";
import { teamCode, teamColor, teamLeague, formatFixtureDate, todayStr } from "@/app/lib/v1/team-meta";

type Mode = "upcoming" | "results";

interface Props {
  competitionShort: string;
  leagueCode: string;
  accent: string;
  mode: Mode;
}

function getTomorrow(today: string): string {
  const d = new Date(today + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function ResultRow({ r, league }: { r: FootballFixtureRow; league: string }) {
  const hCode = teamCode(r.home_team);
  const aCode = teamCode(r.away_team);
  const hLeague = teamLeague(hCode) ?? league;
  const aLeague = teamLeague(aCode) ?? league;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0.55rem 0",
        borderBottom: "1px solid var(--border-subtle)",
        gap: "0.5rem",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.2rem" }}>
          <TeamLogo code={hCode} sport="football" leagueCode={hLeague} color={teamColor(hCode)} />
          <span style={{ fontSize: "0.78rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {r.home_team}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <TeamLogo code={aCode} sport="football" leagueCode={aLeague} color={teamColor(aCode)} />
          <span style={{ fontSize: "0.78rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {r.away_team}
          </span>
        </div>
      </div>

      <div style={{ textAlign: "center", flexShrink: 0, padding: "0 0.5rem" }}>
        <div style={{ fontFamily: 'var(--font-bebas-neue, "Bebas Neue", sans-serif)', fontSize: "1.25rem", letterSpacing: "1px", lineHeight: 1 }}>
          {r.home_score ?? "–"}&nbsp;:&nbsp;{r.away_score ?? "–"}
        </div>
        <div style={{ fontSize: "0.5rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "0.1rem" }}>
          FT
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0, minWidth: "64px" }}>
        <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 500 }}>
          {formatFixtureDate(r.date)}
        </div>
        {r.venue && (
          <div style={{ fontSize: "0.55rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80px" }}>
            {r.venue}
          </div>
        )}
      </div>
    </div>
  );
}

function FixtureRow({ f, league }: { f: FootballFixtureRow; league: string }) {
  const hCode = teamCode(f.home_team);
  const aCode = teamCode(f.away_team);
  const hLeague = teamLeague(hCode) ?? league;
  const aLeague = teamLeague(aCode) ?? league;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0.55rem 0",
        borderBottom: "1px solid var(--border-subtle)",
        gap: "0.5rem",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.2rem" }}>
          <TeamLogo code={hCode} sport="football" leagueCode={hLeague} color={teamColor(hCode)} />
          <span style={{ fontSize: "0.78rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {f.home_team}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <TeamLogo code={aCode} sport="football" leagueCode={aLeague} color={teamColor(aCode)} />
          <span style={{ fontSize: "0.78rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {f.away_team}
          </span>
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 500 }}>
          {formatFixtureDate(f.date)}
        </div>
        <div style={{ fontFamily: 'var(--font-jetbrains-mono, "JetBrains Mono", monospace)', fontSize: "0.8rem", fontWeight: 600 }}>
          {f.kickoff}
        </div>
        {f.venue && (
          <div style={{ fontSize: "0.55rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100px" }}>
            {f.venue}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadMoreBtn({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: "block",
        width: "100%",
        marginTop: "0.75rem",
        padding: "0.45rem",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-sm)",
        color: "var(--text-secondary)",
        fontSize: "0.72rem",
        fontWeight: 600,
        cursor: loading ? "default" : "pointer",
        fontFamily: "var(--font-outfit, sans-serif)",
        opacity: loading ? 0.6 : 1,
        transition: "all 0.15s",
      }}
    >
      {loading ? "Loading…" : "Load more"}
    </button>
  );
}

function SkeletonRows({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0.55rem 0",
            borderBottom: "1px solid var(--border-subtle)",
            gap: "0.5rem",
            opacity: 1 - i * 0.15,
          }}
        >
          <div style={{ flex: 1, height: "38px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ width: "48px", height: "38px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      ))}
    </>
  );
}

function SectionHeader({ title, count, suffix, accent, note }: { title: string; count: number; suffix?: string; accent: string; note?: string }) {
  return (
    <div style={{ padding: "0.9rem 1.4rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <div style={{ fontWeight: 700, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {title}
        {count > 0 && (
          <span style={{ fontSize: "0.6rem", fontWeight: 700, background: accent + "22", color: accent, padding: "0.1rem 0.45rem", borderRadius: "20px" }}>
            {count}{suffix ?? ""}
          </span>
        )}
      </div>
      {note && <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>{note}</span>}
    </div>
  );
}

const PANEL_HEIGHT = "clamp(400px, calc(100vh - 380px), 680px)";

function UpcomingPanel({ competitionShort, leagueCode, accent }: { competitionShort: string; leagueCode: string; accent: string }) {
  const today = todayStr();
  const tomorrow = getTomorrow(today);

  const [todayFixtures, setTodayFixtures] = useState<FootballFixtureRow[]>([]);
  const [loadingToday, setLoadingToday] = useState(true);

  const [upcoming, setUpcoming] = useState<FootballFixtureRow[]>([]);
  const [upcomingPage, setUpcomingPage] = useState(0);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingMoreUpcoming, setLoadingMoreUpcoming] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchFootballFixturesPaged(competitionShort, "scheduled", 0, 50, today, today),
      fetchFootballFixturesPaged(competitionShort, "scheduled", 0, 15, tomorrow),
    ]).then(([t, u]) => {
      setTodayFixtures(t.rows);
      setLoadingToday(false);
      setUpcoming(u.rows);
      setHasMoreUpcoming(u.hasMore);
      setLoadingUpcoming(false);
    });
  }, [competitionShort, today, tomorrow]);

  const loadMoreUpcoming = useCallback(async () => {
    setLoadingMoreUpcoming(true);
    const next = upcomingPage + 1;
    const { rows, hasMore } = await fetchFootballFixturesPaged(competitionShort, "scheduled", next, 15, tomorrow);
    setUpcoming((prev) => [...prev, ...rows]);
    setUpcomingPage(next);
    setHasMoreUpcoming(hasMore);
    setLoadingMoreUpcoming(false);
  }, [competitionShort, upcomingPage, tomorrow]);

  return (
    <div className="fade-in fd2">
      <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <SectionHeader title="Upcoming" count={todayFixtures.length + upcoming.length} suffix={hasMoreUpcoming ? "+" : ""} accent={accent} note="Today first" />
        <div style={{ flex: 1, height: PANEL_HEIGHT, overflowY: "auto", padding: "0 1.4rem" }}>
          {loadingUpcoming || loadingToday ? (
            <SkeletonRows n={6} />
          ) : todayFixtures.length === 0 && upcoming.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "2rem 0", textAlign: "center" }}>
              No upcoming fixtures.
            </div>
          ) : (
            <>
              {todayFixtures.length > 0 && (
                <div style={{ paddingTop: "0.5rem" }}>
                  <div style={{ fontSize: "0.62rem", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px", padding: "0.4rem 0" }}>
                    Today
                  </div>
                  {todayFixtures.map((f) => <FixtureRow key={f.id} f={f} league={leagueCode} />)}
                </div>
              )}
              {upcoming.length > 0 && (
                <div style={{ paddingTop: todayFixtures.length > 0 ? "0.6rem" : "0.5rem" }}>
                  {todayFixtures.length > 0 && (
                    <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", padding: "0.4rem 0" }}>
                      Later
                    </div>
                  )}
                  {upcoming.map((f) => <FixtureRow key={f.id} f={f} league={leagueCode} />)}
                </div>
              )}
              {hasMoreUpcoming && <LoadMoreBtn onClick={loadMoreUpcoming} loading={loadingMoreUpcoming} />}
              <div style={{ height: "0.5rem" }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsPanel({ competitionShort, leagueCode, accent }: { competitionShort: string; leagueCode: string; accent: string }) {
  const [results, setResults] = useState<FootballFixtureRow[]>([]);
  const [resultsPage, setResultsPage] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [loadingResults, setLoadingResults] = useState(true);
  const [loadingMoreResults, setLoadingMoreResults] = useState(false);

  useEffect(() => {
    fetchFootballFixturesPaged(competitionShort, "finished", 0, 10).then((r) => {
      setResults(r.rows);
      setHasMoreResults(r.hasMore);
      setLoadingResults(false);
    });
  }, [competitionShort]);

  const loadMoreResults = useCallback(async () => {
    setLoadingMoreResults(true);
    const next = resultsPage + 1;
    const { rows, hasMore } = await fetchFootballFixturesPaged(competitionShort, "finished", next, 10);
    setResults((prev) => [...prev, ...rows]);
    setResultsPage(next);
    setHasMoreResults(hasMore);
    setLoadingMoreResults(false);
  }, [competitionShort, resultsPage]);

  return (
    <div className="fade-in fd2">
      <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <SectionHeader title="Results" count={results.length} suffix={hasMoreResults ? "+" : ""} accent={accent} note="Newest first" />
        <div style={{ flex: 1, height: PANEL_HEIGHT, overflowY: "auto", padding: "0 1.4rem" }}>
          {loadingResults ? (
            <SkeletonRows n={6} />
          ) : results.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "2rem 0", textAlign: "center" }}>
              No results yet this season.
            </div>
          ) : (
            <>
              {results.map((r) => <ResultRow key={r.id} r={r} league={leagueCode} />)}
              {hasMoreResults && <LoadMoreBtn onClick={loadMoreResults} loading={loadingMoreResults} />}
              <div style={{ height: "0.5rem" }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function FixturesTabPanel({ competitionShort, leagueCode, accent, mode }: Props) {
  return mode === "upcoming"
    ? <UpcomingPanel competitionShort={competitionShort} leagueCode={leagueCode} accent={accent} />
    : <ResultsPanel competitionShort={competitionShort} leagueCode={leagueCode} accent={accent} />;
}
