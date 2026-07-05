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
import {
    useNodesState,
    useEdgesState,
    Panel,
    useReactFlow,
    MarkerType
} from 'reactflow';
import { toSvg } from 'html-to-image';
import { AlertTriangle } from 'lucide-react';
import GraphCanvasShell from '../graph-canvas/GraphCanvasShell';
import useProductionChainStore from '../../store/useProductionChainStore';
import ReviewNode from './ReviewNode';
import ChainEdgeComponent from './ChainEdgeComponent';
import ChainNodeContextMenu from './ChainNodeContextMenu';
import ChainEdgeContextMenu from './ChainEdgeContextMenu';
import ChainPaneContextMenu from './ChainPaneContextMenu';
import ChainEdgeFormModal from './ChainEdgeFormModal';
import ChainFormModal from './ChainFormModal';
import ChainCellPickerModal from './ChainCellPickerModal';
import ChainCellEditorModal from './ChainCellEditorModal';
import ConfirmModal from '../shared/ConfirmModal';
import { Download, Upload, RotateCcw, FileImage, Edit2 } from 'lucide-react';

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
    const [contextMenuType, setContextMenuType] = useState(null); // 'node' | 'edge' | 'pane'
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [importing, setImporting] = useState(false);
    const [exportingSvg, setExportingSvg] = useState(false);
    const [confirmDetachAll, setConfirmDetachAll] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);

    // Persistance du point de courbure d'une liaison glissée à la main — même pattern que
    // UnifiedGeneticsCanvas.jsx (PhenoHunt).
    const handleEdgeWaypointChange = useCallback((edgeId, pos) => {
        store.updateEdge(edgeId, {
            waypointX: pos ? pos.x : null,
            waypointY: pos ? pos.y : null
        });
    }, [store]);

    const handleEdgeEndpointChange = useCallback((edgeId, patch) => {
        store.updateEdge(edgeId, patch);
    }, [store]);

    // Reconnexion réelle d'une extrémité de liaison vers un AUTRE nœud (change sourceNodeId ou
    // targetNodeId) — le backend revalide l'absence de cycle et de doublon.
    const handleEdgeEndpointReconnect = useCallback((edgeId, end, newNodeId, newHandleSide) => {
        if (readOnly) return;
        store.updateEdge(edgeId, end === 'source'
            ? { sourceNodeId: newNodeId, sourceHandle: newHandleSide }
            : { targetNodeId: newNodeId, targetHandle: newHandleSide });
    }, [readOnly, store]);

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
                image: node.image,
                reviewType: node.reviewType,
                reviewId: node.reviewId,
                color: node.color || '#10b981',
                selected: store.selectedNodeId === node.id,
                reviewOrphaned: node.reviewOrphaned,
                cellCount: Array.isArray(node.cellData) ? node.cellData.length : 0
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
                notes: edge.notes,
                waypointX: edge.waypointX,
                waypointY: edge.waypointY,
                onWaypointChange: handleEdgeWaypointChange,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
                onEndpointHandleChange: handleEdgeEndpointChange,
                onEndpointReconnect: handleEdgeEndpointReconnect,
                cellCount: Array.isArray(edge.cellData) ? edge.cellData.length : 0
            }
        }));

        setNodes(rfNodes);
        setEdges(rfEdges);
    }, [store.nodes, store.edges, store.selectedNodeId, store.selectedEdgeId, setNodes, setEdges, handleEdgeWaypointChange, handleEdgeEndpointChange, handleEdgeEndpointReconnect]);

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

    // Cf. UnifiedGeneticsCanvas.jsx (genetics) : React Flow passe en 3e argument TOUS les nœuds
    // déplacés lors d'une sélection multiple — ne persister que le nœud déclencheur du drag
    // faisait revenir les autres à leur ancienne position au resync suivant du store.
    const handleNodeDragStop = useCallback(async (event, node, draggedNodes) => {
        if (readOnly) return;
        const movedNodes = Array.isArray(draggedNodes) && draggedNodes.length > 0 ? draggedNodes : [node];
        await Promise.all(movedNodes.map(n => store.updateNode(n.id, { position: n.position })));
        setNodes(nodes => nodes.map(n => {
            const moved = movedNodes.find(m => m.id === n.id);
            return moved ? { ...n, position: moved.position } : n;
        }));
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

    // Clic droit sur le fond vide du canvas — même point d'entrée que PhenoHunt, action limitée
    // au recentrage (pas d'équivalent "nœud sans review" côté chaîne, cf. ChainPaneContextMenu.jsx)
    const handlePaneContextMenu = useCallback((event) => {
        if (readOnly) return;
        event.preventDefault();
        setContextMenuType('pane');
        setContextMenu({ x: event.clientX, y: event.clientY });
    }, [readOnly]);

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

    const handleExportSVG = useCallback(async () => {
        setExportingSvg(true);
        try {
            const viewport = document.querySelector('.react-flow__viewport');
            if (!viewport) throw new Error('Canvas introuvable');
            const dataUrl = await toSvg(viewport, { backgroundColor: '#07070f' });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `production-chain-${chainId}.svg`;
            a.click();
        } catch (error) {
            console.error('Export SVG error:', error);
        } finally {
            setExportingSvg(false);
        }
    }, [chainId]);

    // Nœuds dont la review liée (reviewId) a été supprimée depuis — calculé côté client à partir
    // du flag posé par le backend (GET /chains/:id), même pattern que UnifiedGeneticsCanvas.jsx.
    const orphanedNodeIds = store.nodes.filter(n => n.reviewOrphaned).map(n => n.id);

    const handleDetachAllOrphans = useCallback(async () => {
        await Promise.all(orphanedNodeIds.map(id => store.updateNode(id, { reviewId: null })));
        setConfirmDetachAll(false);
    }, [orphanedNodeIds, store]);

    const selectedNode = store.selectedNodeId ? store.nodes.find(n => n.id === store.selectedNodeId) : null;

    useEffect(() => {
        if (chainId && chainId !== store.selectedChainId) {
            store.loadChain(chainId);
        }
    }, [chainId, store.selectedChainId, store.loadChain]);

    return (
        <GraphCanvasShell
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
            onCanvasClick={handleCanvasClick}
            onPaneContextMenu={handlePaneContextMenu}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            // canvasLoading est aussi vrai pendant chaque mutation en arrière-plan (déplacer un
            // nœud, ajouter une arête...) — cf. UnifiedGeneticsCanvas.jsx. Ne démonter le canvas
            // que lors du tout premier chargement (aucun nœud encore affiché), sinon chaque drag
            // provoque un flash spinner + reset du zoom/pan (fitView se redéclenche au remount).
            loading={store.canvasLoading && nodes.length === 0}
            loadingLabel="Chargement de la chaîne de production..."
            error={store.chainError}
            onErrorReset={() => store.clearSelection()}
            toolbar={<>
                {orphanedNodeIds.length > 0 && (
                    <Panel position="top-center" className="orphan-banner">
                        <AlertTriangle size={14} />
                        <span>
                            {orphanedNodeIds.length} produit{orphanedNodeIds.length > 1 ? 's' : ''} orphelin{orphanedNodeIds.length > 1 ? 's' : ''} (review supprimée)
                        </span>
                        {!readOnly && (
                            <button type="button" onClick={() => setConfirmDetachAll(true)}>
                                Tout détacher
                            </button>
                        )}
                    </Panel>
                )}
                {!readOnly && (
                    <Panel position="top-left" className="canvas-toolbar">
                        <div className="flex items-center gap-2">
                            <button className="toolbar-btn secondary" onClick={() => setShowRenameModal(true)} title="Renommer la chaîne">
                                <Edit2 size={14} /> Renommer
                            </button>
                            <button className="toolbar-btn secondary" onClick={() => fitView()} title="Réinitialiser le zoom">
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
                            <button className="toolbar-btn secondary" onClick={handleExportJSON} title="Exporter en JSON">
                                <Download size={14} /> JSON
                            </button>
                            <button className="toolbar-btn secondary" onClick={handleExportSVG} disabled={exportingSvg} title="Exporter en SVG">
                                <FileImage size={14} /> {exportingSvg ? 'Export...' : 'SVG'}
                            </button>
                        </div>
                    </Panel>
                )}
            </>}
            sidePanel={selectedNode && (
                <Panel position="top-right" className="node-info-panel">
                    <div className="info-content">
                        <h4>{selectedNode.label}</h4>
                        <p>Type: {selectedNode.reviewType}</p>
                        {selectedNode.reviewOrphaned && (
                            <p className="notes" style={{ color: '#fbbf24' }}>
                                ⚠️ La review liée à ce produit a été supprimée
                            </p>
                        )}
                        {!readOnly && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {selectedNode.reviewId && !selectedNode.reviewOrphaned && (
                                    <button
                                        className="btn-edit"
                                        onClick={() => window.open(`/review/${selectedNode.reviewId}`, '_blank', 'noopener')}
                                    >
                                        Voir la review
                                    </button>
                                )}
                                {selectedNode.reviewId && (
                                    <button
                                        className="btn-edit"
                                        onClick={() => store.updateNode(selectedNode.id, { reviewId: null })}
                                    >
                                        Détacher la review
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </Panel>
            )}
            contextMenu={<>
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
                {contextMenu && contextMenuType === 'pane' && (
                    <ChainPaneContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        onClose={closeContextMenu}
                        readOnly={readOnly}
                    />
                )}
            </>}
            modals={<>
                {store.showEdgeForm && (
                    <ChainEdgeFormModal onClose={store.closeEdgeForm} />
                )}
                {showRenameModal && store.selectedChain && (
                    <ChainFormModal chain={store.selectedChain} onClose={() => setShowRenameModal(false)} />
                )}
                {store.cellPicker && <ChainCellPickerModal />}
                {store.editingCell && <ChainCellEditorModal />}
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
                <ConfirmModal
                    open={confirmDetachAll}
                    title="Détacher tous les produits orphelins"
                    message={`Détacher ${orphanedNodeIds.length} produit(s) de leur review supprimée ? Les nœuds resteront dans la chaîne, seul le lien vers la review disparaît.`}
                    confirmLabel="Tout détacher"
                    onCancel={() => setConfirmDetachAll(false)}
                    onConfirm={handleDetachAllOrphans}
                />
            </>}
        />
    );
};

export default ProductionChainCanvas;
