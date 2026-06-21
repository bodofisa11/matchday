"use client";

import { useEffect, useState } from "react";
import {
  getCompetition,
  getCompetitionTeamBySlug,
  type FootballTeamDetailRow,
} from "@/app/lib/v2/queries";
import { Breadcrumbs, type Crumb } from "../Breadcrumbs";
import { TeamProfileCard } from "./TeamProfileCard";

const SPORT_LABEL: Record<string, string> = {
  football: "Football",
  cricket: "Cricket",
  f1: "Formula 1",
};

export function TeamView({
  sport,
  competitionSlug,
  teamSlug,
}: {
  sport: string;
  competitionSlug: string;
  teamSlug: string;
}) {
  const [team, setTeam] = useState<FootballTeamDetailRow | null>(null);
  const [loading, setLoading] = useState(true);

  // Reset during render when the target changes (avoids sync setState in effect).
  const key = `${competitionSlug}|${teamSlug}`;
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setTeam(null);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    getCompetitionTeamBySlug(competitionSlug, teamSlug).then((t) => {
      if (cancelled) return;
      setTeam(t);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [competitionSlug, teamSlug]);

  const isWc = competitionSlug === "world-cup";
  const comp = getCompetition(competitionSlug);
  const crumbs: Crumb[] = isWc
    ? [
        { label: "Home", href: "/" },
        { label: "FIFA World Cup", href: "/world-cup/" },
        { label: team?.name ?? "Team" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: SPORT_LABEL[sport] ?? sport, href: `/${sport}/` },
        { label: comp?.name ?? competitionSlug, href: `/${sport}/${competitionSlug}/` },
        { label: team?.name ?? "Team" },
      ];

  return (
    <section className="wf-section">
      <Breadcrumbs items={crumbs} />
      {loading ? (
        <div className="wf-empty">Loading team…</div>
      ) : !team ? (
        <div className="wf-empty">Team not found.</div>
      ) : (
        <TeamProfileCard team={team} />
      )}
    </section>
  );
}
