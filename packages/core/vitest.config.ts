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
      { find: /^@internal\/(.*)$/, replacement: `${resolve(rootDir, 'src-internal')}/$1` },
      { find: /^@node$/, replacement: resolve(rootDir, 'src-node/index.ts') },
      { find: /^@node\/(.*)$/, replacement: `${resolve(rootDir, 'src-node')}/$1` },
      { find: /^@test\/(.*)$/, replacement: `${resolve(rootDir, 'test')}/$1` },
      { find: /^@resources$/, replacement: resolve(rootDir, 'resources.config.ts') },
    ],
  },
});
