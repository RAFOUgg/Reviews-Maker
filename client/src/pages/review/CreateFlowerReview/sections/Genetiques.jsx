import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Info, Plus, Trash2, Edit2, FileText, FolderTree, Upload } from 'lucide-react'
import { ReactFlowProvider } from 'reactflow'
import LiquidCard from '../../../../components/ui/LiquidCard'
import PhenoCodeGenerator from '../../../../components/forms/helpers/PhenoCodeGenerator'
import UnifiedGeneticsCanvas from '../../../../components/genetics/UnifiedGeneticsCanvas'
import useGeneticsStore from '../../../../store/useGeneticsStore'
import { useStore } from '../../../../store/useStore'

export default function Genetiques({ formData, handleChange }) {
    const [showInitialModal, setShowInitialModal] = useState(true) // Modal de choix initial
    const [activeTab, setActiveTab] = useState('cultivars')
    const [activeTreeTab, setActiveTreeTab] = useState(0)
    const [trees, setTrees] = useState([])
    const [userReviews, setUserReviews] = useState([]) // Reviews fleurs de l'utilisateur
    const [loading, setLoading] = useState(false)

    const genetics = formData.genetics || {}
    const { user } = useStore()
    const geneticsStore = useGeneticsStore()

    const selectedNode = geneticsStore.selectedNodeId
        ? geneticsStore.nodes.find(n => n.id === geneticsStore.selectedNodeId)
        : null

    // Charger les reviews fleurs de l'utilisateur
    useEffect(() => {
        if (user?.id) {
            fetchUserFlowerReviews()
        }
    }, [user?.id])

    const fetchUserFlowerReviews = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/reviews?userId=${user.id}&type=flower`)
            if (response.ok) {
                const data = await response.json()
                setUserReviews(data.reviews || [])
            }
        } catch (error) {
            console.error('Error fetching reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    // Actions du modal initial
    const handleCreateEmptyTree = () => {
        const newTree = {
            id: Date.now(),
            name: 'Nouvel Arbre',
            nodes: [],
            edges: [],
            createdAt: new Date().toISOString()
        }
        setTrees([newTree])
        setActiveTreeTab(0)
        setShowInitialModal(false)
    }

    const handleCreateTreeFromCurrentFlower = () => {
        const currentFlowerData = {
            id: `node-${Date.now()}`,
            type: 'cultivar',
            position: { x: 250, y: 200 },
            data: {
                cultivarName: formData.generalInfo?.commercialName || 'Nouvelle Fleur',
                breeder: formData.genetics?.breeder || '',
                type: formData.genetics?.type || '',
                photoUrl: formData.generalInfo?.photos?.[0] || null,
                reviewId: formData.id || null
            }
        }

        const newTree = {
            id: Date.now(),
            name: `Arbre - ${currentFlowerData.data.cultivarName}`,
            nodes: [currentFlowerData],
            edges: [],
            createdAt: new Date().toISOString()
        }

        setTrees([newTree])
        setActiveTreeTab(0)
        setShowInitialModal(false)
    }

    const handleImportToExistingTree = () => {
        // TODO: Afficher modal de sélection d'arbre existant
        setShowInitialModal(false)
    }

    const addNewTree = () => {
        const newTree = {
            id: Date.now(),
            name: `Arbre ${trees.length + 1}`,
            nodes: [],
            edges: [],
            createdAt: new Date().toISOString()
        }
        setTrees([...trees, newTree])
        setActiveTreeTab(trees.length)
    }

    const deleteTree = (index) => {
        if (trees.length === 1) return
        setTrees(trees.filter((_, i) => i !== index))
        setActiveTreeTab(Math.max(0, index - 1))
    }

    // Drag & Drop handler pour reviews
    const handleDragStart = (e, review) => {
        e.dataTransfer.setData('reviewData', JSON.stringify(review))
        e.dataTransfer.effectAllowed = 'copy'
    }

    return (
        <LiquidCard title="🧬 Génétiques & Arbre Généalogique" bordered>
            {/* MODAL INITIAL DE CHOIX */}
            <AnimatePresence>
                {showInitialModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowInitialModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <FolderTree className="w-6 h-6 text-purple-600" />
                                Gestion de l'Arbre Généalogique
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Comment souhaitez-vous procéder avec cette fiche technique ?
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCreateEmptyTree}
                                    className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg hover:border-purple-400 transition-all text-left group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-600 text-white rounded-lg group-hover:scale-110 transition-transform">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">Créer un arbre vide</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                Commencez un nouvel arbre généalogique depuis zéro
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={handleCreateTreeFromCurrentFlower}
                                    className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:border-blue-400 transition-all text-left group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-600 text-white rounded-lg group-hover:scale-110 transition-transform">
                                            <Leaf className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">Créer un arbre à partir de cette fleur</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                Utilisez cette fiche comme point de départ de l'arbre
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={handleImportToExistingTree}
                                    className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg hover:border-green-400 transition-all text-left group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-600 text-white rounded-lg group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">Importer cette fleur à un arbre</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                Ajoutez cette fiche à un arbre existant
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowInitialModal(false)}
                                className="w-full mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                            >
                                Annuler
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-4 h-[700px]">
                {/* SIDEBAR GAUCHE */}
                <div className="w-80 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
                    {/* Onglets Cultivars / Projets */}
                    <div className="flex border-b border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20">
                        <button
                            onClick={() => setActiveTab('cultivars')}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'cultivars'
                                ? 'bg-purple-600 text-white border-b-2 border-purple-600'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Cultivars
                        </button>
                        <button
                            onClick={() => setActiveTab('projets')}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'projets'
                                ? 'bg-purple-600 text-white border-b-2 border-purple-600'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Chargement...</p>
                                        </div>
                                    ) : userReviews.length === 0 ? (
                                        <div className="text-center py-8">
                                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Aucune fiche technique fleur
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                Créez une fiche pour la voir ici
                                            </p>
                                        </div>
                                    ) : (
                                        userReviews.map((review) => (
                                            <div
                                                key={review.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, review)}
                                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 flex items-center gap-3 cursor-move hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition-all"
                                            >
                                                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {review.generalInfo?.photos?.[0] ? (
                                                        <img
                                                            src={review.generalInfo.photos[0]}
                                                            alt={review.generalInfo.commercialName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Leaf className="w-8 h-8 text-purple-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                        {review.generalInfo?.commercialName || 'Sans nom'}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                        {review.genetics?.variety || 'Variété non définie'}
                                                    </p>
                                                    {review.genetics?.breeder && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                                            {review.genetics.breeder}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            // TODO: Open review edit
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 text-blue-600" />
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
                                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                                        Vos projets PhenoHunt apparaîtront ici
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* CANVAS PRINCIPAL */}
                <div className="flex-1 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                    {/* Onglets des arbres */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-950 dark:to-black px-4 border-b border-gray-700">
                        {trees.map((tree, index) => (
                            <div
                                key={tree.id}
                                className={`group flex items-center gap-2 px-4 py-3 cursor-pointer transition-all ${activeTreeTab === index
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t-2 border-purple-500'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                                onClick={() => setActiveTreeTab(index)}
                            >
                                <span className="text-sm font-medium">{tree.name}</span>
                                {trees.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteTree(index)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500 rounded transition-all"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={addNewTree}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-all"
                            title="Ajouter un nouvel arbre"
                        >
                            <Plus className="w-4 h-4" />
                        </button>

                        {/* Link icon à droite */}
                        <div className="ml-auto">
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-gray-950">
                        <ReactFlowProvider>
                            <UnifiedGeneticsCanvas
                                treeId={trees[activeTreeTab]?.id}
                                readOnly={false}
                            />
                        </ReactFlowProvider>

                        {/* Info overlay si pas de nœuds */}
                        {(!trees[activeTreeTab]?.nodes || trees[activeTreeTab].nodes.length === 0) && (
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
                            Métadonnées : {selectedNode.data?.cultivarName || 'Cultivar'}
                        </h4>

                        {/* Breeder & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Breeder</label>
                                <input
                                    type="text"
                                    value={selectedNode.data?.breeder || ''}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                    placeholder="DNA Genetics..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Type</label>
                                <select
                                    value={selectedNode.data?.type || ''}
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
                                value={selectedNode.data?.codePheno || ''}
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

