import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

const rootDir = import.meta.dirname;

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['test/**/*.test.ts'],
    fileParallelism: false,
    pool: 'forks',
  },

  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: `${resolve(rootDir, 'src')}/$1` },
      { find: /^@src-cli\/(.*)$/, replacement: `${resolve(rootDir, 'src-cli')}/$1` },
      { find: /^@src-internal\/(.*)$/, replacement: `${resolve(rootDir, 'src-internal')}/$1` },
      { find: /^#test\/(.*)$/, replacement: `${resolve(rootDir, 'test')}/$1` },
    ],
  },
});
