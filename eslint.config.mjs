// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
// ];

// export default eslintConfig;

import prettier from 'eslint-plugin-prettier';
import eslint from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';
import reactPlugin from 'eslint-plugin-react';

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      ['prettier']: prettier,
      ['jest']: jestPlugin,
      ['react']: reactPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      // Add any other rules you want here
    },
    overrides: [
      {
        files: ['tests/**/*'],
        plugins: ['jest'],
        env: {
          'jest/globals': true,
        },
      },
    ],
  },
];
