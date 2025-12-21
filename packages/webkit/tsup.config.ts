import { defineConfig } from 'tsup';
import pkg from './package.json' assert { type: 'json' };

type PackageJson = {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const packageJson = pkg as PackageJson;

const bundledDependencies: string[] = []; /* Bundled dependencies */
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
  outDir: 'dist',
  clean: true,
  entry: ['index.ts'],

  minify: true,
  bundle: true,
  shims: false,
  splitting: true,
  sourcemap: false,
  treeshake: true,
  dts: true,

  tsconfig: 'tsconfig.json',
  platform: 'browser',
  target: 'esnext',
  format: ['cjs', 'esm'],

  external: externals,
});
