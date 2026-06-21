"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLiveTicker, matchHref } from "@/app/lib/v2/queries";
import { istTodayStr } from "@/app/lib/timezone";
import type { MatchV2 } from "@/app/lib/v2/types";
import { sportDot } from "@/app/lib/v2/types";
import { Crest } from "./common";

export function LiveBar() {
  const [matches, setMatches] = useState<MatchV2[]>([]);

  useEffect(() => {
    let alive = true;
    getLiveTicker(istTodayStr()).then((m) => {
      if (alive) setMatches(m);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (matches.length === 0) return null;

  return (
    <div className="wf-livebar">
      <div className="wf-center wf-gap8">
        <span className="wf-live">Live now</span>
        <span className="wf-num">{matches.length}</span>
      </div>
      <span className="wf-vdivider" />
      <div className="wf-livebar-track">
        {matches.map((m) => {
          const chip = (
            <>
              <span className={`wf-dot ${sportDot(m.sport)}`} />
              <Crest team={m.home} />
              <span className="wf-livescore">{m.homeScore ?? 0}</span>
              <span className="wf-muted">:</span>
              <span className="wf-livescore">{m.awayScore ?? 0}</span>
              <Crest team={m.away} />
              <span className="wf-mono-sm">{m.clock ?? "LIVE"}</span>
            </>
          );
          // Only football fixtures have a detail page (id matches fb_fixtures).
          return m.sport === "football" ? (
            <Link key={m.id} href={matchHref(m.id)} className="wf-livechip" style={{ textDecoration: "none", color: "inherit" }}>
              {chip}
            </Link>
          ) : (
            <div key={m.id} className="wf-livechip">
              {chip}
            </div>
          );
        })}
      </div>
    </div>
  );
}
