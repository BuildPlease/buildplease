# @buildplease/apikit

ApiKit is the BuildPlease application kit for backend services and APIs. It builds on Core and provides the runtime and infrastructure needed for Fastify applications.

## Installation

```bash
pnpm add @buildplease/apikit
```

## Configuration

Define `environment.config.ts` with `defineConfig()`:

```ts
import { defineConfig, defineEnvironments, defineSource } from '@buildplease/apikit';

const environments = defineEnvironments({
  test: { file: '.env.test' },
  production: { file: '.env.production' },
});

const from = defineSource(environments);

export default defineConfig(environments, {
  server: {
    identifier: from.compute(({ buildMetadata, environment }) => {
      return `${buildMetadata.name.original}:${environment.name}`;
    }),
    host: from.env('SERVER_HOST').default('127.0.0.1'),
    port: from.env('SERVER_PORT').default('30000'),
  },
});
```

## Features

- typed application configuration and environments
- Fastify server and HTTP infrastructure
- dependency injection and application assemblies
- validation, errors, formatting, and normalization
- i18n and L10n integration
- OpenAPI, notifications, email, files, and database helpers
- backend CLI tooling

## License

MIT
