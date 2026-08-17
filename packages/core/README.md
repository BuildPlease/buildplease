# @buildplease/core

Core contains the shared application primitives used across BuildPlease: dependency injection, errors, validation, localization, formatting, operations, security helpers, utilities, and Node.js infrastructure.

## Install

```bash
pnpm add @buildplease/core
```

## Usage

```ts
import { coreAssembly } from '@buildplease/core';

const assemblies = coreAssembly();
```

Node.js-specific utilities are available from `@buildplease/core/node`.

## What’s included

- dependency injection and assemblies
- validation and error primitives
- L10n and localization
- formatters, converters, models, and operations
- mutex and security utilities
- Node.js logging, environment, file, and package helpers

Part of [BuildPlease](https://github.com/BuildPlease/buildplease).
