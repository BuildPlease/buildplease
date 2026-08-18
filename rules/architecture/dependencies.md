# Dependencies

Each installed dependency has one version owner policy:

| Ownership                    | Version declaration            |
| ---------------------------- | ------------------------------ |
| 1 installed manifest owner   | exact version in that manifest |
| 2+ installed manifest owners | pnpm default catalog           |
| peer runtime contract        | explicit compatibility version |
| workspace-owned package      | workspace protocol             |

- Declare each external dependency in the manifest that owns its usage.
- Use exact external versions; catalog entries are exact too.
- Treat the workspace root as a normal installed-dependency manifest owner.
- Keep repository-wide CLI/toolchain dependencies at the root when child projects only execute them through `pnpm run`.
- Use peer dependencies for runtime contracts supplied by the consumer.
- Keep peer compatibility declarations explicit in the package that owns the contract. Do not count peer declarations as catalog owners unless the peer contract is intentionally versioned in lockstep with the installed dependency.
- Consume workspace packages through declared public exports.
- Keep shared pnpm registry/configuration in `pnpm-workspace.yaml`.
- Keep pnpm workspace behavior explicit: `autoInstallPeers: true`, `strictPeerDependencies: true`, `verifyDepsBeforeRun: false`, `shamefullyHoist: false`.
- Add a narrow compatibility hoist only for a verified tool requirement.
- Use overrides for verified transitive incompatibilities and remove them when the upstream constraint disappears.
- Update `pnpm-lock.yaml` through pnpm; treat it as generated output.

GOOD — one installed owner:

```json
{
  "devDependencies": {
    "vitest": "4.1.10"
  }
}
```

GOOD — multiple installed owners:

```yaml
catalog:
  jiti: 2.6.1
```

```json
{
  "dependencies": {
    "jiti": "catalog:"
  }
}
```

GOOD — independent peer compatibility contract:

```json
{
  "peerDependencies": {
    "typescript": "6.0.3"
  }
}
```

BAD — coupling an independent peer contract to an unrelated toolchain bump:

```json
{
  "peerDependencies": {
    "typescript": "catalog:"
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
