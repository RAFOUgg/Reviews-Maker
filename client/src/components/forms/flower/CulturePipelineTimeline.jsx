import { useState, useEffect } from 'react'
import TimelineGrid from '../../TimelineGrid'
import PipelineToolbar from '../PipelineToolbar'
import { CULTURE_VALUES } from '../../../data/formValues'

/**
 * CulturePipeline REFONTE COMPLÈTE avec système Timeline visuel
 * Remplace l'ancien système de phases par une grille interactive type GitHub
 */
export default function CulturePipelineTimeline({ data, onChange }) {
    // État pour les presets
    const [presets, setPresets] = useState(() => {
        const saved = localStorage.getItem('culturePipelinePresets')
        return saved ? JSON.parse(saved) : []
    })

    // Configuration Timeline
    const timelineConfig = data.cultureTimelineConfig || {
        type: 'jour', // jour | semaine | phase
        start: '',
        end: '',
        phases: [] // Si type="phase"
    }

    // Données de la timeline (array d'objets {timestamp, date, ...fields})
    const timelineData = data.cultureTimelineData || []

    // Sauvegarder presets dans localStorage
    useEffect(() => {
        localStorage.setItem('culturePipelinePresets', JSON.stringify(presets))
    }, [presets])

    // Champs de configuration générale (affichés dans la première cellule uniquement)
    const generalConfigFields = [
        // Mode & Type espace
        { key: 'modeCulture', label: 'Mode de culture', icon: '🏕️', type: 'select', options: CULTURE_VALUES.mode, required: true },
        { key: 'typeEspace', label: "Type d'espace", icon: '📦', type: 'select', options: CULTURE_VALUES.typeEspace },

        // Dimensions
        { key: 'dimensions', label: 'Dimensions (LxlxH)', icon: '📏', type: 'text', placeholder: '120x120x200 cm' },
        { key: 'surfaceSol', label: 'Surface (m²)', icon: '📐', type: 'number', step: '0.01', placeholder: '1.44' },
        { key: 'volumeTotal', label: 'Volume (m³)', icon: '📦', type: 'number', step: '0.01', placeholder: '2.88' },

        // Technique propagation
        { key: 'techniquePropagation', label: 'Technique de propagation', icon: '🌰', type: 'select', options: CULTURE_VALUES.techniquePropagation },

        // Substrat global
        { key: 'typeSubstratGlobal', label: 'Type substrat principal', icon: '🧪', type: 'select', options: CULTURE_VALUES.typeSubstrat },
        { key: 'volumeSubstratGlobal', label: 'Volume substrat (L)', icon: '📊', type: 'number', placeholder: '20' },
        { key: 'compositionSubstratGlobal', label: 'Composition substrat', icon: '📝', type: 'textarea', rows: 2, maxLength: 200, placeholder: '60% terre, 30% coco, 10% perlite...' },
        { key: 'marquesSubstratGlobal', label: 'Marques des ingrédients', icon: '🏷️', type: 'text', placeholder: 'BioBizz All-Mix, Plagron Coco...' },

        // Récolte
        { key: 'couleurTrichomes', label: 'Couleur trichomes', icon: '💎', type: 'select', options: CULTURE_VALUES.couleurTrichomes },
        { key: 'dateRecolte', label: 'Date de récolte', icon: '📅', type: 'text', placeholder: 'YYYY-MM-DD' },
        { key: 'poidsBrut', label: 'Poids brut (g)', icon: '⚖️', type: 'number', placeholder: '500' },
        { key: 'poidsNet', label: 'Poids net (g)', icon: '⚖️', type: 'number', placeholder: '450' },
        { key: 'rendement', label: 'Rendement', icon: '📈', type: 'text', placeholder: '450 g/m² ou 150 g/plante' }
    ]

    // Champs éditables dans chaque cellule de la timeline
    const editableFields = [
        // Environnement
        { key: 'temperature', label: 'Température (°C)', icon: '🌡️', type: 'number', min: 0, max: 50, step: 0.1 },
        { key: 'humidite', label: 'Humidité (%)', icon: '💧', type: 'number', min: 0, max: 100 },
        { key: 'co2', label: 'CO2 (ppm)', icon: '🫧', type: 'number', min: 0 },
        { key: 'typeVentilation', label: 'Ventilation', icon: '🌀', type: 'select', options: CULTURE_VALUES.typeVentilation },

        // Lumière
        { key: 'typeLampe', label: 'Type de lampe', icon: '💡', type: 'select', options: CULTURE_VALUES.typeLampe },
        { key: 'spectreLumiere', label: 'Spectre', icon: '🌈', type: 'select', options: CULTURE_VALUES.spectreLumiere },
        { key: 'distanceLampe', label: 'Distance lampe (cm)', icon: '📏', type: 'number', min: 0 },
        { key: 'puissanceLumiere', label: 'Puissance (W)', icon: '⚡', type: 'number', min: 0 },
        { key: 'dureeEclairage', label: 'Durée éclairage (h)', icon: '⏱️', type: 'number', min: 0, max: 24, step: 0.5 },
        { key: 'dli', label: 'DLI (mol/m²/j)', icon: '☀️', type: 'number', min: 0, step: 0.1 },
        { key: 'ppfd', label: 'PPFD (µmol/m²/s)', icon: '🔆', type: 'number', min: 0 },
        { key: 'kelvin', label: 'Kelvin (K)', icon: '🌡️', type: 'number', min: 0 },

        // Irrigation
        { key: 'typeIrrigation', label: 'Type irrigation', icon: '💧', type: 'select', options: CULTURE_VALUES.typeIrrigation },
        { key: 'frequenceIrrigation', label: 'Fréquence irrigation', icon: '🔁', type: 'text', placeholder: '2x/jour' },
        { key: 'volumeEau', label: 'Volume eau (L)', icon: '🪣', type: 'number', min: 0, step: 0.1 },

        // Engrais
        { key: 'typeEngrais', label: 'Type engrais', icon: '🧪', type: 'select', options: CULTURE_VALUES.typeEngrais },
        { key: 'marqueEngrais', label: 'Marque engrais', icon: '🏷️', type: 'text', placeholder: 'BioBizz, AN...' },
        { key: 'dosageEngrais', label: 'Dosage engrais', icon: '💊', type: 'text', placeholder: '2 ml/L' },
        { key: 'frequenceEngrais', label: 'Fréquence engrais', icon: '📅', type: 'text', placeholder: '2x/semaine' },

        // Palissage
        { key: 'methodePalissage', label: 'Méthode palissage', icon: '✂️', type: 'select', options: CULTURE_VALUES.methodePalissage },
        { key: 'descriptionPalissage', label: 'Description palissage', icon: '📝', type: 'textarea', rows: 2, maxLength: 200 }
    ]

    // Handler pour modification de configuration
    const handleConfigChange = (field, value) => {
        onChange('cultureTimelineConfig', {
            ...timelineConfig,
            [field]: value
        })
    }

    // Handler pour modification de données timeline
    const handleTimelineDataChange = (timestamp, field, value) => {
        // Trouver ou créer l'entrée pour ce timestamp
        const existingIndex = timelineData.findIndex(d => d.timestamp === timestamp)

        if (existingIndex >= 0) {
            // Modifier l'entrée existante
            const newData = [...timelineData]
            newData[existingIndex] = {
                ...newData[existingIndex],
                [field]: value
            }
            onChange('cultureTimelineData', newData)
        } else {
            // Créer nouvelle entrée
            const cellDate = new Date(timestamp)
            const newEntry = {
                timestamp,
                date: cellDate.toISOString().split('T')[0],
                [field]: value
            }
            onChange('cultureTimelineData', [...timelineData, newEntry])
        }
    }

    // Handlers pour PipelineToolbar
    const handleSavePreset = (preset) => {
        setPresets([...presets, preset])
    }

    const handleLoadPreset = (preset) => {
        // Appliquer les données du preset au data général
        preset.fields.forEach(field => {
            if (preset.data[field] !== undefined) {
                onChange(field, preset.data[field])
            }
        })
    }

    const handleApplyToAll = (dataToApply) => {
        // Appliquer à toutes les cases de la timeline
        const newData = timelineData.map(cell => ({
            ...cell,
            ...dataToApply
        }))
        onChange('cultureTimelineData', newData)
    }

    const handleApplyToSelection = (dataToApply) => {
        // Note: Nécessite implémentation mode sélection dans TimelineGrid
        console.log('Mode sélection activé, cliquez sur les cases cibles', dataToApply)
        // TODO: Stocker dataToApply et activer mode sélection
    }

    // Obtenir données de la case actuelle (première case ou dernière modifiée)
    const getCurrentCellData = () => {
        if (timelineData.length === 0) return {}
        return timelineData[timelineData.length - 1] || {}
    }

    return (
        <div className="space-y-8">
            {/* ===== TIMELINE VISUELLE AVEC CONFIGURATION INTÉGRÉE ===== */}
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📊</span> Pipeline de culture - Timeline interactive
                </h3>
                <p className="text-sm text-gray-600 mb-6 italic">
                    📝 Visualisez et modifiez les données à chaque point de la culture.
                    Chaque case représente un moment (jour, semaine ou phase).
                    <br />
                    🎯 <strong>Cliquez sur la PREMIÈRE case pour configurer les informations générales</strong> (mode, espace, dimensions, substrat, récolte).
                    <br />
                    📊 Cliquez sur les autres cases pour éditer les paramètres environnementaux à ce moment précis.
                </p>

                {/* Toolbar pour gérer presets et attribution masse */}
                <PipelineToolbar
                    currentCellData={getCurrentCellData()}
                    onApplyToAll={handleApplyToAll}
                    onApplyToSelection={handleApplyToSelection}
                    onSavePreset={handleSavePreset}
                    onLoadPreset={handleLoadPreset}
                    presets={presets}
                />

                <TimelineGrid
                    data={timelineData}
                    onChange={handleTimelineDataChange}
                    config={timelineConfig}
                    onConfigChange={handleConfigChange}
                    editableFields={editableFields}
                    generalConfigFields={generalConfigFields}
                    generalConfigData={data}
                    onGeneralConfigChange={onChange}
                />
            </div>
        </div>
    )
}
