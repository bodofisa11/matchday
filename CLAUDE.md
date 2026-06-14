# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Release process

**Strict rule:** every PR targeting `main` MUST add a bullet under the `## Upcoming` section of `RELEASE.md` describing the change in user-facing terms. The `release-notes-check` workflow enforces this — PRs without a `RELEASE.md` change fail CI. The only bypass is applying the `no-release-note` label (reserved for pure tooling/docs/CI PRs with no user impact).

Deploys are tag-driven, not push-driven. Pushes to `main` do not deploy. To deploy:

- Prod: `git tag vX.Y.Z && git push origin vX.Y.Z` (e.g. `v1.1.0`).
- Test: `git tag vX.Y.Z-rc.N && git push origin vX.Y.Z-rc.N` from a feature branch (overwrites the Pages URL until next prod tag).

On deploy, rename `## Upcoming` in `RELEASE.md` to `## vX.Y.Z — YYYY-MM-DD` and add a fresh empty `## Upcoming` header at the top. The tag name is embedded into the app at build time via `NEXT_PUBLIC_APP_VERSION` (see [`app/lib/version.ts`](app/lib/version.ts)) and displayed in the Navbar chip and footer.

See [`docs/RELEASE-PROCESS.md`](docs/RELEASE-PROCESS.md) for the full versioning scheme (semver + pre-release naming), workflow rules, and deploy commands. `RELEASE.md` is the user-facing changelog.

## Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build (static export)
npm run lint     # Run ESLint
```

No test suite is configured.

## Environment Variables

Create `.env.local` with:

```
# Supabase — required for dev, static build, and CI
NEXT_PUBLIC_SUPABASE_URL=<supabase project url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase anon key>
```

## Architecture

**Next.js 16 app** (App Router) with React 19, TypeScript, Tailwind CSS v4.

Deployed as a **static export** (`output: "export"`) to GitHub Pages.

### Data flow

**Supabase-only, browser-direct.** Both dev and production query the Supabase
project directly from the browser using the anon key. There is no server, API
route, or local Postgres. When Supabase is unconfigured, fetches return empty
and the UI renders empty states.

The database uses the normalized **Matchday schema** (defined and provisioned
by the sibling `db-postgres-sports-data` repo): an `events` hub table plus
FK-joined `fb_*` / `f1_*` reference, fixture, standings, and results tables.
The frontend resolves an `events` row, then queries the matching table with
PostgREST embedded joins for display names.

There is a **single UI** (the editorial "MATCHDAY" design, `.v2`-scoped CSS) and it lives at the **root routes**. Every page goes through `app/lib/v2/queries.ts`, which funnels into the shared fetch modules (`app/lib/fetch-fixtures-client.ts`, `app/lib/fetch-standings-client.ts`).

Routes (all wrapped in `app/components/v2/V2Shell.tsx`):

- `/` → `HomeView` (top events, today + tomorrow schedule, live bar).
- `/[sport]` → `SportView` (`football` / `f1` / `cricket`; `dynamicParams=false`).
- `/[sport]/[competition]` → `CompetitionView` (sport-aware tabs; football = Overview/Standings/Fixtures/Results/Stats/Teams, cricket swaps Standings → News).
- `/[sport]/[competition]/[team]` → `TeamView` (static dummy profile; no live club source yet).
- `/world-cup` → `WorldCupView` (Fixtures/Groups/Bracket/Teams + Predict link).
- `/predictions` → `PredictSection` (localStorage WC2026 game; styled by the retained v1 CSS slice, wrapped in `.predict-scope`).
- `/ufc` → empty landing (no data source yet).

### Key files

- **`app/lib/events.ts`** — Loads + caches the `events` table; resolves event UUIDs by sport/short_code/season (`getFbEvent`, `getF1Event`). Season constants: `DEFAULT_FB_SEASON`, `DEFAULT_F1_SEASON`, `WC_SEASON`.
- **`app/lib/fetch-fixtures-client.ts`** — Daily fixtures from `fb_fixtures` / `f1_fixtures` (IST date range), mapped to the shared `Fixture` shape.
- **`app/lib/fetch-standings-client.ts`** — Standings, fixtures (paged), teams, squads, scorers, World Cup groups, and all F1 queries. Stable return shapes consumed by `v2/queries.ts`. Dead features (`fetchNews`, `fetchIPLStandings`) return empty.
- **`app/lib/supabase-client.ts`** — Creates Supabase client from env vars (returns `null` if not configured).
- **`app/lib/v2/queries.ts`** — query layer; maps competition slugs → event short codes via `COMP_DB` (unmapped slugs, e.g. ISL/IPL, return empty).
- **`app/lib/v2/dummy.ts`** — static `COMPETITIONS` list + the dummy team profiles backing the `[team]` route.
- **`app/lib/predictions/**`** + **`app/components/predictions/**`** — self-contained WC2026 prediction sub-app (localStorage-backed), kept on its own v1-era styling.
- Other shared util in `app/lib/`: `team-meta.ts`, `team-codes-cache.ts`, `football-terms.ts`, `f1-codes.ts`, `use-team-codes.ts`, `use-compact-tables.ts`.

### Shared types and constants

- **`app/lib/fixtures.ts`** — `Fixture` interface, `COMPETITION_COLORS` map (competition name → color key), `CARD_CLASSES` map (color key → Tailwind classes), and `generateDummyFixtures()` for offline development.

### Theme + compact tables

The single UI owns its own theme. `app/components/v2/V2Shell.tsx` reads/writes the `wf-theme` localStorage key (`"dark"` | `"light"`) via `useSyncExternalStore` and applies a `wf-dark` class on the `.v2` wrapper — no flash, no `<html>` class needed.

`app/layout.tsx` keeps only one pre-paint inline script: it applies `html.compact-tables` from the `compact-tables` localStorage key. The Navbar toggle (`app/lib/use-compact-tables.ts`) flips that class; F1 tables honor it (driver names → 3-letter codes).

### UI components

All under `app/components/v2/`:

- **`V2Shell.tsx`** — root wrapper: `.v2` scope + theme, persistent `Navbar` + `LiveBar` + `Footer`.
- **`Navbar.tsx`** — sticky nav (root-relative tab links, theme + compact toggles, mobile burger menu).
- **`home/HomeView.tsx`**, **`sport/SportView.tsx`**, **`competition/CompetitionView.tsx`** (+ `StandingsPanel`/`FixturesPanel`/`StatsPanel`/`TeamsPanel`), **`f1/F1View.tsx`**, **`worldcup/WorldCupView.tsx`**, **`team/TeamView.tsx`** — the per-route views.
- **`common.tsx`** (`Crest`, `FormBadge`), **`Star.tsx`** — shared bits.

### Database tables (Matchday schema)

Owned by the `db-postgres-sports-data` repo; the frontend reads them via the
Supabase anon key. Key tables and the columns the frontend relies on:

| Table | Columns used |
|---|---|
| `events` | `id`, `sport` (`fb`/`f1`), `competition_name`, `short_code`, `season`, `status` |
| `fb_fixtures` | `id`, `event_id`, `home_team_id`, `away_team_id`, `match_date`, `kickoff_time_utc`, `stadium_name`, `match_type`, `status`, `home_score`, `away_score` |
| `fb_clubs` | `id`, `full_name`, `common_name`, `short_code`, `crest_url`, `founded_year`, `stadium_name`, `head_coach_name`, `manager_name`, `primary_color` |
| `fb_league_club_standings` | `club_id`, `event_id`, `position`, `played`, `wins`, `draws`, `losses`, `goals_for`, `goals_against`, `goal_difference`, `points`, `last5` |
| `fb_group_standings` | same + `group_label` (World Cup groups) |
| `fb_squads` / `fb_players` / `fb_nations` | squad rows joined to player + nation for name/position/DOB/nationality |
| `fb_top_scorers` | `event_id`, `position`, `matches_played`, `goals` + player/club joins |
| `f1_fixtures` | `id`, `event_id`, `circuit_id`, `round`, `start_at`, `end_at`, `status`, `has_sprint` |
| `f1_circuits` / `f1_teams` / `f1_drivers` | reference joins for circuit/team/driver names |
| `f1_driver_standings` / `f1_constructor_standings` | `event_id`, `points`, `wins` + driver/team joins |
| `f1_race_results` | `fixture_id`, `is_sprint`, `position`, `grid`, `points`, `laps_completed`, `total_time`, `status` |

Short codes (events): `PL`, `PD`, `BL1`, `SA`, `FL1`, `CL`, `EL`, `WC` (fb) and `F1` (f1).
Default seasons: fb `2025-26`, F1 `2026`, World Cup `2026`.

`fb_fixtures.status`: `scheduled`/`live`/`finished`/`postponed`/`cancelled`.
`f1_fixtures.status`: `scheduled`/`practice`/`qualifying`/`sprint`/`race`/`completed`/`cancelled`.

### Fixture mapping

Football fixtures: `common_name` → `homeTeam`/`awayTeam`, event `competition_name`/`short_code` → competition labels, `kickoff_time_utc` split to UTC date+time then converted to IST, `stadium_name` → `venue`. F1 fixtures: circuit `name` → `homeTeam`, `country` → `awayTeam`, `start_at` → IST date/time. F1 status: `practice`/`qualifying`/`sprint`/`race` → `live`, `completed`/`cancelled` → `finished`.

### Views

Home shows top events plus today's and tomorrow's schedule grouped by competition. Sport, competition, World Cup, and F1 pages use tabbed sections (standings, fixtures, results, stats, teams). No weekly or monthly calendar views.

### Path alias

`@/*` maps to the repo root (e.g., `@/app/lib/fixtures`).
