"use client";

import Link from "next/link";
import { getCompetitions } from "@/app/lib/v2/queries";
import { SPORTS } from "@/app/lib/v2/types";
import type { SportSlug } from "@/app/lib/v2/types";
import { Breadcrumbs } from "../Breadcrumbs";
import { CompetitionLogo } from "../common";
import { F1View } from "../f1/F1View";

export function SportView({ sport }: { sport: SportSlug }) {
  const meta = SPORTS.find((s) => s.slug === sport)!;
  const comps = getCompetitions(sport);

  if (sport === "f1") {
    return <F1View />;
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: meta.label }]} />

      <section className="wf-section">
        <div className="wf-center wf-gap8">
          <span className={`wf-dot ${meta.dot}`} />
          <span className="wf-h3">{meta.label}</span>
        </div>
      </section>

      <section className="wf-section" style={{ paddingTop: 0 }}>
        <span className="wf-eyebrow">Competitions</span>
        {comps.length === 0 ? (
          <div className="wf-empty" style={{ marginTop: 14 }}>
            No competitions yet.
          </div>
        ) : (
          <div className="wf-cardgrid" style={{ marginTop: 14 }}>
            {comps.map((c) => (
              <Link key={c.slug} href={`/${sport}/${c.slug}`} className="wf-compcard">
                <CompetitionLogo idOrCode={c.slug} name={c.name} variant="band" />
                <div className="wf-compcard-body">
                  <div className="wf-between wf-gap8">
                    <span className="wf-evtitle">{c.name}</span>
                    <span className="wf-tag">{c.shortName}</span>
                  </div>
                  <div className="wf-compcard-meta">
                    <span>{c.country}</span>
                    <span>{c.season}</span>
                  </div>
                  <span className="wf-compcard-action">Open →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
