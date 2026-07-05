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
import { Sprout, AlertTriangle } from 'lucide-react';
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
import LinkExistingReviewModal from './LinkExistingReviewModal';
import MediaAttachmentModal from '../shared/MediaAttachmentModal';
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
    const [confirmDetachAll, setConfirmDetachAll] = useState(false);

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

    // Reconnexion réelle d'une extrémité de liaison vers un AUTRE nœud (glisser la poignée
    // source/target au-dessus d'un nœud différent de celui déjà attaché) — change parentNodeId
    // ou childNodeId, pas seulement le côté d'accroche. Backend revalide l'absence de cycle.
    const handleEdgeEndpointReconnect = useCallback((edgeId, end, newNodeId, newHandleSide) => {
        if (readOnly) return;
        store.updateEdge(edgeId, end === 'source'
            ? { parentNodeId: newNodeId, sourceHandle: newHandleSide }
            : { childNodeId: newNodeId, targetHandle: newHandleSide });
    }, [readOnly, store]);

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

        // genetics est stocké en JSON string côté API — parsé une fois ici (pour les nœuds ET
        // les partenaires d'un couple ci-dessous), sinon CultivarNode.jsx/PairingEdge.jsx ne
        // peuvent jamais lire genetics.type/.breeder/.sex.
        const parseGenetics = (node) => {
            let genetics = node?.genetics;
            if (typeof genetics === 'string') {
                try { genetics = JSON.parse(genetics); } catch { genetics = {}; }
            }
            return genetics || {};
        };

        // Convertir les nœuds du store au format React Flow
        const rfNodes = store.nodes.map(node => {
            const genetics = parseGenetics(node);
            return {
                id: node.id,
                data: {
                    label: node.cultivarName,
                    cultivarId: node.cultivarId,
                    image: node.image,
                    color: node.color || '#FF6B9D',
                    genetics: genetics || {},
                    notes: node.notes,
                    selected: store.selectedNodeId === node.id,
                    sourceReviewOrphaned: node.sourceReviewOrphaned,
                    mediaCount: Array.isArray(node.media) ? node.media.length : 0
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
                    // Le stem du T doit partir du MÊME point d'attache que la ligne de couple réelle
                    // (mêmes ids/handles/waypoint que la PairingEdge) — pas d'un milieu recalculé
                    // indépendamment, sinon la fourche vers l'enfant ne concorde pas visuellement
                    // avec le point où la ligne pointillée du couple se coude réellement.
                    parentAId: pair.parentNodeId,
                    parentBId: pair.childNodeId,
                    pairingSourceHandle: pair.sourceHandle,
                    pairingTargetHandle: pair.targetHandle,
                    pairingWaypointX: pair.waypointX,
                    pairingWaypointY: pair.waypointY,
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
            .map(edge => {
                const isPairing = edge.relationshipType === 'pairing';
                // Résumé sexe/type des deux partenaires d'un couple, affiché directement sur la
                // liaison (PairingEdge) — évite de devoir cliquer sur chaque nœud pour savoir ce
                // qui est croisé.
                let partnerA = null, partnerB = null;
                if (isPairing) {
                    const nodeA = store.nodes.find(n => n.id === edge.parentNodeId);
                    const nodeB = store.nodes.find(n => n.id === edge.childNodeId);
                    if (nodeA) { const g = parseGenetics(nodeA); partnerA = { sex: g.sex, type: g.type }; }
                    if (nodeB) { const g = parseGenetics(nodeB); partnerB = { sex: g.sex, type: g.type }; }
                }
                return {
                    id: edge.id,
                    source: edge.parentNodeId,
                    target: edge.childNodeId,
                    type: isPairing ? 'pairing' : 'pheno',
                    selected: store.selectedEdgeId === edge.id,
                    label: isPairing ? undefined : edge.relationshipType,
                    markerEnd: isPairing ? undefined : { type: MarkerType.ArrowClosed },
                    data: {
                        relationshipType: edge.relationshipType,
                        pollinationMethod: edge.pollinationMethod,
                        notes: edge.notes,
                        waypointX: edge.waypointX,
                        waypointY: edge.waypointY,
                        onWaypointChange: handleEdgeWaypointChange,
                        sourceHandle: edge.sourceHandle,
                        targetHandle: edge.targetHandle,
                        onEndpointHandleChange: handleEdgeEndpointChange,
                        onEndpointReconnect: handleEdgeEndpointReconnect,
                        onDropChildLink: handlePairingDropOnNode,
                        partnerA,
                        partnerB,
                        mediaCount: Array.isArray(edge.media) ? edge.media.length : 0
                    }
                };
            });

        setNodes(rfNodes);
        setEdges([...rfEdges, ...familyEdges]);
    }, [store.nodes, store.edges, store.selectedNodeId, store.selectedEdgeId, setNodes, setEdges, handleEdgeWaypointChange, handleEdgeEndpointChange, handleEdgeEndpointReconnect, handlePairingDropOnNode]);

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

    // React Flow expose l'id réel du handle utilisé ("left-source"/"right-target"/null pour
    // top/bottom, non nommés) — à normaliser vers le vocabulaire top|bottom|left|right attendu
    // par GenEdge.sourceHandle/targetHandle (même vocabulaire que l'accroche manuelle glissée).
    const normalizeHandleSide = useCallback((rawId, fallback) => {
        if (!rawId) return fallback;
        if (rawId.startsWith('left')) return 'left';
        if (rawId.startsWith('right')) return 'right';
        return fallback;
    }, []);

    // Gestion de la connexion entre deux nœuds
    const handleConnect = useCallback(async (connection) => {
        if (readOnly) return;

        // Ouvrir le formulaire d'arête, pré-rempli avec le côté d'accroche réellement utilisé
        // pour glisser la connexion — cohérent avec l'accroche manuelle (glisser une extrémité).
        store.openEdgeForm(connection.source, connection.target);
        store.updateEdgeFormData({
            sourceHandle: normalizeHandleSide(connection.sourceHandle, 'bottom'),
            targetHandle: normalizeHandleSide(connection.targetHandle, 'top')
        });
    }, [readOnly, store, normalizeHandleSide]);

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

    // Nœuds dont la review liée (sourceReviewId) a été supprimée depuis — calculé côté client à
    // partir du flag posé par le backend (GET /trees/:id), pas de champ agrégé à maintenir en sync.
    const orphanedNodeIds = store.nodes.filter(n => n.sourceReviewOrphaned).map(n => n.id);

    // "Tout détacher" : même pattern que handleNodeDragStop ci-dessus pour un déplacement multiple
    // (boucle Promise.all sur updateNode), pas de nouvel endpoint bulk.
    const handleDetachAllOrphans = useCallback(async () => {
        await Promise.all(orphanedNodeIds.map(id => store.updateNode(id, { sourceReviewId: null })));
        setConfirmDetachAll(false);
    }, [orphanedNodeIds, store]);

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
            toolbar={orphanedNodeIds.length > 0 && (
                <Panel position="top-center" className="orphan-banner">
                    <AlertTriangle size={14} />
                    <span>
                        {orphanedNodeIds.length} lien{orphanedNodeIds.length > 1 ? 's' : ''} cassé{orphanedNodeIds.length > 1 ? 's' : ''} (review supprimée)
                    </span>
                    {!readOnly && (
                        <button type="button" onClick={() => setConfirmDetachAll(true)}>
                            Tout détacher
                        </button>
                    )}
                </Panel>
            )}
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
                        {selectedNode.sourceReviewOrphaned && (
                            <p className="notes" style={{ color: '#fbbf24' }}>
                                ⚠️ La review liée à ce nœud a été supprimée
                            </p>
                        )}
                        {!readOnly && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-edit" onClick={() => store.openNodeForm(selectedNode)}>
                                    Éditer
                                </button>
                                {selectedNode.sourceReviewId && !selectedNode.sourceReviewOrphaned && (
                                    <button
                                        className="btn-edit"
                                        onClick={() => window.open(`/edit/flower/${selectedNode.sourceReviewId}`, '_blank', 'noopener')}
                                    >
                                        Éditer la review
                                    </button>
                                )}
                                {selectedNode.sourceReviewId && (
                                    <button
                                        className="btn-edit"
                                        onClick={() => store.updateNode(selectedNode.id, { sourceReviewId: null })}
                                    >
                                        Détacher la review
                                    </button>
                                )}
                                {!selectedNode.sourceReviewId && (
                                    <button
                                        className="btn-edit"
                                        onClick={() => store.openLinkReviewPicker(selectedNode.id)}
                                    >
                                        Lier à une review existante
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
                {store.linkReviewPickerNodeId && (
                    <LinkExistingReviewModal />
                )}
                {store.mediaModalTarget && (() => {
                    const { targetType, targetId } = store.mediaModalTarget;
                    const target = (targetType === 'node' ? store.nodes : store.edges).find(t => t.id === targetId);
                    if (!target) return null;
                    return (
                        <MediaAttachmentModal
                            media={Array.isArray(target.media) ? target.media : []}
                            onChange={(next) => store.updateMedia(targetType, targetId, next)}
                            onClose={store.closeMediaModal}
                        />
                    );
                })()}
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
                <ConfirmModal
                    open={confirmDetachAll}
                    title="Détacher tous les liens cassés"
                    message={`Détacher ${orphanedNodeIds.length} nœud(s) de leur review supprimée ? Les nœuds resteront dans l'arbre, seul le lien vers la review disparaît.`}
                    confirmLabel="Tout détacher"
                    onCancel={() => setConfirmDetachAll(false)}
                    onConfirm={handleDetachAllOrphans}
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



