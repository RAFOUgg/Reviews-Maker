import { useState, useEffect } from 'react'
import PipelineDragDropView from '../../pipeline/PipelineDragDropView'
import { CULTURE_VALUES } from '../../../data/formValues'

/**
 * CulturePipelineTimeline - Version CDC conforme avec drag & drop
 * Remplace l'ancienne implémentation TimelineGrid par PipelineDragDropView
 */
export default function CulturePipelineTimeline({ data, onChange }) {
    // État pour les presets
    const [presets, setPresets] = useState(() => {
        const saved = localStorage.getItem('culturePipelinePresets')
        return saved ? JSON.parse(saved) : []
    })

    // Configuration Timeline
    const timelineConfig = data.cultureTimelineConfig || {
        type: 'jour', // seconde | heure | jour | date | semaine | phase
        start: '',
        end: '',
        duration: null,
        totalSeconds: null,
        totalHours: null,
        totalDays: null,
        totalWeeks: null,
        phases: [
            { name: '🌰 Graine (J0)', id: 'graine', duration: 1 },
            { name: '🌱 Germination', id: 'germination', duration: 3 },
            { name: '🌿 Plantule', id: 'plantule', duration: 7 },
            { name: '🌾 Début croissance', id: 'croissance-debut', duration: 14 },
            { name: '🌳 Milieu croissance', id: 'croissance-milieu', duration: 14 },
            { name: '🌴 Fin croissance', id: 'croissance-fin', duration: 7 },
            { name: '🌸 Début stretch', id: 'stretch-debut', duration: 7 },
            { name: '💐 Milieu stretch', id: 'stretch-milieu', duration: 7 },
            { name: '🌺 Fin stretch', id: 'stretch-fin', duration: 7 },
            { name: '🌼 Début floraison', id: 'floraison-debut', duration: 14 },
            { name: '🌻 Milieu floraison', id: 'floraison-milieu', duration: 14 },
            { name: '🏵️ Fin floraison', id: 'floraison-fin', duration: 14 }
        ]
    }

    // Données de la timeline (array d'objets {timestamp, date, ...fields})
    const timelineData = data.cultureTimelineData || []

    // Sauvegarder presets dans localStorage
    useEffect(() => {
        localStorage.setItem('culturePipelinePresets', JSON.stringify(presets))
    }, [presets])

    // Structure hiérarchisée du panneau latéral selon CDC
    const sidebarContent = [
        {
            id: 'general',
            label: 'GÉNÉRAL',
            icon: '⚙️',
            items: [
                { key: 'modeCulture', label: 'Mode de culture', icon: '🏕️', type: 'select', options: CULTURE_VALUES.mode, defaultValue: 'indoor' },
                { key: 'typeEspace', label: "Type d'espace", icon: '📦', type: 'select', options: CULTURE_VALUES.typeEspace, defaultValue: 'tente' },
                { key: 'dimensions', label: 'Dimensions (LxlxH)', icon: '📏', type: 'text', defaultValue: '', placeholder: '120x120x200 cm' },
                { key: 'surfaceSol', label: 'Surface (m²)', icon: '📐', type: 'number', defaultValue: '', placeholder: '1.44' },
                { key: 'volumeTotal', label: 'Volume (m³)', icon: '📦', type: 'number', defaultValue: '', placeholder: '2.88' },
                { key: 'techniquePropagation', label: 'Technique propagation', icon: '🌰', type: 'select', options: CULTURE_VALUES.techniquePropagation, defaultValue: 'graine' }
            ]
        },
        {
            id: 'substrat',
            label: 'SUBSTRAT & COMPOSITION',
            icon: '🪴',
            items: [
                { key: 'typeSubstrat', label: 'Type substrat', icon: '🧪', type: 'select', options: CULTURE_VALUES.typeSubstrat, defaultValue: 'terre' },
                { key: 'volumeSubstrat', label: 'Volume (L)', icon: '📊', type: 'number', defaultValue: '', placeholder: '20' },
                { key: 'compositionSubstrat', label: 'Composition', icon: '📝', type: 'textarea', defaultValue: '', placeholder: '60% terre, 30% coco...' },
                { key: 'marquesSubstrat', label: 'Marques', icon: '🏷️', type: 'text', defaultValue: '', placeholder: 'BioBizz All-Mix...' }
            ]
        },
        {
            id: 'environnement',
            label: 'ENVIRONNEMENT',
            icon: '🌡️',
            items: [
                { key: 'temperature', label: 'Température (°C)', icon: '🌡️', type: 'number', defaultValue: 24 },
                { key: 'humidite', label: 'Humidité (%)', icon: '💧', type: 'number', defaultValue: 60 },
                { key: 'co2', label: 'CO2 (ppm)', icon: '🫧', type: 'number', defaultValue: 400 },
                { key: 'typeVentilation', label: 'Ventilation', icon: '🌀', type: 'select', options: CULTURE_VALUES.typeVentilation, defaultValue: 'extracteur' }
            ]
        },
        {
            id: 'lumiere',
            label: 'LUMIÈRE & SPECTRE',
            icon: '💡',
            items: [
                { key: 'typeLampe', label: 'Type de lampe', icon: '💡', type: 'select', options: CULTURE_VALUES.typeLampe, defaultValue: 'LED' },
                { key: 'spectreDocument', label: 'PDF/Image spectre', icon: '📄', type: 'file', accept: '.pdf,.jpg,.jpeg,.png', defaultValue: '', help: 'Upload du spectre lumineux (1 fichier max)' },
                { key: 'spectreLumiere', label: 'Type spectre', icon: '🌈', type: 'select', options: CULTURE_VALUES.spectreLumiere, defaultValue: 'complet' },
                { key: 'distanceLampe', label: 'Distance lampe (cm)', icon: '📏', type: 'number', defaultValue: 30 },
                { key: 'puissanceLumiere', label: 'Puissance (W)', icon: '⚡', type: 'number', defaultValue: 200 },
                { key: 'dureeEclairage', label: 'Durée (h/jour)', icon: '⏱️', type: 'number', defaultValue: 18 },
                { key: 'dli', label: 'DLI (mol/m²/j)', icon: '☀️', type: 'number', defaultValue: '' },
                { key: 'ppfd', label: 'PPFD (µmol/m²/s)', icon: '🔆', type: 'number', defaultValue: '' },
                { key: 'kelvin', label: 'Kelvin (K)', icon: '🌡️', type: 'number', defaultValue: '' }
            ]
        },
        {
            id: 'irrigation',
            label: 'IRRIGATION & FRÉQUENCE',
            icon: '💧',
            items: [
                { key: 'typeIrrigation', label: 'Type irrigation', icon: '💧', type: 'select', options: CULTURE_VALUES.typeIrrigation, defaultValue: 'manuel' },
                { key: 'frequenceIrrigation', label: 'Fréquence', icon: '🔁', type: 'text', defaultValue: '2x/jour', placeholder: '2x/jour' },
                { key: 'volumeEau', label: 'Volume eau (L)', icon: '🪣', type: 'number', defaultValue: 1 }
            ]
        },
        {
            id: 'engrais',
            label: 'ENGRAIS & DOSAGE',
            icon: '🧪',
            items: [
                { key: 'typeEngrais', label: 'Type engrais', icon: '🧪', type: 'select', options: CULTURE_VALUES.typeEngrais, defaultValue: 'bio' },
                { key: 'marqueEngrais', label: 'Marque', icon: '🏷️', type: 'text', defaultValue: '', placeholder: 'BioBizz, AN...' },
                { key: 'dosageEngrais', label: 'Dosage', icon: '💊', type: 'text', defaultValue: '2 ml/L', placeholder: '2 ml/L' },
                { key: 'frequenceEngrais', label: 'Fréquence', icon: '📅', type: 'text', defaultValue: '2x/semaine', placeholder: '2x/semaine' },
                {
                    key: 'lienArrosage',
                    label: 'Lier à arrosage',
                    icon: '🔗',
                    type: 'checkbox',
                    defaultValue: false,
                    help: 'Cocher pour lier cet engraissage à un arrosage de la même cellule'
                }
            ]
        },
        {
            id: 'palissage',
            label: 'PALISSAGE LST/HST',
            icon: '✂️',
            items: [
                { key: 'methodePalissage', label: 'Méthode', icon: '✂️', type: 'select', options: CULTURE_VALUES.methodePalissage, defaultValue: 'LST' },
                { key: 'descriptionPalissage', label: 'Description', icon: '📝', type: 'textarea', defaultValue: '', placeholder: 'Décrivez les manipulations...' }
            ]
        },
        {
            id: 'morphologie',
            label: 'MORPHOLOGIE PLANTE',
            icon: '🌿',
            items: [
                { key: 'taillePlante', label: 'Taille', icon: '📏', type: 'text', defaultValue: '' },
                { key: 'volumePlante', label: 'Volume', icon: '📦', type: 'text', defaultValue: '' },
                { key: 'poidPlante', label: 'Poids', icon: '⚖️', type: 'number', defaultValue: '' },
                { key: 'nombreBranches', label: 'Branches principales', icon: '🌳', type: 'number', defaultValue: '' },
                { key: 'nombreFeuilles', label: 'Feuilles', icon: '🍃', type: 'number', defaultValue: '' },
                { key: 'nombreBuds', label: 'Buds', icon: '🌸', type: 'number', defaultValue: '' }
            ]
        },
        {
            id: 'recolte',
            label: 'RÉCOLTE',
            icon: '✂️',
            items: [
                { key: 'couleurTrichomes', label: 'Couleur trichomes', icon: '💎', type: 'select', options: CULTURE_VALUES.couleurTrichomes, defaultValue: 'laiteux' },
                { key: 'dateRecolte', label: 'Date récolte', icon: '📅', type: 'date', defaultValue: '' },
                { key: 'poidsBrut', label: 'Poids brut (g)', icon: '⚖️', type: 'number', defaultValue: '' },
                { key: 'poidsNet', label: 'Poids net (g)', icon: '⚖️', type: 'number', defaultValue: '' },
                { key: 'rendement', label: 'Rendement', icon: '📈', type: 'text', defaultValue: '', placeholder: '450 g/m²...' }
            ]
        }
    ]

    // Handler pour modification de configuration
    const handleConfigChange = (field, value) => {
        onChange('cultureTimelineConfig', {
            ...timelineConfig,
            [field]: value
        })
    }

    // Handler pour modification de données timeline
    const handleDataChange = (timestamp, field, value) => {
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

    // Handlers pour presets
    const handleSavePreset = (preset) => {
        setPresets([...presets, preset])
    }

    const handleLoadPreset = (preset) => {
        // Appliquer les données du preset
        if (preset.data) {
            Object.entries(preset.data).forEach(([key, value]) => {
                onChange(key, value)
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <span>🌱</span> Pipeline de culture : Timeline interactive CDC
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    📝 Glissez les contenus depuis le panneau latéral vers les cases de la timeline.
                    <br />
                    🎯 <strong>Drag & drop</strong> : Sélectionnez un contenu à gauche et déposez-le sur une case.
                    <br />
                    📊 <strong>Édition</strong> : Cliquez sur une case pour modifier ses données.
                </p>
            </div>

            <PipelineDragDropView
                type="culture"
                sidebarContent={sidebarContent}
                timelineConfig={timelineConfig}
                timelineData={timelineData}
                onConfigChange={handleConfigChange}
                onDataChange={handleDataChange}
                presets={presets}
                onSavePreset={handleSavePreset}
                onLoadPreset={handleLoadPreset}
            />
        </div>
    )
}
