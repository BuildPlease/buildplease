# Dependency Injection & Symbols

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

A package exports one public `Symbols` tree and extends the required parent package.

```ts
import { FrameworkIdentity } from '@buildplease/identity';
import { defineSymbols, Symbols as ParentSymbols } from '@buildplease/core';

const prefix = `${FrameworkIdentity.name}.ApiKit.DI`;

export const Symbols = defineSymbols({
  DI: {
    Server: {
      Controller: Symbol.for(`${prefix}.Server.Controller`),
    },
  },
}).extend(ParentSymbols);
```

## Rules

- Public DI identifiers are exposed through one `Symbols` tree.
- Do not add package-prefixed exports or branches such as `CoreSymbols`, `ApiKitSymbols`, `Symbols.Core.*` or `Symbols.ApiKit.*`.
- Extend the nearest parent `Symbols` tree instead of copying or renaming inherited contracts.
- Internal-only DI identifiers stay private in `InternalSymbols`.
