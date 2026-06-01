"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCompetition, getScheduleByCompetition, getTopEvents } from "@/app/lib/v2/queries";
import { istTodayStr } from "@/app/lib/timezone";
import { sportDot } from "@/app/lib/v2/types";
import type { CompetitionMeta, MatchV2 } from "@/app/lib/v2/types";
import { Crest } from "../common";
import { Star } from "../Star";

function VsRow({ m }: { m: MatchV2 }) {
  return (
    <div className="wf-vsrow">
      <Star id={m.id} />
      <div className="wf-vsteams">
        <span className="wf-vsteam">
          <Crest team={m.home} />
          <span className="nm">{m.home.name}</span>
        </span>
        <span className="wf-vs">vs</span>
        <span className="wf-vsteam">
          <Crest team={m.away} />
          <span className="nm">{m.away.name}</span>
        </span>
      </div>
      <span className="wf-kick">
        {m.status === "live" ? (
          <span className="wf-live">{m.clock ?? "LIVE"}</span>
        ) : m.status === "finished" ? (
          `${m.homeScore ?? 0}–${m.awayScore ?? 0}`
        ) : (
          m.kickoff
        )}
      </span>
    </div>
  );
}

function CompetitionGroup({ comp, matches }: { comp: CompetitionMeta; matches: MatchV2[] }) {
  return (
    <div>
      <div className="wf-comphead">
        <span className={`wf-dot ${sportDot(comp.sport)}`} />
        <Link href={`/${comp.sport}/${comp.slug}`} className="wf-h3" style={{ textDecoration: "none", color: "inherit" }}>
          {comp.name}
        </Link>
        <span className="wf-compmeta">
          {comp.country ? `${comp.country} · ` : ""}
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </span>
      </div>
      <div>
        {matches.map((m) => (
          <VsRow key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
}

export function HomeView() {
  const [groups, setGroups] = useState<{ competition: CompetitionMeta; matches: MatchV2[] }[]>([]);
  const events = getTopEvents();

  useEffect(() => {
    let alive = true;
    getScheduleByCompetition(istTodayStr()).then((g) => {
      if (alive) setGroups(g);
    });
    return () => {
      alive = false;
    };
  }, []);

  const heading = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <section className="wf-section">
        <span className="wf-eyebrow">Top events</span>
        <div className="wf-hscroll" style={{ marginTop: 12 }}>
          {events.map((e) => (
            <Link
              key={e.competitionSlug}
              href={getCompetition(e.competitionSlug) ? `/${e.sport}/${e.competitionSlug}` : `/${e.sport}`}
              className="wf-eventcard"
            >
              <span className={`wf-dot ${sportDot(e.sport)}`} />
              <span className="wf-evtitle">{e.title}</span>
              <div className="wf-col wf-gap6">
                <span className="wf-mono-sm">{e.subtitle}</span>
                <span className="wf-muted" style={{ fontSize: 12 }}>
                  {e.meta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="wf-section">
        <div className="wf-shead">
          <span className="wf-h3">Schedule · {heading}</span>
          <button type="button" className="wf-chip">
            Filter
          </button>
        </div>
        {groups.length === 0 ? (
          <div className="wf-empty">No fixtures for today.</div>
        ) : (
          <div className="wf-col" style={{ gap: 8 }}>
            {groups.map((g) => (
              <CompetitionGroup key={g.competition.slug} comp={g.competition} matches={g.matches} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
