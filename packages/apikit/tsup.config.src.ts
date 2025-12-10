import fs from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'tsup';

import { resolvePath } from './src/core/file';

import pkg from './package.json' assert { type: 'json' };

const outDir = 'dist/src';
const workspacePackages: string[] = ['@nidavellirx/meowv-core'];
const peers = Object.keys(pkg.peerDependencies ?? {});

export default defineConfig({
  outDir: outDir,
  clean: [outDir],

  entry: {
    index: 'index.ts',
  },

  minify: true,
  bundle: true,
  shims: false,
  splitting: true,
  sourcemap: false,
  treeshake: true,
  dts: true,

  tsconfig: 'tsconfig.json',
  platform: 'node',
  target: 'esnext',
  format: ['cjs', 'esm'],

  external: ['node:*', 'reflect-metadata', ...peers, ...workspacePackages],

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
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }

  console.log('✅ Copied localization files to:', destLocalesDir);
}

async function copyRecursive(src: string, dest: string): Promise<void> {
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  await fs.promises.mkdir(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}
