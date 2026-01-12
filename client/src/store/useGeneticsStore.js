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

                    // Parser les JSON fields
                    const parsedNodes = tree.nodes.map(n => ({
                        ...n,
                        position: typeof n.position === 'string' ? JSON.parse(n.position) : n.position,
                        genetics: typeof n.genetics === 'string' ? JSON.parse(n.genetics) : n.genetics
                    }));

                    set({
                        selectedTreeId: treeId,
                        nodes: parsedNodes,
                        edges: tree.edges || [],
                        canvasLoading: false,
                        mode: 'edit'
                    });

                    return { data: tree };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to load tree';
                    set({ treeError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            // ============================================================================
            // TREES - Create/Update/Delete
            // ============================================================================
            createTree: async (treeData) => {
                set({ treeLoading: true, treeError: null });
                try {
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
                set({ canvasLoading: true, treeError: null });
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

            updateNodeFormData: (updates) => {
                set(state => ({
                    nodeFormData: state.nodeFormData ? { ...state.nodeFormData, ...updates } : null
                }));
            },

            openEdgeForm: (parentNodeId = null, childNodeId = null) => {
                set({
                    showEdgeForm: true,
                    edgeFormData: {
                        parentNodeId: parentNodeId || '',
                        childNodeId: childNodeId || '',
                        relationshipType: 'parent',
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
                    edges: []
                });
            },

            resetStore: () => {
                set({
                    trees: [],
                    selectedTreeId: null,
                    nodes: [],
                    edges: [],
                    selectedNodeId: null,
                    selectedEdgeId: null,
                    mode: 'view',
                    showNodeForm: false,
                    showEdgeForm: false,
                    showTreeForm: false,
                    nodeFormData: null,
                    edgeFormData: null,
                    treeFormData: null,
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
