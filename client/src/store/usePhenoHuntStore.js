import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Store Zustand pour PhénoHunt
 * Gère: Arbres généalogiques, nodes, edges, cultivars
 */
export const usePhenoHuntStore = create(
    devtools(
        persist(
            (set, get) => ({
                // État
                phenoTrees: {}, // { [treeId]: { nodes, edges, metadata } }
                activeTreeId: null,
                selectedNodeId: null,
                isLoading: false,
                error: null,
                cultivarLibrary: [], // Bibliotheque de cultivars disponibles

                // Getters
                getActiveTree: () => {
                    const { phenoTrees, activeTreeId } = get();
                    return phenoTrees[activeTreeId] || null;
                },
                getNodes: () => get().getActiveTree()?.nodes || [],
                getEdges: () => get().getActiveTree()?.edges || [],
                getCultivarById: (cultivarId) => {
                    const { cultivarLibrary } = get();
                    return cultivarLibrary.find(c => c.id === cultivarId);
                },

                // Tree Management
                createTree: (treeData) => {
                    const treeId = crypto.randomUUID();
                    set(state => ({
                        phenoTrees: {
                            ...state.phenoTrees,
                            [treeId]: {
                                id: treeId,
                                nodes: [],
                                edges: [],
                                metadata: {
                                    name: treeData.name || 'Unnamed Tree',
                                    description: treeData.description || '',
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                }
                            }
                        },
                        activeTreeId: treeId
                    }));
                    return treeId;
                },

                deleteTree: (treeId) => {
                    set(state => {
                        const newTrees = { ...state.phenoTrees };
                        delete newTrees[treeId];
                        return {
                            phenoTrees: newTrees,
                            activeTreeId: state.activeTreeId === treeId ? null : state.activeTreeId
                        };
                    });
                },

                setActiveTree: (treeId) => {
                    set({ activeTreeId: treeId });
                },

                // Node Management
                addNode: (nodeData) => {
                    const nodeId = crypto.randomUUID();
                    const newNode = {
                        id: nodeId,
                        type: 'phenoNode',
                        position: nodeData.position || { x: 0, y: 0 },
                        data: {
                            cultivarId: nodeData.cultivarId,
                            cultivarName: nodeData.cultivarName,
                            phenoCode: nodeData.phenoCode || `PHENO-${Date.now()}`,
                            genetics: nodeData.genetics || {},
                            metadata: {
                                createdAt: new Date().toISOString(),
                                notes: nodeData.notes || ''
                            }
                        },
                        draggable: true,
                        selectable: true
                    };

                    set(state => {
                        if (!state.activeTreeId) return state;
                        const tree = state.phenoTrees[state.activeTreeId];
                        return {
                            phenoTrees: {
                                ...state.phenoTrees,
                                [state.activeTreeId]: {
                                    ...tree,
                                    nodes: [...tree.nodes, newNode],
                                    metadata: {
                                        ...tree.metadata,
                                        updatedAt: new Date().toISOString()
                                    }
                                }
                            }
                        };
                    });

                    return nodeId;
                },

                updateNode: (nodeId, updates) => {
                    set(state => {
                        if (!state.activeTreeId) return state;
                        const tree = state.phenoTrees[state.activeTreeId];
                        return {
                            phenoTrees: {
                                ...state.phenoTrees,
                                [state.activeTreeId]: {
                                    ...tree,
                                    nodes: tree.nodes.map(node =>
                                        node.id === nodeId ? { ...node, ...updates } : node
                                    ),
                                    metadata: {
                                        ...tree.metadata,
                                        updatedAt: new Date().toISOString()
                                    }
                                }
                            }
                        };
                    });
                },

                deleteNode: (nodeId) => {
                    set(state => {
                        if (!state.activeTreeId) return state;
                        const tree = state.phenoTrees[state.activeTreeId];
                        // Supprimer les edges connectés
                        const newEdges = tree.edges.filter(
                            e => e.source !== nodeId && e.target !== nodeId
                        );
                        return {
                            phenoTrees: {
                                ...state.phenoTrees,
                                [state.activeTreeId]: {
                                    ...tree,
                                    nodes: tree.nodes.filter(n => n.id !== nodeId),
                                    edges: newEdges,
                                    metadata: {
                                        ...tree.metadata,
                                        updatedAt: new Date().toISOString()
                                    }
                                }
                            },
                            selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId
                        };
                    });
                },

                selectNode: (nodeId) => {
                    set({ selectedNodeId: nodeId });
                },

                duplicateNode: (nodeId) => {
                    const state = get();
                    const tree = state.getActiveTree();
                    const nodeToDuplicate = tree.nodes.find(n => n.id === nodeId);
                    
                    if (!nodeToDuplicate) return null;

                    const newPhenoCode = `${nodeToDuplicate.data.phenoCode}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
                    const newNode = {
                        ...nodeToDuplicate,
                        id: crypto.randomUUID(),
                        position: {
                            x: nodeToDuplicate.position.x + 50,
                            y: nodeToDuplicate.position.y + 50
                        },
                        data: {
                            ...nodeToDuplicate.data,
                            phenoCode: newPhenoCode,
                            metadata: {
                                ...nodeToDuplicate.data.metadata,
                                createdAt: new Date().toISOString()
                            }
                        }
                    };

                    set(state => ({
                        phenoTrees: {
                            ...state.phenoTrees,
                            [state.activeTreeId]: {
                                ...tree,
                                nodes: [...tree.nodes, newNode],
                                metadata: {
                                    ...tree.metadata,
                                    updatedAt: new Date().toISOString()
                                }
                            }
                        }
                    }));

                    return newNode.id;
                },

                // Edge Management
                addEdge: (edgeData) => {
                    // Validation: pas de cycle
                    const state = get();
                    const tree = state.getActiveTree();
                    
                    if (state.hasCycle(edgeData.source, edgeData.target)) {
                        set({ error: 'Cycle détecté! Impossible de créer cette connexion.' });
                        return null;
                    }

                    const edgeId = crypto.randomUUID();
                    const newEdge = {
                        id: edgeId,
                        source: edgeData.source,
                        target: edgeData.target,
                        label: edgeData.label || 'Croisement F1',
                        animated: true,
                        data: {
                            type: edgeData.type || 'parent-child',
                            notes: edgeData.notes || ''
                        }
                    };

                    set(state => {
                        if (!state.activeTreeId) return state;
                        return {
                            phenoTrees: {
                                ...state.phenoTrees,
                                [state.activeTreeId]: {
                                    ...tree,
                                    edges: [...tree.edges, newEdge],
                                    metadata: {
                                        ...tree.metadata,
                                        updatedAt: new Date().toISOString()
                                    }
                                }
                            },
                            error: null
                        };
                    });

                    return edgeId;
                },

                deleteEdge: (edgeId) => {
                    set(state => {
                        if (!state.activeTreeId) return state;
                        const tree = state.phenoTrees[state.activeTreeId];
                        return {
                            phenoTrees: {
                                ...state.phenoTrees,
                                [state.activeTreeId]: {
                                    ...tree,
                                    edges: tree.edges.filter(e => e.id !== edgeId),
                                    metadata: {
                                        ...tree.metadata,
                                        updatedAt: new Date().toISOString()
                                    }
                                }
                            }
                        };
                    });
                },

                // Utility
                hasCycle: (source, target, edges = null) => {
                    const state = get();
                    const edgesToCheck = edges || state.getEdges();
                    
                    const canReach = (from, to, visited = new Set()) => {
                        if (from === to) return true;
                        if (visited.has(from)) return false;
                        visited.add(from);

                        const childEdges = edgesToCheck.filter(e => e.source === from);
                        return childEdges.some(e => canReach(e.target, to, visited));
                    };

                    return canReach(target, source);
                },

                // Cultivar Library
                setCultivarLibrary: (cultivars) => {
                    set({ cultivarLibrary: cultivars });
                },

                addToCultivarLibrary: (cultivar) => {
                    set(state => ({
                        cultivarLibrary: [...state.cultivarLibrary, cultivar]
                    }));
                },

                // API Integration
                setLoading: (loading) => set({ isLoading: loading }),
                setError: (error) => set({ error }),
                clearError: () => set({ error: null }),

                // Persist & Load
                saveTree: async () => {
                    const state = get();
                    const tree = state.getActiveTree();
                    if (!tree) return null;

                    set({ isLoading: true });
                    try {
                        const response = await fetch(`/api/phenotrees/${tree.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                nodes: tree.nodes,
                                edges: tree.edges,
                                metadata: tree.metadata
                            })
                        });

                        if (!response.ok) throw new Error('Failed to save tree');
                        
                        set({ 
                            isLoading: false,
                            error: null
                        });
                        return tree;
                    } catch (error) {
                        set({
                            isLoading: false,
                            error: error.message
                        });
                        throw error;
                    }
                },

                loadTree: async (treeId) => {
                    set({ isLoading: true });
                    try {
                        const response = await fetch(`/api/phenotrees/${treeId}`);
                        if (!response.ok) throw new Error('Failed to load tree');
                        
                        const tree = await response.json();
                        set(state => ({
                            phenoTrees: {
                                ...state.phenoTrees,
                                [treeId]: tree
                            },
                            activeTreeId: treeId,
                            isLoading: false,
                            error: null
                        }));
                        return tree;
                    } catch (error) {
                        set({
                            isLoading: false,
                            error: error.message
                        });
                        throw error;
                    }
                }
            }),
            {
                name: 'phenohunt-store',
                partialize: (state) => ({
                    phenoTrees: state.phenoTrees,
                    cultivarLibrary: state.cultivarLibrary
                })
            }
        )
    )
);
