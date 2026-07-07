/**
 * CultivarsTab.jsx - Onglet Arbres Généalogiques de la Bibliothèque (Producteur uniquement)
 *
 * Liste les arbres généalogiques (PhenoHunt) de l'utilisateur, permet d'en créer et d'y accéder
 * via l'éditeur dédié (/phenohunt). Modelé sur ProductionChainTab.jsx.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../components/shared/ToastContainer'
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI'
import ConfirmModal from '../../../components/shared/ConfirmModal'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2, Edit, Dna, ExternalLink, RefreshCw } from 'lucide-react'
import useGeneticsStore from '../../../store/useGeneticsStore'

// Types de projet d'arbre généalogique — badge coloré en haut à droite de la carte, mappé sur
// GeneticTree.projectType côté Prisma.
const TREE_TYPES = {
    phenohunt: { label: 'PhenoHunt', color: 'purple' },
    selection: { label: 'Sélection', color: 'green' },
    crossing: { label: 'Croisement', color: 'amber' },
    hunt: { label: 'Hunt', color: 'cyan' },
}

function formatTreeDate(iso) {
    if (!iso) return null
    try {
        return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
        return null
    }
}

export default function CultivarsTab() {
    const toast = useToast()
    const navigate = useNavigate()
    const [confirmDeleteTree, setConfirmDeleteTree] = useState({ open: false, treeId: null })

    const {
        trees,
        treeLoading: treesLoading,
        fetchTrees,
        createTree,
        deleteTree: deleteTreeApi,
        loadTree
    } = useGeneticsStore()

    useEffect(() => {
        fetchTrees()
    }, [])

    const handleCreateTree = async () => {
        try {
            const result = await createTree({
                name: `Arbre Généalogique ${trees.length + 1}`,
                description: 'Créé depuis la bibliothèque',
                projectType: 'selection'
            })
            if (result?.data) {
                await loadTree(result.data.id)
                navigate('/phenohunt')
            }
        } catch (error) {
            toast.error('Erreur lors de la création de l\'arbre')
        }
    }

    const handleDeleteTree = (treeId, e) => {
        e?.stopPropagation()
        setConfirmDeleteTree({ open: true, treeId })
    }

    const confirmDeleteTreeNow = async () => {
        const treeId = confirmDeleteTree.treeId
        setConfirmDeleteTree({ open: false, treeId: null })
        if (!treeId) return
        await deleteTreeApi(treeId)
        toast.success('Arbre supprimé')
    }

    const renderTreeCard = (tree, index) => {
        const typeConfig = TREE_TYPES[tree.projectType] || TREE_TYPES.phenohunt
        const nodesCount = tree._count?.nodes ?? tree.nodes?.length ?? 0
        const edgesCount = tree._count?.edges ?? tree.edges?.length ?? 0
        const dateLabel = formatTreeDate(tree.updatedAt || tree.createdAt)

        return (
            <motion.div
                key={tree.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
            >
                <LiquidCard
                    glow="none"
                    padding="md"
                    className="hover:border-violet-500/30 transition-all cursor-pointer group"
                    onClick={() => navigate(`/phenohunt?tree=${tree.id}`)}
                >
                    <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-${typeConfig.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                            <Dna className={`w-6 h-6 text-${typeConfig.color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{tree.name}</h3>
                            <p className="text-sm text-white/50 truncate">{tree.description || 'Aucune description'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400 text-xs font-bold`}>
                            {typeConfig.label}
                        </span>
                    </div>

                    {/* Stats rapides */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        <div className="px-2 py-1 bg-white/5 rounded text-white/60">
                            🌿 {nodesCount} nœud{nodesCount > 1 ? 's' : ''}
                        </div>
                        <div className="px-2 py-1 bg-white/5 rounded text-white/60">
                            🔗 {edgesCount} lien{edgesCount > 1 ? 's' : ''}
                        </div>
                        {dateLabel && (
                            <div className="px-2 py-1 bg-white/5 rounded text-white/60 col-span-2">
                                📅 {dateLabel}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <LiquidButton
                            onClick={(e) => { e.stopPropagation(); navigate(`/phenohunt?tree=${tree.id}`) }}
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            className="flex-1"
                        >
                            Ouvrir
                        </LiquidButton>
                        <LiquidButton
                            onClick={(e) => handleDeleteTree(tree.id, e)}
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            className="hover:!text-red-400"
                        />
                    </div>
                </LiquidCard>
            </motion.div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Dna className="w-5 h-5 text-violet-400" />
                            Arbres généalogiques
                        </h2>
                        <p className="text-sm text-white/50 mt-1">
                            Construisez et éditez vos lignées dans l'éditeur PhenoHunt complet
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <LiquidButton onClick={() => navigate('/phenohunt')} variant="ghost" icon={ExternalLink}>
                            Ouvrir PhenoHunt
                        </LiquidButton>
                        <LiquidButton onClick={handleCreateTree} variant="primary" icon={Plus}>
                            Nouvel arbre
                        </LiquidButton>
                    </div>
                </div>

                {treesLoading ? (
                    <div className="text-center py-16">
                        <RefreshCw className="w-8 h-8 animate-spin text-violet-400 mx-auto" />
                    </div>
                ) : trees.length === 0 ? (
                    <LiquidCard glow="none" padding="lg" className="text-center py-16">
                        <Dna className="w-12 h-12 mx-auto text-white/20 mb-4" />
                        <p className="text-white/50">Aucun arbre généalogique pour le moment</p>
                        <p className="text-xs text-white/30 mt-1">Créez-en un pour construire vos lignées</p>
                    </LiquidCard>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {trees.map((tree, index) => renderTreeCard(tree, index))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            <ConfirmModal
                open={confirmDeleteTree.open}
                title="Supprimer cet arbre"
                message={(() => {
                    const tree = trees.find(t => t.id === confirmDeleteTree.treeId)
                    const count = tree?._count?.flowerReviews || 0
                    return count > 0
                        ? `Cet arbre est lié à ${count} review${count > 1 ? 's' : ''}. La suppression déliera ces reviews (elles resteront intactes mais perdront leur généalogie). Continuer ?`
                        : 'Supprimer cet arbre généalogique ? Cette action est irréversible.'
                })()}
                confirmLabel="Supprimer"
                onCancel={() => setConfirmDeleteTree({ open: false, treeId: null })}
                onConfirm={confirmDeleteTreeNow}
            />
        </>
    )
}
