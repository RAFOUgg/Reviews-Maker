import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import useGeneticsStore from '../../store/useGeneticsStore';
import UnifiedGeneticsCanvas from '../../components/genetics/UnifiedGeneticsCanvas';
import { Plus, Settings, Home, Leaf, FolderOpen, ChevronDown, ChevronRight, GitBranch } from 'lucide-react';

/**
 * PhenoHuntPage - Page principale du module PhenoHunt
 * 
 * Migré depuis usePhenoHuntStore (localStorage) vers useGeneticsStore (backend /api/genetics)
 * Utilise UnifiedGeneticsCanvas à la place de CanevasPhenoHunt
 */
export default function PhenoHuntPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const store = useGeneticsStore();

    const [cultivarLibrary, setCultivarLibrary] = useState([]);
    const [showNewTreeModal, setShowNewTreeModal] = useState(false);
    const [newTreeName, setNewTreeName] = useState('');
    const [newTreeDesc, setNewTreeDesc] = useState('');
    const [expandedGroups, setExpandedGroups] = useState(new Set());

    // Charger les arbres depuis le backend + la bibliothèque de cultivars
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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-load tree from ?tree= query param (e.g. navigating from library)
    useEffect(() => {
        const treeId = searchParams.get('tree');
        if (treeId && treeId !== store.selectedTreeId) {
            store.loadTree(treeId);
        }
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelectTree = async (treeId) => {
        if (treeId) {
            await store.loadTree(treeId);
        }
    };

    const handleCreateNewTree = async () => {
        if (!newTreeName.trim()) {
            alert("Veuillez entrer un nom pour l'arbre");
            return;
        }
        const result = await store.createTree({
            name: newTreeName,
            description: newTreeDesc,
            projectType: 'phenohunt'
        });
        if (result?.data) {
            setNewTreeName('');
            setNewTreeDesc('');
            setShowNewTreeModal(false);
            await store.loadTree(result.data.id);
        }
    };

    const toggleGroup = (groupName) => {
        const next = new Set(expandedGroups);
        next.has(groupName) ? next.delete(groupName) : next.add(groupName);
        setExpandedGroups(next);
    };

    // Cultivars groupés pour la sidebar
    const groupedCultivars = useMemo(() => {
        const groups = {};
        cultivarLibrary.forEach(c => {
            const group = c.group || 'Non classé';
            if (!groups[group]) groups[group] = [];
            groups[group].push(c);
        });
        return groups;
    }, [cultivarLibrary]);

    const isLoading = store.treeLoading && store.trees.length === 0;
    const selectedTreeName = store.trees.find(t => t.id === store.selectedTreeId)?.name;

    return (
        <div className="h-screen bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="h-16 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-emerald-500/20 px-6 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        title="Retour"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">🌿 PhenoHunt</h1>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowNewTreeModal(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvel arbre
                    </button>

                    <div className="w-px h-6 bg-slate-600" />

                    {/* Tree Selector */}
                    {store.trees.length > 0 && (
                        <select
                            value={store.selectedTreeId || ''}
                            onChange={(e) => handleSelectTree(e.target.value)}
                            className="px-3 py-1.5 bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:outline-none focus:border-emerald-400"
                        >
                            <option value="">Choisir un arbre...</option>
                            {store.trees.map(tree => (
                                <option key={tree.id} value={tree.id}>
                                    {tree.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <button
                        className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Paramètres"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-slate-400">
                            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
                            <p>Chargement...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Sidebar */}
                        <aside className="w-80 flex-shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-emerald-500/20 flex flex-col shadow-2xl overflow-hidden">
                            {/* Sidebar Header */}
                            <div className="p-6 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 to-transparent">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Leaf className="w-6 h-6 text-emerald-400" />
                                    PhénoHunt
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">Gestion généalogique</p>
                            </div>

                            {/* Arbre actif */}
                            {store.selectedTreeId && selectedTreeName && (
                                <div className="px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                                    <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                                        <GitBranch className="w-4 h-4" />
                                        {selectedTreeName}
                                    </h3>
                                </div>
                            )}

                            {/* Liste des arbres */}
                            {store.trees.length > 0 && (
                                <div className="p-4 border-b border-slate-700/50">
                                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-2">Mes arbres</p>
                                    <div className="space-y-1">
                                        {store.trees.map(tree => (
                                            <button
                                                key={tree.id}
                                                onClick={() => handleSelectTree(tree.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${store.selectedTreeId === tree.id
                                                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                                                    : 'text-slate-300 hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                {tree.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bibliothèque de cultivars */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-4 space-y-3">
                                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Bibliothèque cultivars</p>
                                    {Object.keys(groupedCultivars).length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">Aucun cultivar disponible</p>
                                    ) : (
                                        Object.entries(groupedCultivars).map(([groupName, cultivars]) => (
                                            <div key={groupName} className="space-y-1">
                                                <button
                                                    onClick={() => toggleGroup(groupName)}
                                                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 text-sm font-medium"
                                                >
                                                    {expandedGroups.has(groupName)
                                                        ? <ChevronDown className="w-4 h-4" />
                                                        : <ChevronRight className="w-4 h-4" />
                                                    }
                                                    <FolderOpen className="w-4 h-4 text-emerald-400/70" />
                                                    {groupName} ({cultivars.length})
                                                </button>
                                                {expandedGroups.has(groupName) && (
                                                    <div className="ml-6 space-y-1">
                                                        {cultivars.map(c => (
                                                            <div
                                                                key={c.id}
                                                                draggable
                                                                onDragStart={(e) => {
                                                                    e.dataTransfer.effectAllowed = 'copy';
                                                                    e.dataTransfer.setData('application/json', JSON.stringify(c));
                                                                }}
                                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700/40 cursor-grab active:cursor-grabbing transition-colors"
                                                            >
                                                                <Leaf className="w-3 h-3 text-emerald-400/60 flex-shrink-0" />
                                                                <span className="truncate">{c.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </aside>

                        {/* Canvas */}
                        {store.selectedTreeId ? (
                            <div className="flex-1 overflow-hidden">
                                <ReactFlowProvider>
                                    <UnifiedGeneticsCanvas treeId={store.selectedTreeId} />
                                </ReactFlowProvider>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-slate-900">
                                <div className="text-center text-slate-400">
                                    <p className="text-lg font-medium mb-2">Aucun arbre sélectionné</p>
                                    <p className="text-sm mb-4">Créez ou ouvrez un arbre pour commencer</p>
                                    <button
                                        onClick={() => setShowNewTreeModal(true)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-2 inline" />
                                        Créer un nouvel arbre
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal : Nouvel arbre */}
            {showNewTreeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-emerald-500/20 rounded-xl p-6 w-96 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Créer un nouvel arbre</h2>

                        <input
                            type="text"
                            value={newTreeName}
                            onChange={(e) => setNewTreeName(e.target.value)}
                            placeholder="Nom de l'arbre généalogique"
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-emerald-400 mb-3"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateNewTree()}
                            autoFocus
                        />
                        <input
                            type="text"
                            value={newTreeDesc}
                            onChange={(e) => setNewTreeDesc(e.target.value)}
                            placeholder="Description (optionnel)"
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-emerald-400 mb-4"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowNewTreeModal(false);
                                    setNewTreeName('');
                                    setNewTreeDesc('');
                                }}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateNewTree}
                                disabled={store.treeLoading}
                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                                {store.treeLoading ? 'Création...' : 'Créer'}
                            </button>
                        </div>
                        {store.treeError && (
                            <p className="mt-3 text-sm text-red-400">{store.treeError}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
