"use client";

import { useEffect, useState } from "react";
import {
  getF1Calendar,
  getF1ConstructorStandings,
  getF1DriverStandings,
  getF1RaceResults,
  getF1SprintResults,
  type F1ConstructorRow,
  type F1DriverRow,
  type F1RaceResultRow,
  type F1RaceRow,
  type F1SprintResultRow,
} from "@/app/lib/v2/queries";
import { F1_TEAM_COLORS, todayStr } from "@/app/lib/team-meta";
import { constructorCode, driverCode } from "@/app/lib/f1-codes";
import { useCompactTables } from "@/app/lib/use-compact-tables";

type Tab = "Overview" | "Schedule" | "Drivers" | "Constructors";
const TABS: Tab[] = ["Overview", "Schedule", "Drivers", "Constructors"];
type ResultTab = "race" | "sprint";

const CIRCUIT_TO_GP_NAME: Record<string, string> = {
  "Albert Park Circuit": "Australian Grand Prix",
  "Shanghai International Circuit": "Chinese Grand Prix",
  "Suzuka Circuit": "Japanese Grand Prix",
  "Bahrain International Circuit": "Bahrain Grand Prix",
  "Jeddah Corniche Circuit": "Saudi Arabian Grand Prix",
  "Miami International Autodrome": "Miami Grand Prix",
  "Circuit Gilles Villeneuve": "Canadian Grand Prix",
  "Circuit de Monaco": "Monaco Grand Prix",
  "Circuit de Barcelona-Catalunya": "Spanish Grand Prix",
  "Red Bull Ring": "Austrian Grand Prix",
  "Silverstone Circuit": "British Grand Prix",
  "Circuit de Spa-Francorchamps": "Belgian Grand Prix",
  Hungaroring: "Hungarian Grand Prix",
  "Circuit Zandvoort": "Dutch Grand Prix",
  "Autodromo Nazionale Monza": "Italian Grand Prix",
  "Circuit de Madrid": "Madrid Grand Prix",
  "Baku City Circuit": "Azerbaijan Grand Prix",
  "Marina Bay Street Circuit": "Singapore Grand Prix",
  "Circuit of The Americas": "United States Grand Prix",
  "Autodromo Hermanos Rodriguez": "Mexico City Grand Prix",
  "Autodromo Jose Carlos Pace": "São Paulo Grand Prix",
  "Las Vegas Strip Circuit": "Las Vegas Grand Prix",
  "Losail International Circuit": "Qatar Grand Prix",
  "Yas Marina Circuit": "Abu Dhabi Grand Prix",
};

const COUNTRY_FLAGS: Record<string, string> = {
  Australia: "🇦🇺", China: "🇨🇳", Japan: "🇯🇵", Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦", USA: "🇺🇸", "United States": "🇺🇸",
  Canada: "🇨🇦", Monaco: "🇲🇨", Spain: "🇪🇸", Austria: "🇦🇹",
  "Great Britain": "🇬🇧", "United Kingdom": "🇬🇧", Hungary: "🇭🇺",
  Belgium: "🇧🇪", Netherlands: "🇳🇱", Italy: "🇮🇹", Azerbaijan: "🇦🇿",
  Singapore: "🇸🇬", Mexico: "🇲🇽", Brazil: "🇧🇷", "Las Vegas": "🇺🇸",
  Qatar: "🇶🇦", UAE: "🇦🇪", "Abu Dhabi": "🇦🇪", "United Arab Emirates": "🇦🇪",
};

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function raceName(r: { name?: string | null; circuit: string; country: string }): string {
  return r.name || CIRCUIT_TO_GP_NAME[r.circuit] || `${r.country} Grand Prix`;
}

function formatRaceDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]}`;
}

function teamColor(team: string): string {
  return F1_TEAM_COLORS[team] ?? "#888";
}

const DRIVER_COLS = "28px 1fr 1fr 40px 48px";
const CONSTR_COLS = "28px 1fr 56px 40px 48px";
const RESULT_COLS = "28px 1.2fr 1fr 44px 44px 1fr 44px";

function SprintChip() {
  return <span className="wf-f1sprint">Sprint</span>;
}

function ResultsTable({
  rows,
  showFastest,
}: {
  rows: (F1RaceResultRow | F1SprintResultRow)[];
  showFastest: boolean;
}) {
  const compact = useCompactTables();
  return (
    <div style={{ overflowX: "auto" }}>
      <div className="wf-box" style={{ minWidth: 560 }}>
        <div className="wf-trow head" style={{ gridTemplateColumns: RESULT_COLS }}>
          <span>#</span>
          <span>Driver</span>
          <span>Team</span>
          <span>Grid</span>
          <span>Laps</span>
          <span>Status</span>
          <span>Pts</span>
        </div>
        {rows.map((r, i) => {
          const fastest = showFastest && "is_fastest_lap" in r && r.is_fastest_lap;
          return (
            <div
              key={i}
              className="wf-trow"
              style={{ gridTemplateColumns: RESULT_COLS, boxShadow: `inset 3px 0 0 ${teamColor(r.constructor)}` }}
            >
              <span className="wf-rank">{r.position ?? "—"}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {compact ? driverCode(r.driver) : r.driver}
                {fastest && <span className="wf-f1fl"> ⚡FL</span>}
              </span>
              <span className="wf-muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.constructor}
              </span>
              <span className="wf-num">{r.grid ?? "—"}</span>
              <span className="wf-num">{r.laps}</span>
              <span
                className="wf-mono-sm"
                style={{ color: r.status_text === "Finished" ? "var(--wf-ink-2)" : "var(--wf-f1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {r.status_text}
              </span>
              <span className="wf-num" style={{ fontWeight: 700 }}>{Number(r.points)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RaceDetail({ race, onBack }: { race: F1RaceRow; onBack: () => void }) {
  const [raceResults, setRaceResults] = useState<F1RaceResultRow[]>([]);
  const [sprintResults, setSprintResults] = useState<F1SprintResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resTab, setResTab] = useState<ResultTab>("race");

  const [prevRound, setPrevRound] = useState(race.round);
  if (prevRound !== race.round) {
    setPrevRound(race.round);
    setRaceResults([]);
    setSprintResults([]);
    setResTab("race");
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getF1RaceResults(String(race.season), race.round),
      race.has_sprint ? getF1SprintResults(String(race.season), race.round) : Promise.resolve([]),
    ]).then(([rr, sr]) => {
      if (cancelled) return;
      setRaceResults(rr);
      setSprintResults(sr);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [race.season, race.round, race.has_sprint]);

  return (
    <div className="wf-col wf-gap20">
      <button className="wf-chip" style={{ alignSelf: "flex-start", cursor: "pointer" }} onClick={onBack}>
        ← Schedule
      </button>
      <div className="wf-col wf-gap6">
        <span className="wf-h3" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {COUNTRY_FLAGS[race.country] ?? "🏁"} {raceName(race)}
          {race.has_sprint && <SprintChip />}
        </span>
        <span className="wf-mono-sm wf-muted">
          Round {race.round} · {formatRaceDate(race.date)} · {race.circuit}
        </span>
      </div>

      {race.has_sprint && (
        <div className="wf-center wf-gap6">
          {(["race", "sprint"] as ResultTab[]).map((t) => (
            <button
              key={t}
              className={`wf-chip${resTab === t ? " on" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => setResTab(t)}
            >
              {t === "race" ? "Race" : "Sprint"}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="wf-empty">Loading results…</div>
      ) : resTab === "race" ? (
        raceResults.length === 0 ? (
          <div className="wf-empty">No race results available yet.</div>
        ) : (
          <ResultsTable rows={raceResults} showFastest />
        )
      ) : sprintResults.length === 0 ? (
        <div className="wf-empty">No sprint results available yet.</div>
      ) : (
        <ResultsTable rows={sprintResults} showFastest={false} />
      )}
    </div>
  );
}

