import { loadPackageJSON, makeDependencyBundlingPolicy, resolvePath } from '@meawkit/core/node';
import { defineConfig } from 'tsdown';

const outDir = 'dist';
const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const browserPolicy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: false,
  bundle: ['@meawkit/identity'],
});

const nodePolicy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: true,
  bundle: ['@meawkit/identity'],
});

export default defineConfig([
  // MARK: - Browser entry
  {
    entry: { 'src/index': './src/index.ts' },
    tsconfig: 'tsconfig.json',
    platform: 'browser',
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
      neverBundle: browserPolicy.external,
      alwaysBundle: browserPolicy.bundle,
      onlyBundle: browserPolicy.bundle,
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
      alwaysBundle: nodePolicy.bundle,
      onlyBundle: nodePolicy.bundle,
    },
  },
]);
