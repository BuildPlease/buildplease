import { defineConfig } from 'tsup';

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
});
