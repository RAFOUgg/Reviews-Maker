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
import {
    useNodesState,
    useEdgesState,
    Panel,
    useReactFlow,
    MarkerType
} from 'reactflow';
import { Sprout } from 'lucide-react';
import GraphCanvasShell from '../graph-canvas/GraphCanvasShell';
import useGeneticsStore from '../../store/useGeneticsStore';
import useResponsiveLayout from '../../hooks/useResponsiveLayout';
import CultivarNode from './CultivarNode';
import PhenoEdge from './PhenoEdge';
import PairingEdge from './PairingEdge';
import FamilyDropEdge from './FamilyDropEdge';
import NodeContextMenu from './NodeContextMenu';
import EdgeContextMenu from './EdgeContextMenu';
import PaneContextMenu from './PaneContextMenu';
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
    const { fitView, screenToFlowPosition } = useReactFlow();
    const { isMobile } = useResponsiveLayout();

    // State local pour le canvas
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [contextMenu, setContextMenu] = useState(null);
    const [contextMenuType, setContextMenuType] = useState(null); // 'node' | 'edge' | 'pane'
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'node'|'edge', id, label }

    // Persistance du point de courbure d'une liaison glissée à la main (PhenoEdge/PairingEdge).
    // pos=null réinitialise la ligne droite (double-clic sur la poignée).
    const handleEdgeWaypointChange = useCallback((edgeId, pos) => {
        store.updateEdge(edgeId, {
            waypointX: pos ? pos.x : null,
            waypointY: pos ? pos.y : null
        });
    }, [store]);

    // Persistance du côté d'accroche manuel d'une extrémité de liaison glissée à la main
    // (useDraggableEndpoint) — { sourceHandle } ou { targetHandle }, valeur null = retour à
    // l'accroche flottante automatique (double-clic sur la poignée).
    const handleEdgeEndpointChange = useCallback((edgeId, patch) => {
        store.updateEdge(edgeId, patch);
    }, [store]);

    // Glisser la bulle médiane d'un couple parental (PairingEdge) directement sur un autre nœud
    // du canvas : crée les liens de filiation manquants (couple -> nœud cible) sans passer par le
    // formulaire "Ajouter un enfant" — même résultat que EdgeContextMenu.handleAddChildToPairing
    // mais pour un individu déjà présent sur le canvas plutôt qu'un nouveau nœud à créer. Ignore
    // silencieusement les parents déjà liés à ce nœud (permet de "compléter" un couple partiel).
    const handlePairingDropOnNode = useCallback(async (pairingEdgeId, targetNodeId, targetHandleSide) => {
        if (readOnly) return;
        const pairing = store.edges.find(e => e.id === pairingEdgeId);
        if (!pairing) return;
        const { parentNodeId, childNodeId } = pairing;
        if (targetNodeId === parentNodeId || targetNodeId === childNodeId) return;

        const existingParents = new Set(
            store.edges
                .filter(e => PARENT_CHILD_TYPES.includes(e.relationshipType) && e.childNodeId === targetNodeId)
                .map(e => e.parentNodeId)
        );
        const toLink = [parentNodeId, childNodeId].filter(pid => !existingParents.has(pid));
        if (toLink.length === 0) return;

        for (const pid of toLink) {
            const result = await store.addEdge({ parentNodeId: pid, childNodeId: targetNodeId, relationshipType: 'parent' });
            if (result?.data?.id && targetHandleSide) {
                await store.updateEdge(result.data.id, { targetHandle: targetHandleSide });
            }
        }
    }, [readOnly, store]);

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
                    parentBPos: nodeB.position || { x: 0, y: 0 },
                    // Cette arête est purement visuelle (fusion des 2 liens réels ci-dessous) — son
                    // id "family-…" n'existe pas en base. Le menu contextuel doit agir sur les vrais
                    // GenEdge sous-jacents, jamais sur cet id synthétique (sinon 404 au clic Supprimer).
                    isFamily: true,
                    underlyingEdges: [e1, e2].map(e => ({
                        id: e.id,
                        parentName: store.nodes.find(n => n.id === e.parentNodeId)?.cultivarName || '?'
                    }))
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
                    onWaypointChange: handleEdgeWaypointChange,
                    sourceHandle: edge.sourceHandle,
                    targetHandle: edge.targetHandle,
                    onEndpointHandleChange: handleEdgeEndpointChange,
                    onDropChildLink: handlePairingDropOnNode
                }
            }));

        setNodes(rfNodes);
        setEdges([...rfEdges, ...familyEdges]);
    }, [store.nodes, store.edges, store.selectedNodeId, store.selectedEdgeId, setNodes, setEdges, handleEdgeWaypointChange, handleEdgeEndpointChange, handlePairingDropOnNode]);

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
            edgeId: edge.id,
            isFamily: !!edge.data?.isFamily,
            underlyingEdges: edge.data?.underlyingEdges || null
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

    // Clic droit sur le fond vide du canvas — menu "Ajouter un individu inconnu", point d'entrée
    // supplémentaire (déjà possible via double-clic ou le bouton toolbar) plus découvrable.
    const handlePaneContextMenu = useCallback((event) => {
        if (readOnly) return;
        event.preventDefault();
        setContextMenuType('pane');
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            flowPosition: screenToFlowPosition({ x: event.clientX, y: event.clientY })
        });
    }, [readOnly, screenToFlowPosition]);

    // Action "Ajouter un individu inconnu" — extraite pour être réutilisable depuis PLUSIEURS
    // points d'entrée (menu contextuel fond de canvas, bouton toolbar desktop, FAB mobile) sans
    // dupliquer la logique d'ouverture du formulaire.
    const addUnknownIndividual = useCallback((position) => {
        if (readOnly) return;
        store.openNodeForm({
            cultivarName: '',
            position: position || { x: 0, y: 0 },
            color: '#FF6B9D',
            genetics: null,
            notes: ''
        });
    }, [readOnly, store]);

    const handleAddUnknownIndividual = useCallback(() => {
        addUnknownIndividual(contextMenu?.flowPosition);
    }, [contextMenu, addUnknownIndividual]);

    // FAB mobile (cf. ci-dessous, visible seulement si isMobile) : pas de point de clic connu
    // comme pour le clic droit sur le fond, on cible donc le centre de l'écran converti en
    // coordonnées du graphe.
    const handleFabAddUnknownIndividual = useCallback(() => {
        const center = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        addUnknownIndividual(center);
    }, [addUnknownIndividual, screenToFlowPosition]);

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

    const selectedNode = store.selectedNodeId ? store.nodes.find(n => n.id === store.selectedNodeId) : null;

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
            minimapNodeColor={(node) => node.data?.color || '#FF6B9D'}
            // canvasLoading est aussi mis à true pour CHAQUE mutation en arrière-plan (déplacer un
            // nœud, ajouter une arête...), pas seulement le chargement initial de l'arbre. Ne
            // démonter le canvas (spinner plein écran) que lors du tout premier chargement, quand
            // il n'y a encore aucun nœud à afficher — sinon chaque glisser-déposer de nœud provoque
            // un flash "spinner + reset du zoom/pan" (ReactFlow `fitView` se redéclenche au remount).
            loading={store.canvasLoading && nodes.length === 0}
            loadingLabel="Chargement de l'arbre généalogique..."
            error={store.treeError}
            onErrorReset={() => store.clearSelection()}
            sidePanel={selectedNode && (
                <Panel position="top-right" className="node-info-panel">
                    <div className="info-content">
                        <h4>{selectedNode.cultivarName}</h4>
                        {selectedNode.genetics && (
                            <p>Type: {selectedNode.genetics.type || 'N/A'}</p>
                        )}
                        {selectedNode.notes && (
                            <p className="notes">{selectedNode.notes}</p>
                        )}
                        {!readOnly && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-edit" onClick={() => store.openNodeForm(selectedNode)}>
                                    Éditer
                                </button>
                                {selectedNode.sourceReviewId && (
                                    <button
                                        className="btn-edit"
                                        onClick={() => window.open(`/edit/flower/${selectedNode.sourceReviewId}`, '_blank', 'noopener')}
                                    >
                                        Éditer la review
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </Panel>
            )}
            contextMenu={<>
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
                        isFamily={contextMenu.isFamily}
                        underlyingEdges={contextMenu.underlyingEdges}
                    />
                )}
                {contextMenu && contextMenuType === 'pane' && (
                    <PaneContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        onClose={closeContextMenu}
                        onAddUnknownIndividual={handleAddUnknownIndividual}
                    />
                )}
            </>}
            modals={<>
                {store.showNodeForm && (
                    <NodeFormModal
                        isEdit={store.nodeFormData?.id !== undefined}
                        onClose={store.closeNodeForm}
                    />
                )}
                {store.showEdgeForm && (
                    <EdgeFormModal onClose={store.closeEdgeForm} />
                )}
                <ConfirmModal
                    open={!!deleteConfirm}
                    title={deleteConfirm?.type === 'node' ? 'Supprimer ce cultivar' : 'Supprimer cette relation'}
                    message={
                        deleteConfirm?.type === 'node'
                            ? `Supprimer "${deleteConfirm?.label || 'ce cultivar'}" ? Ses relations avec les autres nœuds seront aussi supprimées.`
                            : `Supprimer ${deleteConfirm?.label || 'cette relation'} ?`
                    }
                    confirmLabel="Supprimer"
                    onCancel={() => setDeleteConfirm(null)}
                    onConfirm={handleConfirmDelete}
                />
            </>}
            fab={isMobile && !readOnly && (
                <button
                    type="button"
                    className="mobile-add-node-fab"
                    onClick={handleFabAddUnknownIndividual}
                    title="Ajouter un individu inconnu"
                    aria-label="Ajouter un individu inconnu"
                >
                    <Sprout />
                </button>
            )}
        />
    );
};

export default UnifiedGeneticsCanvas;



