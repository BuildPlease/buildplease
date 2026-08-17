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
      { find: /^@src-internal\/(.*)$/, replacement: `${resolve(rootDir, 'src-internal')}/$1` },
      { find: /^@src-node\/(.*)$/, replacement: `${resolve(rootDir, 'src-node')}/$1` },
      { find: /^#l10n$/, replacement: resolve(rootDir, 'src/l10n/index.ts') },
      { find: /^#resources$/, replacement: resolve(rootDir, 'resources/index.ts') },

      { find: /^#test\/(.*)$/, replacement: `${resolve(rootDir, 'test')}/$1` },
    ],
  },
});
