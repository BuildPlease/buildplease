import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import checkFile from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import-x';
import jsonc from 'eslint-plugin-jsonc';
import perfectionist from 'eslint-plugin-perfectionist';
import unicorn from 'eslint-plugin-unicorn';
import vuePlugin from 'eslint-plugin-vue';
import yml from 'eslint-plugin-yml';
import globals from 'globals';
import vueParser from 'vue-eslint-parser';

import { loadDevKitConfig, resolveDevKitConfig } from '../dist/src-internal/configuration/index.mjs';

const codeRules = {
  ...tsPlugin.configs.recommended.rules,

  'perfectionist/sort-imports': [
    'error',
    {
      type: 'alphabetical',
      order: 'asc',
      sortSideEffects: true,
      newlinesBetween: 1,
      groups: [
        ['type-builtin', 'value-builtin'],
        ['type-external', 'value-external', 'ts-equals-import'],
        ['type-internal', 'value-internal', 'type-subpath', 'value-subpath', 'unknown'],
        [
          'type-parent',
          'value-parent',
          'type-sibling',
          'value-sibling',
          'type-index',
          'value-index',
          'type-style',
          'value-style',
        ],
      ],
    },
  ],
  'perfectionist/sort-named-imports': [
    'error',
    {
      type: 'alphabetical',
      order: 'asc',
      groups: ['type-import', 'value-import'],
      newlinesBetween: 0,
    },
  ],
  'import/no-duplicates': ['error', { 'prefer-inline': false }],
  'import/newline-after-import': 'error',
  'import/first': 'error',
  'import/no-default-export': 'off',

  'no-restricted-syntax': [
    'error',
    {
      selector: 'ObjectExpression > Property[shorthand=true]',
      message: 'Use explicit object properties (for example, foo: foo).',
    },
  ],

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

  'unicorn/no-abusive-eslint-disable': 'error',
  'unicorn/prefer-top-level-await': 'error',
};

const vueRules = {
  ...codeRules,

  'import/no-unresolved': 'off',

  'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
  'vue/multi-word-component-names': 'off',
  'vue/no-v-html': 'error',
  'vue/require-default-prop': 'off',
  'vue/require-valid-default-prop': 'error',

  'check-file/filename-naming-convention': [
    'error',
    {
      '**/components/**/!(index).vue': 'PASCAL_CASE',
    },
  ],
  'check-file/folder-naming-convention': [
    'error',
    {
      'components/**/': 'KEBAB_CASE',
    },
  ],
};

const loadedDevKitConfig = await loadDevKitConfig();
const resolvedDevKitConfig = resolveDevKitConfig(loadedDevKitConfig.config);

const globalIgnores = {
  ignores: resolvedDevKitConfig.ignore,
};

const vueConfig = {
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
    perfectionist: perfectionist,
    'check-file': checkFile,
    unicorn: unicorn,
  },
  rules: vueRules,
};

const codeConfig = {
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
    perfectionist: perfectionist,
    unicorn: unicorn,
  },
  rules: codeRules,
};

const jsonConfig = [
  ...jsonc.configs['recommended-with-jsonc'],
  {
    files: ['**/*.json'],
    ignores: ['**/tsconfig*.json'],
    rules: {
      'jsonc/no-comments': 'error',
      'jsonc/comma-dangle': 'off',
    },
  },
  {
    files: ['**/*.jsonc', '**/tsconfig*.json'],
    rules: {
      'jsonc/no-comments': 'off',
      'jsonc/comma-dangle': 'off',
    },
  },
];

const yamlConfig = [
  ...yml.configs.standard,
  {
    files: ['**/*.{yml,yaml}'],
    rules: {
      'yml/quotes': 'off',
    },
  },
];

const markdownConfig = {
  files: ['**/*.md'],
  ignores: ['**/+([A-Z0-9_]).md'],
  plugins: { 'check-file': checkFile },
  processor: 'check-file/eslint-processor-check-file',
  rules: {
    'check-file/filename-naming-convention': ['error', { '**/*.md': 'KEBAB_CASE' }],
  },
};

export default [
  globalIgnores,
  ...vuePlugin.configs['flat/recommended'],
  vueConfig,
  codeConfig,
  ...jsonConfig,
  ...yamlConfig,
  markdownConfig,
  eslintConfigPrettier,
];
