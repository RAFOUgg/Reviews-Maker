import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import './PipelinePresetSelector.css'

/**
 * PipelinePresetSelector - Modal de sélection des presets réutilisables
 * Permet de choisir parmi 9 groupes de données pré-configurées
 */
export default function PipelinePresetSelector({ onSelect, onClose }) {
    const [selectedPresets, setSelectedPresets] = useState({})

    // 9 groupes de presets disponibles
    const presetGroups = [
        {
            id: 'space',
            label: '🏠 Espace de Culture',
            presets: [
                { value: 'indoor-tent-60x60', label: 'Tente Indoor 60x60cm' },
                { value: 'indoor-tent-120x120', label: 'Tente Indoor 120x120cm' },
                { value: 'indoor-cabinet', label: 'Armoire de Culture 100cm' },
                { value: 'outdoor-ground', label: 'Culture Extérieure (Sol)' },
                { value: 'greenhouse', label: 'Serre Greenhouse 3x2m' }
            ]
        },
        {
            id: 'substrate',
            label: '🌱 Substrat',
            presets: [
                { value: 'hydro-dwc', label: 'Hydro - DWC (Deep Water Culture)' },
                { value: 'hydro-nft', label: 'Hydro - NFT (Nutrient Film)' },
                { value: 'bio-terra', label: 'Bio - Terreau Premium' },
                { value: 'coco-60-40', label: 'Coco/Terreau 60/40' },
                { value: 'organic-soil', label: 'Organic - Terreau Vivant' }
            ]
        },
        {
            id: 'lighting',
            label: '💡 Éclairage',
            presets: [
                { value: 'led-450w', label: 'LED 450W Full Spectrum' },
                { value: 'led-600w', label: 'LED 600W Growspec' },
                { value: 'hps-400w', label: 'HPS 400W + Ballast Électronique' },
                { value: 'cfl-200w', label: 'CFL 200W (Multi-bulbes)' },
                { value: 'mixed-led-hps', label: 'Mixte LED + HPS' }
            ]
        },
        {
            id: 'nutrients',
            label: '🥗 Engrais',
            presets: [
                { value: 'bio-complete', label: 'Bio - Advanced Nutrients' },
                { value: 'chem-3part', label: 'Chimique - Système 3 parties' },
                { value: 'organic-organic', label: 'Organique - Compost + Thé' },
                { value: 'hydro-precision', label: 'Hydro - Precision EC Control' },
                { value: 'easy-1part', label: 'Facile - Engrais 1 partie' }
            ]
        },
        {
            id: 'environment',
            label: '🌡️ Environnement',
            presets: [
                { value: 'stable-25c-60rh', label: 'Stable 25°C - 60% RH' },
                { value: 'veg-26c-70rh', label: 'Vég 26°C - 70% RH' },
                { value: 'bloom-22c-50rh', label: 'Bloom 22°C - 50% RH' },
                { value: 'cooling-20c-45rh', label: 'Refroidissement 20°C - 45% RH' },
                { value: 'outdoor-seasonal', label: 'Extérieur - Variations Saisonnières' }
            ]
        },
        {
            id: 'watering',
            label: '💧 Arrosage',
            presets: [
                { value: 'drip-auto', label: 'Goutte à goutte Automatique' },
                { value: 'flood-drain', label: 'Inondation/Drainage' },
                { value: 'manual-daily', label: 'Manuel - 1x par jour' },
                { value: 'manual-every2d', label: 'Manuel - Tous les 2 jours' },
                { value: 'dwc-aeration', label: 'DWC avec Aération' }
            ]
        },
        {
            id: 'training',
            label: '✂️ Palissage/Training',
            presets: [
                { value: 'scrog', label: 'SCROG (Screen of Green)' },
                { value: 'lst', label: 'LST (Low Stress Training)' },
                { value: 'mainline', label: 'Main-Lining (Manifold)' },
                { value: 'topping', label: 'Topping Simple' },
                { value: 'none', label: 'Aucun Training' }
            ]
        },
        {
            id: 'curing',
            label: '🔥 Curing/Maturation',
            presets: [
                { value: 'jar-burp', label: 'Bocaux avec Burp (2-4 semaines)' },
                { value: 'vacuum-sealed', label: 'Sous vide complètement' },
                { value: 'partial-vacuum', label: 'Sous vide partiel + Bocaux' },
                { value: 'cold-cure', label: 'Cure Froide (< 5°C)' },
                { value: 'ambient', label: 'Ambient Room Curing' }
            ]
        },
        {
            id: 'monitoring',
            label: '📊 Suivi/Monitoring',
            presets: [
                { value: 'daily-log', label: 'Journal Quotidien Détaillé' },
                { value: 'weekly-notes', label: 'Notes Hebdomadaires' },
                { value: 'photo-daily', label: 'Photos Quotidiennes' },
                { value: 'temp-humidity', label: 'Capteurs Temp/Humidité' },
                { value: 'ec-ph', label: 'Monitoring EC + pH' }
            ]
        }
    ]

    const handleSelectPreset = (groupId, presetValue) => {
        setSelectedPresets(prev => ({
            ...prev,
            [groupId]: {
                name: presetGroups
                    .find(g => g.id === groupId)
                    ?.presets.find(p => p.value === presetValue)?.label || presetValue
            }
        }))
    }

    const handleRemovePreset = (groupId) => {
        setSelectedPresets(prev => {
            const newPresets = { ...prev }
            delete newPresets[groupId]
            return newPresets
        })
    }

    const handleSave = () => {
        onSelect(selectedPresets)
    }

    return (
        <div className="preset-selector-overlay">
            <motion.div
                className="preset-selector-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="modal-header">
                    <h2>Sélectionner les Presets</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    {presetGroups.map(group => (
                        <div key={group.id} className="preset-group">
                            <h3>{group.label}</h3>
                            <div className="presets-options">
                                {group.presets.map(preset => (
                                    <button
                                        key={preset.value}
                                        className={`preset-option ${selectedPresets[group.id]?.name === preset.label ? 'selected' : ''}`}
                                        onClick={() => handleSelectPreset(group.id, preset.value)}
                                    >
                                        <span className="radio"></span>
                                        <span className="label">{preset.label}</span>
                                    </button>
                                ))}
                            </div>
                            {selectedPresets[group.id] && (
                                <div className="preset-selected">
                                    <span>✓ {selectedPresets[group.id].name}</span>
                                    <button
                                        className="btn-unselect"
                                        onClick={() => handleRemovePreset(group.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                    <button className="btn-primary" onClick={handleSave}>
                        <Plus size={16} /> Appliquer Presets ({Object.keys(selectedPresets).length})
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
