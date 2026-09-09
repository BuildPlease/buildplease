# Naming

## Types

| Suffix                    | Responsibility                   |
| ------------------------- | -------------------------------- |
| `Model`                   | reusable identity-less data      |
| `Input` / `Options`       | caller parameters                |
| `Row`                     | selected persistence record      |
| `InsertRow` / `UpdateRow` | writable persistence record      |
| `DTO` / `Schema`          | transport contract / validation  |
| `Converter`               | runtime-validated conversion     |
| `Controller`              | technical/application capability |
| `Formatter`               | value representation/formatting  |
| `Generator`               | value/data generation            |
| `Repository`              | persistence boundary             |
| `UseCase`                 | one application operation        |
| `Handler`                 | transport adapter                |
| `Validator`               | reusable guard                   |
| `Provider`                | capability selection/supply      |
| `Factory`                 | value/implementation creation    |

Type names use concept first, role second:

```text
DateTimeFormatter
RandomValueGenerator
TemporaryFileRepository
ConfigurationController
```

DI paths group reusable role families for lookup; see `dependency-injection.md`.

## Methods

| Method                                  | Meaning                             |
| --------------------------------------- | ----------------------------------- |
| `init()`                                | synchronous constructor-owned setup |
| `configure()`                           | apply configuration                 |
| `start()` / `stop()` / `quit()`         | resource lifecycle                  |
| `load*()`                               | read external source                |
| `resolve*()`                            | derive validated runtime value      |
| `find*()` / `list*()`                   | optional/collection lookup          |
| `get*()`                                | required value/direct access        |
| `create*()` / `update*()` / `delete*()` | mutation                            |

## Rules

- One concept uses one term across layers.
- Names describe responsibility, not implementation detail.
- Acronyms keep their established contract form (`DTO`, `OpenAPI`, `I18n`, `L10n`).
- Method names describe ownership and lifecycle semantics.
