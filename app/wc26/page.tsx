"use client";

import { useTeamCodes } from "../lib/use-team-codes";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { WorldCup2026Section } from "../components/sections/WorldCup2026Section";

export default function Wc26Page() {
  useTeamCodes();

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="ambient-bg" />
      <Navbar />
      <main className="main-content">
        <WorldCup2026Section />
      </main>
      <Footer />
    </div>
  );
}
