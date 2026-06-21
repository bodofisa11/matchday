"use client";

import { useEffect, useState } from "react";
import { sportDot } from "@/app/lib/v2/types";
import type { CompetitionMeta } from "@/app/lib/v2/types";
import { getCompetitionSeasons } from "@/app/lib/v2/queries";
import { Breadcrumbs } from "../Breadcrumbs";
import { CompetitionLogo, SeasonSelector } from "../common";

const SPORT_LABEL: Record<string, string> = {
  football: "Football",
  cricket: "Cricket",
  f1: "Formula 1",
};
import { FixturesPanel } from "./FixturesPanel";
import { StandingsPanel } from "./StandingsPanel";
import { StatsPanel } from "./StatsPanel";
import { TeamsPanel } from "./TeamsPanel";

type Tab = "Overview" | "Standings" | "News" | "Fixtures" | "Results" | "Stats" | "Teams";

const FOOTBALL_TABS: Tab[] = ["Overview", "Standings", "Fixtures", "Results", "Stats", "Teams"];
const CRICKET_TABS: Tab[] = ["Overview", "News", "Fixtures", "Results", "Stats", "Teams"];

function OverviewPanel() {
  // Intentionally blank for now — a competition summary lands here later.
  return <div className="wf-empty">Overview coming soon.</div>;
}

function NewsPanel() {
  return <div className="wf-empty">No news yet.</div>;
}

export function CompetitionView({ competition }: { competition: CompetitionMeta }) {
  const TABS = competition.sport === "cricket" ? CRICKET_TABS : FOOTBALL_TABS;
  const [tab, setTab] = useState<Tab>("Overview");
  // Seed with the competition's own season so the dropdown always shows at
  // least one entry; replace with live seasons from `events` when available.
  const [seasons, setSeasons] = useState<string[]>([competition.season]);
  const [season, setSeason] = useState<string>(competition.season);

  useEffect(() => {
    let cancelled = false;
    getCompetitionSeasons(competition.slug).then((s) => {
      if (cancelled || s.length === 0) return;
      setSeasons(s);
      if (!s.includes(season)) setSeason(s[0]);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competition.slug]);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: SPORT_LABEL[competition.sport] ?? competition.sport, href: `/${competition.sport}/` },
          { label: competition.name },
        ]}
      />

      <section className="wf-hero">
        <div className="wf-col wf-gap12">
          <div className="wf-center wf-gap8">
            <span className={`wf-dot ${sportDot(competition.sport)}`} />
            <span className="wf-eyebrow">
              {competition.country} · {season}
            </span>
          </div>
          <div className="wf-center wf-gap12" style={{ flexWrap: "wrap" }}>
            <h1 className="wf-h1">{competition.name}</h1>
            <SeasonSelector seasons={seasons} value={season} onChange={setSeason} />
          </div>
        </div>
        <CompetitionLogo idOrCode={competition.slug} name={competition.name} variant="hero" />
      </section>

      <div className="wf-center wf-gap6" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`wf-chip${t === tab ? " on" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewPanel />}
      {tab === "News" && <NewsPanel />}
      {tab === "Standings" && <StandingsPanel competitionSlug={competition.slug} />}
      {tab === "Fixtures" && <FixturesPanel competitionSlug={competition.slug} mode="upcoming" />}
      {tab === "Results" && <FixturesPanel competitionSlug={competition.slug} mode="results" />}
      {tab === "Stats" && <StatsPanel competitionSlug={competition.slug} />}
      {tab === "Teams" && <TeamsPanel competitionSlug={competition.slug} />}
    </>
  );
}
