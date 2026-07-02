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

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
