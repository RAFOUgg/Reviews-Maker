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

    // État mode pipeline
    const [pipelineMode, setPipelineMode] = useState(
        data.cultureTimelineConfig?.mode || 'custom'
    )

    // Configuration Timeline
    const timelineConfig = data.cultureTimelineConfig || {
        mode: 'custom', // 'phases' ou 'custom'
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

    // Handler changement mode
    const handleModeChange = (mode) => {
        setPipelineMode(mode)
        onChange('cultureTimelineConfig', {
            ...timelineConfig,
            mode,
            type: mode === 'phases' ? 'phase' : 'jour'
        })
    }

    // Structure hiérarchisée du panneau latéral selon CDC
    const sidebarContent = [
        {
            id: 'mode',
            label: 'MODE PIPELINE',
            icon: '🎯',
            special: 'mode-selector',
            component: (
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleModeChange('phases')}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${pipelineMode === 'phases' ? 'bg-gradient-to-r text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
                        >
                            🌱 Mode Phases
                            <div className="text-xs mt-1 opacity-80">12 étapes prédéfinies</div>
                        </button>
                        <button
                            onClick={() => handleModeChange('custom')}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${pipelineMode === 'custom' ? 'bg-gradient-to-r text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
                        >
                            ⚙️ Personnalisé
                            <div className="text-xs mt-1 opacity-80">Configuration libre</div>
                        </button>
                    </div>
                    {pipelineMode === 'phases' && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 dark: rounded-lg p-3">
                            ✨ Les 12 phases CDC sont actives avec durées par défaut ajustables
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'general',
            label: 'GÉNÉRAL',
            icon: '⚙️',
            items: [
                { key: 'modeCulture', label: 'Mode de culture', icon: '🏕️', type: 'select', options: CULTURE_VALUES.mode, defaultValue: 'indoor' },
                { key: 'typeEspace', label: "Type d'espace", icon: '📦', type: 'select', options: CULTURE_VALUES.typeEspace, defaultValue: 'tente' },
                { key: 'dimensionsL', label: 'Longueur (cm)', icon: '📏', type: 'number', min: 1, max: 1000, defaultValue: 120, unit: 'cm' },
                { key: 'dimensionsl', label: 'Largeur (cm)', icon: '📏', type: 'number', min: 1, max: 1000, defaultValue: 120, unit: 'cm' },
                { key: 'dimensionsH', label: 'Hauteur (cm)', icon: '📏', type: 'number', min: 1, max: 500, defaultValue: 200, unit: 'cm' },
                { key: 'surfaceSol', label: 'Surface (m²)', icon: '📐', type: 'number', min: 0.1, max: 100, step: 0.01, defaultValue: 1.44, unit: 'm²' },
                { key: 'volumeTotal', label: 'Volume (m³)', icon: '📦', type: 'number', min: 0.1, max: 500, step: 0.01, defaultValue: 2.88, unit: 'm³' },
                { key: 'techniquePropagation', label: 'Technique propagation', icon: '🌰', type: 'select', options: CULTURE_VALUES.techniquePropagation, defaultValue: 'graine' },
                { key: 'nombrePlantes', label: 'Nombre de plantes', icon: '🌱', type: 'number', min: 1, max: 100, defaultValue: 4, unit: 'plante(s)' }
            ]
        },
        {
            id: 'substrat',
            label: 'SUBSTRAT & COMPOSITION',
            icon: '🪴',
            items: [
                { key: 'typeSubstrat', label: 'Type substrat', icon: '🧪', type: 'select', options: CULTURE_VALUES.typeSubstrat, defaultValue: 'terre' },
                { key: 'volumeSubstrat', label: 'Volume pot (L)', icon: '📊', type: 'number', min: 1, max: 200, defaultValue: 20, unit: 'L' },
                { key: 'compositionTerre', label: '% Terre', icon: '🟤', type: 'number', min: 0, max: 100, defaultValue: 60, unit: '%' },
                { key: 'compositionCoco', label: '% Coco', icon: '🟠', type: 'number', min: 0, max: 100, defaultValue: 20, unit: '%' },
                { key: 'compositionPerlite', label: '% Perlite', icon: '⚪', type: 'number', min: 0, max: 100, defaultValue: 10, unit: '%' },
                { key: 'compositionVermiculite', label: '% Vermiculite', icon: '🟡', type: 'number', min: 0, max: 100, defaultValue: 10, unit: '%' },
                { key: 'marquesSubstrat', label: 'Marques', icon: '🏷️', type: 'text', defaultValue: '', placeholder: 'BioBizz All-Mix, Plagron...' },
                { key: 'phSubstrat', label: 'pH substrat', icon: '🧪', type: 'number', min: 4, max: 9, step: 0.1, defaultValue: 6.5, unit: 'pH' },
                { key: 'ecSubstrat', label: 'EC substrat (mS/cm)', icon: '⚡', type: 'number', min: 0, max: 5, step: 0.1, defaultValue: 1.2, unit: 'mS/cm' }
            ]
        },
        {
            id: 'environnement',
            label: 'ENVIRONNEMENT',
            icon: '🌡️',
            items: [
                { key: 'temperatureJour', label: 'Température jour (°C)', icon: '🌡️', type: 'number', min: 15, max: 40, step: 0.5, defaultValue: 26, unit: '°C' },
                { key: 'temperatureNuit', label: 'Température nuit (°C)', icon: '🌙', type: 'number', min: 10, max: 35, step: 0.5, defaultValue: 20, unit: '°C' },
                { key: 'humiditeJour', label: 'Humidité jour (%)', icon: '💧', type: 'number', min: 20, max: 90, defaultValue: 55, unit: '%' },
                { key: 'humiditeNuit', label: 'Humidité nuit (%)', icon: '🌙', type: 'number', min: 20, max: 90, defaultValue: 60, unit: '%' },
                { key: 'vpd', label: 'VPD (kPa)', icon: '📊', type: 'number', min: 0.4, max: 1.6, step: 0.1, defaultValue: 1.0, unit: 'kPa' },
                { key: 'co2', label: 'CO₂ (ppm)', icon: '🫧', type: 'number', min: 400, max: 1500, step: 50, defaultValue: 400, unit: 'ppm' },
                { key: 'typeVentilation', label: 'Type ventilation', icon: '🌀', type: 'select', options: CULTURE_VALUES.typeVentilation, defaultValue: 'extracteur' },
                { key: 'debitExtraction', label: 'Débit extraction (m³/h)', icon: '💨', type: 'number', min: 50, max: 2000, defaultValue: 300, unit: 'm³/h' },
                {
                    key: 'frequenceVentilation', label: 'Fréquence ventilation', icon: '🔁', type: 'select', options: [
                        { value: 'continu', label: 'Continu 24h/24' },
                        { value: 'intermittent', label: 'Intermittent (minuterie)' },
                        { value: 'thermostat', label: 'Sur thermostat' },
                        { value: 'hygrostat', label: 'Sur hygrostat' }
                    ], defaultValue: 'continu'
                }
            ]
        },
        {
            id: 'lumiere',
            label: 'LUMIÈRE & SPECTRE',
            icon: '💡',
            items: [
                { key: 'typeLampe', label: 'Type de lampe', icon: '💡', type: 'select', options: CULTURE_VALUES.typeLampe, defaultValue: 'LED' },
                { key: 'marqueLampe', label: 'Marque/Modèle', icon: '🏷️', type: 'text', defaultValue: '', placeholder: 'HLG 300, Mars Hydro...' },
                { key: 'spectreLumiere', label: 'Type spectre', icon: '🌈', type: 'select', options: CULTURE_VALUES.spectreLumiere, defaultValue: 'complet' },
                { key: 'puissanceLumiere', label: 'Puissance (W)', icon: '⚡', type: 'number', min: 50, max: 2000, defaultValue: 300, unit: 'W' },
                { key: 'puissanceReelle', label: 'Puissance réelle (W)', icon: '⚡', type: 'number', min: 50, max: 2000, defaultValue: 280, unit: 'W' },
                { key: 'distanceLampe', label: 'Distance lampe (cm)', icon: '📏', type: 'number', min: 10, max: 150, defaultValue: 40, unit: 'cm' },
                { key: 'dureeEclairage', label: 'Photopériode (h/jour)', icon: '⏱️', type: 'number', min: 12, max: 24, defaultValue: 18, unit: 'h' },
                { key: 'dli', label: 'DLI (mol/m²/j)', icon: '☀️', type: 'number', min: 10, max: 70, step: 0.1, defaultValue: 40, unit: 'mol/m²/j' },
                { key: 'ppfd', label: 'PPFD (µmol/m²/s)', icon: '🔆', type: 'number', min: 100, max: 1500, defaultValue: 600, unit: 'µmol/m²/s' },
                { key: 'kelvin', label: 'Température couleur (K)', icon: '🌡️', type: 'number', min: 2700, max: 6500, step: 100, defaultValue: 4000, unit: 'K' }
            ]
        },
        {
            id: 'irrigation',
            label: 'IRRIGATION & FRÉQUENCE',
            icon: '💧',
            items: [
                { key: 'typeIrrigation', label: 'Type irrigation', icon: '💧', type: 'select', options: CULTURE_VALUES.typeIrrigation, defaultValue: 'manuel' },
                { key: 'frequenceIrrigation', label: 'Fréquence (fois/jour)', icon: '🔁', type: 'number', min: 0.5, max: 10, step: 0.5, defaultValue: 1, unit: 'x/jour' },
                { key: 'volumeEauParPlante', label: 'Volume eau/plante (L)', icon: '🪣', type: 'number', min: 0.1, max: 20, step: 0.1, defaultValue: 1, unit: 'L' },
                { key: 'phArrosage', label: 'pH eau arrosage', icon: '🧪', type: 'number', min: 5, max: 8, step: 0.1, defaultValue: 6.2, unit: 'pH' },
                { key: 'ecArrosage', label: 'EC eau arrosage (mS/cm)', icon: '⚡', type: 'number', min: 0, max: 4, step: 0.1, defaultValue: 1.2, unit: 'mS/cm' },
                { key: 'runoffPourcent', label: 'Runoff (%)', icon: '💦', type: 'number', min: 0, max: 50, defaultValue: 15, unit: '%' },
                { key: 'temperatureEau', label: 'Température eau (°C)', icon: '🌡️', type: 'number', min: 15, max: 30, step: 0.5, defaultValue: 22, unit: '°C' }
            ]
        },
        {
            id: 'engrais',
            label: 'ENGRAIS & DOSAGE',
            icon: '🧪',
            items: [
                { key: 'typeEngrais', label: 'Type engrais', icon: '🧪', type: 'select', options: CULTURE_VALUES.typeEngrais, defaultValue: 'bio' },
                { key: 'marqueEngrais', label: 'Marque', icon: '🏷️', type: 'text', defaultValue: '', placeholder: 'BioBizz, GHE, AN...' },
                { key: 'gammeEngrais', label: 'Gamme/Ligne', icon: '📋', type: 'text', defaultValue: '', placeholder: 'Bio Grow, Bio Bloom...' },
                { key: 'dosageN', label: 'Dosage N (ml/L)', icon: '🟢', type: 'number', min: 0, max: 20, step: 0.1, defaultValue: 2, unit: 'ml/L' },
                { key: 'dosageP', label: 'Dosage P (ml/L)', icon: '🟠', type: 'number', min: 0, max: 20, step: 0.1, defaultValue: 1, unit: 'ml/L' },
                { key: 'dosageK', label: 'Dosage K (ml/L)', icon: '🔴', type: 'number', min: 0, max: 20, step: 0.1, defaultValue: 2, unit: 'ml/L' },
                { key: 'dosageBooster', label: 'Booster (ml/L)', icon: '🚀', type: 'number', min: 0, max: 10, step: 0.1, defaultValue: 0, unit: 'ml/L' },
                {
                    key: 'frequenceEngrais', label: 'Fréquence', icon: '📅', type: 'select', options: [
                        { value: 'chaque-arrosage', label: 'Chaque arrosage' },
                        { value: '1x-semaine', label: '1x / semaine' },
                        { value: '2x-semaine', label: '2x / semaine' },
                        { value: '3x-semaine', label: '3x / semaine' },
                        { value: '1x-2semaines', label: '1x / 2 semaines' }
                    ], defaultValue: '2x-semaine'
                },
                { key: 'ecApresEngrais', label: 'EC après mélange (mS/cm)', icon: '⚡', type: 'number', min: 0, max: 4, step: 0.1, defaultValue: 1.5, unit: 'mS/cm' }
            ]
        },
        {
            id: 'palissage',
            label: 'PALISSAGE LST/HST',
            icon: '✂️',
            items: [
                { key: 'methodePalissage', label: 'Méthode principale', icon: '✂️', type: 'select', options: CULTURE_VALUES.methodePalissage, defaultValue: 'LST' },
                { key: 'techniqueScrog', label: 'SCROG', icon: '🕸️', type: 'checkbox', defaultValue: false },
                { key: 'techniqueSog', label: 'SOG', icon: '🌿', type: 'checkbox', defaultValue: false },
                { key: 'techniqueMainlining', label: 'Main-Lining', icon: '🌳', type: 'checkbox', defaultValue: false },
                { key: 'techniqueTopping', label: 'Topping', icon: '✂️', type: 'checkbox', defaultValue: false },
                { key: 'techniqueFIM', label: 'FIM', icon: '✌️', type: 'checkbox', defaultValue: false },
                { key: 'techniqueSupercrop', label: 'Super-cropping', icon: '💪', type: 'checkbox', defaultValue: false },
                { key: 'nombreToppings', label: 'Nombre toppings', icon: '🔢', type: 'number', min: 0, max: 10, defaultValue: 0, unit: 'x' },
                { key: 'descriptionPalissage', label: 'Notes/Actions', icon: '📝', type: 'textarea', maxLength: 500, defaultValue: '', placeholder: 'Décrivez vos manipulations...' }
            ]
        },
        {
            id: 'morphologie',
            label: 'MORPHOLOGIE PLANTE',
            icon: '🌿',
            items: [
                { key: 'taillePlante', label: 'Taille (cm)', icon: '📏', type: 'number', min: 1, max: 400, defaultValue: '', unit: 'cm' },
                { key: 'envergurePlante', label: 'Envergure (cm)', icon: '↔️', type: 'number', min: 1, max: 300, defaultValue: '', unit: 'cm' },
                { key: 'diamètreTige', label: 'Diamètre tige (mm)', icon: '🔵', type: 'number', min: 1, max: 100, defaultValue: '', unit: 'mm' },
                { key: 'nombreBranches', label: 'Branches principales', icon: '🌳', type: 'number', min: 1, max: 50, defaultValue: '', unit: 'branches' },
                { key: 'nombreSites', label: 'Sites de floraison', icon: '🌸', type: 'number', min: 1, max: 200, defaultValue: '', unit: 'sites' },
                {
                    key: 'couleurFeuilles', label: 'Couleur feuilles', icon: '🍃', type: 'select', options: [
                        { value: 'vert-clair', label: 'Vert clair' },
                        { value: 'vert-fonce', label: 'Vert foncé' },
                        { value: 'vert-jaune', label: 'Vert-jaune' },
                        { value: 'violet', label: 'Violet/Pourpre' },
                        { value: 'deficience', label: 'Signes déficience' }
                    ], defaultValue: 'vert-fonce'
                },
                { key: 'noteSante', label: 'Note santé (1-10)', icon: '❤️', type: 'number', min: 1, max: 10, defaultValue: 8, unit: '/10' },
                {
                    key: 'problemesObserves', label: 'Problèmes observés', icon: '⚠️', type: 'select', options: [
                        { value: 'aucun', label: 'Aucun' },
                        { value: 'carence-n', label: 'Carence N' },
                        { value: 'carence-p', label: 'Carence P' },
                        { value: 'carence-k', label: 'Carence K' },
                        { value: 'carence-ca', label: 'Carence Ca' },
                        { value: 'carence-mg', label: 'Carence Mg' },
                        { value: 'exces-n', label: 'Excès N' },
                        { value: 'brulure-lumiere', label: 'Brûlure lumière' },
                        { value: 'stress-hydrique', label: 'Stress hydrique' },
                        { value: 'nuisibles', label: 'Nuisibles' },
                        { value: 'moisissure', label: 'Moisissure' }
                    ], defaultValue: 'aucun'
                }
            ]
        },
        {
            id: 'recolte',
            label: 'RÉCOLTE',
            icon: '✂️',
            items: [
                { key: 'couleurTrichomes', label: 'Couleur trichomes', icon: '💎', type: 'select', options: CULTURE_VALUES.couleurTrichomes, defaultValue: 'laiteux' },
                { key: 'pourcentTranslucide', label: '% Translucides', icon: '💧', type: 'number', min: 0, max: 100, defaultValue: 10, unit: '%' },
                { key: 'pourcentLaiteux', label: '% Laiteux', icon: '🥛', type: 'number', min: 0, max: 100, defaultValue: 70, unit: '%' },
                { key: 'pourcentAmbre', label: '% Ambrés', icon: '🟠', type: 'number', min: 0, max: 100, defaultValue: 20, unit: '%' },
                { key: 'dateRecolte', label: 'Date récolte', icon: '📅', type: 'date', defaultValue: '' },
                {
                    key: 'methodeRecolte', label: 'Méthode récolte', icon: '✂️', type: 'select', options: [
                        { value: 'plante-entiere', label: 'Plante entière' },
                        { value: 'branche-par-branche', label: 'Branche par branche' },
                        { value: 'progressif', label: 'Récolte progressive' }
                    ], defaultValue: 'plante-entiere'
                },
                { key: 'poidsBrutTotal', label: 'Poids brut total (g)', icon: '⚖️', type: 'number', min: 1, max: 10000, defaultValue: '', unit: 'g' },
                { key: 'poidsApresManucure', label: 'Poids après manucure (g)', icon: '⚖️', type: 'number', min: 1, max: 10000, defaultValue: '', unit: 'g' },
                { key: 'poidsSec', label: 'Poids sec final (g)', icon: '⚖️', type: 'number', min: 1, max: 5000, defaultValue: '', unit: 'g' },
                { key: 'rendementGM2', label: 'Rendement (g/m²)', icon: '📈', type: 'number', min: 1, max: 2000, defaultValue: '', unit: 'g/m²' },
                { key: 'rendementGPlante', label: 'Rendement (g/plante)', icon: '🌱', type: 'number', min: 1, max: 2000, defaultValue: '', unit: 'g/plante' },
                { key: 'rendementGW', label: 'Rendement (g/W)', icon: '⚡', type: 'number', min: 0.1, max: 5, step: 0.1, defaultValue: '', unit: 'g/W' }
            ]
        },
        {
            id: 'notes',
            label: 'NOTES & OBSERVATIONS',
            icon: '📝',
            items: [
                { key: 'noteJournaliere', label: 'Note du jour', icon: '📖', type: 'textarea', maxLength: 500, defaultValue: '', placeholder: 'Actions, observations, remarques...' },
                {
                    key: 'evenementImportant', label: 'Événement important', icon: '⚠️', type: 'select', options: [
                        { value: 'aucun', label: 'Aucun événement' },
                        { value: 'debut-germination', label: '🌱 Début germination' },
                        { value: 'transplantation', label: '🪴 Transplantation' },
                        { value: 'debut-veg', label: '🌿 Début végétation' },
                        { value: 'flip-12-12', label: '💡 Flip 12/12' },
                        { value: 'debut-floraison', label: '🌸 Début floraison' },
                        { value: 'prefleurs', label: '🌺 Apparition préfleurs' },
                        { value: 'stretch', label: '📈 Début stretch' },
                        { value: 'fin-stretch', label: '📉 Fin stretch' },
                        { value: 'flush', label: '💧 Début flush' },
                        { value: 'recolte', label: '✂️ Récolte' },
                        { value: 'probleme', label: '❌ Problème détecté' },
                        { value: 'traitement', label: '💊 Traitement appliqué' },
                        { value: 'defoliation', label: '🍃 Défoliation' },
                        { value: 'lollipop', label: '🍭 Lollipop' },
                        { value: 'autre', label: '📌 Autre' }
                    ], defaultValue: 'aucun'
                },
                { key: 'photoJour', label: 'Photo du jour', icon: '📷', type: 'file', accept: 'image/*', defaultValue: null },
                {
                    key: 'humeurCultivateur', label: 'Humeur/Feeling', icon: '😊', type: 'select', options: [
                        { value: '', label: 'Non renseigné' },
                        { value: 'excellent', label: '🤩 Excellent' },
                        { value: 'bien', label: '😊 Bien' },
                        { value: 'normal', label: '😐 Normal' },
                        { value: 'inquiet', label: '😟 Inquiet' },
                        { value: 'probleme', label: '😰 Problème' }
                    ], defaultValue: ''
                }
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
            const entry = { ...newData[existingIndex] }

            if (value === null || value === undefined) {
                // Supprimer la clé réellement
                delete entry[field]
            } else {
                entry[field] = value
            }

            // Si plus aucune donnée utile (hors timestamp/date), supprimer l'entrée entière
            const usefulKeys = Object.keys(entry).filter(k => k !== 'timestamp' && k !== 'date')
            if (usefulKeys.length === 0) {
                newData.splice(existingIndex, 1)
            } else {
                newData[existingIndex] = entry
            }

            onChange('cultureTimelineData', newData)
        } else {
            // Créer nouvelle entrée
            // Ne créer une nouvelle entrée que si la valeur est non nulle
            if (value === null || value === undefined || value === '') return

            // Compute a safe date string only when timestamp encodes a real date
            let dateStr = undefined
            try {
                if (typeof timestamp === 'string') {
                    if (timestamp.startsWith('date-')) {
                        const candidate = timestamp.replace(/^date-/, '')
                        const parsed = new Date(candidate)
                        if (!isNaN(parsed)) dateStr = parsed.toISOString().split('T')[0]
                    } else {
                        const parsed = new Date(timestamp)
                        if (!isNaN(parsed)) dateStr = parsed.toISOString().split('T')[0]
                    }
                }
            } catch (e) {
                dateStr = undefined
            }

            const newEntry = { timestamp, [field]: value }
            if (dateStr) newEntry.date = dateStr
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
            <div className="p-4 dark: border dark: rounded-xl">
                <h3 className="font-bold dark: mb-2 flex items-center gap-2">
                    <span>🌱</span> Pipeline de culture : Timeline interactive CDC
                </h3>
                <p className="text-sm dark:">
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
