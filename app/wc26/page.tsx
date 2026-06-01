"use client";

import { useTeamCodes } from "@/app/lib/v1/use-team-codes";
import { Navbar } from "@/app/components/v1/Navbar";
import { Footer } from "@/app/components/v1/Footer";
import { WorldCup2026Section } from "@/app/components/v1/sections/WorldCup2026Section";

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
