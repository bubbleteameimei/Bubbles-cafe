
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
			parserOptions: {
				ecmaFeatures: { jsx: true },
				project: './tsconfig.json'
			}
		},
		plugins: { 
			'@typescript-eslint': tseslint, 
			react, 
			'react-hooks': reactHooks, 
			'unused-imports': unusedImports, 
			'jsx-a11y': jsxA11y, 
			import: importPlugin 
		},
		settings: {
			react: { version: 'detect' },
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: './tsconfig.json'
				},
				node: {
					extensions: ['.js', '.jsx', '.ts', '.tsx']
				}
			},
			'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.tsx']
			}
		},
		rules: {
			...tseslint.configs.recommended.rules,
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			...(jsxA11y.configs.recommended.rules || {}),
			...(importPlugin.configs.recommended.rules || {}),
			// Prefer automatic import removal over generic unused vars
			'@typescript-eslint/no-unused-vars': 'off',
			// Temporarily disabled to reduce noise
			'unused-imports/no-unused-imports': 'off',
			'unused-imports/no-unused-vars': 'off',
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
			// Import hygiene - temporarily relaxed
			'import/no-cycle': 'off',
			'import/order': 'off',
			// Disable problematic import rules that cause resolver issues
			'import/no-unresolved': 'off',
			'import/namespace': 'off',
			'import/named': 'off',
			'import/default': 'off',
			'import/no-duplicates': 'warn',
			'import/no-named-as-default': 'off',
			'import/no-named-as-default-member': 'off',
			// A11y additions - fix anchor issues
			'jsx-a11y/anchor-is-valid': ['error', {
				components: ['Link'],
				specialLink: ['hrefLeft', 'hrefRight'],
				aspects: ['invalidHref', 'preferButton']
			}]
		},
	},
	{
		files: ['**/*.{js,jsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: { window: true, document: true, navigator: true }
		},
		plugins: { 
			react, 
			'react-hooks': reactHooks, 
			'unused-imports': unusedImports, 
			'jsx-a11y': jsxA11y, 
			import: importPlugin 
		},
		settings: {
			react: { version: 'detect' },
			'import/resolver': {
				node: {
					extensions: ['.js', '.jsx', '.ts', '.tsx']
				}
			}
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			...(jsxA11y.configs.recommended.rules || {}),
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'react/display-name': 'off',
			'jsx-a11y/anchor-is-valid': ['error', {
				components: ['Link'],
				specialLink: ['hrefLeft', 'hrefRight'],
				aspects: ['invalidHref', 'preferButton']
			}]
		}
	},
	{ ignores: ['dist/**', 'node_modules/**', 'build/**', '.next/**'] },
];
