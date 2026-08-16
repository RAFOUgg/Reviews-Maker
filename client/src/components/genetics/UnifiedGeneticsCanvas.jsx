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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    useNodesState,
    useEdgesState,
    Panel,
    useReactFlow,
    useStoreApi,
    MarkerType
} from 'reactflow';
import { toSvg } from 'html-to-image';
import { Sprout, AlertTriangle } from 'lucide-react';
import GraphCanvasShell from '../graph-canvas/GraphCanvasShell';
import CanvasInfoPanel from '../graph-canvas/CanvasInfoPanel';
import AnnotationNode from '../graph-canvas/AnnotationNode';
import MediaBubbleImportModal from '../graph-canvas/MediaBubbleImportModal';
import PasteBubbleModal from '../graph-canvas/PasteBubbleModal';
import useGraphMultiSelection from '../graph-canvas/useGraphMultiSelection';
import { buildGeneticsNodeBubble, buildGeneticsEdgeBubble, bubblePositionNear, parsePastedBubble } from '../../utils/graphDataBubble';
import { computeGridArrangement } from '../../utils/gridArrange';
import { useToast } from '../shared/ToastContainer';
// Store du CONTEXTE s'il existe, singleton global sinon — l'édition ne fournit aucun
// contexte, son comportement est donc inchangé par construction.
import { useGeneticsCanvasStore } from '../../store/scopedCanvasStores';
import useResponsiveLayout from '../../hooks/useResponsiveLayout';
import GeneticsCanvasToolbar, { SEX_FILTER_OPTIONS } from './GeneticsCanvasToolbar';
import GeneticsHoverPreview from './GeneticsHoverPreview';
import CultivarNode from './CultivarNode';
import PhenoEdge from './PhenoEdge';
import PairingEdge from './PairingEdge';
import FamilyDropEdge from './FamilyDropEdge';
import NodeContextMenu from './NodeContextMenu';
import EdgeContextMenu from './EdgeContextMenu';
import PaneContextMenu from './PaneContextMenu';
import GeneticsAnnotationContextMenu from './GeneticsAnnotationContextMenu';
import NodeFormModal from './NodeFormModal';
import LinkExistingReviewModal from './LinkExistingReviewModal';
import MediaAttachmentModal from '../shared/MediaAttachmentModal';
import EdgeFormModal from './EdgeFormModal';
import ConfirmModal from '../shared/ConfirmModal';

const nodeTypes = {
    cultivar: CultivarNode,
    annotationCard: AnnotationNode
};

const edgeTypes = {
    pheno: PhenoEdge,
    pairing: PairingEdge,
    family: FamilyDropEdge
};

// `GenNode.genetics` est persisté en JSON string côté API — parsé une seule fois ici, pour les
// nœuds comme pour les filtres (même helper que graphDataBubble.js, qui a le sien pour la même
// raison). Sans ce parsage, CultivarNode.jsx/PairingEdge.jsx ne peuvent jamais lire type/breeder/sex.
const parseGenetics = (node) => {
    let genetics = node?.genetics;
    if (typeof genetics === 'string') {
        try { genetics = JSON.parse(genetics); } catch { genetics = {}; }
    }
    return genetics || {};
};

// Repli du panneau latéral droit, mémorisé entre sessions (cf. CanvasInfoPanel.jsx). Clé propre à
// PhenoHunt : replier le panneau de la Chaîne de production ne doit pas replier celui de l'arbre.
const PANEL_COLLAPSE_STORAGE_KEY = 'geneticsInfoPanelCollapsed';

// Délai avant apparition de l'aperçu au survol — même valeur que la Chaîne de production : assez
// court pour rester réactif, assez long pour ne pas clignoter en traversant deux nœuds voisins.
const HOVER_PREVIEW_DELAY = 300;

// Types de relation parent→enfant réels (filiation) — "sibling" et "pairing" en sont exclus :
// un lien fraternel ne relie pas un parent à son enfant, et "pairing" relie deux parents entre eux.
const PARENT_CHILD_TYPES = ['parent', 'pollen_donor', 'clone', 'mutation'];

// Libellés lisibles des types de relation — mêmes valeurs que le select d'EdgeFormModal.jsx,
// dupliqués ici pour l'affichage en lecture seule du panneau latéral (pas de dépendance croisée
// entre les deux fichiers pour un simple mapping valeur→libellé).
const RELATIONSHIP_TYPE_LABELS = {
    parent: 'Parent',
    pollen_donor: 'Donateur de pollen',
    sibling: 'Frère/Sœur',
    clone: 'Clone',
    mutation: 'Mutation',
    pairing: 'Couple parental (liaison)'
};

