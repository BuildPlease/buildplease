# Dependencies

Each dependency has one version owner policy:

| Ownership               | Version declaration            |
| ----------------------- | ------------------------------ |
| 1 manifest owner        | exact version in that manifest |
| 2+ manifest owners      | pnpm default catalog           |
| workspace-owned package | workspace protocol             |

- Declare each external dependency in the manifest that owns its usage.
- Use exact external versions; catalog entries are exact too.
- Treat the workspace root as a normal manifest owner.
- Keep repository-wide CLI/toolchain dependencies at the root when child projects only execute them through `pnpm run`.
- Use peer dependencies for runtime contracts supplied by the consumer.
- Consume workspace packages through declared public exports.
- Keep shared pnpm registry/configuration in `pnpm-workspace.yaml`.
- Keep pnpm workspace behavior explicit: `autoInstallPeers: true`, `strictPeerDependencies: true`, `verifyDepsBeforeRun: false`, `shamefullyHoist: false`.
- Add a narrow compatibility hoist only for a verified tool requirement.
- Use overrides for verified transitive incompatibilities and remove them when the upstream constraint disappears.
- Update `pnpm-lock.yaml` through pnpm; treat it as generated output.

GOOD — one owner:

```json
{
  "devDependencies": {
    "vitest": "4.1.10"
  }
}
```

GOOD — multiple owners:

```yaml
catalog:
  inversify: 8.2.3
```

```json
{
  "peerDependencies": {
    "inversify": "catalog:"
  }
}
```

BAD:

```json
{
  "dependencies": {
    "example": "^1.2.3"
  }
}
```
