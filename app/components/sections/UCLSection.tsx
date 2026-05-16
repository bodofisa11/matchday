"use client";

import { useState } from "react";
import { competitionLogoUrl } from "../../lib/image-utils";
import { FixturesTabPanel } from "../FixturesTabPanel";
import { TopScorersTable } from "../TopScorersTable";

type Tab = "fixtures" | "stats" | "teams";

const TABS: { id: Tab; label: string }[] = [
  { id: "fixtures", label: "Fixtures" },
  { id: "stats", label: "Stats" },
  { id: "teams", label: "Teams" },
];

const ACCENT = "#ffd700";

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="fade-in fd1" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
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

function Placeholder({ label }: { label: string }) {
  return (
    <div className="card fade-in" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚧</div>
      <div style={{ fontWeight: 600 }}>{label} — Coming soon</div>
    </div>
  );
}


export function UCLSection() {
  const [activeTab, setActiveTab] = useState<Tab>("fixtures");

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

      {activeTab === "fixtures" && (
        <FixturesTabPanel competitionShort="UCL" leagueCode="ucl" accent={ACCENT} />
      )}

      {activeTab === "stats" && <TopScorersTable competitionShort="UCL" accent={ACCENT} />}
      {activeTab === "teams" && <Placeholder label="Teams" />}
    </>
  );
}
