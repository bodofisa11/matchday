"use client";

import { useEffect, useState } from "react";
import {
  getWcFixtures,
  getWcKnockout,
  type FootballFixtureRow,
} from "@/app/lib/v2/queries";
import { buildWinnerLookup, generateDemoBracket } from "@/app/lib/v2/wc-bracket";
import { Breadcrumbs } from "../Breadcrumbs";
import { BracketTree } from "./BracketTree";

export function BracketPageView() {
  const [fixtures, setFixtures] = useState<FootballFixtureRow[]>([]);
  const [winners, setWinners] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // `?demo=1` renders a sample completed bracket for offline development.
    const isDemo =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");
    const load = isDemo
      ? Promise.resolve(generateDemoBracket())
      : Promise.all([getWcFixtures(), getWcKnockout()]).then(([fx, ko]) => ({
          fixtures: fx,
          winners: buildWinnerLookup(ko),
        }));
    load.then((d) => {
      if (cancelled) return;
      setFixtures(d.fixtures);
      setWinners(d.winners);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Breadcrumbs
        items={[{ label: "FIFA World Cup", href: "/world-cup/" }, { label: "Bracket" }]}
      />

      <section className="wf-hero">
        <div className="wf-col wf-gap12">
          <div className="wf-center wf-gap8">
            <span className="wf-dot foot" />
            <span className="wf-eyebrow">Knockout stage · 2026</span>
          </div>
          <h1 className="wf-h1">World Cup bracket</h1>
          <span className="wf-mono-sm wf-muted">
            Round of 32 → Final · winners advance left to right
          </span>
        </div>
        <div className="wf-ph">bracket</div>
      </section>

      {loading ? (
        <div className="wf-empty">Loading…</div>
      ) : (
        <BracketTree fixtures={fixtures} winners={winners} />
      )}
    </>
  );
}
