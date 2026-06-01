"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { TeamLogo } from "@/app/components/v1/TeamLogo";
import { TeamName } from "@/app/components/v1/TeamName";
import { LeagueStandingsTable } from "@/app/components/v1/LeagueStandingsTable";
import { competitionLogoUrl } from "@/app/lib/v1/image-utils";
import {
  fetchWcGroupStandings,
  fetchWcFixturesByStage,
  type FootballFixtureRow,
  type WcGroupStandingRow,
} from "@/app/lib/v1/fetch-standings-client";
import { teamCode, teamColor, formatFixtureDate, formatGD } from "@/app/lib/v1/team-meta";
import { TeamsTabPanel } from "@/app/components/v1/TeamsTabPanel";

type Tab = "fixtures" | "groups" | "bracket" | "teams";

const TABS: { id: Tab; label: string }[] = [
  { id: "fixtures", label: "Fixtures" },
  { id: "groups", label: "Groups" },
  { id: "bracket", label: "Bracket" },
  { id: "teams", label: "Teams" },
];

const ACCENT = "#0066cc";
const LEAGUE = "wc2026";
const KICKOFF_DATE = "2026-06-11";
const FINAL_DATE = "2026-07-19";

const STAGE_LABEL: Record<string, string> = {
  group: "Group",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-final",
  sf: "Semi-final",
  third: "Third place",
  final: "Final",
};

function daysUntil(target: string): number {
  const t = new Date(target + "T00:00:00Z").getTime();
  const n = Date.now();
  return Math.ceil((t - n) / 86_400_000);
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function StageChip({ stage, group }: { stage?: string | null; group?: string | null }) {
  if (!stage) return null;
  const label = stage === "group" && group ? `Group ${group}` : (STAGE_LABEL[stage] ?? stage);
  return (
    <span
      style={{
        fontSize: "0.62rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "0.18rem 0.5rem",
        borderRadius: "6px",
        background: `${ACCENT}22`,
        color: ACCENT,
      }}
    >
      {label}
    </span>
  );
}

const TAB_STYLE_ACTIVE: React.CSSProperties = {
  padding: "0.4rem 1.1rem",
  borderRadius: "20px",
  border: "none",
  background: ACCENT,
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.78rem",
  cursor: "pointer",
  transition: "all 0.15s",
  textDecoration: "none",
};

const TAB_STYLE_INACTIVE: React.CSSProperties = {
  padding: "0.4rem 1.1rem",
  borderRadius: "20px",
  border: "1px solid var(--border-subtle)",
  background: "transparent",
  color: "var(--text-secondary)",
  fontWeight: 500,
  fontSize: "0.78rem",
  cursor: "pointer",
  transition: "all 0.15s",
  textDecoration: "none",
};

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="fade-in fd1 section-tabbar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={active === tab.id ? TAB_STYLE_ACTIVE : TAB_STYLE_INACTIVE}
        >
          {tab.label}
        </button>
      ))}
      <Link href="/wc26/prediction" style={TAB_STYLE_INACTIVE}>
        Prediction
      </Link>
    </div>
  );
}

function Loading() {
  return <div style={{ color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>Loading…</div>;
}

function Empty({ icon, label, hint }: { icon: string; label: string; hint?: string }) {
  return (
    <div className="card fade-in" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontWeight: 600 }}>{label}</div>
      {hint && <div style={{ fontSize: "0.78rem", marginTop: "0.4rem" }}>{hint}</div>}
    </div>
  );
}

function FixtureRow({ f }: { f: FootballFixtureRow }) {
  const hCode = teamCode(f.home_team);
  const aCode = teamCode(f.away_team);
  const finished = f.status === "finished";
  return (
    <div className="fixture-item">
      <div className="fixture-teams">
        <div className="fixture-team">
          <TeamLogo code={hCode} sport="football" leagueCode={LEAGUE} color={teamColor(hCode)} />
          <span className="fixture-team-name">{f.home_team}</span>
        </div>
        <div className="fixture-team">
          <TeamLogo code={aCode} sport="football" leagueCode={LEAGUE} color={teamColor(aCode)} />
          <span className="fixture-team-name">{f.away_team}</span>
        </div>
      </div>
      <div className="fixture-meta" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
        <StageChip stage={f.stage} group={f.group_name} />
        <div className="fixture-date">{formatFixtureDate(f.date)}</div>
        {finished ? (
          <div className="fixture-score">{f.home_score} — {f.away_score}</div>
        ) : (
          <div className="fixture-time">{f.kickoff}</div>
        )}
        {f.venue && <div className="fixture-venue">{f.venue}</div>}
      </div>
    </div>
  );
}

