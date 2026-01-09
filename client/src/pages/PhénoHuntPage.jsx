import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { usePhenoHuntStore } from '../../store/usePhenoHuntStore.js';
import SidebarHierarchique from '../../components/phenohunt/SidebarHierarchique';
import CanevasPhenoHunt from '../../components/phenohunt/CanevasPhenoHunt';
import { Plus, Settings, Download, Upload, Home } from 'lucide-react';

/**
 * PhénoHuntPage - Page principale du module PhénoHunt
 */
export default function PhénoHuntPage() {
    const navigate = useNavigate();
    const {
        phenoTrees,
        activeTreeId,
        createTree,
        setActiveTree,
        setCultivarLibrary,
        loadTree
    } = usePhenoHuntStore();

    const [showNewTreeModal, setShowNewTreeModal] = useState(false);
    const [newTreeName, setNewTreeName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Charger les données au montage
    useEffect(() => {
        const loadData = async () => {
            try {
                // Charger la bibliothèque de cultivars
                const response = await fetch('/api/cultivars');
                if (response.ok) {
                    const cultivars = await response.json();
                    setCultivarLibrary(cultivars);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des cultivars:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [setCultivarLibrary]);

    const handleCreateNewTree = () => {
        if (!newTreeName.trim()) {
            alert('Veuillez entrer un nom pour l\'arbre');
            return;
        }

        const treeId = createTree({
            name: newTreeName,
            description: ''
        });

        setNewTreeName('');
        setShowNewTreeModal(false);
        setActiveTree(treeId);
    };

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
                    <h1 className="text-2xl font-bold text-white">🌿 PhénoHunt</h1>
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
                    {Object.keys(phenoTrees).length > 0 && (
                        <select
                            value={activeTreeId || ''}
                            onChange={(e) => setActiveTree(e.target.value)}
                            className="px-3 py-1.5 bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:outline-none focus:border-emerald-400"
                        >
                            <option value="">Choisir un arbre...</option>
                            {Object.values(phenoTrees).map(tree => (
                                <option key={tree.id} value={tree.id}>
                                    {tree.metadata?.name || 'Sans nom'}
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
                        <div className="w-full md:w-80 flex-shrink-0 overflow-hidden">
                            <SidebarHierarchique />
                        </div>

                        {/* Canvas */}
                        {activeTreeId ? (
                            <div className="flex-1 overflow-hidden">
                                <ReactFlowProvider>
                                    <CanevasPhenoHunt />
                                </ReactFlowProvider>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-slate-900">
                                <div className="text-center text-slate-400">
                                    <p className="text-lg font-medium mb-2">
                                        Aucun arbre sélectionné
                                    </p>
                                    <p className="text-sm mb-4">
                                        Créez ou ouvrez un arbre pour commencer
                                    </p>
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

            {/* New Tree Modal */}
            {showNewTreeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-emerald-500/20 rounded-xl p-6 w-96 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">
                            Créer un nouvel arbre
                        </h2>

                        <input
                            type="text"
                            value={newTreeName}
                            onChange={(e) => setNewTreeName(e.target.value)}
                            placeholder="Nom de l'arbre généalogique"
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-emerald-400 mb-4"
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateNewTree()}
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowNewTreeModal(false);
                                    setNewTreeName('');
                                }}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateNewTree}
                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
