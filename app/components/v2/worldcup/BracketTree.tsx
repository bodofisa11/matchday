"use client";

import Link from "next/link";
import { matchHref, teamRefFromName, type FootballFixtureRow } from "@/app/lib/v2/queries";
import { formatFixtureDate } from "@/app/lib/team-meta";
import {
  buildBracket,
  ROUND_TITLE,
  tieWinner,
  type Side,
} from "@/app/lib/v2/wc-bracket";
import { Crest } from "../common";

function TieRow({
  side,
  team,
  name,
  score,
  pen,
  winner,
  finished,
}: {
  side: Exclude<Side, null>;
  team: ReturnType<typeof teamRefFromName>;
  name: string;
  score: number | null;
  pen: number | null | undefined;
  winner: Side;
  finished: boolean;
}) {
  const isWinner = winner === side;
  const tbd = name === "TBD";
  return (
    <span
      className={`wf-btie-row${tbd ? " tbd" : ""}${isWinner ? " win" : ""}${winner && !isWinner ? " out" : ""}`}
    >
      {tbd ? <span className="wf-btie-tbdcrest" aria-hidden /> : <Crest team={team} />}
      <span className="wf-btie-nm" title={tbd ? "To be decided" : name}>
        {tbd ? "TBD" : name}
      </span>
      {finished && (
        <span className="wf-btie-sc">
          {score ?? "–"}
          {pen != null && <sup className="wf-btie-pen">{pen}</sup>}
        </span>
      )}
    </span>
  );
}

function BracketTie({
  f,
  winners,
}: {
  f: FootballFixtureRow;
  winners: Map<string, string>;
}) {
  const home = teamRefFromName(f.home_team);
  const away = teamRefFromName(f.away_team);
  const winner = tieWinner(f, winners);
  const finished = f.status === "finished";
  const hasPens = f.home_score_pen != null && f.away_score_pen != null;
  const bothTbd = f.home_team === "TBD" && f.away_team === "TBD";
  return (
    <Link
      href={matchHref(f.id)}
      className={`wf-btie${bothTbd ? " tbd" : ""}`}
      title={bothTbd ? "Tie awaiting qualifiers" : `${f.home_team} vs ${f.away_team}`}
    >
      <TieRow side="home" team={home} name={f.home_team} score={f.home_score} pen={f.home_score_pen} winner={winner} finished={finished} />
      <TieRow side="away" team={away} name={f.away_team} score={f.away_score} pen={f.away_score_pen} winner={winner} finished={finished} />
      <span className="wf-btie-meta">
        {hasPens ? "Pens" : finished ? "FT" : `${formatFixtureDate(f.date)} · ${f.kickoff}`}
      </span>
    </Link>
  );
}

export function BracketTree({
  fixtures,
  winners,
}: {
  fixtures: FootballFixtureRow[];
  winners: Map<string, string>;
}) {
  const { rounds, thirdPlace } = buildBracket(fixtures);
  if (rounds.length === 0) {
    return <div className="wf-empty">Bracket activates after the group stage.</div>;
  }

  // Champion node: only when the final has a decided winner.
  const final = rounds.find((r) => r.id === "final")?.ties[0];
  const championSide = final ? tieWinner(final, winners) : null;
  const champion =
    final && championSide
      ? championSide === "home"
        ? final.home_team
        : final.away_team
      : null;

  return (
    <div className="wf-col" style={{ gap: 16 }}>
      <div className="wf-hscroll" style={{ alignItems: "stretch" }}>
        <div className="wf-bracket">
          {rounds.map((r) => (
            <div className="wf-bcol" key={r.id}>
              <div className="wf-broundhd">{r.title}</div>
              <div className="wf-bround">
                {r.ties.map((f) => (
                  <div className="wf-btie-slot" key={f.id}>
                    <BracketTie f={f} winners={winners} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {champion && (
            <div className="wf-bcol" key="champion">
              <div className="wf-broundhd">Champion</div>
              <div className="wf-bround">
                <div className="wf-btie-slot">
                  <div className="wf-bchamp">
                    <Crest team={teamRefFromName(champion)} lg />
                    <span className="wf-bchamp-nm">{champion}</span>
                    <span className="wf-bchamp-tag">★ Winners</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {thirdPlace && (
        <div className="wf-col wf-gap8" style={{ maxWidth: 280 }}>
          <span className="wf-eyebrow">{ROUND_TITLE.third_place} play-off</span>
          <div className="wf-btie-slot" style={{ padding: 0 }}>
            <BracketTie f={thirdPlace} winners={winners} />
          </div>
        </div>
      )}
    </div>
  );
}
