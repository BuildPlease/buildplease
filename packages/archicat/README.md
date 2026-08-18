# ArchiCat

**M²: Modular Mirroring.**

ArchiCat is a Gradle-like generative architecture framework for TypeScript.

TypeScript asks: **will this import resolve?**  
ArchiCat asks: **should this import exist?**

```bash
npm i -D @buildplease/archicat
```

## Core rule

```txt
dependency graph = import permission graph
```

A source may import another ArchiCat target only when the dependency graph allows it.

ArchiCat validates:

```txt
- unknown dependencies
- self dependencies
- API -> implementation dependencies
- circular dependencies
- cross-target source-path imports
```

## Targets

A module or library has two targets:

```txt
module.dummy.api
module.dummy.impl
library.sample.api
library.sample.impl
```

An app is a composition root:

```txt
app.test
```

## Dependency rules

```txt
api  -> api targets only
impl -> own api + declared targets
app  -> declared api/impl targets
```

Implementation targets are not public by default. They are importable only when declared as dependencies.

## Module

```ts
import { defineModule } from '@buildplease/archicat';

export default defineModule({
  name: 'dummy',

  api: {
    root: './api',
    dependencies: ['module.mock.api'],
  },

  impl: {
    root: './impl',
    dependencies: ['module.mock.api', 'library.sample.api'],
  },
});
```

## Library

```ts
import { defineLibrary } from '@buildplease/archicat';

export default defineLibrary({
  name: 'sample',

  api: './api',
  impl: './impl',
});
```

## App

```ts
import { defineApp } from '@buildplease/archicat';

export default defineApp({
  name: 'test',
  root: './src/app',

  dependencies: ['module.dummy.impl', 'library.sample.impl'],
});
```

## Imports

Public API:

```ts
import { dummyApi } from '#modules/dummy/api/index.js';
```

Declared implementation dependency:

```ts
import { dummyImpl } from '#modules/dummy/impl/index.js';
```

Blocked without dependency:

```ts
import { dummyImpl } from '#modules/dummy/impl/index.js';
```

Blocked source-path boundary bypass:

```ts
import { dummyImpl } from '../../dummy/impl/index.js';
```

Local same-target imports stay normal:

```ts
import { dto } from './dto.js';
```

## Config

```ts
import { defineArchicatConfig } from '@buildplease/archicat';

export default defineArchicatConfig({
  typescript: {
    tsConfig: {
      extends: '../../tsconfig.node.json',
      include: ['bootstrap.ts', 'src/app', 'src/libraries', 'src/modules', 'types'],
      exclude: ['node_modules', 'dist'],
    },
  },

  alias: {
    '@app': './src/app/index.ts',
    '@app/*': './src/app/*',
  },

  modules: {
    include: ['./src/modules'],
    alias: '#modules',
  },

  libraries: {
    include: ['./src/libraries'],
    alias: '#library',
  },

  apps: {
    include: ['./src/app'],
  },
});
```

App `tsconfig.json`:

```json
{
  "extends": "./.archicat/tsconfig.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist"
  }
}
```

User aliases belong in `archicat.config.ts`, not in `compilerOptions.paths`.

## Output

```txt
.archicat/
  tsconfig.json
  modules/
  libraries/
  types/
  reports/
    build.report.json
    graph.report.json
```

## Commands

```bash
archicat generate
archicat validate
archicat graph
archicat doctor
```
