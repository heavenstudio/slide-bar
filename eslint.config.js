import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    // Block any .js/.jsx files (TypeScript-only codebase)
    files: ['**/*.{js,jsx}'],
    ignores: ['eslint.config.js', 'postcss.config.js', 'dist/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program',
          message:
            'JavaScript files are not allowed. This is a TypeScript-only codebase. Please use .ts or .tsx files instead.',
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Error Prevention
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',

      // Code Quality
      complexity: ['error', 15],
      'max-depth': ['error', 4],
      'max-len': [
        'warn',
        { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true },
      ],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],

      // React Rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off', // Using TypeScript or runtime validation instead
      'react/react-in-jsx-scope': 'off', // Not needed in React 18+

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Testing Best Practices
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='waitForTimeout']",
          message:
            'Avoid waitForTimeout - use event-based waits instead (waitForSelector, waitForFunction, expect().toBeVisible, etc.). See .claude/skills/testing-standards.md for examples.',
        },
      ],
    },
  },
  {
    // TypeScript-specific configuration
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Disable base rules that are covered by TypeScript
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // TypeScript handles these
      'no-undef': 'off',
      // Ban JSX.Element - React 19 best practice is to infer return types
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSTypeReference > Identifier[name="JSX"]',
          message:
            'Do not use JSX.Element or JSX namespace types. Let TypeScript infer component return types. This is React 19 best practice and avoids "Cannot find namespace JSX" errors.',
        },
      ],
    },
  },
  {
    // Allow console in CLI scripts (they're meant for terminal output)
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Relax function length limit for test files (describe/it blocks can be long)
    files: ['**/*.{test,spec}.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    rules: {
      'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    // Ignore patterns
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.test-output/**',
      'eslint.config.js',
      'postcss.config.js',
      '**/*.config.ts',
      '.pnpm-store/**',
    ],
  },
];
