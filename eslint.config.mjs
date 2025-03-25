import globals from 'globals';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  // TypeScript and JavaScript configuration
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ignores: [
      '**/node_modules',
      '**/dist/**/*',
      '**/runtime/**/*',
      '**/.output/**/*',
      '**/.nuxt/**/*',
    ],
    languageOptions: {
      parser: typescriptParser,
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier: eslintPluginPrettier,
      import: eslintPluginImport,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,

      // Prettier formatting rules
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
        },
      ],

      // Import sorting
      'import/order': [
        'error',
        { 'newlines-between': 'always-and-inside-groups' },
      ],
      'no-multiple-empty-lines': ['error', { max: 1 }],

      // TypeScript-specific rules
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
];
