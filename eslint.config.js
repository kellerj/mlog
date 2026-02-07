import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['src/server/public/**', 'dist/**', 'coverage/**', 'doc/**'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'max-len': ['warn', 100, 2, {
        ignoreUrls: true,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreTrailingComments: true,
      }],
    },
  },
];
