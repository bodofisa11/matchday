import type { Fixture } from "@/app/lib/fixtures";

/** Compact variant used inside the weekly time-grid */
export function F1CardCompact({ fixture }: { fixture: Fixture }) {
  const isLive = fixture.status === "live";

  return (
    <div
      className="absolute left-0.5 right-0.5 rounded-lg border shadow-sm p-2 bg-red-50 border-red-300 text-red-900 dark:bg-red-950/60 dark:border-red-700 dark:text-red-100"
      style={{ top: 2 }}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-extrabold bg-red-600 text-white px-1 py-px rounded tracking-widest">
          F1
        </span>
        {isLive && (
          <span className="text-[9px] font-bold text-red-600 dark:text-red-400">
            LIVE
          </span>
        )}
      </div>
      <p className="text-[10px] font-semibold truncate mt-0.5">
        {fixture.awayTeam} GP
      </p>
      <p className="text-[10px] opacity-70 truncate">{fixture.homeTeam}</p>
    </div>
  );
}

/** Full variant used in the daily list view */
export function F1Card({ fixture }: { fixture: Fixture }) {
  const isLive = fixture.status === "live";
  const isFinished = fixture.status === "finished";

  return (
    <div className="rounded-xl border shadow-sm overflow-hidden bg-white dark:bg-slate-900 border-red-200 dark:border-red-900">
      {/* Red accent header bar */}
      <div className="bg-red-600 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-white tracking-[0.2em]">
            FORMULA 1
          </span>
          <span className="text-[10px] text-red-200 font-medium">
            {fixture.competition}
          </span>
        </div>
        {isLive && (
          <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
            LIVE
          </span>
        )}
        {isFinished && (
          <span className="text-[10px] text-red-200">Finished</span>
        )}
        {!isLive && !isFinished && (
          <span className="text-[10px] text-red-200">{fixture.kickoff}</span>
        )}
      </div>

      {/* Card body */}
      <div className="px-4 py-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {fixture.awayTeam} Grand Prix
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {fixture.homeTeam}
        </p>
        {fixture.venue && fixture.venue !== fixture.awayTeam && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {fixture.venue}
          </p>
        )}
      </div>
    </div>
  );
}
