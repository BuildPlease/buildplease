# Testing

## Map

```text
pure function / value object / parser -> unit
controller / service                 -> in-process
request/process state                -> real owned mechanism
generated files                      -> temp directory
CLI env / exit / signal              -> process
external network                     -> narrow transport mock
```

## Shape

```text
owned behavior -> smallest direct test -> observable result
```

```text
test/<owner>/<behavior>.test.ts

test/fixtures/
  reusable test data and files
```

## Rules

- Unit and in-process tests are the default.
- Test normal behavior, meaningful failures and owned state/concurrency.
- Use real owned code and state mechanisms; mock only external boundaries.
- Use filesystem/process tests only when BuildPlease owns that boundary.
- Keep fixtures small, typed and reusable.
- Test helpers build test data; production code owns runtime state and lifecycle.
- Framework loaders, module/package resolution and trivial exports are toolchain-owned.
- Prefer one strong behavior test over duplicated permutations.
