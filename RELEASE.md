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

- _(none yet — next deploy will become v1.2.1 / v1.3.0)_
- Auto-assign workflow (`.github/workflows/auto-assign.yml`): every opened/reopened PR is auto-assigned to `bodofisa11` (repo owner) so it surfaces in the assigned list. Reviewer-self-request is blocked by GitHub when author equals reviewer, so assignee is used instead.

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
