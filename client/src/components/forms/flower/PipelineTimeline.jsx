import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Settings, Save, Trash2, Calendar, Info } from 'lucide-react'

// ============ SOUS-COMPOSANTS MODAUX ============

// Modal pour configurer TOUTES les données d'un préréglage
const PresetConfigModal = ({ fields, onSave, onClose }) => {
    const [presetName, setPresetName] = useState('')
    const [presetDescription, setPresetDescription] = useState('')
    const [presetData, setPresetData] = useState({})

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!presetName.trim()) return
        // Passer nom, description ET les données configurées
        onSave(presetName, presetDescription, presetData)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        📦 Nouveau préréglage
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Définissez toutes les données de la pipeline. Ce préréglage sera sauvegardé dans votre bibliothèque.
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
                                                ) : field.type === 'multiselect' ? (
                                                    <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded p-2">
                                                        {field.options?.map(opt => (
                                                            <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(Array.isArray(presetData[field.name]) ? presetData[field.name] : []).includes(opt)}
                                                                    onChange={(e) => {
                                                                        const current = Array.isArray(presetData[field.name]) ? presetData[field.name] : []
                                                                        const newValue = e.target.checked
                                                                            ? [...current, opt]
                                                                            : current.filter(v => v !== opt)
                                                                        setPresetData(prev => ({ ...prev, [field.name]: newValue }))
                                                                    }}
                                                                    className="w-3 h-3"
                                                                />
                                                                <span>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
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
                            Sauvegarder le préréglage
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Modal pour définir la valeur d'un contenu (clic droit)
const ContentValueModal = ({ content, onSave, onClose, selectedCellsCount }) => {
    const [value, setValue] = useState(content.defaultValue || '')

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(content.name, value)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Définir : {content.label}
                    </h3>
                    {content.help && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {content.help}
                        </p>
                    )}
                    {selectedCellsCount > 0 ? (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            ✓ Sera appliqué à {selectedCellsCount} case(s) sélectionnée(s)
                        </p>
                    ) : (
                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                            ⚠️ Veuillez d'abord sélectionner des cases sur la timeline
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Valeur {content.unit && <span className="text-xs">({content.unit})</span>}
                        </label>
                        {content.type === 'select' ? (
                            <select
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                autoFocus
                            >
                                <option value="">Sélectionner...</option>
                                {content.options?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : content.type === 'multiselect' ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-3">
                                {content.options?.map(opt => (
                                    <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={(Array.isArray(value) ? value : []).includes(opt)}
                                            onChange={(e) => {
                                                const currentArray = Array.isArray(value) ? value : []
                                                const newValue = e.target.checked
                                                    ? [...currentArray, opt]
                                                    : currentArray.filter(v => v !== opt)
                                                setValue(newValue)
                                            }}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        ) : content.type === 'number' ? (
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={content.placeholder}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                autoFocus
                            />
                        ) : content.type === 'date' ? (
                            <input
                                type="date"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                autoFocus
                            />
                        ) : content.type === 'composition' ? (
                            <div className="text-sm text-orange-600 dark:text-orange-400 p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                                ⚠️ Type "composition" nécessite un modal dédié (à implémenter)
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={content.placeholder}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                autoFocus
                            />
                        )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={selectedCellsCount === 0}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Appliquer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Modal menu contextuel clic droit sur contenu
const ContextMenu = ({ content, position, onClose, onAssignToRange, onDefineValue }) => {
    return (
        <>
            {/* Overlay transparent pour fermer au clic extérieur */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Menu contextuel */}
            <div
                className="fixed bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[280px]"
                style={{ top: position.y, left: position.x }}
            >
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {content.label}
                    </p>
                </div>

                <button
                    onClick={() => {
                        onAssignToRange(content)
                        onClose()
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <span>📍</span>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">Assigner à la trame</div>
                        <div className="text-xs text-gray-500">Définir plage de cases (ex: J7 à J45)</div>
                    </div>
                </button>

                <button
                    onClick={() => {
                        onDefineValue(content)
                        onClose()
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <span>💾</span>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">Définir valeur(s)</div>
                        <div className="text-xs text-gray-500">Enregistrer comme préréglage</div>
                    </div>
                </button>
            </div>
        </>
    )
}

// Modal pour assigner une donnée à une plage de cases
const AssignToRangeModal = ({ content, cellCount, onSave, onClose }) => {
    const [startCell, setStartCell] = useState(1)
    const [endCell, setEndCell] = useState(cellCount)
    const [value, setValue] = useState(content.defaultValue || '')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (startCell < 1 || endCell > cellCount || startCell > endCell) {
            alert('Plage de cases invalide')
            return
        }
        onSave(content.name, value, { start: startCell - 1, end: endCell - 1 })
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        📍 Assigner à la trame
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {content.label}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Case début
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={cellCount}
                                value={startCell}
                                onChange={(e) => setStartCell(parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Case fin
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={cellCount}
                                value={endCell}
                                onChange={(e) => setEndCell(parseInt(e.target.value) || cellCount)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Valeur à appliquer {content.unit && <span className="text-xs">({content.unit})</span>}
                        </label>
                        {content.type === 'select' ? (
                            <select
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Sélectionner...</option>
                                {content.options?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : content.type === 'number' ? (
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={content.placeholder}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        ) : (
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={content.placeholder}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        )}
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
                            Appliquer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ============ COMPOSANT PRINCIPAL ============

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

    const [showCreatePresetModal, setShowCreatePresetModal] = useState(false)
    const [selectedCells, setSelectedCells] = useState([])
    const [selectedContents, setSelectedContents] = useState([]) // Sélection multiple de contenus
    const [draggedContent, setDraggedContent] = useState(null)
    const [showContentValueModal, setShowContentValueModal] = useState(false)
    const [contentToEdit, setContentToEdit] = useState(null)

    // Nouveaux états pour menu contextuel
    const [showContextMenu, setShowContextMenu] = useState(false)
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
    const [contextMenuContent, setContextMenuContent] = useState(null)
    const [showAssignToRangeModal, setShowAssignToRangeModal] = useState(false)

    // Calcul du nombre de cases selon la configuration
    const getCellCount = () => {
        if (timelineConfig.intervalType === 'phases') {
            // 16 phases physiologiques selon PIPELINE_DONNEE_CULTURES.md
            return 16
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
                // 16 phases physiologiques exhaustives selon PIPELINE_DONNEE_CULTURES.md
                const phases = [
                    '0 day / Graine',
                    'Germination',
                    'Plantule',
                    'Croissance – Début',
                    'Croissance – Milieu',
                    'Croissance – Fin',
                    'Stretch – Début',
                    'Stretch – Milieu',
                    'Stretch – Fin',
                    'Floraison – Début',
                    'Floraison – Milieu',
                    'Floraison – Fin',
                    'Maturation',
                    'Rinçage',
                    'Séchage',
                    'Curing'
                ]
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
    // Sauvegarder un préréglage avec les données configurées
    const handleSavePreset = (name, description, configuredData = {}) => {
        const newPreset = {
            id: Date.now().toString(),
            name,
            description,
            createdAt: new Date().toISOString(),
            config: configuredData // Utiliser les données configurées dans le modal
        }

        const updatedPresets = [...presets, newPreset]
        setPresets(updatedPresets)
        updateParentData({ presets: updatedPresets })
        setShowCreatePresetModal(false)
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
        // Utiliser les contenus sélectionnés s'il y en a, sinon le contenu dragué
        const contentsToApply = selectedContents.length > 0 ? selectedContents : (draggedContent ? [draggedContent] : [])

        if (contentsToApply.length === 0) return

        const newTimelineData = { ...timelineData }

        // Appliquer à la case cliquée ou à toutes les cases sélectionnées
        const cellsToUpdate = selectedCells.length > 0 ? selectedCells : [cellIndex]

        cellsToUpdate.forEach(cellIdx => {
            if (!newTimelineData[cellIdx]) {
                newTimelineData[cellIdx] = { data: {} }
            }

            // Ajouter toutes les données sélectionnées
            contentsToApply.forEach(content => {
                newTimelineData[cellIdx].data[content.name] = content.defaultValue || ''
            })
        })

        setTimelineData(newTimelineData)
        updateParentData({ timelineData: newTimelineData })
        setDraggedContent(null)
        setSelectedContents([]) // Clear selection après drop
    }

    // Gestion de la sélection multiple de contenus (Ctrl+clic)
    const handleContentClick = (content, e) => {
        if (e.ctrlKey || e.metaKey) {
            // Toggle dans la sélection
            setSelectedContents(prev =>
                prev.find(c => c.name === content.name)
                    ? prev.filter(c => c.name !== content.name)
                    : [...prev, content]
            )
        } else {
            // Sélection simple
            setSelectedContents([content])
        }
    }

    // Clic droit pour ouvrir menu contextuel
    const handleContentRightClick = (content, e) => {
        e.preventDefault()
        setContextMenuContent(content)
        setContextMenuPosition({ x: e.clientX, y: e.clientY })
        setShowContextMenu(true)
    }

    // Handler: Assigner à la trame (plage de cases)
    const handleOpenAssignToRange = (content) => {
        setContentToEdit(content)
        setShowAssignToRangeModal(true)
    }

    // Handler: Définir valeur simple
    const handleOpenDefineValue = (content) => {
        setContentToEdit(content)
        setShowContentValueModal(true)
    }

    // Appliquer une valeur à une plage de cases
    const handleApplyToRange = (fieldName, value, range) => {
        const newTimelineData = { ...timelineData }

        for (let i = range.start; i <= range.end; i++) {
            if (!newTimelineData[i]) {
                newTimelineData[i] = { data: {} }
            }
            newTimelineData[i].data[fieldName] = value
        }

        setTimelineData(newTimelineData)
        updateParentData({ timelineData: newTimelineData })
        setShowAssignToRangeModal(false)
        setContentToEdit(null)
    }

    // Appliquer une valeur définie aux cases sélectionnées
    const handleApplyContentValue = (fieldName, value) => {
        if (selectedCells.length === 0) {
            alert('Veuillez sélectionner au moins une case sur la timeline')
            return
        }

        const newTimelineData = { ...timelineData }

        selectedCells.forEach(cellIdx => {
            if (!newTimelineData[cellIdx]) {
                newTimelineData[cellIdx] = { data: {} }
            }
            newTimelineData[cellIdx].data[fieldName] = value
        })

        setTimelineData(newTimelineData)
        updateParentData({ timelineData: newTimelineData })
        setShowContentValueModal(false)
        setContentToEdit(null)
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
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Mes préréglages
                        </h3>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2">
                            <p className="text-xs text-blue-800 dark:text-blue-200">
                                💡 <strong>Workflow :</strong><br />
                                1. Créer un préréglage (bouton en bas)<br />
                                2. Cliquer dessus pour l'activer<br />
                                3. Sélectionner des cases<br />
                                4. "Assigner aux X cases"
                            </p>
                        </div>

                        {presets.length === 0 ? (
                            <div className="py-6 text-center">
                                <p className="text-xs italic text-gray-500 dark:text-gray-400">
                                    Aucun préréglage enregistré
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                    Créez votre premier préréglage<br />
                                    via le bouton ci-dessous ↓
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {presets.map(preset => (
                                    <div
                                        key={preset.id}
                                        draggable
                                        onDragStart={() => handleLoadPreset(preset.id)}
                                        onClick={() => handleLoadPreset(preset.id)}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${activePresetId === preset.id
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex items-center gap-1">
                                                    {activePresetId === preset.id && <span className="text-primary-600">✓</span>}
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
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (window.confirm(`Supprimer le préréglage "${preset.name}" ?`)) {
                                                        setPresets(prev => prev.filter(p => p.id !== preset.id))
                                                        if (activePresetId === preset.id) {
                                                            setActivePresetId(null)
                                                        }
                                                        updateParentData({ presets: presets.filter(p => p.id !== preset.id) })
                                                    }
                                                }}
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3 text-red-600" />
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
                            • Glissez vers les cases →<br />
                            • Ctrl+clic pour sélection multiple<br />
                            • Clic droit → Définir la valeur
                        </p>

                        {/* Compteur de sélection */}
                        {selectedContents.length > 0 && (
                            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-2">
                                <p className="text-xs font-medium text-primary-900 dark:text-primary-100">
                                    {selectedContents.length} contenu(s) sélectionné(s)
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSelectedContents([])}
                                    className="text-xs text-primary-600 hover:underline mt-1"
                                >
                                    Désélectionner tout
                                </button>
                            </div>
                        )}

                        {/* Liste des contenus disponibles par section */}
                        <div className="space-y-3">
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
                                    {fields.map(field => {
                                        const isSelected = selectedContents.find(c => c.name === field.name)
                                        return (
                                            <div
                                                key={field.name}
                                                draggable
                                                onDragStart={() => handleDragStart(field)}
                                                onClick={(e) => handleContentClick(field, e)}
                                                onContextMenu={(e) => handleContentRightClick(field, e)}
                                                className={`px-3 py-2 border rounded cursor-move hover:shadow-sm transition-all text-xs ${isSelected
                                                    ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-400 dark:border-primary-600'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-400'
                                                    }`}
                                            >
                                                <span className={`${isSelected ? 'font-semibold text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-white'}`}>
                                                    {field.label}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Bouton unique de création de préréglage */}
                        <button
                            type="button"
                            onClick={() => setShowCreatePresetModal(true)}
                            className="w-full mt-4 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Créer un nouveau préréglage
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
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                <p className="text-xs text-green-800 dark:text-green-200 mb-2 font-medium">
                                    ✓ Préréglage actif : {presets.find(p => p.id === activePresetId)?.name}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleApplyPresetToCells(activePresetId, selectedCells)
                                        setSelectedCells([])
                                    }}
                                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold shadow-sm"
                                >
                                    🚀 Assigner aux {selectedCells.length} case(s) sélectionnée(s)
                                </button>
                            </div>
                        )}

                        {selectedCells.length > 0 && !activePresetId && (
                            <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                                <p className="text-xs text-orange-800 dark:text-orange-200">
                                    ⚠️ {selectedCells.length} case(s) sélectionnée(s)<br />
                                    Cliquez sur un préréglage pour l'activer
                                </p>
                            </div>
                        )}

                        {!selectedCells.length && activePresetId && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                <p className="text-xs text-blue-800 dark:text-blue-200">
                                    💡 Préréglage "{presets.find(p => p.id === activePresetId)?.name}" actif<br />
                                    Sélectionnez des cases pour l'appliquer
                                </p>
                            </div>
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

            {/* Modal unique de création de préréglage */}
            {showCreatePresetModal && (
                <PresetConfigModal
                    fields={availableDataFields}
                    onSave={handleSavePreset}
                    onClose={() => setShowCreatePresetModal(false)}
                />
            )}

            {/* Menu contextuel clic droit sur contenu */}
            {showContextMenu && contextMenuContent && (
                <ContextMenu
                    content={contextMenuContent}
                    position={contextMenuPosition}
                    onClose={() => {
                        setShowContextMenu(false)
                        setContextMenuContent(null)
                    }}
                    onAssignToRange={handleOpenAssignToRange}
                    onDefineValue={handleOpenDefineValue}
                />
            )}

            {/* Modal assigner à la trame (plage de cases) */}
            {showAssignToRangeModal && contentToEdit && (
                <AssignToRangeModal
                    content={contentToEdit}
                    cellCount={cellCount}
                    onSave={handleApplyToRange}
                    onClose={() => {
                        setShowAssignToRangeModal(false)
                        setContentToEdit(null)
                    }}
                />
            )}

            {/* Modal de définition de valeur pour un contenu */}
            {showContentValueModal && contentToEdit && (
                <ContentValueModal
                    content={contentToEdit}
                    onSave={handleApplyContentValue}
                    onClose={() => {
                        setShowContentValueModal(false)
                        setContentToEdit(null)
                    }}
                    selectedCellsCount={selectedCells.length}
                />
            )}
        </div>
    )
}
