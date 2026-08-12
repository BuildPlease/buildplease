import { defineConfig } from 'tsdown';

import { makeDependencyBundlingPolicy } from './src-node/bundling';
import { resolvePath } from './src-node/file';
import { loadPackageJSON } from './src-node/package-json';

const outDir = 'dist';
const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const neutralPolicy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: false,
});

const nodePolicy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: true,
});

export default defineConfig([
  // MARK: - Neutral entry
  {
    entry: { 'src/index': './src/index.ts' },
    tsconfig: 'tsconfig.json',
    platform: 'neutral',
    target: 'esnext',
    format: ['esm', 'cjs'],

    outDir: outDir,
    clean: true,

    hash: false,
    dts: true,
    minify: true,
    shims: false,
    sourcemap: false,
    treeshake: true,

    deps: {
      neverBundle: neutralPolicy.external,
      onlyBundle: false,
    },
  },
  // MARK: - Node entry
  {
    entry: { 'src-node/index': './src-node/index.ts' },
    tsconfig: 'tsconfig.json',
    platform: 'node',
    target: 'esnext',
    format: ['esm', 'cjs'],

    outDir: outDir,
    clean: false,

    hash: false,
    dts: true,
    minify: true,
    shims: false,
    sourcemap: false,
    treeshake: true,

    deps: {
      neverBundle: nodePolicy.external,
      onlyBundle: nodePolicy.bundle,
    },
  },

  // MARK: - Node test entry
  {
    entry: { 'src-node-test/index': './src-node-test/index.ts' },
    tsconfig: 'tsconfig.json',
    platform: 'node',
    target: 'esnext',
    format: ['esm', 'cjs'],

    outDir: outDir,
    clean: false,

    hash: false,
    dts: true,
    minify: true,
    shims: false,
    sourcemap: false,
    treeshake: true,

    deps: {
      neverBundle: nodePolicy.external,
      onlyBundle: nodePolicy.bundle,
    },
  },
]);
