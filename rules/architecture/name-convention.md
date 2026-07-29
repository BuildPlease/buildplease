# Name Convention

- Name the concept first and its role second.
- Keep terminology consistent across layers.
- Use complete words and established technical abbreviations.
- Match filenames and folders to their primary responsibility.
- Use verbs for actions and nouns for values or concepts.
- Prefer names that describe behavior over vague containers such as `utils`, `helpers`, or `context` when a more precise name exists.

| Suffix                    | Responsibility                                       |
| ------------------------- | ---------------------------------------------------- |
| `Model`                   | Reusable identity-less domain or application data    |
| `Input` / `Options`       | Caller-provided parameters of an operation           |
| `Row`                     | Selected persistence record                          |
| `InsertRow` / `UpdateRow` | Writable persistence record                          |
| `DTO` / `Schema`          | Transport contract and validation                    |
| `Converter`               | Reusable conversion with runtime contract validation |
| `Controller`              | Technical or application capability                  |
| `Repository`              | Persistence boundary                                 |
| `UseCase`                 | One application operation                            |
| `Handler`                 | Transport-to-application adapter                     |
| `Validator`               | Reusable validation or business guard                |
| `Provider`                | Selects or supplies a capability                     |
| `Factory`                 | Creates a value or implementation                    |

| Method                                  | Meaning                                  |
| --------------------------------------- | ---------------------------------------- |
| `init()`                                | Synchronous constructor closure          |
| `configure()`                           | Apply configuration                      |
| `start()` / `stop()` / `quit()`         | Real resource lifecycle                  |
| `load*()`                               | Read an external file, module, or source |
| `resolve*()`                            | Derive a validated runtime value         |
| `find*()` / `list*()`                   | Optional or collection lookup            |
| `get*()`                                | Required value or direct property access |
| `create*()` / `update*()` / `delete*()` | Mutation                                 |

- Create a named role for a real boundary, multiple callers, or stable domain/security behavior.
- Include ownership in a declaration when the same role exists at multiple boundaries.

```ts
interface CatalogRepository {}
interface AuditRepository {}
```
