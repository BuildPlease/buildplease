import type { DevKitConfigMode } from '../../src/configuration';

export const DevKitDefaults = {
  mode: 'extend' satisfies DevKitConfigMode,

  ignore: [
    // System
    '**/.DS_Store',
    '**/.AppleDouble',
    '**/.LSOverride',
    '**/Thumbs.db',
    '**/ehthumbs.db',
    '**/Desktop.ini',

    // Editors / IDEs
    '**/.idea/**',
    '**/.vscode/**',

    // Environment / secrets
    '**/.env',
    '**/.env.*',

    // Dependencies
    '**/node_modules/**',

    // Package manager state / caches / lockfiles
    '**/.npm/**',
    '**/.pnpm-store/**',
    '**/.yarn/cache/**',
    '**/.yarn/unplugged/**',
    '**/.yarn/build-state.yml',
    '**/.yarn/install-state.gz',
    '**/.pnp.*',
    '**/pnpm-lock.yaml',
    '**/package-lock.json',
    '**/npm-shrinkwrap.json',
    '**/yarn.lock',
    '**/bun.lock',
    '**/bun.lockb',

    // Logs / diagnostics
    '**/logs/**',
    '**/log/**',
    '**/*.log',
    '**/npm-debug.log*',
    '**/yarn-debug.log*',
    '**/yarn-error.log*',
    '**/pnpm-debug.log*',
    '**/lerna-debug.log*',
    '**/report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json',
    '**/*.heapsnapshot',
    '**/*.heapprofile',
    '**/*.cpuprofile',

    // Runtime data
    '**/pids/**',
    '**/*.pid',
    '**/*.seed',
    '**/*.pid.lock',

    // Test / coverage output
    '**/coverage/**',
    '**/.nyc_output/**',
    '**/*.lcov',
    '**/.tap/**',
    '**/out.tap',
    '**/test-results/**',
    '**/playwright-report/**',
    '**/blob-report/**',

    // TypeScript / tooling caches
    '**/*.tsbuildinfo',
    '**/.eslintcache',
    '**/.stylelintcache',
    '**/.cache/**',
    '**/.parcel-cache/**',
    '**/.vite/**',
    '**/.rpt2_cache/**',
    '**/.rts2_cache_cjs/**',
    '**/.rts2_cache_es/**',
    '**/.rts2_cache_umd/**',

    // Framework output
    '**/.next/**',
    '**/.nuxt/**',
    '**/.output/**',
    '**/.turbo/**',
    '**/.vercel/**',
    '**/.netlify/**',
    '**/.svelte-kit/**',
    '**/.astro/**',
    '**/.docusaurus/**',
    '**/.vuepress/dist/**',
    '**/storybook-static/**',

    // Archives / generated packages
    '**/*.tgz',
    '**/*.zip',
    '**/*.tar',
    '**/*.tar.gz',

    // Build output
    '**/dist/**',
    '**/build/**',
    '**/out/**',

    // Generated output
    '**/.generated/**',

    // Minified / generated bundles
    '**/*.min.js',
    '**/*.min.css',
  ],

  clean: {
    mode: 'extend' satisfies DevKitConfigMode,
    targets: ['apps', 'packages'],
    directories: [
      'dist',
      'build',
      'out',
      '.output',
      '.generated',
      '.turbo',
      '.cache',
      '.vite',
      '.next',
      '.nuxt',
      '.svelte-kit',
      '.astro',
      'coverage',
      '.nyc_output',
      'test-results',
      'playwright-report',
      'blob-report',
      'storybook-static',
    ],
  },

  format: {
    mode: 'extend' satisfies DevKitConfigMode,
    include: ['.'],
  },

  lint: {
    mode: 'extend' satisfies DevKitConfigMode,
    include: ['.'],
  },
} as const;
