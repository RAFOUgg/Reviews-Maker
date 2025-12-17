import { useState } from 'react'

/**
 * PresetSelector - Composant pour gérer les préréglages de pipeline
 * Affiche une liste de cases à cocher pour sélectionner/sauvegarder des préréglages
 * Conforme CDC : système de préréglages en haut de sidebar
 */
export default function PresetSelector({ presets = [], selectedPresets = [], onTogglePreset, onSaveNew, onDelete, onOpenConfigModal }) {
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [newPresetName, setNewPresetName] = useState('')
    const [newPresetDesc, setNewPresetDesc] = useState('')

    const handleSaveNewPreset = () => {
        if (!newPresetName.trim()) return

        // Au lieu de sauvegarder directement, ouvrir le modal de configuration complète
        if (onOpenConfigModal) {
            onOpenConfigModal({ name: newPresetName.trim(), description: newPresetDesc.trim() })
        }

        setNewPresetName('')
        setNewPresetDesc('')
        setShowSaveModal(false)
    }

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span>📋</span> Préréglages
                </h4>
                <button
                    onClick={() => setShowSaveModal(true)}
                    className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center gap-1"
                    title="Créer un nouveau préréglage"
                >
                    <span>+</span> Nouveau
                </button>
            </div>

            {/* Liste des préréglages */}
            {presets.length === 0 ? (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic py-2">
                    Aucun préréglage sauvegardé
                </div>
            ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {presets.map((preset) => (
                        <label
                            key={preset.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer group"
                        >
                            <input
                                type="checkbox"
                                checked={selectedPresets.includes(preset.id)}
                                onChange={() => onTogglePreset?.(preset.id)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {preset.name}
                                </div>
                                {preset.description && (
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                        {preset.description}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                    {preset.dataCount || 0}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (confirm(`Supprimer le préréglage "${preset.name}" ?`)) {
                                            onDelete?.(preset.id)
                                        }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 transition-opacity"
                                    title="Supprimer"
                                >
                                    🗑️
                                </button>
                            </div>
                        </label>
                    ))}
                </div>
            )}

            {/* Modal création nouveau préréglage */}
            {showSaveModal && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-[9999]" onClick={() => setShowSaveModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
                            💾 Nouveau préréglage
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nom *
                                </label>
                                <input
                                    type="text"
                                    value={newPresetName}
                                    onChange={(e) => setNewPresetName(e.target.value)}
                                    placeholder="Ex: Configuration été"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description (optionnel)
                                </label>
                                <textarea
                                    value={newPresetDesc}
                                    onChange={(e) => setNewPresetDesc(e.target.value)}
                                    placeholder="Configuration optimisée pour les températures estivales..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSaveNewPreset}
                                disabled={!newPresetName.trim()}
                                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                            >
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
