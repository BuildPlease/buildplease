# Layers and Ownership

## Map

| Layer       | Owns                                                 |
| ----------- | ---------------------------------------------------- |
| Transport   | external input/output adaptation                     |
| Application | one coordinated behavior/use case                    |
| Domain      | stable business rules/contracts                      |
| Adapter     | persistence/network/filesystem/framework integration |
| Composition | concrete implementation wiring                       |

| Runtime owner         | Dependencies                        |
| --------------------- | ----------------------------------- |
| `src-neutral`         | neutral + internal/neutral          |
| `src-browser`         | neutral + browser + their internals |
| `src-node`            | neutral + node + their internals    |
| `internal/neutral`    | neutral                             |
| `internal/browser`    | neutral + browser                   |
| `internal/node`       | neutral + node                      |
| `application/browser` | neutral + browser                   |
| `application/node`    | neutral + node                      |
| `src-cli`             | neutral + node                      |
| `src-testing`         | neutral + node                      |

## Shape

```text
Transport -> Application operation -> Domain capability -> External adapter
```

Applications:

```text
src/app/                  composition + startup
src/library/              app-owned reusable technical code
src/modules/<name>/api/   module public contract
src/modules/<name>/impl/  module private implementation
src/l10n/                 app-owned localization
```

Packages:

```text
single runtime:
  src/
  src-internal/

multi runtime:
  src-neutral/
  src-browser/
  src-node/
  src-internal/{neutral,browser,node}/
  src-application/{browser.ts,node.ts}
```

Public runtime API:

```text
root      -> neutral
/browser  -> browser
/node     -> node
/test     -> testing tooling
```

## Rules

- Dependencies point toward stable contracts.
- Cross-module calls use the owning module API.
- Runtime ownership follows feature ownership.
- Across packages: neutral -> root, browser -> root + `/browser`, node -> root + `/node`.
- Internal package exports: none.
