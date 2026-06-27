import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

const rootDir = import.meta.dirname;

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['test/**/*.test.ts'],
  },

  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: `${resolve(rootDir, 'src')}/$1` },
      { find: /^@cli\/(.*)$/, replacement: `${resolve(rootDir, 'src-cli')}/$1` },
      { find: /^@internal\/(.*)$/, replacement: `${resolve(rootDir, 'src-internal')}/$1` },
    ],
  },
});
