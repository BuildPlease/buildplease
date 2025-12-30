import { defineConfig } from 'tsup';
import { resolvePath, loadPackageJSON, makeExternals } from '@nidavellirx/meowv-core/node';

const outDir = 'dist/cli';
const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const externals = makeExternals(pkg, {
  includeNodeBuiltins: true,
  includePeers: true,
  includeDependencies: true,
  bundled: [],
});

export default defineConfig({
  entry: {
    index: 'src-cli/index.ts',
  },
  tsconfig: 'tsconfig.json',
  platform: 'node',
  target: 'esnext',
  format: ['esm'],

  outDir: outDir,
  clean: true,

  dts: false,

  minify: true,
  bundle: true,
  shims: false,
  sourcemap: false,
  splitting: false,
  treeshake: true,

  external: externals,
});
