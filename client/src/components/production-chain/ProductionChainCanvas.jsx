/**
 * ProductionChainCanvas Component
 *
 * Composant React Flow pour la visualisation et édition des chaînes de production.
 * Sœur d'UnifiedGeneticsCanvas.jsx (genetics) — même squelette (sync store↔React Flow,
 * drag&drop, menus contextuels, readOnly) mais les nœuds référencent des reviews
 * existantes (pas de création de nœud vide) et les arêtes portent des métadonnées de
 * transformation (technique/date/notes) au lieu d'un type de relation généalogique.
 * Duplication volontaire plutôt que généralisation du composant genetics — voir le plan
 * d'implémentation pour la justification (éviter tout risque de régression sur PhenoHunt).
 */

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Background,
    Controls,
    MiniMap,
    Panel,
    useReactFlow,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../genetics/UnifiedGeneticsCanvas.css';
import useProductionChainStore from '../../store/useProductionChainStore';
import ReviewNode from './ReviewNode';
import ChainEdgeComponent from './ChainEdgeComponent';
import ChainNodeContextMenu from './ChainNodeContextMenu';
import ChainEdgeContextMenu from './ChainEdgeContextMenu';
import ChainEdgeFormModal from './ChainEdgeFormModal';
import ConfirmModal from '../shared/ConfirmModal';
import { Download, Upload, RotateCcw } from 'lucide-react';

const nodeTypes = {
    reviewProduct: ReviewNode
};

const edgeTypes = {
    transformation: ChainEdgeComponent
};

