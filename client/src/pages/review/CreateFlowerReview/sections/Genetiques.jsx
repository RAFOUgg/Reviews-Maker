import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Info, Plus, Trash2, Edit2, FileText, FolderTree, Upload, RefreshCw, AlertCircle, Dna } from 'lucide-react'
import { ReactFlowProvider } from 'reactflow'
import { LiquidCard, LiquidChip, LiquidButton, LiquidDivider, LiquidModal } from '@/components/ui/LiquidUI'
import PhenoCodeGenerator from '../../../../components/forms/helpers/PhenoCodeGenerator'
import UnifiedGeneticsCanvas from '../../../../components/genetics/UnifiedGeneticsCanvas'
import useGeneticsStore from '../../../../store/useGeneticsStore'
import { useStore } from '../../../../store/useStore'

/**
 * Section Génétiques & PhenoHunt (Section 2)
 * - Gestion des arbres généalogiques via API
 * - Sidebar avec reviews fleurs de l'utilisateur
 * - Canvas ReactFlow pour visualisation
 */
export default function Genetiques({ formData, handleChange }) {
    const [showInitialModal, setShowInitialModal] = useState(false)
    const [activeTab, setActiveTab] = useState('cultivars')
    const [userReviews, setUserReviews] = useState([])
    const [loadingReviews, setLoadingReviews] = useState(false)
    const [creatingTree, setCreatingTree] = useState(false)

    const { user } = useStore()
    const genetics = formData.genetics || {}

    // Store Zustand pour les arbres généalogiques (API)
    const {
        trees,
        selectedTreeId,
        nodes,
        edges,
        treeLoading,
        treeError,
        canvasLoading,
        selectedNodeId,
        fetchTrees,
        loadTree,
        createTree,
        deleteTree: deleteTreeApi,
        addNode,
        clearTree
    } = useGeneticsStore()

    // Trouver le nœud sélectionné
    const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null

    // Charger les arbres et reviews au montage
    useEffect(() => {
        if (user?.id) {
            fetchTrees()
            fetchUserFlowerReviews()
        }
    }, [user?.id])

    // Charger le premier arbre disponible si aucun n'est sélectionné
    useEffect(() => {
        if (trees.length > 0 && !selectedTreeId && !canvasLoading) {
            loadTree(trees[0].id)
        }
    }, [trees, selectedTreeId])

    // Si pas d'arbres et pas de chargement, proposer d'en créer un
    useEffect(() => {
        if (!treeLoading && trees.length === 0) {
            setShowInitialModal(true)
        }
    }, [treeLoading, trees.length])

    // Charger les reviews fleurs de l'utilisateur pour la sidebar
    const fetchUserFlowerReviews = async () => {
        setLoadingReviews(true)
        try {
            const response = await fetch(`/api/reviews?userId=${user.id}&type=flower`, {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setUserReviews(data.reviews || data || [])
            }
        } catch (error) {
            console.error('Error fetching reviews:', error)
        } finally {
            setLoadingReviews(false)
        }
    }

    // === ACTIONS DU MODAL - CRÉATION D'ARBRES VIA API ===

    const handleCreateEmptyTree = async () => {
        setCreatingTree(true)
        try {
            const result = await createTree({
                name: 'Nouvel Arbre',
                description: 'Arbre généalogique créé depuis une review',
                projectType: 'phenohunt'
            })

            if (result.data) {
                await loadTree(result.data.id)
            }
            setShowInitialModal(false)
        } catch (error) {
            console.error('Error creating tree:', error)
        } finally {
            setCreatingTree(false)
        }
    }

    const handleCreateTreeFromCurrentFlower = async () => {
        setCreatingTree(true)
        try {
            const flowerName = formData.generalInfo?.commercialName || 'Nouvelle Fleur'

            // 1. Créer l'arbre via API
            const treeResult = await createTree({
                name: `Arbre - ${flowerName}`,
                description: `Arbre généalogique pour ${flowerName}`,
                projectType: 'phenohunt'
            })

            if (treeResult.data) {
                // 2. Charger l'arbre créé
                await loadTree(treeResult.data.id)

                // 3. Ajouter le nœud de la fleur actuelle
                await addNode(treeResult.data.id, {
                    cultivarName: flowerName,
                    position: JSON.stringify({ x: 300, y: 200 }),
                    color: '#FF6B9D',
                    genetics: JSON.stringify({
                        breeder: genetics.breeder || '',
                        type: genetics.type || 'hybrid',
                        indicaRatio: genetics.indicaRatio || 50
                    }),
                    notes: `Créé depuis la review`
                })
            }
            setShowInitialModal(false)
        } catch (error) {
            console.error('Error creating tree from flower:', error)
        } finally {
            setCreatingTree(false)
        }
    }

    const handleImportToExistingTree = () => {
        setShowInitialModal(false)
    }

    // Ajouter un nouvel arbre
    const addNewTree = async () => {
        setCreatingTree(true)
        try {
            const result = await createTree({
                name: `Arbre ${trees.length + 1}`,
                projectType: 'phenohunt'
            })
            if (result.data) {
                await loadTree(result.data.id)
            }
        } catch (error) {
            console.error('Error adding tree:', error)
        } finally {
            setCreatingTree(false)
        }
    }

    // Supprimer un arbre
    const deleteTree = async (treeId, e) => {
        e?.stopPropagation()
        if (trees.length <= 1) return
        if (!confirm('Supprimer cet arbre ?')) return

        await deleteTreeApi(treeId)

        // Charger un autre arbre
        const remaining = trees.filter(t => t.id !== treeId)
        if (remaining.length > 0) {
            await loadTree(remaining[0].id)
        }
    }

    // Sélectionner un arbre
    const handleSelectTree = async (treeId) => {
        if (treeId !== selectedTreeId) {
            await loadTree(treeId)
        }
    }

    // Drag & Drop handler pour reviews
    const handleDragStart = (e, review) => {
        e.dataTransfer.setData('reviewData', JSON.stringify(review))
        e.dataTransfer.effectAllowed = 'copy'
    }

    return (
        <LiquidCard glow="purple" padding="lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Dna className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">🧬 Génétiques & Arbre Généalogique</h3>
                    <p className="text-sm text-white/50">Lignée et généalogie des cultivars</p>
                </div>
            </div>

            <LiquidDivider />

            {/* MODAL INITIAL DE CHOIX */}
            <AnimatePresence>
                {showInitialModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => trees.length > 0 && setShowInitialModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
                        >
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FolderTree className="w-6 h-6 text-purple-400" />
                                Gestion de l'Arbre Généalogique
                            </h3>
                            <p className="text-sm text-white/60 mb-6">
                                Comment souhaitez-vous procéder avec cette fiche technique ?
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCreateEmptyTree}
                                    disabled={creatingTree}
                                    className="w-full p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl hover:border-purple-400 transition-all text-left group disabled:opacity-50"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-600 text-white rounded-lg group-hover:scale-110 transition-transform">
                                            {creatingTree ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Créer un arbre vide</p>
                                            <p className="text-xs text-white/50 mt-1">
                                                Commencez un nouvel arbre généalogique depuis zéro
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={handleCreateTreeFromCurrentFlower}
                                    disabled={creatingTree}
                                    className="w-full p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl hover:border-blue-400 transition-all text-left group disabled:opacity-50"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-600 text-white rounded-lg group-hover:scale-110 transition-transform">
                                            {creatingTree ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Leaf className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Créer un arbre à partir de cette fleur</p>
                                            <p className="text-xs text-white/50 mt-1">
                                                Utilisez cette fiche comme point de départ de l'arbre
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                {trees.length > 0 && (
                                    <button
                                        onClick={handleImportToExistingTree}
                                        disabled={creatingTree}
                                        className="w-full p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl hover:border-green-400 transition-all text-left group disabled:opacity-50"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-green-600 text-white rounded-lg group-hover:scale-110 transition-transform">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">Importer cette fleur à un arbre</p>
                                                <p className="text-xs text-white/50 mt-1">
                                                    Ajoutez cette fiche à un arbre existant ({trees.length} arbre{trees.length > 1 ? 's' : ''})
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                )}
                            </div>

                            {trees.length > 0 && (
                                <button
                                    onClick={() => setShowInitialModal(false)}
                                    className="w-full mt-4 px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
                                >
                                    Annuler
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-4 h-[700px] mt-6">
                {/* SIDEBAR GAUCHE */}
                <div className="w-80 flex-shrink-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                    {/* Onglets Cultivars / Projets */}
                    <div className="flex border-b border-white/10 bg-white/5">
                        <button
                            onClick={() => setActiveTab('cultivars')}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'cultivars'
                                ? 'bg-purple-600 text-white border-b-2 border-purple-500'
                                : 'text-white/60 hover:bg-white/10'
                                }`}
                        >
                            Cultivars
                        </button>
                        <button
                            onClick={() => setActiveTab('projets')}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'projets'
                                ? 'bg-purple-600 text-white border-b-2 border-purple-500'
                                : 'text-white/60 hover:bg-white/10'
                                }`}
                        >
                            Projets
                        </button>
                    </div>

                    {/* Contenu Sidebar */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <AnimatePresence mode="wait">
                            {activeTab === 'cultivars' && (
                                <motion.div
                                    key="cultivars"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-3"
                                >
                                    {loadingReviews ? (
                                        <div className="text-center py-8">
                                            <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
                                            <p className="text-sm text-white/50 mt-3">Chargement...</p>
                                        </div>
                                    ) : userReviews.length === 0 ? (
                                        <div className="text-center py-8">
                                            <FileText className="w-12 h-12 mx-auto text-white/30 mb-3" />
                                            <p className="text-sm text-white/50">
                                                Aucune fiche technique fleur
                                            </p>
                                            <p className="text-xs text-white/30 mt-1">
                                                Créez une fiche pour la voir ici
                                            </p>
                                        </div>
                                    ) : (
                                        userReviews.map((review) => (
                                            <div
                                                key={review.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, review)}
                                                className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3 cursor-move hover:shadow-md hover:border-purple-500/50 transition-all"
                                            >
                                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {(review.generalInfo?.photos?.[0] || review.photos?.[0]) ? (
                                                        <img
                                                            src={review.generalInfo?.photos?.[0] || review.photos?.[0]}
                                                            alt={review.generalInfo?.commercialName || review.commercialName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Leaf className="w-8 h-8 text-purple-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {review.generalInfo?.commercialName || review.commercialName || 'Sans nom'}
                                                    </p>
                                                    <p className="text-xs text-white/50 truncate">
                                                        {review.genetics?.variety || review.cultivars || 'Variété non définie'}
                                                    </p>
                                                    {(review.genetics?.breeder || review.farm) && (
                                                        <p className="text-xs text-white/30 truncate">
                                                            {review.genetics?.breeder || review.farm}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            // TODO: Open review edit
                                                        }}
                                                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'projets' && (
                                <motion.div
                                    key="projets"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-3"
                                >
                                    {treeLoading ? (
                                        <div className="text-center py-8">
                                            <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
                                            <p className="text-sm text-white/50 mt-3">Chargement des arbres...</p>
                                        </div>
                                    ) : trees.length === 0 ? (
                                        <div className="text-center py-8">
                                            <FolderTree className="w-12 h-12 mx-auto text-white/30 mb-3" />
                                            <p className="text-sm text-white/50">
                                                Aucun projet PhenoHunt
                                            </p>
                                            <button
                                                onClick={() => setShowInitialModal(true)}
                                                className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                Créer un arbre
                                            </button>
                                        </div>
                                    ) : (
                                        trees.map((tree) => (
                                            <div
                                                key={tree.id}
                                                onClick={() => handleSelectTree(tree.id)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTreeId === tree.id
                                                    ? 'border-purple-500 bg-purple-500/20'
                                                    : 'border-white/10 hover:border-purple-500/50 bg-white/5'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-sm text-white">
                                                            {tree.name}
                                                        </p>
                                                        <p className="text-xs text-white/50">
                                                            {tree._count?.nodes || 0} nœuds • {tree._count?.edges || 0} liens
                                                        </p>
                                                    </div>
                                                    {trees.length > 1 && (
                                                        <button
                                                            onClick={(e) => deleteTree(tree.id, e)}
                                                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* CANVAS PRINCIPAL */}
                <div className="flex-1 flex flex-col border border-white/10 rounded-xl overflow-hidden bg-[#0a0a14]">
                    {/* Onglets des arbres */}
                    <div className="flex items-center gap-2 bg-white/5 px-4 border-b border-white/10">
                        {trees.map((tree) => (
                            <div
                                key={tree.id}
                                className={`group flex items-center gap-2 px-4 py-3 cursor-pointer transition-all ${selectedTreeId === tree.id
                                    ? 'bg-purple-600/30 text-white border-t-2 border-purple-500'
                                    : 'text-white/50 hover:text-white hover:bg-white/10'
                                    }`}
                                onClick={() => handleSelectTree(tree.id)}
                            >
                                <span className="text-sm font-medium">{tree.name}</span>
                                {trees.length > 1 && (
                                    <button
                                        onClick={(e) => deleteTree(tree.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/30 rounded transition-all"
                                    >
                                        <Trash2 className="w-3 h-3 text-red-400" />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={addNewTree}
                            disabled={creatingTree}
                            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all disabled:opacity-50"
                            title="Ajouter un nouvel arbre"
                        >
                            {creatingTree ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </button>

                        {/* Link icon à droite */}
                        <div className="ml-auto">
                            <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 relative bg-gradient-to-br from-[#0a0a14] to-[#121228]">
                        {/* Erreur */}
                        {treeError && (
                            <div className="absolute top-4 left-4 right-4 z-20 bg-red-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm flex-1">Erreur: {treeError}</span>
                                <button
                                    onClick={() => selectedTreeId && loadTree(selectedTreeId)}
                                    className="text-xs underline hover:no-underline"
                                >
                                    Réessayer
                                </button>
                            </div>
                        )}

                        {/* Canvas avec arbre sélectionné */}
                        {selectedTreeId ? (
                            <ReactFlowProvider>
                                <UnifiedGeneticsCanvas
                                    treeId={selectedTreeId}
                                    readOnly={false}
                                />
                            </ReactFlowProvider>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center space-y-3">
                                    <Leaf className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
                                    <p className="text-white/50 text-sm">
                                        {treeLoading ? 'Chargement...' : 'Sélectionnez ou créez un arbre'}
                                    </p>
                                    {!treeLoading && trees.length === 0 && (
                                        <button
                                            onClick={() => setShowInitialModal(true)}
                                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Créer un arbre
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Info overlay si pas de nœuds */}
                        {selectedTreeId && nodes.length === 0 && !canvasLoading && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center space-y-3 opacity-50">
                                    <Leaf className="w-16 h-16 mx-auto text-purple-400" />
                                    <p className="text-white text-sm">
                                        Glissez-déposez des cultivars depuis la sidebar
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SECTION METADATA (si nœud sélectionné) */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg space-y-4"
                    >
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <Edit2 className="w-4 h-4" />
                            Métadonnées : {selectedNode.cultivarName || selectedNode.data?.cultivarName || 'Cultivar'}
                        </h4>

                        {/* Breeder & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Breeder</label>
                                <input
                                    type="text"
                                    defaultValue={selectedNode.genetics?.breeder || selectedNode.data?.breeder || ''}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                    placeholder="DNA Genetics..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Type</label>
                                <select
                                    defaultValue={selectedNode.genetics?.type || selectedNode.data?.type || ''}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="indica">🌙 Indica</option>
                                    <option value="sativa">☀️ Sativa</option>
                                    <option value="hybrid">⚖️ Hybride</option>
                                </select>
                            </div>
                        </div>

                        {/* Genetic Relations Tags */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Relation Généalogique</label>
                            <div className="flex flex-wrap gap-2">
                                {['clone élite', 'seed run', 'selfed (S1)', 'BX1', 'BX2', 'polyhybride'].map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        className="px-3 py-1.5 text-xs rounded-full transition-all bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pheno Code */}
                        <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
                            <PhenoCodeGenerator
                                value={selectedNode.genetics?.phenotypeCode || selectedNode.data?.codePheno || ''}
                                onChange={(code) => { }}
                                userId={user?.id}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </LiquidCard>
    )
}