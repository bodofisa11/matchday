/** Shared presentational primitives for the v2 UI. */
"use client";

import { useState } from "react";
import type { TeamRef } from "@/app/lib/v2/types";
import { competitionLogoUrl, logoUrl } from "@/app/lib/team-logos";

export function SportDot({ sport }: { sport: "foot" | "f1" | "crk" }) {
  return <span className={`wf-dot ${sport}`} />;
}

export function Crest({ team, lg }: { team: TeamRef; lg?: boolean }) {
  const url = logoUrl(team);
  const [failed, setFailed] = useState(false);

  if (url && !failed) {
    return (
      <img
        className={`wf-crest img${lg ? " lg" : ""}`}
        src={url}
        alt={team.name}
        title={team.name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`wf-crest${lg ? " lg" : ""}`}
      style={{ background: team.color }}
      title={team.name}
      aria-hidden
    >
      {team.code}
    </span>
  );
}

/**
 * Real competition logo (league/cup/tournament) from football-logos.cc.
 * `hero` fills the hero placeholder box; `band` sits in the sport-page card
 * band. Falls back to the existing placeholder/empty band on miss or error.
 */
export function CompetitionLogo({
  idOrCode,
  name,
  variant,
}: {
  idOrCode: string;
  name: string;
  variant: "hero" | "band";
}) {
  const url = competitionLogoUrl(idOrCode);
  const [failed, setFailed] = useState(false);
  const showImg = url && !failed;

  if (variant === "hero") {
    return (
      <div className="wf-ph">
        {showImg ? (
          <img
            className="wf-hero-logo"
            src={url}
            alt={name}
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <span>{name}</span>
        )}
      </div>
    );
  }

  return (
    <span className="wf-compcard-band">
      {showImg && (
        <img
          className="wf-compcard-logo"
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

export function FormBadge({ r }: { r: "W" | "D" | "L" }) {
  return <span className={`wf-fbadge ${r.toLowerCase()}`}>{r}</span>;
}

export function TeamCell({ team }: { team: TeamRef }) {
  return (
    <span className="wf-vsteam">
      <Crest team={team} />
      <span className="nm">{team.name}</span>
    </span>
  );
}

/**
 * Season picker — a dropdown. Renders the available seasons (newest first) and
 * stays invisible only when the list is empty, so callers can mount it
 * unconditionally. Single-season competitions still show their one season.
 */
export function SeasonSelector({
  seasons,
  value,
  onChange,
}: {
  seasons: string[];
  value: string;
  onChange: (season: string) => void;
}) {
  if (seasons.length === 0) return null;
  return (
    <div className="wf-select-wrap">
      <select
        className="wf-select"
        aria-label="Season"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {seasons.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <span className="wf-select-caret" aria-hidden>
        ▾
      </span>
    </div>
  );
}