function SchedulePanel({
  calendar,
  loading,
  nextRound,
}: {
  calendar: F1RaceRow[];
  loading: boolean;
  nextRound: number | null;
}) {
  const [selected, setSelected] = useState<F1RaceRow | null>(null);

  if (selected) {
    return <RaceDetail race={selected} onBack={() => setSelected(null)} />;
  }

  if (loading) return <div className="wf-empty">Loading…</div>;
  if (calendar.length === 0) return <div className="wf-empty">No calendar data yet.</div>;

  return (
    <div className="wf-col wf-gap12">
      <span className="wf-h3">2026 race calendar</span>
      <div className="wf-box">
        {calendar.map((r) => {
          const completed = r.status === "completed" || r.status === "cancelled";
          const live = ["practice", "qualifying", "race"].includes(r.status);
          const isNext = r.round === nextRound;
          const status = completed ? "Results ›" : live ? "LIVE" : isNext ? "NEXT" : "Upcoming";
          const statusColor = completed
            ? "var(--wf-accent)"
            : live
              ? "var(--wf-f1)"
              : isNext
                ? "var(--wf-foot)"
                : "var(--wf-muted)";
          return (
            <div
              key={r.round}
              className="wf-trow"
              style={{ gridTemplateColumns: "40px 28px 1fr auto", cursor: completed ? "pointer" : "default" }}
              onClick={() => completed && setSelected(r)}
            >
              <span className="wf-rank">R{r.round}</span>
              <span style={{ fontSize: 18 }}>{COUNTRY_FLAGS[r.country] ?? "🏁"}</span>
              <span className="wf-col wf-gap6" style={{ minWidth: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                    {raceName(r)}
                  </span>
                  {r.has_sprint && <SprintChip />}
                </span>
                <span className="wf-mono-sm wf-muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.circuit}
                </span>
              </span>
              <span className="wf-col" style={{ alignItems: "flex-end", gap: 3 }}>
                <span className="wf-mono-sm">{formatRaceDate(r.date)}</span>
                <span className="wf-mono-sm" style={{ color: statusColor, fontWeight: 700, fontSize: 11 }}>
                  {status}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DriversPanel({ drivers, loading }: { drivers: F1DriverRow[]; loading: boolean }) {
  const compact = useCompactTables();
  if (loading) return <div className="wf-empty">Loading…</div>;
  if (drivers.length === 0) return <div className="wf-empty">No standings data yet.</div>;
  return (
    <div className="wf-col wf-gap12">
      <span className="wf-h3">Driver standings</span>
      <div style={{ overflowX: "auto" }}>
        <div className="wf-box" style={{ minWidth: 420 }}>
          <div className="wf-trow head" style={{ gridTemplateColumns: DRIVER_COLS }}>
            <span>#</span>
            <span>Driver</span>
            <span>Team</span>
            <span>Wins</span>
            <span>Pts</span>
          </div>
          {drivers.map((d) => (
            <div
              key={d.driver}
              className="wf-trow"
              style={{ gridTemplateColumns: DRIVER_COLS, boxShadow: `inset 3px 0 0 ${teamColor(d.team)}` }}
            >
              <span className="wf-rank">{d.position}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                {compact ? driverCode(d.driver) : d.driver}
              </span>
              <span className="wf-muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {d.team}
              </span>
              <span className="wf-num">{d.wins ?? 0}</span>
              <span className="wf-num" style={{ fontWeight: 700 }}>{Number(d.points)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConstructorsPanel({
  constructors,
  drivers,
  loading,
}: {
  constructors: F1ConstructorRow[];
  drivers: F1DriverRow[];
  loading: boolean;
}) {
  if (loading) return <div className="wf-empty">Loading…</div>;
  if (constructors.length === 0) return <div className="wf-empty">No standings data yet.</div>;
  const winsByTeam: Record<string, number> = {};
  for (const d of drivers) winsByTeam[d.team] = (winsByTeam[d.team] ?? 0) + Number(d.wins ?? 0);
  return (
    <div className="wf-col wf-gap12">
      <span className="wf-h3">Constructor standings</span>
      <div style={{ overflowX: "auto" }}>
        <div className="wf-box" style={{ minWidth: 420 }}>
          <div className="wf-trow head" style={{ gridTemplateColumns: CONSTR_COLS }}>
            <span>#</span>
            <span>Team</span>
            <span>Code</span>
            <span>Wins</span>
            <span>Pts</span>
          </div>
          {constructors.map((c) => (
            <div
              key={c.driver}
              className="wf-trow"
              style={{ gridTemplateColumns: CONSTR_COLS, boxShadow: `inset 3px 0 0 ${teamColor(c.driver)}` }}
            >
              <span className="wf-rank">{c.position}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                {c.driver}
              </span>
              <span className="wf-mono-sm">{constructorCode(c.driver)}</span>
              <span className="wf-num">{winsByTeam[c.driver] ?? 0}</span>
              <span className="wf-num" style={{ fontWeight: 700 }}>{Number(c.points)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function F1View() {
  const [drivers, setDrivers] = useState<F1DriverRow[]>([]);
  const [constructors, setConstructors] = useState<F1ConstructorRow[]>([]);
  const [calendar, setCalendar] = useState<F1RaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getF1DriverStandings(), getF1ConstructorStandings(), getF1Calendar()]).then(
      ([d, c, cal]) => {
        if (cancelled) return;
        setDrivers(d);
        setConstructors(c);
        setCalendar(cal);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const today = todayStr();
  const nextRound = calendar.find((r) => r.status === "scheduled" && r.date >= today)?.round ?? null;
  const completedCount = calendar.filter(
    (r) => r.status === "completed" || ["practice", "qualifying", "race"].includes(r.status),
  ).length;

  return (
    <>
      <section className="wf-hero">
        <div className="wf-col wf-gap12">
          <div className="wf-center wf-gap8">
            <span className="wf-dot f1" />
            <span className="wf-eyebrow">2026 World Championship</span>
          </div>
          <h1 className="wf-h1">Formula 1</h1>
          {calendar.length > 0 && (
            <span className="wf-mono-sm wf-muted">
              Round {completedCount} of {calendar.length}
            </span>
          )}
        </div>
        <div className="wf-ph">grand prix / hero</div>
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

      {tab === "Overview" && <div className="wf-empty">Overview coming soon.</div>}
      {tab === "Schedule" && (
        <SchedulePanel calendar={calendar} loading={loading} nextRound={nextRound} />
      )}
      {tab === "Drivers" && <DriversPanel drivers={drivers} loading={loading} />}
      {tab === "Constructors" && (
        <ConstructorsPanel constructors={constructors} drivers={drivers} loading={loading} />
      )}
    </>
  );
}
