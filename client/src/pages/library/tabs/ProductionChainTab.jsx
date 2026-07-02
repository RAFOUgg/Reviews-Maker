/**
 * ProductionChainTab.jsx - Onglet Chaîne de production de la Bibliothèque (Producteur uniquement)
 *
 * Liste les chaînes de production de l'utilisateur, permet d'en créer et d'y accéder
 * via l'éditeur dédié (ProductionChainEditorPage). Modelé sur l'onglet "Arbres" de
 * CultivarsTab.jsx.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitBranch, Plus, Trash2, RefreshCw, Workflow } from 'lucide-react'
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI'
import ConfirmModal from '../../../components/shared/ConfirmModal'
import { useToast } from '../../../components/shared/ToastContainer'
import useProductionChainStore from '../../../store/useProductionChainStore'

export default function ProductionChainTab() {
    const navigate = useNavigate()
    const toast = useToast()
    const { chains, chainLoading, fetchChains, createChain, deleteChain } = useProductionChainStore()

    const [creating, setCreating] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState({ open: false, chainId: null })

    useEffect(() => {
        fetchChains()
    }, [])

    const handleCreate = async () => {
        setCreating(true)
        try {
            const result = await createChain({ name: `Chaîne ${chains.length + 1}` })
            if (result?.data) {
                navigate(`/library/production-chains/${result.data.id}`)
            } else if (result?.error) {
                toast.error(result.error)
            }
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = (chainId, e) => {
        e.stopPropagation()
        setConfirmDelete({ open: true, chainId })
    }

    const confirmDeleteNow = async () => {
        const chainId = confirmDelete.chainId
        setConfirmDelete({ open: false, chainId: null })
        if (!chainId) return
        await deleteChain(chainId)
        toast.success('Chaîne supprimée')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-emerald-400" />
                        Chaîne de production
                    </h2>
                    <p className="text-sm text-white/50 mt-1">
                        Liez vos fiches techniques entre elles et documentez chaque étape de transformation
                    </p>
                </div>
                <LiquidButton onClick={handleCreate} disabled={creating} variant="primary" icon={creating ? RefreshCw : Plus}>
                    Nouvelle chaîne
                </LiquidButton>
            </div>

            {chainLoading ? (
                <div className="text-center py-16">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                </div>
            ) : chains.length === 0 ? (
                <LiquidCard glow="none" padding="lg" className="text-center py-16">
                    <GitBranch className="w-12 h-12 mx-auto text-white/20 mb-4" />
                    <p className="text-white/50">Aucune chaîne de production pour le moment</p>
                    <p className="text-xs text-white/30 mt-1">Créez-en une pour relier vos fiches techniques</p>
                </LiquidCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chains.map((chain, index) => (
                        <motion.div
                            key={chain.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.04 }}
                        >
                            <LiquidCard
                                glow="none"
                                padding="md"
                                className="hover:border-emerald-500/30 transition-all cursor-pointer group"
                                onClick={() => navigate(`/library/production-chains/${chain.id}`)}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <GitBranch className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white truncate">{chain.name}</h3>
                                        <p className="text-sm text-white/50">
                                            {chain._count?.nodes || 0} produits • {chain._count?.edges || 0} liaisons
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(chain.id, e)}
                                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                                {chain.description && (
                                    <p className="text-xs text-white/40 truncate">{chain.description}</p>
                                )}
                            </LiquidCard>
                        </motion.div>
                    ))}
                </div>
            )}

            <ConfirmModal
                open={confirmDelete.open}
                title="Supprimer cette chaîne"
                message="Supprimer cette chaîne de production ? Les fiches techniques liées ne seront pas supprimées."
                confirmLabel="Supprimer"
                onCancel={() => setConfirmDelete({ open: false, chainId: null })}
                onConfirm={confirmDeleteNow}
            />
        </div>
    )
}
