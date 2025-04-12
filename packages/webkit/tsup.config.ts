import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  minify: false,
  bundle: true,
  shims: false,
  splitting: false,
  sourcemap: false,
  treeshake: false,
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
    '@nidavellirx/*',
  ],
});
