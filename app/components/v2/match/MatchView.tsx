"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMatchById,
  teamRefFromName,
  type FootballMatchDetail,
} from "@/app/lib/v2/queries";
import { formatFixtureDate } from "@/app/lib/team-meta";
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="wf-trow" style={{ gridTemplateColumns: "120px 1fr" }}>
      <span className="wf-mono-sm wf-muted">{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

/** Placeholder for detail sections not yet in the database. */
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="wf-box wf-pad">
      <div className="wf-shead">
        <span className="wf-h3">{title}</span>
        <span className="wf-mono-sm wf-muted">Soon</span>
      </div>
      <div className="wf-empty">No {title.toLowerCase()} data yet for this match.</div>
    </div>
  );
}

function Scoreboard({ m }: { m: FootballMatchDetail }) {
  const phase = phaseOf(m.status);
  const showScore = phase === "live" || phase === "finished";
  const home = teamRefFromName(m.home_team);
  const away = teamRefFromName(m.away_team);
  return (
    <div className="wf-box wf-pad">
      <div
        className="wf-center"
        style={{ justifyContent: "center", gap: 24, padding: "12px 0" }}
      >
        <span className="wf-col" style={{ alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <Crest team={home} lg />
          <span style={{ fontWeight: 600, textAlign: "center" }}>{m.home_team}</span>
        </span>
        <span className="wf-col" style={{ alignItems: "center", gap: 4 }}>
          {showScore ? (
            <span className="wf-center wf-gap8">
              <span className="wf-score" style={{ fontSize: 32 }}>{m.home_score ?? 0}</span>
              <span className="wf-muted">:</span>
              <span className="wf-score" style={{ fontSize: 32 }}>{m.away_score ?? 0}</span>
            </span>
          ) : (
            <span className="wf-score" style={{ fontSize: 28 }}>{m.kickoff}</span>
          )}
          <StatusBadge phase={phase} raw={m.status} />
        </span>
        <span className="wf-col" style={{ alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <Crest team={away} lg />
          <span style={{ fontWeight: 600, textAlign: "center" }}>{m.away_team}</span>
        </span>
      </div>
    </div>
  );
}

export function MatchView({ matchId }: { matchId: string | null }) {
  const [match, setMatch] = useState<FootballMatchDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(matchId));

  // Reset during render when the id changes (avoids sync setState in effect).
  const [prevId, setPrevId] = useState(matchId);
  if (prevId !== matchId) {
    setPrevId(matchId);
    setMatch(null);
    setLoading(Boolean(matchId));
  }

  useEffect(() => {
    if (!matchId) return;
    let alive = true;
    getMatchById(matchId).then((m) => {
      if (!alive) return;
      setMatch(m);
      setLoading(false);
    });
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

  return (
    <section className="wf-section">
      <Link
        href="/"
        className="wf-mono-sm wf-muted"
        style={{ textDecoration: "none", display: "inline-block", marginBottom: 12 }}
      >
        ← Back
      </Link>

      <span className="wf-eyebrow">
        {match.competition} · {match.season}
      </span>

      <div style={{ marginTop: 12 }}>
        <Scoreboard m={match} />
      </div>

      <div className="wf-box wf-pad" style={{ marginTop: 12 }}>
        <div className="wf-shead">
          <span className="wf-h3">Match info</span>
        </div>
        <MetaRow label="Competition" value={`${match.competition} (${match.competition_short})`} />
        <MetaRow label="Season" value={match.season} />
        <MetaRow label="Date" value={formatFixtureDate(match.date)} />
        <MetaRow label="Kick-off (IST)" value={match.kickoff} />
        {match.venue && <MetaRow label="Venue" value={match.venue} />}
        {match.stage && <MetaRow label="Stage" value={match.stage} />}
      </div>

      <div className="wf-col" style={{ gap: 12, marginTop: 12 }}>
        <ComingSoon title="Lineups" />
        <ComingSoon title="Match events" />
        <ComingSoon title="Statistics" />
      </div>
    </section>
  );
}
