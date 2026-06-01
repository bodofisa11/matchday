"use client";

import Link from "next/link";
import { getStandings } from "@/app/lib/v2/queries";
import { sportDot } from "@/app/lib/v2/types";
import type { CompetitionMeta } from "@/app/lib/v2/types";
import { Crest, FormBadge } from "../common";

const TABS = ["Standings", "Fixtures", "Results", "Stats", "Teams"];
const COLS = "20px 1fr 28px 28px 28px 32px 32px 36px auto";

export function CompetitionView({ competition }: { competition: CompetitionMeta }) {
  const standings = getStandings(competition.slug);

  return (
    <>
      <section className="wf-hero">
        <div className="wf-col wf-gap12">
          <div className="wf-center wf-gap8">
            <span className={`wf-dot ${sportDot(competition.sport)}`} />
            <span className="wf-eyebrow">
              {competition.country} · {competition.season}
            </span>
          </div>
          <h1 className="wf-h1">{competition.name}</h1>
        </div>
        <div className="wf-ph">competition crest / hero</div>
      </section>

      <div className="wf-center wf-gap6" style={{ marginBottom: 20 }}>
        {TABS.map((t, i) => (
          <span key={t} className={`wf-chip${i === 0 ? " on" : ""}`}>
            {t}
          </span>
        ))}
      </div>

      <div className="wf-grid-3">
        <div className="wf-col wf-gap12">
          <span className="wf-h3">Standings</span>
          {standings.length === 0 ? (
            <div className="wf-empty">Standings not available for this competition yet.</div>
          ) : (
            <div className="wf-box">
              <div className="wf-trow head" style={{ gridTemplateColumns: COLS }}>
                <span>#</span>
                <span>Club</span>
                <span>P</span>
                <span>W</span>
                <span>D</span>
                <span>GF</span>
                <span>GA</span>
                <span>Pts</span>
                <span>Form</span>
              </div>
              {standings.map((r) => (
                <div key={r.team.slug} className="wf-trow" style={{ gridTemplateColumns: COLS }}>
                  <span className="wf-rank">{r.rank}</span>
                  <Link
                    href={`/${competition.sport}/${competition.slug}/${r.team.slug}`}
                    className="wf-center wf-gap8"
                    style={{ textDecoration: "none", color: "inherit", minWidth: 0 }}
                  >
                    <Crest team={r.team} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.team.name}
                    </span>
                  </Link>
                  <span className="wf-num">{r.played}</span>
                  <span className="wf-num">{r.won}</span>
                  <span className="wf-num">{r.drawn}</span>
                  <span className="wf-num">{r.goalsFor}</span>
                  <span className="wf-num">{r.goalsAgainst}</span>
                  <span className="wf-num">{r.points}</span>
                  <span className="wf-form">
                    {r.form.map((f, i) => (
                      <FormBadge key={i} r={f} />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="wf-col wf-gap20">
          <div className="wf-col wf-gap12">
            <span className="wf-h3">Upcoming</span>
            {standings.slice(0, 2).map((r, i) => {
              const opp = standings[(i + 1) % standings.length].team;
              return (
                <div key={r.team.slug} className="wf-match">
                  <span className="wf-mono-sm">Sat 19:30</span>
                  <div className="wf-between">
                    <span className="wf-center wf-gap8">
                      <Crest team={r.team} />
                      <span className="wf-mono-sm">{r.team.code}</span>
                    </span>
                    <span className="wf-muted">vs</span>
                    <span className="wf-center wf-gap8">
                      <span className="wf-mono-sm">{opp.code}</span>
                      <Crest team={opp} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
