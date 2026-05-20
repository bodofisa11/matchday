# Release notes

This file tracks every deployment of MatchDay. The version displayed in the app
header and footer matches the latest tag deployed to GitHub Pages.

For versioning rules, workflow policy, and deploy commands see
[`docs/RELEASE-PROCESS.md`](docs/RELEASE-PROCESS.md).

---

## Upcoming

<!-- Add bullets here for every PR merged to main. Promote this block to a
     versioned heading on deploy. -->

- New top-level **Predict** tab in the Navbar (beside UFC). Public, no-login World Cup 2026 prediction game with four sub-sections: **Feed** (post field placeholder), **Predictions** (Phase 1 — partial picks allowed for group standings 1–4 in any of the 12 groups, up to 4 semifinalists, up to 2 top scorers; Phase 2 — knockout bracket through champion, opens after groups finish), **Leaderboard** (sorted by points, ties broken by earliest submission), and **Users** (browse everyone's picks with search). Identity stored in `localStorage` so picks persist across reloads. Iteration ships frontend + localStorage-backed dummy data; Supabase wiring follows in a separate PR.
- Split release docs: moved versioning, workflow rules, and deploy commands out of `RELEASE.md` into `docs/RELEASE-PROCESS.md`. `RELEASE.md` is now changelog-only. Removed deprecated `CHANGELOG.md` and the stale `docs/RELEASES.md` policy doc (superseded by tag-driven flow).
- Modern multi-column footer: brand block + Sports / Resources / About link columns, GitHub social button, bottom bar with auto-updating copyright year and version pill. Responsive 4-col → 2-col (≤900px) → 1-col (≤520px).
- Football standings now show full stats: P / W / D / L / GF / GA / GD / Form / Pts. Recent form rendered as colored W/D/L pills (newest on the right). Mobile keeps #, Team, P, GD, Form, Pts; compact mode collapses form pills to dots and hides W/D/L/GF/GA at all widths.
- Extracted shared `<LeagueStandingsTable />` so every football competition (PL, La Liga, Serie A, Bundesliga, Ligue 1, ISL, UEL, WC2026 groups) renders identical column layouts. WC2026 groups still highlight the top 2 qualifiers.
- Cricket (IPL): standings now include T (tied) and NR (no-result) columns alongside P/W/L/NRR/Pts.
- F1 Constructors: added Code (3-letter FIA short) and Wins columns, with team color stripe and compact mode collapsing the name down to the code. New `app/lib/f1-codes.ts` maps drivers and constructors to standard FIA abbreviations (VER, HAM, RBR, MER…).
- F1 Drivers: bar shows total wins next to points; compact mode shows the 3-letter driver code instead of last name.
- CD workflow now creates (or updates) a GitHub Release for every tag push, pulling notes from the matching `## vX.Y.Z` section of `RELEASE.md`. Pre-release tags (`-rc.N`, `-beta.N`, `-alpha.N`) are flagged as prereleases. A prod tag only claims the **Latest** badge when the tagged commit is reachable from `origin/main` — tags pushed from feature branches are still deployed and released but never overwrite the Latest pointer. This populates the repo's right-hand Releases sidebar correctly.
- CD workflow `workflow_dispatch` now exposes a **bump selector** (major/minor/patch) and **pre-release channel** (none/rc/beta/alpha) instead of a free-form version string. A new `compute-version` job reads the latest existing tag and computes the next semver (auto-incrementing the pre-release counter when applicable). Removes the foot-gun of typing a wrong version label by hand.
- CD workflow now also **runs build / deploy / release in the same run** when invoked via `workflow_dispatch`, instead of relying on the tag push to re-enter. GitHub Actions intentionally skips workflow triggers for refs created by `GITHUB_TOKEN` (anti-recursion safeguard), which is why earlier dispatch attempts tagged successfully but skipped the deploy. The build/deploy/release jobs gate on either `event_name == 'push'` (real tag push) or successful completion of the dispatch pipeline.
- CD workflow `workflow_dispatch` path is now **tag-last**: compute next version + capture HEAD SHA, build at that SHA, deploy to Pages, and ONLY THEN create the git tag (pointing at the captured SHA) and publish the GitHub Release. A failed build or deploy aborts before any tag exists — no more orphan tags pointing at broken commits. Tag-push entry (someone pushes `vX.Y.Z` directly) skips the new tag job since the tag already exists.

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
