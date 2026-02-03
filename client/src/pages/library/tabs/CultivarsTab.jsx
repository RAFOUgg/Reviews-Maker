/**
 * CultivarsTab.jsx - Onglet Cultivars de la Bibliothèque (Producteur uniquement)
 * 
 * Conforme au CDC:
 * - Gestion de la bibliothèque de cultivars
 * - Création d'arbres généalogiques
 * - Projets PhenoHunt
 * - Canvas de sélection drag & drop
 */

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../../../components/shared/ToastContainer'
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Flower2, Plus, Trash2, Edit, Eye, GitBranch, Search,
    Filter, Grid3X3, List, FolderTree, Dna, Beaker,
    X, Check, ChevronRight, Tag, Calendar, User
} from 'lucide-react'

// Types de cultivars
const CULTIVAR_TYPES = [
    { id: 'all', label: 'Tous', color: 'purple' },
    { id: 'indica', label: 'Indica', color: 'indigo' },
    { id: 'sativa', label: 'Sativa', color: 'green' },
    { id: 'hybrid', label: 'Hybride', color: 'amber' },
    { id: 'cbd', label: 'CBD', color: 'blue' },
]

export default function CultivarsTab({ userTier = 'producer' }) {
    const toast = useToast()

    const [cultivars, setCultivars] = useState([])
    const [phenoHuntProjects, setPhenoHuntProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('library') // 'library' ou 'phenohunt'
    const [viewMode, setViewMode] = useState('grid')
    const [typeFilter, setTypeFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [editingCultivar, setEditingCultivar] = useState(null)

    // Formulaire cultivar
    const [formData, setFormData] = useState({
        name: '',
        breeder: '',
        type: 'hybrid',
        genetics: '', // Lignée parentale
        parentMale: null,
        parentFemale: null,
        phenotype: '',
        thcRange: '',
        cbdRange: '',
        floweringTime: '',
        yield: '',
        description: '',
        tags: []
    })

    // Charger les données
    const fetchData = useCallback(async () => {
        try {
            setLoading(true)

            // Charger cultivars
            const cultivarsRes = await fetch('/api/library/cultivars', {
                credentials: 'include'
            })
            if (cultivarsRes.ok) {
                const data = await cultivarsRes.json()
                setCultivars(data.cultivars || [])
            }

            // Charger projets PhenoHunt
            const phenoRes = await fetch('/api/library/phenohunt', {
                credentials: 'include'
            })
            if (phenoRes.ok) {
                const data = await phenoRes.json()
                setPhenoHuntProjects(data.projects || [])
            }
        } catch (error) {
            toast.error('Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Filtrer les cultivars
    const filteredCultivars = cultivars
        .filter(c => {
            if (typeFilter !== 'all' && c.type !== typeFilter) return false
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                return (
                    c.name?.toLowerCase().includes(query) ||
                    c.breeder?.toLowerCase().includes(query) ||
                    c.genetics?.toLowerCase().includes(query)
                )
            }
            return true
        })

    // Réinitialiser formulaire
    const resetForm = () => {
        setFormData({
            name: '',
            breeder: '',
            type: 'hybrid',
            genetics: '',
            parentMale: null,
            parentFemale: null,
            phenotype: '',
            thcRange: '',
            cbdRange: '',
            floweringTime: '',
            yield: '',
            description: '',
            tags: []
        })
        setIsCreating(false)
        setEditingCultivar(null)
    }

    // Ouvrir édition
    const openEdit = (cultivar) => {
        setFormData({
            name: cultivar.name || '',
            breeder: cultivar.breeder || '',
            type: cultivar.type || 'hybrid',
            genetics: cultivar.genetics || '',
            parentMale: cultivar.parentMale,
            parentFemale: cultivar.parentFemale,
            phenotype: cultivar.phenotype || '',
            thcRange: cultivar.thcRange || '',
            cbdRange: cultivar.cbdRange || '',
            floweringTime: cultivar.floweringTime || '',
            yield: cultivar.yield || '',
            description: cultivar.description || '',
            tags: cultivar.tags || []
        })
        setEditingCultivar(cultivar)
    }

    // Sauvegarder cultivar
    const saveCultivar = async () => {
        if (!formData.name.trim()) {
            toast.error('Le nom est requis')
            return
        }

        try {
            const url = editingCultivar
                ? `/api/library/cultivars/${editingCultivar.id}`
                : '/api/library/cultivars'

            const response = await fetch(url, {
                method: editingCultivar ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const saved = await response.json()
                if (editingCultivar) {
                    setCultivars(cultivars.map(c => c.id === saved.id ? saved : c))
                    toast.success('Cultivar mis à jour')
                } else {
                    setCultivars([...cultivars, saved])
                    toast.success('Cultivar créé')
                }
                resetForm()
            } else {
                toast.error('Erreur lors de la sauvegarde')
            }
        } catch (error) {
            toast.error('Erreur de connexion')
        }
    }

    // Supprimer cultivar
    const deleteCultivar = async (id) => {
        if (!window.confirm('Supprimer ce cultivar ?')) return

        try {
            const response = await fetch(`/api/library/cultivars/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (response.ok) {
                setCultivars(cultivars.filter(c => c.id !== id))
                toast.success('Cultivar supprimé')
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    // Rendu carte cultivar
    const renderCultivarCard = (cultivar, index) => {
        const typeConfig = CULTIVAR_TYPES.find(t => t.id === cultivar.type)

        if (viewMode === 'list') {
            return (
                <motion.div
                    key={cultivar.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                >
                    <LiquidCard glow="none" padding="sm" className="hover:border-green-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg bg-${typeConfig?.color || 'green'}-500/20 flex items-center justify-center flex-shrink-0`}>
                                <Flower2 className={`w-5 h-5 text-${typeConfig?.color || 'green'}-400`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white truncate">{cultivar.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-white/50">
                                    <span>{cultivar.breeder || 'Breeder inconnu'}</span>
                                    <span className={`px-2 py-0.5 rounded bg-${typeConfig?.color || 'green'}-500/20 text-${typeConfig?.color || 'green'}-400`}>
                                        {typeConfig?.label}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => openEdit(cultivar)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-amber-400 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteCultivar(cultivar.id)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </LiquidCard>
                </motion.div>
            )
        }

        // Vue Grid
        return (
            <motion.div
                key={cultivar.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
            >
                <LiquidCard glow="none" padding="md" className="hover:border-green-500/30 transition-all group">
                    <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-${typeConfig?.color || 'green'}-500/20 flex items-center justify-center flex-shrink-0`}>
                            <Flower2 className={`w-6 h-6 text-${typeConfig?.color || 'green'}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{cultivar.name}</h3>
                            <p className="text-sm text-white/50">{cultivar.breeder || 'Breeder inconnu'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg bg-${typeConfig?.color || 'green'}-500/20 text-${typeConfig?.color || 'green'}-400 text-xs font-bold`}>
                            {typeConfig?.label}
                        </span>
                    </div>

                    {/* Génétique */}
                    {cultivar.genetics && (
                        <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                            <Dna className="w-4 h-4" />
                            <span className="truncate">{cultivar.genetics}</span>
                        </div>
                    )}

                    {/* Stats rapides */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        {cultivar.thcRange && (
                            <div className="px-2 py-1 bg-white/5 rounded text-white/60">
                                THC: {cultivar.thcRange}
                            </div>
                        )}
                        {cultivar.floweringTime && (
                            <div className="px-2 py-1 bg-white/5 rounded text-white/60">
                                🌸 {cultivar.floweringTime}
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {cultivar.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                            {cultivar.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                                    {tag}
                                </span>
                            ))}
                            {cultivar.tags.length > 3 && (
                                <span className="px-2 py-0.5 bg-white/10 text-white/40 rounded text-xs">
                                    +{cultivar.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => openEdit(cultivar)}
                            className="flex-1 py-2 px-3 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white text-sm transition-colors flex items-center justify-center gap-1"
                        >
                            <Edit className="w-3 h-3" />
                            Modifier
                        </button>
                        <button
                            onClick={() => deleteCultivar(cultivar.id)}
                            className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </LiquidCard>
            </motion.div>
        )
    }

    // Rendu d'un projet PhenoHunt
    const renderPhenoHuntCard = (project, index) => {
        return (
            <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <LiquidCard glow="none" padding="md" className="hover:border-amber-500/30 transition-all">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Beaker className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">{project.name}</h3>
                            <p className="text-sm text-white/50">{project.cultivarsCount || 0} cultivars</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${project.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'
                            }`}>
                            {project.status === 'active' ? 'En cours' : 'Terminé'}
                        </span>
                    </div>

                    <p className="text-sm text-white/60 mb-4 line-clamp-2">
                        {project.description || 'Aucune description'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-white/50">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        <button className="flex items-center gap-1 text-purple-400 hover:text-purple-300">
                            Ouvrir
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </LiquidCard>
            </motion.div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Tabs Bibliothèque / PhenoHunt */}
            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('library')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'library'
                            ? 'bg-green-500/20 text-green-400'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <FolderTree className="w-4 h-4" />
                    Bibliothèque
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/10">{cultivars.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('phenohunt')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'phenohunt'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Beaker className="w-4 h-4" />
                    Projets PhenoHunt
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/10">{phenoHuntProjects.length}</span>
                </button>
            </div>

            {activeTab === 'library' ? (
                <>
                    {/* Toolbar */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Filtres type */}
                        <div className="flex flex-wrap gap-2">
                            {CULTIVAR_TYPES.map((type) => {
                                const isActive = typeFilter === type.id
                                const count = type.id === 'all'
                                    ? cultivars.length
                                    : cultivars.filter(c => c.type === type.id).length

                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setTypeFilter(type.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${isActive
                                                ? `bg-${type.color}-500/20 text-${type.color}-400 border border-${type.color}-500/30`
                                                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{type.label}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? `bg-${type.color}-500/30` : 'bg-white/10'}`}>
                                            {count}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        <div className="flex-1" />

                        {/* Recherche + Vue */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm w-48 focus:outline-none focus:border-green-500/50"
                                />
                            </div>

                            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'text-white/50 hover:text-white'
                                        }`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-500 text-white' : 'text-white/50 hover:text-white'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>

                            <LiquidButton
                                onClick={() => setIsCreating(true)}
                                variant="primary"
                                size="sm"
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Ajouter
                            </LiquidButton>
                        </div>
                    </div>

                    {/* Formulaire création/édition */}
                    <AnimatePresence>
                        {(isCreating || editingCultivar) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <LiquidCard glow="green" padding="lg">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <Flower2 className="w-5 h-5 text-green-400" />
                                        {editingCultivar ? 'Modifier le cultivar' : 'Nouveau cultivar'}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Nom *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="ex: Zkittlez"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Breeder</label>
                                            <input
                                                type="text"
                                                value={formData.breeder}
                                                onChange={(e) => setFormData({ ...formData, breeder: e.target.value })}
                                                placeholder="ex: 3rd Gen Family"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                                            >
                                                {CULTIVAR_TYPES.filter(t => t.id !== 'all').map(t => (
                                                    <option key={t.id} value={t.id} className="bg-[#1a1a2e]">{t.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm text-white/60 mb-2">Génétique / Lignée</label>
                                            <input
                                                type="text"
                                                value={formData.genetics}
                                                onChange={(e) => setFormData({ ...formData, genetics: e.target.value })}
                                                placeholder="ex: Grape Ape x Grapefruit"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">THC (%)</label>
                                            <input
                                                type="text"
                                                value={formData.thcRange}
                                                onChange={(e) => setFormData({ ...formData, thcRange: e.target.value })}
                                                placeholder="ex: 18-24%"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">CBD (%)</label>
                                            <input
                                                type="text"
                                                value={formData.cbdRange}
                                                onChange={(e) => setFormData({ ...formData, cbdRange: e.target.value })}
                                                placeholder="ex: <1%"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Temps de floraison</label>
                                            <input
                                                type="text"
                                                value={formData.floweringTime}
                                                onChange={(e) => setFormData({ ...formData, floweringTime: e.target.value })}
                                                placeholder="ex: 8-9 semaines"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                            />
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm text-white/60 mb-2">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Notes sur ce cultivar..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                                        <LiquidButton onClick={resetForm} variant="ghost" leftIcon={<X className="w-4 h-4" />}>
                                            Annuler
                                        </LiquidButton>
                                        <LiquidButton onClick={saveCultivar} variant="primary" leftIcon={<Check className="w-4 h-4" />}>
                                            {editingCultivar ? 'Mettre à jour' : 'Créer'}
                                        </LiquidButton>
                                    </div>
                                </LiquidCard>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Liste cultivars */}
                    {filteredCultivars.length === 0 ? (
                        <LiquidCard glow="none" padding="lg">
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                    <Flower2 className="w-8 h-8 text-white/30" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    {cultivars.length === 0 ? 'Aucun cultivar' : 'Aucun résultat'}
                                </h3>
                                <p className="text-white/50 mb-6">
                                    {cultivars.length === 0
                                        ? 'Commencez par ajouter votre premier cultivar'
                                        : 'Essayez de modifier vos filtres'
                                    }
                                </p>
                                {cultivars.length === 0 && (
                                    <LiquidButton
                                        onClick={() => setIsCreating(true)}
                                        variant="primary"
                                        leftIcon={<Plus className="w-4 h-4" />}
                                    >
                                        Ajouter un cultivar
                                    </LiquidButton>
                                )}
                            </div>
                        </LiquidCard>
                    ) : (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                            : 'space-y-2'
                        }>
                            <AnimatePresence>
                                {filteredCultivars.map((cultivar, index) => renderCultivarCard(cultivar, index))}
                            </AnimatePresence>
                        </div>
                    )}
                </>
            ) : (
                /* Tab PhenoHunt */
                <>
                    <div className="flex justify-between items-center">
                        <p className="text-white/60">
                            Gérez vos projets de sélection et créez des arbres généalogiques.
                        </p>
                        <LiquidButton
                            variant="primary"
                            leftIcon={<Plus className="w-4 h-4" />}
                        >
                            Nouveau projet
                        </LiquidButton>
                    </div>

                    {phenoHuntProjects.length === 0 ? (
                        <LiquidCard glow="none" padding="lg">
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
                                    <Beaker className="w-8 h-8 text-amber-400/50" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Aucun projet PhenoHunt</h3>
                                <p className="text-white/50 mb-6">
                                    Créez un projet pour suivre vos sélections de phénotypes
                                </p>
                                <LiquidButton variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                                    Créer un projet
                                </LiquidButton>
                            </div>
                        </LiquidCard>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {phenoHuntProjects.map((project, idx) => renderPhenoHuntCard(project, idx))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
