import { defineConfig } from 'tsup';

import pkg from './package.json' assert { type: 'json' };

const workspacePackages = [];
const peers = Object.keys(pkg.peerDependencies ?? {});

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

    ...peers,
    ...workspacePackages,
  ],
});
