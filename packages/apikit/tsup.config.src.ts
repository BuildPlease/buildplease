import fs from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'tsup';
import { resolvePath, loadPackageJSON, makeExternals } from '@meawkit/core/node';

const outDir = 'dist/src';
const pkg = loadPackageJSON(resolvePath(import.meta.url, './package.json'));

const externals = makeExternals(pkg, {
  includeNodeBuiltins: true,
  bundled: [],
});

export default defineConfig([
  {
    entry: {
      index: './src/index.ts',
    },
    tsconfig: 'tsconfig.json',
    platform: 'node',
    target: 'esnext',
    format: ['cjs', 'esm'],

    outDir: outDir,
    clean: true,

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
