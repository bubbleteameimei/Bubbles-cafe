// @ts-check
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			sourceType: 'module',
			ecmaVersion: 'latest',
			globals: { window: true, document: true, navigator: true },
		},
		plugins: { '@typescript-eslint': tseslint, react, 'react-hooks': reactHooks },
		rules: {
			...tseslint.configs.recommended.rules,
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'react/react-in-jsx-scope': 'off',
		},
	},
	{ ignores: ['dist/**', 'node_modules/**'] },
];