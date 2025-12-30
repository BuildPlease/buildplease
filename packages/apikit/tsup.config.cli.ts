import { builtinModules } from 'node:module';

import { defineConfig } from 'tsup';

const outDir = 'dist/cli';

const builtins = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`), 'node:*']);
const externals = [...builtins];

export default defineConfig({
  entry: {
    index: 'src-cli/index.ts',
  },
  tsconfig: 'tsconfig.json',
  platform: 'node',
  target: 'esnext',
  format: ['esm'],

  outDir: outDir,
  clean: [outDir],

  dts: false,

  minify: true,
  bundle: true,
  shims: false,
  sourcemap: false,
  splitting: false,
  treeshake: true,

  external: externals,
});
