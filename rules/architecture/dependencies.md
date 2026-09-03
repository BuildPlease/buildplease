# Dependencies

## Map

| Ownership                          | Declaration                              |
| ---------------------------------- | ---------------------------------------- |
| one installed manifest owner       | exact version in that manifest           |
| multiple installed manifest owners | exact version in pnpm default catalog    |
| consumer runtime contract          | explicit peer compatibility version      |
| workspace package                  | `workspace:*` / owned workspace protocol |

| pnpm setting             | Value   |
| ------------------------ | ------- |
| `autoInstallPeers`       | `true`  |
| `strictPeerDependencies` | `true`  |
| `verifyDepsBeforeRun`    | `false` |
| `shamefullyHoist`        | `false` |

## Shape

```json
{
  "dependencies": {
    "jiti": "catalog:"
  },
  "peerDependencies": {
    "typescript": "6.0.3"
  }
}
```

```text
package source -> declared dependency -> public package export
```

## Rules

- Each package declares the external dependencies it imports.
- Repository-only CLI/toolchain dependencies stay at root when packages only use them through repository scripts.
- Compatibility hoists/overrides are narrow, verified and removable.
- `pnpm-lock.yaml` is pnpm-owned generated output.
