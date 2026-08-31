# @buildplease/nuxtkit

NuxtKit provides BuildPlease utilities and integrations for Nuxt applications.

## Installation

```bash
pnpm add @buildplease/nuxtkit
```

## Configuration

Add the module to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@buildplease/nuxtkit'],

  nuxtkit: {
    debug: false,
  },
});
```

NuxtKit configures its Nuxt UI, i18n, and localized Zod integrations through the module.

## Runtime helpers

Runtime composables are auto-imported:

```ts
import { type MyService, Symbols } from '~/app';

const service = useInstance<MyService>(Symbols.MyService);
```

## Features

- Nuxt module and runtime helpers
- i18n and L10n integration
- localized Zod validation
- error presentation helpers
- Nuxt-specific request, cookie, and networking adapters

## License

MIT
