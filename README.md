<div align="center">
  <h1>BuildPlease</h1>
  <p><strong>A TypeScript application framework for backend, web, Nuxt, and development tooling.</strong></p>
  <p>
    <img alt="pnpm" src="https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white">
    <img alt="Turborepo" src="https://img.shields.io/badge/Turborepo-000000?logo=turborepo&logoColor=white">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white">
    <img alt="Vitest" src="https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white">
  </p>
  <p>
    <a href="#-packages">Packages</a> ·
    <a href="./CONTRIBUTING.md">Contributing</a> ·
    <a href="./LICENSE">License</a>
  </p>
</div>

Backend and frontend artifacts are fundamentally different by nature.
BuildPlease does not try to hide that difference — it gives both the same foundation, and lets them diverge only where they truly must.

## Packages

| Package                         | Purpose                                            |
| ------------------------------- | -------------------------------------------------- |
| [`Core`](./packages/core)       | Application foundation, configuration, and CLI     |
| [`ApiKit`](./packages/apikit)   | Backend/API runtime and infrastructure             |
| [`WebKit`](./packages/webkit)   | Framework-agnostic web runtime and networking      |
| [`NuxtKit`](./packages/nuxtkit) | Nuxt module, localization, validation, and helpers |
| [`DevKit`](./packages/devkit)   | Shared development tooling                         |

See each package README for its public API and setup.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
