import { useState, useEffect } from 'react'
import PipelineDragDropView from '../../pipeline/PipelineDragDropView'
import { CURING_VALUES } from '../../../data/formValues'

/**
 * CuringMaturationTimeline - Version CDC conforme avec drag & drop
 * Remplace l'ancienne implémentation TimelineGrid par PipelineDragDropView
 */
export default function CuringMaturationTimeline({ data, onChange }) {
    // État pour les presets
    const [presets, setPresets] = useState(() => {
        const saved = localStorage.getItem('curingPipelinePresets')
        return saved ? JSON.parse(saved) : []
    })

    // État mode pipeline (phases vs personnalisé)
    const [pipelineMode, setPipelineMode] = useState(
        data.curingTimelineConfig?.mode || 'phases'
    )

    // Configuration Timeline pour curing
    const curingTimelineConfig = data.curingTimelineConfig || {
        mode: 'phases', // 'phases' ou 'custom'
        type: 'phase', // seconde | heure | jour | date | semaine | phase
        start: '',
        end: '',
        duration: null,
        totalSeconds: null,
        totalHours: null,
        totalDays: null,
        totalWeeks: null,
        phases: [
            { name: '🔪 Séchage', id: 'sechage', duration: 7 },
            { name: '🏺 Début curing', id: 'curing-debut', duration: 14 },
            { name: '⏳ Maturation', id: 'maturation', duration: 30 },
            { name: '✨ Affinage', id: 'affinage', duration: 60 }
        ]
    }

    // Données de la timeline curing
    const curingTimelineData = data.curingTimelineData || []

    // Sauvegarder presets dans localStorage
    useEffect(() => {
        localStorage.setItem('curingPipelinePresets', JSON.stringify(presets))
    }, [presets])

    // Structure hiérarchisée du panneau latéral selon CDC
    const sidebarContent = [
        {
            id: 'general',
            label: 'GÉNÉRAL',
            icon: '⚙️',
            items: [
                { key: 'typeMaturation', label: 'Type maturation', icon: '❄️', type: 'select', options: CURING_VALUES.typeMaturation, defaultValue: 'froid' },
                { key: 'methodeSechage', label: 'Méthode séchage', icon: '🔪', type: 'select', options: CURING_VALUES.methodeSechage, defaultValue: 'suspendus' },
                { key: 'dureeCuring', label: 'Durée totale', icon: '⏱️', type: 'number', defaultValue: 14, placeholder: '14' },
                {
                    key: 'dureeCuringUnite', label: 'Unité durée', icon: '📅', type: 'select', options: [
                        { value: 'jours', label: 'Jours' },
                        { value: 'semaines', label: 'Semaines' },
                        { value: 'mois', label: 'Mois' }
                    ], defaultValue: 'jours'
                }
            ]
        },
        {
            id: 'environnement',
            label: 'ENVIRONNEMENT',
            icon: '🌡️',
            items: [
                { key: 'temperature', label: 'Température (°C)', icon: '🌡️', type: 'number', defaultValue: 18, min: 0, max: 30 },
                { key: 'humidite', label: 'Humidité (%)', icon: '💧', type: 'number', defaultValue: 62, min: 0, max: 100 }
            ]
        },
        {
            id: 'ballotage',
            label: 'BALLOTAGE & EMBALLAGE',
            icon: '📦',
            items: [
                { key: 'typeRecipient', label: 'Type récipient', icon: '🏺', type: 'select', options: CURING_VALUES.typeRecipient, defaultValue: 'verre' },
                { key: 'emballagePrimaire', label: 'Emballage primaire', icon: '📦', type: 'select', options: CURING_VALUES.emballagePrimaire, defaultValue: 'aucun' },
                { key: 'opaciteRecipient', label: 'Opacité récipient', icon: '🌑', type: 'select', options: CURING_VALUES.opaciteRecipient, defaultValue: 'opaque' },
                { key: 'volumeOccupe', label: 'Volume occupé', icon: '📏', type: 'number', defaultValue: '', placeholder: '500' },
                {
                    key: 'volumeOccupeUnite', label: 'Unité volume', icon: '📐', type: 'select', options: [
                        { value: 'L', label: 'L (litres)' },
                        { value: 'mL', label: 'mL (millilitres)' }
                    ], defaultValue: 'mL'
                },
                {
                    key: 'ballotage', label: 'Ballotage effectué', icon: '🔄', type: 'select', options: [
                        { value: 'oui', label: 'Oui (quotidien)' },
                        { value: 'occasionnel', label: 'Occasionnel' },
                        { value: 'non', label: 'Non' }
                    ], defaultValue: 'occasionnel'
                }
            ]
        },
        {
            id: 'observations',
            label: 'OBSERVATIONS',
            icon: '👃',
            items: [
                { key: 'observations', label: 'Observations odeur/texture', icon: '📝', type: 'textarea', defaultValue: '', placeholder: 'Notez vos observations...' }
            ]
        },
        {
            id: 'notes-evolution',
            label: 'MODIFICATIONS NOTES',
            icon: '📊',
            collapsed: false,
            items: [
                // Visuel & Technique
                { key: 'note-couleur', label: 'Couleur', icon: '🎨', type: 'slider', min: 0, max: 10, defaultValue: 5 },
                { key: 'note-densite', label: 'Densité visuelle', icon: '🧱', type: 'slider', min: 0, max: 10, defaultValue: 5 },
                { key: 'note-trichomes', label: 'Trichomes', icon: '✨', type: 'slider', min: 0, max: 10, defaultValue: 5 },
                { key: 'note-pistils', label: 'Pistils', icon: '🌸', type: 'slider', min: 0, max: 10, defaultValue: 5 },
                { key: 'note-manucure', label: 'Manucure', icon: '✂️', type: 'slider', min: 0, max: 10, defaultValue: 5 },

                // Odeurs
                { key: 'note-intensite-odeur', label: 'Intensité odeur', icon: '👃', type: 'slider', min: 0, max: 10, defaultValue: 5 },
                { key: 'note-fidelite-cultivar', label: 'Fidélité cultivar', icon: '🧬', type: 'slider', min: 0, max: 10, defaultValue: 5 },

                // Texture
                { key: 'note-durete', label: 'Dureté', icon: '💪', type: 'slider', min: 0, max: 10, defaultValue: 5 },
                { key: 'note-densite-tactile', label: 'Densité tactile', icon: '✋', type: 'slider', min: 0, max: 10, defaultValue: 5 },
                { key: 'note-elasticite', label: 'Élasticité', icon: '🔄', type: 'slider', min: 0, max: 10, defaultValue: 5 },
                { key: 'note-collant', label: 'Collant', icon: '🫧', type: 'slider', min: 0, max: 10, defaultValue: 5 },

                // Goûts
                { key: 'note-intensite-gout', label: 'Intensité goût', icon: '😋', type: 'slider', min: 0, max: 10, defaultValue: 5 },
                { key: 'note-agressivite', label: 'Agressivité/piquant', icon: '🌶️', type: 'slider', min: 0, max: 10, defaultValue: 5 },

                // Effets
                { key: 'note-montee', label: 'Montée (rapidité)', icon: '⚡', type: 'slider', min: 0, max: 10, defaultValue: 5 },
                { key: 'note-intensite-effet', label: 'Intensité effet', icon: '💥', type: 'slider', min: 0, max: 10, defaultValue: 5 }
            ]
        }
    ]

    // Handler pour modification de configuration timeline
    const handleCuringConfigChange = (field, value) => {
        const updatedConfig = {
            ...curingTimelineConfig,
            [field]: value
        };
        onChange({
            ...data,
            curingTimelineConfig: updatedConfig
        });
    }

    // Handler pour modification de données timeline curing
    const handleCuringDataChange = (timestamp, field, value) => {
        const existingIndex = curingTimelineData.findIndex(d => d.timestamp === timestamp)

        let updatedData;
        if (existingIndex >= 0) {
            updatedData = [...curingTimelineData]
            updatedData[existingIndex] = {
                ...updatedData[existingIndex],
                [field]: value
            }
        } else {
            // En mode phase, le timestamp est un ID de phase, pas une date
            const newEntry = {
                timestamp,
                [field]: value
            }
            // Ne créer une date que si ce n'est pas une phase
            if (curingTimelineConfig.type !== 'phase') {
                const cellDate = new Date(timestamp)
                if (!isNaN(cellDate)) {
                    newEntry.date = cellDate.toISOString().split('T')[0]
                }
            }
            updatedData = [...curingTimelineData, newEntry]
        }

        onChange({
            ...data,
            curingTimelineData: updatedData
        });
    }

    // Handlers pour presets
    const handleSavePreset = (preset) => {
        setPresets([...presets, preset])
    }

    const handleLoadPreset = (preset) => {
        if (preset.data) {
            Object.entries(preset.data).forEach(([key, value]) => {
                onChange(key, value)
            })
        }
    }

    // Handler pour changer le mode et la configuration associated
    const handleModeChange = (newMode) => {
        setPipelineMode(newMode)
        // Si mode 'phases' est sélectionné, changer automatiquement le type de timeline à 'phase'
        if (newMode === 'phases') {
            handleCuringConfigChange('type', 'phase')
            handleCuringConfigChange('mode', 'phases')
        } else {
            handleCuringConfigChange('type', 'jour')
            handleCuringConfigChange('mode', 'custom')
        }
    }

    return (
        <div className="space-y-6">
            <PipelineDragDropView
                type="curing"
                sidebarContent={sidebarContent}
                timelineConfig={curingTimelineConfig}
                timelineData={curingTimelineData}
                onConfigChange={handleCuringConfigChange}
                onDataChange={handleCuringDataChange}
                presets={presets}
                onSavePreset={handleSavePreset}
                onLoadPreset={handleLoadPreset}
            />

            {/* Note informative */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                    <span className="font-semibold">ℹ️ Conseil:</span> Le curing est une étape cruciale qui développe les arômes et la qualité du produit final. Documentez précisément les paramètres pour reproduire vos meilleurs résultats.
                </p>
            </div>
        </div>
    )
}
