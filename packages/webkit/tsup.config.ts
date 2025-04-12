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
    'fs',
    'path',
    'node:*',
    'reflect-metadata',
    'axios',
    'inversify',
    'zod',
    '@nidavellirx/*',
  ],
});
