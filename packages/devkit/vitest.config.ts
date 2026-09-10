import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

const rootDir = import.meta.dirname;

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    fileParallelism: false,
    pool: 'forks',
    include: ['test/**/*.test.ts'],
  },

  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: `${resolve(rootDir, 'src')}/$1` },
      { find: /^@src-cli\/(.*)$/, replacement: `${resolve(rootDir, 'src-cli')}/$1` },
      { find: /^@src-internal\/(.*)$/, replacement: `${resolve(rootDir, 'src-internal')}/$1` },

      // MARK: - Tests
      { find: /^#test\/(.*)$/, replacement: `${resolve(rootDir, 'test')}/$1` },
    ],
  },
});
