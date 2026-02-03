/**
 * TemplatesTab.jsx - Onglet Templates de la Bibliothèque
 * 
 * Conforme au CDC:
 * - Templates prédéfinis (Compact, Détaillé, Complète, Influenceur)
 * - Templates personnalisés sauvegardés
 * - Partage via code unique
 * - Aperçu et sélection par défaut
 */

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../../../components/shared/ToastContainer'
import { LiquidCard, LiquidButton, LiquidChip } from '@/components/ui/LiquidUI'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Layout, LayoutGrid, LayoutList, Copy, Trash2, Eye, Star,
    Share2, Download, Plus, Check, Lock, Sparkles,
    Smartphone, Monitor, FileText, Settings2
} from 'lucide-react'

// Templates prédéfinis selon le CDC
const PREDEFINED_TEMPLATES = [
    {
        id: 'compact',
        name: 'Compact',
        description: 'Format concis avec les informations essentielles',
        format: '1:1',
        tier: 'free',
        preview: '/templates/compact-preview.png',
        sections: ['type', 'nom', 'cultivars', 'photo', 'curing', 'scores'],
        icon: LayoutGrid
    },
    {
        id: 'detailed',
        name: 'Détaillé',
        description: 'Format complet avec toutes les notes détaillées',
        format: ['1:1', '16:9', '9:16', 'A4'],
        tier: 'free',
        preview: '/templates/detailed-preview.png',
        sections: ['all-scores', 'curing', 'photos'],
        icon: LayoutList
    },
    {
        id: 'complete',
        name: 'Complète',
        description: 'Export exhaustif avec PipeLine et génétiques',
        format: ['A4', '16:9'],
        tier: 'free',
        preview: '/templates/complete-preview.png',
        sections: ['all', 'pipeline', 'genetics'],
        icon: FileText
    },
    {
        id: 'influencer',
        name: 'Influenceur',
        description: 'Format optimisé pour les réseaux sociaux',
        format: '9:16',
        tier: 'influencer',
        preview: '/templates/influencer-preview.png',
        sections: ['type', 'nom', 'photo', 'scores', 'effects'],
        icon: Smartphone
    },
    {
        id: 'custom',
        name: 'Personnalisé',
        description: 'Drag & drop complet avec zones personnalisables',
        format: ['1:1', '9:16'],
        tier: 'producer',
        preview: '/templates/custom-preview.png',
        sections: ['custom'],
        icon: Settings2
    }
]

const TIER_CONFIG = {
    free: { label: 'Gratuit', color: 'green', icon: null },
    influencer: { label: 'Influenceur', color: 'pink', icon: Sparkles },
    producer: { label: 'Producteur', color: 'purple', icon: Lock }
}

