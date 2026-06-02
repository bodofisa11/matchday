"use client";

import type { PlayerPosition, TeamProfile } from "@/app/lib/v2/types";
import { sportDot } from "@/app/lib/v2/types";
import { Crest } from "../common";

const POSITIONS: { key: PlayerPosition; label: string }[] = [
  { key: "GK", label: "Goalkeepers" },
  { key: "DEF", label: "Defenders" },
  { key: "MID", label: "Midfielders" },
  { key: "FWD", label: "Forwards" },
];

const SQUAD_COLS = "32px 1fr 56px 1fr 48px";

export function TeamView({ profile }: { profile: TeamProfile }) {
  const { team } = profile;

  return (
    <>
      <section className="wf-hero">
        <div className="wf-center wf-gap20">
          <Crest team={team} lg />
          <div className="wf-col wf-gap12">
            <div className="wf-center wf-gap8">
              <span className={`wf-dot ${sportDot(profile.sport)}`} />
              <span className="wf-eyebrow">
                {profile.sport === "football" ? "Football" : profile.sport} · {profile.country}
              </span>
            </div>
            <h1 className="wf-h1">{team.name}</h1>
            <div className="wf-center wf-gap6">
              <span className="wf-chip">{profile.stadium}</span>
              <span className="wf-chip">Founded {profile.founded}</span>
              <span className="wf-chip">{profile.coach}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="wf-section">
        <span className="wf-h3">Club record</span>
        <div className="wf-stats" style={{ marginTop: 12 }}>
          {profile.stats.map((s) => (
            <div key={s.label} className="wf-stat">
              <div className="n">{s.value}</div>
              <div className="l">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="wf-section" style={{ paddingTop: 0 }}>
        <span className="wf-h3">Squad</span>
        <div className="wf-col wf-gap20" style={{ marginTop: 12 }}>
          {POSITIONS.map(({ key, label }) => {
            const players = profile.squad.filter((p) => p.position === key);
            if (players.length === 0) return null;
            return (
              <div key={key} className="wf-box">
                <div className="wf-trow head" style={{ gridTemplateColumns: SQUAD_COLS }}>
                  <span>#</span>
                  <span>
                    {label} ({players.length})
                  </span>
                  <span>Pos</span>
                  <span>Nationality</span>
                  <span>Age</span>
                </div>
                {players.map((p) => (
                  <div key={`${p.number}-${p.name}`} className="wf-trow" style={{ gridTemplateColumns: SQUAD_COLS }}>
                    <span className="wf-rank">{p.number}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </span>
                    <span className="wf-mono-sm">{p.position}</span>
                    <span className="wf-mono-sm">{p.nationality}</span>
                    <span className="wf-num">{p.age}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
