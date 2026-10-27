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

export default base.map((block) =>
    block.rules ? { ...block, rules: CRITICAL } : block
)
