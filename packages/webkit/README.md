# @buildplease/webkit

WebKit is the BuildPlease runtime and infrastructure kit for web applications.

## Installation

```bash
pnpm add @buildplease/core @buildplease/webkit
```

## Configuration

Define `environment.config.ts`:

```ts
import { defineConfig, defineEnvironments, defineSource } from '@buildplease/webkit/node';

const environments = defineEnvironments({
  test: { file: '.env.test' },
  production: { file: '.env.production' },
});

const from = defineSource(environments);

export default defineConfig(environments, {
  origin: {
    api: from.env('API_ORIGIN'),
  },
});
```

## Browser runtime

```ts
import { runWebKit } from '@buildplease/webkit';
import { appAssembly } from './app';

const runtime = await runWebKit({
  hooks: {
    assemblies: () => [...appAssembly()],
  },
});
```

## Node runtime

```ts
import { runWebKit } from '@buildplease/webkit/node';
import { appAssembly } from './app';

const runtime = await runWebKit({
  hooks: {
    assemblies: () => [...appAssembly()],
  },
});
```

## Features

- dependency injection and application assemblies
- asynchronous operations and remote resources
- HTTP requests, interception, and error handling
- shared web models and localization resources

## License

MIT
