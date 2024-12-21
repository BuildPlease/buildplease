# Nuxt Zod i18n

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A Nuxt Module for localizing zod error messages.

## Features

<!-- Highlight some of the features your module provide here -->

- This library depends on [@nuxtjs/i18n](https://i18n.nuxtjs.org/) .
- Provide a Global error map for zod see [Zod ERROR_HANDLING](https://zod.dev/ERROR_HANDLING?id=global-error-map)
- Translation for zod errors based on [ZodIssueCode](https://zod.dev/ERROR_HANDLING?id=zodissuecode)
- Support translation of custom errors
- Support pluralization

## Quick Setup

1. Add `nuxt-zod-i18n` dependency to your project

```bash
npx nuxi@latest module add @meowv/nuxt-zod-i18n
```

2. Add `@meowv/zodi18n` to the `modules` section of `nuxt.config.ts` before `@nuxtjs/i18n` module

```js
export default defineNuxtConfig({
  modules: ['@meowv/nuxt-zod-i18n', '@nuxtjs/i18n']
})
```

That's it! You can now use Nuxt zodi18n in your Nuxt app ✨

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-zod-i18n/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-zod-i18n
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-zod-i18n.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-zod-i18n
[license-src]: https://img.shields.io/npm/l/nuxt-zod-i18n.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-zod-i18n
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
