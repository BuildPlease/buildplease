// build.config.ts
import path from 'node:path';

import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/cli/index', 'src/core/index'],
  declaration: 'compatible',
  clean: true,
  externals: [
    'node:module',
    'node:path',
    'node:process',
    'consola',
    'citty',
    'unconfig',
  ],
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@/core': path.resolve(__dirname, 'src/core/index.ts'),
    '@/cli': path.resolve(__dirname, 'src/cli/index.ts'),
  },
  rollup: {
    emitCJS: false,
    esbuild: {
      target: 'node18',
    },
    dts: {
      respectExternal: true,
    },
  },
});
