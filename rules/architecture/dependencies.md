# Dependencies

- Declare every external dependency in the manifest that owns its usage.
- Use exact external dependency versions; do not use `^` or `~`.
- Keep a single-owner dependency version directly in its owner manifest, including the workspace root.
- Use the default pnpm catalog when the same external dependency is declared by multiple workspace projects.
- Declare repository-wide CLI tools once in the root manifest when packages only execute them through `pnpm run`; do not duplicate those tool dependencies in child manifests.
- Use the repository workspace protocol consistently for workspace-owned packages.
- Use workspace overrides only for verified transitive incompatibilities or temporary workarounds, document them, and remove them when upstream is fixed.
- Keep shared workspace registry configuration in `pnpm-workspace.yaml`
- Consume packages through their declared public exports.
- Treat the lockfile as generated output and update it through pnpm.

```json
// GOOD — one owner
{
  "devDependencies": {
    "vitest": "4.1.10"
  }
}
```

```yaml
# GOOD — multiple manifest owners
catalog:
  inversify: 8.2.3
```

```json
// GOOD — each owner references the shared catalog version
{
  "peerDependencies": {
    "inversify": "catalog:"
  }
}
```
