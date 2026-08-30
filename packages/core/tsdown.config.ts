import { type CopyEntry, defineConfig } from 'tsdown';

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
    copy: copyResources(),

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

  // MARK: - CLI entry
  {
    entry: { 'cli/index': './src-cli/index.ts' },
    tsconfig: 'tsconfig.json',
    platform: 'node',
    target: 'esnext',
    format: ['esm'],

    outDir: outDir,
    clean: false,

    hash: false,
    dts: false,
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

function copyResources(): CopyEntry[] {
  return [
    {
      from: ['resources/**/*', '!resources/index.ts'],
      to: 'dist/resources',
      flatten: false,
    },
  ];
}
