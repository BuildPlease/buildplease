# Infrastructure

- Infrastructure owns deployment topology, runtime services, networking, storage and secrets delivery.
- Application/package code owns product/runtime behavior.
- Keep topology, non-secret configuration and secrets as separate concerns.
- Render deployment/runtime configuration from explicit inputs that match the application's typed configuration contract.
- Prefer deterministic, idempotent orchestration.
- Resolve an explicit target before destructive operations.
- Keep health checks read-only; migrations/repair tasks own mutations.
- Let deployment own values that genuinely vary by environment; let application configuration own application defaults.
- Prefer calling repository build/release scripts from CI over duplicating their logic.

GOOD:

```text
CI -> repository release script -> package/build tooling
```

BAD:

```text
CI reimplements package build, versioning and publication logic independently
```
