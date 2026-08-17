# Contributing to BuildPlease

BuildPlease is developed as a monorepo. Contributions should stay small, explicit, and consistent with the existing architecture.

## Setup

1. Fork [`BuildPlease/buildplease`](https://github.com/BuildPlease/buildplease) and clone it locally.
2. Use the Node.js version defined by the repository.
3. Enable Corepack:

   ```bash
   corepack enable
   ```

4. Install dependencies:

   ```bash
   pnpm install --frozen-lockfile
   ```

5. Create a branch for your change.

## Monorepo Guide

- `packages/core` — shared runtime-neutral foundation used across BuildPlease packages.
- `packages/apikit` — Node.js application and API framework.
- `packages/webkit` — browser application framework.
- `packages/nuxtkit` — Nuxt integration for WebKit applications.
- `packages/devkit` — shared development and build tooling.

Packages should depend only on the layers they actually use. Keep runtime-specific behavior in the package that owns that runtime.

## Rules

Read the relevant rules before changing source code.

Follow KISS, SOLID, DRY, and YAGNI. Keep rules practical; they exist to make behavior predictable.

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
<type>(<scope>): <description>
```

Use a package scope when the change belongs to a specific package:

```text
feat(apikit): add request context
fix(nuxtkit): resolve runtime alias
refactor(core): simplify validation
docs: improve contributing guide
chore: update tooling
```

Use `feat` for new functionality and `fix` for bug fixes. Use `!` or a `BREAKING CHANGE:` footer for breaking changes.

Pull request titles should follow the same convention.

## Release Changes

BuildPlease uses pnpm native release management. Public packages release as one fixed version group.

For a change that should be included in a release, record a release intent and commit the generated `.changeset/` file with the change:

```bash
pnpm change
```

Choose the semantic version impact of the change:

- `patch` — backward-compatible bug fix.
- `minor` — backward-compatible functionality.
- `major` — breaking change.

Changes that do not affect a published package do not need a release intent.

Maintainers prepare releases through the **Prepare Release** GitHub workflow. pnpm consumes the pending release intents, synchronizes the fixed package versions, and commits the release state to `master`. Publishing is then performed separately by the **Publish Packages** workflow.

## Validation

Run the checks relevant to your change before opening a pull request:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Formatting and generated files should follow the repository tooling. Do not hand-edit generated lockfiles or build output.

## Pull Requests

Keep pull requests focused and explain:

- what changed,
- why it changed,
- any public behavior or contract that changed,
- how the change was validated.

Small pull requests are easier to review and maintain.
