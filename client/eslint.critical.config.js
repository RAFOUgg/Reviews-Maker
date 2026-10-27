// Barrière minimale : uniquement les erreurs qui cassent l'app à l'exécution
// (fichier qui ne parse pas, variable/composant inexistant, hook conditionnel, clé dupliquée).
// `npm run lint` garde l'ensemble des règles ; la dette existante (~1100 erreurs, surtout
// des variables inutilisées) ne doit pas masquer ces erreurs-là.
import base from './eslint.config.js'

const CRITICAL = {
    'no-undef': 'error',
    'react/jsx-no-undef': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'no-dupe-keys': 'error',
}

// Code mort : aucun chemin depuis src/main.jsx (vérifié par le graphe esbuild, 2026-10-28).
// À supprimer au lot L14 (dédoublonnage), pas à corriger.
const DEAD = [
    'src/components/shared/config/PresetConfigModal.jsx',
    'src/components/guards/SectionGuard.jsx',
    'src/components/pipelines/sections/RecipePipelineSection.jsx',
    'src/utils/ReviewCompletionExamples.js',
    'src/utils/SeparationPDFExporter.js',
    'src/utils/legalSystemTests.js',
    'src/utils/CuringGIFExporter.js',
    'src/utils/permissionErrors.js',
    'src/utils/permissionSync.js',
    // tests qui ne parsent pas (syntaxe jest/ESM mélangée) — à réécrire ou supprimer en L14
    'src/tests/permissions.integration.test.js',
    'src/__tests__/permissions.frontend.test.js',
]

export default [
    { ignores: DEAD },
    ...base.map((block) =>
        block.rules ? { ...block, rules: CRITICAL } : block
    ),
]
