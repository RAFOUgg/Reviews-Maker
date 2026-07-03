/**
 * GraphCanvasShell Component
 *
 * Wrapper commun pour les deux canvas de graphe de l'app : PhenoHunt (UnifiedGeneticsCanvas,
 * "génétique et weed") et Chaîne de production (ProductionChainCanvas, "types et étapes"). Porte
 * tout ce qui est mécanique et identique entre les deux — le conteneur React Flow, le fond, les
 * contrôles/minimap, les états loading/erreur, le clip overflow — pendant que chaque domaine garde
 * son propre store, sa propre logique de sync nœuds/arêtes et ses propres menus contextuels/modales
 * (trop différents pour être fusionnés sans risque : PhenoHunt gère filiation/couples/waypoints,
 * la Chaîne de production gère des types de produits et des transformations).
 */

import React, { useCallback, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import './graphCanvas.css';

// Durée d'appui long pour ouvrir un menu contextuel au tactile — même seuil que le pattern
// équivalent utilisé pour la multi-sélection tactile des pipelines (PipelineDragDropView.jsx,
// startLongPress/cancelLongPress) : 500ms, annulé au moindre mouvement du doigt.
const LONG_PRESS_DURATION = 500;

export default function GraphCanvasShell({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onNodeContextMenu,
    onNodeDragStop,
    onEdgeClick,
    onEdgeContextMenu,
    onPaneContextMenu,
    nodeTypes,
    edgeTypes,
    onCanvasClick,
    onDragOver,
    onDrop,
    loading = false,
    loadingLabel = 'Chargement...',
    error = null,
    onErrorReset,
    toolbar = null,
    sidePanel = null,
    contextMenu = null,
    modals = null,
    fab = null,
    className = '',
    minimapNodeColor,
    minimapMaskColor = 'rgba(7, 7, 15, 0.7)',
}) {
    // ── Appui long tactile → menus contextuels ──────────────────────────────────────────────
    // Générique et partagé par les deux domaines (PhenoHunt et Chaîne de production) : le clic
    // droit (desktop) n'a pas d'équivalent tactile natif fiable (l'événement "contextmenu" ne se
    // déclenche pas de façon cohérente sur appui long selon les navigateurs mobiles). On détecte
    // nous-mêmes l'appui long ici, une seule fois, et on rappelle les MÊMES callbacks
    // onNodeContextMenu/onEdgeContextMenu/onPaneContextMenu déjà câblés par le clic droit — les
    // composants appelants (UnifiedGeneticsCanvas, ProductionChainCanvas) n'ont donc rien à
    // changer pour bénéficier du tactile.
    const longPressTimerRef = useRef(null);
    const longPressFiredRef = useRef(false);

    const clearLongPressTimer = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    const handleTouchStart = useCallback((event) => {
        // Ignorer le pinch-zoom (2+ doigts) — seul un appui à un seul doigt déclenche un menu
        if (event.touches.length !== 1) {
            clearLongPressTimer();
            return;
        }
        const touch = event.touches[0];
        const target = event.target;
        const nodeEl = target.closest('.react-flow__node');
        const edgeEl = !nodeEl ? target.closest('.react-flow__edge') : null;

        let kind = null;
        let id = null;
        if (nodeEl) {
            kind = 'node';
            id = nodeEl.getAttribute('data-id');
        } else if (edgeEl) {
            kind = 'edge';
            // React Flow ne pose pas de data-id sur le <g> d'arête, seulement data-testid
            // au format "rf__edge-<id>" — cf. @reactflow/core EdgeWrapper.
            const testId = edgeEl.getAttribute('data-testid') || '';
            id = testId.startsWith('rf__edge-') ? testId.slice('rf__edge-'.length) : null;
        } else if (target.closest('.react-flow__pane')) {
            // Fond vide du canvas (pas un contrôle/panneau/modale posé par-dessus)
            kind = 'pane';
        } else {
            // Touche hors du pane (Controls, MiniMap, Panel, menu déjà ouvert, modale...) —
            // ne pas intercepter, laisser le comportement natif du bouton/élément tactile.
            return;
        }

        longPressFiredRef.current = false;
        clearLongPressTimer();
        longPressTimerRef.current = setTimeout(() => {
            longPressTimerRef.current = null;
            longPressFiredRef.current = true;
            if (navigator.vibrate) navigator.vibrate(50);

            const fakeEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {},
                stopPropagation: () => {},
            };
            if (kind === 'node' && id && onNodeContextMenu) {
                const node = (nodes || []).find(n => n.id === id);
                if (node) onNodeContextMenu(fakeEvent, node);
            } else if (kind === 'edge' && id && onEdgeContextMenu) {
                const edge = (edges || []).find(e => e.id === id);
                if (edge) onEdgeContextMenu(fakeEvent, edge);
            } else if (kind === 'pane' && onPaneContextMenu) {
                onPaneContextMenu(fakeEvent);
            }
        }, LONG_PRESS_DURATION);
    }, [nodes, edges, onNodeContextMenu, onEdgeContextMenu, onPaneContextMenu, clearLongPressTimer]);

    // Le moindre mouvement annule l'appui long (même tolérance nulle que le pattern pipelines)
    const handleTouchMove = useCallback(() => {
        clearLongPressTimer();
    }, [clearLongPressTimer]);

    const handleTouchEnd = useCallback((event) => {
        clearLongPressTimer();
        if (longPressFiredRef.current) {
            // L'appui long vient d'ouvrir un menu contextuel : empêcher le "clic fantôme" que le
            // navigateur simule après un touchend, qui remonterait jusqu'à onCanvasClick et
            // refermerait aussitôt le menu qu'on vient d'ouvrir.
            event.preventDefault();
        }
        longPressFiredRef.current = false;
    }, [clearLongPressTimer]);


    if (loading) {
        return (
            <div className="canvas-loading">
                <div className="spinner"></div>
                <p>{loadingLabel}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="canvas-error">
                <p>❌ Erreur: {error}</p>
                {onErrorReset && <button onClick={onErrorReset}>Réinitialiser</button>}
            </div>
        );
    }

    return (
        <div
            className={`graph-canvas-shell ${className}`}
            onClick={onCanvasClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onNodeContextMenu={onNodeContextMenu}
                onNodeDragStop={onNodeDragStop}
                onEdgeClick={onEdgeClick}
                onEdgeContextMenu={onEdgeContextMenu}
                onPaneContextMenu={onPaneContextMenu}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                // Tactile (audit Chantier D) — panOnDrag/zoomOnPinch/preventScrolling sont déjà
                // les valeurs par défaut de reactflow v11 (posées ici explicitement pour que le
                // comportement tactile soit documenté plutôt qu'implicite) ; zoomOnDoubleClick
                // est en revanche désactivé volontairement : sans ça, un double-clic/double-tap
                // sur le fond du canvas déclenchait À LA FOIS le zoom natif de React Flow ET
                // l'ouverture du formulaire "ajouter un nœud" (UnifiedGeneticsCanvas.handleCanvasClick,
                // basé sur event.detail === 2) — les deux se marchaient dessus.
                zoomOnDoubleClick={false}
                zoomOnPinch
                panOnDrag
                preventScrolling
            >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap nodeColor={minimapNodeColor} maskColor={minimapMaskColor} />
                {toolbar}
                {sidePanel}
            </ReactFlow>

            {contextMenu}
            {modals}
            {fab}
        </div>
    );
}
