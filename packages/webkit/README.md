# @buildplease/webkit

WebKit is the BuildPlease application kit for browser applications. It builds on Core and provides shared web application architecture and runtime primitives without depending on a specific frontend framework.

## Installation

```bash
pnpm add @buildplease/webkit
```

## Usage

```ts
import { webkitAssembly } from '@buildplease/webkit';

const assemblies = webkitAssembly();
```

## Features

- browser application architecture and dependency injection
- asynchronous operations and remote resources
- transport-independent HTTP primitives
- request interception and error handling
- shared web models and utilities
- L10n integration

## License

MIT
