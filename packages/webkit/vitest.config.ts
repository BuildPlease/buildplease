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
      { find: /^@neutral\/(.*)$/, replacement: `${resolve(rootDir, 'src-neutral')}/$1` },
      { find: /^@browser\/(.*)$/, replacement: `${resolve(rootDir, 'src-browser')}/$1` },
      { find: /^@node\/(.*)$/, replacement: `${resolve(rootDir, 'src-node')}/$1` },
      { find: /^@internal\/neutral\/(.*)$/, replacement: `${resolve(rootDir, 'src-internal/neutral')}/$1` },
      { find: /^@internal\/browser\/(.*)$/, replacement: `${resolve(rootDir, 'src-internal/browser')}/$1` },
      { find: /^@internal\/node\/(.*)$/, replacement: `${resolve(rootDir, 'src-internal/node')}/$1` },
      { find: /^#l10n$/, replacement: resolve(rootDir, 'src-neutral/l10n/index.ts') },
      { find: /^#resources$/, replacement: resolve(rootDir, 'resources/index.ts') },

      // MARK: - Tests
      { find: /^#test\/(.*)$/, replacement: `${resolve(rootDir, 'test')}/$1` },
    ],
  },
});
