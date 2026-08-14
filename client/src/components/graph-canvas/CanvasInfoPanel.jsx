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
 *
 * ── TÉLÉPHONE ────────────────────────────────────────────────────────────────────────────────
 * Sous 640px, ce n'est plus un volet mais une FEUILLE MODALE ancrée en bas. Mesuré le 2026-08-14 :
 * le volet occupait 80vw (312px sur 390px) dès qu'un élément était sélectionné — il ne « rognait »
 * pas le canevas, il le recouvrait presque entièrement, et le bouton de repli était le seul moyen
 * de revoir le graphe. Une feuille se ferme d'un appui hors d'elle, plafonne à 85vh et laisse voir
 * le graphe derrière : on consulte sans perdre sa place.
 *
 * Le MÊME `children` sert aux deux enveloppes — pas de second rendu du contenu pour mobile, sous
 * peine de rejouer l'histoire des chemins de rendu parallèles de ce dépôt.
 */

import React, { useEffect, useState } from 'react';
import { Panel } from 'reactflow';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useResponsiveLayout from '../../hooks/useResponsiveLayout';
import CanvasSheet from './CanvasSheet';
import { useGraphCanvasUi } from './graphCanvasUi';

export default function CanvasInfoPanel({ storageKey, title = 'Détail', children }) {
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem(storageKey) === '1');
    const { isMobile } = useResponsiveLayout();
    const { selectionMode } = useGraphCanvasUi();
    // La feuille s'ouvre à chaque nouvelle sélection ; la refermer ne doit pas désélectionner
    // l'élément (le graphe garde son état, on a juste rangé la fiche).
    const [sheetDismissed, setSheetDismissed] = useState(false);

    useEffect(() => {
        if (isMobile) return;
        localStorage.setItem(storageKey, collapsed ? '1' : '0');
    }, [storageKey, collapsed, isMobile]);

    // Un nouveau contenu (autre élément sélectionné) rouvre la feuille : sinon, après une première
    // fermeture, sélectionner un autre nœud n'afficherait plus jamais rien.
    useEffect(() => {
        setSheetDismissed(false);
    }, [title]);

    if (isMobile) {
        // Pendant qu'on SÉLECTIONNE, on ne consulte pas : le fond modal de la feuille intercepte
        // tous les appuis, donc l'ouvrir au premier élément touché rendait le deuxième
        // inatteignable — la sélection multiple au doigt était impossible (trouvé en sonde).
        if (selectionMode || sheetDismissed) return null;
        // Portalé vers <body> : le canevas est parfois embarqué dans une carte à `backdrop-filter`,
        // qui devient alors le bloc conteneur de tout `position: fixed` descendant (spec CSS) —
        // même raison que le portail des menus contextuels dans GraphCanvasShell.jsx.
        // `canvas-info-content` : la classe qui porte TOUT le style du contenu de détail (cf.
        // graphCanvas.css). Le volet desktop la porte aussi — une seule feuille de style pour les
        // deux enveloppes, jamais deux rendus parallèles du même contenu.
        return (
            <CanvasSheet title={title} onClose={() => setSheetDismissed(true)} bodyClassName="canvas-info-content">
                {children}
            </CanvasSheet>
        );
    }

    return (
        <Panel position="top-right" className={`node-info-panel canvas-info-content ${collapsed ? 'collapsed' : ''}`}>
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
