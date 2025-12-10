import { defineConfig } from 'tsup';

import pkg from './package.json' assert { type: 'json' };

const peers = Object.keys(pkg.peerDependencies ?? {});
const workspacePackages: string[] = ['@nidavellirx/meowv-core'];

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
  platform: 'browser',
  target: 'esnext',
  format: ['cjs', 'esm'],

  external: ['reflect-metadata', ...peers, ...workspacePackages],
});
