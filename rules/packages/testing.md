# Package Testing

Packages have a higher testing bar because one regression can affect every consumer.

Test behavior, not line count.

| Package behavior                     | Preferred test              |
| ------------------------------------ | --------------------------- |
| Value objects and converters         | Unit                        |
| Configuration parsing and validation | Unit                        |
| Generic provider lifecycle           | Unit                        |
| Deterministic algorithms             | Unit                        |
| Generated/runtime integration        | Integration                 |
| Compile-time generic mappings        | Typecheck / type assertions |

- Cover happy paths, expected failures, and meaningful boundary values.
- Keep tests deterministic and environment-independent by default.
- Reuse fixtures only when setup is genuinely shared.
- Prefer real values and temporary files over large mocks when practical.
- Keep third-party mocks minimal; do not reproduce framework contracts in test code.
- Do not create tautological tests for re-export files, constants, or type aliases.
- Pure type-only behavior is protected primarily by strict typecheck/build.
- Never make production code public only to unit-test a private implementation detail.
