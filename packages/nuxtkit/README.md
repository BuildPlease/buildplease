# @buildplease/nuxtkit

NuxtKit integrates BuildPlease with Nuxt. It provides the Nuxt module, runtime composables, application architecture helpers, networking integration, L10n/i18n support, and shared runtime configuration.

## Install

```bash
pnpm add @buildplease/nuxtkit
```

## Usage

Add the module to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@buildplease/nuxtkit'],
});
```

NuxtKit integrates with Nuxt UI and Nuxt i18n and exposes its runtime through Nuxt auto-imports and module configuration.

## What’s included

- Nuxt module and runtime integration
- dependency injection and scoped application architecture
- runtime composables and infrastructure
- remote-resource networking helpers
- L10n/i18n and Zod localization
- shared runtime components and configuration

Part of [BuildPlease](https://github.com/BuildPlease/buildplease).
