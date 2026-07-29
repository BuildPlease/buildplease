# Rules

1. Correctness and security.
2. Existing architecture and ownership.
3. KISS and predictable control flow.
4. SOLID where it removes real coupling.
5. DRY after reuse is proven.
6. YAGNI.

- Preserve intentional public contracts and ownership boundaries.
- Prefer boring, explicit code with visible side effects and failure paths.
- Fail fast on broken internal contracts; map expected user or dependency failures explicitly.
- Add abstractions only for real boundaries or proven reuse.
- Do not move code into shared modules or packages for hypothetical reuse.
- Do not redesign architecture to satisfy formatting, linting, or a desire to remove every cast.
- Keep rules short, stable, and focused on engineering decisions rather than implementation history.
- Update rules only when the intended engineering contract changes.

| Area              | Covers                                                                   |
| ----------------- | ------------------------------------------------------------------------ |
| `architecture/`   | Layers, TypeScript, naming, constructors, configuration and dependencies |
| `packages/`       | Reusable mechanisms and package boundaries                               |
| `testing/`        | Test priorities and test shape                                           |
| `infrastructure/` | Deployment and runtime infrastructure                                    |
