/**
 * DataTab.jsx - Onglet Données Sauvegardées (Producteur uniquement)
 * 
 * Conforme au CDC:
 * - Substrats utilisés fréquemment
 * - Engrais utilisés fréquemment
 * - Matériel utilisé fréquemment
 * - Techniques favorites
 * Permet de remplir les reviews plus rapidement via auto-complete
 */

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../../../components/shared/ToastContainer'
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI'
import { AnimatePresence, motion } from 'framer-motion'
import { 
    Database, Plus, Trash2, Edit, Save, X, Check,
    Leaf, Droplets, Wrench, Lightbulb, ChevronDown, ChevronRight,
    Package, Thermometer, Wind
} from 'lucide-react'

// Catégories de données sauvegardables
const DATA_CATEGORIES = [
    {
        id: 'substrats',
        label: 'Substrats',
        icon: Leaf,
        color: 'green',
        description: 'Substrats et mélanges de terre',
        fields: [
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'type', label: 'Type', type: 'select', options: ['Bio', 'Hydro', 'Coco', 'Mixte', 'Autre'] },
            { key: 'composition', label: 'Composition', type: 'textarea' },
            { key: 'brand', label: 'Marque', type: 'text' },
        ]
    },
    {
        id: 'engrais',
        label: 'Engrais',
        icon: Droplets,
        color: 'blue',
        description: 'Engrais et nutriments',
        fields: [
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'brand', label: 'Marque', type: 'text' },
            { key: 'type', label: 'Type', type: 'select', options: ['Bio', 'Chimique', 'Mixte'] },
            { key: 'npk', label: 'NPK', type: 'text', placeholder: 'ex: 10-10-10' },
            { key: 'dosage', label: 'Dosage recommandé', type: 'text', placeholder: 'ex: 2ml/L' },
            { key: 'phase', label: 'Phase d\'utilisation', type: 'multiselect', options: ['Croissance', 'Floraison', 'Toutes phases'] },
        ]
    },
    {
        id: 'materiel',
        label: 'Matériel',
        icon: Wrench,
        color: 'amber',
        description: 'Équipements et accessoires',
        fields: [
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'category', label: 'Catégorie', type: 'select', options: ['Éclairage', 'Ventilation', 'Irrigation', 'Mesure', 'Conteneurs', 'Autre'] },
            { key: 'brand', label: 'Marque', type: 'text' },
            { key: 'model', label: 'Modèle', type: 'text' },
            { key: 'specs', label: 'Spécifications', type: 'textarea' },
        ]
    },
    {
        id: 'techniques',
        label: 'Techniques',
        icon: Lightbulb,
        color: 'purple',
        description: 'Méthodes et techniques de culture',
        fields: [
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'type', label: 'Type', type: 'select', options: ['LST', 'HST', 'SCROG', 'SOG', 'Main-lining', 'Topping', 'FIM', 'Autre'] },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'timing', label: 'Timing recommandé', type: 'text', placeholder: 'ex: Semaine 3-4 de croissance' },
        ]
    },
    {
        id: 'environnement',
        label: 'Environnement',
        icon: Thermometer,
        color: 'red',
        description: 'Paramètres environnementaux standards',
        fields: [
            { key: 'name', label: 'Nom du preset', type: 'text', required: true },
            { key: 'phase', label: 'Phase', type: 'select', options: ['Germination', 'Croissance', 'Floraison', 'Séchage', 'Curing'] },
            { key: 'tempDay', label: 'Temp jour (°C)', type: 'number' },
            { key: 'tempNight', label: 'Temp nuit (°C)', type: 'number' },
            { key: 'humidity', label: 'Humidité (%)', type: 'number' },
            { key: 'co2', label: 'CO2 (ppm)', type: 'number' },
            { key: 'lightHours', label: 'Heures de lumière', type: 'number' },
        ]
    },
]

