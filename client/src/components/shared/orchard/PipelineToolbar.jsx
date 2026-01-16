import { useState } from 'react'
import { Save, Download, Upload, CheckSquare, Square } from 'lucide-react'
import { useToast } from '../ToastContainer'

/**
 * PipelineToolbar - Barre d'outils pour gérer les PipeLine
 * Fonctionnalités :
 * - Sauvegarder/Charger des presets (substrat, engrais, paramètres environnement)
 * - Appliquer à toutes les cases
 * - Appliquer à une sélection de cases
 */
export default function PipelineToolbar({
    currentCellData = {},
    onApplyToAll,
    onApplyToSelection,
    onSavePreset,
    onLoadPreset,
    presets = []
}) {
    const toast = useToast()
    const [showPresets, setShowPresets] = useState(false)
    const [showApplyMenu, setShowApplyMenu] = useState(false)
    const [presetName, setPresetName] = useState('')
    const [selectedFields, setSelectedFields] = useState([])

    // Champs disponibles pour sauvegarde/application
    const availableFields = [
        { key: 'temperature', label: 'Température', category: 'environnement' },
        { key: 'humidite', label: 'Humidité', category: 'environnement' },
        { key: 'co2', label: 'CO₂', category: 'environnement' },
        { key: 'typeVentilation', label: 'Ventilation', category: 'environnement' },
        { key: 'typeLampe', label: 'Type lampe', category: 'lumiere' },
        { key: 'spectreLumiere', label: 'Spectre lumière', category: 'lumiere' },
        { key: 'distanceLampe', label: 'Distance lampe', category: 'lumiere' },
        { key: 'puissanceLumiere', label: 'Puissance lumière', category: 'lumiere' },
        { key: 'dureeEclairage', label: 'Durée éclairage', category: 'lumiere' },
        { key: 'dli', label: 'DLI', category: 'lumiere' },
        { key: 'ppfd', label: 'PPFD', category: 'lumiere' },
        { key: 'kelvin', label: 'Kelvin', category: 'lumiere' },
        { key: 'typeIrrigation', label: 'Type irrigation', category: 'irrigation' },
        { key: 'frequenceIrrigation', label: 'Fréquence irrigation', category: 'irrigation' },
        { key: 'volumeEau', label: 'Volume eau', category: 'irrigation' },
        { key: 'typeEngrais', label: 'Type engrais', category: 'engrais' },
        { key: 'marqueEngrais', label: 'Marque engrais', category: 'engrais' },
        { key: 'dosageEngrais', label: 'Dosage engrais', category: 'engrais' },
        { key: 'frequenceEngrais', label: 'Fréquence engrais', category: 'engrais' },
        { key: 'methodePalissage', label: 'Méthode palissage', category: 'palissage' },
        { key: 'descriptionPalissage', label: 'Description palissage', category: 'palissage' }
    ]

    const categories = [
        { key: 'environnement', label: '🌡️ Environnement', color: 'blue' },
        { key: 'lumiere', label: '💡 Lumière', color: 'yellow' },
        { key: 'irrigation', label: '💧 Irrigation', color: 'cyan' },
        { key: 'engrais', label: '🧪 Engrais', color: 'green' },
        { key: 'palissage', label: '✂️ Palissage', color: 'purple' }
    ]

    const toggleField = (fieldKey) => {
        setSelectedFields(prev =>
            prev.includes(fieldKey)
                ? prev.filter(k => k !== fieldKey)
                : [...prev, fieldKey]
        )
    }

    const selectAllFields = () => {
        setSelectedFields(availableFields.map(f => f.key))
    }

    const deselectAllFields = () => {
        setSelectedFields([])
    }

    const handleSavePreset = () => {
        if (!presetName.trim()) {
            toast.warning('Veuillez entrer un nom pour le preset')
            return
        }
        if (selectedFields.length === 0) {
            toast.warning('Veuillez sélectionner au moins un champ')
            return
        }

        const presetData = {}
        selectedFields.forEach(key => {
            if (currentCellData[key] !== undefined && currentCellData[key] !== '') {
                presetData[key] = currentCellData[key]
            }
        })

        if (Object.keys(presetData).length === 0) {
            toast.warning('Aucune donnée à sauvegarder dans les champs sélectionnés')
            return
        }

        onSavePreset({
            id: Date.now(),
            name: presetName,
            fields: selectedFields,
            data: presetData,
            createdAt: new Date().toISOString()
        })

        toast.success(`✅ Preset "${presetName}" sauvegardé!`)
        setPresetName('')
        setShowPresets(false)
    }

    const handleLoadPreset = (preset) => {
        onLoadPreset(preset)
        toast.success(`✅ Preset "${preset.name}" chargé!`)
        setShowPresets(false)
    }

    const handleApplyToAll = () => {
        if (selectedFields.length === 0) {
            toast.warning('Veuillez sélectionner au moins un champ')
            return
        }

        const dataToApply = {}
        selectedFields.forEach(key => {
            if (currentCellData[key] !== undefined && currentCellData[key] !== '') {
                dataToApply[key] = currentCellData[key]
            }
        })

        if (Object.keys(dataToApply).length === 0) {
            toast.warning('Aucune donnée à appliquer dans les champs sélectionnés')
            return
        }

        onApplyToAll(dataToApply)
        toast.success(`✅ Données appliquées à toutes les cases!`)
        setShowApplyMenu(false)
    }

    const handleApplyToSelection = () => {
        if (selectedFields.length === 0) {
            toast.warning('Veuillez sélectionner au moins un champ')
            return
        }

        const dataToApply = {}
        selectedFields.forEach(key => {
            if (currentCellData[key] !== undefined && currentCellData[key] !== '') {
                dataToApply[key] = currentCellData[key]
            }
        })

        if (Object.keys(dataToApply).length === 0) {
            toast.warning('Aucune donnée à appliquer dans les champs sélectionnés')
            return
        }

        onApplyToSelection(dataToApply)
        toast.info('🎯 Cliquez sur les cases où appliquer ces données')
        setShowApplyMenu(false)
    }

    return (
        <div className="bg-gradient-to-r p-4 rounded-xl border-2 shadow-lg mb-6">
            <div className="flex flex-wrap items-center gap-3">
                {/* Bouton Sauvegarder Preset */}
                <button
                    type="button"
                    onClick={() => {
                        setShowPresets(!showPresets)
                        setShowApplyMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
                >
                    <Save className="w-4 h-4" />
                    Gérer Presets
                </button>

                {/* Bouton Appliquer */}
                <button
                    type="button"
                    onClick={() => {
                        setShowApplyMenu(!showApplyMenu)
                        setShowPresets(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover: transition-colors shadow-md"
                >
                    <Upload className="w-4 h-4" />
                    Appliquer aux cases
                </button>

                <div className="text-sm text-gray-600">
                    {selectedFields.length > 0 && (
                        <span className="bg-white px-3 py-1 rounded-full border-2 font-medium">
                            {selectedFields.length} champ(s) sélectionné(s)
                        </span>
                    )}
                </div>
            </div>

            {/* Panel Presets */}
            {showPresets && (
                <div className="mt-4 bg-white p-4 rounded-xl border-2 border-green-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">💾 Presets sauvegardés</h3>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={selectAllFields}
                                className="text-xs px-3 py-1 rounded-lg hover:"
                            >
                                Tout sélectionner
                            </button>
                            <button
                                type="button"
                                onClick={deselectAllFields}
                                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Tout déselectionner
                            </button>
                        </div>
                    </div>

                    {/* Sélection des champs par catégorie */}
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categories.map(category => (
                            <div key={category.key} className="bg-gray-50 p-3 rounded-lg border">
                                <h4 className="text-sm font-bold text-gray-700 mb-2">{category.label}</h4>
                                <div className="space-y-1">
                                    {availableFields
                                        .filter(f => f.category === category.key)
                                        .map(field => (
                                            <label
                                                key={field.key}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-white px-2 py-1 rounded transition-colors"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleField(field.key)}
                                                    className=""
                                                >
                                                    {selectedFields.includes(field.key) ? (
                                                        <CheckSquare className="w-4 h-4" />
                                                    ) : (
                                                        <Square className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <span className="text-sm text-gray-700">{field.label}</span>
                                            </label>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sauvegarder nouveau preset */}
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-bold text-gray-700 mb-2">💾 Sauvegarder comme nouveau preset</h4>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={presetName}
                                onChange={(e) => setPresetName(e.target.value)}
                                placeholder="Ex: Veg Semaine 3, Flo Semaine 5..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleSavePreset}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                            >
                                Sauvegarder
                            </button>
                        </div>
                    </div>

                    {/* Liste des presets sauvegardés */}
                    {presets.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                            <h4 className="text-sm font-bold text-gray-700 mb-2">📋 Presets disponibles</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {presets.map(preset => (
                                    <div
                                        key={preset.id}
                                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">{preset.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {preset.fields.length} champ(s) • {new Date(preset.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleLoadPreset(preset)}
                                            className="flex items-center gap-2 px-3 py-1 text-white rounded-lg text-sm hover:"
                                        >
                                            <Download className="w-4 h-4" />
                                            Charger
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Panel Application */}
            {showApplyMenu && (
                <div className="mt-4 bg-white p-4 rounded-xl border-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Appliquer les données</h3>

                    <div className="flex gap-2 mb-4">
                        <button
                            type="button"
                            onClick={selectAllFields}
                            className="text-xs px-3 py-1 rounded-lg hover:"
                        >
                            Tout sélectionner
                        </button>
                        <button
                            type="button"
                            onClick={deselectAllFields}
                            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            Tout déselectionner
                        </button>
                    </div>

                    {/* Sélection des champs */}
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categories.map(category => (
                            <div key={category.key} className="bg-gray-50 p-3 rounded-lg border">
                                <h4 className="text-sm font-bold text-gray-700 mb-2">{category.label}</h4>
                                <div className="space-y-1">
                                    {availableFields
                                        .filter(f => f.category === category.key)
                                        .map(field => (
                                            <label
                                                key={field.key}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-white px-2 py-1 rounded transition-colors"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleField(field.key)}
                                                    className=""
                                                >
                                                    {selectedFields.includes(field.key) ? (
                                                        <CheckSquare className="w-4 h-4" />
                                                    ) : (
                                                        <Square className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <span className="text-sm text-gray-700">{field.label}</span>
                                                {currentCellData[field.key] && (
                                                    <span className="ml-auto text-xs px-2 py-0.5 rounded">
                                                        {currentCellData[field.key]}
                                                    </span>
                                                )}
                                            </label>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Boutons d'application */}
                    <div className="flex gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={handleApplyToAll}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-md"
                        >
                            <CheckSquare className="w-5 h-5" />
                            Appliquer à TOUTES les cases
                        </button>

                        <button
                            type="button"
                            onClick={handleApplyToSelection}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-medium hover: transition-colors shadow-md"
                        >
                            <Square className="w-5 h-5" />
                            Appliquer à une sélection
                        </button>
                    </div>

                    <p className="text-xs text-gray-600 mt-3 text-center">
                        ℹ️ Seuls les champs sélectionnés avec des valeurs définies seront appliqués
                    </p>
                </div>
            )}
        </div>
    )
}


