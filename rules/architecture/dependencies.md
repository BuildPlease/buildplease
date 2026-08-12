# Dependencies

- Declare external dependencies with exact versions; do not use `^` or `~`.
- Use the default pnpm catalog for external dependencies shared by multiple workspace projects and for repository-wide toolchain versions.
- Keep single-owner external dependency versions in the manifest of the project that owns the usage.
- When an external dependency is catalog-owned, reference the same catalog entry consistently from dependencies, dev dependencies, peer dependencies and optional dependencies.
- Use the repository workspace protocol consistently for workspace-owned packages.
- Keep shared workspace registry configuration in `pnpm-workspace.yaml`; use package-level `publishConfig` only for verified package-specific publishing behavior.
- Keep dependencies in the manifest of the project that owns the usage.
- Use workspace overrides only for verified transitive incompatibilities or temporary workarounds.
- Keep temporary overrides documented and remove them when upstream is fixed.
- Do not hand-edit the generated lockfile.
- Consume packages through their declared public exports. Do not reference package-internal source, build, generated or asset paths from another package.
- Raw package subpath or filesystem references are exceptions only when the dependency explicitly defines that path as its public integration API and there is no typed/public alternative; keep such exceptions local and documented.
