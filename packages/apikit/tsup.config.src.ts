import pkg from './package.json' assert { type: 'json' };
import fs from 'node:fs';
import path from 'node:path';
import { builtinModules } from 'node:module';
import { defineConfig } from 'tsup';

import { resolvePath } from './src/core/file';

type PackageJson = {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const outDir = 'dist/src';

const bundledDependencies: string[] = []; /* Bundled dependencies */
const packageJson = pkg as PackageJson;
const peers = Object.keys(packageJson.peerDependencies ?? {});
const deps = Object.keys(packageJson.dependencies ?? {});
const depsToExternalize = deps.filter((name) => !bundledDependencies.includes(name));
const builtins = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`), 'node:*']);

const externals = [
  ...builtins,

  ...peers,
  ...peers.map((name) => `${name}/*`),

  ...depsToExternalize,
  ...depsToExternalize.map((name) => `${name}/*`),
];

export default defineConfig({
  entry: {
    index: 'index.ts',
  },
  tsconfig: 'tsconfig.json',
  platform: 'node',
  target: 'esnext',
  format: ['cjs', 'esm'],

  outDir: outDir,
  clean: [outDir],

  dts: true,
  minify: true,
  bundle: true,
  shims: false,
  sourcemap: false,
  splitting: false,
  treeshake: true,

  external: externals,

  onSuccess: async () => {
    await copyLocales();
  },
});

async function copyLocales(): Promise<void> {
  const sourceLocalesDir = resolvePath(import.meta.url, './src/core/i18n/locales');
  const destLocalesDir = resolvePath(import.meta.url, `./${outDir}/locales`);

  const entries = await fs.promises.readdir(sourceLocalesDir, { withFileTypes: true });
  await fs.promises.mkdir(destLocalesDir, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(sourceLocalesDir, entry.name);
    const destPath = path.join(destLocalesDir, entry.name);

    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath);
      continue;
    }

    await fs.promises.copyFile(srcPath, destPath);
  }

  console.log('✅ Copied localization files to:', destLocalesDir);
}

async function copyRecursive(sourcePath: string, destinationPath: string): Promise<void> {
  const entries = await fs.promises.readdir(sourcePath, { withFileTypes: true });
  await fs.promises.mkdir(destinationPath, { recursive: true });

  for (const entry of entries) {
    const entrySourcePath = path.join(sourcePath, entry.name);
    const entryDestinationPath = path.join(destinationPath, entry.name);

    if (entry.isDirectory()) {
      await copyRecursive(entrySourcePath, entryDestinationPath);
      continue;
    }

    await fs.promises.copyFile(entrySourcePath, entryDestinationPath);
  }
}
