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
      { find: /^@\/src\/(.*)$/, replacement: `${resolve(rootDir, 'src')}/$1` },
      { find: /^#internal-runtime$/, replacement: resolve(rootDir, 'src/internal-runtime/index.ts') },
      { find: /^#internal-runtime\/(.*)$/, replacement: `${resolve(rootDir, 'src/internal-runtime')}/$1` },
      { find: /^#internal-shared$/, replacement: resolve(rootDir, 'src/internal-shared/index.ts') },
      { find: /^#internal-shared\/(.*)$/, replacement: `${resolve(rootDir, 'src/internal-shared')}/$1` },
    ],
  },
});
