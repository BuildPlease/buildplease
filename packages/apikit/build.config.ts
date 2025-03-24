import path from 'node:path';

import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/cli/index', 'src/core/index'],
  declaration: true,
  clean: true,
  // MARK: - External Dependencies (to prevent bundling)
  externals: [
    'node:module',
    'node:path',
    'node:process',
    'consola',
    'citty',
    'jiti',
    '@dotenvx/dotenvx',
  ],
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '#': path.resolve(__dirname, 'src/core'),
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
