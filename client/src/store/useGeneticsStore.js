/**
 * Zustand Store pour la gestion des arbres généalogiques (Genetics)
 * 
 * Remplace usePhenoHuntStore avec intégration backend complète
 * Gère: arbres, nœuds, arêtes, sélection, modification, état UI
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Configuration API
const API_BASE = '/api/genetics';

const useGeneticsStore = create(
    devtools(
        (set, get) => ({
            // ============================================================================
            // STATE - TREES
            // ============================================================================
            trees: [],
            selectedTreeId: null,
            treeLoading: false,
            treeError: null,

            // ============================================================================
            // STATE - NODES & EDGES
            // ============================================================================
            nodes: [], // Nœuds de l'arbre sélectionné
            edges: [], // Arêtes de l'arbre sélectionné
            annotations: [], // Cartes épinglées librement sur le canvas (note texte ou bulle média)
            selectedNodeId: null,
            selectedEdgeId: null,

            // ============================================================================
            // STATE - UI
            // ============================================================================
            mode: 'view', // 'view' | 'edit' | 'create'
            showNodeForm: false,
            showEdgeForm: false,
            showTreeForm: false,
            nodeFormData: null,
            edgeFormData: null,
            treeFormData: null,
            // Nœud pour lequel le picker "Lier à une review existante" est ouvert (null = fermé)
            linkReviewPickerNodeId: null,
            // mediaModalTarget : { targetType: 'node'|'edge', targetId: string } | null
            mediaModalTarget: null,

            // ============================================================================
            // STATE - CANVAS
            // ============================================================================
            canvasZoom: 1,
            canvasPosition: { x: 0, y: 0 },
            canvasLoading: false,

            // ============================================================================
            // TREES - Fetch
            // ============================================================================
            fetchTrees: async () => {
                set({ treeLoading: true, treeError: null });
                try {
                    const response = await fetch(`${API_BASE}/trees`, {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch trees: ${response.status}`);
                    }

                    const trees = await response.json();
                    set({ trees, treeLoading: false });
                    return { data: trees };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to fetch genetic trees';
                    set({ treeError: errorMsg, treeLoading: false });
                    console.error('Fetch trees error:', error);
                    return { error: errorMsg };
                }
            },

            /**
             * Charge un arbre spécifique avec tous ses nœuds et arêtes
             */
            loadTree: async (treeId) => {
                set({ canvasLoading: true, treeError: null });
                try {
                    const response = await fetch(`${API_BASE}/trees/${treeId}`, {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to load tree: ${response.status}`);
                    }

                    const tree = await response.json();

                    const parseMedia = (raw) => {
                        if (Array.isArray(raw)) return raw;
                        if (typeof raw !== 'string') return [];
                        try { return JSON.parse(raw) } catch { return [] }
                    };

                    // Parser les JSON fields
                    const parsedNodes = tree.nodes.map(n => ({
                        ...n,
                        position: typeof n.position === 'string' ? JSON.parse(n.position) : n.position,
                        genetics: typeof n.genetics === 'string' ? JSON.parse(n.genetics) : n.genetics,
                        media: parseMedia(n.media)
                    }));

                    const parsedEdges = (tree.edges || []).map(e => ({
                        ...e,
                        media: parseMedia(e.media)
                    }));

                    const parsedAnnotations = (tree.annotations || []).map(a => ({
                        ...a,
                        position: typeof a.position === 'string' ? JSON.parse(a.position) : a.position,
                        body: typeof a.body === 'string' ? (JSON.parse(a.body || '[]')) : (a.body || [])
                    }));

                    set({
                        selectedTreeId: treeId,
                        nodes: parsedNodes,
                        edges: parsedEdges,
                        annotations: parsedAnnotations,
                        canvasLoading: false,
                        mode: 'edit'
                    });

                    return { data: tree };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to load tree';
                    set({ treeError: errorMsg, canvasLoading: false });
                    console.error('Load tree error:', error);
                    return { error: errorMsg };
                }
            },

            // ============================================================================
            // TREES - Create/Update/Delete
            // ============================================================================
            createTree: async (treeData) => {
                set({ treeLoading: true, treeError: null });
                try {
                    // DEBUG: Log du body envoyé à l'API
                    console.log('[Genetics] createTree - body envoyé:', treeData);
                    const response = await fetch(`${API_BASE}/trees`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(treeData)
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to create tree');
                    }

                    const newTree = await response.json();

                    set(state => ({
                        trees: [newTree, ...state.trees],
                        treeLoading: false,
                        showTreeForm: false,
                        treeFormData: null
                    }));

                    return { data: newTree };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to create tree';
                    set({ treeError: errorMsg, treeLoading: false });
                    return { error: errorMsg };
                }
            },

            updateTree: async (treeId, updateData) => {
                set({ treeLoading: true, treeError: null });
                try {
                    const response = await fetch(`${API_BASE}/trees/${treeId}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to update tree');
                    }

                    const updated = await response.json();

                    set(state => ({
                        trees: state.trees.map(t => t.id === treeId ? updated : t),
                        treeLoading: false
                    }));

                    return { data: updated };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to update tree';
                    set({ treeError: errorMsg, treeLoading: false });
                    return { error: errorMsg };
                }
            },

            deleteTree: async (treeId) => {
                set({ treeLoading: true, treeError: null });
                try {
                    const response = await fetch(`${API_BASE}/trees/${treeId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to delete tree: ${response.status}`);
                    }

                    set(state => ({
                        trees: state.trees.filter(t => t.id !== treeId),
                        selectedTreeId: state.selectedTreeId === treeId ? null : state.selectedTreeId,
                        nodes: state.selectedTreeId === treeId ? [] : state.nodes,
                        edges: state.selectedTreeId === treeId ? [] : state.edges,
                        annotations: state.selectedTreeId === treeId ? [] : state.annotations,
                        treeLoading: false
                    }));

                    return { success: true };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to delete tree';
                    set({ treeError: errorMsg, treeLoading: false });
                    return { error: errorMsg };
                }
            },

            // ============================================================================
            // NODES - Create/Update/Delete
            // ============================================================================
            addNode: async (nodeData) => {
                const state = get();
                if (!state.selectedTreeId) {
                    return { error: 'No tree selected' };
                }

                set({ canvasLoading: true, treeError: null });
                try {
                    const response = await fetch(`${API_BASE}/trees/${state.selectedTreeId}/nodes`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...nodeData,
                            position: nodeData.position || { x: 0, y: 0 }
                        })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to add node');
                    }

                    const newNode = await response.json();

                    set(state => ({
                        nodes: [...state.nodes, newNode],
                        canvasLoading: false,
                        showNodeForm: false,
                        nodeFormData: null
                    }));

                    return { data: newNode };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to add node';
                    set({ treeError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            updateNode: async (nodeId, updateData) => {
                // Mise à jour optimiste immédiate (avant l'appel réseau) — sans ça, si le composant
                // canvas se re-synchronise pour une tout autre raison (ex: sélection qui change)
                // pendant que la requête PUT est encore en vol, il reconstruit les nœuds React Flow
                // à partir de l'ancienne position encore en store, ce qui fait visuellement "sauter"
                // le nœud en arrière avant qu'il ne se replace une fois la réponse serveur arrivée.
                set(state => ({
                    nodes: state.nodes.map(n => n.id === nodeId ? { ...n, ...updateData } : n),
                    canvasLoading: true,
                    treeError: null
                }));
                try {
                    const response = await fetch(`${API_BASE}/nodes/${nodeId}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to update node');
                    }

                    const updated = await response.json();

                    set(state => ({
                        nodes: state.nodes.map(n => n.id === nodeId ? updated : n),
                        canvasLoading: false
                    }));

                    return { data: updated };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to update node';
                    set({ treeError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            deleteNode: async (nodeId) => {
                set({ canvasLoading: true, treeError: null });
                try {
                    const response = await fetch(`${API_BASE}/nodes/${nodeId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to delete node: ${response.status}`);
                    }

                    set(state => ({
                        nodes: state.nodes.filter(n => n.id !== nodeId),
                        edges: state.edges.filter(e => e.parentNodeId !== nodeId && e.childNodeId !== nodeId),
                        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
                        canvasLoading: false
                    }));

                    return { success: true };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to delete node';
                    set({ treeError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            // ============================================================================
            // EDGES - Create/Delete
            // ============================================================================
            addEdge: async (edgeData) => {
                const state = get();
                if (!state.selectedTreeId) {
                    return { error: 'No tree selected' };
                }

                set({ canvasLoading: true, treeError: null });
                try {
                    const response = await fetch(`${API_BASE}/trees/${state.selectedTreeId}/edges`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...edgeData,
                            relationshipType: edgeData.relationshipType || 'parent'
                        })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to create edge');
                    }

                    const newEdge = await response.json();

                    set(state => ({
                        edges: [...state.edges, newEdge],
                        canvasLoading: false,
                        showEdgeForm: false,
                        edgeFormData: null
                    }));

                    return { data: newEdge };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to create edge';
                    set({ treeError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            updateEdge: async (edgeId, updateData) => {
                set({ canvasLoading: true, treeError: null });
                try {
                    const response = await fetch(`${API_BASE}/edges/${edgeId}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to update edge');
                    }

                    const updated = await response.json();

                    set(state => ({
                        edges: state.edges.map(e => e.id === edgeId ? updated : e),
                        canvasLoading: false,
                        showEdgeForm: false,
                        edgeFormData: null
                    }));

                    return { data: updated };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to update edge';
                    set({ treeError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            deleteEdge: async (edgeId) => {
                set({ canvasLoading: true, treeError: null });
                try {
                    const response = await fetch(`${API_BASE}/edges/${edgeId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to delete edge: ${response.status}`);
                    }

                    set(state => ({
                        edges: state.edges.filter(e => e.id !== edgeId),
                        selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
                        canvasLoading: false
                    }));

                    return { success: true };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to delete edge';
                    set({ treeError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            // ============================================================================
            // ANNOTATIONS - Cartes épinglées librement sur le canvas (note texte ou bulle média)
            // Miroir de useProductionChainStore.js addAnnotation/updateAnnotation/deleteAnnotation.
            // ============================================================================
            addAnnotation: async (annotationData) => {
                const state = get();
                if (!state.selectedTreeId) {
                    return { error: 'No tree selected' };
                }

                set({ canvasLoading: true, treeError: null });
                try {
                    const response = await fetch(`${API_BASE}/trees/${state.selectedTreeId}/annotations`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...annotationData,
                            position: annotationData.position || { x: 0, y: 0 }
                        })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || `Failed to add annotation: ${response.status}`);
                    }

                    const newAnnotation = await response.json();
                    set(state => ({
                        annotations: [...state.annotations, newAnnotation],
                        canvasLoading: false
                    }));

                    return { data: newAnnotation };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to add annotation';
                    set({ treeError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            updateAnnotation: async (annotationId, updateData) => {
                set({ canvasLoading: true, treeError: null });
                try {
                    const response = await fetch(`${API_BASE}/annotations/${annotationId}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || `Failed to update annotation: ${response.status}`);
                    }

                    const updated = await response.json();
                    set(state => ({
                        annotations: state.annotations.map(a => a.id === annotationId ? updated : a),
                        canvasLoading: false
                    }));

                    return { data: updated };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to update annotation';
                    set({ treeError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            deleteAnnotation: async (annotationId) => {
                try {
                    const response = await fetch(`${API_BASE}/annotations/${annotationId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to delete annotation: ${response.status}`);
                    }

                    set(state => ({
                        annotations: state.annotations.filter(a => a.id !== annotationId)
                    }));

                    return { success: true };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to delete annotation';
                    set({ treeError: errorMsg });
                    return { error: errorMsg };
                }
            },

            // ============================================================================
            // UI - Selection & Forms
            // ============================================================================
            selectNode: (nodeId) => {
                set({ selectedNodeId: nodeId });
            },

            selectEdge: (edgeId) => {
                set({ selectedEdgeId: edgeId });
            },

            openNodeForm: (nodeData = null) => {
                set({
                    showNodeForm: true,
                    nodeFormData: nodeData || {
                        cultivarName: '',
                        position: { x: 0, y: 0 },
                        color: '#FF6B9D',
                        genetics: null,
                        notes: ''
                    }
                });
            },

            closeNodeForm: () => {
                set({ showNodeForm: false, nodeFormData: null });
            },

            openLinkReviewPicker: (nodeId) => set({ linkReviewPickerNodeId: nodeId }),
            closeLinkReviewPicker: () => set({ linkReviewPickerNodeId: null }),

            openMediaModal: (targetType, targetId) => set({ mediaModalTarget: { targetType, targetId } }),
            closeMediaModal: () => set({ mediaModalTarget: null }),

            // Persiste le tableau media complet (photos/vidéos) d'un nœud/liaison de l'arbre.
            updateMedia: async (targetType, targetId, nextMedia) => {
                const state = get();
                const updateFn = targetType === 'node' ? state.updateNode : state.updateEdge;
                return updateFn(targetId, { media: nextMedia });
            },

            updateNodeFormData: (updates) => {
                set(state => ({
                    nodeFormData: { ...(state.nodeFormData || {}), ...updates }
                }));
            },

            /**
             * Ouvre le formulaire d'arête.
             * - openEdgeForm() : création vide
             * - openEdgeForm(parentNodeId, childNodeId) : création pré-remplie (ex: connexion drag&drop)
             * - openEdgeForm(edgeObject) : édition d'une arête existante (doit contenir `id`)
             */
            openEdgeForm: (parentNodeIdOrEdge = null, childNodeId = null) => {
                if (parentNodeIdOrEdge && typeof parentNodeIdOrEdge === 'object') {
                    const edge = parentNodeIdOrEdge;
                    set({
                        showEdgeForm: true,
                        edgeFormData: {
                            id: edge.id,
                            parentNodeId: edge.parentNodeId || '',
                            childNodeId: edge.childNodeId || '',
                            relationshipType: edge.relationshipType || 'parent',
                            pollinationMethod: edge.pollinationMethod || '',
                            notes: edge.notes || ''
                        }
                    });
                    return;
                }

                set({
                    showEdgeForm: true,
                    edgeFormData: {
                        parentNodeId: parentNodeIdOrEdge || '',
                        childNodeId: childNodeId || '',
                        relationshipType: 'parent',
                        pollinationMethod: '',
                        notes: ''
                    }
                });
            },

            closeEdgeForm: () => {
                set({ showEdgeForm: false, edgeFormData: null });
            },

            updateEdgeFormData: (updates) => {
                set(state => ({
                    edgeFormData: state.edgeFormData ? { ...state.edgeFormData, ...updates } : null
                }));
            },

            openTreeForm: (treeData = null) => {
                set({
                    showTreeForm: true,
                    treeFormData: treeData || {
                        name: '',
                        description: '',
                        projectType: 'phenohunt',
                        isPublic: false
                    }
                });
            },

            closeTreeForm: () => {
                set({ showTreeForm: false, treeFormData: null });
            },

            updateTreeFormData: (updates) => {
                set(state => ({
                    treeFormData: state.treeFormData ? { ...state.treeFormData, ...updates } : null
                }));
            },

            // ============================================================================
            // CANVAS - Zoom & Navigation
            // ============================================================================
            setCanvasZoom: (zoom) => {
                set({ canvasZoom: Math.max(0.1, Math.min(zoom, 3)) });
            },

            setCanvasPosition: (position) => {
                set({ canvasPosition: position });
            },

            resetCanvas: () => {
                set({ canvasZoom: 1, canvasPosition: { x: 0, y: 0 } });
            },

            // ============================================================================
            // MODE & STATE MANAGEMENT
            // ============================================================================
            setMode: (mode) => {
                set({ mode });
            },

            clearSelection: () => {
                set({
                    selectedNodeId: null,
                    selectedEdgeId: null,
                    selectedTreeId: null,
                    nodes: [],
                    edges: [],
                    annotations: [],
                    linkReviewPickerNodeId: null,
                    mediaModalTarget: null
                });
            },

            resetStore: () => {
                set({
                    trees: [],
                    selectedTreeId: null,
                    nodes: [],
                    edges: [],
                    annotations: [],
                    selectedNodeId: null,
                    selectedEdgeId: null,
                    mode: 'view',
                    showNodeForm: false,
                    showEdgeForm: false,
                    showTreeForm: false,
                    nodeFormData: null,
                    edgeFormData: null,
                    treeFormData: null,
                    linkReviewPickerNodeId: null,
                    mediaModalTarget: null,
                    canvasZoom: 1,
                    canvasPosition: { x: 0, y: 0 },
                    treeLoading: false,
                    canvasLoading: false,
                    treeError: null
                });
            }
        }),
        { name: 'GeneticsStore' }
    )
);

export default useGeneticsStore;
