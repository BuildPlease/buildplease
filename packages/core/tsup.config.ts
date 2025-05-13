import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  minify: true,
  bundle: true,
  shims: false,
  splitting: true,
  sourcemap: false,
  treeshake: true,
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  target: 'esnext',
  outDir: 'dist',
  platform: 'neutral',
  tsconfig: 'tsconfig.json',
  external: [
    // Node built-ins
    'fs',
    'path',
    'node:*',

    // Decorator metadata
    'reflect-metadata',

    // External dependencies
    'inversify',
    'ms',
    'date-fns',
  ],
});
