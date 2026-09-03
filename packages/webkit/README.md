# @buildplease/webkit

WebKit is the BuildPlease runtime and infrastructure kit for web applications.

## Installation

```bash
pnpm add @buildplease/core @buildplease/webkit
```

## Configuration

Define `environment.config.ts`:

```ts
import { defineEnvironments, defineSource, defineWebKitConfig } from '@buildplease/webkit/node';

const environments = defineEnvironments({
  test: { file: '.env.test' },
  production: { file: '.env.production' },
});

const from = defineSource(environments);

export default defineWebKitConfig(environments, {
  origin: {
    api: from.env('API_ORIGIN'),
  },
});
```

## Browser runtime

```ts
import { WebKitApplication } from '@buildplease/webkit/browser';
import { appAssembly } from './app';

const runtime = await WebKitApplication.run({
  hooks: {
    assemblies: () => [...appAssembly()],
  },
});
```

## Node runtime

```ts
import { WebKitApplication } from '@buildplease/webkit/node';
import { appAssembly } from './app';

const runtime = await WebKitApplication.run({
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
