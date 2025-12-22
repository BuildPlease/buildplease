import pkg from './package.json' assert { type: 'json' };
import { defineConfig } from 'tsup';

type PackageJson = {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const bundledDependencies: string[] = []; /* Bundled dependencies */
const packageJson = pkg as PackageJson;
const peers = Object.keys(packageJson.peerDependencies ?? {});
const deps = Object.keys(packageJson.dependencies ?? {});
const depsToExternalize = deps.filter((name) => !bundledDependencies.includes(name));

const externals = [
  ...peers,
  ...peers.map((name) => `${name}/*`),

  ...depsToExternalize,
  ...depsToExternalize.map((name) => `${name}/*`),
];

export default defineConfig({
  entry: ['index.ts'],
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
