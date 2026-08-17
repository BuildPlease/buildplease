import { loadPackageJSON, makeDependencyBundlingPolicy, resolvePath } from '@buildplease/core/node';
import { defineConfig } from 'tsdown';

const outDir = 'dist';
const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const policy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: true,
  includePeers: true,
  includeDependencies: true,
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

  hash: false,
  dts: false,
  minify: true,
  shims: false,
  sourcemap: false,
  treeshake: true,

  deps: {
    neverBundle: policy.external,
    alwaysBundle: policy.bundle,
    onlyBundle: policy.bundle,
  },
});
