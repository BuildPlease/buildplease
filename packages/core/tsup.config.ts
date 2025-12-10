import { defineConfig } from 'tsup';

import pkg from './package.json' assert { type: 'json' };

const workspacePackages: string[] = [];
const peers = Object.keys(pkg.peerDependencies ?? {});

export default defineConfig({
  outDir: 'dist',
  clean: true,

  entry: ['index.ts'],

  minify: true,
  bundle: true,
  shims: false,
  splitting: true,
  sourcemap: false,
  treeshake: true,
  dts: true,

  tsconfig: 'tsconfig.json',
  platform: 'neutral',
  target: 'esnext',
  format: ['cjs', 'esm'],

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
