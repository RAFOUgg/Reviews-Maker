import { useState } from 'react'

/**
 * TimelineGrid - Composant de timeline visuelle type GitHub commits
 * Permet de visualiser et modifier des données à chaque point temporel
 * @param {Object} props
 * @param {Array} props.data - Données de la timeline [{timestamp, date, ...fields}]
 * @param {Function} props.onChange - Callback pour modification (timestamp, field, value)
 * @param {Object} props.config - Configuration de la trame {type: 'jour'|'semaine'|'phase', start, end}
 * @param {Array} props.editableFields - Liste des champs modifiables avec leurs types
 * @param {Array} props.generalConfigFields - Champs de configuration générale (affichés uniquement dans cellule #0)
 * @param {Object} props.generalConfigData - Données de configuration générale
 * @param {Function} props.onGeneralConfigChange - Callback pour modification config générale (field, value)
 * @param {Function} props.onConfigChange - Callback pour modification config timeline (field, value)
 */
export default function TimelineGrid({ 
    data = [], 
    onChange, 
    config, 
    editableFields = [],
    generalConfigFields = [],
    generalConfigData = {},
    onGeneralConfigChange,
    onConfigChange
}) {
    const [selectedCell, setSelectedCell] = useState(null)
    const [selectedCellIndex, setSelectedCellIndex] = useState(null)
    const [hoveredCell, setHoveredCell] = useState(null)

    // Phases prédéfinies (12 phases fixes)
    const PHASES_PREDEFINIES = [
        { id: 'graine', nom: 'Graine', icon: '🌰' },
        { id: 'germination', nom: 'Germination', icon: '🌱' },
        { id: 'plantule', nom: 'Plantule', icon: '🌿' },
        { id: 'debut-croissance', nom: 'Début croissance', icon: '🌿' },
        { id: 'milieu-croissance', nom: 'Milieu croissance', icon: '🌳' },
        { id: 'fin-croissance', nom: 'Fin croissance', icon: '🌳' },
        { id: 'debut-stretch', nom: 'Début stretch', icon: '📈' },
        { id: 'milieu-stretch', nom: 'Milieu stretch', icon: '📈' },
        { id: 'fin-stretch', nom: 'Fin stretch', icon: '📈' },
        { id: 'debut-floraison', nom: 'Début floraison', icon: '🌸' },
        { id: 'milieu-floraison', nom: 'Milieu floraison', icon: '🌺' },
        { id: 'fin-floraison', nom: 'Fin floraison', icon: '💐' }
    ]

    // Générer les cellules de la timeline selon la configuration
    const generateCells = () => {
        if (!config) return []

        const cells = []

        switch (config.type) {
            case 'jour':
                // JOURS : date début ET fin obligatoires
                if (!config.start || !config.end) return []
                
                const start = new Date(config.start)
                const end = new Date(config.end)
                
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const daysSinceStart = Math.floor((d - start) / (1000 * 60 * 60 * 24))
                    cells.push({
                        timestamp: new Date(d).getTime(),
                        date: new Date(d).toISOString().split('T')[0],
                        label: `J+${daysSinceStart}`,
                        index: daysSinceStart
                    })
                }
                break

            case 'semaine':
                // SEMAINES : début obligatoire, fin facultative
                if (!config.start) return []
                
                const weekStart = new Date(config.start)
                const maxWeeks = config.end ? 
                    Math.ceil((new Date(config.end) - weekStart) / (1000 * 60 * 60 * 24 * 7)) :
                    52 // Max 52 semaines si pas de fin

                for (let w = 0; w < maxWeeks; w++) {
                    const weekDate = new Date(weekStart)
                    weekDate.setDate(weekDate.getDate() + w * 7)
                    cells.push({
                        timestamp: weekDate.getTime(),
                        date: weekDate.toISOString().split('T')[0],
                        label: `S${w + 1}`,
                        index: w
                    })
                }
                break

            case 'phase':
                // PHASES : 12 phases prédéfinies fixes
                PHASES_PREDEFINIES.forEach((phase, idx) => {
                    cells.push({
                        timestamp: Date.now() + idx, // Timestamp unique pour chaque phase
                        date: null, // Pas de date spécifique pour les phases
                        label: phase.nom,
                        icon: phase.icon,
                        phaseId: phase.id,
                        index: idx,
                        isPhase: true
                    })
                })
                break

            default:
                return []
        }

        return cells
    }

    const cells = generateCells()

    // Récupérer les données d'une cellule
    const getCellData = (timestamp) => {
        return data.find(d => d.timestamp === timestamp) || null
    }

    // Déterminer la couleur de la cellule selon l'intensité des données
    const getCellColor = (timestamp) => {
        const cellData = getCellData(timestamp)
        if (!cellData) return 'bg-gray-100'

        // Compter le nombre de champs remplis
        const filledFields = editableFields.filter(f => cellData[f.key] != null && cellData[f.key] !== '').length
        const intensity = filledFields / editableFields.length

        if (intensity === 0) return 'bg-gray-100'
        if (intensity < 0.25) return 'bg-green-200'
        if (intensity < 0.5) return 'bg-green-400'
        if (intensity < 0.75) return 'bg-green-600'
        return 'bg-green-800'
    }

    // Ouvrir le modal d'édition pour une cellule
    const handleCellClick = (timestamp, index) => {
        setSelectedCell(timestamp)
        setSelectedCellIndex(index)
    }

    // Fermer le modal
    const closeModal = () => {
        setSelectedCell(null)
        setSelectedCellIndex(null)
    }

    // Sauvegarder une modification
    const handleFieldChange = (field, value) => {
        onChange(selectedCell, field, value)
    }

    const selectedCellData = selectedCell ? getCellData(selectedCell) : null
    const selectedCellInfo = cells.find(c => c.timestamp === selectedCell)

    return (
        <div className="space-y-6">
            {/* Configuration de la trame */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <span>⚙️</span> Configuration de la timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">
                            Type d'intervalles
                        </label>
                        <select
                            value={config?.type || 'jour'}
                            onChange={(e) => onConfigChange && onConfigChange('type', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="jour">Jours (J+0, J+1...)</option>
                            <option value="semaine">Semaines (S1, S2...)</option>
                            <option value="phase">Phases prédéfinies (12 phases)</option>
                        </select>
                    </div>

                    {config?.type !== 'phase' && (
                        <>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                                    {config?.type === 'jour' ? 'Date début' : 'Semaine début'}
                                    {config?.type === 'jour' && <span className="text-red-600 ml-1">*</span>}
                                    {config?.type === 'semaine' && <span className="text-red-600 ml-1">*</span>}
                                </label>
                                <input
                                    type="date"
                                    value={config?.start || ''}
                                    onChange={(e) => onConfigChange && onConfigChange('start', e.target.value)}
                                    required={config?.type === 'jour' || config?.type === 'semaine'}
                                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                                    {config?.type === 'jour' ? 'Date fin' : 'Semaine fin (facultatif)'}
                                    {config?.type === 'jour' && <span className="text-red-600 ml-1">*</span>}
                                </label>
                                <input
                                    type="date"
                                    value={config?.end || ''}
                                    onChange={(e) => onConfigChange && onConfigChange('end', e.target.value)}
                                    required={config?.type === 'jour'}
                                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </>
                    )}

                    {config?.type === 'phase' && (
                        <div className="md:col-span-2 p-4 bg-purple-100 rounded-lg">
                            <p className="text-sm text-purple-800 font-medium">
                                📋 Mode Phases : 12 phases prédéfinies (Graine → Fin floraison)
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                                Chaque phase aura sa propre case dans la timeline
                            </p>
                        </div>
                    )}
                </div>

                {/* Validation messages */}
                {config?.type === 'jour' && (!config?.start || !config?.end) && (
                    <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                        <p className="text-sm text-yellow-800">
                            ⚠️ <strong>Mode Jours</strong> : Date début ET date fin sont obligatoires
                        </p>
                    </div>
                )}
                {config?.type === 'semaine' && !config?.start && (
                    <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                        <p className="text-sm text-yellow-800">
                            ⚠️ <strong>Mode Semaines</strong> : Semaine début obligatoire (la fin est facultative, max 52 semaines si non précisée)
                        </p>
                    </div>
                )}
            </div>

            {/* Timeline Grid type GitHub */}
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📊</span> Timeline visuelle ({cells.length} points)
                </h3>

                {cells.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg">⚠️ Configurez la période pour voir la timeline</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="inline-grid gap-1" style={{
                            gridTemplateColumns: `repeat(${Math.min(cells.length, 53)}, minmax(14px, 1fr))`
                        }}>
                            {cells.map((cell, index) => (
                                <div
                                    key={cell.timestamp}
                                    onClick={() => handleCellClick(cell.timestamp, index)}
                                    onMouseEnter={() => setHoveredCell(cell)}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    className={`w-3.5 h-3.5 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-purple-500 hover:scale-125 ${getCellColor(cell.timestamp)} ${selectedCell === cell.timestamp ? 'ring-2 ring-blue-600 scale-125' : ''
                                        }`}
                                    title={`${cell.label} - ${cell.date}`}
                                />
                            ))}
                        </div>

                        {/* Tooltip au survol */}
                        {hoveredCell && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-300">
                                <p className="text-sm font-semibold text-gray-800">{hoveredCell.label}</p>
                                <p className="text-xs text-gray-600">{hoveredCell.date}</p>
                                {getCellData(hoveredCell.timestamp) && (
                                    <p className="text-xs text-green-600 mt-1">✓ Contient des données</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal d'édition */}
            {selectedCell && selectedCellInfo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedCellInfo.label}</h2>
                                    <p className="text-purple-100 text-sm">{selectedCellInfo.date}</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <span className="text-2xl">✕</span>
                                </button>
                            </div>
                        </div>

                        {/* Formulaire de saisie */}
                        <div className="p-6 space-y-6">
                            <p className="text-sm text-gray-600 italic">
                                📝 Modifiez les données pour ce point de la timeline
                            </p>

                            {/* Configuration générale (uniquement cellule #0) */}
                            {selectedCellIndex === 0 && generalConfigFields.length > 0 && (
                                <div className="border-l-4 border-purple-500 pl-4 bg-purple-50/50 p-4 rounded-lg space-y-4">
                                    <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2">
                                        <span>⚙️</span> Configuration générale (point de départ)
                                    </h3>
                                    <p className="text-xs text-purple-700 italic mb-3">
                                        Ces informations représentent la configuration initiale de votre culture
                                    </p>
                                    
                                    {generalConfigFields.map((field) => (
                                        <div key={field.key}>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                                                {field.icon && <span>{field.icon}</span>}
                                                {field.label}
                                                {field.required && <span className="text-red-600 ml-1">*</span>}
                                            </label>

                                            {field.type === 'select' && (
                                                <select
                                                    value={generalConfigData?.[field.key] || ''}
                                                    onChange={(e) => onGeneralConfigChange && onGeneralConfigChange(field.key, e.target.value)}
                                                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    {field.options?.map(opt => (
                                                        <option key={opt.value || opt} value={opt.value || opt}>
                                                            {opt.label || opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                            {field.type === 'number' && (
                                                <input
                                                    type="number"
                                                    step={field.step || '1'}
                                                    min={field.min}
                                                    max={field.max}
                                                    value={generalConfigData?.[field.key] || ''}
                                                    onChange={(e) => onGeneralConfigChange && onGeneralConfigChange(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            )}

                                            {field.type === 'text' && (
                                                <input
                                                    type="text"
                                                    value={generalConfigData?.[field.key] || ''}
                                                    onChange={(e) => onGeneralConfigChange && onGeneralConfigChange(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            )}

                                            {field.type === 'textarea' && (
                                                <textarea
                                                    value={generalConfigData?.[field.key] || ''}
                                                    onChange={(e) => {
                                                        if (!field.maxLength || e.target.value.length <= field.maxLength) {
                                                            onGeneralConfigChange && onGeneralConfigChange(field.key, e.target.value)
                                                        }
                                                    }}
                                                    placeholder={field.placeholder}
                                                    rows={field.rows || 3}
                                                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Séparateur entre config et timeline data (cellule #0) */}
                            {selectedCellIndex === 0 && generalConfigFields.length > 0 && (
                                <div className="border-t-2 border-dashed border-gray-300 my-4 pt-4">
                                    <h3 className="text-md font-bold text-gray-700 flex items-center gap-2 mb-3">
                                        <span>📊</span> Données du point {selectedCellInfo?.label}
                                    </h3>
                                </div>
                            )}

                            {/* Champs éditables standards de la timeline */}
                            {editableFields.map((field) => (
                                <div key={field.key}>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                                        {field.icon && <span>{field.icon}</span>}
                                        {field.label}
                                    </label>

                                    {field.type === 'select' && (
                                        <select
                                            value={selectedCellData?.[field.key] || ''}
                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {field.options?.map(opt => (
                                                <option key={opt.value || opt} value={opt.value || opt}>
                                                    {opt.label || opt}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {field.type === 'number' && (
                                        <input
                                            type="number"
                                            step={field.step || '1'}
                                            min={field.min}
                                            max={field.max}
                                            value={selectedCellData?.[field.key] || ''}
                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    )}

                                    {field.type === 'text' && (
                                        <input
                                            type="text"
                                            value={selectedCellData?.[field.key] || ''}
                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    )}

                                    {field.type === 'textarea' && (
                                        <textarea
                                            value={selectedCellData?.[field.key] || ''}
                                            onChange={(e) => {
                                                if (!field.maxLength || e.target.value.length <= field.maxLength) {
                                                    handleFieldChange(field.key, e.target.value)
                                                }
                                            }}
                                            placeholder={field.placeholder}
                                            rows={field.rows || 3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    )}

                                    {field.type === 'range' && (
                                        <div className="space-y-2">
                                            <input
                                                type="range"
                                                min={field.min || 0}
                                                max={field.max || 100}
                                                step={field.step || 1}
                                                value={selectedCellData?.[field.key] || field.min || 0}
                                                onChange={(e) => handleFieldChange(field.key, parseInt(e.target.value))}
                                                className="w-full h-2 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full appearance-none cursor-pointer"
                                            />
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{field.min || 0}</span>
                                                <span className="font-bold text-purple-600">{selectedCellData?.[field.key] || field.min || 0}</span>
                                                <span>{field.max || 100}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Notes (toujours présent) */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                                    <span>📝</span> Notes & Observations (500 caractères max)
                                </label>
                                <textarea
                                    value={selectedCellData?.notes || ''}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 500) {
                                            handleFieldChange('notes', e.target.value)
                                        }
                                    }}
                                    placeholder="Observations, événements, paramètres..."
                                    rows="4"
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                    {(selectedCellData?.notes || '').length}/500
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                            >
                                ✓ Enregistrer et fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
