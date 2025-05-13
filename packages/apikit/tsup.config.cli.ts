import { defineConfig } from 'tsup';

const outDir = 'dist/cli';

export default defineConfig({
  outDir: outDir,
  clean: [outDir],

  entry: {
    index: 'src/cli/index.ts',
  },

  minify: true,
  bundle: true,
  shims: false,
  splitting: true,
  sourcemap: false,
  treeshake: true,
  dts: false,

  tsconfig: 'tsconfig.json',

  platform: 'node',
  target: 'esnext',
  format: ['esm'],
  external: [
    // Node built-ins
    'fs',
    'path',
    'node:*',

    // CLI utilities
    'citty',
    'jiti',
    '@dotenvx/dotenvx',
  ],
});
