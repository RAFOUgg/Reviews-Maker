import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Settings, Save, Trash2, Calendar, Info } from 'lucide-react'

/**
 * Timeline GitHub-style pour les PipeLines selon CDC
 * Système avec préréglages, drag & drop, et timeline interactive
 */
export default function PipelineTimeline({
    pipelineType = 'culture',
    data = {},
    onChange,
    availableDataFields = []
}) {
    const { t } = useTranslation()

    // État local
    const [timelineConfig, setTimelineConfig] = useState({
        intervalType: data.intervalType || 'jours',
        totalIntervals: data.totalIntervals || 90,
        startDate: data.startDate || '',
        endDate: data.endDate || ''
    })

    const [presets, setPresets] = useState(data.presets || [])
    const [activePresetId, setActivePresetId] = useState(null)
    const [timelineData, setTimelineData] = useState(data.timelineData || {})

    const [showPresetModal, setShowPresetModal] = useState(false)
    const [showConfigModal, setShowConfigModal] = useState(false)
    const [selectedCells, setSelectedCells] = useState([])
    const [draggedContent, setDraggedContent] = useState(null)

    // Calcul du nombre de cases selon la configuration
    const getCellCount = () => {
        if (timelineConfig.intervalType === 'phases') {
            // 12 phases prédéfinies selon type de pipeline
            return 12
        }
        return timelineConfig.totalIntervals
    }

    const cellCount = getCellCount()
    const maxCellsPerPage = 365
    const needsPagination = cellCount > maxCellsPerPage

    // Générer les labels pour les cases
    const getCellLabel = (index) => {
        switch (timelineConfig.intervalType) {
            case 'secondes':
                return `${index + 1}s`
            case 'minutes':
                return `${index + 1}m`
            case 'heures':
                return `${index + 1}h`
            case 'jours':
                return `J${index + 1}`
            case 'semaines':
                return `S${index + 1}`
            case 'mois':
                return `M${index + 1}`
            case 'phases':
                const phases = ['Graine', 'Germination', 'Plantule', 'Début croissance', 'Mi-croissance', 'Fin croissance', 'Début stretch', 'Mi-stretch', 'Fin stretch', 'Début floraison', 'Mi-floraison', 'Fin floraison']
                return phases[index] || `Phase ${index + 1}`
            case 'dates':
                // Calculer la date basée sur startDate + index jours
                if (timelineConfig.startDate) {
                    const date = new Date(timelineConfig.startDate)
                    date.setDate(date.getDate() + index)
                    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                }
                return `J${index + 1}`
            default:
                return index + 1
        }
    }

    // Sauvegarder un préréglage
    const handleSavePreset = (name, description) => {
        const newPreset = {
            id: Date.now().toString(),
            name,
            description,
            createdAt: new Date().toISOString(),
            config: {
                // Toutes les données configurables
                ...Object.fromEntries(
                    availableDataFields.map(field => [field.name, field.defaultValue || ''])
                )
            }
        }

        const updatedPresets = [...presets, newPreset]
        setPresets(updatedPresets)
        updateParentData({ presets: updatedPresets })
        setShowPresetModal(false)
    }

    // Charger un préréglage
    const handleLoadPreset = (presetId) => {
        setActivePresetId(presetId)
    }

    // Appliquer un préréglage à une ou plusieurs cases
    const handleApplyPresetToCells = (presetId, cellIndices) => {
        const preset = presets.find(p => p.id === presetId)
        if (!preset) return

        const newTimelineData = { ...timelineData }
        cellIndices.forEach(index => {
            newTimelineData[index] = {
                ...newTimelineData[index],
                presetId: preset.id,
                data: { ...preset.config }
            }
        })

        setTimelineData(newTimelineData)
        updateParentData({ timelineData: newTimelineData })
    }

    // Gérer le drag depuis le panneau de contenus
    const handleDragStart = (content) => {
        setDraggedContent(content)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleDrop = (cellIndex) => {
        if (!draggedContent) return

        const newTimelineData = { ...timelineData }
        if (!newTimelineData[cellIndex]) {
            newTimelineData[cellIndex] = { data: {} }
        }

        // Ajouter ou modifier la donnée
        newTimelineData[cellIndex].data[draggedContent.name] = draggedContent.defaultValue || ''

        setTimelineData(newTimelineData)
        updateParentData({ timelineData: newTimelineData })
        setDraggedContent(null)
    }

    // Sélection multiple de cases
    const handleCellClick = (index, e) => {
        if (e.shiftKey && selectedCells.length > 0) {
            // Sélection de range
            const lastSelected = selectedCells[selectedCells.length - 1]
            const start = Math.min(lastSelected, index)
            const end = Math.max(lastSelected, index)
            const range = Array.from({ length: end - start + 1 }, (_, i) => start + i)
            setSelectedCells(range)
        } else if (e.ctrlKey || e.metaKey) {
            // Ajout/retrait à la sélection
            setSelectedCells(prev =>
                prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index]
            )
        } else {
            // Sélection simple
            setSelectedCells([index])
        }
    }

    // Mise à jour des données parent
    const updateParentData = (updates) => {
        onChange({
            ...data,
            intervalType: timelineConfig.intervalType,
            totalIntervals: timelineConfig.totalIntervals,
            startDate: timelineConfig.startDate,
            endDate: timelineConfig.endDate,
            ...updates
        })
    }

    // Mise à jour de la configuration de la timeline
    const handleTimelineConfigChange = (field, value) => {
        const newConfig = { ...timelineConfig, [field]: value }

        // Calcul automatique pour les dates
        if (field === 'intervalType' && value === 'dates') {
            // Par défaut, calculer 90 jours
            if (newConfig.startDate && !newConfig.endDate) {
                const start = new Date(newConfig.startDate)
                const end = new Date(start)
                end.setDate(end.getDate() + 90)
                newConfig.endDate = end.toISOString().split('T')[0]
                newConfig.totalIntervals = 90
            }
        }

        if (field === 'startDate' && newConfig.endDate) {
            const start = new Date(value)
            const end = new Date(newConfig.endDate)
            const diffTime = Math.abs(end - start)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            newConfig.totalIntervals = diffDays
        }

        if (field === 'endDate' && newConfig.startDate) {
            const start = new Date(newConfig.startDate)
            const end = new Date(value)
            const diffTime = Math.abs(end - start)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            newConfig.totalIntervals = diffDays
        }

        setTimelineConfig(newConfig)
        updateParentData(newConfig)
    }

    return (
        <div className="flex h-[600px] gap-4">
            {/* Panneau latéral gauche: Préréglages et Contenus */}
            <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                <div className="p-4 space-y-4">
                    {/* Onglet Préréglages */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Préréglages
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowPresetModal(true)}
                                className="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {presets.length === 0 ? (
                            <p className="text-xs italic text-gray-500 dark:text-gray-400">
                                Aucun préréglage sauvegardé
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {presets.map(preset => (
                                    <div
                                        key={preset.id}
                                        draggable
                                        onDragStart={() => handleLoadPreset(preset.id)}
                                        className={`p-3 border rounded-lg cursor-move transition-all ${activePresetId === preset.id
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {preset.name}
                                                </p>
                                                {preset.description && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                                        {preset.description}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPresets(prev => prev.filter(p => p.id !== preset.id))
                                                }}
                                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Onglet Contenus */}
                    <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Contenus
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Glissez les éléments vers les cases →
                        </p>

                        {/* Liste des contenus disponibles par section */}
                        <div className="space-y-3">
                            {availableDataFields.reduce((acc, field) => {
                                const section = field.section || 'Général'
                                if (!acc[section]) acc[section] = []
                                acc[section].push(field)
                                return acc
                            }, Object.create(null)).map = Object.entries}

                            {Object.entries(
                                availableDataFields.reduce((acc, field) => {
                                    const section = field.section || 'Général'
                                    if (!acc[section]) acc[section] = []
                                    acc[section].push(field)
                                    return acc
                                }, {})
                            ).map(([section, fields]) => (
                                <div key={section} className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {section}
                                    </p>
                                    {fields.map(field => (
                                        <div
                                            key={field.name}
                                            draggable
                                            onDragStart={() => handleDragStart(field)}
                                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded cursor-move hover:border-primary-400 hover:shadow-sm transition-all text-xs"
                                        >
                                            <span className="text-gray-900 dark:text-white">{field.label}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Bouton création préréglage global */}
                        <button
                            type="button"
                            onClick={() => setShowConfigModal(true)}
                            className="w-full mt-4 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Créer un préréglage global
                        </button>
                    </div>
                </div>
            </div>

            {/* Zone principale: Timeline */}
            <div className="flex-1 overflow-auto">
                <div className="p-4 space-y-4">
                    {/* Configuration de la timeline */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Pipeline {pipelineType.charAt(0).toUpperCase() + pipelineType.slice(1)}
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Type d'intervalles
                                </label>
                                <select
                                    value={timelineConfig.intervalType}
                                    onChange={(e) => handleTimelineConfigChange('intervalType', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="secondes">Secondes</option>
                                    <option value="minutes">Minutes</option>
                                    <option value="heures">Heures</option>
                                    <option value="jours">Jours</option>
                                    <option value="semaines">Semaines</option>
                                    <option value="mois">Mois</option>
                                    <option value="phases">Phases</option>
                                    <option value="dates">Dates</option>
                                </select>
                            </div>

                            {timelineConfig.intervalType !== 'phases' && timelineConfig.intervalType !== 'dates' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nombre (max {maxCellsPerPage})
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={maxCellsPerPage}
                                        value={timelineConfig.totalIntervals}
                                        onChange={(e) => handleTimelineConfigChange('totalIntervals', parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                            )}

                            {timelineConfig.intervalType === 'dates' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Date de début
                                        </label>
                                        <input
                                            type="date"
                                            value={timelineConfig.startDate}
                                            onChange={(e) => handleTimelineConfigChange('startDate', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Date de fin
                                        </label>
                                        <input
                                            type="date"
                                            value={timelineConfig.endDate}
                                            onChange={(e) => handleTimelineConfigChange('endDate', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {selectedCells.length > 0 && activePresetId && (
                            <button
                                type="button"
                                onClick={() => {
                                    handleApplyPresetToCells(activePresetId, selectedCells)
                                    setSelectedCells([])
                                }}
                                className="mt-3 w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                                Assigner le préréglage aux {selectedCells.length} case(s) sélectionnée(s)
                            </button>
                        )}

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>
                                <strong>{cellCount}</strong> {cellCount > 1 ? 'cases' : 'case'} • <strong>0/{cellCount}</strong> remplies
                            </span>
                            {needsPagination && (
                                <span className="text-orange-600 dark:text-orange-400">
                                    ⚠️ Pagination requise
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Timeline GitHub-style */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="grid gap-1" style={{
                            gridTemplateColumns: `repeat(auto-fill, minmax(${timelineConfig.intervalType === 'phases' ? '80px' : '32px'
                                }, 1fr))`
                        }}>
                            {Array.from({ length: Math.min(cellCount, maxCellsPerPage) }, (_, i) => {
                                const cellData = timelineData[i]
                                const hasData = cellData && Object.keys(cellData.data || {}).length > 0
                                const isSelected = selectedCells.includes(i)

                                return (
                                    <div
                                        key={i}
                                        onClick={(e) => handleCellClick(i, e)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(i)}
                                        className={`
                                            aspect-square rounded cursor-pointer transition-all
                                            ${hasData
                                                ? 'bg-green-500 hover:bg-green-600'
                                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }
                                            ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                                        `}
                                        title={`${getCellLabel(i)}${hasData ? ' - Configuré' : ''}`}
                                    >
                                        {timelineConfig.intervalType === 'phases' && (
                                            <span className="text-[8px] text-gray-700 dark:text-gray-300 p-0.5 block truncate">
                                                {getCellLabel(i)}
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Bouton pour ajouter plus de cases */}
                        {!needsPagination && timelineConfig.intervalType !== 'phases' && (
                            <button
                                type="button"
                                onClick={() => handleTimelineConfigChange('totalIntervals', timelineConfig.totalIntervals + 1)}
                                className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter une case
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de création de préréglage global */}
            {showConfigModal && (
                <PresetConfigModal
                    fields={availableDataFields}
                    onSave={handleSavePreset}
                    onClose={() => setShowConfigModal(false)}
                />
            )}

            {/* Modal simple de nom de préréglage (pour drag depuis existant) */}
            {showPresetModal && (
                <SimplePresetModal
                    onSave={handleSavePreset}
                    onClose={() => setShowPresetModal(false)}
                />
            )}
        </div>
    )
}

// Modal pour configurer TOUTES les données d'un préréglage
function PresetConfigModal({ fields, onSave, onClose }) {
    const [presetName, setPresetName] = useState('')
    const [presetDescription, setPresetDescription] = useState('')
    const [presetData, setPresetData] = useState({})

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!presetName.trim()) return
        onSave(presetName, presetDescription)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Créer un préréglage global
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Définissez toutes les valeurs par défaut pour ce préréglage
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nom du préréglage *
                            </label>
                            <input
                                type="text"
                                value={presetName}
                                onChange={(e) => setPresetName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="ex: Culture Indoor LED Bio"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description (optionnel)
                            </label>
                            <textarea
                                value={presetDescription}
                                onChange={(e) => setPresetDescription(e.target.value)}
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Décrivez votre configuration..."
                            />
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                Configuration des données
                            </h4>

                            {/* Grouper par section */}
                            {Object.entries(
                                fields.reduce((acc, field) => {
                                    const section = field.section || 'Général'
                                    if (!acc[section]) acc[section] = []
                                    acc[section].push(field)
                                    return acc
                                }, {})
                            ).map(([section, sectionFields]) => (
                                <div key={section} className="mb-4">
                                    <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                        {section}
                                    </h5>
                                    <div className="grid grid-cols-2 gap-3">
                                        {sectionFields.map(field => (
                                            <div key={field.name}>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {field.label}
                                                </label>
                                                {field.type === 'select' ? (
                                                    <select
                                                        value={presetData[field.name] || field.defaultValue || ''}
                                                        onChange={(e) => setPresetData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    >
                                                        <option value="">Sélectionner...</option>
                                                        {field.options?.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : field.type === 'number' ? (
                                                    <input
                                                        type="number"
                                                        value={presetData[field.name] || field.defaultValue || ''}
                                                        onChange={(e) => setPresetData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                                        placeholder={field.placeholder}
                                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={presetData[field.name] || field.defaultValue || ''}
                                                        onChange={(e) => setPresetData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                                        placeholder={field.placeholder}
                                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                        >
                            <Save className="w-4 h-4 inline mr-2" />
                            Sauvegarder
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Modal simple pour nommer un préréglage
function SimplePresetModal({ onSave, onClose }) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!name.trim()) return
        onSave(name, description)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Nouveau préréglage
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nom *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Nom du préréglage"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Description optionnelle"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            >
                                Créer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
