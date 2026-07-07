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
    useStoreApi,
    MarkerType
} from 'reactflow';
import { toSvg } from 'html-to-image';
import { AlertTriangle } from 'lucide-react';
import GraphCanvasShell from '../graph-canvas/GraphCanvasShell';
import useProductionChainStore from '../../store/useProductionChainStore';
import { summarizeCellFields } from '../../utils/chainCellPipelines';
import { findNodeAtPoint, findEdgeNearPoint } from '../graph-canvas/floatingEdgeUtils';
import ReviewNode from './ReviewNode';
import ChainAnnotationNode from './ChainAnnotationNode';
import ChainEdgeComponent from './ChainEdgeComponent';
import ChainHoverPreview from './ChainHoverPreview';
import ChainNodeContextMenu from './ChainNodeContextMenu';
import ChainEdgeContextMenu from './ChainEdgeContextMenu';
import ChainPaneContextMenu from './ChainPaneContextMenu';
import ChainAnnotationContextMenu from './ChainAnnotationContextMenu';
import CellDropMenu from './CellDropMenu';
import ChainEdgeFormModal from './ChainEdgeFormModal';
import ChainFormModal from './ChainFormModal';
import ChainCellPickerModal from './ChainCellPickerModal';
import ChainCellEditorModal from './ChainCellEditorModal';
import ChainMediaPickerModal from './ChainMediaPickerModal';
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
    const { fitView, screenToFlowPosition } = useReactFlow();
    const rfStoreApi = useStoreApi();
    const navigate = useNavigate();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [contextMenu, setContextMenu] = useState(null);
    const [contextMenuType, setContextMenuType] = useState(null); // 'node' | 'edge' | 'pane' | 'annotation'
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [importing, setImporting] = useState(false);
    const [exportingSvg, setExportingSvg] = useState(false);
    const [confirmDetachAll, setConfirmDetachAll] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [panelCollapsed, setPanelCollapsed] = useState(() => localStorage.getItem(PANEL_COLLAPSE_STORAGE_KEY) === '1');

    // Sélection multiple (ctrl+clic / shift+clic) dans le panneau "Cellules attachées" — même
    // recette que PipelineDragDropView.jsx (handleSidebarItemClick/handleCellClick), pour glisser
    // plusieurs cellules à la fois. Réinitialisée dès qu'on change de nœud/liaison sélectionné(e)
    // (cf. useEffect plus bas, une fois panelTargetId calculé).
    const [selectedCellIds, setSelectedCellIds] = useState([]);
    const cellSelectionAnchorRef = useRef(null);
    // cellDropMenu : { x, y, cells, originTargetType, originTargetId, dropPoint } | null — affiché
    // uniquement quand un glisser-clic-droit de cellule(s) est relâché sur un AUTRE produit/liaison
    // (cas où déplacer/copier/épingler sont tous les trois pertinents).
    const [cellDropMenu, setCellDropMenu] = useState(null);

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

        // Ligne de rattachement pointillée entre une carte ancrée (nodeId/edgeId) et son produit —
        // pour une carte ancrée à une liaison, on relie visuellement au nœud SOURCE de cette
        // liaison (simplification : une vraie géométrie carte↔liaison n'a pas d'équivalent React
        // Flow natif, un lien vers un nœud réel suffit à rendre le rattachement visible).
        // Type d'arête natif 'straight' + non sélectionnable : pas de composant dédié nécessaire.
        const annotationLinkEdges = (store.annotations || [])
            .map(annotation => {
                const targetNodeId = annotation.nodeId
                    || (annotation.edgeId ? store.edges.find(e => e.id === annotation.edgeId)?.sourceNodeId : null);
                if (!targetNodeId) return null;
                return {
                    id: `annotation-link-${annotation.id}`,
                    source: targetNodeId,
                    target: annotation.id,
                    type: 'straight',
                    selectable: false,
                    focusable: false,
                    style: { strokeDasharray: '4 4', stroke: 'rgba(148, 163, 184, 0.35)', strokeWidth: 1 }
                };
            })
            .filter(Boolean);

        setNodes([...rfProductNodes, ...rfAnnotationNodes]);
        setEdges([...rfEdges, ...annotationLinkEdges]);
    }, [store.nodes, store.edges, store.annotations, store.selectedNodeId, store.selectedEdgeId, setNodes, setEdges, handleEdgeWaypointChange, handleEdgeEndpointChange, handleEdgeEndpointReconnect]);

    // Drag & drop depuis ProductAddSidebar — un nœud référence toujours une review
    // existante, pas de création de nœud vide comme dans UnifiedGeneticsCanvas
    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, []);

    // Hit-test au point de dépôt (coordonnées flow) — nœud produit → épingler/rattacher à ce
    // produit, carte annotation déjà épinglée → fusionner dedans, arête → rattacher à cette
    // transformation, sinon dépôt libre (comportement d'avant, carte flottante non ancrée).
    // findNodeAtPoint parcourt nodeInternals (React Flow) donc voit indifféremment les nœuds
    // produits ET les cartes annotation (les deux sont des nœuds RF) — le `type` les distingue.
    const resolveDropTarget = useCallback((position) => {
        const hitNode = findNodeAtPoint(rfStoreApi.getState().nodeInternals, position);
        if (hitNode?.type === 'annotationCard') return { kind: 'annotation', id: hitNode.id };
        if (hitNode?.type === 'reviewProduct') return { kind: 'node', id: hitNode.id };
        const hitEdge = findEdgeNearPoint(store.edges, store.nodes, position, 30);
        if (hitEdge) return { kind: 'edge', id: hitEdge.id };
        return { kind: 'empty' };
    }, [rfStoreApi, store.edges, store.nodes]);

    // Traite le dépôt d'une ou plusieurs cellules de pipeline (glissées depuis "Cellules
    // attachées") sur le canvas — logique commune au drop natif (clic gauche, action par défaut)
    // et au menu du clic droit (action explicitement choisie via forcedAction).
    //  - 'pin'  : épingle une note liée au point de dépôt (jamais destructif, cellData intact)
    //  - 'copy' : attache une VRAIE copie de la cellule à la cible (cellData de la cible enrichi,
    //             origine intacte)
    //  - 'move' : réassigne la cellule à la cible (retirée de l'origine) — action par défaut au
    //             clic gauche quand on dépose sur un AUTRE produit/liaison que l'origine
    // Libellé d'origine ("depuis GMH") pour une note épinglée depuis une cellule glissée — dérivé
    // de l'origine RÉELLE de la cellule (originTargetType/Id), pas de la sélection courante du
    // panneau (qui peut avoir changé entre le début du drag et le dépôt).
    const describeTarget = useCallback((targetType, targetId) => {
        if (targetType === 'node') return store.nodes.find(n => n.id === targetId)?.label || null;
        if (targetType === 'edge') {
            const edge = store.edges.find(e => e.id === targetId);
            const source = edge && store.nodes.find(n => n.id === edge.sourceNodeId);
            const target = edge && store.nodes.find(n => n.id === edge.targetNodeId);
            return source && target ? `${source.label} → ${target.label}` : null;
        }
        return null;
    }, [store.nodes, store.edges]);

    const processCellDrop = useCallback(async (cells, originTargetType, originTargetId, dropPosition, forcedAction = null) => {
        if (!cells || cells.length === 0) return;
        const target = resolveDropTarget(dropPosition);
        const originLabel = describeTarget(originTargetType, originTargetId);

        if (forcedAction === 'pin' || (!forcedAction && target.kind === 'empty')) {
            await Promise.all(cells.map((cell, index) => {
                const fields = summarizeCellFields(cell.pipelineType, cell.data);
                return store.addAnnotation({
                    title: `${cell.pipelineLabel} — ${cell.cellLabel}`,
                    body: fields.map(f => ({ label: f.label, value: f.value })),
                    sourceLabel: originLabel ? `depuis ${originLabel}` : null,
                    sourceReviewId: cell.sourceReviewId || null,
                    sourceReviewType: cell.sourceReviewType || null,
                    pipelineType: cell.pipelineType || null,
                    cellTimestamp: cell.timestamp || null,
                    nodeId: target.kind === 'node' ? target.id : null,
                    edgeId: target.kind === 'edge' ? target.id : null,
                    position: target.kind === 'empty'
                        ? { x: dropPosition.x + index * 30, y: dropPosition.y + index * 20 }
                        : dropPosition
                });
            }));
            return;
        }

        if (!forcedAction && target.kind === 'annotation') {
            const existing = store.annotations.find(a => a.id === target.id);
            if (existing) {
                const extraLines = cells.flatMap(c => summarizeCellFields(c.pipelineType, c.data).map(f => ({ label: f.label, value: f.value })));
                await store.updateAnnotation(existing.id, { body: [...(existing.body || []), ...extraLines] });
            }
            return;
        }

        if (target.kind !== 'node' && target.kind !== 'edge') return;

        if (forcedAction === 'copy') {
            await store.attachCellsToTargets(target.kind, [target.id], cells.map(({ id, attachedAt, ...rest }) => rest));
            return;
        }

        // forcedAction === 'move', ou clic gauche par défaut sur une cible différente de l'origine
        const sameOrigin = originTargetType === target.kind && originTargetId === target.id;
        if (sameOrigin || !originTargetType) return;
        await store.moveCellsToTarget(originTargetType, originTargetId, cells.map(c => c.id), target.kind, target.id);
    }, [resolveDropTarget, describeTarget, store]);

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

        // screenToFlowPosition (pas une simple soustraction de clientX/clientY par le bounding
        // rect) : le canvas est zoomé/pané dès qu'il ne contient pas exactement 1 nœud à l'origine
        // (fitView s'exécute au montage), donc des coordonnées écran brutes stockées telles
        // quelles comme position de nœud atterrissent hors du viewport visible dès que le zoom
        // s'écarte de 1 — le nœud/l'annotation est bien créé(e) côté serveur (il disparaît de la
        // sidebar / le panneau se comporte normalement) mais reste invisible tant qu'on ne fait
        // pas un "fit view" manuel, ce qui donnait l'impression que le glisser-déposer ne marchait
        // pas du tout.
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

        // Glissé depuis "Cellules attachées" (une ou plusieurs, sélection ctrl/shift) — déplace,
        // fusionne ou épingle selon ce qui se trouve sous le point de dépôt (cf. processCellDrop).
        if (product.kind === 'cells') {
            await processCellDrop(product.cells, product.originTargetType, product.originTargetId, position);
            setSelectedCellIds([]);
            return;
        }

        // Glissé depuis le résumé pipeline du panneau latéral (pas une cellule précise, pas
        // d'origine réassignable) — épingle toujours une carte, liée à ce qui est sous le curseur.
        if (product.kind === 'annotation') {
            const target = resolveDropTarget(position);
            if (target.kind === 'annotation') {
                const existing = store.annotations.find(a => a.id === target.id);
                if (existing) {
                    await store.updateAnnotation(existing.id, { body: [...(existing.body || []), ...(product.body || [])] });
                }
                return;
            }
            await store.addAnnotation({
                title: product.title,
                body: product.body || [],
                sourceLabel: product.sourceLabel || null,
                nodeId: target.kind === 'node' ? target.id : null,
                edgeId: target.kind === 'edge' ? target.id : null,
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
    }, [readOnly, store, resolveDropTarget, processCellDrop, screenToFlowPosition]);

    // Glisser-clic-droit une ou plusieurs cellules — l'API HTML5 Drag&Drop ne se déclenche
    // jamais pour le bouton droit (le navigateur ouvre son propre menu contextuel à la place),
    // donc ce geste est un mini-drag maison en Pointer Events, même squelette que
    // useDraggableEndpoint.js (écoute pointermove/pointerup sur window, indifférent au bouton).
    // Sur une cible réelle (produit/liaison), ouvre un menu de choix plutôt que d'agir tout de
    // suite ; sur du vide ou une carte existante, une seule action a du sens, donc pas de menu.
    const handleCellRightPointerDown = useCallback((event, cells, originTargetType, originTargetId) => {
        if (event.button !== 2) return;
        event.preventDefault();
        event.stopPropagation();

        // Empêche le menu contextuel natif du navigateur d'apparaître après ce geste — preventDefault
        // sur pointerdown seul ne suffit pas, contextmenu se déclenche séparément au relâchement.
        const suppressContextMenu = (e) => e.preventDefault();
        window.addEventListener('contextmenu', suppressContextMenu, { once: true });

        const handleUp = (upEvent) => {
            window.removeEventListener('pointerup', handleUp);
            const dropPoint = screenToFlowPosition({ x: upEvent.clientX, y: upEvent.clientY });
            const target = resolveDropTarget(dropPoint);
            if (target.kind === 'node' || target.kind === 'edge') {
                setCellDropMenu({ x: upEvent.clientX, y: upEvent.clientY, cells, originTargetType, originTargetId, dropPoint });
            } else {
                processCellDrop(cells, originTargetType, originTargetId, dropPoint);
            }
        };
        window.addEventListener('pointerup', handleUp);
    }, [screenToFlowPosition, resolveDropTarget, processCellDrop]);

    // Cf. UnifiedGeneticsCanvas.jsx (genetics) : React Flow passe en 3e argument TOUS les nœuds
    // déplacés lors d'une sélection multiple — ne persister que le nœud déclencheur du drag
    // faisait revenir les autres à leur ancienne position au resync suivant du store. Les cartes
    // épinglées (type 'annotationCard') se déplacent de la même façon mais persistent via
    // updateAnnotation plutôt que updateNode.
    const handleNodeDragStop = useCallback(async (event, node, draggedNodes) => {
        if (readOnly) return;
        const movedNodes = Array.isArray(draggedNodes) && draggedNodes.length > 0 ? draggedNodes : [node];

        // Une carte ancrée (nodeId, ou edgeId d'une liaison connectée) doit suivre du même delta
        // que le produit déplacé pour rester visuellement liée — sinon elle reste figée à sa
        // propre position pendant que la ligne de rattachement (cf. sync effect plus haut) part
        // désormais d'un endroit différent, ce qui recrée exactement le problème d'origine.
        const annotationShifts = [];
        for (const n of movedNodes) {
            if (n.type === 'annotationCard') continue;
            const before = store.nodes.find(sn => sn.id === n.id);
            if (!before) continue;
            const dx = n.position.x - (before.position?.x || 0);
            const dy = n.position.y - (before.position?.y || 0);
            if (dx === 0 && dy === 0) continue;

            const connectedEdgeIds = store.edges.filter(e => e.sourceNodeId === n.id || e.targetNodeId === n.id).map(e => e.id);
            for (const annotation of store.annotations) {
                const anchored = annotation.nodeId === n.id || (annotation.edgeId && connectedEdgeIds.includes(annotation.edgeId));
                if (!anchored) continue;
                if (annotationShifts.some(s => s.id === annotation.id)) continue; // déjà décalée par un autre nœud du même geste
                annotationShifts.push({
                    id: annotation.id,
                    position: { x: (annotation.position?.x || 0) + dx, y: (annotation.position?.y || 0) + dy }
                });
            }
        }

        await Promise.all([
            ...movedNodes.map(n => n.type === 'annotationCard'
                ? store.updateAnnotation(n.id, { position: n.position })
                : store.updateNode(n.id, { position: n.position })),
            ...annotationShifts.map(s => store.updateAnnotation(s.id, { position: s.position }))
        ]);

        setNodes(nodes => nodes.map(n => {
            const moved = movedNodes.find(m => m.id === n.id);
            if (moved) return { ...n, position: moved.position };
            const shifted = annotationShifts.find(s => s.id === n.id);
            return shifted ? { ...n, position: shifted.position } : n;
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
        event.stopPropagation();
        if (node.type === 'annotationCard') {
            setContextMenuType('annotation');
            setContextMenu({ x: event.clientX, y: event.clientY, annotationId: node.id });
            return;
        }
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

    // Sélection multiple (ctrl+clic / shift+clic) des cellules attachées du panneau — remise à
    // zéro dès qu'on change de nœud/liaison sélectionné(e), pour ne pas garder une sélection qui
    // pointe vers les cellules d'un autre panneau.
    useEffect(() => {
        setSelectedCellIds([]);
        cellSelectionAnchorRef.current = null;
    }, [panelTargetId]);

    const handleCellClick = useCallback((event, cell) => {
        const cellIds = panelAttachedCells.map(c => c.id);
        const clickedIdx = cellIds.indexOf(cell.id);
        if (clickedIdx === -1) return;
        const isCtrl = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;

        if (isShift && cellSelectionAnchorRef.current !== null) {
            event.preventDefault();
            const anchorIdx = cellSelectionAnchorRef.current;
            const [start, end] = anchorIdx < clickedIdx ? [anchorIdx, clickedIdx] : [clickedIdx, anchorIdx];
            const rangeIds = cellIds.slice(start, end + 1);
            setSelectedCellIds(prev => isCtrl ? [...new Set([...prev, ...rangeIds])] : rangeIds);
            return;
        }

        if (isCtrl) {
            setSelectedCellIds(prev => prev.includes(cell.id) ? prev.filter(id => id !== cell.id) : [...prev, cell.id]);
            cellSelectionAnchorRef.current = clickedIdx;
            return;
        }

        setSelectedCellIds([]);
        store.openCellEditor(panelTargetType, panelTargetId, cell);
    }, [panelAttachedCells, panelTargetType, panelTargetId, store]);

    // Cellule(s) réellement transportées par un glisser depuis le panneau : la sélection multiple
    // si la cellule glissée en fait partie et qu'elle contient plus d'un élément, sinon elle seule.
    const getCellsForDrag = useCallback((cell) => {
        if (selectedCellIds.length > 1 && selectedCellIds.includes(cell.id)) {
            return panelAttachedCells.filter(c => selectedCellIds.includes(c.id));
        }
        return [cell];
    }, [selectedCellIds, panelAttachedCells]);

    const handleCellDragStart = useCallback((event, cell) => {
        const payload = { kind: 'cells', cells: getCellsForDrag(cell), originTargetType: panelTargetType, originTargetId: panelTargetId };
        event.dataTransfer.setData('application/json', JSON.stringify(payload));
        event.dataTransfer.effectAllowed = 'copyMove';
    }, [getCellsForDrag, panelTargetType, panelTargetId]);

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
                                <p className="info-section-label">
                                    Cellules attachées{selectedCellIds.length > 1 ? ` — ${selectedCellIds.length} sélectionnées` : ''}
                                </p>
                                <p className="info-section-hint">
                                    Ctrl/Maj+clic pour sélectionner plusieurs cellules — glissez (clic gauche = déplacer,
                                    clic droit = choisir) sur le canvas pour les épingler ou les déplacer vers une autre bulle
                                </p>
                                {panelAttachedCells.map(cell => {
                                    const fields = summarizeCellFields(cell.pipelineType, cell.data);
                                    const isSelected = selectedCellIds.includes(cell.id);
                                    return (
                                        <button
                                            key={cell.id}
                                            type="button"
                                            className={`info-cell-row${isSelected ? ' selected' : ''}`}
                                            draggable
                                            onDragStart={(e) => handleCellDragStart(e, cell)}
                                            onPointerDown={(e) => { if (e.button === 2) handleCellRightPointerDown(e, getCellsForDrag(cell), panelTargetType, panelTargetId); }}
                                            onContextMenu={(e) => e.preventDefault()}
                                            onClick={(e) => handleCellClick(e, cell)}
                                            title="Cliquer pour éditer (Ctrl/Maj pour sélectionner) — glisser sur le canvas"
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
                {contextMenu && contextMenuType === 'annotation' && !readOnly && (
                    <ChainAnnotationContextMenu
                        annotationId={contextMenu.annotationId}
                        x={contextMenu.x}
                        y={contextMenu.y}
                        onClose={closeContextMenu}
                    />
                )}
            </>}
            modals={<>
                {cellDropMenu && (
                    <CellDropMenu
                        x={cellDropMenu.x}
                        y={cellDropMenu.y}
                        count={cellDropMenu.cells.length}
                        onClose={() => setCellDropMenu(null)}
                        onMove={async () => {
                            await processCellDrop(cellDropMenu.cells, cellDropMenu.originTargetType, cellDropMenu.originTargetId, cellDropMenu.dropPoint, 'move');
                            setSelectedCellIds([]);
                            setCellDropMenu(null);
                        }}
                        onCopy={async () => {
                            await processCellDrop(cellDropMenu.cells, cellDropMenu.originTargetType, cellDropMenu.originTargetId, cellDropMenu.dropPoint, 'copy');
                            setCellDropMenu(null);
                        }}
                        onPin={async () => {
                            await processCellDrop(cellDropMenu.cells, cellDropMenu.originTargetType, cellDropMenu.originTargetId, cellDropMenu.dropPoint, 'pin');
                            setCellDropMenu(null);
                        }}
                    />
                )}
                {store.showEdgeForm && (
                    <ChainEdgeFormModal onClose={store.closeEdgeForm} />
                )}
                {showRenameModal && store.selectedChain && (
                    <ChainFormModal chain={store.selectedChain} onClose={() => setShowRenameModal(false)} />
                )}
                {store.cellPicker && <ChainCellPickerModal />}
                {store.mediaPicker && <ChainMediaPickerModal />}
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
