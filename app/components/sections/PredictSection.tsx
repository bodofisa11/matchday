"use client";

import { useState } from "react";
import { competitionLogoUrl } from "../../lib/image-utils";
import { FeedView } from "./wc2026/FeedView";
import { PredictionsView } from "./wc2026/PredictionsView";
import { LeaderboardView } from "./wc2026/LeaderboardView";
import { UsersView } from "./wc2026/UsersView";

type SubTab = "feed" | "predictions" | "leaderboard" | "users";

const TABS: { id: SubTab; label: string }[] = [
  { id: "feed", label: "Feed" },
  { id: "predictions", label: "Predictions" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "users", label: "Users" },
];

const ACCENT = "#0066cc";

function TabBar({ active, onChange }: { active: SubTab; onChange: (t: SubTab) => void }) {
  return (
    <div className="fade-in fd1 predict-tabbar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: "0.4rem 1.1rem",
            borderRadius: "20px",
            border: active === tab.id ? "none" : "1px solid var(--border-subtle)",
            background: active === tab.id ? ACCENT : "transparent",
            color: active === tab.id ? "#fff" : "var(--text-secondary)",
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

export function PredictSection() {
  const [active, setActive] = useState<SubTab>("feed");

  return (
    <>
      <div className="section-hero fade-in">
        <div className="hero-bar" style={{ background: ACCENT }} />
        <div className="hero-icon">
          <img src={competitionLogoUrl("WC26") ?? ""} alt="Predict" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div className="hero-text">
          <h2>PREDICT — WORLD CUP 2026</h2>
          <p>Public, no-login bracket game. Pick any number of group, semifinalist, top-scorer or knockout picks. Friends see everything live.</p>
        </div>
      </div>

      <TabBar active={active} onChange={setActive} />

      {active === "feed" && <FeedView />}
      {active === "predictions" && <PredictionsView />}
      {active === "leaderboard" && <LeaderboardView />}
      {active === "users" && <UsersView />}
    </>
  );
}
