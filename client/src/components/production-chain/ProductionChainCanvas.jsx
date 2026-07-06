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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { summarizeCellFields } from '../../utils/chainCellPipelines';
import ReviewNode from './ReviewNode';
import ChainAnnotationNode from './ChainAnnotationNode';
import ChainEdgeComponent from './ChainEdgeComponent';
import ChainHoverPreview from './ChainHoverPreview';
import ChainNodeContextMenu from './ChainNodeContextMenu';
import ChainEdgeContextMenu from './ChainEdgeContextMenu';
import ChainPaneContextMenu from './ChainPaneContextMenu';
import ChainEdgeFormModal from './ChainEdgeFormModal';
import ChainFormModal from './ChainFormModal';
import ChainCellPickerModal from './ChainCellPickerModal';
import ChainCellEditorModal from './ChainCellEditorModal';
import MediaAttachmentModal from '../shared/MediaAttachmentModal';
import ConfirmModal from '../shared/ConfirmModal';
import { Download, Upload, RotateCcw, FileImage, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';

// Délai avant apparition du hover preview — assez court pour rester réactif, assez long pour ne
// pas clignoter au simple passage de la souris entre deux nœuds voisins.
const HOVER_PREVIEW_DELAY = 300;

// Préférence de repli du panneau latéral droit, mémorisée entre sessions (même logique que
// ProductAddSidebar.COLLAPSE_STORAGE_KEY côté gauche).
const PANEL_COLLAPSE_STORAGE_KEY = 'chainInfoPanelCollapsed';

const nodeTypes = {
    reviewProduct: ReviewNode,
    annotationCard: ChainAnnotationNode
};

const edgeTypes = {
    transformation: ChainEdgeComponent
};

// Lignes affichées sur une carte épinglée créée depuis le résumé pipeline du panneau latéral —
// mêmes champs que le bloc "Données trouvées sur la fiche destination" (cf. JSX plus bas et
// ChainEdgeFormModal.jsx), pour ne jamais désynchroniser les deux affichages.
function pipelineSummaryBodyLines(pipelineSummary) {
    if (!pipelineSummary) return [];
    const lines = [];
    if (pipelineSummary.technique) lines.push({ label: 'Méthode', value: pipelineSummary.technique });
    if (pipelineSummary.materialType) lines.push({ label: 'Matière première', value: pipelineSummary.materialType });
    if (pipelineSummary.materialState) lines.push({ label: 'État de la matière', value: pipelineSummary.materialState });
    if (pipelineSummary.mesh) lines.push({ label: 'Maillage', value: pipelineSummary.mesh });
    if (pipelineSummary.dosage || pipelineSummary.dosageUnit) {
        lines.push({ label: 'Dosage', value: `${pipelineSummary.dosage ?? '?'} ${pipelineSummary.dosageUnit || ''}`.trim() });
    }
    if (pipelineSummary.stepCount > 0) lines.push({ label: 'Étapes enregistrées', value: String(pipelineSummary.stepCount) });
    if (pipelineSummary.detail) lines.push({ label: 'Détail', value: pipelineSummary.detail });
    return lines;
}

const ProductionChainCanvas = ({ chainId, readOnly = false }) => {
    const store = useProductionChainStore();
    const { fitView } = useReactFlow();
    const navigate = useNavigate();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [contextMenu, setContextMenu] = useState(null);
    const [contextMenuType, setContextMenuType] = useState(null); // 'node' | 'edge' | 'pane'
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [importing, setImporting] = useState(false);
    const [exportingSvg, setExportingSvg] = useState(false);
    const [confirmDetachAll, setConfirmDetachAll] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [panelCollapsed, setPanelCollapsed] = useState(() => localStorage.getItem(PANEL_COLLAPSE_STORAGE_KEY) === '1');

    useEffect(() => {
        localStorage.setItem(PANEL_COLLAPSE_STORAGE_KEY, panelCollapsed ? '1' : '0');
    }, [panelCollapsed]);

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

    // Synchroniser les nœuds, arêtes et cartes épinglées du store vers React Flow — les cartes
    // épinglées (annotations) sont un second type de nœud React Flow (pas de Handle, pas de
    // review associée) fusionné dans le même tableau `nodes` que les produits.
    useEffect(() => {
        const rfProductNodes = (store.nodes || []).map(node => ({
            id: node.id,
            data: {
                label: node.label,
                image: node.image,
                reviewType: node.reviewType,
                reviewId: node.reviewId,
                color: node.color || '#10b981',
                selected: store.selectedNodeId === node.id,
                reviewOrphaned: node.reviewOrphaned,
                cellCount: Array.isArray(node.cellData) ? node.cellData.length : 0,
                mediaCount: Array.isArray(node.media) ? node.media.length : 0
            },
            position: node.position || { x: 0, y: 0 },
            type: 'reviewProduct'
        }));

        const rfAnnotationNodes = (store.annotations || []).map(annotation => ({
            id: annotation.id,
            type: 'annotationCard',
            position: annotation.position || { x: 0, y: 0 },
            data: {
                title: annotation.title,
                body: annotation.body,
                sourceLabel: annotation.sourceLabel,
                onDelete: () => store.deleteAnnotation(annotation.id)
            }
        }));

        const rfEdges = (store.edges || []).map(edge => ({
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
                cellCount: Array.isArray(edge.cellData) ? edge.cellData.length : 0,
                mediaCount: Array.isArray(edge.media) ? edge.media.length : 0
            }
        }));

        setNodes([...rfProductNodes, ...rfAnnotationNodes]);
        setEdges(rfEdges);
    }, [store.nodes, store.edges, store.annotations, store.selectedNodeId, store.selectedEdgeId, setNodes, setEdges, handleEdgeWaypointChange, handleEdgeEndpointChange, handleEdgeEndpointReconnect]);

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

        if (!product) return;

        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const position = {
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        };

        // Glissé depuis le panneau latéral d'un nœud/liaison (cellule attachée ou résumé pipeline)
        // plutôt que depuis ProductAddSidebar — épingle une carte snapshot au point de dépôt.
        if (product.kind === 'annotation') {
            await store.addAnnotation({
                title: product.title,
                body: product.body || [],
                sourceLabel: product.sourceLabel || null,
                position
            });
            return;
        }

        if (!product.reviewId || !product.reviewType) return;

        const alreadyExists = store.nodes.some(n => n.reviewId === product.reviewId && n.reviewType === product.reviewType);
        if (alreadyExists) return;

        await store.addNode({
            reviewType: product.reviewType,
            reviewId: product.reviewId,
            position,
            color: '#10b981'
        });
    }, [readOnly, store]);

    // Cf. UnifiedGeneticsCanvas.jsx (genetics) : React Flow passe en 3e argument TOUS les nœuds
    // déplacés lors d'une sélection multiple — ne persister que le nœud déclencheur du drag
    // faisait revenir les autres à leur ancienne position au resync suivant du store. Les cartes
    // épinglées (type 'annotationCard') se déplacent de la même façon mais persistent via
    // updateAnnotation plutôt que updateNode.
    const handleNodeDragStop = useCallback(async (event, node, draggedNodes) => {
        if (readOnly) return;
        const movedNodes = Array.isArray(draggedNodes) && draggedNodes.length > 0 ? draggedNodes : [node];
        await Promise.all(movedNodes.map(n => n.type === 'annotationCard'
            ? store.updateAnnotation(n.id, { position: n.position })
            : store.updateNode(n.id, { position: n.position })));
        setNodes(nodes => nodes.map(n => {
            const moved = movedNodes.find(m => m.id === n.id);
            return moved ? { ...n, position: moved.position } : n;
        }));
    }, [readOnly, store, setNodes]);

    // React Flow expose l'id réel du handle utilisé ("left-source"/"right-target"/null pour
    // top/bottom, non nommés) — à normaliser vers le vocabulaire top|bottom|left|right attendu
    // par ChainEdge.sourceHandle/targetHandle (même vocabulaire que l'accroche manuelle glissée
    // et que UnifiedGeneticsCanvas.handleConnect, cf. commentaire là-bas).
    const normalizeHandleSide = useCallback((rawId, fallback) => {
        if (!rawId) return fallback;
        if (rawId.startsWith('left')) return 'left';
        if (rawId.startsWith('right')) return 'right';
        return fallback;
    }, []);

    const handleConnect = useCallback(async (connection) => {
        if (readOnly) return;
        store.openEdgeForm(connection.source, connection.target);
        store.updateEdgeFormData({
            sourceHandle: normalizeHandleSide(connection.sourceHandle, 'bottom'),
            targetHandle: normalizeHandleSide(connection.targetHandle, 'top')
        });
    }, [readOnly, store, normalizeHandleSide]);

    // Aperçu au survol (nœud ou liaison) — affiché après un court délai pour éviter le
    // clignotement, alimenté par store.reviewSummaryCache (chargé à la demande, une fois par
    // reviewId). Pour une liaison, le résumé porte sur la review CIBLE (même convention que
    // ChainEdgeFormModal/chainPipelineSummary.js : "la fiche destination documente sa fabrication").
    const [hoverInfo, setHoverInfo] = useState(null); // { kind: 'node'|'edge', id, x, y } | null
    const hoverTimerRef = useRef(null);

    const clearHoverTimer = useCallback(() => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    }, []);

    useEffect(() => clearHoverTimer, [clearHoverTimer]);

    const scheduleHover = useCallback((kind, id, event, reviewId, reviewType) => {
        clearHoverTimer();
        const { clientX, clientY } = event;
        hoverTimerRef.current = setTimeout(() => {
            hoverTimerRef.current = null;
            setHoverInfo({ kind, id, x: clientX, y: clientY });
            if (reviewId) store.ensureReviewSummary(reviewId, reviewType);
        }, HOVER_PREVIEW_DELAY);
    }, [clearHoverTimer, store]);

    const handleNodeMouseEnter = useCallback((event, node) => {
        const n = store.nodes.find(nd => nd.id === node.id);
        if (n) scheduleHover('node', node.id, event, n.reviewId, n.reviewType);
    }, [store.nodes, scheduleHover]);

    const handleNodeMouseLeave = useCallback(() => {
        clearHoverTimer();
        setHoverInfo(null);
    }, [clearHoverTimer]);

    const handleEdgeMouseEnter = useCallback((event, edge) => {
        const e = store.edges.find(ed => ed.id === edge.id);
        if (!e) return;
        const targetNode = store.nodes.find(n => n.id === e.targetNodeId);
        scheduleHover('edge', edge.id, event, targetNode?.reviewId, targetNode?.reviewType);
    }, [store.edges, store.nodes, scheduleHover]);

    const handleEdgeMouseLeave = useCallback(() => {
        clearHoverTimer();
        setHoverInfo(null);
    }, [clearHoverTimer]);

    const handleNodeClick = useCallback((event, node) => {
        event.stopPropagation();
        // Une carte épinglée n'a ni review ni panneau associé — seule sa suppression (bouton
        // dédié sur la carte) est possible, pas de sélection.
        if (node.type === 'annotationCard') return;
        store.selectNode(node.id);
    }, [store]);

    const handleNodeContextMenu = useCallback((event, node) => {
        if (readOnly) return;
        event.preventDefault();
        if (node.type === 'annotationCard') return;
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
    const selectedEdge = store.selectedEdgeId ? store.edges.find(e => e.id === store.selectedEdgeId) : null;
    const edgeSourceNode = selectedEdge ? store.nodes.find(n => n.id === selectedEdge.sourceNodeId) : null;
    const edgeTargetNode = selectedEdge ? store.nodes.find(n => n.id === selectedEdge.targetNodeId) : null;

    // Résumé pipeline du panneau de sélection : la propre review du nœud sélectionné, ou celle
    // du nœud CIBLE d'une liaison sélectionnée (même convention que le hover ci-dessus).
    const panelReviewId = selectedNode ? selectedNode.reviewId : edgeTargetNode?.reviewId;
    const panelReviewType = selectedNode ? selectedNode.reviewType : edgeTargetNode?.reviewType;

    useEffect(() => {
        if (panelReviewId) store.ensureReviewSummary(panelReviewId, panelReviewType);
    }, [panelReviewId, panelReviewType, store]);

    const panelTargetType = selectedNode ? 'node' : 'edge';
    const panelTargetId = selectedNode ? selectedNode.id : selectedEdge?.id;
    const panelAttachedCells = selectedNode
        ? (Array.isArray(selectedNode.cellData) ? selectedNode.cellData : [])
        : (Array.isArray(selectedEdge?.cellData) ? selectedEdge.cellData : []);
    const panelAttachedMedia = selectedNode
        ? (Array.isArray(selectedNode.media) ? selectedNode.media : [])
        : (Array.isArray(selectedEdge?.media) ? selectedEdge.media : []);
    const panelSummary = panelReviewId ? store.reviewSummaryCache[panelReviewId] : null;
    // Étiquette d'origine affichée sur une carte épinglée créée par glisser-déposer depuis ce
    // panneau (cf. handleDrop plus bas) — purement indicative, aucune référence vivante.
    const panelSubjectLabel = selectedNode
        ? selectedNode.label
        : (edgeSourceNode && edgeTargetNode ? `${edgeSourceNode.label} → ${edgeTargetNode.label}` : '');

    const handleAnnotationDragStart = useCallback((event, title, body) => {
        const payload = { kind: 'annotation', title, body, sourceLabel: panelSubjectLabel ? `depuis ${panelSubjectLabel}` : null };
        event.dataTransfer.setData('application/json', JSON.stringify(payload));
        event.dataTransfer.effectAllowed = 'copy';
    }, [panelSubjectLabel]);

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
            onNodeMouseEnter={handleNodeMouseEnter}
            onNodeMouseLeave={handleNodeMouseLeave}
            onEdgeMouseEnter={handleEdgeMouseEnter}
            onEdgeMouseLeave={handleEdgeMouseLeave}
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
            sidePanel={(selectedNode || selectedEdge) && (
                <Panel position="top-right" className={`node-info-panel ${panelCollapsed ? 'collapsed' : ''}`}>
                    <button
                        type="button"
                        className="node-info-panel-toggle"
                        onClick={() => setPanelCollapsed(v => !v)}
                        title={panelCollapsed ? 'Afficher le panneau' : 'Réduire le panneau'}
                    >
                        {panelCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {!panelCollapsed && (
                    <div className="info-content">
                        {selectedNode && (
                            <>
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
                                                onClick={() => navigate(`/edit/${selectedNode.reviewType}/${selectedNode.reviewId}`)}
                                            >
                                                Éditer la review
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
                            </>
                        )}

                        {selectedEdge && (
                            <>
                                <h4>{edgeSourceNode?.label || '?'} → {edgeTargetNode?.label || '?'}</h4>
                                {selectedEdge.technique && <p>Technique : {selectedEdge.technique}</p>}
                                {selectedEdge.date && <p>Date : {new Date(selectedEdge.date).toLocaleDateString('fr-FR')}</p>}
                                {selectedEdge.notes && <p className="notes">{selectedEdge.notes}</p>}
                            </>
                        )}

                        {(panelSummary?.loading || panelSummary?.pipelineSummary || (panelSummary?.fillSummary?.length > 0)) && (
                            <div
                                className="info-pipeline"
                                draggable={!!panelSummary?.pipelineSummary}
                                onDragStart={(e) => panelSummary?.pipelineSummary && handleAnnotationDragStart(
                                    e, panelSummary.pipelineSummary.label, pipelineSummaryBodyLines(panelSummary.pipelineSummary)
                                )}
                                title={panelSummary?.pipelineSummary ? 'Glisser sur le canvas pour épingler cette donnée' : undefined}
                            >
                                {panelSummary.loading && <p>Chargement du pipeline...</p>}
                                {!panelSummary.loading && panelSummary.pipelineSummary && (
                                    <p>
                                        <strong>{panelSummary.pipelineSummary.label}</strong>
                                        {panelSummary.pipelineSummary.technique ? ` — ${panelSummary.pipelineSummary.technique}` : ''}
                                    </p>
                                )}
                                {!panelSummary.loading && panelSummary.fillSummary?.map(f => (
                                    <p key={f.key} className="info-fill-row">
                                        <span>{f.label}</span>
                                        <span>{f.filled}/{f.total}</span>
                                    </p>
                                ))}
                            </div>
                        )}

                        {panelAttachedCells.length > 0 && (
                            <div className="info-cells">
                                <p className="info-section-label">Cellules attachées</p>
                                <p className="info-section-hint">Glissez une cellule sur le canvas pour l'épingler</p>
                                {panelAttachedCells.map(cell => {
                                    const fields = summarizeCellFields(cell.pipelineType, cell.data);
                                    return (
                                        <button
                                            key={cell.id}
                                            type="button"
                                            className="info-cell-row"
                                            draggable
                                            onDragStart={(e) => handleAnnotationDragStart(
                                                e,
                                                `${cell.pipelineLabel} — ${cell.cellLabel}`,
                                                fields.map(f => ({ label: f.label, value: f.value }))
                                            )}
                                            onClick={() => store.openCellEditor(panelTargetType, panelTargetId, cell)}
                                            title="Cliquer pour éditer — glisser sur le canvas pour épingler"
                                        >
                                            <span className="info-cell-label">{cell.pipelineLabel} — {cell.cellLabel}</span>
                                            {fields.length > 0 && (
                                                <span className="info-cell-fields">
                                                    {fields.slice(0, 2).map(f => f.label).join(', ')}{fields.length > 2 ? `, +${fields.length - 2}` : ''}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {panelAttachedMedia.length > 0 && (
                            <div className="info-media-grid">
                                {panelAttachedMedia.map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="info-media-thumb"
                                        onClick={() => store.openMediaModal(panelTargetType, panelTargetId)}
                                        title={item.caption || 'Voir les photos/vidéos'}
                                    >
                                        {item.type === 'video' ? (
                                            <video src={item.url} muted />
                                        ) : (
                                            <img src={item.url} alt={item.caption || ''} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    )}
                </Panel>
            )}
            floatingOverlay={hoverInfo && (() => {
                if (hoverInfo.kind === 'node') {
                    const node = store.nodes.find(n => n.id === hoverInfo.id);
                    if (!node) return null;
                    return (
                        <ChainHoverPreview
                            x={hoverInfo.x}
                            y={hoverInfo.y}
                            kind="node"
                            title={node.label}
                            reviewType={node.reviewType}
                            cellCount={Array.isArray(node.cellData) ? node.cellData.length : 0}
                            mediaCount={Array.isArray(node.media) ? node.media.length : 0}
                            summary={store.reviewSummaryCache[node.reviewId]}
                        />
                    );
                }
                const edge = store.edges.find(e => e.id === hoverInfo.id);
                if (!edge) return null;
                const sourceNode = store.nodes.find(n => n.id === edge.sourceNodeId);
                const targetNode = store.nodes.find(n => n.id === edge.targetNodeId);
                return (
                    <ChainHoverPreview
                        x={hoverInfo.x}
                        y={hoverInfo.y}
                        kind="edge"
                        title={`${sourceNode?.label || '?'} → ${targetNode?.label || '?'}`}
                        technique={edge.technique}
                        date={edge.date}
                        cellCount={Array.isArray(edge.cellData) ? edge.cellData.length : 0}
                        mediaCount={Array.isArray(edge.media) ? edge.media.length : 0}
                        summary={targetNode ? store.reviewSummaryCache[targetNode.reviewId] : null}
                    />
                );
            })()}
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
