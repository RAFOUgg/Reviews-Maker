import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { toSvg } from 'html-to-image';
import useGeneticsStore from '../../store/useGeneticsStore';
import UnifiedGeneticsCanvas from '../../components/genetics/UnifiedGeneticsCanvas';
import TreeFormModal from '../../components/genetics/TreeFormModal';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI';
import {
    Plus, Settings, Home, Leaf, FolderOpen, ChevronDown, ChevronRight,
    GitBranch, Menu, X, Search, Trash2, Pencil, FileText, Dna,
    Link2, Download, Image as ImageIcon, RefreshCw, Sprout
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

/**
 * PhenoHuntPage - Page principale du module PhenoHunt (route standalone /phenohunt)
 *
 * Refonte 2026-07 : re-style LiquidUI complet (était en Tailwind brut, déconnecté du reste de
 * l'app), gestion d'arbres enrichie (renommer/supprimer/rechercher, auparavant absent ici),
 * restauration des actions d'arbre perdues (ajout nœud racine/relation, export JSON/SVG — cf.
 * TreeToolbar.jsx, supprimé, panneau flottant retiré du canvas plus tôt) sous forme de bande
 * d'outils ancrée au-dessus du canvas, et nouvelle section "Mes reviews Fleurs" pour glisser une
 * fiche technique directement ici (déjà possible depuis l'éditeur de review intégré uniquement).
 */
export default function PhenoHuntPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const store = useGeneticsStore();

    const [cultivarLibrary, setCultivarLibrary] = useState([]);
    const [userReviews, setUserReviews] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [treeSearch, setTreeSearch] = useState('');
    const [cultivarSearch, setCultivarSearch] = useState('');
    const [reviewsOpen, setReviewsOpen] = useState(true);
    const [cultivarsOpen, setCultivarsOpen] = useState(true);
    const [confirmDeleteTree, setConfirmDeleteTree] = useState({ open: false, treeId: null, treeName: '', flowerReviews: 0 });
    const [exporting, setExporting] = useState(false);

    // Charger les arbres, la bibliothèque de cultivars et les reviews fleurs de l'utilisateur
    useEffect(() => {
        store.fetchTrees();

        const loadCultivars = async () => {
            try {
                const response = await fetch('/api/cultivars', { credentials: 'include' });
                if (response.ok) {
                    const cultivars = await response.json();
                    setCultivarLibrary(Array.isArray(cultivars) ? cultivars : []);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des cultivars:', error);
            }
        };
        loadCultivars();

        const loadReviews = async () => {
            try {
                const response = await fetch('/api/reviews/my', { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    const all = Array.isArray(data) ? data : (data.reviews || []);
                    setUserReviews(all.filter(r => r.type === 'Fleurs' || r.productType === 'flower'));
                }
            } catch (error) {
                console.error('Erreur lors du chargement des reviews:', error);
            }
        };
        loadReviews();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-load tree from ?tree= query param (e.g. navigating from library)
    useEffect(() => {
        const treeId = searchParams.get('tree');
        if (treeId && treeId !== store.selectedTreeId) {
            store.loadTree(treeId);
        }
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelectTree = async (treeId) => {
        if (treeId && treeId !== store.selectedTreeId) {
            await store.loadTree(treeId);
        }
    };

    const handleEditTree = (tree, e) => {
        e?.stopPropagation();
        store.openTreeForm(tree);
    };

    const handleDeleteTreeRequest = (tree, e) => {
        e?.stopPropagation();
        setConfirmDeleteTree({ open: true, treeId: tree.id, treeName: tree.name, flowerReviews: tree._count?.flowerReviews || 0 });
    };

    const confirmDeleteTreeNow = async () => {
        const { treeId } = confirmDeleteTree;
        setConfirmDeleteTree({ open: false, treeId: null, treeName: '', flowerReviews: 0 });
        if (!treeId) return;
        await store.deleteTree(treeId);
    };

    const toggleGroup = (groupName) => {
        const next = new Set(expandedGroups);
        next.has(groupName) ? next.delete(groupName) : next.add(groupName);
        setExpandedGroups(next);
    };

    // Extrait la première photo d'une review (même logique que Genetiques.jsx)
    const getFirstReviewImage = (review) => {
        const imgs = review?.images;
        const first = Array.isArray(imgs)
            ? imgs[0]
            : (typeof imgs === 'string' ? (() => { try { return JSON.parse(imgs)?.[0] } catch { return null } })() : null);
        if (!first) return null;
        return getImageUrl(first);
    };

    // Format de payload attendu par UnifiedGeneticsCanvas.handleDrop (id, name/cultivarName,
    // genetics, image, _source, reviewId)
    const handleDragStart = (e, item) => {
        const dragPayload = {
            id: item.id,
            name: item.name || item.cultivarName || item.holderName,
            cultivarName: item.name || item.cultivarName || item.holderName,
            genetics: item.genetics || null,
            image: item._source === 'library' ? (item.image || null) : getFirstReviewImage(item),
            _source: item._source || 'library',
            reviewId: item._source === 'review' ? item.id : undefined
        };
        e.dataTransfer.setData('application/json', JSON.stringify(dragPayload));
        e.dataTransfer.effectAllowed = 'copy';
    };

    // Cultivars filtrés (recherche) puis groupés pour la sidebar
    const groupedCultivars = useMemo(() => {
        const q = cultivarSearch.trim().toLowerCase();
        const filtered = q
            ? cultivarLibrary.filter(c => c.name?.toLowerCase().includes(q) || c.breeder?.toLowerCase().includes(q))
            : cultivarLibrary;
        const groups = {};
        filtered.forEach(c => {
            const group = c.group || 'Non classé';
            if (!groups[group]) groups[group] = [];
            groups[group].push(c);
        });
        return groups;
    }, [cultivarLibrary, cultivarSearch]);

    const filteredTrees = useMemo(() => {
        const q = treeSearch.trim().toLowerCase();
        if (!q) return store.trees;
        return store.trees.filter(t => t.name?.toLowerCase().includes(q));
    }, [store.trees, treeSearch]);

    // ── Actions d'arbre (reprises de TreeToolbar.jsx, désormais ancrées au-dessus du canvas
    //    plutôt qu'en panneau flottant dessus) ──────────────────────────────────────────────
    const handleAddRootNode = useCallback(() => {
        store.openNodeForm({
            cultivarName: '',
            position: { x: 0, y: 0 },
            color: '#FF6B9D',
            genetics: null,
            notes: ''
        });
    }, [store]);

    const handleAddEdge = useCallback(() => {
        store.openEdgeForm();
    }, [store]);

    const handleExportJSON = useCallback(() => {
        try {
            const data = {
                tree: { id: store.selectedTreeId, nodes: store.nodes, edges: store.edges },
                exportDate: new Date().toISOString()
            };
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `genetic-tree-${store.selectedTreeId}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export JSON error:', error);
        }
    }, [store.selectedTreeId, store.nodes, store.edges]);

    const handleExportSVG = useCallback(async () => {
        setExporting(true);
        try {
            const viewport = document.querySelector('.react-flow__viewport');
            if (!viewport) throw new Error('Canvas introuvable');
            const dataUrl = await toSvg(viewport, { backgroundColor: '#07070f' });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `genetic-tree-${store.selectedTreeId}.svg`;
            a.click();
        } catch (error) {
            console.error('Export SVG error:', error);
        } finally {
            setExporting(false);
        }
    }, [store.selectedTreeId]);

    const isLoading = store.treeLoading && store.trees.length === 0;
    const activeTree = store.trees.find(t => t.id === store.selectedTreeId);

    return (
        // h-full (pas h-screen) : la page est déjà nichée dans un <main> dimensionné exactement
        // au viewport moins le nav fixe (voir Layout.jsx isFullScreenAppRoute) — un h-screen ici
        // en plus ferait déborder le total de la hauteur du nav, remettant un scroll de page.
        <div className="h-full bg-[#07070f] flex flex-col">
            {/* Header */}
            <header className="h-16 bg-white/[0.02] border-b border-white/10 px-3 sm:px-6 flex items-center justify-between backdrop-blur-xl flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-white/50 hover:text-white transition-colors"
                        title="Retour"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        🌿 PhenoHunt
                    </h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <LiquidButton
                        onClick={() => store.openTreeForm(null)}
                        variant="primary"
                        size="sm"
                        icon={Plus}
                    >
                        <span className="hidden sm:inline">Nouvel arbre</span>
                    </LiquidButton>

                    <button
                        onClick={() => activeTree && store.openTreeForm(activeTree)}
                        disabled={!activeTree}
                        className="p-1.5 text-white/50 hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:hover:text-white/50"
                        title={activeTree ? `Paramètres de "${activeTree.name}"` : 'Sélectionnez un arbre'}
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setMobileSidebarOpen(o => !o)}
                        className="md:hidden p-1.5 text-white/50 hover:text-emerald-400 transition-colors"
                        title="Bibliothèque"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-white/50">
                            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
                            <p>Chargement...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {mobileSidebarOpen && (
                            <div
                                className="fixed inset-0 bg-black/60 z-30 md:hidden"
                                onClick={() => setMobileSidebarOpen(false)}
                            />
                        )}

                        {/* Sidebar */}
                        <aside className={`
                            flex-col overflow-hidden bg-white/[0.02] border-r border-white/10
                            hidden md:flex md:w-80 md:flex-shrink-0
                            ${mobileSidebarOpen ? '!flex fixed left-0 top-16 bottom-0 w-72 z-40' : ''}
                        `}>
                            <div className="flex-1 overflow-y-auto">
                                {/* Liste des arbres */}
                                <div className="p-4 border-b border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-white/40 uppercase font-semibold tracking-wider">
                                            Mes arbres ({store.trees.length})
                                        </p>
                                    </div>
                                    {store.trees.length > 3 && (
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher un arbre..."
                                                value={treeSearch}
                                                onChange={(e) => setTreeSearch(e.target.value)}
                                                className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-500/50"
                                            />
                                        </div>
                                    )}

                                    {filteredTrees.length === 0 ? (
                                        <p className="text-sm text-white/30 italic py-2">
                                            {store.trees.length === 0 ? 'Aucun arbre — créez-en un pour commencer' : 'Aucun résultat'}
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredTrees.map(tree => (
                                                <LiquidCard
                                                    key={tree.id}
                                                    glow="none"
                                                    padding="sm"
                                                    onClick={() => handleSelectTree(tree.id)}
                                                    className={`cursor-pointer group transition-colors ${store.selectedTreeId === tree.id
                                                        ? 'border-emerald-500/50 bg-emerald-500/10'
                                                        : 'hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                            <Dna className="w-4 h-4 text-emerald-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-semibold truncate ${store.selectedTreeId === tree.id ? 'text-emerald-300' : 'text-white'}`}>
                                                                {tree.name}
                                                            </p>
                                                            <p className="text-[11px] text-white/40">
                                                                {tree._count?.nodes ?? 0} nœuds • {tree._count?.edges ?? 0} liaisons
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                            <button
                                                                onClick={(e) => handleEditTree(tree, e)}
                                                                className="p-1.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                                                                title="Renommer / éditer"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteTreeRequest(tree, e)}
                                                                className="p-1.5 rounded-lg text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </LiquidCard>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Mes reviews Fleurs (glisser sur le canvas) */}
                                <div className="border-b border-white/10">
                                    <button
                                        onClick={() => setReviewsOpen(o => !o)}
                                        className="w-full flex items-center gap-2 p-4 hover:bg-white/5 transition-colors text-white/70 text-xs uppercase font-semibold tracking-wider"
                                    >
                                        {reviewsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                        <FileText className="w-3.5 h-3.5 text-emerald-400/70" />
                                        Mes reviews Fleurs ({userReviews.length})
                                    </button>
                                    {reviewsOpen && (
                                        <div className="px-4 pb-4 space-y-1.5">
                                            {userReviews.length === 0 ? (
                                                <p className="text-xs text-white/30 italic">Aucune fiche technique fleur</p>
                                            ) : (
                                                userReviews.map(review => (
                                                    <div
                                                        key={review.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, { ...review, _source: 'review' })}
                                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-white/70 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 cursor-grab active:cursor-grabbing transition-colors"
                                                    >
                                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                            {getFirstReviewImage(review) ? (
                                                                <img
                                                                    src={getFirstReviewImage(review)}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                                />
                                                            ) : null}
                                                            <Leaf className="w-3 h-3 text-emerald-400/60" style={getFirstReviewImage(review) ? { display: 'none' } : undefined} />
                                                        </div>
                                                        <span className="truncate">{review.holderName || review.name || 'Sans nom'}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Bibliothèque de cultivars */}
                                <div>
                                    <button
                                        onClick={() => setCultivarsOpen(o => !o)}
                                        className="w-full flex items-center gap-2 p-4 hover:bg-white/5 transition-colors text-white/70 text-xs uppercase font-semibold tracking-wider"
                                    >
                                        {cultivarsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                        <Leaf className="w-3.5 h-3.5 text-emerald-400/70" />
                                        Bibliothèque cultivars ({cultivarLibrary.length})
                                    </button>
                                    {cultivarsOpen && (
                                        <div className="px-4 pb-4 space-y-3">
                                            {cultivarLibrary.length > 3 && (
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                                                    <input
                                                        type="text"
                                                        placeholder="Rechercher un cultivar..."
                                                        value={cultivarSearch}
                                                        onChange={(e) => setCultivarSearch(e.target.value)}
                                                        className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-500/50"
                                                    />
                                                </div>
                                            )}
                                            {Object.keys(groupedCultivars).length === 0 ? (
                                                <p className="text-xs text-white/30 italic">
                                                    {cultivarLibrary.length === 0 ? 'Aucun cultivar disponible' : 'Aucun résultat'}
                                                </p>
                                            ) : (
                                                Object.entries(groupedCultivars).map(([groupName, cultivars]) => (
                                                    <div key={groupName} className="space-y-1">
                                                        <button
                                                            onClick={() => toggleGroup(groupName)}
                                                            className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/60 text-xs font-medium"
                                                        >
                                                            {expandedGroups.has(groupName)
                                                                ? <ChevronDown className="w-3.5 h-3.5" />
                                                                : <ChevronRight className="w-3.5 h-3.5" />
                                                            }
                                                            <FolderOpen className="w-3.5 h-3.5 text-emerald-400/60" />
                                                            {groupName} ({cultivars.length})
                                                        </button>
                                                        {expandedGroups.has(groupName) && (
                                                            <div className="ml-5 space-y-1">
                                                                {cultivars.map(c => (
                                                                    <div
                                                                        key={c.id}
                                                                        draggable
                                                                        onDragStart={(e) => handleDragStart(e, { ...c, _source: 'library' })}
                                                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-white/70 hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors"
                                                                    >
                                                                        {c.image ? (
                                                                            <img
                                                                                src={getImageUrl(c.image)}
                                                                                alt=""
                                                                                className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                                            />
                                                                        ) : null}
                                                                        <Leaf className="w-3 h-3 text-emerald-400/50 flex-shrink-0" style={c.image ? { display: 'none' } : undefined} />
                                                                        <span className="truncate">{c.name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>

                        {/* Canvas */}
                        {store.selectedTreeId ? (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Bande d'outils ancrée au-dessus du canvas — remplace l'ancien panneau
                                    flottant TreeToolbar (retiré du canvas lui-même) */}
                                <div className="flex items-center gap-1 px-3 py-2 bg-white/[0.02] border-b border-white/10 flex-shrink-0 overflow-x-auto">
                                    <button
                                        onClick={handleAddRootNode}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
                                        title="Ajouter un individu sans fiche technique liée (ex: parent externe, landrace, ruderalis...) — sa génétique se renseigne à la main dans le formulaire"
                                    >
                                        <Sprout className="w-3.5 h-3.5" /> Individu inconnu
                                    </button>
                                    <button
                                        onClick={handleAddEdge}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
                                        title="Créer une relation manuellement"
                                    >
                                        <Link2 className="w-3.5 h-3.5" /> Relation
                                    </button>
                                    <div className="w-px h-5 bg-white/10 mx-1 flex-shrink-0" />
                                    <button
                                        onClick={handleExportJSON}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
                                        title="Exporter en JSON"
                                    >
                                        <Download className="w-3.5 h-3.5" /> JSON
                                    </button>
                                    <button
                                        onClick={handleExportSVG}
                                        disabled={exporting}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 flex-shrink-0"
                                        title="Exporter en SVG"
                                    >
                                        {exporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />} SVG
                                    </button>

                                    <div className="flex-1" />
                                    <div className="flex items-center gap-2 text-xs text-white/40 flex-shrink-0 pr-1">
                                        <GitBranch className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[160px]">{activeTree?.name}</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <ReactFlowProvider>
                                        <UnifiedGeneticsCanvas treeId={store.selectedTreeId} />
                                    </ReactFlowProvider>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-transparent">
                                <div className="text-center text-white/50">
                                    <Dna className="w-12 h-12 mx-auto mb-3 text-white/20" />
                                    <p className="text-lg font-medium mb-2 text-white/70">Aucun arbre sélectionné</p>
                                    <p className="text-sm mb-4">Créez ou ouvrez un arbre pour commencer</p>
                                    <LiquidButton
                                        onClick={() => store.openTreeForm(null)}
                                        variant="primary"
                                        size="sm"
                                        icon={Plus}
                                    >
                                        Créer un nouvel arbre
                                    </LiquidButton>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {store.showTreeForm && (
                <TreeFormModal isEdit={!!store.treeFormData?.id} onClose={store.closeTreeForm} />
            )}

            <ConfirmModal
                open={confirmDeleteTree.open}
                title="Supprimer cet arbre"
                message={
                    confirmDeleteTree.flowerReviews > 0
                        ? `Supprimer "${confirmDeleteTree.treeName}" ? ${confirmDeleteTree.flowerReviews} fiche(s) technique(s) liée(s) perdront leur rattachement à cet arbre. Tous les nœuds et liaisons seront supprimés.`
                        : `Supprimer "${confirmDeleteTree.treeName}" ? Tous ses nœuds et liaisons seront supprimés.`
                }
                confirmLabel="Supprimer"
                onCancel={() => setConfirmDeleteTree({ open: false, treeId: null, treeName: '', flowerReviews: 0 })}
                onConfirm={confirmDeleteTreeNow}
            />
        </div>
    );
}
