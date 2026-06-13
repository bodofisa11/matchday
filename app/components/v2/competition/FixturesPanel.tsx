"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCompetitionFixtures,
  teamRefFromName,
  type FootballFixtureRow,
} from "@/app/lib/v2/queries";
import { formatFixtureDate } from "@/app/lib/v1/team-meta";
import { istTodayStr } from "@/app/lib/timezone";
import { Crest } from "../common";

type Mode = "upcoming" | "results";

const PAGE_SIZE = 12;

function Teams({ r }: { r: FootballFixtureRow }) {
  const home = teamRefFromName(r.home_team);
  const away = teamRefFromName(r.away_team);
  return (
    <div className="wf-col wf-gap6" style={{ minWidth: 0 }}>
      <span className="wf-center wf-gap8" style={{ minWidth: 0 }}>
        <Crest team={home} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {r.home_team}
        </span>
      </span>
      <span className="wf-center wf-gap8" style={{ minWidth: 0 }}>
        <Crest team={away} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {r.away_team}
        </span>
      </span>
    </div>
  );
}

function FixtureRow({ r }: { r: FootballFixtureRow }) {
  return (
    <div className="wf-trow" style={{ gridTemplateColumns: "64px 1fr auto" }}>
      <span className="wf-mono-sm wf-muted">{formatFixtureDate(r.date)}</span>
      <Teams r={r} />
      <span className="wf-col" style={{ alignItems: "flex-end", gap: 2 }}>
        <span className="wf-mono-sm" style={{ fontWeight: 600 }}>{r.kickoff}</span>
        {r.venue && (
          <span className="wf-muted" style={{ fontSize: 11, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
            {r.venue}
          </span>
        )}
      </span>
    </div>
  );
}

function ResultRow({ r }: { r: FootballFixtureRow }) {
  return (
    <div className="wf-trow" style={{ gridTemplateColumns: "64px 1fr auto" }}>
      <span className="wf-mono-sm wf-muted">{formatFixtureDate(r.date)}</span>
      <Teams r={r} />
      <span className="wf-center wf-gap8">
        <span className="wf-score">{r.home_score ?? "–"}</span>
        <span className="wf-muted">:</span>
        <span className="wf-score">{r.away_score ?? "–"}</span>
      </span>
    </div>
  );
}

export function FixturesPanel({
  competitionSlug,
  mode,
}: {
  competitionSlug: string;
  mode: Mode;
}) {
  const status = mode === "upcoming" ? "scheduled" : "finished";
  const fromDate = mode === "upcoming" ? istTodayStr() : undefined;

  const [rows, setRows] = useState<FootballFixtureRow[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reset during render when the competition/mode changes (avoids a sync
  // setState inside the effect, which triggers cascading renders).
  const key = `${competitionSlug}|${status}`;
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setRows([]);
    setPage(0);
    setHasMore(false);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    getCompetitionFixtures(competitionSlug, status, 0, PAGE_SIZE, fromDate).then((res) => {
      if (cancelled) return;
      setRows(res.rows);
      setHasMore(res.hasMore);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [competitionSlug, status, fromDate]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    const next = page + 1;
    const res = await getCompetitionFixtures(competitionSlug, status, next, PAGE_SIZE, fromDate);
    setRows((prev) => [...prev, ...res.rows]);
    setPage(next);
    setHasMore(res.hasMore);
    setLoadingMore(false);
  }, [competitionSlug, status, fromDate, page]);

  const title = mode === "upcoming" ? "Fixtures" : "Results";
  const note = mode === "upcoming" ? "Upcoming · today first" : "Newest first";

  return (
    <div className="wf-box wf-pad">
      <div className="wf-shead">
        <span className="wf-h3">{title}</span>
        <span className="wf-mono-sm wf-muted">{note}</span>
      </div>
      {loading ? (
        <div className="wf-empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="wf-empty">
          {mode === "upcoming" ? "No upcoming fixtures." : "No results yet this season."}
        </div>
      ) : (
        <>
          <div>
            {rows.map((r) =>
              mode === "upcoming" ? <FixtureRow key={r.id} r={r} /> : <ResultRow key={r.id} r={r} />,
            )}
          </div>
          {hasMore && (
            <button className="wf-loadmore" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
