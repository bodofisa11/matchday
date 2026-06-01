"use client";

import { DarkModeToggle } from "@/app/components/v1/DarkModeToggle";
import { DataFreshnessBadge } from "@/app/components/v1/DataFreshnessBadge";

function formatDateHeader(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface HeaderBarProps {
  centerDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onRefresh: () => void;
  loading?: boolean;
  lastUpdated?: string | null;
}

export function HeaderBar({
  centerDate,
  onPrev,
  onNext,
  onRefresh,
  loading = false,
  lastUpdated = null,
}: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white hidden sm:inline">
              Sports Calendar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              aria-label="Previous"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {formatDateHeader(centerDate)}
            </span>
            <button
              type="button"
              onClick={onNext}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              aria-label="Next"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DataFreshnessBadge sport="all" />
          <DarkModeToggle />
          <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-medium transition-colors"
          title="Refresh fixtures"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
        </div>
      </div>
      {lastUpdated && (
        <p className="text-[10px] text-slate-500 dark:text-slate-400 px-4 pb-2">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </header>
  );
}
