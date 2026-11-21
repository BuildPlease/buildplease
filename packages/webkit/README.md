# @buildplease/webkit

WebKit is the BuildPlease runtime and infrastructure kit for web applications.

## Installation

```bash
pnpm add @buildplease/core @buildplease/webkit
```

## Configuration

Define `environment.config.ts`:

```ts
import { defineSource, defineWebKitConfig } from '@buildplease/webkit/node';

const from = defineSource();

export default defineWebKitConfig({
  public: {
    apiUrl: from.env('APP_API_URL'),
  },
  private: {
    apiToken: from.env('APP_API_TOKEN'),
  },
});
```

## ENV configuration

Run before the application's framework build:

```bash
webkit build
webkit build --env-file .env.production
```

WebKit generates `.webkit/public.mjs`, `.webkit/private.mjs` and their `.d.mts` declarations. Public ENV values are resolved at build time. Private values are not embedded; the hosting framework supplies them at runtime.

Register imports in the application's `package.json`:

```json
{
  "imports": {
    "#webkit/public": "./.webkit/public.mjs",
    "#webkit/private": "./.webkit/private.mjs"
  }
}
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
