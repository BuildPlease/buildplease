# Releasing

Use independent manual versions.
Change the package version in `package.json`, merge it, then run **Release** from GitHub Actions.

```text
release.yml
│
├── Step 1 ──: install / build / typecheck / test
│
├── Step 2 ──: scripts/release.ts
│      ├── loads public workspace packages
│      ├── publishes each package independently with pnpm
│      ├── skips versions already published
│      ├── continues when an individual publish fails
│      └── writes pnpm-publish-summary.json
│
├── Step 3 ──: scripts/post-release.ts
│      ├── reads publishedPackages from the publish summary
│      ├── validates the complete release plan
│      ├── generates per-package Conventional Commit notes
│      ├── pushes package tags atomically
│      └── creates GitHub Releases
│
└── Step 4 ──: propagate publish failure
       └── fails the workflow if any package publish failed
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

Packages are published independently.
If one package fails, the remaining package publishes are still attempted.
Successfully published packages are recorded in `pnpm-publish-summary.json` and finalized with their Git tags and GitHub Releases.

Packages absent from `publishedPackages` are ignored by post-release.
After finalization, the workflow is explicitly failed when any package publish failed.

## Release notes

Release notes are generated per package from Conventional Commits that changed that package since its previous package tag.
Package relevance is based on changed paths, not commit scope. Root and shared repository changes are not propagated to package release notes.

Breaking changes are detected from both `type!:` / `type(scope)!:` headers and `BREAKING CHANGE:` notes.
User-facing notes include breaking changes, features, fixes, performance changes, and refactors. Documentation, CI, test, build, and chore commits are omitted.
