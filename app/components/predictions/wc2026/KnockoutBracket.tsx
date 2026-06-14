"use client";

import { TeamLogo } from "@/app/components/predictions/TeamLogo";
import { teamColor } from "@/app/lib/team-meta";
import { useWc2026Teams } from "@/app/lib/predictions/use-wc2026-teams";
import { KO_BRACKET, KO_ROUND_LABEL, type KoMatchSlot } from "@/app/lib/predictions/wc2026-ko-bracket";
import type { KoPicks } from "@/app/lib/predictions/predictions-types";

const ACCENT = "#0066cc";

interface Props {
  /**
   * Seed map: bracket slot label (eg "A1") → actual team code from group results.
   * When a slot has no team yet (groups not finished), pass `{}` for an empty
   * read-only frame.
   */
  seeds: Record<string, string>;
  value: KoPicks;
  onChange: (next: KoPicks) => void;
  readOnly?: boolean;
}

function resolveTeam(slotRef: string, seeds: Record<string, string>, picks: KoPicks): string | null {
  // If it's a match id, the team is the winner pick
  if (slotRef.startsWith("r32_") || slotRef.startsWith("r16_") || slotRef.startsWith("qf_") || slotRef.startsWith("sf_")) {
    return picks[slotRef] ?? null;
  }
  return seeds[slotRef] ?? null;
}

function MatchCard({
  match,
  seeds,
  picks,
  onPick,
  readOnly,
}: {
  match: KoMatchSlot;
  seeds: Record<string, string>;
  picks: KoPicks;
  onPick: (matchId: string, winner: string) => void;
  readOnly?: boolean;
}) {
  const { byCode } = useWc2026Teams();
  const top = resolveTeam(match.top, seeds, picks);
  const bot = resolveTeam(match.bot, seeds, picks);
  const winner = picks[match.id];

  function row(code: string | null, slotLabel: string) {
    const isWinner = code != null && winner === code;
    return (
      <button
        type="button"
        disabled={readOnly || !code}
        onClick={() => code && onPick(match.id, code)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.35rem 0.5rem",
          width: "100%",
          background: isWinner ? `${ACCENT}22` : "transparent",
          border: `1px solid ${isWinner ? ACCENT : "var(--border-subtle)"}`,
          borderRadius: "5px",
          fontSize: "0.78rem",
          color: code ? "var(--text-primary)" : "var(--text-muted)",
          fontWeight: isWinner ? 700 : 500,
          cursor: !code || readOnly ? "not-allowed" : "pointer",
          textAlign: "left",
        }}
      >
        {code ? (
          <>
            <TeamLogo code={code} sport="football" leagueCode="wc2026" color={teamColor(code)} size={16} />
            <span style={{ flex: 1 }}>{byCode(code)}</span>
          </>
        ) : (
          <span style={{ fontStyle: "italic" }}>{slotLabel}</span>
        )}
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.3rem",
        padding: "0.45rem",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "7px",
        minWidth: "190px",
      }}
    >
      {row(top, match.top)}
      {row(bot, match.bot)}
    </div>
  );
}

export function KnockoutBracket({ seeds, value, onChange, readOnly }: Props) {
  function pick(matchId: string, winner: string) {
    // Picking a new winner upstream should clear any downstream picks that
    // depended on the old winner. Simple approach: clear all downstream matches.
    const next: KoPicks = { ...value, [matchId]: winner };
    // Find downstream chain
    const downstream = new Set<string>();
    function markDownstream(id: string) {
      for (const m of KO_BRACKET) {
        if (m.top === id || m.bot === id) {
          if (!downstream.has(m.id)) {
            downstream.add(m.id);
            markDownstream(m.id);
          }
        }
      }
    }
    markDownstream(matchId);
    for (const d of downstream) delete next[d];
    onChange(next);
  }

  const rounds: Array<KoMatchSlot["round"]> = ["r32", "r16", "qf", "sf", "final"];

  return (
    <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
      {rounds.map((r) => {
        const matches = KO_BRACKET.filter((m) => m.round === r);
        return (
          <div key={r} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "210px" }}>
            <div style={{
              fontWeight: 700,
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: ACCENT,
              padding: "0.2rem 0",
            }}>
              {KO_ROUND_LABEL[r]}
            </div>
            {matches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                seeds={seeds}
                picks={value}
                onPick={pick}
                readOnly={readOnly}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
