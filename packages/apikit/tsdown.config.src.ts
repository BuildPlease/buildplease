import fs from 'node:fs';
import path from 'node:path';

import { loadPackageJSON, makeDependencyBundlingPolicy, resolvePath } from '@meawkit/core/node';
import { defineConfig } from 'tsdown';

const outDir = 'dist/src';
const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const policy = makeDependencyBundlingPolicy(pkg, {
  includeNodeBuiltins: true,
  bundle: ['@meawkit/identity'],
});

export default defineConfig([
  {
    entry: {
      index: './src/index.ts',
    },
    tsconfig: 'tsconfig.json',
    platform: 'node',
    target: 'esnext',
    format: ['esm', 'cjs'],

    outDir: outDir,
    clean: true,

    hash: false,
    dts: true,
    minify: true,
    shims: false,
    sourcemap: false,
    treeshake: true,

    deps: {
      neverBundle: policy.external,
      alwaysBundle: policy.bundle,
      onlyBundle: policy.bundle,
    },

    hooks: {
      'build:done': async () => {
        await copyLocales();
      },
    },
  },
]);

// MARK: - Locales

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
