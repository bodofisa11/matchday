# Release notes

Tracks every MatchDay deploy. Version in app header/footer = latest tag on GitHub Pages.

Versioning rules + deploy commands: [`docs/RELEASE-PROCESS.md`](docs/RELEASE-PROCESS.md).

---

## Upcoming

<!-- Add bullets per PR merged to main. Promote block to versioned heading on deploy. -->

- Crests and competition badges across the app now show **real logos** (sourced from football-logos.cc) instead of colored placeholders. This covers **club crests** (fixtures, standings, home schedule, live bar, team pages), **national-team crests** (World Cup groups, bracket, fixtures), and **competition logos** (the sport-page competition cards and each competition's hero) — including the Champions League, Europa League, the FIFA World Cup, and the top-five domestic leagues. Logos load at a crisp 256px and are cached by the browser for a year, so they appear instantly on repeat views with no extra network requests. Anything without a matching logo falls back to its existing placeholder (initials badge or colored band).

- Each **sport page** (e.g. `/football`) now lists its competitions as a responsive grid of **cards** — a colored header band, the competition name, a short-code tag, country and season, and an "Open →" action — replacing the old horizontal chip rail. The "Top fixtures" and "Recent results" panels have been removed from these pages.

- The season selector is now a **dropdown** placed next to the page title in the hero (previously a row of chips above the tabs), and appears on **every event** — football competition pages, the World Cup, and Formula 1. It shows even when only one season exists (seeded from the competition's own season), and switching re-fetches the data where the fetch layer is season-aware (F1 today).

- The **Formula 1** page now has a **season selector** — chips above the tabs switch between every F1 season seeded in the database (currently 2025 and 2026). Picking a season re-fetches the calendar, driver/constructor standings, and per-round race/sprint results for that year, and updates the hero/calendar labels. Defaults to the live season. The selector is a reusable `SeasonSelector` component driven by `getSeasonsForCompetition` and renders only when more than one season exists, so single-season sections (football, World Cup) stay unchanged until more seasons are seeded and their fetch layer is made season-aware.

- The old daily-list (v1) interface has been retired — the editorial "MATCHDAY" design is now the **only** design and lives at the main URLs. Home (`/`) shows the top events, today's and tomorrow's schedule, and a live bar; each sport has its own page (`/football`, `/f1`, `/cricket`) with per-competition tabs (Overview, Standings, Fixtures, Results, Stats, Teams). The FIFA World Cup (`/world-cup`), the World Cup **Predictions** game (`/predictions`), and a **UFC** page (`/ufc`) are now top-level destinations too. Cricket/IPL, Indian Super League, News, and UFC appear with their full layouts but stay empty until a data source is wired up. A compact-tables toggle in the header shortens long names (e.g. F1 driver codes). The old `/v2/*` and `/wc26` URLs have been removed.

- Both the v1 and `/v2` frontends now read from the new normalized database schema across the board — daily fixtures, league/group standings, fixtures & results, top scorers, club squads, and the full Formula 1 calendar/standings/results. Club crests load from the database when available, falling back to colored-initials placeholders. Local Docker-Postgres support was removed; the app now talks only to Supabase (renders empty states when no data is configured). News and IPL views remain present but empty (no data source in the new schema).

- The `/v2` **Formula 1** page is now a full section (was a placeholder): opens on an **Overview** tab (blank for now), plus **Schedule** (2026 race calendar — tap a completed round for full race/sprint classification), **Drivers** (championship standings), and **Constructors** (team standings). All live data, team colors on each row, matching the v1 F1 layout.

- `/v2` football competition pages now open on a new **Overview** tab (a summary section, blank for now) and the **Standings** tab shows the full live league table — every team with played/won/drawn/lost, goal difference, points, and recent form — instead of placeholder rows.

- The **FIFA World Cup** is now its own top-level tab in the `/v2` navigation (no longer listed under Football), with **Fixtures** (upcoming + recent results), **Groups** (live group standings, qualifiers highlighted), a knockout **Bracket**, and **Teams** — matching the v1 World Cup layout.

- `/v2` football competition pages now have working **Fixtures**, **Results**, **Stats**, and **Teams** tabs (previously only Standings rendered). Fixtures lists upcoming matches from today, Results shows finished matches with scores (both with "Load more" paging), Stats shows the competition's top scorers, and Teams shows every club with crests — tap a club to see its full squad grouped by position. All pull live data, matching the v1 experience.

- Restyled `/v2` home schedule rows: competition headers (Premier League, La Liga, etc.) stay left-aligned, but each match row now centers the kickoff time (or live minute / FT). Home team aligns right of center, away team aligns left of center, so the middle column stays perfectly aligned across all matches. Live and finished matches show scores beside each team's crest with the clock/FT marker in the center.

- Hid the horizontal scrollbar on the `/v2` "Top events" rail and any other horizontal-scroll rows. Section still scrolls horizontally (drag/wheel/touch) — only the visible scrollbar is removed for a cleaner look.

- Refreshed the `/v2` visual design: editorial monospace look swapped for a modern serif-led style. Headlines now use Instrument Serif (mixed case, with italic blue-underlined accent), body text uses Outfit sans, cards have larger rounded corners with soft shadows, pill buttons/chips are bigger and rounder, and Top-event tiles get subtle blue/orange/peach gradient washes. Color palette is anchored on deep blue + warm orange (with soft sky-blue, peach, and cream supporting shades) over a warm paper background. Layout, components, and data flow unchanged.

- Removed the small colored sport dots that prefixed nav tabs, section headers, fixture rows, and footer sport links across `/v2`. Layout is now cleaner; colors still live in cards/badges elsewhere.

- `/v2` mobile navbar is now a classic full-width rectangle sticky bar at the top (was floating rounded pill). Bleeds to the viewport edges, no margin or drop shadow, single bottom border. Logo on the left, ≡ dropdown on the right. Desktop unchanged.

- Reworked the `/v2` mobile navigation: instead of removing the top bar in favor of a corner button, the navbar itself is now a floating pill that stays pinned at the top of the screen. The MATCHDAY logo sits on the left, and a single ≡ button on the right opens a dropdown with all sport tabs, search, and theme toggle. Desktop nav is unchanged.

- `/v2` pages now have a proper footer: MATCHDAY brand block with tagline and GitHub link, plus columns for Sports (links to Football / F1 / Cricket), Resources (GitHub / Releases / Issues), and About. A bottom strip shows the copyright, data-refresh note, and the app version pill. Layout collapses to single-column on phones.

- On phones, the `/v2` top navigation is replaced by a floating menu button in the top-right corner. Tap it to open a dropdown with all nav links, search, and theme toggle. The top nav bar is no longer pinned/fixed on mobile, freeing the full screen for content. Desktop nav is unchanged.

- `/v2` is now responsive on phones and tablets — layout adapts down to small screens, nav tabs scroll, the hero/standings/squad/grids stack and condense, type and component sizes scale for mobile, and the "Top events" rail bleeds to the screen edge so cards aren't clipped.

- `/v2` home "Top events" rail now shows today's actual top matches (live first, then upcoming by kickoff) instead of a static list of competitions. Each card links to its competition page.

- New look (preview) at `/v2`: a multi-page redesign living alongside the current site — the existing pages are untouched. `/v2/home` is an overview with a live-score ticker, "Top events", and today's schedule grouped by competition; per-sport pages (`/v2/football`, `/v2/f1`, `/v2/cricket`) have a competition picker, top fixtures and recent results; competition pages (`/v2/football/premier-league`) show standings and upcoming matches; team pages (`/v2/football/premier-league/arsenal`) show club records and full squads. You can star matches as favorites. `/v2` redirects to `/v2/home`. Desktop-only for now; Cricket is a placeholder pending data. Fixtures read live from the current (v1) database until the v2 schema is provisioned; standings and squads currently use sample data.

- Internal: scaffolded v2 Supabase schema bindings (`events`, `fb_clubs`, `f1_circuits`, v2 `fb_fixtures` / `f1_fixtures`) and a parallel fetch path gated by `NEXT_PUBLIC_USE_V2_SCHEMA=1`. Default path unchanged — no user-visible behavior yet; flag flip planned once v2 ETL populates rows.

- Backend v2 schema support (opt-in via `NEXT_PUBLIC_DB_VERSION=v2`). New query path reads `fb_fixtures` + `f1_fixtures` from the rewritten `public` schema, joining `fb_clubs` for team names and `f1_circuits` for circuit/country, and resolves competition labels via a prefetched `events` cache (`app/lib/events.ts`). Default remains v1 so production behavior is unchanged until the flag flips. No UI changes — `Fixture` shape and daily view rendering are identical.
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
