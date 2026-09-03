import { loadPackageJSON, makeDependencyBundlingPolicy, resolvePath } from '@buildplease/core/node';
import { type CopyEntry, defineConfig } from 'tsdown';

const outDir = 'dist';
const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const portablePolicy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: false,
});

const nodePolicy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: true,
});

export default defineConfig([
  // MARK: - Neutral entry
  {
    entry: { 'src-neutral/index': './src-neutral/index.ts' },
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
      neverBundle: portablePolicy.external,
      onlyBundle: false,
    },
  },

  // MARK: - Browser entry
  {
    entry: { 'src-application/browser': './src-application/browser.ts' },
    tsconfig: 'tsconfig.browser.json',
    platform: 'browser',
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
      neverBundle: portablePolicy.external,
      onlyBundle: false,
    },
  },

  // MARK: - Node entry
  {
    entry: { 'src-application/node': './src-application/node.ts' },
    tsconfig: 'tsconfig.node.json',
    platform: 'node',
    target: 'esnext',
    format: ['esm', 'cjs'],

    outDir: outDir,
    clean: false,

    hash: false,
    dts: true,
    minify: false,
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
