# @buildplease/nuxtkit

NuxtKit brings BuildPlease application architecture and runtime utilities to Nuxt applications.

## Features

- BuildPlease dependency injection and application scopes for Nuxt
- runtime composables and application architecture helpers
- Nuxt UI integration
- i18n and L10n integration
- localized Zod validation
- shared runtime components and utilities

## Installation

Install NuxtKit:

```bash
pnpm add @buildplease/nuxtkit
```

Add it to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@buildplease/nuxtkit'],
});
```

## Configuration

NuxtKit can be configured through `buildpleaseNuxtKit` in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@buildplease/nuxtkit'],

  buildpleaseNuxtKit: {
    debug: false,
  },
});
```

## License

MIT
