# @buildplease/apikit

ApiKit is the BuildPlease application kit for backend services and APIs. It builds on Core and provides the runtime and infrastructure needed for Fastify applications.

## Installation

```bash
pnpm add @buildplease/apikit
```

## Usage

```ts
import { defineApiKit, ServerController } from '@buildplease/apikit';
```

ApiKit also exposes the BuildPlease primitives commonly used by backend applications.

## Features

- typed application configuration and environments
- Fastify server and HTTP infrastructure
- dependency injection and application assemblies
- validation, errors, formatting, and normalization
- i18n and L10n integration
- OpenAPI, notifications, email, files, and database helpers
- backend CLI tooling

## License

MIT
