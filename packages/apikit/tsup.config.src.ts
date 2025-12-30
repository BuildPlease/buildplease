import fs from 'node:fs';
import path from 'node:path';
import { builtinModules } from 'node:module';

import { defineConfig } from 'tsup';

import { resolvePath, loadPackageJson } from '@nidavellirx/meowv-core/node';
import { Logger } from '@internal/utils';

const outDir = 'dist/src';

const pkg = loadPackageJson(resolvePath(import.meta.url, './package.json'));
const peers = Object.keys(pkg.peerDependencies);
const deps = Object.keys(pkg.dependencies);

const bundledDependencies: string[] = []; /* Bundled dependencies */
const depsToExternalize = deps.filter((name) => !bundledDependencies.includes(name));
const builtins = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`), 'node:*']);
const externals = [
  ...builtins,

  ...peers,
  ...peers.map((name) => `${name}/*`),

  ...depsToExternalize,
  ...depsToExternalize.map((name) => `${name}/*`),
];

export default defineConfig([
  // MARK: - Main
  {
    entry: {
      index: './index.ts',
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
  },
  // MARK: - Type agumentation only
  {
    entry: {
      'types/index': './types/index.ts',
    },
    tsconfig: 'tsconfig.json',
    platform: 'node',
    target: 'esnext',
    format: ['esm'],

    outDir: outDir,
    clean: false,

    dts: { only: true },
    bundle: false,
    minify: false,
    sourcemap: false,
    splitting: false,
    treeshake: true,

    external: externals,
  },
]);

async function copyLocales(): Promise<void> {
  const sourceLocalesDir = resolvePath(import.meta.url, './src/i18n/locales');
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

  Logger.success('Copied localization files', { from: sourceLocalesDir, to: destLocalesDir });
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
