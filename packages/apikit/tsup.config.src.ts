import fs from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'tsup';

import { resolvePath } from './src/core/utils';

const outDir = 'dist/src';

export default defineConfig({
  outDir,
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

  external: [
    'fs',
    'path',
    'node:*',
    'reflect-metadata',
    'pino',
    'pino-pretty',
    'zod',
    'inversify',
    'bcrypt',
    'axios',
    'ejs',
    'validator',
    'libphonenumber-js',
    '@nidavellirx/*',
    '@dotenvx/*',
    'fastify',
    '@fastify/*',
    'fastify-ip',
    'fastify-plugin',
  ],

  onSuccess: async () => {
    await copyLocales();
  },
});

async function copyLocales(): Promise<void> {
  const sourceLocalesDir = resolvePath(import.meta.url, './src/core/localization/locales');
  const destLocalesDir = resolvePath(import.meta.url, './dist/src/locales');

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
