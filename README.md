<div align="center">
  <h1>BuildPlease</h1>
  <p><strong>A modular TypeScript framework ecosystem for Node.js, the browser, and Nuxt.</strong></p>
  <p>
    <img alt="pnpm" src="https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white">
    <img alt="Turborepo" src="https://img.shields.io/badge/Turborepo-000000?logo=turborepo&logoColor=white">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white">
    <img alt="tsdown" src="https://img.shields.io/badge/tsdown-3178C6">
    <img alt="unrun" src="https://img.shields.io/badge/unrun-6B7280">
    <img alt="Vitest" src="https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white">
  </p>
  <p>
    <a href="#-packages">Packages</a> ·
    <a href="#-architecture">Architecture</a> ·
    <a href="#-engineering-rules">Rules</a> ·
    <a href="./CONTRIBUTING.md">Contributing</a> ·
    <a href="./LICENSE">License</a>
  </p>
</div>

---

BuildPlease is a TypeScript monorepo containing shared runtime, backend, browser, Nuxt, and development tooling packages.

## 📦 Packages

| Package                                      | Runtime           | Responsibility                                                                                                                   |
| -------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`@buildplease/core`](./packages/core)       | Browser + Node.js | Shared foundation: DI, models, validation, localization, security, utilities, and Node-specific helpers.                         |
| [`@buildplease/apikit`](./packages/apikit)   | Node.js           | Backend framework: configuration, HTTP/server, files, email, OpenAPI, localization, security, notifications, and infrastructure. |
| [`@buildplease/webkit`](./packages/webkit)   | Browser           | Browser foundation with DI, networking, localization, and shared models.                                                         |
| [`@buildplease/nuxtkit`](./packages/nuxtkit) | Nuxt              | Nuxt module and runtime integration built on top of WebKit.                                                                      |
| [`@buildplease/devkit`](./packages/devkit)   | Node.js / CLI     | Repository tooling for formatting, linting, dependency maintenance, cleanup, and project hygiene.                                |

## 🧭 Architecture

```text
                         ┌──────────────────────┐
                         │        Core          │
                         │ shared contracts     │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
          ┌─────────▼─────────┐           ┌─────────▼─────────┐
          │      ApiKit       │           │      WebKit       │
          │      Node.js      │           │      Browser      │
          └───────────────────┘           └─────────┬─────────┘
                                                    │
                                          ┌─────────▼─────────┐
                                          │      NuxtKit      │
                                          │       Nuxt        │
                                          └───────────────────┘

          DevKit → repository and development tooling
```

Public runtime entry points:

```text
@buildplease/core        shared runtime
@buildplease/core/node   Node.js helpers
@buildplease/apikit      Node.js backend
@buildplease/webkit      browser runtime
@buildplease/webkit/node Node.js helpers for WebKit tooling
@buildplease/nuxtkit     Nuxt module + runtime integration
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## 🔒 License

[MIT](./LICENSE)
