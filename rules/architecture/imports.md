# Imports

## Map

Multi-runtime packages:

| Owner                    | Alias                 |
| ------------------------ | --------------------- |
| `src-neutral/*`          | `@neutral/*`          |
| `src-browser/*`          | `@browser/*`          |
| `src-node/*`             | `@node/*`             |
| `src-internal/neutral/*` | `@internal/neutral/*` |
| `src-internal/browser/*` | `@internal/browser/*` |
| `src-internal/node/*`    | `@internal/node/*`    |

Single-runtime/support source:

| Owner            | Alias             |
| ---------------- | ----------------- |
| `src/*`          | `@/*`             |
| `src-internal/*` | `@src-internal/*` |
| `src-cli/*`      | `@src-cli/*`      |
| `src-testing/*`  | `@src-testing/*`  |
| `test/*`         | `#test/*`         |

| Boundary                    | Import form                 |
| --------------------------- | --------------------------- |
| same package source         | owned source alias          |
| another BuildPlease package | public package import       |
| framework runtime           | framework-native alias      |
| bundler bootstrap           | direct relative leaf import |
| test helper                 | configured test alias       |

## Shape

```text
neutral -> @neutral + @internal/neutral
browser -> neutral + @browser + @internal/browser
node    -> neutral + @node + @internal/node
```

## Rules

- Runtime tsconfigs expose only aliases valid for that runtime program.
- Cross-package source imports public package exports only.
- Exact semantic aliases such as `#l10n` and `#resources` stay with their package owner.
- Framework-native aliases keep framework ownership (`#app`, `#imports`, `#ui`, `#nuxtkit`, `#internal-runtime`, `#internal-shared`).
