import { builtinModules } from 'node:module';
import { defineConfig } from 'tsup';

const outDir = 'dist/cli';

const builtins = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`), 'node:*']);
const externals = [...builtins]

export default defineConfig({
  outDir: outDir,
  clean: [outDir],

  entry: {
    index: 'src/cli/index.ts',
  },

  minify: true,
  bundle: true,
  shims: false,
  splitting: false,
  sourcemap: false,
  treeshake: true,
  dts: false,

  tsconfig: 'tsconfig.json',

  platform: 'node',
  target: 'esnext',
  format: ['esm'],

  external: externals,
});
