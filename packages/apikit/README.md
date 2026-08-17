# @buildplease/apikit

ApiKit is the BuildPlease backend runtime for Fastify applications. It combines typed application configuration with server infrastructure, dependency injection, validation, localization, HTTP primitives, and common backend services.

## Install

```bash
pnpm add @buildplease/apikit
```

## Usage

ApiKit applications are configured with `defineApiKit` and can use the backend primitives directly from the package:

```ts
import { defineApiKit, defineEnvironments, ServerController } from '@buildplease/apikit';
```

ApiKit also re-exports the Core and Core Node APIs used by backend applications.

## What’s included

- typed configuration and environment loading
- Fastify server, request, response, cookie, CORS, multipart, static, health, and metrics support
- dependency injection and application assemblies
- validation, errors, formatting, and normalization
- i18n and L10n resources
- OpenAPI helpers
- email and notification infrastructure
- files, images, database helpers, cryptography, and tokens
- `apikit` CLI

Part of [BuildPlease](https://github.com/BuildPlease/buildplease).