const UnifiedGeneticsCanvas = ({ treeId, readOnly = false, renderNodeExtra = null }) => {
    const store = useGeneticsCanvasStore();
    const { fitView, screenToFlowPosition } = useReactFlow();
    // Tailles RÉELLEMENT mesurées des nœuds (réarrangement) — même accès que ProductionChainCanvas.
    const rfStoreApi = useStoreApi();
    const { isMobile } = useResponsiveLayout();
    const toast = useToast();

    // State local pour le canvas
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    // Sélection multiple (Ctrl/⌘ + clic, rectangle Maj + glisser) — cf. useGraphMultiSelection.js
    const { selectedIds: multiSelectedIds, onSelectionChange, applySelection, resolveActionTargets } = useGraphMultiSelection(setNodes);
    const [contextMenu, setContextMenu] = useState(null);
    const [contextMenuType, setContextMenuType] = useState(null); // 'node' | 'edge' | 'pane'
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'node'|'edge', id, label }
    const [confirmDetachAll, setConfirmDetachAll] = useState(false);
    const [showMediaBubbleImport, setShowMediaBubbleImport] = useState(false);
    // Collage d'une bulle : { position, text } quand le presse-papiers n'a pas pu être lu seul.
    const [pasteBubble, setPasteBubble] = useState(null);
    const [exportingSvg, setExportingSvg] = useState(false);

    // ── Recherche et filtres d'affichage ────────────────────────────────────────────────────
    // Même modèle que ProductionChainCanvas.jsx : état de vue éphémère (jamais persisté), et on
    // GRISE plutôt qu'on ne masque — retirer un nœud du tableau React Flow casserait toute arête
    // qui le référence encore comme source/target, et masquer un parent ferait disparaître une
    // filiation sans l'expliquer.
    const [sexFilter, setSexFilter] = useState(() => new Set(SEX_FILTER_OPTIONS.map(o => o.value)));
    const [attributeFilter, setAttributeFilter] = useState({ hasMedia: false, hasReview: false });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMatchIndex, setActiveMatchIndex] = useState(0);

    const handleToggleSex = useCallback((value) => {
        setSexFilter(prev => {
            const next = new Set(prev);
            if (next.has(value)) next.delete(value); else next.add(value);
            return next;
        });
    }, []);

    const handleToggleAttribute = useCallback((key) => {
        setAttributeFilter(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
        setActiveMatchIndex(0);
    }, []);

    const searchActive = searchTerm.trim().length > 0;
    const searchLower = searchTerm.trim().toLowerCase();

    // Champs réellement cherchés sur un individu : son nom, son breeder et son code de phénotype —
    // les trois seules identités textuelles qu'un sélectionneur utilise pour désigner une plante.
    // `phenotypeCode` vient de PHENO_NODE_SECTIONS (clé historique documentée), pas d'une supposition.
    const nodeSearchText = useCallback((node) => {
        const genetics = parseGenetics(node);
        return [node.cultivarName, genetics.breeder, genetics.phenotypeCode]
            .filter(Boolean).join(' ').toLowerCase();
    }, []);

    const edgeSearchText = useCallback((edge) => {
        const relation = RELATIONSHIP_TYPE_LABELS[edge.relationshipType] || edge.relationshipType || '';
        return [relation, edge.pollinationMethod].filter(Boolean).join(' ').toLowerCase();
    }, []);

    const nodeVisibility = useMemo(() => {
        const map = new Map();
        for (const node of (store.nodes || [])) {
            const genetics = parseGenetics(node);
            // `sex` non renseigné = "unknown", exactement comme le rendu du nœud (CultivarNode.jsx
            // retombe sur 'unknown' pour toute valeur absente ou inconnue).
            const sex = SEX_FILTER_OPTIONS.some(o => o.value === genetics.sex) ? genetics.sex : 'unknown';
            const sexOk = sexFilter.has(sex);
            const mediaOk = !attributeFilter.hasMedia || (Array.isArray(node.media) && node.media.length > 0);
            const reviewOk = !attributeFilter.hasReview || !!node.sourceReviewId;
            const searchOk = !searchActive || nodeSearchText(node).includes(searchLower);
            map.set(node.id, sexOk && mediaOk && reviewOk && searchOk);
        }
        return map;
    }, [store.nodes, sexFilter, attributeFilter, searchActive, searchLower, nodeSearchText]);

    // Une liaison hérite des filtres qui portent sur les INDIVIDUS (sexe, fiche liée) de ses deux
    // extrémités — une filiation dont un parent est filtré n'a pas de sens montrée seule. Les
    // médias et la recherche sont en revanche évalués sur la liaison elle-même, qui porte les siens.
    const edgeVisibility = useMemo(() => {
        const map = new Map();
        const nodeOk = (id) => nodeVisibility.get(id) !== false;
        for (const edge of (store.edges || [])) {
            const endpointsOk = nodeOk(edge.parentNodeId) && nodeOk(edge.childNodeId);
            const mediaOk = !attributeFilter.hasMedia || (Array.isArray(edge.media) && edge.media.length > 0);
            const searchOk = !searchActive || edgeSearchText(edge).includes(searchLower);
            map.set(edge.id, endpointsOk && mediaOk && searchOk);
        }
        return map;
    }, [store.edges, nodeVisibility, attributeFilter, searchActive, searchLower, edgeSearchText]);

    // Résultats ordonnés (individus puis liaisons) — permet la navigation précédent/suivant et le
    // centrage sur le résultat actif, même comportement que la Chaîne de production.
    const searchMatches = useMemo(() => {
        if (!searchActive) return [];
        const nodeMatches = (store.nodes || [])
            .filter(n => nodeSearchText(n).includes(searchLower))
            .map(n => ({ kind: 'node', id: n.id, fitNodeIds: [n.id] }));
        const edgeMatches = (store.edges || [])
            .filter(e => edgeSearchText(e).includes(searchLower))
            .map(e => ({
                kind: 'edge',
                id: e.id,
                fitNodeIds: [e.parentNodeId, e.childNodeId].filter(Boolean)
            }));
        return [...nodeMatches, ...edgeMatches];
    }, [searchActive, searchLower, store.nodes, store.edges, nodeSearchText, edgeSearchText]);

    const clampedMatchIndex = searchMatches.length > 0 ? activeMatchIndex % searchMatches.length : 0;
    const activeMatch = searchMatches[clampedMatchIndex] || null;

    const handleNextMatch = useCallback(() => {
        setActiveMatchIndex(i => (searchMatches.length > 0 ? (i + 1) % searchMatches.length : 0));
    }, [searchMatches.length]);

    const handlePrevMatch = useCallback(() => {
        setActiveMatchIndex(i => (searchMatches.length > 0 ? (i - 1 + searchMatches.length) % searchMatches.length : 0));
    }, [searchMatches.length]);

    useEffect(() => {
        if (!activeMatch?.fitNodeIds?.length) return;
        fitView({ nodes: activeMatch.fitNodeIds.map(id => ({ id })), duration: 400, padding: 0.3 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeMatch?.id, activeMatch?.kind]);

    // Recadrage manuel sur l'ensemble de l'arbre — l'équivalent du bouton « Zoom » de la Chaîne de
    // production, qui manquait ici alors que c'est le seul moyen de se retrouver après avoir pané
    // loin des nœuds.
    const handleFitView = useCallback(() => {
        fitView({ padding: 0.15, duration: 300 });
    }, [fitView]);

    const handleExportJSON = useCallback(() => {
        const data = {
            tree: { id: treeId, nodes: store.nodes, edges: store.edges, annotations: store.annotations },
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `genealogy-tree-${treeId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [treeId, store.nodes, store.edges, store.annotations]);

    const handleExportSVG = useCallback(async () => {
        setExportingSvg(true);
        try {
            // Recadrer AVANT de capturer : la capture porte sur `.react-flow__viewport`, dont le
            // contenu hors cadre serait sinon coupé (même précaution que ProductionChainCanvas).
            fitView({ padding: 0.15, duration: 0 });
            await new Promise(resolve => setTimeout(resolve, 150));
            const viewport = document.querySelector('.react-flow__viewport');
            if (!viewport) throw new Error('Canvas introuvable');
            const dataUrl = await toSvg(viewport, { backgroundColor: '#07070f' });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `genealogy-tree-${treeId}.svg`;
            a.click();
        } catch (error) {
            console.error('Export SVG error:', error);
            toast.error("L'export SVG a échoué");
        } finally {
            setExportingSvg(false);
        }
    }, [treeId, fitView, toast]);

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

    // Importer une photo/vidéo comme sa propre bulle sur l'arbre (MediaBubbleImportModal) —
    // centrée sur le viewport actuel, même geste que ProductionChainCanvas.jsx.
    const handleImportMediaBubble = useCallback(async ({ url, type }) => {
        const center = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        const result = await store.addAnnotation({
            title: type === 'video' ? '🎬 Vidéo' : '📷 Photo',
            body: [],
            mediaUrl: url,
            mediaType: type,
            position: center
        });
        // Ne fermer la modale que si la bulle a réellement été créée — sinon (erreur serveur) la
        // modale se refermait silencieusement sans que la photo n'apparaisse jamais sur l'arbre.
        if (result?.error) return result;
        setShowMediaBubbleImport(false);
        return result;
    }, [store, screenToFlowPosition]);

    // ── Créer une bulle à partir des informations copiées ────────────────────────────────────
    // Même geste et même analyseur que la Chaîne de production (parsePastedBubble, l'inverse exact
    // de « Copier les données ») : une bulle copiée sur un canevas se recolle sur l'autre.
    const createBubbleFromParsed = useCallback(async (parsed, position) => {
        const result = await store.addAnnotation({
            title: parsed.title,
            body: parsed.body,
            sourceLabel: 'Collé depuis le presse-papiers',
            position
        });
        if (result?.error) toast.error("La bulle n'a pas pu être créée");
        else toast.success('Bulle créée depuis le presse-papiers');
        return result;
    }, [store, toast]);

    const handlePasteBubble = useCallback(async (clientX, clientY) => {
        if (readOnly) return;
        const position = screenToFlowPosition({ x: clientX, y: clientY });
        // `readText()` n'existe pas partout (refusé par Firefox aux pages web, soumis à
        // autorisation ailleurs) : l'échec ouvre la modale de collage manuel.
        let text = '';
        try {
            text = (await navigator.clipboard?.readText?.()) || '';
        } catch {
            text = '';
        }
        const parsed = text.trim() ? parsePastedBubble(text) : null;
        if (!parsed) {
            setPasteBubble({ position, text });
            return;
        }
        await createBubbleFromParsed(parsed, position);
    }, [readOnly, screenToFlowPosition, createBubbleFromParsed]);

    // ── Réarranger l'arbre sur un quadrillage ────────────────────────────────────────────────
    // Même moteur que la Chaîne de production (utils/gridArrange.js), avec les deux différences
    // propres à la généalogie :
    //   - orientation VERTICALE : une descendance se lit du haut vers le bas, pas de gauche à
    //     droite comme une chaîne de fabrication ;
    //   - seuls les types de relation de FILIATION (PARENT_CHILD_TYPES) donnent le sens de lecture.
    //     « sibling » (fratrie) et « pairing » (couple parental) relient des individus de MÊME
    //     génération : les traiter comme une filiation ferait descendre un frère d'un rang à
    //     chaque lien, et le couple parental se retrouverait à cheval sur deux générations.
    const handleRearrange = useCallback(async () => {
        if (readOnly) return;

        const internals = rfStoreApi.getState().nodeInternals;
        const sizeOf = (id) => {
            const measured = internals.get(id);
            return { width: measured?.width || undefined, height: measured?.height || undefined };
        };

        const items = [
            ...(store.nodes || []).map(n => ({ id: n.id, kind: 'node', position: n.position, ...sizeOf(n.id) })),
            ...(store.annotations || []).map(a => ({ id: a.id, kind: 'annotation', position: a.position, ...sizeOf(a.id) }))
        ];
        if (items.length === 0) {
            toast.info('Rien à réarranger — l\'arbre est vide.');
            return;
        }

        const links = [
            ...(store.edges || []).map(e => ({
                source: e.parentNodeId,
                target: e.childNodeId,
                kind: PARENT_CHILD_TYPES.includes(e.relationshipType) ? 'flow' : 'peer'
            })),
            ...(store.annotations || []).map(a => {
                const anchorEdge = a.edgeId ? store.edges.find(e => e.id === a.edgeId) : null;
                const anchorId = a.nodeId || anchorEdge?.parentNodeId || null;
                return anchorId ? { source: anchorId, target: a.id, kind: 'satellite' } : null;
            }).filter(Boolean)
        ].filter(l => l.source && l.target);

        const { positions } = computeGridArrangement(items, links, { orientation: 'vertical' });

        const moved = items.filter(item => {
            const next = positions.get(item.id);
            return next && (next.x !== item.position?.x || next.y !== item.position?.y);
        });
        if (moved.length === 0) {
            toast.info('Les éléments sont déjà alignés.');
            return;
        }

        setNodes(nds => nds.map(n => {
            const next = positions.get(n.id);
            return next ? { ...n, position: next } : n;
        }));

        // Un point de courbure glissé à la main est une coordonnée ABSOLUE du canevas : le garder
        // enverrait la liaison faire un détour à l'ancien emplacement.
        const curvedEdges = (store.edges || []).filter(e => e.waypointX != null || e.waypointY != null);

        const results = await Promise.all([
            ...moved.map(item => item.kind === 'annotation'
                ? store.updateAnnotation(item.id, { position: positions.get(item.id) })
                : store.updateNode(item.id, { position: positions.get(item.id) })),
            ...curvedEdges.map(e => store.updateEdge(e.id, { waypointX: null, waypointY: null }))
        ]);

        const failed = results.filter(r => r?.error).length;
        if (failed > 0) toast.warning(`Réarrangement partiel : ${failed} élément(s) n'ont pas pu être enregistrés.`);
        else toast.success(`${moved.length} élément${moved.length > 1 ? 's' : ''} réarrangé${moved.length > 1 ? 's' : ''}`);

        fitView({ padding: 0.2, duration: 400 });
    }, [readOnly, store, rfStoreApi, setNodes, toast, fitView]);

    // ── Épingler les données d'un élément en bulle ──────────────────────────────────────────
    // PhenoHunt n'avait AUCUN moyen d'afficher les données d'un individu sur l'arbre : le nœud
    // n'affiche que nom/type/breeder, tout le reste (générations, sélection, caractères
    // techniques…) n'existait qu'à l'intérieur du formulaire d'édition. Une bulle ancrée
    // (GenAnnotation.nodeId → trait pointillé + suit le nœud) rend cette donnée lisible sur le
    // graphe lui-même. Contenu bâti par utils/graphDataBubble.js à partir de PHENO_NODE_SECTIONS,
    // la config qui génère le formulaire — jamais une liste de champs retranscrite à la main.
    const handlePinNodeDataBubble = useCallback(async (nodeIds) => {
        if (readOnly) return;
        const ids = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
        let created = 0;

        for (const [index, id] of ids.entries()) {
            const node = store.nodes.find(n => n.id === id);
            if (!node) continue;
            const bubble = buildGeneticsNodeBubble(node);
            const result = await store.addAnnotation({
                ...bubble,
                nodeId: id,
                position: bubblePositionNear(node.position, index)
            });
            if (!result?.error) created++;
        }

        if (created === 0) toast.error("La bulle n'a pas pu être épinglée");
        else toast.success(`${created} bulle${created > 1 ? 's' : ''} de données épinglée${created > 1 ? 's' : ''}`);
    }, [readOnly, store, toast]);

    const handlePinEdgeDataBubble = useCallback(async (edgeId) => {
        if (readOnly) return;
        const edge = store.edges.find(e => e.id === edgeId);
        if (!edge) return;

        const parent = store.nodes.find(n => n.id === edge.parentNodeId);
        const child = store.nodes.find(n => n.id === edge.childNodeId);
        const bubble = buildGeneticsEdgeBubble(edge, {
            parentName: parent?.cultivarName || null,
            childName: child?.cultivarName || null,
            relationshipLabel: RELATIONSHIP_TYPE_LABELS[edge.relationshipType] || edge.relationshipType
        });

        const result = await store.addAnnotation({
            ...bubble,
            edgeId,
            position: bubblePositionNear(parent?.position || child?.position, 1)
        });
        if (result?.error) toast.error("La bulle n'a pas pu être épinglée");
        else toast.success('Bulle de données épinglée');
    }, [readOnly, store, toast]);

    // Synchroniser les nœuds et arêtes du store vers React Flow
    useEffect(() => {
        // Ne PAS sortir tôt sur "aucun cultivar" — un arbre peut n'avoir que des bulles média
        // épinglées (aucun individu créé pour autant), auquel cas les annotations doivent quand
        // même s'afficher plutôt que d'être effacées par ce garde-fou.
        if ((!store.nodes || store.nodes.length === 0) && (!store.annotations || store.annotations.length === 0)) {
            setNodes([]);
            setEdges([]);
            return;
        }

        // Convertir les nœuds du store au format React Flow
        const rfNodes = store.nodes.map(node => {
            const genetics = parseGenetics(node);
            return {
                id: node.id,
                data: {
                    label: node.cultivarName,
                    image: node.image,
                    color: node.color || '#FF6B9D',
                    genetics: genetics || {},
                    notes: node.notes,
                    selected: store.selectedNodeId === node.id,
                    sourceReviewOrphaned: node.sourceReviewOrphaned,
                    mediaCount: Array.isArray(node.media) ? node.media.length : 0,
                    // Filtres/recherche : grisé si écarté, surligné si c'est le résultat courant.
                    dimmed: nodeVisibility.get(node.id) === false,
                    searchActive: activeMatch?.kind === 'node' && activeMatch.id === node.id
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
                    // Cette arête fusionne DEUX liens réels : elle ne s'efface que si les deux sont
                    // écartés par le filtre — sinon on masquerait une filiation encore retenue.
                    dimmed: edgeVisibility.get(e1.id) === false && edgeVisibility.get(e2.id) === false,
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
                        mediaCount: Array.isArray(edge.media) ? edge.media.length : 0,
                        dimmed: edgeVisibility.get(edge.id) === false
                    }
                };
            });

        // Cartes épinglées librement sur le canvas (note texte ou bulle média) — même principe que
        // ProductionChainCanvas.jsx rfAnnotationNodes, cf. AnnotationNode.jsx pour le rendu partagé.
        const rfAnnotationNodes = (store.annotations || []).map(annotation => ({
            id: annotation.id,
            type: 'annotationCard',
            position: annotation.position || { x: 0, y: 0 },
            data: {
                title: annotation.title,
                body: annotation.body,
                sourceLabel: annotation.sourceLabel,
                mediaUrl: annotation.mediaUrl,
                mediaType: annotation.mediaType,
                onDelete: () => store.deleteAnnotation(annotation.id)
            }
        }));

        // Trait de rattachement pointillé entre une bulle ancrée à un individu (`nodeId`) et cet
        // individu — même principe que ProductionChainCanvas.annotationLinkEdges. Sans lui, une
        // bulle de données épinglée depuis le menu contextuel flottait sans rien indiquer de ce
        // qu'elle documente, alors que le rattachement existe bien côté serveur (GenAnnotation.nodeId).
        const annotationLinkEdges = (store.annotations || [])
            .map(annotation => {
                const anchorEdge = annotation.edgeId ? store.edges.find(e => e.id === annotation.edgeId) : null;
                const anchorNodeId = annotation.nodeId || anchorEdge?.parentNodeId || null;
                if (!anchorNodeId) return null;
                return {
                    id: `annotation-link-${annotation.id}`,
                    source: anchorNodeId,
                    target: annotation.id,
                    type: 'straight',
                    selectable: false,
                    focusable: false,
                    style: { strokeDasharray: '4 4', stroke: 'rgba(148, 163, 184, 0.35)', strokeWidth: 1 }
                };
            })
            .filter(Boolean);

        // applySelection : la reconstruction ci-dessus n'emporte pas le drapeau `selected`, donc
        // sans ça la première mutation venue effacerait la sélection multiple en cours.
        setNodes(applySelection([...rfNodes, ...rfAnnotationNodes]));
        setEdges([...rfEdges, ...familyEdges, ...annotationLinkEdges]);
    }, [store.nodes, store.edges, store.annotations, store.selectedNodeId, store.selectedEdgeId, nodeVisibility, edgeVisibility, activeMatch, setNodes, setEdges, applySelection, handleEdgeWaypointChange, handleEdgeEndpointChange, handleEdgeEndpointReconnect, handlePairingDropOnNode]);

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

        // screenToFlowPosition plutôt qu'une soustraction brute de clientX/clientY par le
        // bounding rect — dès que le canvas est zoomé/pané (fitView au montage dès qu'il y a
        // plus d'un nœud), des coordonnées écran stockées telles quelles atterrissent hors du
        // viewport visible : le nœud est bien créé mais invisible (cf. même bug corrigé sur
        // ProductionChainCanvas.jsx).
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

        // Add the node via the store (backend API)
        await store.addNode({
            cultivarName: cultivar.name || cultivar.cultivarName || 'Sans nom',
            image: cultivar.image || null,
            genetics: cultivar.genetics || null,
            notes: '',
            position,
            color: '#10b981',
            // Relie la review en retour à cet arbre (côté backend) quand le nœud provient d'une
            // fiche technique — sinon la review reste "sans arbre" pour toujours et le modal de
            // création d'arbre réapparaît à chaque réédition.
            sourceReviewId: cultivar.reviewId || null,
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

        // Une bulle ANCRÉE à un individu (GenAnnotation.nodeId) suit le même delta que lui, sinon
        // elle reste sur place pendant que son trait de rattachement s'étire à travers l'arbre —
        // même correctif que ProductionChainCanvas.annotationShifts.
        const annotationShifts = [];
        for (const n of movedNodes) {
            if (n.type === 'annotationCard') continue;
            const before = store.nodes.find(sn => sn.id === n.id);
            if (!before) continue;
            const dx = n.position.x - (before.position?.x || 0);
            const dy = n.position.y - (before.position?.y || 0);
            if (dx === 0 && dy === 0) continue;

            for (const annotation of store.annotations || []) {
                if (annotation.nodeId !== n.id) continue;
                if (annotationShifts.some(s => s.id === annotation.id)) continue;
                annotationShifts.push({
                    id: annotation.id,
                    position: { x: (annotation.position?.x || 0) + dx, y: (annotation.position?.y || 0) + dy }
                });
            }
        }

        // Les cartes épinglées (annotationCard, ex: bulle média) se déplacent comme n'importe quel
        // nœud React Flow mais persistent via updateAnnotation, pas updateNode (id d'une table
        // différente — cf. ProductionChainCanvas.jsx même pattern).
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

    // ── Aperçu au survol ────────────────────────────────────────────────────────────────────
    // Même mécanique que ProductionChainCanvas (délai court anti-clignotement, coordonnées écran),
    // mais sans chargement asynchrone : tout ce qu'affiche l'aperçu est DÉJÀ dans le store de
    // l'arbre, contrairement au résumé de pipeline de la chaîne qui doit être récupéré par review.
    const [hoverInfo, setHoverInfo] = useState(null); // { kind: 'node'|'edge', id, x, y } | null
    const hoverTimerRef = useRef(null);

    const clearHoverTimer = useCallback(() => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    }, []);

    useEffect(() => clearHoverTimer, [clearHoverTimer]);

    const scheduleHover = useCallback((kind, id, event) => {
        clearHoverTimer();
        const { clientX, clientY } = event;
        hoverTimerRef.current = setTimeout(() => {
            hoverTimerRef.current = null;
            setHoverInfo({ kind, id, x: clientX, y: clientY });
        }, HOVER_PREVIEW_DELAY);
    }, [clearHoverTimer]);

    const handleHoverLeave = useCallback(() => {
        clearHoverTimer();
        setHoverInfo(null);
    }, [clearHoverTimer]);

    const handleNodeMouseEnter = useCallback((event, node) => {
        // Une carte épinglée affiche déjà son contenu en clair sur le canvas — la survoler pour
        // afficher le même texte en plus petit n'apporterait rien.
        if (node.type === 'annotationCard') return;
        scheduleHover('node', node.id, event);
    }, [scheduleHover]);

    const handleEdgeMouseEnter = useCallback((event, edge) => {
        // Les traits de rattachement d'une bulle et les arêtes "family" synthétiques n'ont pas
        // d'existence en base : rien à résumer (cf. construction des arêtes plus haut).
        if (edge.data?.isFamily || String(edge.id).startsWith('annotation-link-')) return;
        scheduleHover('edge', edge.id, event);
    }, [scheduleHover]);

    // Contenu de l'aperçu — bâti par les MÊMES fonctions que les bulles épinglables, pour que
    // survoler et épingler ne racontent jamais deux histoires différentes du même élément.
    const hoverBubble = useMemo(() => {
        if (!hoverInfo) return null;
        if (hoverInfo.kind === 'node') {
            const node = store.nodes.find(n => n.id === hoverInfo.id);
            return node ? buildGeneticsNodeBubble(node) : null;
        }
        const edge = store.edges.find(e => e.id === hoverInfo.id);
        if (!edge) return null;
        return buildGeneticsEdgeBubble(edge, {
            parentName: store.nodes.find(n => n.id === edge.parentNodeId)?.cultivarName || null,
            childName: store.nodes.find(n => n.id === edge.childNodeId)?.cultivarName || null,
            relationshipLabel: RELATIONSHIP_TYPE_LABELS[edge.relationshipType] || edge.relationshipType
        });
    }, [hoverInfo, store.nodes, store.edges]);

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

        // Une carte épinglée est un nœud React Flow, mais pas un individu : la router vers le menu
        // des nœuds revenait à chercher un individu portant cet id, n'en trouver aucun et
        // n'afficher AUCUN menu — copier ou détacher une bulle était donc impossible sur l'arbre.
        if (node.type === 'annotationCard') {
            setContextMenuType('annotation');
            setContextMenu({ x: event.clientX, y: event.clientY, annotationId: node.id });
            return;
        }

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
    // Une arête "family" (fusion visuelle d'un couple, cf. sync effect plus haut) n'a pas d'id réel
    // en base — un clic dessus ne trouve donc rien ici et le panneau reste vide, comme avant.
    const selectedEdge = store.selectedEdgeId ? store.edges.find(e => e.id === store.selectedEdgeId) : null;
    const edgeParentNode = selectedEdge ? store.nodes.find(n => n.id === selectedEdge.parentNodeId) : null;
    const edgeChildNode = selectedEdge ? store.nodes.find(n => n.id === selectedEdge.childNodeId) : null;

    return (
        <GraphCanvasShell
            readOnly={readOnly}
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
            onNodeMouseLeave={handleHoverLeave}
            onEdgeMouseEnter={handleEdgeMouseEnter}
            onEdgeMouseLeave={handleHoverLeave}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onCanvasClick={handleCanvasClick}
            onPaneContextMenu={handlePaneContextMenu}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            minimapNodeColor={(node) => node.data?.color || '#FF6B9D'}
            toolbar={<>
                {/* Sélection multiple : sans compteur, rien ne dit que Ctrl+clic a fait quelque
                    chose ni que le clic droit va agir sur plusieurs éléments d'un coup. */}
                {multiSelectedIds.length > 1 && (
                    <Panel position="bottom-center" className="graph-selection-chip">
                        {multiSelectedIds.length} éléments sélectionnés — clic droit pour agir sur l'ensemble
                    </Panel>
                )}
                <GeneticsCanvasToolbar
                    readOnly={readOnly}
                    onFitView={handleFitView}
                    onExportJSON={handleExportJSON}
                    onExportSVG={handleExportSVG}
                    exportingSvg={exportingSvg}
                    onShowMediaBubbleImport={() => setShowMediaBubbleImport(true)}
                    sexFilter={sexFilter}
                    onToggleSex={handleToggleSex}
                    attributeFilter={attributeFilter}
                    onToggleAttribute={handleToggleAttribute}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    matchCount={searchMatches.length}
                    activeMatchIndex={clampedMatchIndex}
                    onNextMatch={handleNextMatch}
                    onPrevMatch={handlePrevMatch}
                />
                {orphanedNodeIds.length > 0 && (
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
            </>}
            // canvasLoading est aussi mis à true pour CHAQUE mutation en arrière-plan (déplacer un
            // nœud, ajouter une arête...), pas seulement le chargement initial de l'arbre. Ne
            // démonter le canvas (spinner plein écran) que lors du tout premier chargement, quand
            // il n'y a encore aucun nœud à afficher — sinon chaque glisser-déposer de nœud provoque
            // un flash "spinner + reset du zoom/pan" (ReactFlow `fitView` se redéclenche au remount).
            loading={store.canvasLoading && nodes.length === 0}
            loadingLabel="Chargement de l'arbre généalogique..."
            error={store.treeError}
            onErrorReset={() => store.clearSelection()}
            sidePanel={(selectedNode || selectedEdge) && (
                <CanvasInfoPanel
                    storageKey={PANEL_COLLAPSE_STORAGE_KEY}
                    // Titre réel de l'élément sélectionné, pas un libellé générique : sur téléphone
                    // c'est l'en-tête de la feuille, ET c'est son changement qui la rouvre après une
                    // fermeture (cf. CanvasInfoPanel.jsx) — un titre constant la garderait fermée
                    // pour toutes les sélections suivantes.
                    title={selectedNode
                        ? (selectedNode.cultivarName || 'Individu')
                        : `${edgeParentNode?.cultivarName || '?'} → ${edgeChildNode?.cultivarName || '?'}`}
                >
                    <div className="info-content">
                        {selectedNode && (
                            <>
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
                                {renderNodeExtra && renderNodeExtra(selectedNode)}
                            </>
                        )}

                        {selectedEdge && (
                            <>
                                <h4>{edgeParentNode?.cultivarName || '?'} → {edgeChildNode?.cultivarName || '?'}</h4>
                                <p>Relation : {RELATIONSHIP_TYPE_LABELS[selectedEdge.relationshipType] || selectedEdge.relationshipType}</p>
                                {selectedEdge.pollinationMethod && <p>Méthode de pollinisation : {selectedEdge.pollinationMethod}</p>}
                                {selectedEdge.notes && <p className="notes">{selectedEdge.notes}</p>}
                                {!readOnly && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-edit" onClick={() => store.openEdgeForm(selectedEdge)}>
                                            Éditer
                                        </button>
                                        <button className="btn-edit" onClick={() => store.openMediaModal('edge', selectedEdge.id)}>
                                            Photos / Vidéos{Array.isArray(selectedEdge.media) && selectedEdge.media.length > 0 ? ` (${selectedEdge.media.length})` : ''}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </CanvasInfoPanel>
            )}
            floatingOverlay={hoverInfo && hoverBubble && (
                <GeneticsHoverPreview x={hoverInfo.x} y={hoverInfo.y} bubble={hoverBubble} />
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
                        // Un clic droit SUR un élément de la sélection multiple agit sur toute la
                        // sélection ; sur un élément hors sélection, sur lui seul.
                        targetIds={resolveActionTargets(contextMenu.nodeId)}
                        onPinDataBubble={handlePinNodeDataBubble}
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
                        onPinDataBubble={handlePinEdgeDataBubble}
                    />
                )}
                {contextMenu && contextMenuType === 'annotation' && !readOnly && (
                    <GeneticsAnnotationContextMenu
                        annotationId={contextMenu.annotationId}
                        x={contextMenu.x}
                        y={contextMenu.y}
                        onClose={closeContextMenu}
                    />
                )}
                {contextMenu && contextMenuType === 'pane' && (
                    <PaneContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        onClose={closeContextMenu}
                        onAddUnknownIndividual={handleAddUnknownIndividual}
                        readOnly={readOnly}
                        onRearrange={handleRearrange}
                        onPasteBubble={handlePasteBubble}
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
                {pasteBubble && (
                    <PasteBubbleModal
                        initialText={pasteBubble.text}
                        onCreate={(parsed) => createBubbleFromParsed(parsed, pasteBubble.position)}
                        onClose={() => setPasteBubble(null)}
                    />
                )}
                {showMediaBubbleImport && (
                    <MediaBubbleImportModal onImport={handleImportMediaBubble} onClose={() => setShowMediaBubbleImport(false)} />
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



