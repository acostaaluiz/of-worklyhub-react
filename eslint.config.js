import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_.*|_|err|e)$',
        },
      ],
    },
  },

  // Allow explicit any in ambient/type declaration files (third-party types)
  {
    files: ['src/@types/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Presentation layer: relax some hook/state rules and explicit-any to reduce noise
  {
    files: ['src/modules/**/presentation/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  // Allow react-refresh exports in storage provider (provider + types exported)
  {
    files: ['src/core/storage/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  {
    files: [
      'src/core/http/base-http.service.ts',
      'src/core/http/http-client.ts',
      'src/core/http/http-error-mapper.ts',
      'src/shared/base/base.component.ts',
      'src/shared/ui/components/form-step/form-step.component.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    files: ['src/app/router/routes.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
