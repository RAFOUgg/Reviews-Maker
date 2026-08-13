/**
 * CanvasInfoPanel Component
 *
 * Panneau latéral droit des deux canevas de graphe (PhenoHunt et Chaîne de production) : le
 * conteneur, son bouton de repli et la mémorisation de cet état. Seul le CONTENU diffère entre les
 * deux domaines (un individu et sa génétique d'un côté, un produit et ses cellules/journal de
 * l'autre) — il est donc passé en `children`.
 *
 * Le repli existait côté Chaîne de production seulement, écrit en ligne dans ProductionChainCanvas :
 * sur PhenoHunt le panneau occupait 320px de large en permanence dès qu'un nœud était sélectionné,
 * sans aucun moyen de le refermer (« sur phenohunt je peux pas cacher les infos », 2026-08-14). Le
 * mécanisme est extrait ici plutôt que recopié — c'est la duplication d'un même comportement entre
 * les deux canevas qui a déjà produit des divergences ailleurs dans ce dépôt.
 *
 * `storageKey` est propre à chaque canevas : replier le panneau de la chaîne de production ne doit
 * pas replier celui de l'arbre généalogique, ce sont deux écrans différents.
 */

import React, { useEffect, useState } from 'react';
import { Panel } from 'reactflow';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CanvasInfoPanel({ storageKey, children }) {
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem(storageKey) === '1');

    useEffect(() => {
        localStorage.setItem(storageKey, collapsed ? '1' : '0');
    }, [storageKey, collapsed]);

    return (
        <Panel position="top-right" className={`node-info-panel ${collapsed ? 'collapsed' : ''}`}>
            <button
                type="button"
                className="node-info-panel-toggle"
                onClick={() => setCollapsed(v => !v)}
                title={collapsed ? 'Afficher le panneau' : 'Réduire le panneau'}
                aria-expanded={!collapsed}
            >
                {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
            {!collapsed && children}
        </Panel>
    );
}
