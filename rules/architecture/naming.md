# Naming

## Map

| Suffix                    | Responsibility                   |
| ------------------------- | -------------------------------- |
| `Model`                   | reusable identity-less data      |
| `Input` / `Options`       | caller parameters                |
| `Row`                     | selected persistence record      |
| `InsertRow` / `UpdateRow` | writable persistence record      |
| `DTO` / `Schema`          | transport contract / validation  |
| `Converter`               | runtime-validated conversion     |
| `Controller`              | technical/application capability |
| `Repository`              | persistence boundary             |
| `UseCase`                 | one application operation        |
| `Handler`                 | transport adapter                |
| `Validator`               | reusable guard                   |
| `Provider`                | capability selection/supply      |
| `Factory`                 | value/implementation creation    |

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

## Shape

```text
<concept><role>

AccountRepository
resolveConfiguration()
loadPackageJSON()
```

## Rules

- Name the concept first and the role second.
- One concept uses one term across layers.
- Method names describe ownership and lifecycle semantics, not implementation detail.