export default function DataTab() {
    const toast = useToast()
    
    const [savedData, setSavedData] = useState({})
    const [loading, setLoading] = useState(true)
    const [expandedCategory, setExpandedCategory] = useState('substrats')
    const [isCreating, setIsCreating] = useState(null) // ID de la catégorie en création
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({})

    // Charger les données sauvegardées
    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/library/data', {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                // Organiser par catégorie
                const organized = {}
                DATA_CATEGORIES.forEach(cat => {
                    organized[cat.id] = data.items?.filter(d => d.category === cat.id) || []
                })
                setSavedData(organized)
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

    // Reset formulaire
    const resetForm = () => {
        setFormData({})
        setIsCreating(null)
        setEditingItem(null)
    }

    // Ouvrir création
    const openCreate = (categoryId) => {
        const category = DATA_CATEGORIES.find(c => c.id === categoryId)
        const initialData = {}
        category.fields.forEach(f => {
            initialData[f.key] = f.type === 'multiselect' ? [] : ''
        })
        setFormData(initialData)
        setIsCreating(categoryId)
        setEditingItem(null)
    }

    // Ouvrir édition
    const openEdit = (categoryId, item) => {
        setFormData({ ...item.data })
        setEditingItem({ categoryId, item })
        setIsCreating(null)
    }

    // Sauvegarder
    const saveItem = async (categoryId) => {
        const category = DATA_CATEGORIES.find(c => c.id === categoryId)
        const requiredFields = category.fields.filter(f => f.required)
        
        for (const field of requiredFields) {
            if (!formData[field.key]?.trim()) {
                toast.error(`Le champ "${field.label}" est requis`)
                return
            }
        }

        try {
            const url = editingItem 
                ? `/api/library/data/${editingItem.item.id}`
                : '/api/library/data'

            const response = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    category: categoryId,
                    data: formData
                })
            })

            if (response.ok) {
                const saved = await response.json()
                if (editingItem) {
                    setSavedData({
                        ...savedData,
                        [categoryId]: savedData[categoryId].map(d => d.id === saved.id ? saved : d)
                    })
                    toast.success('Données mises à jour')
                } else {
                    setSavedData({
                        ...savedData,
                        [categoryId]: [...(savedData[categoryId] || []), saved]
                    })
                    toast.success('Données sauvegardées')
                }
                resetForm()
            } else {
                toast.error('Erreur lors de la sauvegarde')
            }
        } catch (error) {
            toast.error('Erreur de connexion')
        }
    }

    // Supprimer
    const deleteItem = async (categoryId, itemId) => {
        if (!window.confirm('Supprimer cette entrée ?')) return

        try {
            const response = await fetch(`/api/library/data/${itemId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (response.ok) {
                setSavedData({
                    ...savedData,
                    [categoryId]: savedData[categoryId].filter(d => d.id !== itemId)
                })
                toast.success('Entrée supprimée')
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    // Rendu d'un champ de formulaire
    const renderField = (field, categoryId) => {
        const value = formData[field.key] || ''

        switch (field.type) {
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="" className="bg-[#1a1a2e]">Sélectionner...</option>
                        {field.options.map(opt => (
                            <option key={opt} value={opt} className="bg-[#1a1a2e]">{opt}</option>
                        ))}
                    </select>
                )

            case 'multiselect':
                return (
                    <div className="flex flex-wrap gap-2">
                        {field.options.map(opt => {
                            const selected = (formData[field.key] || []).includes(opt)
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                        const current = formData[field.key] || []
                                        const updated = selected 
                                            ? current.filter(v => v !== opt)
                                            : [...current, opt]
                                        setFormData({ ...formData, [field.key]: updated })
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        selected 
                                            ? 'bg-purple-500 text-white' 
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                    }`}
                                >
                                    {opt}
                                </button>
                            )
                        })}
                    </div>
                )

            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                )

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                    />
                )

            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                    />
                )
        }
    }

    // Rendu d'une catégorie
    const renderCategory = (category) => {
        const Icon = category.icon
        const isExpanded = expandedCategory === category.id
        const items = savedData[category.id] || []
        const isCreatingThis = isCreating === category.id
        const isEditingThis = editingItem?.categoryId === category.id

        return (
            <motion.div
                key={category.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <LiquidCard glow="none" padding="none" className="overflow-hidden">
                    {/* Header cliquable */}
                    <button
                        onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                        className={`w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${isExpanded ? 'border-b border-white/10' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-xl bg-${category.color}-500/20 flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 text-${category.color}-400`} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-bold text-white">{category.label}</h3>
                            <p className="text-sm text-white/50">{category.description}</p>
                        </div>
                        <span className="px-2 py-1 bg-white/5 rounded text-sm text-white/60">
                            {items.length}
                        </span>
                        {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-white/40" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-white/40" />
                        )}
                    </button>

                    {/* Contenu expansé */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 space-y-4">
                                    {/* Bouton ajouter */}
                                    {!isCreatingThis && !isEditingThis && (
                                        <LiquidButton
                                            onClick={() => openCreate(category.id)}
                                            variant="secondary"
                                            size="sm"
                                            leftIcon={<Plus className="w-4 h-4" />}
                                        >
                                            Ajouter
                                        </LiquidButton>
                                    )}

                                    {/* Formulaire création/édition */}
                                    {(isCreatingThis || isEditingThis) && (
                                        <div className={`p-4 rounded-xl border border-${category.color}-500/30 bg-${category.color}-500/5`}>
                                            <h4 className="font-bold text-white mb-4">
                                                {isCreatingThis ? 'Nouvelle entrée' : 'Modifier'}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {category.fields.map(field => (
                                                    <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                                        <label className="block text-sm text-white/60 mb-2">
                                                            {field.label} {field.required && '*'}
                                                        </label>
                                                        {renderField(field, category.id)}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                                                <LiquidButton onClick={resetForm} variant="ghost" size="sm" leftIcon={<X className="w-4 h-4" />}>
                                                    Annuler
                                                </LiquidButton>
                                                <LiquidButton onClick={() => saveItem(category.id)} variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
                                                    {isCreatingThis ? 'Ajouter' : 'Mettre à jour'}
                                                </LiquidButton>
                                            </div>
                                        </div>
                                    )}

                                    {/* Liste des items */}
                                    {items.length === 0 ? (
                                        <p className="text-center text-white/40 py-4">
                                            Aucune donnée sauvegardée dans cette catégorie
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {items.map((item) => (
                                                <div 
                                                    key={item.id}
                                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-white">{item.data.name}</h4>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {Object.entries(item.data)
                                                                .filter(([k, v]) => k !== 'name' && v)
                                                                .slice(0, 3)
                                                                .map(([key, val]) => (
                                                                    <span key={key} className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/50">
                                                                        {Array.isArray(val) ? val.join(', ') : val}
                                                                    </span>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => openEdit(category.id, item)}
                                                        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-amber-400 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteItem(category.id, item.id)}
                                                        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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

    const totalItems = Object.values(savedData).reduce((acc, items) => acc + items.length, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-400" />
                        Données sauvegardées
                    </h2>
                    <p className="text-white/50 mt-1">
                        {totalItems} entrée{totalItems > 1 ? 's' : ''} pour l'auto-complétion rapide
                    </p>
                </div>
            </div>

            {/* Info box */}
            <LiquidCard glow="none" padding="md">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-1">Auto-complétion intelligente</h3>
                        <p className="text-sm text-white/60">
                            Les données sauvegardées ici apparaîtront automatiquement en suggestions lors de la création de vos reviews et PipeLines de culture.
                        </p>
                    </div>
                </div>
            </LiquidCard>

            {/* Catégories */}
            <div className="space-y-4">
                {DATA_CATEGORIES.map(category => renderCategory(category))}
            </div>
        </div>
    )
}
