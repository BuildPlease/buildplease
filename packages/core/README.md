# @buildplease/core

Core provides the shared application foundation and configuration primitives.

## Installation

```bash
pnpm add @buildplease/core
```

## Configuration

Core provides typed configuration contracts and resolvers:

```ts
import { defineConfiguration, field, resolveConfiguration } from '@buildplease/core/node';

const ServerConfiguration = defineConfiguration('server', {
  host: field.string(),
  port: field.number(),
});

const server = await resolveConfiguration(ServerConfiguration, {
  host: '127.0.0.1',
  port: 3000,
});
```

## Application runtime

Use the explicit runtime surface:

```ts
import { CoreApplication } from '@buildplease/core/browser';
// or: @buildplease/core/node
```

## License

MIT
