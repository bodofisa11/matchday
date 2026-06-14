"use client";

import { useState } from "react";
import { sportDot } from "@/app/lib/v2/types";
import type { CompetitionMeta } from "@/app/lib/v2/types";
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
