"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCompetitionTeamDetails,
  teamHref,
  type FootballTeamDetailRow,
} from "@/app/lib/v2/queries";
import { TeamCrest } from "../team/TeamProfileCard";

export function TeamsPanel({ competitionSlug }: { competitionSlug: string }) {
  const [teams, setTeams] = useState<FootballTeamDetailRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [prevKey, setPrevKey] = useState(competitionSlug);
  if (prevKey !== competitionSlug) {
    setPrevKey(competitionSlug);
    setTeams([]);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    getCompetitionTeamDetails(competitionSlug).then((data) => {
      if (cancelled) return;
      setTeams(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [competitionSlug]);

  return (
    <div className="wf-col wf-gap12">
      <div className="wf-shead" style={{ marginBottom: 0 }}>
        <span className="wf-h3">Teams</span>
        {!loading && teams.length > 0 && (
          <span className="wf-mono-sm wf-muted">{teams.length} teams</span>
        )}
      </div>
      {loading ? (
        <div className="wf-empty">Loading…</div>
      ) : teams.length === 0 ? (
        <div className="wf-empty">No team data yet.</div>
      ) : (
        <div className="wf-teamgrid">
          {teams.map((t) => (
            <Link
              key={t.id}
              href={teamHref(competitionSlug, t.name)}
              className="wf-teamcard"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <TeamCrest team={t} />
              <span className="wf-teamcard-nm">{t.short_name ?? t.name}</span>
              {t.tla && <span className="wf-mono-sm wf-muted">{t.tla}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
