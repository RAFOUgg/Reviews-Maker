import { useState, useEffect } from 'react'
import TimelineGrid from '../../TimelineGrid'
import PipelineToolbar from '../PipelineToolbar'
import { CURING_VALUES } from '../../../data/formValues'

/**
 * CuringMaturationTimeline - Version enrichie avec Timeline et tous les champs du cahier des charges
 * Ajout: type maturation, emballage primaire, opacité récipient, volume occupé
 */
export default function CuringMaturationTimeline({ data, onChange }) {
    // État pour les presets
    const [presets, setPresets] = useState(() => {
        const saved = localStorage.getItem('curingPipelinePresets')
        return saved ? JSON.parse(saved) : []
    })

    // Configuration Timeline pour curing (intervalles : jours, semaines, phases)
    const curingTimelineConfig = data.curingTimelineConfig || {
        type: 'jour', // jour | semaine | phase
        start: '',
        end: ''
    }

    // Données de la timeline curing
    const curingTimelineData = data.curingTimelineData || []

    // Sauvegarder presets dans localStorage
    useEffect(() => {
        localStorage.setItem('curingPipelinePresets', JSON.stringify(presets))
    }, [presets])

    // Champs de configuration générale (affichés dans la première cellule uniquement)
    const curingGeneralConfigFields = [
        // Type maturation
        { key: 'typeMaturation', label: 'Type de maturation', icon: '❄️', type: 'select', options: CURING_VALUES.typeMaturation },

        // Méthode séchage
        { key: 'methodeSechage', label: 'Méthode de séchage', icon: '🔪', type: 'select', options: CURING_VALUES.methodeSechage },

        // Type récipient
        { key: 'typeRecipient', label: 'Type de récipient principal', icon: '🏺', type: 'select', options: CURING_VALUES.typeRecipient },

        // Emballage primaire
        { key: 'emballagePrimaire', label: 'Emballage/Ballotage primaire', icon: '📦', type: 'select', options: CURING_VALUES.emballagePrimaire },

        // Opacité
        { key: 'opaciteRecipient', label: 'Opacité du récipient', icon: '🌑', type: 'select', options: CURING_VALUES.opaciteRecipient },

        // Volume occupé
        { key: 'volumeOccupe', label: 'Volume occupé', icon: '📏', type: 'number', step: '0.01', placeholder: '500', min: 0 },
        {
            key: 'volumeOccupeUnite', label: 'Unité volume', icon: '📐', type: 'select', options: [
                { value: 'L', label: 'L (litres)' },
                { value: 'mL', label: 'mL (millilitres)' }
            ]
        },

        // Durée curing
        { key: 'dureeCuring', label: 'Durée totale de curing', icon: '⏱️', type: 'number', placeholder: '14', min: 0 },
        {
            key: 'dureeCuringUnite', label: 'Unité durée', icon: '📅', type: 'select', options: [
                { value: 'jours', label: 'Jours' },
                { value: 'semaines', label: 'Semaines' },
                { value: 'mois', label: 'Mois' }
            ]
        }
    ]

    // Champs éditables dans la timeline curing
    const curingEditableFields = [
        { key: 'temperature', label: 'Température (°C)', icon: '🌡️', type: 'number', min: 0, max: 30, step: 0.1 },
        { key: 'humidite', label: 'Humidité (%)', icon: '💧', type: 'number', min: 0, max: 100 },
        { key: 'conteneur', label: 'Type de récipient', icon: '🏺', type: 'select', options: CURING_VALUES.typeRecipient },
        {
            key: 'ballotage', label: 'Ballotage effectué', icon: '🔄', type: 'select', options: [
                { value: 'oui', label: 'Oui (quotidien)' },
                { value: 'occasionnel', label: 'Occasionnel' },
                { value: 'non', label: 'Non' }
            ]
        },
        { key: 'observations', label: 'Observations odeur/texture', icon: '👃', type: 'textarea', rows: 2, maxLength: 300 }
    ]

    // Handler pour modification de configuration timeline
    const handleCuringConfigChange = (field, value) => {
        onChange('curingTimelineConfig', {
            ...curingTimelineConfig,
            [field]: value
        })
    }

    // Handler pour modification de données timeline curing
    const handleCuringTimelineDataChange = (timestamp, field, value) => {
        const existingIndex = curingTimelineData.findIndex(d => d.timestamp === timestamp)

        if (existingIndex >= 0) {
            const newData = [...curingTimelineData]
            newData[existingIndex] = {
                ...newData[existingIndex],
                [field]: value
            }
            onChange('curingTimelineData', newData)
        } else {
            const cellDate = new Date(timestamp)
            const newEntry = {
                timestamp,
                date: cellDate.toISOString().split('T')[0],
                [field]: value
            }
            onChange('curingTimelineData', [...curingTimelineData, newEntry])
        }
    }

    // Handlers pour PipelineToolbar
    const handleSavePreset = (preset) => {
        setPresets([...presets, preset])
    }

    const handleLoadPreset = (preset) => {
        preset.fields.forEach(field => {
            if (preset.data[field] !== undefined) {
                onChange(field, preset.data[field])
            }
        })
    }

    const handleApplyToAll = (dataToApply) => {
        const newData = curingTimelineData.map(cell => ({
            ...cell,
            ...dataToApply
        }))
        onChange('curingTimelineData', newData)
    }

    const handleApplyToSelection = (dataToApply) => {
        console.log('Mode sélection activé pour curing, cliquez sur les cases cibles', dataToApply)
    }

    const getCurrentCellData = () => {
        if (curingTimelineData.length === 0) return {}
        return curingTimelineData[curingTimelineData.length - 1] || {}
    }

    return (
        <div className="space-y-8">
            {/* Timeline du curing avec configuration intégrée */}
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📊</span> Pipeline de curing - Timeline interactive
                </h3>
                <p className="text-sm text-gray-600 mb-6 italic">
                    📝 Visualisez l'évolution du curing dans le temps.
                    Chaque case représente un moment (jour, semaine ou phase).
                    <br />
                    🎯 <strong>Cliquez sur la PREMIÈRE case pour configurer les informations générales</strong> (type maturation, méthode séchage, récipient, etc.).
                    <br />
                    📊 Cliquez sur les autres cases pour documenter température, humidité, ballotage et observations à chaque étape.
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
                    data={curingTimelineData}
                    onChange={handleCuringTimelineDataChange}
                    config={curingTimelineConfig}
                    onConfigChange={handleCuringConfigChange}
                    editableFields={curingEditableFields}
                    generalConfigFields={curingGeneralConfigFields}
                    generalConfigData={data}
                    onGeneralConfigChange={onChange}
                />
            </div>

            {/* Note informative */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <p className="text-sm text-amber-800">
                    <span className="font-semibold">ℹ️ Conseil:</span> Le curing est une étape cruciale qui développe les arômes et la qualité du produit final. Documentez précisément les paramètres pour reproduire vos meilleurs résultats.
                </p>
            </div>
        </div>
    )
}
