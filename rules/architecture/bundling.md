# Bundling

## Map

| Entry         | TypeScript | Platform |
| ------------- | ---------- | -------- |
| neutral       | neutral    | neutral  |
| browser       | browser    | browser  |
| node          | node       | node     |
| CLI / testing | node       | node     |

| Source              | Output role                    |
| ------------------- | ------------------------------ |
| `src-neutral`       | neutral public entry           |
| `src-browser`       | browser public entry           |
| `src-node`          | Node public entry              |
| `src-application/*` | runtime composition entry      |
| `src-internal/*`    | bundled private implementation |
| `resources/**`      | copied runtime assets          |

## Shape

```text
browser program = neutral + browser
node program    = neutral + node

package.json exports
  -> owned entrypoint
  -> reachable public source
  -> reachable private internal source
```

Bootstrap runs before source aliases exist:

```text
tsdown.config.ts
  -> direct relative leaf import
  -> direct relative leaf import
```

## Rules

- Neutral source passes both browser and Node programs.
- `package.json` owns public exports and dependency policy.
- Bootstrap import closure uses direct relative leaf imports only.
- Build emits compiled entries/declarations, bundles reachable internals and copies owned runtime assets.
- Generated source is an explicit build input owned by its generator.
