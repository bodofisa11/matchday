"use client";

import { useState } from "react";
import { useTeamCodes } from "./lib/use-team-codes";
import { Navbar, type SportGroup } from "./components/Navbar";
import { CompBar, type CompId } from "./components/CompBar";
import { TodaySection } from "./components/sections/TodaySection";
import { PremierLeagueSection } from "./components/sections/PremierLeagueSection";
import { UCLSection } from "./components/sections/UCLSection";
import { LaLigaSection } from "./components/sections/LaLigaSection";
import { SerieASection } from "./components/sections/SerieASection";
import { BundesligaSection } from "./components/sections/BundesligaSection";
import { Ligue1Section } from "./components/sections/Ligue1Section";
import { ISLSection } from "./components/sections/ISLSection";
import { EuropaLeagueSection } from "./components/sections/EuropaLeagueSection";
import { WorldCup2026Section } from "./components/sections/WorldCup2026Section";
import { F1Section } from "./components/sections/F1Section";
import { IPLSection } from "./components/sections/IPLSection";
import { PredictSection } from "./components/sections/PredictSection";
import { APP_VERSION } from "./lib/version";

const GROUP_DEFAULT: Partial<Record<SportGroup, CompId>> = {
  football: "pl",
  f1: "f1main",
  cricket: "ipl",
};

export default function Home() {
  const [activeGroup, setActiveGroup] = useState<SportGroup>("today");
  const [activeComp, setActiveComp] = useState<CompId>("pl");

  // Preload DB-backed team code cache once for the whole app.
  // Triggers a re-render when ready so descendants pick up TLA values.
  useTeamCodes();

  function handleGroupChange(group: SportGroup) {
    setActiveGroup(group);
    const defaultComp = GROUP_DEFAULT[group];
    if (defaultComp) setActiveComp(defaultComp);
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="ambient-bg" />
      <Navbar activeGroup={activeGroup} onGroupChange={handleGroupChange} />
      <CompBar activeGroup={activeGroup} activeComp={activeComp} onCompChange={setActiveComp} />
      <main className="main-content">
        {activeGroup === "today" && <TodaySection />}
        {activeComp === "pl" && activeGroup === "football" && <PremierLeagueSection />}
        {activeComp === "ucl" && activeGroup === "football" && <UCLSection />}
        {activeComp === "laliga" && activeGroup === "football" && <LaLigaSection />}
        {activeComp === "seriea" && activeGroup === "football" && <SerieASection />}
        {activeComp === "bundesliga" && activeGroup === "football" && <BundesligaSection />}
        {activeComp === "ligue1" && activeGroup === "football" && <Ligue1Section />}
        {activeComp === "isl" && activeGroup === "football" && <ISLSection />}
        {activeComp === "uel" && activeGroup === "football" && <EuropaLeagueSection />}
        {activeComp === "wc2026" && activeGroup === "football" && <WorldCup2026Section />}
        {activeComp === "f1main" && activeGroup === "f1" && <F1Section />}
        {activeComp === "ipl" && activeGroup === "cricket" && <IPLSection />}
        {activeGroup === "predict" && <PredictSection />}
      </main>
      <footer className="sp-footer">
        <span>MatchDay © 2026</span>
        <span>Data updated daily</span>
        <span style={{ fontFamily: "var(--font-jetbrains-mono)", opacity: 0.7 }}>
          {APP_VERSION}
        </span>
      </footer>
    </div>
  );
}
