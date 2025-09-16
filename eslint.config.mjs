import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import vueParser from 'vue-eslint-parser';
import vuePlugin from 'eslint-plugin-vue';
import unicorn from 'eslint-plugin-unicorn';
import checkFile from 'eslint-plugin-check-file';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsonc from 'eslint-plugin-jsonc';
import jsoncParser from 'jsonc-eslint-parser';
import yml from 'eslint-plugin-yml';
import yamlParser from 'yaml-eslint-parser';

const tsJsRules = {
  ...tsPlugin.configs.recommended.rules,

  // Run Prettier from ESLint, but let it read the Prettier config file.
  // (No inline options here — single source of truth!)
  'prettier/prettier': 'error',

  // Import hygiene
  'import/order': ['error', { 'newlines-between': 'always-and-inside-groups' }],
  'import/no-duplicates': ['error', { 'prefer-inline': false }],
  'import/newline-after-import': 'error',
  'import/first': 'error',
  'import/no-default-export': 'off',

  // Misc hygiene
  'no-multiple-empty-lines': ['error', { max: 1 }],
  'no-multi-spaces': ['error', { ignoreEOLComments: true }],

  // TS prefs
  '@typescript-eslint/no-empty-object-type': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      prefer: 'type-imports',
      fixStyle: 'inline-type-imports',
    },
  ],
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
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.apikit/**',
      '**/.build/**',
      '**/coverage/**',
      'packages/web-*/**/networking/**',
    ],
  },

  // Vue SFCs
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      vue: vuePlugin,
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
      'check-file': checkFile,
      unicorn,
    },
    rules: {
      ...vuePlugin.configs['flat/recommended'].rules,
      ...tsJsRules,

      'import/no-unresolved': 'off', // Nuxt virtual imports
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      'vue/max-attributes-per-line': ['error', { singleline: 5, multiline: 1 }],
      'vue/no-v-html': 'error',

      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.md': 'KEBAB_CASE',
          'components/**/*.vue': 'PASCAL_CASE',
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'components/**/': 'KEBAB_CASE',
        },
      ],

      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/prefer-top-level-await': 'error',
    },
  },

  // JS / TS Global
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx,jsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
      unicorn,
    },
    rules: {
      ...tsJsRules,
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/prefer-top-level-await': 'error',
    },
  },

  // tsconfig files (belt-and-suspenders: *ensure* comments are allowed)
  {
    files: ['**/tsconfig*.json'],
    languageOptions: { parser: jsoncParser },
    rules: {
      'jsonc/no-comments': 'off',
    },
  },

  // JSON / JSONC
  {
    files: ['**/*.json', '**/*.jsonc'],
    languageOptions: { parser: jsoncParser },
    plugins: { jsonc, prettier: prettierPlugin },
    rules: {
      ...jsonc.configs['recommended-with-json'].rules,
      'jsonc/no-comments': 'off',
      'prettier/prettier': 'error', // run Prettier via ESLint on JSON
    },
  },

  // YAML
  {
    files: ['**/*.{yml,yaml}'],
    languageOptions: { parser: yamlParser },
    plugins: { yml, prettier: prettierPlugin },
    rules: {
      ...yml.configs.standard.rules,
      'yml/quotes': 'off',
      'prettier/prettier': 'error', // run Prettier via ESLint on YAML
    },
  },

  // Turn off rules that conflict with Prettier
  eslintConfigPrettier,
];