function GroupCard({ name, rows }: { name: string; rows: WcGroupStandingRow[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Group {name}</div>
      </div>
      <LeagueStandingsTable rows={rows} leagueCode={LEAGUE} highlightTopN={2} accent={ACCENT} />
    </div>
  );
}

function BracketColumn({ title, fixtures }: { title: string; fixtures: FootballFixtureRow[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", minWidth: "200px" }}>
      <div style={{ fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: ACCENT }}>
        {title}
      </div>
      {fixtures.length === 0 ? (
        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>TBD</div>
      ) : fixtures.map((f) => {
        const hCode = teamCode(f.home_team);
        const aCode = teamCode(f.away_team);
        return (
          <div
            key={f.id}
            className="card"
            style={{ padding: "0.6rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}>
              <TeamLogo code={hCode} sport="football" leagueCode={LEAGUE} color={teamColor(hCode)} size={18} />
              <span style={{ flex: 1 }}>{f.home_team}</span>
              <span style={{ fontWeight: 700 }}>{f.home_score ?? "-"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}>
              <TeamLogo code={aCode} sport="football" leagueCode={LEAGUE} color={teamColor(aCode)} size={18} />
              <span style={{ flex: 1 }}>{f.away_team}</span>
              <span style={{ fontWeight: 700 }}>{f.away_score ?? "-"}</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{formatFixtureDate(f.date)}</div>
          </div>
        );
      })}
    </div>
  );
}

export function WorldCup2026Section() {
  const [activeTab, setActiveTab] = useState<Tab>("fixtures");
  const [upcoming, setUpcoming] = useState<FootballFixtureRow[]>([]);
  const [recent, setRecent] = useState<FootballFixtureRow[]>([]);
  const [groups, setGroups] = useState<Record<string, WcGroupStandingRow[]>>({});
  const [allFixtures, setAllFixtures] = useState<FootballFixtureRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchWcFixturesByStage(null, 250),
      fetchWcGroupStandings(),
    ]).then(([all, g]) => {
      const today = todayIso();
      const up = all
        .filter((f) => f.status === "scheduled" && f.date >= today)
        .slice(0, 6);
      const rec = all
        .filter((f) => f.status === "finished")
        .slice(-5)
        .reverse();
      setAllFixtures(all);
      setUpcoming(up);
      setRecent(rec);
      setGroups(g);
      setLoading(false);
    });
  }, []);

  const today = todayIso();
  const daysToKickoff = daysUntil(KICKOFF_DATE);
  const inProgress = today >= KICKOFF_DATE && today <= FINAL_DATE;
  const completed = today > FINAL_DATE;

  let badgeText = "";
  if (completed) badgeText = "Tournament complete";
  else if (inProgress) badgeText = "Live now";
  else if (daysToKickoff > 0) badgeText = `Kickoff in ${daysToKickoff} day${daysToKickoff === 1 ? "" : "s"}`;

  const teamsByGroup = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));

  const r32 = allFixtures.filter((f) => f.stage === "r32");
  const r16 = allFixtures.filter((f) => f.stage === "r16");
  const qf = allFixtures.filter((f) => f.stage === "qf");
  const sf = allFixtures.filter((f) => f.stage === "sf");
  const third = allFixtures.filter((f) => f.stage === "third");
  const final = allFixtures.filter((f) => f.stage === "final");
  const knockoutCount = r32.length + r16.length + qf.length + sf.length + third.length + final.length;

  return (
    <>
      <div className="section-hero fade-in">
        <div className="hero-bar" style={{ background: ACCENT }} />
        <div className="hero-icon"><img src={competitionLogoUrl("WC26") ?? ""} alt="World Cup 2026" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>
        <div className="hero-text">
          <h2>FIFA WORLD CUP 2026</h2>
          <p>USA · Canada · Mexico — 11 Jun – 19 Jul 2026 · 48 teams · 104 matches</p>
        </div>
        {badgeText && (
          <div className="hero-badge" style={{ background: `${ACCENT}20`, color: ACCENT }}>
            {badgeText}
          </div>
        )}
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "fixtures" && (
        <div className="grid-12 fade-in fd2">
          <div className="card span-6">
            <div className="card-header">
              <div className="card-title">Upcoming Fixtures</div>
            </div>
            {loading ? <Loading /> : upcoming.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No upcoming fixtures.</div>
            ) : upcoming.map((f) => <FixtureRow key={f.id} f={f} />)}
          </div>

          <div className="card span-6">
            <div className="card-header">
              <div className="card-title">Recent Results</div>
            </div>
            {loading ? <Loading /> : recent.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No results yet.</div>
            ) : recent.map((f) => <FixtureRow key={f.id} f={f} />)}
          </div>
        </div>
      )}

      {activeTab === "groups" && (
        <div className="fade-in fd2">
          {loading ? (
            <Loading />
          ) : teamsByGroup.length === 0 ? (
            <Empty icon="📋" label="Group standings not loaded yet" hint="Run the football-data.org runner to populate." />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1rem",
              }}
            >
              {teamsByGroup.map(([name, rows]) => (
                <GroupCard key={name} name={name} rows={rows} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "bracket" && (
        <div className="fade-in fd2">
          {loading ? (
            <Loading />
          ) : knockoutCount === 0 ? (
            <Empty icon="🎯" label="Bracket activates after the group stage" />
          ) : (
            <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
              {r32.length > 0 && <BracketColumn title="Round of 32" fixtures={r32} />}
              <BracketColumn title="Round of 16" fixtures={r16} />
              <BracketColumn title="Quarter-finals" fixtures={qf} />
              <BracketColumn title="Semi-finals" fixtures={sf} />
              <BracketColumn title="Third place" fixtures={third} />
              <BracketColumn title="Final" fixtures={final} />
            </div>
          )}
        </div>
      )}

      {activeTab === "teams" && <TeamsTabPanel competitionShort="WC2026" accent={ACCENT} />}

    </>
  );
}