export default function TemplatesTab({ userTier = 'amateur' }) {
    const toast = useToast()

    const [savedTemplates, setSavedTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [defaultTemplateId, setDefaultTemplateId] = useState(null)
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [shareCode, setShareCode] = useState('')
    const [importCode, setImportCode] = useState('')

    // Charger les templates sauvegardés
    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/library/templates', {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setSavedTemplates(data.templates || [])
                setDefaultTemplateId(data.defaultId)
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des templates')
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchTemplates()
    }, [fetchTemplates])

    // Vérifier si l'utilisateur a accès à un tier
    const hasAccess = (tier) => {
        if (tier === 'free') return true
        if (tier === 'influencer') return userTier === 'influencer' || userTier === 'producer'
        if (tier === 'producer') return userTier === 'producer'
        return false
    }

    // Définir comme template par défaut
    const setAsDefault = async (templateId, isPredefined = false) => {
        try {
            const response = await fetch('/api/library/templates/default', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    templateId,
                    isPredefined
                })
            })

            if (response.ok) {
                setDefaultTemplateId(isPredefined ? `predefined:${templateId}` : templateId)
                toast.success('Template défini par défaut')
            }
        } catch (error) {
            toast.error('Erreur lors de la mise à jour')
        }
    }

    // Supprimer un template sauvegardé
    const deleteTemplate = async (templateId) => {
        if (!window.confirm('Supprimer ce template ?')) return

        try {
            const response = await fetch(`/api/library/templates/${templateId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (response.ok) {
                setSavedTemplates(savedTemplates.filter(t => t.id !== templateId))
                toast.success('Template supprimé')
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    // Générer code de partage
    const generateShareCode = async (template) => {
        try {
            const response = await fetch(`/api/library/templates/${template.id}/share`, {
                method: 'POST',
                credentials: 'include'
            })

            if (response.ok) {
                const { code } = await response.json()
                setShareCode(code)
                setSelectedTemplate(template)
                setShareModalOpen(true)
            }
        } catch (error) {
            toast.error('Erreur lors de la génération du code')
        }
    }

    // Importer via code
    const importTemplate = async () => {
        if (!importCode.trim()) return

        try {
            const response = await fetch('/api/library/templates/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code: importCode.trim() })
            })

            if (response.ok) {
                const imported = await response.json()
                setSavedTemplates([...savedTemplates, imported])
                setImportCode('')
                toast.success('Template importé avec succès !')
            } else {
                const error = await response.json()
                toast.error(error.message || 'Code invalide')
            }
        } catch (error) {
            toast.error('Erreur lors de l\'import')
        }
    }

    // Copier dans le presse-papier
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.success('Code copié !')
    }

    // Rendu d'une carte template prédéfini
    const renderPredefinedCard = (template, index) => {
        const Icon = template.icon
        const tierConfig = TIER_CONFIG[template.tier]
        const accessible = hasAccess(template.tier)
        const isDefault = defaultTemplateId === `predefined:${template.id}`

        return (
            <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <LiquidCard
                    glow={isDefault ? 'purple' : 'none'}
                    padding="none"
                    className={`overflow-hidden ${!accessible ? 'opacity-60' : ''} ${isDefault ? 'ring-2 ring-purple-500' : ''}`}
                >
                    {/* Preview */}
                    <div className="aspect-video bg-gradient-to-br from-white/5 to-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icon className="w-16 h-16 text-white/20" />
                        </div>

                        {/* Badge tier */}
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg bg-${tierConfig.color}-500/80 text-white text-xs font-bold flex items-center gap-1`}>
                            {tierConfig.icon && <tierConfig.icon className="w-3 h-3" />}
                            {tierConfig.label}
                        </div>

                        {/* Badge défaut */}
                        {isDefault && (
                            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-purple-500 text-white text-xs font-bold flex items-center gap-1">
                                <Star className="w-3 h-3" fill="currentColor" />
                                Défaut
                            </div>
                        )}

                        {/* Lock overlay */}
                        {!accessible && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Lock className="w-8 h-8 text-white/50" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                        <h3 className="font-bold text-white mb-1">{template.name}</h3>
                        <p className="text-sm text-white/50 mb-3">{template.description}</p>

                        {/* Formats */}
                        <div className="flex flex-wrap gap-1 mb-4">
                            {(Array.isArray(template.format) ? template.format : [template.format]).map(f => (
                                <span key={f} className="px-2 py-0.5 bg-white/5 rounded text-xs text-white/60">
                                    {f}
                                </span>
                            ))}
                        </div>

                        {/* Actions */}
                        {accessible ? (
                            <div className="flex gap-2">
                                <LiquidButton
                                    onClick={() => setAsDefault(template.id, true)}
                                    variant={isDefault ? 'secondary' : 'primary'}
                                    size="sm"
                                    className="flex-1"
                                    leftIcon={isDefault ? <Check className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                                >
                                    {isDefault ? 'Par défaut' : 'Définir'}
                                </LiquidButton>
                                <LiquidButton
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<Eye className="w-4 h-4" />}
                                >
                                    Aperçu
                                </LiquidButton>
                            </div>
                        ) : (
                            <LiquidButton
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                leftIcon={<Lock className="w-4 h-4" />}
                            >
                                Passer à {tierConfig.label}
                            </LiquidButton>
                        )}
                    </div>
                </LiquidCard>
            </motion.div>
        )
    }

    // Rendu d'un template sauvegardé
    const renderSavedCard = (template, index) => {
        const isDefault = defaultTemplateId === template.id

        return (
            <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <LiquidCard
                    glow={isDefault ? 'purple' : 'none'}
                    padding="none"
                    className={`overflow-hidden ${isDefault ? 'ring-2 ring-purple-500' : ''}`}
                >
                    {/* Preview */}
                    <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative overflow-hidden">
                        {template.preview ? (
                            <img src={template.preview} alt={template.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Layout className="w-12 h-12 text-white/20" />
                            </div>
                        )}

                        {/* Badge personnalisé */}
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-blue-500/80 text-white text-xs font-bold">
                            Personnalisé
                        </div>

                        {isDefault && (
                            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-purple-500 text-white text-xs font-bold flex items-center gap-1">
                                <Star className="w-3 h-3" fill="currentColor" />
                                Défaut
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                        <h3 className="font-bold text-white mb-1">{template.name}</h3>
                        <p className="text-sm text-white/50 mb-3">
                            Format {template.format} • Créé le {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setAsDefault(template.id, false)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${isDefault
                                        ? 'bg-purple-500/20 text-purple-400'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {isDefault ? '✓ Défaut' : 'Définir'}
                            </button>
                            <button
                                onClick={() => generateShareCode(template)}
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                                title="Partager"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => deleteTemplate(template.id)}
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </LiquidCard>
            </motion.div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Import par code */}
            <LiquidCard glow="none" padding="md">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            <Download className="w-4 h-4 text-purple-400" />
                            Importer un template
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Entrez le code de partage..."
                                value={importCode}
                                onChange={(e) => setImportCode(e.target.value)}
                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                            />
                            <LiquidButton
                                onClick={importTemplate}
                                variant="primary"
                                disabled={!importCode.trim()}
                            >
                                Importer
                            </LiquidButton>
                        </div>
                    </div>
                </div>
            </LiquidCard>

            {/* Templates prédéfinis */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-purple-400" />
                    Templates prédéfinis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PREDEFINED_TEMPLATES.map((template, idx) => renderPredefinedCard(template, idx))}
                </div>
            </div>

            {/* Templates sauvegardés */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Mes templates personnalisés
                    <span className="text-sm font-normal text-white/50">({savedTemplates.length})</span>
                </h2>

                {savedTemplates.length === 0 ? (
                    <LiquidCard glow="none" padding="lg">
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Layout className="w-8 h-8 text-white/30" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Aucun template personnalisé</h3>
                            <p className="text-white/50 mb-4">
                                Créez vos premiers templates dans l'Export Maker
                            </p>
                        </div>
                    </LiquidCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedTemplates.map((template, idx) => renderSavedCard(template, idx))}
                    </div>
                )}
            </div>

            {/* Modal de partage */}
            <AnimatePresence>
                {shareModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => setShareModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a2e] rounded-2xl p-6 max-w-md w-full border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-purple-400" />
                                Partager "{selectedTemplate?.name}"
                            </h3>

                            <p className="text-white/60 mb-4">
                                Partagez ce code avec d'autres utilisateurs pour qu'ils puissent importer votre template.
                            </p>

                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={shareCode}
                                    readOnly
                                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-center tracking-wider"
                                />
                                <button
                                    onClick={() => copyToClipboard(shareCode)}
                                    className="px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl text-white transition-colors"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>

                            <button
                                onClick={() => setShareModalOpen(false)}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                            >
                                Fermer
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
