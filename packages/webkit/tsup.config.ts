import { defineConfig } from 'tsup';

import pkg from './package.json' assert { type: 'json' };

const peers = Object.keys(pkg.peerDependencies ?? {});
const workspacePackages = ['@nidavellirx/meowv-core'];

export default defineConfig({
  entry: ['index.ts'],
  outDir: 'dist',
  clean: true,
  dts: true,
  minify: true,
  bundle: true,
  splitting: true,
  sourcemap: false,
  treeshake: true,
  format: ['cjs', 'esm'],
  target: 'esnext',
  platform: 'browser',
  tsconfig: 'tsconfig.json',
  external: ['reflect-metadata', ...peers, ...workspacePackages],
});
