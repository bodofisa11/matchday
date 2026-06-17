"use client";

import { useEffect, useState } from "react";
import {
  getCompetitionSeasons,
  getWcFixtures,
  getWcGroupStandings,
  teamRefFromName,
  type FootballFixtureRow,
  type WcGroupStandingRow,
} from "@/app/lib/v2/queries";
import { formatFixtureDate } from "@/app/lib/team-meta";
import { Crest, SeasonSelector } from "../common";
import { TeamsPanel } from "../competition/TeamsPanel";
import { StatsPanel } from "../competition/StatsPanel";
import { FixturesPanel } from "../competition/FixturesPanel";

type Tab = "Overview" | "Fixtures" | "Results" | "Groups" | "Bracket" | "Teams" | "Stats";
const TABS: Tab[] = ["Overview", "Fixtures", "Results", "Groups", "Bracket", "Teams", "Stats"];

function OverviewPanel() {
  // Intentionally blank for now — a tournament summary lands here later.
  return <div className="wf-empty">Overview coming soon.</div>;
}

const STAGE_LABEL: Record<string, string> = {
  group: "Group",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-final",
  sf: "Semi-final",
  third: "Third place",
  final: "Final",
};

const KNOCKOUT_STAGES: { id: string; title: string }[] = [
  { id: "r32", title: "Round of 32" },
  { id: "r16", title: "Round of 16" },
  { id: "qf", title: "Quarter-finals" },
  { id: "sf", title: "Semi-finals" },
  { id: "third", title: "Third place" },
  { id: "final", title: "Final" },
];

const GROUP_COLS = "20px 1fr 26px 26px 26px 26px 34px 34px";
const RESULTS_PAGE = 10;

function StageChip({ stage, group }: { stage?: string | null; group?: string | null }) {
  if (!stage) return null;
  const label = stage === "group" && group ? `Group ${group}` : (STAGE_LABEL[stage] ?? stage);
  return <span className="wf-wcstage">{label}</span>;
}

function FixtureLine({ f }: { f: FootballFixtureRow }) {
  const home = teamRefFromName(f.home_team);
  const away = teamRefFromName(f.away_team);
  const finished = f.status === "finished";
  return (
    <div className="wf-trow" style={{ gridTemplateColumns: "1fr auto" }}>
      <div className="wf-col wf-gap6" style={{ minWidth: 0 }}>
        <span className="wf-center wf-gap8" style={{ minWidth: 0 }}>
          <Crest team={home} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {f.home_team}
          </span>
        </span>
        <span className="wf-center wf-gap8" style={{ minWidth: 0 }}>
          <Crest team={away} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {f.away_team}
          </span>
        </span>
      </div>
      <span className="wf-col" style={{ alignItems: "flex-end", gap: 3 }}>
        <StageChip stage={f.stage} group={f.group_name} />
        <span className="wf-mono-sm wf-muted">{formatFixtureDate(f.date)}</span>
        {finished ? (
          <span className="wf-center wf-gap8">
            <span className="wf-score">{f.home_score ?? "–"}</span>
            <span className="wf-muted">:</span>
            <span className="wf-score">{f.away_score ?? "–"}</span>
          </span>
        ) : (
          <span className="wf-mono-sm" style={{ fontWeight: 600 }}>{f.kickoff}</span>
        )}
      </span>
    </div>
  );
}

function GroupCard({ name, rows }: { name: string; rows: WcGroupStandingRow[] }) {
  return (
    <div className="wf-box">
      <div className="wf-trow head" style={{ gridTemplateColumns: GROUP_COLS }}>
        <span>#</span>
        <span>Group {name}</span>
        <span style={{ textAlign: "center" }}>P</span>
        <span style={{ textAlign: "center" }}>W</span>
        <span style={{ textAlign: "center" }}>D</span>
        <span style={{ textAlign: "center" }}>L</span>
        <span style={{ textAlign: "center" }}>GD</span>
        <span style={{ textAlign: "center" }}>Pts</span>
      </div>
      {rows.map((r) => {
        const team = teamRefFromName(r.team);
        return (
          <div
            key={`${r.position}-${r.team}`}
            className={`wf-trow${r.position <= 2 ? " wf-qual" : ""}`}
            style={{ gridTemplateColumns: GROUP_COLS }}
          >
            <span className="wf-rank">{r.position}</span>
            <span className="wf-center wf-gap8" style={{ minWidth: 0 }}>
              <Crest team={team} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.team}
              </span>
            </span>
            <span className="wf-num" style={{ textAlign: "center" }}>{r.played}</span>
            <span className="wf-num" style={{ textAlign: "center" }}>{r.won}</span>
            <span className="wf-num" style={{ textAlign: "center" }}>{r.drawn}</span>
            <span className="wf-num" style={{ textAlign: "center" }}>{r.lost}</span>
            <span className="wf-num" style={{ textAlign: "center" }}>
              {r.goal_difference > 0 ? `+${r.goal_difference}` : r.goal_difference}
            </span>
            <span className="wf-num" style={{ textAlign: "center", fontWeight: 700 }}>{r.points}</span>
          </div>
        );
      })}
    </div>
  );
}

