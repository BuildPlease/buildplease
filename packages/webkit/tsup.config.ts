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
  platform: 'browser',
  tsconfig: 'tsconfig.json',
  external: [
    // Node built-ins (polyfilled or ignored in browser)
    'fs',
    'path',
    'node:*',

    // Decorator metadata
    'reflect-metadata',

    // External runtime dependencies
    'axios',
    'inversify',
    'zod',

    // Internal workspace packages
    '@nidavellirx/meowv-core',
  ],
});
