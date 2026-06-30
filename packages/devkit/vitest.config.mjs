import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

const rootDir = import.meta.dirname;

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['test/**/*.test.mjs'],
  },

  resolve: {
    alias: [{ find: /^@test\/(.*)$/, replacement: `${resolve(rootDir, 'test')}/$1` }],
  },
});
