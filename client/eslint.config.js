// ESLint 9 (flat config). Le dépôt n'en avait aucune : `npm run lint` refusait de démarrer,
// si bien que du code qui ne parse pas a pu être committé (cf. CLAUDE.md, correctif #16).
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
    { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'public/**'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { ...globals.browser, ...globals.node },
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        settings: { react: { version: 'detect' } },
        plugins: { react, 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react/prop-types': 'off',
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },
    {
        files: ['**/*.{test,spec}.{js,jsx}', 'src/test/**', 'src/**/__tests__/**', 'src/tests/**'],
        // globals@14 n'a pas de jeu « vitest » ; celui de jest couvre describe/test/expect/vi-like.
        languageOptions: { globals: { ...globals.jest, vi: 'readonly' } },
    },
]
