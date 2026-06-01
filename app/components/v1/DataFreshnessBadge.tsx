"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchLastUpdated, type SportId } from "@/app/lib/v1/fetch-fixtures-client";

type Status = "fresh" | "stale" | "old" | "unknown";

interface DataFreshnessBadgeProps {
  sport?: SportId;
}

const TRIGGER_URL = process.env.NEXT_PUBLIC_TRIGGER_UPDATE_URL ?? "";

function classifyAge(updatedAt: string | null): { status: Status; label: string } {
  if (!updatedAt) return { status: "unknown", label: "no data" };
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  const hours = ageMs / 3_600_000;
  let status: Status = "fresh";
  if (hours >= 24) status = "old";
  else if (hours >= 12) status = "stale";

  if (hours < 1) {
    const m = Math.max(1, Math.round(ageMs / 60_000));
    return { status, label: `Updated ${m}m ago` };
  }
  if (hours < 24) {
    return { status, label: `Updated ${Math.round(hours)}h ago` };
  }
  return { status, label: `Updated ${Math.round(hours / 24)}d ago` };
}

const dotColor: Record<Status, string> = {
  fresh: "bg-emerald-500",
  stale: "bg-amber-500",
  old: "bg-red-500",
  unknown: "bg-slate-400",
};

export function DataFreshnessBadge({ sport = "all" }: DataFreshnessBadgeProps) {
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [triggerSport, setTriggerSport] = useState<"f1" | "football" | "cricket" | "all">("f1");
  const [round, setRound] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshTimestamp = useCallback(async () => {
    const ts = await fetchLastUpdated(sport);
    setUpdatedAt(ts);
  }, [sport]);

  useEffect(() => {
    void refreshTimestamp();
    const id = setInterval(refreshTimestamp, 60_000);
    return () => clearInterval(id);
  }, [refreshTimestamp]);

  const { status, label } = classifyAge(updatedAt);

  async function triggerUpdate() {
    if (!TRIGGER_URL) {
      setMessage("NEXT_PUBLIC_TRIGGER_UPDATE_URL not configured.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const body: Record<string, unknown> = { sport: triggerSport };
      if (triggerSport === "f1" && round.trim()) body.round = Number(round);
      if (triggerSport === "all") body.all = true;

      const res = await fetch(TRIGGER_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      setMessage("Update queued. Check back in ~1 minute.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to trigger update.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Data freshness"
      >
        <span className={`w-2 h-2 rounded-full ${dotColor[status]}`} />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-3 z-30">
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{label}</p>
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
            Sport
          </label>
          <select
            value={triggerSport}
            onChange={(e) => setTriggerSport(e.target.value as typeof triggerSport)}
            className="w-full mb-2 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          >
            <option value="f1">F1</option>
            <option value="football">Football</option>
            <option value="cricket">Cricket</option>
            <option value="all">All sports</option>
          </select>
          {triggerSport === "f1" && (
            <>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Round (optional)
              </label>
              <input
                value={round}
                onChange={(e) => setRound(e.target.value)}
                placeholder="e.g. 6"
                inputMode="numeric"
                className="w-full mb-2 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </>
          )}
          <button
            type="button"
            onClick={triggerUpdate}
            disabled={submitting}
            className="w-full px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-medium"
          >
            {submitting ? "Queuing…" : "Run update now"}
          </button>
          {message && (
            <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}
