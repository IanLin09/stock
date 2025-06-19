import prettier from 'eslint-plugin-prettier';
import eslint from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default [
  // Base ESLint recommended rules
  eslint.configs.recommended,
  
  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,
  {
    ignores: [
      'components/ui/**/*',
      'src/app/components/ui/**/*',
      'src/app/hooks/**/*', 
      '@/components/ui/**/*',
      // Add other paths where your Shadcn components are located
    ],
  },
  // Main configuration
  {
    plugins: {
      prettier: prettier,
      react: reactPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      // Add any other rules you want here
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },
  
  // Jest configuration for test files
  {
    files: ['tests/**/*', '**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
    },
    rules: {
      // Add Jest-specific rules if needed
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
    },
  },
];