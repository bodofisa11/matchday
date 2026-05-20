# Release process

How MatchDay is versioned and deployed. The user-facing changelog lives in
[`RELEASE.md`](../RELEASE.md).

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
2. **Every PR to `main` must update `RELEASE.md`** under `## Upcoming`. Enforced by
   the `release-notes-check` workflow. Bypass with the `no-release-note` label
   only for pure tooling/docs PRs.
3. **Bundle features before deploying.** Merge several PRs to `main`, each
   adding bullets under `## Upcoming` in `RELEASE.md`, then tag once when the batch is ready.
4. **On deploy:** rename `## Upcoming` in `RELEASE.md` to `## vX.Y.Z — YYYY-MM-DD`, then add a
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