const ProductionChainCanvas = ({ chainId, readOnly = false }) => {
    const store = useProductionChainStore();
    const { fitView } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [contextMenu, setContextMenu] = useState(null);
    const [contextMenuType, setContextMenuType] = useState(null); // 'node' | 'edge'
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [importing, setImporting] = useState(false);

    // Synchroniser les nœuds et arêtes du store vers React Flow
    useEffect(() => {
        if (!store.nodes || store.nodes.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }

        const rfNodes = store.nodes.map(node => ({
            id: node.id,
            data: {
                label: node.label,
                reviewType: node.reviewType,
                reviewId: node.reviewId,
                color: node.color || '#10b981',
                selected: store.selectedNodeId === node.id
            },
            position: node.position || { x: 0, y: 0 },
            type: 'reviewProduct'
        }));

        const rfEdges = store.edges.map(edge => ({
            id: edge.id,
            source: edge.sourceNodeId,
            target: edge.targetNodeId,
            type: 'transformation',
            selected: store.selectedEdgeId === edge.id,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: {
                technique: edge.technique,
                date: edge.date,
                notes: edge.notes
            }
        }));

        setNodes(rfNodes);
        setEdges(rfEdges);
    }, [store.nodes, store.edges, store.selectedNodeId, store.selectedEdgeId, setNodes, setEdges]);

    // Drag & drop depuis ProductAddSidebar — un nœud référence toujours une review
    // existante, pas de création de nœud vide comme dans UnifiedGeneticsCanvas
    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDrop = useCallback(async (event) => {
        event.preventDefault();
        if (readOnly) return;

        const jsonData = event.dataTransfer.getData('application/json');
        if (!jsonData) return;

        let product;
        try {
            product = JSON.parse(jsonData);
        } catch { return; }

        if (!product || !product.reviewId || !product.reviewType) return;

        const alreadyExists = store.nodes.some(n => n.reviewId === product.reviewId && n.reviewType === product.reviewType);
        if (alreadyExists) return;

        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const position = {
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        };

        await store.addNode({
            reviewType: product.reviewType,
            reviewId: product.reviewId,
            position,
            color: '#10b981'
        });
    }, [readOnly, store]);

    const handleNodeDragStop = useCallback(async (event, node) => {
        if (readOnly) return;
        const newPosition = node.position;
        await store.updateNode(node.id, { position: newPosition });
        setNodes(nodes => nodes.map(n => n.id === node.id ? { ...n, position: newPosition } : n));
    }, [readOnly, store, setNodes]);

    const handleConnect = useCallback(async (connection) => {
        if (readOnly) return;
        store.openEdgeForm(connection.source, connection.target);
    }, [readOnly, store]);

    const handleNodeClick = useCallback((event, node) => {
        event.stopPropagation();
        store.selectNode(node.id);
    }, [store]);

    const handleNodeContextMenu = useCallback((event, node) => {
        if (readOnly) return;
        event.preventDefault();
        event.stopPropagation();
        setContextMenuType('node');
        setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    }, [readOnly]);

    const handleEdgeClick = useCallback((event, edge) => {
        event.stopPropagation();
        store.selectEdge(edge.id);
    }, [store]);

    const handleEdgeContextMenu = useCallback((event, edge) => {
        if (readOnly) return;
        event.preventDefault();
        event.stopPropagation();
        setContextMenuType('edge');
        setContextMenu({ x: event.clientX, y: event.clientY, edgeId: edge.id });
    }, [readOnly]);

    const handleCanvasClick = useCallback(() => {
        setContextMenu(null);
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
        setContextMenuType(null);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteConfirm) return;
        if (deleteConfirm.type === 'node') {
            await store.deleteNode(deleteConfirm.id);
        } else {
            await store.deleteEdge(deleteConfirm.id);
        }
        setDeleteConfirm(null);
    }, [deleteConfirm, store]);

    // Importer depuis la traçabilité existante (sourceLineage) : pour chaque nœud déjà
    // présent, lit sa review complète et ajoute les sources manquantes comme nœuds +
    // arêtes (technique/date vides, à compléter). Action déclenchée par l'utilisateur,
    // jamais automatique — voir le bug de sélection arbitraire corrigé sur PhenoHunt.
    const handleImportLineage = useCallback(async () => {
        if (readOnly || importing) return;
        setImporting(true);
        try {
            for (const node of store.nodes) {
                const res = await fetch(`/api/reviews/${node.reviewId}`, { credentials: 'include' });
                if (!res.ok) continue;
                const review = await res.json();

                let sourceLineage = [];
                const raw = review.hashData?.sourceLineage || review.concentrateData?.sourceLineage || review.edibleData?.sourceLineage;
                if (raw) {
                    try { sourceLineage = JSON.parse(raw); } catch { sourceLineage = []; }
                }

                for (const source of sourceLineage) {
                    if (!source?.id || !source?.type) continue;

                    let sourceNode = store.nodes.find(n => n.reviewId === source.id && n.reviewType === source.type);
                    if (!sourceNode) {
                        const result = await store.addNode({
                            reviewType: source.type,
                            reviewId: source.id,
                            position: { x: (node.position?.x || 0) - 200, y: (node.position?.y || 0) + Math.random() * 100 },
                            color: '#10b981'
                        });
                        sourceNode = result.data;
                    }

                    if (sourceNode) {
                        const edgeExists = store.edges.some(e => e.sourceNodeId === sourceNode.id && e.targetNodeId === node.id);
                        if (!edgeExists) {
                            await store.addEdge({ sourceNodeId: sourceNode.id, targetNodeId: node.id });
                        }
                    }
                }
            }
        } finally {
            setImporting(false);
        }
    }, [readOnly, importing, store]);

    const handleExportJSON = useCallback(() => {
        const data = {
            chain: { id: chainId, nodes: store.nodes, edges: store.edges },
            exportDate: new Date().toISOString()
        };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `production-chain-${chainId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [chainId, store.nodes, store.edges]);

    useEffect(() => {
        if (chainId && chainId !== store.selectedChainId) {
            store.loadChain(chainId);
        }
    }, [chainId, store.selectedChainId, store.loadChain]);

    if (store.canvasLoading) {
        return (
            <div className="canvas-loading">
                <div className="spinner"></div>
                <p>Chargement de la chaîne de production...</p>
            </div>
        );
    }

    if (store.chainError) {
        return (
            <div className="canvas-error">
                <p>❌ Erreur: {store.chainError}</p>
                <button onClick={() => store.clearSelection()}>Réinitialiser</button>
            </div>
        );
    }

    return (
        <div className="unified-genetics-canvas" onClick={handleCanvasClick} onDragOver={handleDragOver} onDrop={handleDrop}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={handleConnect}
                onNodeClick={handleNodeClick}
                onNodeContextMenu={handleNodeContextMenu}
                onNodeDragStop={handleNodeDragStop}
                onEdgeClick={handleEdgeClick}
                onEdgeContextMenu={handleEdgeContextMenu}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap />

                {!readOnly && (
                    <Panel position="top-left" className="canvas-toolbar">
                        <div className="flex items-center gap-2">
                            <button
                                className="toolbar-btn secondary"
                                onClick={() => fitView()}
                                title="Réinitialiser le zoom"
                            >
                                <RotateCcw size={14} /> Zoom
                            </button>
                            <button
                                className="toolbar-btn secondary"
                                onClick={handleImportLineage}
                                disabled={importing}
                                title="Importer depuis la traçabilité existante (sourceLineage)"
                            >
                                <Upload size={14} /> {importing ? 'Import...' : 'Importer traçabilité'}
                            </button>
                            <button
                                className="toolbar-btn secondary"
                                onClick={handleExportJSON}
                                title="Exporter en JSON"
                            >
                                <Download size={14} /> JSON
                            </button>
                        </div>
                    </Panel>
                )}
            </ReactFlow>

            {contextMenu && contextMenuType === 'node' && (
                <ChainNodeContextMenu
                    nodeId={contextMenu.nodeId}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    readOnly={readOnly}
                    onRequestDelete={setDeleteConfirm}
                />
            )}

            {contextMenu && contextMenuType === 'edge' && (
                <ChainEdgeContextMenu
                    edgeId={contextMenu.edgeId}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    readOnly={readOnly}
                    onRequestDelete={setDeleteConfirm}
                />
            )}

            {store.showEdgeForm && (
                <ChainEdgeFormModal onClose={store.closeEdgeForm} />
            )}

            <ConfirmModal
                open={!!deleteConfirm}
                title={deleteConfirm?.type === 'node' ? 'Retirer ce produit' : 'Supprimer cette transformation'}
                message={
                    deleteConfirm?.type === 'node'
                        ? `Retirer "${deleteConfirm?.label || 'ce produit'}" du graphe ? La review elle-même ne sera pas supprimée.`
                        : 'Supprimer cette liaison de transformation ?'
                }
                confirmLabel="Confirmer"
                onCancel={() => setDeleteConfirm(null)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default ProductionChainCanvas;
