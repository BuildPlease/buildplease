import { loadPackageJSON, makeDependencyBundlingPolicy, resolvePath } from '@meawkit/core/node';
import { type UserConfig, defineConfig } from 'tsdown';

const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const policy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: true,
});

const baseConfig: UserConfig = {
  tsconfig: 'tsconfig.json',
  platform: 'node',
  target: 'esnext',
  format: ['esm', 'cjs'],

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
};

export default defineConfig([
  // MARK: - SRC entry
  {
    ...baseConfig,
    entry: './src/index.ts',
    outDir: 'dist/src',
    clean: true,
  },
  // MARK: - Node test entry
  {
    ...baseConfig,
    entry: './src-node-test/index.ts',
    outDir: 'dist/src-node-test',
    clean: false,
  },
]);
