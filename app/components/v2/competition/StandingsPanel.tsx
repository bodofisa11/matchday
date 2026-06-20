"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCompetitionStandings,
  teamHref,
  teamRefFromName,
  type FootballStandingRow,
} from "@/app/lib/v2/queries";
import { Crest, FormBadge } from "../common";

const COLS = "22px 1fr 28px 28px 28px 28px 36px 40px auto";

function parseForm(form: string | null): ("W" | "D" | "L")[] {
  if (!form) return [];
  return ((form.toUpperCase().match(/[WDL]/g) ?? []).slice(-5)) as ("W" | "D" | "L")[];
}

export function StandingsPanel({ competitionSlug }: { competitionSlug: string }) {
  const [rows, setRows] = useState<FootballStandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Reset during render when the competition changes (avoids a sync setState
  // inside the effect, which triggers cascading renders).
  const [prevKey, setPrevKey] = useState(competitionSlug);
  if (prevKey !== competitionSlug) {
    setPrevKey(competitionSlug);
    setRows([]);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    getCompetitionStandings(competitionSlug).then((data) => {
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
      <span className="wf-h3">Standings</span>
      {loading ? (
        <div className="wf-empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="wf-empty">Standings not available for this competition yet.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div className="wf-box" style={{ minWidth: 520 }}>
            <div className="wf-trow head" style={{ gridTemplateColumns: COLS }}>
              <span>#</span>
              <span>Club</span>
              <span style={{ textAlign: "center" }}>P</span>
              <span style={{ textAlign: "center" }}>W</span>
              <span style={{ textAlign: "center" }}>D</span>
              <span style={{ textAlign: "center" }}>L</span>
              <span style={{ textAlign: "center" }}>GD</span>
              <span style={{ textAlign: "center" }}>Pts</span>
              <span style={{ textAlign: "center" }}>Form</span>
            </div>
            {rows.map((r) => {
              const team = teamRefFromName(r.team);
              return (
                <div
                  key={`${r.position}-${r.team}`}
                  className="wf-trow"
                  style={{ gridTemplateColumns: COLS }}
                >
                  <span className="wf-rank">{r.position}</span>
                  <Link
                    href={teamHref(competitionSlug, r.team)}
                    className="wf-center wf-gap8"
                    style={{ minWidth: 0, textDecoration: "none", color: "inherit" }}
                  >
                    <Crest team={team} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.team}
                    </span>
                  </Link>
                  <span className="wf-num" style={{ textAlign: "center" }}>{r.played}</span>
                  <span className="wf-num" style={{ textAlign: "center" }}>{r.won}</span>
                  <span className="wf-num" style={{ textAlign: "center" }}>{r.drawn}</span>
                  <span className="wf-num" style={{ textAlign: "center" }}>{r.lost}</span>
                  <span className="wf-num" style={{ textAlign: "center" }}>
                    {r.goal_difference > 0 ? `+${r.goal_difference}` : r.goal_difference}
                  </span>
                  <span className="wf-num" style={{ textAlign: "center", fontWeight: 700 }}>
                    {r.points}
                  </span>
                  <span className="wf-form" style={{ justifyContent: "center" }}>
                    {parseForm(r.form).map((f, i) => (
                      <FormBadge key={i} r={f} />
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
