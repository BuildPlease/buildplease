# Rules

Read this file before changing source code.
Follow principles: KISS, SOLID, DRY and YAGNI

## Usage

- Read the rules relevant to the code being changed before editing it.
- Preserve existing public contracts and ownership unless the task explicitly changes them.
- Prefer small, explicit changes with visible state, side effects and failure paths.
- Add abstractions for real boundaries, stable contracts or proven reuse.
- Keep implementation history in Git; keep rules focused on the intended engineering contract.
- Project repositories contain only project-specific extensions. Generic rules live here once.

## Structure

- `architecture/` — code structure, dependencies, configuration, bundling, naming, identity, localization, resources and infrastructure.
- `testing/` — behavior and integration testing strategy.
- `security/` — generic security and cryptography contracts.

## Examples

Rules describe the preferred shape positively. When a distinction matters, `GOOD` and `BAD` examples define the boundary.
