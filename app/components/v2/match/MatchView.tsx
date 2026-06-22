"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  competitionSlugForShort,
  getMatchById,
  getMatchLineups,
  getMatchResult,
  teamRefFromName,
  type FootballMatchDetail,
  type LineupPlayer,
  type MatchLineup,
  type MatchResultDetail,
  type MatchTeamStats,
} from "@/app/lib/v2/queries";
import { formatFixtureDate } from "@/app/lib/team-meta";
import { Breadcrumbs, type Crumb } from "../Breadcrumbs";
import { Crest } from "../common";

type Phase = "scheduled" | "live" | "finished";

/** Collapse the raw DB fixture status into the three display phases. */
function phaseOf(status: string): Phase {
  if (status === "live") return "live";
  if (status === "finished" || status === "cancelled") return "finished";
  return "scheduled"; // scheduled | postponed
}

function StatusBadge({ phase, raw }: { phase: Phase; raw: string }) {
  if (phase === "live") return <span className="wf-live">LIVE</span>;
  if (phase === "finished")
    return <span className="wf-vs-center">{raw === "cancelled" ? "CANCELLED" : "FT"}</span>;
  return <span className="wf-vs-center">{raw === "postponed" ? "POSTP." : "UPCOMING"}</span>;
}

/** Chevron pointing down when open, right when collapsed. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{
        transition: "transform 0.15s ease",
        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
        flexShrink: 0,
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Collapsible section box. Open by default so every stat is visible without
 * scrolling; click the header (or chevron) to collapse the ones not wanted.
 */
function Section({
  title,
  note,
  children,
  defaultOpen = true,
}: {
  title: string;
  note?: string | null;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="wf-box wf-pad">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="wf-shead"
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "pointer",
          color: "inherit",
          font: "inherit",
          textAlign: "left",
        }}
      >
        <span className="wf-h3">{title}</span>
        <span className="wf-center wf-gap8">
          {note && <span className="wf-mono-sm wf-muted">{note}</span>}
          <Chevron open={open} />
        </span>
      </button>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}

/** Placeholder for detail sections with no data yet for this match. */
function ComingSoon({ title }: { title: string }) {
  return (
    <Section title={title} note="Soon">
      <div className="wf-empty">No {title.toLowerCase()} data yet for this match.</div>
    </Section>
  );
}

