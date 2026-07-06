/**
 * Zustand Store pour la gestion des chaînes de production (Production Chain)
 *
 * Graphe liant plusieurs fiches techniques (reviews Fleur/Hash/Concentré/Comestible)
 * avec les données de transformation (technique/date/notes) sur les liaisons.
 * Structure miroir de useGeneticsStore.js, adaptée aux nœuds "review" plutôt que "cultivar".
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getPipelineSummaryForEdge } from '../utils/chainPipelineSummary';
import { getPipelineFillSummary } from '../utils/chainCellPipelines';

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

            // STATE - ANNOTATIONS (cartes épinglées librement sur le fond du canvas, glissées-
            // déposées depuis le panneau latéral d'un nœud/liaison — cf. ChainAnnotation)
            annotations: [],

            // STATE - UI
            showEdgeForm: false,
            edgeFormData: null,

            // STATE - CELL DATA (import de cellules de pipeline vers un nœud/liaison)
            // cellPicker : { targetType: 'node'|'edge', targetIds: string[] } | null
            cellPicker: null,
            // cellClipboard : cellules copiées (sans id — un nouvel id est généré à chaque collage)
            cellClipboard: [],
            // editingCell : { targetType: 'node'|'edge', targetId: string, cell: object } | null
            editingCell: null,
            // mediaModalTarget : { targetType: 'node'|'edge', targetId: string } | null
            mediaModalTarget: null,

            // STATE - REVIEW SUMMARY CACHE (résumé pipeline dérivé de la review liée à un nœud,
            // pour le hover/panneau du canvas — clé par reviewId, pas par chaîne : une review est
            // un objet global, le cache reste valide même en changeant de chaîne.
            // reviewSummaryCache[reviewId] : { loading, fetched, error, pipelineSummary, fillSummary }
            reviewSummaryCache: {},

            // STATE - CANVAS
            canvasLoading: false,

            // STATE - CHAIN SECTION LINK (toggle Pipeline <-> Chaîne de production dans les
            // formulaires de review — un seul embed actif à la fois par page, donc un état
            // global partagé évite le prop-drilling entre le bouton (dans le titre de section)
            // et le panneau (dans la section pipeline elle-même).
            linkOpen: false,
            linkStatusLoading: true,
            linkedChains: [],
            linkSelectedChainId: null,
            linkForceChoicePanel: false,
            linkShowImportPicker: false,
            linkBusy: false,
            linkError: null,
            // Guard `${reviewType}:${reviewId}` — évite de refetch/reset à chaque re-render et
            // ignore une réponse qui arriverait après que l'utilisateur ait changé de fiche.
            linkReviewKey: null,

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

                    const parseCellData = (raw) => {
                        if (Array.isArray(raw)) return raw;
                        if (typeof raw !== 'string') return [];
                        try { return JSON.parse(raw) } catch { return [] }
                    };

                    const parsedNodes = chain.nodes.map(n => ({
                        ...n,
                        position: typeof n.position === 'string' ? JSON.parse(n.position) : n.position,
                        cellData: parseCellData(n.cellData),
                        media: parseCellData(n.media)
                    }));

                    const parsedEdges = (chain.edges || []).map(e => ({
                        ...e,
                        cellData: parseCellData(e.cellData),
                        media: parseCellData(e.media)
                    }));

                    set({
                        selectedChainId: chainId,
                        selectedChain: { id: chain.id, name: chain.name, description: chain.description, isPublic: chain.isPublic },
                        nodes: parsedNodes,
                        edges: parsedEdges,
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
                const wasEmpty = state.nodes.length === 0;

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

                    // Renomme automatiquement une chaîne encore au nom générique (créée vide
                    // depuis la Bibliothèque, "Chaîne N") dès l'ajout de son premier produit —
                    // évite une bibliothèque pleine de chaînes jamais renommées manuellement.
                    // Ne touche jamais un nom déjà personnalisé par l'utilisateur.
                    const currentName = get().selectedChain?.name || '';
                    const looksLikeDefaultName = /^Chaîne \d+$/.test(currentName) || currentName.startsWith('Chaîne de production - ');
                    if (wasEmpty && looksLikeDefaultName && newNode.label && newNode.label !== 'Sans nom') {
                        get().updateChain(state.selectedChainId, { name: newNode.label });
                    }

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
            // CHAIN SECTION LINK - Toggle + actions du bouton "Chaîne de production" embarqué
            // dans les sections pipeline des formulaires de review
            // ============================================================================
            setLinkOpen: (open) => set({ linkOpen: open }),
            setLinkState: (partial) => set(partial),

            // Résout dès le montage du bouton si cette fiche appartient déjà à une chaîne — le
            // bouton fermé doit afficher "Créer" ou "Ouvrir" sans attendre un clic.
            ensureLinkStatus: async (reviewType, reviewId) => {
                const key = `${reviewType}:${reviewId}`;
                if (get().linkReviewKey === key) return;
                set({
                    linkReviewKey: key, linkStatusLoading: true, linkedChains: [], linkOpen: false,
                    linkSelectedChainId: null, linkForceChoicePanel: false, linkShowImportPicker: false,
                    linkError: null
                });
                const [forReviewResult] = await Promise.all([
                    get().fetchChainsForReview(reviewType, reviewId),
                    get().fetchChains()
                ]);
                // La fiche a changé pendant le fetch (navigation rapide entre sections/reviews) —
                // une réponse tardive ne doit pas écraser l'état de la fiche courante.
                if (get().linkReviewKey !== key) return;
                const chains = forReviewResult?.data || [];
                set({ linkedChains: chains, linkSelectedChainId: chains[0]?.id || null, linkStatusLoading: false });
            },

            linkCreateEmpty: async (reviewLabel) => {
                set({ linkBusy: true, linkError: null });
                const result = await get().createChain({ name: `Chaîne de production - ${reviewLabel || 'Sans nom'}` });
                if (result?.data) {
                    await get().loadChain(result.data.id);
                    set(state => ({
                        linkedChains: [...state.linkedChains, result.data],
                        linkSelectedChainId: result.data.id,
                        linkForceChoicePanel: false
                    }));
                } else {
                    set({ linkError: result?.error || 'Erreur lors de la création' });
                }
                set({ linkBusy: false });
            },

            linkCreateFromReview: async (reviewLabel, nodePayload) => {
                set({ linkBusy: true, linkError: null });
                const result = await get().createChain({ name: `Chaîne de production - ${reviewLabel || 'Sans nom'}` });
                if (result?.data) {
                    await get().loadChain(result.data.id);
                    await get().addNode(nodePayload);
                    set(state => ({
                        linkedChains: [...state.linkedChains, result.data],
                        linkSelectedChainId: result.data.id,
                        linkForceChoicePanel: false
                    }));
                } else {
                    set({ linkError: result?.error || 'Erreur lors de la création' });
                }
                set({ linkBusy: false });
            },

            linkImportToChain: async (chain, nodePayload) => {
                set({ linkBusy: true, linkError: null });
                await get().loadChain(chain.id);
                const result = await get().addNode(nodePayload);
                if (result?.data) {
                    set(state => ({
                        linkedChains: [...state.linkedChains, chain],
                        linkSelectedChainId: chain.id,
                        linkForceChoicePanel: false,
                        linkShowImportPicker: false
                    }));
                } else {
                    set({ linkError: result?.error || "Erreur lors de l'import" });
                }
                set({ linkBusy: false });
            },

            // ============================================================================
            // CELL DATA - Import/édition des cellules de pipeline attachées à un nœud/liaison
            // ============================================================================
            // targetIds peut être vide (ouverture depuis le fond du canvas) — la modale laisse
            // alors choisir librement les cibles parmi tous les nœuds/liaisons de la chaîne.
            openCellPicker: (targetType, targetIds = []) => {
                const ids = Array.isArray(targetIds) ? targetIds : [targetIds];
                set({ cellPicker: { targetType, targetIds: ids } });
            },

            closeCellPicker: () => set({ cellPicker: null }),

            openCellEditor: (targetType, targetId, cell) => set({ editingCell: { targetType, targetId, cell } }),
            closeCellEditor: () => set({ editingCell: null }),

            openMediaModal: (targetType, targetId) => set({ mediaModalTarget: { targetType, targetId } }),
            closeMediaModal: () => set({ mediaModalTarget: null }),

            // Persiste le tableau media complet (photos/vidéos) d'un nœud/liaison — appelé par
            // MediaAttachmentModal.onChange après chaque ajout/suppression/légende.
            updateMedia: async (targetType, targetId, nextMedia) => {
                const state = get();
                const updateFn = targetType === 'node' ? state.updateNode : state.updateEdge;
                return updateFn(targetId, { media: nextMedia });
            },

            // Fusionne `cells` (snapshots sans id, cf. chainCellPickerModal) dans chaque cible —
            // un id + une date d'attache sont générés à l'attache, jamais côté picker, pour que
            // coller la même sélection sur plusieurs cibles ne collisionne pas sur le même id.
            attachCellsToTargets: async (targetType, targetIds, cells) => {
                if (!cells || cells.length === 0) return { data: [] };
                const ids = Array.isArray(targetIds) ? targetIds : [targetIds];
                const state = get();
                const collection = targetType === 'node' ? state.nodes : state.edges;
                const updateFn = targetType === 'node' ? state.updateNode : state.updateEdge;

                const results = await Promise.all(ids.map(targetId => {
                    const target = collection.find(t => t.id === targetId);
                    if (!target) return Promise.resolve({ error: 'Target not found' });
                    const existing = Array.isArray(target.cellData) ? target.cellData : [];
                    const stamped = cells.map(cell => ({
                        ...cell,
                        id: crypto.randomUUID(),
                        attachedAt: new Date().toISOString()
                    }));
                    return updateFn(targetId, { cellData: [...existing, ...stamped] });
                }));

                return { data: results };
            },

            // Crée une cellule attachée directement (sans passer par l'import depuis une fiche
            // technique source) — utilisé par le bouton "Ajouter des données directement" du menu
            // contextuel d'un nœud/liaison, quand on veut juste noter une donnée de pipeline sur
            // place sans avoir de review dédiée à importer.
            addDirectCell: async (targetType, targetId, cellPayload) => {
                const state = get();
                const collection = targetType === 'node' ? state.nodes : state.edges;
                const updateFn = targetType === 'node' ? state.updateNode : state.updateEdge;
                const target = collection.find(t => t.id === targetId);
                if (!target) return { error: 'Target not found' };

                const existing = Array.isArray(target.cellData) ? target.cellData : [];
                const newCell = {
                    ...cellPayload,
                    id: crypto.randomUUID(),
                    attachedAt: new Date().toISOString()
                };
                return updateFn(targetId, { cellData: [...existing, newCell] });
            },

            // newData remplace intégralement le contenu de la cellule (pas un merge) — permet à
            // l'éditeur de vider un champ, comme PipelineCellEditor.onSave côté fiche technique.
            updateAttachedCell: async (targetType, targetId, cellId, newData) => {
                const state = get();
                const collection = targetType === 'node' ? state.nodes : state.edges;
                const updateFn = targetType === 'node' ? state.updateNode : state.updateEdge;
                const target = collection.find(t => t.id === targetId);
                if (!target) return { error: 'Target not found' };

                const existing = Array.isArray(target.cellData) ? target.cellData : [];
                const cellData = existing.map(cell => cell.id === cellId
                    ? { ...cell, data: newData }
                    : cell);

                return updateFn(targetId, { cellData });
            },

            removeAttachedCell: async (targetType, targetId, cellId) => {
                const state = get();
                const collection = targetType === 'node' ? state.nodes : state.edges;
                const updateFn = targetType === 'node' ? state.updateNode : state.updateEdge;
                const target = collection.find(t => t.id === targetId);
                if (!target) return { error: 'Target not found' };

                const existing = Array.isArray(target.cellData) ? target.cellData : [];
                return updateFn(targetId, { cellData: existing.filter(cell => cell.id !== cellId) });
            },

            // Copie une ou plusieurs cellules déjà attachées (menu contextuel "Copier") — on ne
            // garde que le contenu réimportable, l'id/attachedAt sont régénérés au collage.
            copyCells: (cells) => {
                const normalized = cells.map(({ id, attachedAt, ...rest }) => ({ ...rest }));
                set({ cellClipboard: normalized });
            },

            pasteCells: async (targetType, targetIds) => {
                const state = get();
                if (state.cellClipboard.length === 0) return { data: [] };
                return state.attachCellsToTargets(targetType, targetIds, state.cellClipboard);
            },

            // ============================================================================
            // UI - Selection & Forms
            // ============================================================================
            // Sélectionner l'un désélectionne systématiquement l'autre — sans ça, sélectionner une
            // liaison puis un nœud (ou l'inverse) laissait les deux ids actifs en même temps, et le
            // panneau latéral affichait les deux blocs (nœud + liaison) empilés simultanément.
            selectNode: (nodeId) => set({ selectedNodeId: nodeId, selectedEdgeId: null }),
            selectEdge: (edgeId) => set({ selectedEdgeId: edgeId, selectedNodeId: null }),

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
            // REVIEW SUMMARY CACHE (hover / panneau du canvas)
            // ============================================================================
            // Charge (une seule fois par reviewId) le résumé pipeline + statut de remplissage
            // de la review liée à un nœud — utilisé aussi bien pour le hover d'un nœud que pour
            // celui d'une liaison (dont la review "cible" documente sa propre fabrication, même
            // convention que ChainEdgeFormModal/chainPipelineSummary.js).
            ensureReviewSummary: async (reviewId, reviewType) => {
                if (!reviewId) return;
                const existing = get().reviewSummaryCache[reviewId];
                if (existing && (existing.loading || existing.fetched)) return;

                set(state => ({
                    reviewSummaryCache: {
                        ...state.reviewSummaryCache,
                        [reviewId]: { loading: true, fetched: false, error: null, pipelineSummary: null, fillSummary: [] }
                    }
                }));

                try {
                    const res = await fetch(`/api/reviews/${reviewId}`, { credentials: 'include' });
                    if (!res.ok) throw new Error('Fiche technique introuvable');
                    const review = await res.json();
                    const flat = {
                        ...review,
                        ...(review.flowerData || {}),
                        ...(review.hashData || {}),
                        ...(review.concentrateData || {}),
                        ...(review.edibleData || {})
                    };
                    set(state => ({
                        reviewSummaryCache: {
                            ...state.reviewSummaryCache,
                            [reviewId]: {
                                loading: false,
                                fetched: true,
                                error: null,
                                pipelineSummary: getPipelineSummaryForEdge(reviewType, flat),
                                fillSummary: getPipelineFillSummary(flat, reviewType)
                            }
                        }
                    }));
                } catch (error) {
                    set(state => ({
                        reviewSummaryCache: {
                            ...state.reviewSummaryCache,
                            [reviewId]: { loading: false, fetched: true, error: error.message || 'Erreur de chargement', pipelineSummary: null, fillSummary: [] }
                        }
                    }));
                }
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
                    edges: [],
                    cellPicker: null,
                    editingCell: null,
                    mediaModalTarget: null
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
                    cellPicker: null,
                    cellClipboard: [],
                    editingCell: null,
                    mediaModalTarget: null,
                    reviewSummaryCache: {},
                    chainLoading: false,
                    canvasLoading: false,
                    chainError: null,
                    linkOpen: false,
                    linkStatusLoading: true,
                    linkedChains: [],
                    linkSelectedChainId: null,
                    linkForceChoicePanel: false,
                    linkShowImportPicker: false,
                    linkBusy: false,
                    linkError: null,
                    linkReviewKey: null
                });
            }
        }),
        { name: 'ProductionChainStore' }
    )
);

export default useProductionChainStore;
