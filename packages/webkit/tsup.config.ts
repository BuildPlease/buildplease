import { defineConfig } from 'tsup';
import { resolvePath, loadPackageJSON, makeExternals } from '@nidavellirx/meowv-core/node';

const outDir = 'dist';
const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const externalsBrowser = makeExternals(pkg, {
  includeNodeBuiltins: false,
  bundled: [],
});
const externalsNode = makeExternals(pkg, {
  includeNodeBuiltins: true,
  bundled: [],
});

export default defineConfig([
  // MARK: - Browser entry
  {
    entry: { 'src/index': './src/index.ts' },
    tsconfig: 'tsconfig.json',
    platform: 'browser',
    target: 'esnext',
    format: ['esm'],

    outDir: outDir,
    clean: true,

    dts: true,
    minify: true,
    bundle: true,
    shims: false,
    sourcemap: false,
    splitting: false,
    treeshake: true,

    external: externalsBrowser,
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

    dts: true,
    minify: true,
    bundle: true,
    shims: false,
    sourcemap: false,
    splitting: false,
    treeshake: true,

    external: externalsNode,
  },
]);
