<div align="center">
  <h1>BuildPlease</h1>
  <p><strong>A modular TypeScript framework ecosystem for Node.js, the browser, and Nuxt.</strong></p>
  <p>
    <code>@buildplease/core</code> ·
    <code>@buildplease/apikit</code> ·
    <code>@buildplease/webkit</code> ·
    <code>@buildplease/nuxtkit</code> ·
    <code>@buildplease/devkit</code>
  </p>
  <p>
    <a href="#-packages">Packages</a> ·
    <a href="#-architecture">Architecture</a> ·
    <a href="#-development">Development</a> ·
    <a href="#-engineering-rules">Rules</a> ·
    <a href="./CONTRIBUTING.md">Contributing</a> ·
    <a href="./LICENSE">License</a>
  </p>
</div>

---

BuildPlease keeps shared contracts small and runtime ownership explicit. Common primitives live in **Core**, backend concerns belong to **ApiKit**, browser concerns belong to **WebKit**, and **NuxtKit** connects the web stack to Nuxt.

The workspace is a TypeScript monorepo built around explicit package boundaries, public exports, and predictable runtime ownership.

## 📦 Packages

| Package                                      | Runtime           | Responsibility                                                                                                                          |
| -------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [`@buildplease/core`](./packages/core)       | Browser + Node.js | Shared foundation: DI, models, validation, localization, security, utilities, and Node-specific helpers.                                |
| [`@buildplease/apikit`](./packages/apikit)   | Node.js           | Backend application framework: configuration, HTTP/server, files, email, OpenAPI, localization, security, and infrastructure contracts. |
| [`@buildplease/webkit`](./packages/webkit)   | Browser           | Browser application foundation with DI, networking, localization, and shared models.                                                    |
| [`@buildplease/nuxtkit`](./packages/nuxtkit) | Nuxt              | Nuxt module and runtime integration built on top of WebKit.                                                                             |
| [`@buildplease/devkit`](./packages/devkit)   | Node.js / CLI     | Repository tooling for formatting, linting, dependency maintenance, cleanup, and project hygiene.                                       |

> The workspace also contains private repository-only packages used internally by the framework and its build.

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

Runtime-specific code stays behind the package export that owns it:

```text
@buildplease/core        shared runtime
@buildplease/core/node   Node.js helpers
@buildplease/apikit      Node.js backend
@buildplease/webkit      browser runtime
@buildplease/webkit/node Node.js helpers for WebKit tooling
@buildplease/nuxtkit     Nuxt module + runtime integration
```

Package-internal source paths are not public API. Across package boundaries, consume the declared package exports.

## 🚀 Installation

Install only the layer your application needs.

```bash
pnpm add @buildplease/core
```

Typical entry points:

```bash
# Backend
pnpm add @buildplease/apikit

# Browser
pnpm add @buildplease/webkit

# Nuxt
pnpm add @buildplease/nuxtkit
```

Peer dependencies remain owned by the consuming application where applicable.

## 🛠 Development

BuildPlease uses **pnpm** and **Turborepo**.

```bash
corepack enable
pnpm install --frozen-lockfile

pnpm build
pnpm typecheck
pnpm test
```

Repository cleanup and formatting are provided by DevKit:

```bash
pnpm clean
pnpm format
```

<details>
<summary><strong>Useful workspace commands</strong></summary>

| Command           | Purpose                                       |
| ----------------- | --------------------------------------------- |
| `pnpm build`      | Build workspace packages in dependency order. |
| `pnpm typecheck`  | Run TypeScript checks across the workspace.   |
| `pnpm test`       | Run package test suites.                      |
| `pnpm clean`      | Remove generated build artifacts.             |
| `pnpm clean:deep` | Perform a deeper workspace cleanup.           |
| `pnpm dep:check`  | Check dependency updates.                     |
| `pnpm dep:update` | Interactively update dependencies.            |
| `pnpm format`     | Apply formatting and lint fixes.              |

</details>

## 📐 Engineering rules

Before changing source code, read [`rules/README.md`](./rules/README.md) and the rules relevant to the area being changed.

The repository follows a small set of principles:

- keep ownership and runtime boundaries explicit;
- prefer public package exports across package boundaries;
- keep aliases aligned with physical source and semantic namespaces;
- keep build, TypeScript, and test resolvers consistent;
- prefer KISS, SOLID, DRY, and YAGNI over speculative abstraction.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for repository setup, conventions, validation, and pull-request guidance.

## 🔒 License

BuildPlease is proprietary software. See [LICENSE](./LICENSE) for the applicable terms.
