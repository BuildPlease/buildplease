# @buildplease/devkit

DevKit provides shared development tooling for TypeScript repositories.

## Installation

```bash
pnpm add -D @buildplease/devkit
```

## Configuration

Define `devkit.config.ts` when repository defaults need to be extended:

```ts
import { defineDevKitConfig } from '@buildplease/devkit';

export default defineDevKitConfig({
  format: {
    include: ['apps', 'packages'],
  },
});
```

## Commands

```bash
pnpm exec devkit run format
pnpm exec devkit run lint
pnpm exec devkit run dep-check
pnpm exec devkit run clean
```

## License

MIT
