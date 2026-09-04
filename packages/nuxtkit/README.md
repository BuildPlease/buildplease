# @buildplease/nuxtkit

NuxtKit provides fundamental & usefull utilities and integrations for Nuxt applications.

## Features

- i18n and L10n integration
- localized Zod validation
- error presentation helpers
- networking layer and http basics
- Nuxt composables and runtime helpers

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

## License

MIT
