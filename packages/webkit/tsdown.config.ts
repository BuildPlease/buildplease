import { loadPackageJSON, makeDependencyBundlingPolicy, resolvePath } from '@buildplease/core/node';
import { type CopyEntry, defineConfig } from 'tsdown';

const outDir = 'dist';
const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const browserPolicy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: false,
});

const nodePolicy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: true,
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
    copy: copyResources(),

    hash: false,
    dts: true,
    minify: true,
    shims: false,
    sourcemap: false,
    treeshake: true,

    deps: {
      neverBundle: browserPolicy.external,
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
