"use client";

import { useTeamCodes } from "@/app/lib/v1/use-team-codes";
import { Navbar } from "@/app/components/v1/Navbar";
import { Footer } from "@/app/components/v1/Footer";
import { PredictSection } from "@/app/components/v1/sections/PredictSection";

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
