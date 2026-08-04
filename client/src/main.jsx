import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Defensive global for older cached bundles that may reference REPEAT_COUNT
// Ensure a default to avoid ReferenceError in older builds still loaded in the client
if (typeof globalThis !== 'undefined') {
    globalThis.REPEAT_COUNT = globalThis.REPEAT_COUNT || 1;
}

// Une vraie page load (donc un index.html frais) réussit forcément à exécuter ce module — on peut
// réarmer le garde-fou anti-boucle de ErrorBoundary.jsx pour qu'un futur déploiement pendant la
// session déclenche à nouveau un rechargement automatique.
sessionStorage.removeItem('chunk-reload-attempted');

// Préchargement des polices web utilisées par les templates d'export (client/index.html).
//
// Une @font-face déclarée n'est PAS téléchargée tant qu'aucun élément ne l'utilise : le navigateur
// la charge paresseusement, au premier rendu qui la demande. Le pipeline d'export rasterise via
// `html-to-image` — s'il capture pendant ce chargement, le texte sort dans la police de repli.
// Constaté sur un export PNG réel le 2026-08-04 : toute la fiche en serif alors qu'Inter était
// demandée (et joignable — la requête partait, simplement trop tard).
//
// `document.fonts.ready` ne suffit pas seul : il se résout immédiatement quand AUCUNE police n'est
// encore en attente, ce qui est précisément le cas avant le premier usage. On force donc le
// téléchargement dès le démarrage, pour que le cache soit chaud bien avant tout export.
// Volontairement non bloquant : un échec réseau ne doit pas empêcher l'app de démarrer.
if (typeof document !== 'undefined' && document.fonts?.load) {
    Promise.allSettled([
        document.fonts.load('400 16px Inter'),
        document.fonts.load('700 32px Inter'),
        document.fonts.load('400 16px "JetBrains Mono"'),
        document.fonts.load('700 16px "JetBrains Mono"'),
        document.fonts.load('600 32px "Space Grotesk"'),
    ]).catch(() => { /* police indisponible : la pile de repli de resolveFontStack prend le relais */ });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
