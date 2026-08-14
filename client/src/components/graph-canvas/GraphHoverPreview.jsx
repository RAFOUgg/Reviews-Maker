/**
 * GraphHoverPreview Component
 *
 * Enveloppe de l'aperçu flottant affiché au survol d'un élément de graphe : son placement près du
 * curseur et son cadre. Le CONTENU est propre à chaque domaine (résumé de pipeline pour la Chaîne
 * de production, données de breeding pour PhenoHunt) et arrive en `children`.
 *
 * Positionné en `fixed` à partir de coordonnées ÉCRAN (clientX/clientY), jamais en coordonnées du
 * flow, et `pointer-events: none` (cf. .graph-hover-preview) : l'aperçu ne doit jamais intercepter
 * un clic destiné au canevas lui-même. Le rabattement sur les bords évite qu'il sorte de la fenêtre
 * quand on survole un élément proche du bord droit ou bas.
 */

import React from 'react';

const CURSOR_OFFSET = 16;

export default function GraphHoverPreview({ x, y, width = 260, heightEstimate = 220, children }) {
    if (x == null || y == null) return null;

    const left = Math.min(x + CURSOR_OFFSET, Math.max(8, window.innerWidth - width - 8));
    const top = Math.min(y + CURSOR_OFFSET, Math.max(8, window.innerHeight - heightEstimate - 8));

    return (
        <div className="graph-hover-preview" style={{ left, top, width }}>
            {children}
        </div>
    );
}
