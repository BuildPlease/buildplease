# @buildplease/webkit

WebKit is the BuildPlease application kit for browser applications. It builds on Core and provides shared web application architecture and runtime primitives without depending on a specific frontend framework.

## Installation

```bash
pnpm add @buildplease/webkit
```

## Node configuration

WebKit reuses the Core Environment Configuration engine. Its `defineConfig()` policy requires only an object root and keeps the complete app-owned shape fully typed and free-form.

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

## Features

- browser application architecture and dependency injection
- asynchronous operations and remote resources
- transport-independent HTTP primitives
- request interception and error handling
- shared web models and utilities
- L10n integration

## License

MIT
