// ---
// title: ESLint Config
// version: v1.0.0
// updated: 2025-10-03
// owner: moonpacket-core
// ---

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  astro.configs.recommended,
  {
    files: ['**/*.{ts,tsx,astro}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: false,
      },
    },
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      'no-console': ['warn', { allow: ['error'] }],
      'jsx-a11y/alt-text': 'warn',
    },
  },
];


