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
# Local dev (Docker Postgres)
DATABASE_URL=postgresql://sports:sports@localhost:5432/sports_calendar

# Production (Supabase) — required for static build and CI
NEXT_PUBLIC_SUPABASE_URL=<supabase project url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase anon key>
```

## Architecture

**Next.js 16 app** (App Router) with React 19, TypeScript, Tailwind CSS v4, Drizzle ORM.

Deployed as a **static export** (`output: "export"`) to GitHub Pages.

### Data flow

#### Production (GitHub Pages — static)
- **`app/page.tsx`** calls `fetchFixturesClient()` from `app/lib/fetch-fixtures-client.ts`
- `fetch-fixtures-client.ts` detects `NODE_ENV === "production"` and queries Supabase directly from the browser using the anon key
- No server or API routes involved

#### Local development
- **`app/page.tsx`** calls `fetchFixturesClient()` which falls back to `GET /api/fixtures?sport=<id>`
- **`app/api/fixtures/route.ts`** — GET endpoint that delegates to `fetchFixtures()`
- **`app/lib/fetch-fixtures.ts`** — reads from **local Docker Postgres** via Drizzle ORM

### Key files

- **`app/lib/fetch-fixtures-client.ts`** — Browser-safe fetch entry point. Production: Supabase direct. Dev: API route proxy.
- **`app/lib/fetch-fixtures.ts`** — Server-only. Used by the local dev API route. Reads from Docker Postgres via Drizzle.
- **`app/lib/db-schema.ts`** — Drizzle schema for `football_fixtures` and `f1_fixtures` tables.
- **`app/lib/supabase-client.ts`** — Creates Supabase client from env vars (returns `null` if not configured).
- **`app/lib/postgres-client.ts`** — Singleton `pg.Pool` for local dev; returns `null` outside development.

### Shared types and constants

- **`app/lib/fixtures.ts`** — `Fixture` interface, `COMPETITION_COLORS` map (competition name → color key), `CARD_CLASSES` map (color key → Tailwind classes), and `generateDummyFixtures()` for offline development.

### Dark mode

Class-based dark mode (`dark` class on `<html>`). Tailwind v4 variant configured via `@variant dark (&:is(.dark *))` in `globals.css`.

- **`app/layout.tsx`** — Inline script runs before paint to apply `dark` class from `localStorage` (or `prefers-color-scheme` fallback), preventing flash-of-wrong-theme. `<html>` has `suppressHydrationWarning`.
- **`app/components/DarkModeToggle.tsx`** — Toggle button rendered in `HeaderBar`. Uses `useSyncExternalStore` + `MutationObserver` to watch `<html>` class — no `setState` in effects, no hydration errors. Persists preference to `localStorage`.

### UI components

- **`app/components/HeaderBar.tsx`** — Sticky header with date navigation (prev/next day), dark mode toggle, and refresh button. Props: `centerDate`, `onPrev`, `onNext`, `onRefresh`, `loading`, `lastUpdated`.
- **`app/components/DarkModeToggle.tsx`** — Self-contained dark/light mode toggle (moon/sun icon). Reads and writes `localStorage` key `theme` (`"dark"` | `"light"`).
- **`app/components/SportSelector.tsx`** — Centered pill-button filter bar for "All sports", "Football", "F1".
- **`app/components/FootballCard.tsx`** — Football fixture card (full + compact variants).
- **`app/components/F1Card.tsx`** — F1 fixture card (full + compact variants).

### Database tables

Both local Docker Postgres and Supabase use the same two-table schema:

| Table | Columns |
|---|---|
| `football_fixtures` | `id`, `home_team`, `away_team`, `competition`, `competition_short`, `kickoff`, `date`, `venue`, `status`, `home_score`, `away_score` |
| `f1_fixtures` | `id`, `round`, `circuit`, `country`, `date`, `status` |

F1 status values: `scheduled` / `practice` / `qualifying` / `race` / `completed` / `cancelled`
Football status values: `scheduled` / `live` / `finished`

### F1 fixture mapping

F1 rows are mapped to the `Fixture` interface with `circuit` as `homeTeam`, `country` as `awayTeam`, and a fixed `14:00` kickoff. Status mapping: `practice/qualifying/race` → `live`, `completed/cancelled` → `finished`.

### View

Single **daily** view — list of match cards for the selected date, sorted by kickoff time. No weekly or monthly views.

### Path alias

`@/*` maps to the repo root (e.g., `@/app/lib/fixtures`).
