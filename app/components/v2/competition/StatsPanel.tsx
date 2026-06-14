"use client";

import { useEffect, useState } from "react";
import { getCompetitionScorers, type FootballScorerRow } from "@/app/lib/v2/queries";
import { countryDisplay } from "@/app/lib/football-terms";

const COLS = "20px 1fr 1fr 34px 34px 40px";

export function StatsPanel({ competitionSlug }: { competitionSlug: string }) {
  const [rows, setRows] = useState<FootballScorerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [prevKey, setPrevKey] = useState(competitionSlug);
  if (prevKey !== competitionSlug) {
    setPrevKey(competitionSlug);
    setRows([]);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    getCompetitionScorers(competitionSlug, 20).then((data) => {
      if (cancelled) return;
      setRows(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [competitionSlug]);

  return (
    <div className="wf-col wf-gap12">
      <span className="wf-h3">Top scorers</span>
      {loading ? (
        <div className="wf-empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="wf-empty">No scorer data yet.</div>
      ) : (
        <div className="wf-box">
          <div className="wf-trow head" style={{ gridTemplateColumns: COLS }}>
            <span>#</span>
            <span>Player</span>
            <span>Team</span>
            <span>MP</span>
            <span>A</span>
            <span>G</span>
          </div>
          {rows.map((r) => (
            <div
              key={`${r.position}-${r.player_name}-${r.team_name}`}
              className="wf-trow"
              style={{ gridTemplateColumns: COLS }}
            >
              <span className="wf-rank">{r.position}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.player_name}
                {r.player_nationality && (
                  <span className="wf-muted" style={{ marginLeft: 6, fontSize: 11 }}>
                    {countryDisplay(r.player_nationality)}
                  </span>
                )}
              </span>
              <span className="wf-muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.team_name}
              </span>
              <span className="wf-num">{r.played_matches}</span>
              <span className="wf-num">{r.assists ?? "—"}</span>
              <span className="wf-num" style={{ fontWeight: 700 }}>{r.goals}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
