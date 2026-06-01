# Release notes

Tracks every MatchDay deploy. Version in app header/footer = latest tag on GitHub Pages.

Versioning rules + deploy commands: [`docs/RELEASE-PROCESS.md`](docs/RELEASE-PROCESS.md).

---

## Upcoming

<!-- Add bullets per PR merged to main. Promote block to versioned heading on deploy. -->

- New look (preview): rebuilt the experience as a multi-page site — a Home overview with a live-score ticker, "Top events", and today's schedule grouped by competition; per-sport pages (Football / Formula 1 / Cricket) with a competition picker, top fixtures and recent results; competition pages with standings and upcoming matches; and team pages with club records and full squads. You can star matches as favorites. Desktop-only for now; Cricket is a placeholder pending data. Fixtures read from the new v2 data source; standings and squads currently use sample data.

- Internal: scaffolded v2 Supabase schema bindings (`events`, `fb_clubs`, `f1_circuits`, v2 `fb_fixtures` / `f1_fixtures`) and a parallel fetch path gated by `NEXT_PUBLIC_USE_V2_SCHEMA=1`. Default path unchanged — no user-visible behavior yet; flag flip planned once v2 ETL populates rows.

- Fixture row mobile fix: stopped wrapping the meta column below teams (which pushed the group chip + kickoff time to a second row that looked detached). Teams and meta now stay side-by-side at all widths, top-aligned, with the meta column shrinking to fit. Long team names now ellipsis-truncate instead of running under the chip.

- Fixture row alignment: top-align teams column with meta column (group chip + date + time/score) instead of vertically centering, so the chip sits next to the home team instead of the gap between rows.
- Section sub-tab bars (WC2026, PL, La Liga, Serie A, Bundesliga, Ligue 1, ISL, UCL, UEL, IPL, F1) now scroll horizontally on a single row instead of wrapping. Hidden scrollbar; mirrors the Football competition bar behavior.
- Fix `auto-deploy.yml` release step: previous runs (v1.4.0, v1.4.1) deployed to GitHub Pages and created the tags fine, but the GitHub Release creation step shelled to `gh release` without a checkout, so `git`-based repo resolution failed (`fatal: not a git repository`). Now passes `--repo "$REPO"` to every `gh release` call so no working tree is required.
- World Cup 2026 moved to its own route at `/wc26` (previously a sub-tab of Football). New top-level **WC26** group in the Navbar replaces the **Predict** group; the prediction game now lives at `/wc26/prediction` and is reached via a **Prediction** pill on the WC26 sub-tab bar. Football comp bar no longer lists World Cup 2026. Deep-linking works — `next.config` sets `trailingSlash: true` so GitHub Pages serves nested routes (`/wc26/`, `/wc26/prediction/`) on refresh.
- New `auto-deploy.yml` workflow: every PR merge to `main` triggers an automatic patch-bump tag, build, and deploy to GitHub Pages so feature changes are instantly viewable on the live site. Auto-tags are flagged as prereleases (so manual versioned releases keep the **Latest** badge) and use stub release notes. RELEASE.md `## Upcoming` is left untouched — only manual deploys via `cd.yml` lock the block and promote it to a versioned heading.
- F1 tab: removed **News** sub-tab. Default tab remains **Drivers**.
- Teams grid: denser on mobile (≥3 tiles per row instead of 1) with smaller crests. Standings: dropped the **Form** column; mobile now keeps W/D/L visible (hides GF/GA instead).
- Footer mobile (≤520px): **Resources** and **About** now sit side-by-side instead of stacking, with brand + Events still full-width.
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
