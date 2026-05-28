"use client";

import { useState } from "react";
import { competitionLogoUrl } from "../../lib/image-utils";
import { FixturesTabPanel } from "../FixturesTabPanel";
import { TopScorersTable } from "../TopScorersTable";
import { TeamsTabPanel } from "../TeamsTabPanel";

type Tab = "upcoming" | "results" | "stats" | "teams";

const TABS: { id: Tab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "results", label: "Results" },
  { id: "stats", label: "Stats" },
  { id: "teams", label: "Teams" },
];

const ACCENT = "#ffd700";

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="fade-in fd1 section-tabbar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: "0.4rem 1.1rem",
            borderRadius: "20px",
            border: active === tab.id ? "none" : "1px solid var(--border-subtle)",
            background: active === tab.id ? ACCENT : "transparent",
            color: active === tab.id ? "#000" : "var(--text-secondary)",
            fontWeight: active === tab.id ? 700 : 500,
            fontSize: "0.78rem",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}


export function UCLSection() {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  return (
    <>
      <div className="section-hero fade-in">
        <div className="hero-bar" style={{ background: ACCENT }} />
        <div className="hero-icon"><img src={competitionLogoUrl("UCL") ?? ""} alt="UCL" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>
        <div className="hero-text">
          <h2>UEFA CHAMPIONS LEAGUE</h2>
          <p>Europe&apos;s elite — 2025/26 Season</p>
        </div>
        <div className="hero-badge" style={{ background: "#ffd70020", color: ACCENT }}>
          UCL
        </div>
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "upcoming" && (
        <FixturesTabPanel competitionShort="UCL" leagueCode="ucl" accent={ACCENT} mode="upcoming" />
      )}

      {activeTab === "results" && (
        <FixturesTabPanel competitionShort="UCL" leagueCode="ucl" accent={ACCENT} mode="results" />
      )}

      {activeTab === "stats" && <TopScorersTable competitionShort="UCL" accent={ACCENT} />}
      {activeTab === "teams" && <TeamsTabPanel competitionShort="UCL" accent={ACCENT} />}
    </>
  );
}
