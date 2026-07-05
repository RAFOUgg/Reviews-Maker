/**
 * Zustand Store pour la gestion des chaînes de production (Production Chain)
 *
 * Graphe liant plusieurs fiches techniques (reviews Fleur/Hash/Concentré/Comestible)
 * avec les données de transformation (technique/date/notes) sur les liaisons.
 * Structure miroir de useGeneticsStore.js, adaptée aux nœuds "review" plutôt que "cultivar".
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const API_BASE = '/api/production-chains';

const useProductionChainStore = create(
    devtools(
        (set, get) => ({
            // STATE - CHAINS
            chains: [],
            selectedChainId: null,
            selectedChain: null,
            chainLoading: false,
            chainError: null,

            // STATE - NODES & EDGES
            nodes: [],
            edges: [],
            selectedNodeId: null,
            selectedEdgeId: null,

            // STATE - UI
            showEdgeForm: false,
            edgeFormData: null,

            // STATE - CANVAS
            canvasLoading: false,

            // ============================================================================
            // CHAINS - Fetch
            // ============================================================================
            fetchChains: async () => {
                set({ chainLoading: true, chainError: null });
                try {
                    const response = await fetch(`${API_BASE}/chains`, {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch chains: ${response.status}`);
                    }

                    const chains = await response.json();
                    set({ chains, chainLoading: false });
                    return { data: chains };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to fetch production chains';
                    set({ chainError: errorMsg, chainLoading: false });
                    return { error: errorMsg };
                }
            },

            // Chaînes contenant déjà un ChainNode pour cette review précise (reviewType+reviewId) —
            // pas de FK sur la review elle-même, donc c'est le seul moyen de savoir si elle est
            // déjà liée. Une review peut appartenir à plusieurs chaînes (pas de contrainte d'unicité
            // inter-chaînes), d'où le tableau plutôt qu'un id unique.
            fetchChainsForReview: async (reviewType, reviewId) => {
                try {
                    const response = await fetch(`${API_BASE}/for-review/${reviewType}/${reviewId}`, {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch chains for review: ${response.status}`);
                    }

                    const chains = await response.json();
                    return { data: chains };
                } catch (error) {
                    return { error: error.message || 'Failed to fetch chains for review' };
                }
            },

            loadChain: async (chainId) => {
                set({ canvasLoading: true, chainError: null });
                try {
                    const response = await fetch(`${API_BASE}/chains/${chainId}`, {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to load chain: ${response.status}`);
                    }

                    const chain = await response.json();

                    const parsedNodes = chain.nodes.map(n => ({
                        ...n,
                        position: typeof n.position === 'string' ? JSON.parse(n.position) : n.position
                    }));

                    set({
                        selectedChainId: chainId,
                        selectedChain: { id: chain.id, name: chain.name, description: chain.description, isPublic: chain.isPublic },
                        nodes: parsedNodes,
                        edges: chain.edges || [],
                        canvasLoading: false
                    });

                    return { data: chain };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to load chain';
                    set({ chainError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            // ============================================================================
            // CHAINS - Create/Update/Delete
            // ============================================================================
            createChain: async (chainData) => {
                set({ chainLoading: true, chainError: null });
                try {
                    const response = await fetch(`${API_BASE}/chains`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(chainData)
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to create chain');
                    }

                    const newChain = await response.json();

                    set(state => ({
                        chains: [newChain, ...state.chains],
                        chainLoading: false
                    }));

                    return { data: newChain };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to create chain';
                    set({ chainError: errorMsg, chainLoading: false });
                    return { error: errorMsg };
                }
            },

            updateChain: async (chainId, updateData) => {
                try {
                    const response = await fetch(`${API_BASE}/chains/${chainId}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to update chain');
                    }

                    const updated = await response.json();

                    set(state => ({
                        chains: state.chains.map(c => c.id === chainId ? updated : c),
                        selectedChain: state.selectedChainId === chainId
                            ? { id: updated.id, name: updated.name, description: updated.description, isPublic: updated.isPublic }
                            : state.selectedChain
                    }));

                    return { data: updated };
                } catch (error) {
                    return { error: error.message || 'Failed to update chain' };
                }
            },

            deleteChain: async (chainId) => {
                set({ chainLoading: true, chainError: null });
                try {
                    const response = await fetch(`${API_BASE}/chains/${chainId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to delete chain: ${response.status}`);
                    }

                    set(state => ({
                        chains: state.chains.filter(c => c.id !== chainId),
                        selectedChainId: state.selectedChainId === chainId ? null : state.selectedChainId,
                        nodes: state.selectedChainId === chainId ? [] : state.nodes,
                        edges: state.selectedChainId === chainId ? [] : state.edges,
                        chainLoading: false
                    }));

                    return { success: true };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to delete chain';
                    set({ chainError: errorMsg, chainLoading: false });
                    return { error: errorMsg };
                }
            },

            // ============================================================================
            // NODES - Create/Update/Delete
            // ============================================================================
            addNode: async (nodeData) => {
                const state = get();
                if (!state.selectedChainId) {
                    return { error: 'No chain selected' };
                }

                set({ canvasLoading: true, chainError: null });
                try {
                    const response = await fetch(`${API_BASE}/chains/${state.selectedChainId}/nodes`, {
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
                        canvasLoading: false
                    }));

                    return { data: newNode };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to add node';
                    set({ chainError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            updateNode: async (nodeId, updateData) => {
                set({ canvasLoading: true, chainError: null });
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
                    set({ chainError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            deleteNode: async (nodeId) => {
                set({ canvasLoading: true, chainError: null });
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
                        edges: state.edges.filter(e => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId),
                        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
                        canvasLoading: false
                    }));

                    return { success: true };
                } catch (error) {
                    const errorMsg = error.message || 'Failed to delete node';
                    set({ chainError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            // ============================================================================
            // EDGES - Create/Update/Delete
            // ============================================================================
            addEdge: async (edgeData) => {
                const state = get();
                if (!state.selectedChainId) {
                    return { error: 'No chain selected' };
                }

                set({ canvasLoading: true, chainError: null });
                try {
                    const response = await fetch(`${API_BASE}/chains/${state.selectedChainId}/edges`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(edgeData)
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
                    set({ chainError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            updateEdge: async (edgeId, updateData) => {
                set({ canvasLoading: true, chainError: null });
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
                    set({ chainError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            deleteEdge: async (edgeId) => {
                set({ canvasLoading: true, chainError: null });
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
                    set({ chainError: errorMsg, canvasLoading: false });
                    return { error: errorMsg };
                }
            },

            // ============================================================================
            // UI - Selection & Forms
            // ============================================================================
            selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
            selectEdge: (edgeId) => set({ selectedEdgeId: edgeId }),

            /**
             * - openEdgeForm(sourceNodeId, targetNodeId) : création pré-remplie (connexion drag&drop)
             * - openEdgeForm(edgeObject) : édition d'une arête existante (doit contenir `id`)
             */
            openEdgeForm: (sourceNodeIdOrEdge = null, targetNodeId = null) => {
                if (sourceNodeIdOrEdge && typeof sourceNodeIdOrEdge === 'object') {
                    const edge = sourceNodeIdOrEdge;
                    set({
                        showEdgeForm: true,
                        edgeFormData: {
                            id: edge.id,
                            sourceNodeId: edge.sourceNodeId || '',
                            targetNodeId: edge.targetNodeId || '',
                            technique: edge.technique || '',
                            date: edge.date ? edge.date.substring(0, 10) : '',
                            notes: edge.notes || ''
                        }
                    });
                    return;
                }

                set({
                    showEdgeForm: true,
                    edgeFormData: {
                        sourceNodeId: sourceNodeIdOrEdge || '',
                        targetNodeId: targetNodeId || '',
                        technique: '',
                        date: '',
                        notes: ''
                    }
                });
            },

            closeEdgeForm: () => set({ showEdgeForm: false, edgeFormData: null }),

            updateEdgeFormData: (updates) => {
                set(state => ({
                    edgeFormData: state.edgeFormData ? { ...state.edgeFormData, ...updates } : null
                }));
            },

            // ============================================================================
            // MODE & STATE MANAGEMENT
            // ============================================================================
            clearSelection: () => {
                set({
                    selectedNodeId: null,
                    selectedEdgeId: null,
                    selectedChainId: null,
                    selectedChain: null,
                    nodes: [],
                    edges: []
                });
            },

            resetStore: () => {
                set({
                    chains: [],
                    selectedChainId: null,
                    selectedChain: null,
                    nodes: [],
                    edges: [],
                    selectedNodeId: null,
                    selectedEdgeId: null,
                    showEdgeForm: false,
                    edgeFormData: null,
                    chainLoading: false,
                    canvasLoading: false,
                    chainError: null
                });
            }
        }),
        { name: 'ProductionChainStore' }
    )
);

export default useProductionChainStore;