/** "group_stage" → "Group stage". Null/empty → null. */
function prettyStage(s: string | null | undefined): string | null {
  if (!s) return null;
  const text = s.replace(/[_-]+/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : null;
}

function Scoreboard({ m, result }: { m: FootballMatchDetail; result: MatchResultDetail | null }) {
  const phase = phaseOf(m.status);
  const showScore = phase === "live" || phase === "finished";
  const home = teamRefFromName(m.home_team);
  const away = teamRefFromName(m.away_team);
  const ht =
    result && result.home_score_ht !== null && result.away_score_ht !== null
      ? `HT ${result.home_score_ht}–${result.away_score_ht}`
      : null;
  const extra =
    result?.duration && result.duration !== "REGULAR"
      ? result.duration === "PENALTY_SHOOTOUT"
        ? "Pens"
        : "AET"
      : null;
  const stage = prettyStage(m.stage);
  const meta = [formatFixtureDate(m.date), `${m.kickoff} IST`, m.venue].filter(
    (v): v is string => Boolean(v),
  );
  return (
    <div className="wf-box wf-pad">
      <div className="wf-col" style={{ alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span className="wf-mono-sm wf-muted" style={{ letterSpacing: ".06em", textTransform: "uppercase" }}>
          {m.competition} · {m.season}
        </span>
        {stage && (
          <span
            className="wf-mono-sm"
            style={{
              padding: "2px 12px",
              border: "1px solid var(--wf-line)",
              borderRadius: 999,
              textTransform: "uppercase",
              letterSpacing: ".04em",
            }}
          >
            {stage}
          </span>
        )}
      </div>

      <div
        className="wf-center"
        style={{ justifyContent: "center", gap: 24, padding: "16px 0" }}
      >
        <span className="wf-col" style={{ alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <Crest team={home} lg />
          <span style={{ fontWeight: 600, textAlign: "center" }}>{m.home_team}</span>
        </span>
        <span className="wf-col" style={{ alignItems: "center", gap: 4 }}>
          {showScore ? (
            <span className="wf-center wf-gap8">
              <span className="wf-score" style={{ fontSize: 36 }}>{m.home_score ?? 0}</span>
              <span className="wf-muted">:</span>
              <span className="wf-score" style={{ fontSize: 36 }}>{m.away_score ?? 0}</span>
            </span>
          ) : (
            <span className="wf-score" style={{ fontSize: 30 }}>{m.kickoff}</span>
          )}
          <StatusBadge phase={phase} raw={m.status} />
          {extra && <span className="wf-mono-sm wf-muted">{extra}</span>}
          {ht && <span className="wf-mono-sm wf-muted">{ht}</span>}
        </span>
        <span className="wf-col" style={{ alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <Crest team={away} lg />
          <span style={{ fontWeight: 600, textAlign: "center" }}>{m.away_team}</span>
        </span>
      </div>

      <div
        className="wf-center"
        style={{
          justifyContent: "center",
          gap: 10,
          flexWrap: "wrap",
          borderTop: "1px solid var(--wf-line)",
          paddingTop: 14,
          marginTop: 6,
        }}
      >
        {meta.map((x, i) => (
          <span key={i} className="wf-center" style={{ gap: 10 }}>
            {i > 0 && (
              <span className="wf-muted" aria-hidden>
                ·
              </span>
            )}
            <span className="wf-mono-sm wf-muted">{x}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- match events --------------------------------------------------------

type EventKind = "goal" | "yellow" | "red" | "sub";

interface TimelineItem {
  kind: EventKind;
  minute: number | null;
  injury: number | null;
  team: "home" | "away";
  primary: string; // scorer / booked player / player in
  secondary?: string | null; // assist / player out
  note?: string | null; // pen / og
}

function minuteLabel(min: number | null, injury: number | null): string {
  if (min === null) return "—";
  return injury ? `${min}+${injury}'` : `${min}'`;
}

const KIND_ICON: Record<EventKind, string> = {
  goal: "⚽",
  yellow: "🟨",
  red: "🟥",
  sub: "🔁",
};

function buildTimeline(r: MatchResultDetail): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const g of r.goals) {
    const t = (g.type ?? "").toLowerCase();
    items.push({
      kind: "goal",
      minute: g.minute,
      injury: g.injury_time ?? null,
      team: g.team,
      primary: g.scorer ?? "Goal",
      secondary: g.assist ? `assist ${g.assist}` : null,
      note: t.includes("pen") ? "pen" : t.includes("own") ? "OG" : null,
    });
  }
  for (const b of r.bookings) {
    items.push({
      kind: b.card === "red" ? "red" : "yellow",
      minute: b.minute,
      injury: b.injury_time ?? null,
      team: b.team,
      primary: b.player ?? "—",
    });
  }
  for (const s of r.substitutions) {
    items.push({
      kind: "sub",
      minute: s.minute,
      injury: s.injury_time ?? null,
      team: s.team,
      primary: s.player_in ?? "—",
      secondary: s.player_out ? `out ${s.player_out}` : null,
    });
  }
  return items.sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0) || (a.injury ?? 0) - (b.injury ?? 0));
}

function EventRow({ it }: { it: TimelineItem }) {
  const isHome = it.team === "home";
  const cell = (
    <span className="wf-col" style={{ gap: 2, minWidth: 0, textAlign: isHome ? "right" : "left" }}>
      <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {KIND_ICON[it.kind]} {it.primary}
        {it.note && <span className="wf-muted" style={{ marginLeft: 4, fontSize: 11 }}>({it.note})</span>}
      </span>
      {it.secondary && (
        <span className="wf-muted" style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {it.secondary}
        </span>
      )}
    </span>
  );
  return (
    <div className="wf-trow" style={{ gridTemplateColumns: "1fr 48px 1fr", alignItems: "center" }}>
      {isHome ? cell : <span />}
      <span className="wf-mono-sm wf-muted" style={{ textAlign: "center" }}>
        {minuteLabel(it.minute, it.injury)}
      </span>
      {isHome ? <span /> : cell}
    </div>
  );
}

function MatchEvents({ result }: { result: MatchResultDetail }) {
  const timeline = buildTimeline(result);
  if (timeline.length === 0) return <ComingSoon title="Match events" />;
  return (
    <Section title="Match events" note={result.events_source}>
      <div className="wf-col">
        {timeline.map((it, i) => (
          <EventRow key={i} it={it} />
        ))}
      </div>
    </Section>
  );
}

// ---- statistics ----------------------------------------------------------

interface StatLine {
  label: string;
  home: number | null;
  away: number | null;
  /** render values as percentages (possession). */
  pct?: boolean;
}

function statLines(s: MatchTeamStats): StatLine[] {
  return [
    { label: "Possession", home: s.possession_home, away: s.possession_away, pct: true },
    { label: "Shots", home: s.shots_home, away: s.shots_away },
    { label: "Shots on target", home: s.shots_on_target_home, away: s.shots_on_target_away },
    { label: "Corners", home: s.corners_home, away: s.corners_away },
    { label: "Offsides", home: s.offsides_home, away: s.offsides_away },
    { label: "Expected goals (xG)", home: s.xg_home, away: s.xg_away },
  ].filter((l) => l.home !== null || l.away !== null);
}

function StatBar({ line }: { line: StatLine }) {
  const h = line.home ?? 0;
  const a = line.away ?? 0;
  const total = h + a;
  const hPct = total > 0 ? (h / total) * 100 : 50;
  const fmt = (v: number | null) =>
    v === null ? "—" : line.pct ? `${v}%` : Number.isInteger(v) ? String(v) : v.toFixed(2);
  return (
    <div className="wf-col" style={{ gap: 6, padding: "8px 0" }}>
      <div className="wf-center" style={{ justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600 }}>{fmt(line.home)}</span>
        <span className="wf-mono-sm wf-muted">{line.label}</span>
        <span style={{ fontWeight: 600 }}>{fmt(line.away)}</span>
      </div>
      <div className="wf-center" style={{ gap: 4 }}>
        <div style={{ flex: 1, height: 6, background: "var(--wf-fill-2)", borderRadius: 4, overflow: "hidden", display: "flex", justifyContent: "flex-end" }}>
          <span style={{ width: `${hPct}%`, background: "var(--wf-foot)", borderRadius: 4 }} />
        </div>
        <div style={{ flex: 1, height: 6, background: "var(--wf-fill-2)", borderRadius: 4, overflow: "hidden" }}>
          <span style={{ display: "block", width: `${100 - hPct}%`, height: "100%", background: "var(--wf-foot)", borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

function Statistics({ result }: { result: MatchResultDetail }) {
  if (!result.stats) return <ComingSoon title="Statistics" />;
  const lines = statLines(result.stats);
  if (lines.length === 0) return <ComingSoon title="Statistics" />;
  return (
    <Section title="Statistics" note={result.stats_source}>
      <div className="wf-col">
        {lines.map((l) => (
          <StatBar key={l.label} line={l} />
        ))}
      </div>
    </Section>
  );
}

// ---- lineups -------------------------------------------------------------

function PlayerLine({ p, starter }: { p: LineupPlayer; starter?: boolean }) {
  return (
    <div className="wf-center" style={{ gap: 8, padding: "4px 0" }}>
      <span className="wf-mono-sm wf-muted" style={{ width: 22, textAlign: "right" }}>
        {p.number ?? "—"}
      </span>
      <span style={{ fontWeight: starter ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {p.player ?? "—"}
      </span>
      {p.position && <span className="wf-mono-sm wf-muted" style={{ marginLeft: "auto" }}>{p.position}</span>}
    </div>
  );
}

function LineupColumn({ lu, teamName }: { lu: MatchLineup; teamName: string }) {
  return (
    <div className="wf-col" style={{ gap: 8, flex: 1, minWidth: 0 }}>
      <div className="wf-center" style={{ justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teamName}</span>
        {lu.formation && <span className="wf-mono-sm wf-muted">{lu.formation}</span>}
      </div>
      {lu.coach && <span className="wf-mono-sm wf-muted">Coach: {lu.coach}</span>}
      <div className="wf-col">
        {lu.starting_xi.map((p, i) => (
          <PlayerLine key={`s${i}`} p={p} starter />
        ))}
      </div>
      {lu.bench.length > 0 && (
        <>
          <span className="wf-mono-sm wf-muted" style={{ marginTop: 6 }}>Bench</span>
          <div className="wf-col">
            {lu.bench.map((p, i) => (
              <PlayerLine key={`b${i}`} p={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Lineups({ lineups, m }: { lineups: MatchLineup[]; m: FootballMatchDetail }) {
  const home = lineups.find((l) => l.side === "home");
  const away = lineups.find((l) => l.side === "away");
  const hasXi = (home?.starting_xi.length ?? 0) > 0 || (away?.starting_xi.length ?? 0) > 0;
  if (!hasXi) return <ComingSoon title="Lineups" />;
  return (
    <Section title="Lineups">
      <div className="wf-center" style={{ alignItems: "flex-start", gap: 20 }}>
        {home && <LineupColumn lu={home} teamName={m.home_team} />}
        {away && <LineupColumn lu={away} teamName={m.away_team} />}
      </div>
    </Section>
  );
}

// ---- page ----------------------------------------------------------------

export function MatchView({ matchId }: { matchId: string | null }) {
  const [match, setMatch] = useState<FootballMatchDetail | null>(null);
  const [result, setResult] = useState<MatchResultDetail | null>(null);
  const [lineups, setLineups] = useState<MatchLineup[]>([]);
  const [loading, setLoading] = useState(Boolean(matchId));

  // Reset during render when the id changes (avoids sync setState in effect).
  const [prevId, setPrevId] = useState(matchId);
  if (prevId !== matchId) {
    setPrevId(matchId);
    setMatch(null);
    setResult(null);
    setLineups([]);
    setLoading(Boolean(matchId));
  }

  useEffect(() => {
    if (!matchId) return;
    let alive = true;
    Promise.all([getMatchById(matchId), getMatchResult(matchId), getMatchLineups(matchId)]).then(
      ([m, r, lu]) => {
        if (!alive) return;
        setMatch(m);
        setResult(r);
        setLineups(lu);
        setLoading(false);
      },
    );
    return () => {
      alive = false;
    };
  }, [matchId]);

  if (loading) {
    return (
      <section className="wf-section">
        <div className="wf-empty">Loading match…</div>
      </section>
    );
  }

  if (!match) {
    return (
      <section className="wf-section">
        <div className="wf-empty">Match not found.</div>
        <Link href="/" className="wf-chip" style={{ marginTop: 12, display: "inline-block" }}>
          ← Home
        </Link>
      </section>
    );
  }

  const isWc = match.competition_short === "WC";
  const compSlug = competitionSlugForShort(match.competition_short);
  const matchup = `${match.home_team} v ${match.away_team}`;
  const crumbs: Crumb[] = isWc
    ? [{ label: "FIFA World Cup", href: "/world-cup/" }, { label: matchup }]
    : [
        { label: "Football", href: "/football/" },
        compSlug
          ? { label: match.competition, href: `/football/${compSlug}/` }
          : { label: match.competition },
        { label: matchup },
      ];

  return (
    <section className="wf-section" style={{ paddingTop: 0 }}>
      <Breadcrumbs items={crumbs} />

      <Scoreboard m={match} result={result} />

      <div className="wf-col" style={{ gap: 12, marginTop: 12 }}>
        {result ? <MatchEvents result={result} /> : <ComingSoon title="Match events" />}
        {result ? <Statistics result={result} /> : <ComingSoon title="Statistics" />}
        <Lineups lineups={lineups} m={match} />
      </div>
    </section>
  );
}
