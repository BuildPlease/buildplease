# Releasing

Use independent manual versions.
Change the package version in `package.json`, merge it, then run **Release** from GitHub Actions.

```text
release.yml
│
├── Step 1 ──: install / build / typecheck / test
│
├── Step 2 ──: pnpm -r --no-bail publish --report-summary
│      ├── already published versions -> pnpm skips
│      ├── new versions -> pnpm publishes
│      └── writes pnpm-publish-summary.json
│
├── Step 3 ──: scripts/post-release.ts
│      ├── reads only publishedPackages from the pnpm summary
│      ├── validates the complete release plan
│      ├── generates per-package Conventional Commit notes
│      ├── pushes package tags atomically
│      └── creates GitHub Releases
│
└── Step 4 ──: propagate publish failure
       └── fails the workflow if the pnpm publish step failed
```

## Package release

One package version is one release identity:

```text
@buildplease/core@1.3.0
        │
        ├── npm package
        ├── core@1.3.0 Git tag
        └── core@1.3.0 GitHub Release
```

## Partial publish failure

Recursive publish uses `--no-bail`, so pnpm attempts every publish even if one package fails.
Post-release reads only `publishedPackages` from `pnpm-publish-summary.json`.
Every package that was successfully published is finalized with its Git tag and GitHub Release.
Packages absent from the summary are ignored.

After finalization, the workflow is explicitly failed when the pnpm publish outcome was `failure`.

## Release notes

Release notes are generated per package from Conventional Commits that changed that package since its previous package tag.
Package relevance is based on changed paths, not commit scope. Root and shared repository changes are not propagated to package release notes.

Breaking changes are detected from both `type!:` / `type(scope)!:` headers and `BREAKING CHANGE:` notes.
User-facing notes include breaking changes, features, fixes, performance changes, and refactors. Documentation, CI, test, build, and chore commits are omitted.
