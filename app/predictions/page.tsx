"use client";

import { useTeamCodes } from "@/app/lib/use-team-codes";
import { V2Shell } from "@/app/components/v2/V2Shell";
import { PredictSection } from "@/app/components/predictions/PredictSection";

export default function Page() {
  // Warm the DB-backed team-code cache once so crests/codes resolve.
  useTeamCodes();
  return (
    <V2Shell>
      <section className="wf-section">
        <div className="predict-scope">
          <PredictSection />
        </div>
      </section>
    </V2Shell>
  );
}
