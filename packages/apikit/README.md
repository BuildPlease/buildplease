# @buildplease/apikit

ApiKit is the BuildPlease runtime and infrastructure kit for backend applications.

## Installation

```bash
pnpm add @buildplease/core @buildplease/apikit
```

## Configuration

Define `environment.config.ts`:

```ts
import { defineApiKitConfig, defineEnvironments, defineSource } from '@buildplease/apikit';

const environments = defineEnvironments({
  test: { file: '.env.test' },
  production: { file: '.env.production' },
});

const from = defineSource(environments);

export default defineApiKitConfig(environments, {
  server: {
    identifier: from.compute(({ build, environment }) => {
      return `${build.name.original}:${environment.name}`;
    }),
    host: from.env('SERVER_HOST').default('127.0.0.1'),
    port: from.env('SERVER_PORT').default('30000'),
  },
});
```

## Build

Prepare the application metadata:

```bash
buildplease build
```

## Runtime

Run the application with a selected environment:

```bash
buildplease run --env production -- node dist/main.js
```

Start from the application entrypoint:

```ts
import { ApiKitApplication } from '@buildplease/apikit';
import { appAssembly } from './app';

await ApiKitApplication.run({
  assemblies: () => [...appAssembly()],
});
```

## License

MIT
