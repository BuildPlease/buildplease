# @buildplease/core

Core is the shared foundation for BuildPlease applications. It provides framework-independent application primitives used by the other BuildPlease kits.

## Installation

```bash
pnpm add @buildplease/core
```

## Usage

```ts
import { coreAssembly } from '@buildplease/core';

const assemblies = coreAssembly();
```

Node.js-specific APIs are available from `@buildplease/core/node`.

## Features

- dependency injection and application assemblies
- operations, models, converters, and formatters
- errors, validation, and normalization primitives
- L10n resources and localization helpers
- security, synchronization, and general utilities
- Node.js infrastructure helpers

## License

MIT
