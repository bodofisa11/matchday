"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTeamCodes } from "@/app/lib/v1/use-team-codes";
import { Navbar, type SportGroup } from "@/app/components/v1/Navbar";
import { CompBar, type CompId } from "@/app/components/v1/CompBar";
import { TodaySection } from "@/app/components/v1/sections/TodaySection";
import { PremierLeagueSection } from "@/app/components/v1/sections/PremierLeagueSection";
import { UCLSection } from "@/app/components/v1/sections/UCLSection";
import { LaLigaSection } from "@/app/components/v1/sections/LaLigaSection";
import { SerieASection } from "@/app/components/v1/sections/SerieASection";
import { BundesligaSection } from "@/app/components/v1/sections/BundesligaSection";
import { Ligue1Section } from "@/app/components/v1/sections/Ligue1Section";
import { ISLSection } from "@/app/components/v1/sections/ISLSection";
import { EuropaLeagueSection } from "@/app/components/v1/sections/EuropaLeagueSection";
import { F1Section } from "@/app/components/v1/sections/F1Section";
import { IPLSection } from "@/app/components/v1/sections/IPLSection";
import { Footer } from "@/app/components/v1/Footer";

const GROUP_DEFAULT: Partial<Record<SportGroup, CompId>> = {
  football: "pl",
  f1: "f1main",
  cricket: "ipl",
};

const VALID_GROUPS: SportGroup[] = ["today", "football", "f1", "cricket", "ufc", "wc26"];
const VALID_COMPS: CompId[] = ["pl", "ucl", "uel", "laliga", "seriea", "bundesliga", "ligue1", "isl", "f1main", "ipl"];

function HomeInner() {
  const params = useSearchParams();
  const initialGroup: SportGroup = (() => {
    const g = params.get("group");
    if (g && (VALID_GROUPS as string[]).includes(g) && g !== "wc26") return g as SportGroup;
    return "today";
  })();
  const initialComp: CompId = (() => {
    const c = params.get("comp");
    if (c && (VALID_COMPS as string[]).includes(c)) return c as CompId;
    return GROUP_DEFAULT[initialGroup] ?? "pl";
  })();

  const [activeGroup, setActiveGroup] = useState<SportGroup>(initialGroup);
  const [activeComp, setActiveComp] = useState<CompId>(initialComp);

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
        {activeComp === "f1main" && activeGroup === "f1" && <F1Section />}
        {activeComp === "ipl" && activeGroup === "cricket" && <IPLSection />}
      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}
