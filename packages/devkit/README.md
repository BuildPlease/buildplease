# @buildplease/devkit

DevKit is the shared repository tooling used by BuildPlease projects. It wraps formatting, linting, dependency maintenance, and cleanup behind one consistent CLI.

## Install

```bash
pnpm add -D @buildplease/devkit
```

## Usage

```bash
pnpm exec devkit run format
pnpm exec devkit run lint
pnpm exec devkit run dep-check
pnpm exec devkit run clean
```

Fixing variants and deeper cleanup are available through the same CLI:

```bash
pnpm exec devkit run format-fix
pnpm exec devkit run lint-fix
pnpm exec devkit run clean-deep
```

## What’s included

- Prettier formatting
- ESLint configuration and execution
- dependency checking and updates
- repository cleanup commands
- shared DevKit configuration

Part of [BuildPlease](https://github.com/BuildPlease/buildplease).
