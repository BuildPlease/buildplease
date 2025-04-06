import { defineConfig } from 'tsup';

export default defineConfig({
  outDir: 'dist',
  entry: {
    'cli/index': 'src/cli/index.ts',
    index: 'index.ts',
  },

  minify: true,
  bundle: true,
  shims: false,
  splitting: true,
  sourcemap: false,
  treeshake: true,
  clean: true,
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
    'zod',
    'inversify',
    'citty',
    'jiti',
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
