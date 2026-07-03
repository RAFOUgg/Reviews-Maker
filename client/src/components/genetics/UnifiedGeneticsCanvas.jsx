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
    addEdge,
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
import './UnifiedGeneticsCanvas.css';
import useGeneticsStore from '../../store/useGeneticsStore';
import CultivarNode from './CultivarNode';
import PhenoEdge from './PhenoEdge';
import PairingEdge from './PairingEdge';
import FamilyDropEdge from './FamilyDropEdge';
import NodeContextMenu from './NodeContextMenu';
import EdgeContextMenu from './EdgeContextMenu';
import NodeFormModal from './NodeFormModal';
import EdgeFormModal from './EdgeFormModal';
import ConfirmModal from '../shared/ConfirmModal';

const nodeTypes = {
    cultivar: CultivarNode
};

const edgeTypes = {
    pheno: PhenoEdge,
    pairing: PairingEdge,
    family: FamilyDropEdge
};

// Types de relation parent→enfant réels (filiation) — "sibling" et "pairing" en sont exclus :
// un lien fraternel ne relie pas un parent à son enfant, et "pairing" relie deux parents entre eux.
const PARENT_CHILD_TYPES = ['parent', 'pollen_donor', 'clone', 'mutation'];

const UnifiedGeneticsCanvas = ({ treeId, readOnly = false }) => {
    const store = useGeneticsStore();
    const { fitView } = useReactFlow();

    // State local pour le canvas
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [contextMenu, setContextMenu] = useState(null);
    const [contextMenuType, setContextMenuType] = useState(null); // 'node' | 'edge'
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'node'|'edge', id, label }

    // Persistance du point de courbure d'une liaison glissée à la main (PhenoEdge/PairingEdge).
    // pos=null réinitialise la ligne droite (double-clic sur la poignée).
    const handleEdgeWaypointChange = useCallback((edgeId, pos) => {
        store.updateEdge(edgeId, {
            waypointX: pos ? pos.x : null,
            waypointY: pos ? pos.y : null
        });
    }, [store]);

    // Synchroniser les nœuds et arêtes du store vers React Flow
    useEffect(() => {
        if (!store.nodes || store.nodes.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }

        // Convertir les nœuds du store au format React Flow
        const rfNodes = store.nodes.map(node => {
            // genetics est stocké en JSON string côté API — le parser ici une fois pour
            // toutes, sinon CultivarNode.jsx ne peut jamais lire genetics.type/.breeder/.sex
            let genetics = node.genetics;
            if (typeof genetics === 'string') {
                try { genetics = JSON.parse(genetics); } catch { genetics = {}; }
            }
            return {
                id: node.id,
                data: {
                    label: node.cultivarName,
                    cultivarId: node.cultivarId,
                    image: node.image,
                    color: node.color || '#FF6B9D',
                    genetics: genetics || {},
                    notes: node.notes,
                    selected: store.selectedNodeId === node.id
                },
                position: node.position || { x: 0, y: 0 },
                type: 'cultivar'
            };
        });

        // Regrouper les enfants communs à un couple parental ("pairing") : leurs deux liens de
        // filiation individuels sont remplacés, dans le RENDU uniquement, par une seule liaison
        // "family" partant du milieu de la ligne de couple (convention pedigree). Les GenEdge
        // réels ne changent pas — seule leur représentation visuelle est fusionnée.
        const pairingEdges = store.edges.filter(e => e.relationshipType === 'pairing');
        const childParentEdges = new Map(); // childNodeId -> [edge, ...]
        store.edges.forEach(edge => {
            if (!PARENT_CHILD_TYPES.includes(edge.relationshipType)) return;
            const list = childParentEdges.get(edge.childNodeId) || [];
            list.push(edge);
            childParentEdges.set(edge.childNodeId, list);
        });

        const consumedEdgeIds = new Set();
        const familyEdges = [];
        childParentEdges.forEach((parentEdges, childId) => {
            if (parentEdges.length !== 2) return;
            const [e1, e2] = parentEdges;
            const pair = pairingEdges.find(p =>
                (p.parentNodeId === e1.parentNodeId && p.childNodeId === e2.parentNodeId) ||
                (p.parentNodeId === e2.parentNodeId && p.childNodeId === e1.parentNodeId)
            );
            if (!pair) return;
            const nodeA = store.nodes.find(n => n.id === pair.parentNodeId);
            const nodeB = store.nodes.find(n => n.id === pair.childNodeId);
            if (!nodeA || !nodeB) return;
            consumedEdgeIds.add(e1.id);
            consumedEdgeIds.add(e2.id);
            familyEdges.push({
                id: `family-${pair.id}-${childId}`,
                source: pair.parentNodeId,
                target: childId,
                type: 'family',
                selected: store.selectedEdgeId === e1.id || store.selectedEdgeId === e2.id,
                markerEnd: { type: MarkerType.ArrowClosed },
                data: {
                    parentAPos: nodeA.position || { x: 0, y: 0 },
                    parentBPos: nodeB.position || { x: 0, y: 0 }
                }
            });
        });

        // Convertir les arêtes du store au format React Flow
        const rfEdges = store.edges
            .filter(edge => !consumedEdgeIds.has(edge.id))
            .map(edge => ({
                id: edge.id,
                source: edge.parentNodeId,
                target: edge.childNodeId,
                type: edge.relationshipType === 'pairing' ? 'pairing' : 'pheno',
                selected: store.selectedEdgeId === edge.id,
                label: edge.relationshipType === 'pairing' ? undefined : edge.relationshipType,
                markerEnd: edge.relationshipType === 'pairing' ? undefined : { type: MarkerType.ArrowClosed },
                data: {
                    relationshipType: edge.relationshipType,
                    notes: edge.notes,
                    waypointX: edge.waypointX,
                    waypointY: edge.waypointY,
                    onWaypointChange: handleEdgeWaypointChange
                }
            }));

        setNodes(rfNodes);
        setEdges([...rfEdges, ...familyEdges]);
    }, [store.nodes, store.edges, store.selectedNodeId, store.selectedEdgeId, setNodes, setEdges, handleEdgeWaypointChange]);

    // Gestion du drag & drop depuis la bibliothèque de cultivars (sidebar)
    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDrop = useCallback(async (event) => {
        event.preventDefault();
        if (readOnly) return;

        // Read cultivar data from the drag transfer
        const jsonData = event.dataTransfer.getData('application/json');
        if (!jsonData) return;

        let cultivar;
        try {
            cultivar = JSON.parse(jsonData);
        } catch { return; }

        if (!cultivar || !cultivar.id) return;

        // Calculate drop position relative to the React Flow canvas
        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const position = {
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        };

        // Check if this cultivar already exists as a node
        const alreadyExists = store.nodes.some(n => n.cultivarId === cultivar.id);
        if (alreadyExists) return;

        // cultivarId est une vraie clé étrangère vers la table Cultivar — ne la renseigner que
        // pour les éléments venant réellement de la bibliothèque de cultivars. Les cartes de
        // reviews utilisateur partagent le même format de drag mais leur `id` est un id de
        // Review, pas de Cultivar : l'envoyer comme cultivarId casse la contrainte FK (500)
        const isLibraryCultivar = cultivar._source === 'library';

        // Add the node via the store (backend API)
        await store.addNode({
            cultivarId: isLibraryCultivar ? cultivar.id : null,
            cultivarName: cultivar.name || cultivar.cultivarName || 'Sans nom',
            image: cultivar.image || null,
            genetics: cultivar.genetics || null,
            notes: '',
            position,
            color: '#10b981',
            // Relie la review en retour à cet arbre (côté backend) quand le nœud provient d'une
            // fiche technique et non de la bibliothèque — sinon la review reste "sans arbre" pour
            // toujours et le modal de création d'arbre réapparaît à chaque réédition.
            sourceReviewId: !isLibraryCultivar ? cultivar.reviewId : null,
        });
    }, [readOnly, store]);

    // Gestion du drag & drop des nœuds. React Flow passe en 3e argument TOUS les nœuds
    // effectivement déplacés (cas d'une sélection multiple déplacée ensemble) — n'utiliser que
    // `node` (le seul déclencheur du drag) faisait persister uniquement sa position ; les autres
    // nœuds sélectionnés revenaient visuellement à leur ancienne position dès que le store se
    // resynchronisait après la réponse API.
    const handleNodeDragStop = useCallback(async (event, node, draggedNodes) => {
        if (readOnly) return;

        const movedNodes = Array.isArray(draggedNodes) && draggedNodes.length > 0 ? draggedNodes : [node];

        await Promise.all(movedNodes.map(n => store.updateNode(n.id, { position: n.position })));

        setNodes(nodes => nodes.map(n => {
            const moved = movedNodes.find(m => m.id === n.id);
            return moved ? { ...n, position: moved.position } : n;
        }));
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

    // Confirmation de suppression (nœud ou arête) — remplace les confirm() natifs des menus contextuels
    const handleConfirmDelete = useCallback(async () => {
        if (!deleteConfirm) return;
        if (deleteConfirm.type === 'node') {
            await store.deleteNode(deleteConfirm.id);
        } else {
            await store.deleteEdge(deleteConfirm.id);
        }
        setDeleteConfirm(null);
    }, [deleteConfirm, store]);

    // Charger l'arbre au montage
    useEffect(() => {
        if (treeId && treeId !== store.selectedTreeId) {
            store.loadTree(treeId);
        }
    }, [treeId, store.selectedTreeId, store.loadTree]);

    // Loading state — canvasLoading est aussi mis à true pour CHAQUE mutation en arrière-plan
    // (déplacer un nœud, ajouter une arête...), pas seulement le chargement initial de l'arbre.
    // Ne démonter le canvas (spinner plein écran) que lors du tout premier chargement, quand il
    // n'y a encore aucun nœud à afficher — sinon chaque glisser-déposer de nœud provoquait un
    // flash "spinner + reset du zoom/pan" (ReactFlow `fitView` se redéclenche au remount).
    if (store.canvasLoading && nodes.length === 0) {
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
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn-edit"
                                                onClick={() => store.openNodeForm(node)}
                                            >
                                                Éditer
                                            </button>
                                            {node?.sourceReviewId && (
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => window.open(`/edit/flower/${node.sourceReviewId}`, '_blank', 'noopener')}
                                                >
                                                    Éditer la review
                                                </button>
                                            )}
                                        </div>
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
                    onRequestDelete={setDeleteConfirm}
                />
            )}

            {contextMenu && contextMenuType === 'edge' && (
                <EdgeContextMenu
                    edgeId={contextMenu.edgeId}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    readOnly={readOnly}
                    onRequestDelete={setDeleteConfirm}
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

            <ConfirmModal
                open={!!deleteConfirm}
                title={deleteConfirm?.type === 'node' ? 'Supprimer ce cultivar' : 'Supprimer cette relation'}
                message={
                    deleteConfirm?.type === 'node'
                        ? `Supprimer "${deleteConfirm?.label || 'ce cultivar'}" ? Ses relations avec les autres nœuds seront aussi supprimées.`
                        : 'Supprimer cette relation ?'
                }
                confirmLabel="Supprimer"
                onCancel={() => setDeleteConfirm(null)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default UnifiedGeneticsCanvas;



