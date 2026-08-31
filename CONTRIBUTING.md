# Contributing to BuildPlease

BuildPlease is developed as a monorepo. Contributions should stay small, explicit, and consistent with the existing architecture.

## Rules

Read the relevant rules before changing source code.
Follow KISS, SOLID, DRY, and YAGNI. Keep rules practical, they exist to make behavior predictable.

### Usage

- Read the rules relevant to the code being changed before editing it.
- Preserve public contracts and ownership unless the change intentionally modifies them.
- Prefer small, explicit changes with visible state, side effects, and failure paths.
- Add abstractions for real boundaries, stable contracts, or proven reuse.
- Keep implementation history in Git; rules describe the engineering contract.
- Keep generic rules in `rules/`. Add project-specific rules only where they are needed.

### Structure

- `rules/architecture/` — structure, dependencies, configuration, bundling, imports, naming, identity, localization, resources, and infrastructure.
- `rules/testing/` — testing strategy and ownership.
- `rules/security/` — security and cryptography contracts.

Rules describe the preferred shape directly. `GOOD` and `BAD` examples are used only when they make a boundary clearer.

## Before You Start

- **Bug fixes:** Check whether an issue already exists.
- **Features:** Prefer discussing larger changes before implementing them.
- **Refactors:** Keep them scoped. Do not mix unrelated cleanup into a feature or fix.
- **Public API changes:** Make the contract change explicit and update affected tests and documentation.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/).

```text
feat(apikit): add request context
fix(webkit): handle missing session
refactor(core): simplify validation
docs: improve contributing guide
chore: update tooling
```

Use a package scope when the change belongs to a specific package. Use `!` or a `BREAKING CHANGE:` footer for breaking changes. Pull request titles should follow the same convention.

## Validation

Run the checks relevant to your change before opening a pull request:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm format
```

Formatting and generated files should follow the repository tooling. Do not hand-edit generated lockfiles or build output.

## Pull Requests

Keep pull requests focused and explain:

- what changed,
- why it changed,
- any public behavior or contract that changed,
- how the change was validated.

Small pull requests are easier to review and maintain.
