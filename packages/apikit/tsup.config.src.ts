import fs from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'tsup';

import { resolvePath } from './src/core/utils';

const outDir = 'dist/src';

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

  external: [
    // Node built-ins
    'fs',
    'path',
    'node:*',

    // Decorator shim
    'reflect-metadata',

    // Internal workspace packages
    '@nidavellirx/meowv-core',

    // External dependencies used in the lib
    'i18next',
    'lodash.merge',
    'inversify',
    'pino',
    'pino-pretty',
    'zod',
    'bcrypt',
    'axios',
    'ejs',
    'validator',
    'libphonenumber-js',
    'nodemailer',

    // Fastify & related plugins
    'fastify',
    '@fastify/cookie',
    '@fastify/static',
    '@fastify/view',
    'fastify-ip',
    'fastify-plugin',

    // ESM config loader
    '@dotenvx/dotenvx',
    'jiti',
  ],

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
