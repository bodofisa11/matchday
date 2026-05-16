import type { Fixture } from "../lib/fixtures";
import { COMPETITION_COLORS, CARD_CLASSES } from "../lib/fixtures";

function getCardClass(fixture: Fixture): string {
  const colorKey =
    COMPETITION_COLORS[fixture.competition] ??
    COMPETITION_COLORS[fixture.competitionShort] ??
    "teal";
  return CARD_CLASSES[colorKey] ?? CARD_CLASSES.teal;
}

/** Compact variant used inside the weekly time-grid */
export function FootballCardCompact({ fixture }: { fixture: Fixture }) {
  const cardClass = getCardClass(fixture);
  return (
    <div
      className={`absolute left-0.5 right-0.5 rounded-lg border shadow-sm p-2 ${cardClass}`}
      style={{ top: 2 }}
    >
      <p className="text-[10px] font-medium opacity-85 truncate">
        {fixture.competitionShort}
      </p>
      <p className="text-xs font-semibold truncate mt-0.5">
        {fixture.homeTeam} vs {fixture.awayTeam}
      </p>
      <p className="text-[10px] opacity-80 mt-1">
        {fixture.status === "scheduled" ? (
          fixture.kickoff
        ) : fixture.status === "live" ? (
          <span className="text-red-600 dark:text-red-400 font-semibold">
            LIVE {fixture.homeScore}–{fixture.awayScore}
          </span>
        ) : (
          <span>
            {fixture.homeScore}–{fixture.awayScore} FT
          </span>
        )}
      </p>
    </div>
  );
}

/** Full variant used in the daily list view */
export function FootballCard({ fixture }: { fixture: Fixture }) {
  const cardClass = getCardClass(fixture);
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${cardClass}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide">
        {fixture.competition}
      </p>

      <div className="flex items-center justify-between gap-2 sm:gap-3 mt-3">
        <p className="font-semibold flex-1 min-w-0 text-right leading-tight text-sm sm:text-base break-words">
          {fixture.homeTeam}
        </p>

        <div className="shrink-0 text-center min-w-[48px] sm:min-w-[64px]">
          {fixture.status === "scheduled" ? (
            <span className="text-xs sm:text-sm font-medium">{fixture.kickoff}</span>
          ) : (
            <span className="text-lg sm:text-xl font-bold tabular-nums">
              {fixture.homeScore} – {fixture.awayScore}
            </span>
          )}
          {fixture.status === "live" && (
            <span className="block text-[10px] font-bold text-red-600 dark:text-red-400 mt-0.5">
              LIVE
            </span>
          )}
          {fixture.status === "finished" && (
            <span className="block text-[10px] opacity-60 mt-0.5">FT</span>
          )}
        </div>

        <p className="font-semibold flex-1 min-w-0 text-left leading-tight text-sm sm:text-base break-words">
          {fixture.awayTeam}
        </p>
      </div>

      {fixture.venue && (
        <p className="text-xs opacity-60 mt-3 border-t border-current/10 pt-2">
          {fixture.venue}
        </p>
      )}
    </div>
  );
}
