"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { V2Shell } from "@/app/components/v2/V2Shell";
import { MatchView } from "@/app/components/v2/match/MatchView";

function MatchPageInner() {
  const id = useSearchParams().get("id");
  return <MatchView matchId={id} />;
}

export default function Page() {
  return (
    <V2Shell>
      <Suspense
        fallback={
          <section className="wf-section">
            <div className="wf-empty">Loading match…</div>
          </section>
        }
      >
        <MatchPageInner />
      </Suspense>
    </V2Shell>
  );
}
