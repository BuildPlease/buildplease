# @buildplease/core

Core provides the shared application foundation, configuration primitives, and CLI.

## Installation

```bash
pnpm add @buildplease/core
```

## Configuration

Define `environment.config.ts`:

```ts
import { defineConfig, defineEnvironments, defineSource } from '@buildplease/core/node';

const environments = defineEnvironments({
  test: { file: '.env.test', alias: 'Beta' },
  production: { file: '.env.production', alias: 'Live' },
});

const from = defineSource(environments);

export default defineConfig(environments, {
  origin: from.env('APP_ORIGIN').default('http://localhost:3000'),
});
```

Environment names are non-empty technical identifiers without whitespace. Aliases are optional user-facing labels.

## CLI

Prepare the application metadata:

```bash
buildplease build
```

This generates:

```text
.buildplease/
├── build.ts
├── environment.ts
└── index.ts
```

Run a command with a selected environment:

```bash
buildplease run --env production -- node dist/main.js
```

`run` transports the selected environment to the child process. It does not modify `NODE_ENV`.

## Runtime

Load the prepared build and selected configuration from Node.js:

```ts
import { loadBuild, loadSelectedEnvironmentConfig, resolveConfig } from '@buildplease/core/node';

const build = await loadBuild();
const loaded = await loadSelectedEnvironmentConfig();
const config = await resolveConfig(loaded.config, {
  build,
  environment: loaded.environment,
});
```

## License

MIT
