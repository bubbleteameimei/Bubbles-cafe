// @ts-check
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

export default [
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			sourceType: 'module',
			ecmaVersion: 'latest',
			globals: { window: true, document: true, navigator: true },
		},
		plugins: { '@typescript-eslint': tseslint, react, 'react-hooks': reactHooks, 'unused-imports': unusedImports, 'jsx-a11y': jsxA11y, import: importPlugin },
		settings: {
			react: { version: 'detect' }
		},
		rules: {
			...tseslint.configs.recommended.rules,
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			...(jsxA11y.configs.recommended.rules || {}),
			...(importPlugin.configs.recommended.rules || {}),
			// Prefer automatic import removal over generic unused vars
			'@typescript-eslint/no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
			'react/react-in-jsx-scope': 'off',
			// Relax strict rules to allow incremental hardening
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/prefer-as-const': 'off',
			'@typescript-eslint/no-namespace': 'off',
			// Relax non-critical React rules to reduce noise in content-heavy pages
			'react/no-unescaped-entities': 'off',
			'react/prop-types': 'off',
			'react/display-name': 'off',
			// Import hygiene
			'import/no-cycle': 'warn',
			'import/order': ['warn', { 'alphabetize': { order: 'asc', caseInsensitive: true }, 'newlines-between': 'always' }],
			// A11y additions
			'jsx-a11y/anchor-is-valid': 'warn',
			'jsx-a11y/no-autofocus': 'warn'
		},
	},
	{ ignores: ['dist/**', 'node_modules/**'] },
];