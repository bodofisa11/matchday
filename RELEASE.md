# Release notes

This file tracks every deployment of MatchDay. The version displayed in the app
header and footer matches the latest tag deployed to GitHub Pages.

## Versioning

We use [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`:

- **MAJOR** (`v2.0.0`) — breaking UX/data changes, new core architecture, removed competitions/sports.
- **MINOR** (`v1.1.0`) — new feature, new competition, new tab/section, additive change.
- **PATCH** (`v1.0.1`) — bug fix, copy tweak, styling fix, dependency bump.

Pre-release builds (test deploys from feature branches before prod):

- `v1.1.0-rc.1`, `v1.1.0-rc.2` — release candidates (final stabilization).
- `v1.1.0-beta.1` — broader test build (multiple features bundled, may be unstable).
- `v1.1.0-alpha.1` — early test build (work-in-progress).

Pre-release tags deploy to the same GitHub Pages URL and overwrite prod
temporarily. Re-tag with the prod version (`v1.1.0`) when ready to lock.

## Workflow rules

1. **No auto-deploy on merge.** Pushes to `main` do NOT deploy. Deploys are
   triggered exclusively by pushing a `v*` tag (or via the Actions tab).
2. **Every PR to `main` must update this file** under `## Upcoming`. Enforced by
   the `release-notes-check` workflow. Bypass with the `no-release-note` label
   only for pure tooling/docs PRs.
3. **Bundle features before deploying.** Merge several PRs to `main`, each
   adding bullets under `## Upcoming`, then tag once when the batch is ready.
4. **On deploy:** rename `## Upcoming` to `## vX.Y.Z — YYYY-MM-DD`, then add a
   fresh empty `## Upcoming` header at the top.

## How to deploy

```bash
# Prod deploy
git checkout main
git pull
git tag v1.1.0
git push origin v1.1.0

# Test deploy from a feature branch
git checkout feat/my-thing
git tag v1.1.0-rc.1
git push origin v1.1.0-rc.1
```

The workflow reads the tag name, embeds it as `NEXT_PUBLIC_APP_VERSION`, builds,
and publishes to GitHub Pages. Tag also acts as the permanent git marker.

---

## Upcoming

<!-- Add bullets here for every PR merged to main. Promote this block to a
     versioned heading on deploy. -->

- Football standings now show full stats: P / W / D / L / GF / GA / GD / Form / Pts. Recent form rendered as colored W/D/L pills (newest on the right). Mobile keeps #, Team, P, GD, Form, Pts; compact mode collapses form pills to dots and hides W/D/L/GF/GA at all widths.
- Extracted shared `<LeagueStandingsTable />` so every football competition (PL, La Liga, Serie A, Bundesliga, Ligue 1, ISL, UEL, WC2026 groups) renders identical column layouts. WC2026 groups still highlight the top 2 qualifiers.
- Cricket (IPL): standings now include T (tied) and NR (no-result) columns alongside P/W/L/NRR/Pts.
- F1 Constructors: added Code (3-letter FIA short) and Wins columns, with team color stripe and compact mode collapsing the name down to the code. New `app/lib/f1-codes.ts` maps drivers and constructors to standard FIA abbreviations (VER, HAM, RBR, MER…).
- F1 Drivers: bar shows total wins next to points; compact mode shows the 3-letter driver code instead of last name.
- CD workflow now creates (or updates) a GitHub Release for every tag push, pulling notes from the matching `## vX.Y.Z` section of `RELEASE.md`. Pre-release tags (`-rc.N`, `-beta.N`, `-alpha.N`) are flagged as prereleases. A prod tag only claims the **Latest** badge when the tagged commit is reachable from `origin/main` — tags pushed from feature branches are still deployed and released but never overwrite the Latest pointer. This populates the repo's right-hand Releases sidebar correctly.
- CD workflow `workflow_dispatch` now exposes a **bump selector** (major/minor/patch) and **pre-release channel** (none/rc/beta/alpha) instead of a free-form version string. A new `bump-and-tag` job reads the latest existing tag, computes the next semver (auto-incrementing the pre-release counter when applicable), creates the tag, and pushes it — which then re-enters the workflow via the existing `push: tags` trigger to run build/deploy/release. Removes the foot-gun of typing a wrong version label by hand.

---

## v1.2.0 — 2026-05-18

First tag-driven production deploy bundling the release-tooling rollout and
the mobile standings overhaul.

**Release tooling**

- Tag-driven deploys. `main` no longer auto-deploys; deploys trigger only on `v*` tag push (or manual `workflow_dispatch`).
- Semver tag conventions: prod `vX.Y.Z`; test builds from feature branches `vX.Y.Z-rc.N` / `-beta.N` / `-alpha.N` (overwrite the same Pages URL).
- Version badge in the Navbar (chip) and footer, embedded at build time via `NEXT_PUBLIC_APP_VERSION`.
- `RELEASE.md` as the single source of truth, with an `## Upcoming` rolling block.
- `release-notes-check` workflow fails PRs that don't update `RELEASE.md` (bypass with the `no-release-note` label).
- PR template + CLAUDE.md rules so the process is enforced going forward.
- Removed legacy `CHANGELOG.md` and `docs/RELEASES.md`.

**Mobile UX**

- Standings on small phones keep `#`, Team, `P`, `GD`, `Pts` visible — only W/D/L are hidden ≤480px (previously P/W/D/L/GD/Pts were all dropped).
- New compact-tables toggle in the Navbar (`···` / `ABC`) globally collapses team full names to team codes (TLA), tightens row padding, drops W/D/L at all widths, and switches the Teams tab into a denser TLA tile grid. Persists in localStorage and applies pre-paint to avoid flicker.
- Shared `<TeamName />` component used across all league standings and the Top Scorers Team column.

---

## v1.0.0 — 2026-05-18

Initial production release. Snapshot of MatchDay as of this date.

**Sports & competitions**

- Football: Premier League, UCL, Europa League, La Liga, Serie A, Bundesliga, Ligue 1, ISL, FIFA World Cup 2026.
- Formula 1: full 2026 season.
- Cricket: IPL 2026.

**Features**

- Daily fixtures view + per-competition sections (Fixtures/Standings/Teams/Stats tabs as applicable).
- World Cup 2026 section: Fixtures (Upcoming + Results), Groups, Bracket, Teams (squads inline).
- Team detail panel: crest, coach, colours, squad grouped by position.
- F1 race weekend cards.
- Dark/light theme toggle (persisted).
- Data freshness badge.
- Static export deployed to GitHub Pages, data fetched directly from Supabase.
