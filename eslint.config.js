const pluginPrettier = require('eslint-plugin-prettier');
const pluginImport = require('eslint-plugin-import');
const pluginJSDoc = require('eslint-plugin-jsdoc');
const parser = require('@typescript-eslint/parser');
const tsEslint = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: parser,
      globals: {
        browser: true,
        node: true,
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      import: pluginImport,
      jsdoc: pluginJSDoc,
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {},
        {
          usePrettierrc: true,
          fileInfoOptions: {
            withNodeModules: true,
          },
        },
      ],
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external', 'internal']],
          'newlines-between': 'always',
        },
      ],
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-indentation': 'error',
      'jsdoc/check-syntax': 'error',
    },
    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
  },
];
