# Engineering Rules

## Map

| Principle | Default                       |
| --------- | ----------------------------- |
| KISS      | smallest explicit solution    |
| SOLID     | ownership + stable boundaries |
| DRY       | share proven concepts         |
| YAGNI     | current owned requirements    |

| Area         | Rules           |
| ------------ | --------------- |
| Architecture | `architecture/` |
| Testing      | `testing/`      |
| Security     | `security/`     |

## Shape

```text
rule -> ownership/map -> concrete shape -> short rules
```

## Rules

- Define how the repository is built, not a list of hypothetical mistakes.
- Prefer maps, tables and concrete source shapes over prose.
- Keep exceptions explicit, local and owned by the boundary that needs them.
