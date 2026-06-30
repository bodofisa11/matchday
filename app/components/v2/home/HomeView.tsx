"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCompetition,
  getScheduleByCompetition,
  getTopMatches,
  getUpcomingF1Races,
  matchHref,
} from "@/app/lib/v2/queries";
import { addDaysToDateStr, istTodayStr } from "@/app/lib/timezone";
import { sportDot } from "@/app/lib/v2/types";
import type { CompetitionMeta, MatchV2 } from "@/app/lib/v2/types";
import { Crest } from "../common";
import { Star } from "../Star";

function VsRow({ m }: { m: MatchV2 }) {
  const showScores = m.status === "live" || m.status === "finished";
  const center =
    m.status === "live" ? (
      <span className="wf-live">{m.clock ?? "LIVE"}</span>
    ) : m.status === "finished" ? (
      <span className="wf-vs-center">FT</span>
    ) : (
      <span className="wf-vs-center">{m.kickoff}</span>
    );
  const body = (
    <>
      <span className="wf-vsteam wf-vsteam-home">
        <span className="nm">{m.home.name}</span>
        <Crest team={m.home} />
        {showScores && <span className="wf-score">{m.homeScore ?? 0}</span>}
      </span>
      <span className="wf-vsmid">{center}</span>
      <span className="wf-vsteam wf-vsteam-away">
        {showScores && <span className="wf-score">{m.awayScore ?? 0}</span>}
        <Crest team={m.away} />
        <span className="nm">{m.away.name}</span>
      </span>
    </>
  );
  return (
    <div className="wf-vsrow">
      <Star id={m.id} />
      {/* Only football fixtures have a detail page (uuid matches fb_fixtures). */}
      {m.sport === "football" ? (
        <Link
          href={matchHref(m.id)}
          style={{ display: "contents", textDecoration: "none", color: "inherit" }}
        >
          {body}
        </Link>
      ) : (
        body
      )}
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
  const [tomorrowGroups, setTomorrowGroups] = useState<
    { competition: CompetitionMeta; matches: MatchV2[] }[]
  >([]);
  const [topMatches, setTopMatches] = useState<MatchV2[]>([]);
  const [f1Week, setF1Week] = useState<{ competition: CompetitionMeta; matches: MatchV2[] } | null>(
    null,
  );

  useEffect(() => {
    let alive = true;
    const date = istTodayStr();
    const tomorrow = addDaysToDateStr(date, 1);
    getScheduleByCompetition(date).then((g) => {
      if (alive) setGroups(g);
    });
    getScheduleByCompetition(tomorrow).then((g) => {
      if (alive) setTomorrowGroups(g);
    });
    getTopMatches(date).then((m) => {
      if (alive) setTopMatches(m);
    });
    getUpcomingF1Races(date, 7).then((g) => {
      if (alive) setF1Week(g);
    });
    return () => {
      alive = false;
    };
  }, []);

  const fmtDay = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const todayDate = new Date();
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const heading = fmtDay(todayDate);
  const tomorrowHeading = fmtDay(tomorrowDate);

  return (
    <>
      <section className="wf-section">
        <span className="wf-eyebrow">Top events</span>
        <div className="wf-hscroll" style={{ marginTop: 12 }}>
          {topMatches.length === 0 ? (
            <div className="wf-muted" style={{ fontSize: 13 }}>No events today.</div>
          ) : (
            topMatches.map((m) => {
              const compHref = getCompetition(m.competitionSlug)
                ? `/${m.sport}/${m.competitionSlug}`
                : `/${m.sport}`;
              const subtitle =
                m.status === "live"
                  ? `${m.homeScore ?? 0}–${m.awayScore ?? 0}`
                  : m.status === "finished"
                  ? `${m.homeScore ?? 0}–${m.awayScore ?? 0} FT`
                  : m.kickoff;
              const metaLabel =
                m.status === "live" ? (m.clock ?? "LIVE") : m.competitionShort || m.competitionSlug;
              return (
                <Link key={m.id} href={compHref} className="wf-eventcard">
                  <span className={`wf-dot ${sportDot(m.sport)}`} />
                  <span className="wf-evtitle">
                    {m.home.shortName} vs {m.away.shortName}
                  </span>
                  <div className="wf-col wf-gap6">
                    <span className="wf-mono-sm">{subtitle}</span>
                    <span className="wf-muted" style={{ fontSize: 12 }}>
                      {metaLabel}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {f1Week && f1Week.matches.length > 0 && (
        <section className="wf-section">
          <div className="wf-shead">
            <span className="wf-h3">Race week · next 7 days</span>
          </div>
          <div>
            <div className="wf-comphead">
              <span className={`wf-dot ${sportDot(f1Week.competition.sport)}`} />
              <Link
                href={`/${f1Week.competition.sport}`}
                className="wf-h3"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {f1Week.competition.name}
              </Link>
              <span className="wf-compmeta">
                {f1Week.matches.length} {f1Week.matches.length === 1 ? "race" : "races"}
              </span>
            </div>
            <div>
              {f1Week.matches.map((m) => {
                const d = new Date(`${m.date}T00:00:00`);
                const label = d.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                return (
                  <div key={m.id} className="wf-vsrow">
                    <Star id={m.id} />
                    <span className="wf-vsteam wf-vsteam-home">
                      <span className="nm">{m.home.name}</span>
                      <Crest team={m.home} />
                    </span>
                    <span className="wf-vsmid">
                      <span className="wf-vs-center">
                        {label} · {m.kickoff}
                      </span>
                    </span>
                    <span className="wf-vsteam wf-vsteam-away">
                      <Crest team={m.away} />
                      <span className="nm">{m.away.name}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

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

      <section className="wf-section">
        <div className="wf-shead">
          <span className="wf-h3">Tomorrow · {tomorrowHeading}</span>
        </div>
        {tomorrowGroups.length === 0 ? (
          <div className="wf-empty">No fixtures for tomorrow.</div>
        ) : (
          <div className="wf-col" style={{ gap: 8 }}>
            {tomorrowGroups.map((g) => (
              <CompetitionGroup key={g.competition.slug} comp={g.competition} matches={g.matches} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
