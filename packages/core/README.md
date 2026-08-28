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

### Environment configuration

Node applications use one BuildPlease convention: `environment.config.ts`.

```ts
import { defineConfig, defineEnvironments, defineSource } from '@buildplease/core/node';

const environments = defineEnvironments({
  test: { file: '.env.test' },
  production: { file: '.env.production' },
});

const from = defineSource(environments);

export default defineConfig(environments, {
  origin: from.env('API_ORIGIN').default('http://localhost:30000'),
});
```

Core owns config discovery, TypeScript loading, environment-file loading, source resolution, defaults, computed values, and reusable typed configuration contracts. Root configuration resolution always receives one explicit context containing both the selected environment and build metadata. Kits expose their own `defineConfig()` policy while using the same Core engine and loader.

## Features

- dependency injection and application assemblies
- operations, models, converters, and formatters
- errors, validation, and normalization primitives
- L10n resources and localization helpers
- security, synchronization, and general utilities
- Node.js environment configuration and infrastructure helpers

## License

MIT
