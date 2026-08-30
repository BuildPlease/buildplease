# @buildplease/webkit

WebKit provides shared runtime, dependency injection, networking, and application primitives for web applications.

## Installation

```bash
pnpm add @buildplease/webkit
```

## Configuration

Define `environment.config.ts` with `@buildplease/webkit/node`:

```ts
import { defineConfig, defineEnvironments, defineSource } from '@buildplease/webkit/node';

const environments = defineEnvironments({
  test: { file: '.env.test' },
  production: { file: '.env.production' },
});

const from = defineSource(environments);

export default defineConfig(environments, {
  origin: {
    api: from.env('ORIGIN_API'),
  },
});
```

## Browser runtime

```ts
import { runWebKit } from '@buildplease/webkit';

await runWebKit({
  hooks: {
    assemblies: () => [...makeAssemblies()],

    prepare: ({ scope }) => {
      // optional app preparation
    },
  },
});
```

## Node / SSR runtime

```ts
import { runWebKit } from '@buildplease/webkit/node';

await runWebKit({
  hooks: {
    assemblies: () => [...makeAssemblies()],

    prepare: ({ scope }) => {
      // optional SSR preparation
    },

    close: ({ scope }) => {
      // optional cleanup
    },
  },
});
```

## Features

- browser application architecture and dependency injection
- asynchronous operations and remote resources
- transport-independent HTTP primitives
- request interception and error handling
- shared web models and utilities
- L10n integration

## License

MIT
