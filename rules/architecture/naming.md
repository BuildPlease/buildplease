# Naming

- Name the concept first and its role second.
- Keep one term for one concept across layers.
- Use complete words and established technical abbreviations.
- Match filenames and folders to their primary responsibility.
- Use verbs for actions and nouns for values/concepts.
- Include ownership when the same role exists at multiple boundaries.

## Roles

| Suffix                    | Responsibility                                 |
| ------------------------- | ---------------------------------------------- |
| `Model`                   | Reusable identity-less domain/application data |
| `Input` / `Options`       | Caller-provided operation parameters           |
| `Row`                     | Selected persistence record                    |
| `InsertRow` / `UpdateRow` | Writable persistence record                    |
| `DTO` / `Schema`          | Transport contract and validation              |
| `Converter`               | Conversion with runtime contract validation    |
| `Controller`              | Technical/application capability               |
| `Repository`              | Persistence boundary                           |
| `UseCase`                 | One application operation                      |
| `Handler`                 | Transport-to-application adapter               |
| `Validator`               | Reusable validation/business guard             |
| `Provider`                | Selects or supplies a capability               |
| `Factory`                 | Creates a value or implementation              |

## Methods

| Method                                  | Meaning                                 |
| --------------------------------------- | --------------------------------------- |
| `init()`                                | Synchronous setup called by constructor |
| `configure()`                           | Apply configuration                     |
| `start()` / `stop()` / `quit()`         | Real resource lifecycle                 |
| `load*()`                               | Read an external file/module/source     |
| `resolve*()`                            | Derive a validated runtime value        |
| `find*()` / `list*()`                   | Optional or collection lookup           |
| `get*()`                                | Required value/direct property access   |
| `create*()` / `update*()` / `delete*()` | Mutation                                |

GOOD:

```text
AccountRepository
resolveConfiguration()
loadPackageJSON()
```

BAD:

```text
AccountManagerThing
processStuff()
helper2()
```
