import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, Copy } from 'lucide-react'

/**
 * PresetsPanelCDC - Panneau conformité CDC pour préréglages
 * 
 * Fonctionnalités:
 * - Multi-checkboxes par catégorie (Substrats / Engrais / Environnement)
 * - Drag & drop des préréglages sélectionnés vers timeline
 * - Sauvegarde et gestion des préréglages globaux
 */
export default function PresetsPanel({ sidebarContent, onPresetsSelected, onDragPreset }) {
    const [presets, setPresets] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('pipeline-presets') || '[]')
        } catch (e) {
            return []
        }
    })

    const [selectedPresets, setSelectedPresets] = useState(new Set())
    const [expandedCategories, setExpandedCategories] = useState({
        substrats: true,
        engrais: true,
        environnement: true,
        custom: true
    })
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newPresetName, setNewPresetName] = useState('')

    // Sauvegarder presets dans localStorage
    useEffect(() => {
        localStorage.setItem('pipeline-presets', JSON.stringify(presets))
    }, [presets])

    // Catégories de préréglages prédéfinis
    const presetCategories = {
        substrats: {
            label: '🌱 Substrats courants',
            icon: '🌿',
            description: 'Compositions de substrats prêtes à l\'emploi',
            items: [
                { id: 'substrat-terre', label: 'Terreau pur', icon: '🪴', data: { substratType: 'Terreau', volume: 30, composition: 'terreau:100' } },
                { id: 'substrat-coco', label: 'Coco 100%', icon: '🥥', data: { substratType: 'Coco', volume: 30, composition: 'coco:100' } },
                { id: 'substrat-coco-terre', label: 'Coco + Terreau', icon: '🪴', data: { substratType: 'Mélange', volume: 30, composition: 'coco:60,terreau:40' } },
                { id: 'substrat-bio', label: 'Bio complet', icon: '♻️', data: { substratType: 'Bio organique', volume: 30, composition: 'terreau:50,compost:30,humus:20' } },
                { id: 'substrat-hydro', label: 'Hydroponique', icon: '💧', data: { substratType: 'Hydro', volume: 30, composition: 'laine-roche:100' } },
                { id: 'substrat-dwc', label: 'DWC', icon: '🪣', data: { substratType: 'DWC', volume: 25, composition: 'billes-expansion:100' } }
            ]
        },
        engrais: {
            label: '🧪 Engrais phases',
            icon: '🧪',
            description: 'Calendriers d\'engraissage par phase',
            items: [
                { id: 'engrais-phase1', label: 'Phase 1 (Croissance)', icon: '🌱', data: { engraisPhase: 'croissance', dosage: '1ml/L', frequence: 'bisemaine' } },
                { id: 'engrais-phase2', label: 'Phase 2 (Stretch)', icon: '📈', data: { engraisPhase: 'stretch', dosage: '1.5ml/L', frequence: 'hebdo' } },
                { id: 'engrais-phase3', label: 'Phase 3 (Floraison)', icon: '🌸', data: { engraisPhase: 'floraison', dosage: '2ml/L', frequence: 'hebdo' } },
                { id: 'engrais-phase4', label: 'Phase 4 (Finish)', icon: '✨', data: { engraisPhase: 'finish', dosage: '1.5ml/L', frequence: 'bisemaine' } },
                { id: 'engrais-phase5', label: 'Phase 5 (Rinçage)', icon: '💦', data: { engraisPhase: 'rinçage', dosage: 'eau-pure', frequence: 'hebdo' } }
            ]
        },
        environnement: {
            label: '🌡️ Environnement',
            icon: '⚙️',
            description: 'Configurations climatiques pré-optimisées',
            items: [
                { id: 'env-indoor-led', label: 'Indoor LED 300W', icon: '💡', data: { mode: 'Indoor', lampType: 'LED', puissance: 300, temp: 22, humidite: 60 } },
                { id: 'env-indoor-hps', label: 'Indoor HPS 600W', icon: '🔦', data: { mode: 'Indoor', lampType: 'HPS', puissance: 600, temp: 24, humidite: 55 } },
                { id: 'env-greenhouse', label: 'Serre mixte', icon: '🌾', data: { mode: 'Greenhouse', lampType: 'Mixte', puissance: 0, temp: 20, humidite: 65 } },
                { id: 'env-outdoor', label: 'Outdoor naturel', icon: '☀️', data: { mode: 'Outdoor', lampType: 'Naturel', puissance: 0, temp: 18, humidite: 60 } },
                { id: 'env-cool', label: 'Cool (cryptogamie)', icon: '❄️', data: { mode: 'Indoor', lampType: 'LED', puissance: 200, temp: 16, humidite: 75 } },
                { id: 'env-warm', label: 'Warm (désertique)', icon: '🔥', data: { mode: 'Outdoor', lampType: 'Naturel', puissance: 0, temp: 28, humidite: 45 } }
            ]
        }
    }

    // Créer un nouveau préréglage personnalisé
    const handleCreatePreset = () => {
        if (!newPresetName.trim()) return

        const newPreset = {
            id: Date.now(),
            name: newPresetName,
            category: 'custom',
            icon: '⭐',
            data: {}, // À remplir par l'utilisateur via la modale principale
            createdAt: new Date().toISOString()
        }

        setPresets([...presets, newPreset])
        setNewPresetName('')
        setShowCreateModal(false)
    }

    // Supprimer un préréglage personnalisé
    const handleDeletePreset = (presetId) => {
        if (!confirm('Supprimer ce préréglage personnalisé ?')) return
        setPresets(presets.filter(p => p.id !== presetId))
    }

    // Dupliquer un préréglage
    const handleDuplicatePreset = (preset) => {
        const duplicate = {
            ...preset,
            id: Date.now(),
            name: `${preset.name} (copie)`,
            createdAt: new Date().toISOString()
        }
        setPresets([...presets, duplicate])
    }

    // Toggle sélection préréglage
    const togglePresetSelection = (presetId) => {
        const newSelected = new Set(selectedPresets)
        if (newSelected.has(presetId)) {
            newSelected.delete(presetId)
        } else {
            newSelected.add(presetId)
        }
        setSelectedPresets(newSelected)
        onPresetsSelected && onPresetsSelected(Array.from(newSelected))
    }

    // Toggle catégorie
    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }))
    }

    // Drag d'un préréglage vers la timeline
    const handleDragPreset = (e, preset) => {
        e.preventDefault()
        onDragPreset && onDragPreset({
            type: 'preset',
            preset,
            data: preset.data
        })
    }

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <div className="px-3 py-2">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    📋 Préréglages globaux
                </h3>

                {/* Bouton créer préréglage */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full mb-3 px-3 py-2 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <Plus size={14} /> Nouveau préréglage
                </button>

                {/* Catégories prédéfinies */}
                {Object.entries(presetCategories).map(([catId, category]) => (
                    <div key={catId} className="mb-3">
                        <button
                            onClick={() => toggleCategory(catId)}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <span>{category.label}</span>
                            </span>
                            {expandedCategories[catId] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {expandedCategories[catId] && (
                            <div className="mt-2 space-y-1 pl-2">
                                {category.items.map(item => (
                                    <label
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => handleDragPreset(e, { ...item, category: catId })}
                                        className="flex items-center gap-2 p-1.5 text-xs rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-grab active:cursor-grabbing transition-colors group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPresets.has(item.id)}
                                            onChange={() => togglePresetSelection(item.id)}
                                            className="w-3 h-3 rounded border-gray-300 text-blue-500 cursor-pointer"
                                        />
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="flex-1 text-gray-700 dark:text-gray-300 font-medium">
                                            {item.label}
                                        </span>
                                        <span className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-500 transition-opacity">
                                            ⤡ drag
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Préréglages personnalisés */}
                {presets.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => toggleCategory('custom')}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span>⭐</span>
                                <span>Mes préréglages</span>
                            </span>
                            {expandedCategories.custom ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {expandedCategories.custom && (
                            <div className="mt-2 space-y-1 pl-2">
                                {presets.map(preset => (
                                    <div
                                        key={preset.id}
                                        draggable
                                        onDragStart={(e) => handleDragPreset(e, preset)}
                                        className="flex items-center gap-2 p-1.5 text-xs rounded hover:bg-amber-50 dark:hover:bg-amber-900/30 cursor-grab active:cursor-grabbing transition-colors group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPresets.has(preset.id)}
                                            onChange={() => togglePresetSelection(preset.id)}
                                            className="w-3 h-3 rounded border-gray-300 text-blue-500 cursor-pointer"
                                        />
                                        <span className="text-lg">{preset.icon || '⭐'}</span>
                                        <span className="flex-1 text-gray-700 dark:text-gray-300 font-medium truncate">
                                            {preset.name}
                                        </span>
                                        <button
                                            onClick={() => handleDuplicatePreset(preset)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-opacity"
                                            title="Dupliquer"
                                        >
                                            <Copy size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePreset(preset.id)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-opacity"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal créer préréglage */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            ⭐ Nouveau préréglage personnalisé
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Nommez votre préréglage. Vous pourrez le configurer dans la pipeline principale.
                        </p>
                        <input
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder="ex: Culture LED Bio optimisée"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreatePreset()
                            }}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreatePreset}
                                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Créer
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false)
                                    setNewPresetName('')
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

