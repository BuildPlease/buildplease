# @buildplease/core

Core provides shared application primitives for BuildPlease kits.

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

Define application environment configuration in `environment.config.ts`:

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

Environment files are optional dotenv hookups. If a configured file is missing, BuildPlease continues with the existing process environment. Existing `process.env` values keep priority over dotenv values.

Select the BuildPlease environment when running a command:

```bash
buildplease --env test -- <command>
buildplease --env production -- <command>
```

## Features

- dependency injection and application assemblies
- operations, models, converters, and formatters
- errors, validation, and normalization primitives
- L10n resources and localization helpers
- security, synchronization, and general utilities
- Node.js environment configuration and infrastructure helpers

## License

MIT
