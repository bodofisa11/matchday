"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCompetitions, getSportFixtures } from "@/app/lib/v2/queries";
import { istTodayStr } from "@/app/lib/timezone";
import { SPORTS, sportDot } from "@/app/lib/v2/types";
import type { MatchV2, SportSlug } from "@/app/lib/v2/types";
import { Crest } from "../common";

function ScoreCol({ m }: { m: MatchV2 }) {
  if (m.status === "scheduled") {
    return (
      <span className="wf-center wf-gap8">
        <span className="wf-score">–</span>
        <span className="wf-muted">:</span>
        <span className="wf-score">–</span>
      </span>
    );
  }
  return (
    <span className="wf-center wf-gap8">
      <span className="wf-score">{m.homeScore ?? 0}</span>
      <span className="wf-muted">:</span>
      <span className="wf-score">{m.awayScore ?? 0}</span>
    </span>
  );
}

function FixtureRow({ m }: { m: MatchV2 }) {
  return (
    <div className="wf-trow" style={{ gridTemplateColumns: "56px 1fr auto" }}>
      <span className="wf-mono-sm">
        {m.status === "live" ? <span className="wf-live">LIVE</span> : m.kickoff}
      </span>
      <div className="wf-col wf-gap6">
        <span className="wf-center wf-gap8">
          <Crest team={m.home} />
          <span>{m.home.name}</span>
        </span>
        <span className="wf-center wf-gap8">
          <Crest team={m.away} />
          <span>{m.away.name}</span>
        </span>
      </div>
      <ScoreCol m={m} />
    </div>
  );
}

export function SportView({ sport }: { sport: SportSlug }) {
  const meta = SPORTS.find((s) => s.slug === sport)!;
  const comps = getCompetitions(sport);
  const [data, setData] = useState<{ topFixtures: MatchV2[]; recentResults: MatchV2[] }>({
    topFixtures: [],
    recentResults: [],
  });

  useEffect(() => {
    let alive = true;
    getSportFixtures(sport, istTodayStr()).then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, [sport]);

  if (sport === "cricket") {
    return (
      <section className="wf-section">
        <div className="wf-center wf-gap8" style={{ marginBottom: 16 }}>
          <span className={`wf-dot ${meta.dot}`} />
          <span className="wf-h3">{meta.label}</span>
        </div>
        <div className="wf-empty">Cricket is coming soon — fixtures pending data.</div>
      </section>
    );
  }

  return (
    <>
      <section className="wf-section">
        <div className="wf-center wf-gap8">
          <span className={`wf-dot ${meta.dot}`} />
          <span className="wf-h3">{meta.label}</span>
        </div>
      </section>

      {comps.length > 0 && (
        <section className="wf-section" style={{ paddingTop: 0 }}>
          <span className="wf-eyebrow">Select a competition</span>
          <div className="wf-hscroll" style={{ marginTop: 12 }}>
            {comps.map((c) => (
              <Link
                key={c.slug}
                href={`/v2/${sport}/${c.slug}`}
                className="wf-box wf-pad"
                style={{ width: 190, textDecoration: "none", color: "inherit" }}
              >
                <div className="wf-between">
                  <span className="wf-mono-sm">{c.name}</span>
                  <span className="wf-mono-sm">→</span>
                </div>
                <span className="wf-muted" style={{ fontSize: 11 }}>
                  {c.country}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="wf-section" style={{ paddingTop: 0 }}>
        <div className="wf-grid">
          <div className="wf-box wf-pad">
            <div className="wf-shead">
              <span className="wf-h3">Top fixtures</span>
              <span className="wf-mono-sm wf-muted">All →</span>
            </div>
            {data.topFixtures.length === 0 ? (
              <div className="wf-empty">No upcoming fixtures.</div>
            ) : (
              <div>
                {data.topFixtures.map((m) => (
                  <FixtureRow key={m.id} m={m} />
                ))}
              </div>
            )}
          </div>
          <div className="wf-box wf-pad">
            <div className="wf-shead">
              <span className="wf-h3">Recent results</span>
              <span className="wf-mono-sm wf-muted">All →</span>
            </div>
            {data.recentResults.length === 0 ? (
              <div className="wf-empty">No recent results.</div>
            ) : (
              <div className="wf-col wf-gap8">
                {data.recentResults.map((m) => (
                  <div key={m.id} className="wf-between">
                    <span className={`wf-center wf-gap8`}>
                      <span className={`wf-dot ${sportDot(m.sport)}`} />
                      <span>
                        {m.home.name} v {m.away.name}
                      </span>
                    </span>
                    <span className="wf-num">
                      {m.homeScore ?? 0}-{m.awayScore ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
