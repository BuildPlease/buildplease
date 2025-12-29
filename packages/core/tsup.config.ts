import { defineConfig } from 'tsup';

import { resolvePath, loadPackageJson } from '@node';

const pkg = loadPackageJson(resolvePath(import.meta.url, './package.json'));
const peers = Object.keys(pkg.peerDependencies);
const deps = Object.keys(pkg.dependencies);

const bundledDependencies: string[] = []; /* Bundled dependencies */
const depsToExternalize = deps.filter((name) => !bundledDependencies.includes(name));
const externals = [
  ...peers,
  ...peers.map((name) => `${name}/*`),

  ...depsToExternalize,
  ...depsToExternalize.map((name) => `${name}/*`),
];

export default defineConfig({
  entry: {
    'src/index': './index.ts',
    'src-node/index': './src-node/index.ts',
  },
  tsconfig: 'tsconfig.json',
  platform: 'neutral',
  target: 'esnext',
  format: ['cjs', 'esm'],

  outDir: 'dist',
  clean: true,

  dts: true,
  minify: true,
  bundle: true,
  shims: false,
  sourcemap: false,
  splitting: false,
  treeshake: true,

  external: externals,
});
