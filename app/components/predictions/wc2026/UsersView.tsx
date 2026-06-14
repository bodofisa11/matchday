"use client";

import { useEffect, useState } from "react";
import { TeamLogo } from "@/app/components/predictions/TeamLogo";
import { teamColor } from "@/app/lib/team-meta";
import { GROUP_LETTERS } from "@/app/lib/predictions/wc2026-groups";
import { useWc2026Teams } from "@/app/lib/predictions/use-wc2026-teams";
import { getAllPredictions, getLocalIdentity } from "@/app/lib/predictions/predictions-client";
import type { Prediction } from "@/app/lib/predictions/predictions-types";

const ACCENT = "#0066cc";

function UserCard({ p, isMine }: { p: Prediction; isMine: boolean }) {
  const [open, setOpen] = useState(false);
  const { byCode } = useWc2026Teams();
  const filledGroups = GROUP_LETTERS.filter((g) => {
    const v = p.group_picks[g];
    return v && (v[0] || v[1]);
  }).length;
  const filledSemis = p.semifinalists.filter(Boolean).length;
  const filledScorers = p.top_scorers.filter(Boolean).length;
  return (
    <div
      className="card"
      style={{
        padding: "0.85rem 1rem",
        border: isMine ? `1px solid ${ACCENT}` : "1px solid var(--border-subtle)",
        background: isMine ? `${ACCENT}08` : undefined,
      }}
    >
      <div onClick={() => setOpen((v) => !v)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
        <div style={{
          width: "2.2rem", height: "2.2rem", borderRadius: "50%",
          background: ACCENT, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: "0.9rem",
        }}>
          {p.display_name.slice(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.15rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {p.display_name}
            {isMine && (
              <span style={{
                fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: "4px",
                background: ACCENT, color: "#fff",
              }}>YOU</span>
            )}
            {p.ko_picks && (
              <span style={{
                fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: "4px",
                background: "var(--bg-elevated)", color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
              }}>KO ✓</span>
            )}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            {filledGroups}/12 groups · {filledSemis}/4 semis · {filledScorers}/2 scorers
            {p.champion_pick ? ` · Champion: ${byCode(p.champion_pick)}` : p.champion ? ` · KO champion: ${byCode(p.champion)}` : ""}
          </div>
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{open ? "▾" : "▸"}</div>
      </div>

      {open && (
        <div style={{ marginTop: "0.85rem", paddingTop: "0.85rem", borderTop: "1px solid var(--border-subtle)" }}>
          {(p.champion_pick || p.champion) && (
            <>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                Champion pick
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.9rem" }}>
                {p.champion_pick && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.3rem 0.6rem",
                    background: `${ACCENT}18`,
                    border: `1px solid ${ACCENT}`,
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                  }}>
                    <span>🏆</span>
                    <TeamLogo code={p.champion_pick} sport="football" leagueCode="wc2026" color={teamColor(p.champion_pick)} size={16} />
                    {byCode(p.champion_pick)}
                    <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 600 }}>Phase 1</span>
                  </div>
                )}
                {p.champion && p.champion !== p.champion_pick && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.3rem 0.6rem",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                  }}>
                    <span>🥇</span>
                    <TeamLogo code={p.champion} sport="football" leagueCode="wc2026" color={teamColor(p.champion)} size={16} />
                    {byCode(p.champion)}
                    <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 600 }}>KO</span>
                  </div>
                )}
              </div>
            </>
          )}
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            Groups
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.5rem", marginBottom: "0.9rem", fontSize: "0.72rem" }}>
            {GROUP_LETTERS.map((g) => {
              const picks = p.group_picks[g];
              if (!picks) return null;
              return (
                <div key={g}>
                  <strong style={{ color: ACCENT }}>{g}:</strong>{" "}
                  {picks.filter(Boolean).map((c, i) => <span key={c + i} style={{ marginRight: "0.25rem" }}>{i + 1}.{c}</span>)}
                </div>
              );
            })}
          </div>

          {p.semifinalists.some(Boolean) && (
            <>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                Semifinalists
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.8rem" }}>
                {p.semifinalists.filter(Boolean).map((code) => (
                  <div key={code} style={{
                    display: "flex", alignItems: "center", gap: "0.3rem",
                    padding: "0.2rem 0.5rem", background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)", borderRadius: "5px", fontSize: "0.74rem",
                  }}>
                    <TeamLogo code={code} sport="football" leagueCode="wc2026" color={teamColor(code)} size={14} />
                    {byCode(code)}
                  </div>
                ))}
              </div>
            </>
          )}

          {p.top_scorers.some(Boolean) && (
            <>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                Top scorers
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                {p.top_scorers.filter(Boolean).join(" · ")}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function UsersView() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getAllPredictions().then((p) => {
      setPredictions(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>Loading…</div>;
  }

  const myId = getLocalIdentity()?.id ?? null;
  const filtered = query.trim()
    ? predictions.filter((p) => p.display_name.toLowerCase().includes(query.trim().toLowerCase()))
    : predictions;

  return (
    <div className="fade-in fd2">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users…"
          style={{
            flex: 1, minWidth: "200px", maxWidth: "320px",
            padding: "0.5rem 0.7rem",
            border: "1px solid var(--border-subtle)", borderRadius: "6px",
            background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "0.85rem",
          }}
        />
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {filtered.length} of {predictions.length} users
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
          No users match.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {filtered.map((p) => (
            <UserCard key={p.id} p={p} isMine={p.id === myId} />
          ))}
        </div>
      )}
    </div>
  );
}
