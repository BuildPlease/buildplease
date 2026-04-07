import { loadPackageJSON, makeExternals, resolvePath } from '@meawkit/core/node';
import { defineConfig } from 'tsup';

const outDir = 'dist';
const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const externals = makeExternals(pkg, {
  includeNodeBuiltins: true,
  includePeers: true,
  includeDependencies: true,
  bundled: [],
});

export default defineConfig({
  entry: {
    'cli/index': 'src-cli/index.ts',
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
