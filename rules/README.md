# Engineering Rules

These rules define the engineering contract for BuildPlease source code and repository tooling.

Keep them practical. They describe the preferred shape of the codebase, not implementation history.

## Principles

Follow **KISS**, **SOLID**, **DRY**, and **YAGNI**.

- Keep ownership, runtime boundaries, state, side effects, and failure paths explicit.
- Prefer small changes over broad cleanup.
- Add abstractions for real boundaries, stable contracts, or proven reuse.
- Preserve public contracts unless a change intentionally modifies them.
- Keep generated output and implementation history out of the rules.

## Structure

| Area                              | Covers                                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [`architecture/`](./architecture) | Structure, dependencies, configuration, bundling, imports, TypeScript, naming, identity, localization, resources, and infrastructure. |
| [`testing/`](./testing)           | Testing strategy, ownership, and integration boundaries.                                                                              |
| [`security/`](./security)         | Security and cryptography contracts.                                                                                                  |

## Usage

Read only the rules relevant to the change, then keep the implementation consistent with them.
When a real architecture exception appears, resolve the ownership or contract explicitly instead of adding a hidden workaround or a parallel convention.
