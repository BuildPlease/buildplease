import { loadPackageJSON, makeDependencyBundlingPolicy, resolvePath } from '@buildplease/core/node';
import { type CopyEntry, type UserConfig, defineConfig } from 'tsdown';

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
  minify: false,
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
    copy: copyResources(),
  },
  // MARK: - Test entry
  {
    ...baseConfig,
    entry: './src-testing/index.ts',
    outDir: 'dist/src-testing',
    clean: false,
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
