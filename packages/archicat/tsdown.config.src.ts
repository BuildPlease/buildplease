import { loadPackageJSON, makeDependencyBundlingPolicy, resolvePath } from '@buildplease/core/node';
import { defineConfig } from 'tsdown';

const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const policy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: true,
});

export default defineConfig({
  entry: './src/index.ts',
  tsconfig: 'tsconfig.json',
  platform: 'node',
  target: 'esnext',
  format: ['esm', 'cjs'],

  outDir: 'dist/src',
  clean: true,

  hash: false,
  dts: true,
  minify: true,
  shims: false,
  sourcemap: false,
  treeshake: true,

  deps: {
    neverBundle: policy.external,
    onlyBundle: false,
  },
});
