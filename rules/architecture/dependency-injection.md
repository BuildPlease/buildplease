# Dependency Injection

## Symbols

| Contract                  | Symbol                                |
| ------------------------- | ------------------------------------- |
| `DateTimeFormatter`       | `Symbols.DI.Formatter.DateTime`       |
| `TimeIntervalFormatter`   | `Symbols.DI.Formatter.TimeInterval`   |
| `UnitFormatter`           | `Symbols.DI.Formatter.Unit`           |
| `RandomValueGenerator`    | `Symbols.DI.Generator.RandomValue`    |
| `TemporaryFileRepository` | `Symbols.DI.Repository.TemporaryFile` |
| `Logger`                  | `Symbols.DI.Logging.Logger`           |
| `I18nController`          | `Symbols.DI.I18n.Controller`          |
| `ServerController`        | `Symbols.DI.Server.Controller`        |

## Extension

A package exports one public `Symbols` tree and extends the nearest parent package.

```ts
import { Symbols as ParentSymbols } from '@buildplease/core';

export const Symbols = ParentSymbols.extend({
  DI: {
    I18n: {
      Controller: Symbol.for('BuildPlease.ApiKit.DI.I18n.Controller'),
    },
  },
});
```

Consumer-owned symbols use a consumer namespace:

```ts
export const Symbols = ParentSymbols.extend({
  DI: {
    MyApp: {
      Repository: {
        Account: Symbol.for('MyApp.DI.Repository.Account'),
      },
    },
  },
});
```

Intentional framework overrides replace the inherited semantic path directly:

```ts
export const Symbols = ParentSymbols.extend({
  DI: {
    Formatter: {
      DateTime: Symbol.for('MyApp.DI.Formatter.DateTime'),
    },
  },
});
```

## Path naming

| Shape                      | Use                             |
| -------------------------- | ------------------------------- |
| `Formatter.<Concept>`      | reusable formatter family       |
| `Generator.<Concept>`      | reusable generator family       |
| `Repository.<Concept>`     | reusable repository family      |
| `<Concept>.Controller`     | domain/technical controller     |
| `<Concept>.<SpecificRole>` | multiple roles under one domain |

Examples:

```text
Symbols.DI.Formatter.DateTime
Symbols.DI.Generator.RandomValue
Symbols.DI.Repository.TemporaryFile
Symbols.DI.I18n.Controller
Symbols.DI.Server.RequestController
```

## Rules

- Public DI uses `Symbols`; do not export package-prefixed variants such as `CoreSymbols` or `ApiKitSymbols`.
- Do not namespace BuildPlease symbols by package (`Symbols.Core.*`, `Symbols.ApiKit.*`).
- `.extend()` deep-merges immutable symbol trees; the child/right side wins on collisions.
- Inherited leaves preserve the exact parent symbol identity unless explicitly overridden.
- `Symbols` contains DI identifiers only; routes, configuration values and unrelated constants use separate registries.
- Internal-only identifiers stay private in `InternalSymbols`.
