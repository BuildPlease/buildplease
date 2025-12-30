import { defineConfig } from 'tsup';
import { resolvePath, loadPackageJSON, makeExternals } from '@node';

const outDir = 'dist';
const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const externalsNeutral = makeExternals(pkg, {
  includeNodeBuiltins: false,
  bundled: [],
});

const externalsNode = makeExternals(pkg, {
  includeNodeBuiltins: true,
  bundled: [],
});

export default defineConfig([
  // MARK: - Neutral entry
  {
    entry: { 'src/index': './index.ts' },
    tsconfig: 'tsconfig.json',
    platform: 'neutral',
    target: 'esnext',
    format: ['cjs', 'esm'],

    outDir: outDir,
    clean: true,

    dts: true,
    minify: true,
    bundle: true,
    shims: false,
    sourcemap: false,
    splitting: false,
    treeshake: true,

    external: externalsNeutral,
  },
  // MARK: - Node entry
  {
    entry: { 'src-node/index': './src-node/index.ts' },
    tsconfig: 'tsconfig.json',
    platform: 'node',
    target: 'esnext',
    format: ['esm'],

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
