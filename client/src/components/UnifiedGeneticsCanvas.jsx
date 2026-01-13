/**
 * UnifiedGeneticsCanvas Component
 * 
 * Composant React Flow unifié pour la visualisation et édition des arbres généalogiques
 * Remplace les 3 implémentations parallèles (CanevasPhenoHunt, GenealogyCanvas, GeneticsLibraryCanvas)
 * 
 * Features:
 * - Visualisation graphique avec React Flow
 * - Drag & drop des nœuds
 * - Édition des nœuds et arêtes
 * - Contextual menu (clic droit)
 * - Zoom et navigation
 * - Export (JSON, SVG)
 */

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    Node,
    Edge,
    addEdge,
    Connection,
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
import useGeneticsStore from '../store/useGeneticsStore';
import CultivarNode from './nodes/CultivarNode';
import NodeContextMenu from './menus/NodeContextMenu';
import EdgeContextMenu from './menus/EdgeContextMenu';
import NodeFormModal from './modals/NodeFormModal';
import EdgeFormModal from './modals/EdgeFormModal';
import TreeToolbar from './toolbar/TreeToolbar';
import './UnifiedGeneticsCanvas.css';

const nodeTypes = {
    cultivar: CultivarNode
};

const UnifiedGeneticsCanvas = ({ treeId, readOnly = false }) => {
    const store = useGeneticsStore();
    const { fitView } = useReactFlow();

    // State local pour le canvas
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [contextMenu, setContextMenu] = useState(null);
    const [contextMenuType, setContextMenuType] = useState(null); // 'node' | 'edge'

    // Synchroniser les nœuds et arêtes du store vers React Flow
    useEffect(() => {
        if (!store.nodes || store.nodes.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }

        // Convertir les nœuds du store au format React Flow
        const rfNodes = store.nodes.map(node => ({
            id: node.id,
            data: {
                label: node.cultivarName,
                cultivarId: node.cultivarId,
                image: node.image,
                genetics: node.genetics,
                notes: node.notes
            },
            position: node.position || { x: 0, y: 0 },
            style: {
                background: node.color || '#FF6B9D',
                borderColor: store.selectedNodeId === node.id ? '#000' : '#666',
                borderWidth: store.selectedNodeId === node.id ? 3 : 2
            },
            type: 'cultivar'
        }));

        // Convertir les arêtes du store au format React Flow
        const rfEdges = store.edges.map(edge => ({
            id: edge.id,
            source: edge.parentNodeId,
            target: edge.childNodeId,
            animated: store.selectedEdgeId === edge.id,
            style: {
                stroke: store.selectedEdgeId === edge.id ? '#000' : '#999'
            },
            label: edge.relationshipType,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: {
                relationshipType: edge.relationshipType,
                notes: edge.notes
            }
        }));

        setNodes(rfNodes);
        setEdges(rfEdges);
    }, [store.nodes, store.edges, store.selectedNodeId, store.selectedEdgeId, setNodes, setEdges]);

    // Gestion du drag & drop des nœuds
    const handleNodeDragStop = useCallback(async (event, node) => {
        if (readOnly) return;

        // Mettre à jour la position du nœud dans le store
        const newPosition = node.position;
        await store.updateNode(node.id, { position: newPosition });

        // Mettre à jour aussi dans React Flow
        setNodes(nodes => nodes.map(n =>
            n.id === node.id ? { ...n, position: newPosition } : n
        ));
    }, [readOnly, store, setNodes]);

    // Gestion de la connexion entre deux nœuds
    const handleConnect = useCallback(async (connection) => {
        if (readOnly) return;

        // Ouvrir le formulaire d'arête
        store.openEdgeForm(connection.source, connection.target);
    }, [readOnly, store]);

    // Clic sur un nœud
    const handleNodeClick = useCallback((event, node) => {
        event.stopPropagation();
        store.selectNode(node.id);
    }, [store]);

    // Clic droit sur un nœud
    const handleNodeContextMenu = useCallback((event, node) => {
        if (readOnly) return;
        event.preventDefault();
        event.stopPropagation();

        setContextMenuType('node');
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            nodeId: node.id
        });
    }, [readOnly]);

    // Clic sur une arête
    const handleEdgeClick = useCallback((event, edge) => {
        event.stopPropagation();
        store.selectEdge(edge.id);
    }, [store]);

    // Clic droit sur une arête
    const handleEdgeContextMenu = useCallback((event, edge) => {
        if (readOnly) return;
        event.preventDefault();
        event.stopPropagation();

        setContextMenuType('edge');
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            edgeId: edge.id
        });
    }, [readOnly]);

    // Clic sur le canvas
    const handleCanvasClick = useCallback((event) => {
        if (event.detail === 2) {
            // Double-click pour ajouter un nœud
            if (readOnly) return;

            const { x, y } = store.canvasPosition;
            store.openNodeForm({
                cultivarName: '',
                position: { x: -x / store.canvasZoom, y: -y / store.canvasZoom },
                color: '#FF6B9D',
                genetics: null,
                notes: ''
            });
        } else {
            setContextMenu(null);
        }
    }, [readOnly, store]);

    // Fermer le menu contextuel
    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
        setContextMenuType(null);
    }, []);

    // Charger l'arbre au montage
    useEffect(() => {
        if (treeId && treeId !== store.selectedTreeId) {
            store.loadTree(treeId);
        }
    }, [treeId, store.selectedTreeId, store.loadTree]);

    // Loading state
    if (store.canvasLoading) {
        return (
            <div className="canvas-loading">
                <div className="spinner"></div>
                <p>Chargement de l'arbre généalogique...</p>
            </div>
        );
    }

    // Error state
    if (store.treeError) {
        return (
            <div className="canvas-error">
                <p>❌ Erreur: {store.treeError}</p>
                <button onClick={() => store.clearSelection()}>Réinitialiser</button>
            </div>
        );
    }

    return (
        <div className="unified-genetics-canvas" onClick={handleCanvasClick}>
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
                fitView
            >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap />

                {/* Toolbar en haut */}
                {!readOnly && (
                    <Panel position="top-left" className="canvas-toolbar">
                        <TreeToolbar treeId={treeId} />
                    </Panel>
                )}

                {/* Info sur le nœud sélectionné */}
                {store.selectedNodeId && (
                    <Panel position="top-right" className="node-info-panel">
                        {(() => {
                            const node = store.nodes.find(n => n.id === store.selectedNodeId);
                            return (
                                <div className="info-content">
                                    <h4>{node?.cultivarName}</h4>
                                    {node?.genetics && (
                                        <p>Type: {node.genetics.type || 'N/A'}</p>
                                    )}
                                    {node?.notes && (
                                        <p className="notes">{node.notes}</p>
                                    )}
                                    {!readOnly && (
                                        <button
                                            className="btn-edit"
                                            onClick={() => store.openNodeForm(node)}
                                        >
                                            Éditer
                                        </button>
                                    )}
                                </div>
                            );
                        })()}
                    </Panel>
                )}
            </ReactFlow>

            {/* Menus contextuels */}
            {contextMenu && contextMenuType === 'node' && (
                <NodeContextMenu
                    nodeId={contextMenu.nodeId}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    readOnly={readOnly}
                />
            )}

            {contextMenu && contextMenuType === 'edge' && (
                <EdgeContextMenu
                    edgeId={contextMenu.edgeId}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    readOnly={readOnly}
                />
            )}

            {/* Modales de formulaires */}
            {store.showNodeForm && (
                <NodeFormModal
                    isEdit={store.nodeFormData?.id !== undefined}
                    onClose={store.closeNodeForm}
                />
            )}

            {store.showEdgeForm && (
                <EdgeFormModal
                    onClose={store.closeEdgeForm}
                />
            )}
        </div>
    );
};

export default UnifiedGeneticsCanvas;


