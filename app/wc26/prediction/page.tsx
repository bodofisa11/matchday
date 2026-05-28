"use client";

import { useTeamCodes } from "../../lib/use-team-codes";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { PredictSection } from "../../components/sections/PredictSection";

export default function Wc26PredictionPage() {
  useTeamCodes();

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="ambient-bg" />
      <Navbar />
      <main className="main-content">
        <PredictSection />
      </main>
      <Footer />
    </div>
  );
}
