# Release notes

Tracks every MatchDay deploy. Version in app header/footer = latest tag on GitHub Pages.

Versioning rules + deploy commands: [`docs/RELEASE-PROCESS.md`](docs/RELEASE-PROCESS.md).

---

## Upcoming

<!-- Add bullets per PR merged to main. Promote block to versioned heading on deploy. -->

- **Predict** tab now loads WC2026 teams from the same Supabase source (`wc_group_standings`) as the Football → WC2026 section, so group/semifinalist/champion pickers always show the real teams instead of the placeholder draw. Falls back to the static list if the DB hasn't seeded yet.
- New top-level **Predict** tab (Navbar, beside UFC). Public no-login WC2026 prediction game, 4 sub-sections: **Feed** (post field placeholder), **Predictions** (Phase 1: partial picks for group standings 1–4 across 12 groups, ≤4 semifinalists, ≤2 top scorers; Phase 2: KO bracket → champion, opens after groups finish), **Leaderboard** (points DESC, tie-break = earliest submit), **Users** (browse + search picks). Identity in `localStorage`. Ships frontend + localStorage dummy; Supabase wiring next PR.
- Split release docs: versioning/workflow/deploy moved from `RELEASE.md` → `docs/RELEASE-PROCESS.md`. `RELEASE.md` now changelog-only. Removed `CHANGELOG.md` + stale `docs/RELEASES.md`.
- Modern multi-column footer: brand + Sports/Resources/About columns, GitHub button, bottom bar with auto year + version pill. Responsive 4-col → 2-col (≤900px) → 1-col (≤520px).
- Football standings full stats: P/W/D/L/GF/GA/GD/Form/Pts. Form = colored W/D/L pills (newest right). Mobile keeps #/Team/P/GD/Form/Pts; compact collapses form to dots + hides W/D/L/GF/GA at all widths.
- Shared `<LeagueStandingsTable />` across all football comps (PL, La Liga, Serie A, Bundesliga, Ligue 1, ISL, UEL, WC2026 groups) for identical columns. WC2026 still highlights top 2.
- Cricket (IPL) standings: added T (tied) + NR (no-result) alongside P/W/L/NRR/Pts.
- F1 Constructors: Code (3-letter FIA) + Wins columns, team color stripe, compact collapses name → code. New `app/lib/f1-codes.ts` maps drivers/constructors to FIA abbrevs (VER, HAM, RBR, MER…).
- F1 Drivers: wins shown next to points; compact mode shows 3-letter code instead of last name.
- CD workflow creates/updates GitHub Release per tag push, pulling notes from matching `## vX.Y.Z` section. Pre-release tags (`-rc.N`, `-beta.N`, `-alpha.N`) flagged prerelease. Prod tag only claims **Latest** when commit reachable from `origin/main` — feature-branch tags deploy + release but never overwrite Latest.
- CD `workflow_dispatch` exposes **bump selector** (major/minor/patch) + **pre-release channel** (none/rc/beta/alpha) instead of free-form version. New `compute-version` job reads latest tag + computes next semver (auto-increments pre-release counter). Removes wrong-label foot-gun.
- CD now **runs build/deploy/release in same dispatch run** instead of relying on tag-push re-entry. Actions skips workflow triggers for `GITHUB_TOKEN`-created refs (anti-recursion) — earlier dispatches tagged but skipped deploy. Build/deploy/release jobs gate on `event_name == 'push'` OR successful dispatch pipeline.
- CD `workflow_dispatch` path now **tag-last**: compute version + capture HEAD SHA → build at SHA → deploy to Pages → ONLY THEN create tag (at captured SHA) + publish Release. Failed build/deploy aborts before tag exists — no orphan tags on broken commits. Tag-push entry skips tag job (tag already exists).

---

## v1.2.0 — 2026-05-18

First tag-driven prod deploy. Bundles release tooling + mobile standings overhaul.

**Release tooling**

- Tag-driven deploys. `main` no longer auto-deploys; deploys only on `v*` tag push (or manual `workflow_dispatch`).
- Semver tags: prod `vX.Y.Z`; feature-branch test `vX.Y.Z-rc.N` / `-beta.N` / `-alpha.N` (overwrite same Pages URL).
- Version badge in Navbar chip + footer, embedded at build via `NEXT_PUBLIC_APP_VERSION`.
- `RELEASE.md` = single source of truth, with rolling `## Upcoming` block.
- `release-notes-check` workflow fails PRs missing `RELEASE.md` update (bypass: `no-release-note` label).
- PR template + CLAUDE.md rules enforce process.
- Removed legacy `CHANGELOG.md` + `docs/RELEASES.md`.

**Mobile UX**

- Small-phone standings keep `#`/Team/`P`/`GD`/`Pts`; only W/D/L hidden ≤480px (previously P/W/D/L/GD/Pts all dropped).
- New compact-tables Navbar toggle (`···` / `ABC`): globally collapses team names → TLA, tightens row padding, drops W/D/L at all widths, switches Teams tab to dense TLA tile grid. localStorage-persisted + pre-paint applied (no flicker).
- Shared `<TeamName />` across all league standings + Top Scorers Team column.

---

## v1.0.0 — 2026-05-18

Initial prod release. MatchDay snapshot.

**Sports & competitions**

- Football: Premier League, UCL, Europa League, La Liga, Serie A, Bundesliga, Ligue 1, ISL, FIFA World Cup 2026.
- Formula 1: full 2026 season.
- Cricket: IPL 2026.

**Features**

- Daily fixtures view + per-comp sections (Fixtures/Standings/Teams/Stats tabs as applicable).
- WC2026 section: Fixtures (Upcoming + Results), Groups, Bracket, Teams (squads inline).
- Team detail panel: crest, coach, colours, squad by position.
- F1 race weekend cards.
- Dark/light theme toggle (persisted).
- Data freshness badge.
- Static export → GitHub Pages, data direct from Supabase.
