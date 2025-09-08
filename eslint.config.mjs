import globals from 'globals';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import pluginVue from 'eslint-plugin-vue';

// MARK: - Shared rule bits (reuse across TS/JS and Vue SFCs)
const prettierRule = [
  'error',
  {
    singleQuote: true,
    semi: true,
    printWidth: 110,
    tabWidth: 2,
    useTabs: false,
  },
];

const tsJsRules = {
  // @typescript-eslint recommended
  ...typescriptEslint.configs.recommended.rules,

  // Prettier formatting rules
  'prettier/prettier': prettierRule,

  // Import sorting / small hygiene
  'import/order': ['error', { 'newlines-between': 'always-and-inside-groups' }],
  'no-multiple-empty-lines': ['error', { max: 1 }],

  // TypeScript-specific rules
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/no-empty-object-type': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
};

export default [
  // MARK: - Ignore
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.apikit/**',
      '**/.build/**',
    ],
  },

  // MARK: - TypeScript / JavaScript
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier: eslintPluginPrettier,
      import: eslintPluginImport,
    },
    rules: tsJsRules,
  },

  // MARK: - Vue (SFC)
  // Use vue-eslint-parser for .vue, delegate <script lang="ts"> to @typescript-eslint/parser,
  // and APPLY THE SAME ts/js rules to the script block.
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      vue: pluginVue,
      '@typescript-eslint': typescriptEslint,
      prettier: eslintPluginPrettier,
      import: eslintPluginImport,
    },
    rules: {
      ...tsJsRules,
      // Tiny Vue-specifics (optional):
      // 'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      // 'vue/no-v-html': 'error'
    },
  },
];