function BracketCard({ f }: { f: FootballFixtureRow }) {
  const home = teamRefFromName(f.home_team);
  const away = teamRefFromName(f.away_team);
  return (
    <div className="wf-match">
      <span className="wf-between" style={{ gap: 8 }}>
        <span className="wf-center wf-gap8" style={{ minWidth: 0 }}>
          <Crest team={home} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {f.home_team}
          </span>
        </span>
        <span className="wf-num" style={{ fontWeight: 700 }}>{f.home_score ?? "–"}</span>
      </span>
      <span className="wf-between" style={{ gap: 8 }}>
        <span className="wf-center wf-gap8" style={{ minWidth: 0 }}>
          <Crest team={away} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {f.away_team}
          </span>
        </span>
        <span className="wf-num" style={{ fontWeight: 700 }}>{f.away_score ?? "–"}</span>
      </span>
      <span className="wf-mono-sm wf-muted">{formatFixtureDate(f.date)}</span>
    </div>
  );
}

export function WorldCupView() {
  const [fixtures, setFixtures] = useState<FootballFixtureRow[]>([]);
  const [groups, setGroups] = useState<Record<string, WcGroupStandingRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Overview");
  // World Cup is a single-edition event; seed with 2026 and replace with any
  // seasons seeded in `events` so the dropdown always shows at least one.
  const [seasons, setSeasons] = useState<string[]>(["2026"]);
  const [season, setSeason] = useState<string>("2026");
  const [resultsShown, setResultsShown] = useState(RESULTS_PAGE);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getWcFixtures(), getWcGroupStandings()]).then(([fx, gr]) => {
      if (cancelled) return;
      setFixtures(fx);
      setGroups(gr);
      setLoading(false);
    });
    getCompetitionSeasons("world-cup").then((s) => {
      if (cancelled || s.length === 0) return;
      setSeasons(s);
      if (!s.includes(season)) setSeason(s[0]);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = fixtures.filter((f) => f.status === "finished").reverse();
  const groupEntries = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  const knockout = KNOCKOUT_STAGES.map((s) => ({
    ...s,
    fixtures: fixtures.filter((f) => f.stage === s.id),
  }));
  const hasKnockout = knockout.some((s) => s.fixtures.length > 0);

  return (
    <>
      <section className="wf-hero">
        <div className="wf-col wf-gap12">
          <div className="wf-center wf-gap8">
            <span className="wf-dot foot" />
            <span className="wf-eyebrow">USA · Canada · Mexico · 2026</span>
          </div>
          <div className="wf-center wf-gap12" style={{ flexWrap: "wrap" }}>
            <h1 className="wf-h1">FIFA World Cup 2026</h1>
            <SeasonSelector seasons={seasons} value={season} onChange={setSeason} />
          </div>
          <span className="wf-mono-sm wf-muted">48 teams · 104 matches · 11 Jun – 19 Jul</span>
        </div>
        <div className="wf-ph">world cup crest / hero</div>
      </section>

      <div className="wf-center wf-gap6" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`wf-chip${t === tab ? " on" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewPanel />}

      {tab === "Fixtures" && <FixturesPanel competitionSlug="world-cup" mode="upcoming" />}

      {tab === "Results" && (
        <div className="wf-box wf-pad">
          <div className="wf-shead">
            <span className="wf-h3">Results</span>
            <span className="wf-mono-sm wf-muted">Newest first</span>
          </div>
          {loading ? (
            <div className="wf-empty">Loading…</div>
          ) : results.length === 0 ? (
            <div className="wf-empty">No results yet this tournament.</div>
          ) : (
            <>
              <div>
                {results.slice(0, resultsShown).map((f) => <FixtureLine key={f.id} f={f} />)}
              </div>
              {resultsShown < results.length && (
                <button
                  className="wf-loadmore"
                  onClick={() => setResultsShown((n) => n + RESULTS_PAGE)}
                >
                  Load more
                </button>
              )}
            </>
          )}
        </div>
      )}

      {tab === "Groups" && (
        <div className="wf-col wf-gap12">
          <span className="wf-h3">Group standings</span>
          {loading ? (
            <div className="wf-empty">Loading…</div>
          ) : groupEntries.length === 0 ? (
            <div className="wf-empty">Group standings not available yet.</div>
          ) : (
            <div className="wf-wcgroups">
              {groupEntries.map(([name, rows]) => (
                <GroupCard key={name} name={name} rows={rows} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Bracket" && (
        <div className="wf-col wf-gap12">
          <span className="wf-h3">Knockout bracket</span>
          {loading ? (
            <div className="wf-empty">Loading…</div>
          ) : !hasKnockout ? (
            <div className="wf-empty">Bracket activates after the group stage.</div>
          ) : (
            <div className="wf-hscroll" style={{ alignItems: "flex-start" }}>
              {knockout
                .filter((s) => s.fixtures.length > 0)
                .map((s) => (
                  <div key={s.id} className="wf-col wf-gap8" style={{ minWidth: 220 }}>
                    <span className="wf-eyebrow">{s.title}</span>
                    {s.fixtures.map((f) => <BracketCard key={f.id} f={f} />)}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {tab === "Teams" && <TeamsPanel competitionSlug="world-cup" />}

      {tab === "Stats" && <StatsPanel competitionSlug="world-cup" />}
    </>
  );
}
