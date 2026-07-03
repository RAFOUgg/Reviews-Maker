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

import React from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import './graphCanvas.css';

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
    className = '',
}) {
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
        <div className={`graph-canvas-shell ${className}`} onClick={onCanvasClick} onDragOver={onDragOver} onDrop={onDrop}>
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
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap />
                {toolbar}
                {sidePanel}
            </ReactFlow>

            {contextMenu}
            {modals}
        </div>
    );
}
