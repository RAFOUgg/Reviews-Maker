/**
 * purificationSidebarContent.js
 * 
 * Configuration des champs pour Pipeline Purification
 * Conforme CDC - Phase 4
 * 
 * Sections:
 * - CONFIGURATION: Méthode, objectif, batch
 * - METHODE_PARAMS: Paramètres spécifiques selon méthode choisie
 * - SOLVANTS: Solvants utilisés (si applicable)
 * - TEMPERATURE_PRESSION: Contrôles environnementaux
 * - QUALITE: Pureté avant/après, contamination
 * - RENDEMENT: Calculs rendement et pertes
 * - NOTES: Observations et améliorations
 */

export const PURIFICATION_SIDEBAR_CONTENT = {
    CONFIGURATION: {
        icon: '⚙️',
        label: 'Configuration',
        color: '#3b82f6',
        items: [
            {
                id: 'purificationMethod',
                label: 'Méthode de purification',
                icon: '🔬',
                type: 'select',
                tooltip: 'Méthode de purification à utiliser',
                options: [
                    { value: 'winterization', label: 'Winterisation (Dewaxing)' },
                    { value: 'chromatography', label: 'Chromatographie sur colonne' },
                    { value: 'flash-chromatography', label: 'Flash Chromatography' },
                    { value: 'hplc', label: 'HPLC (Chromatographie liquide haute performance)' },
                    { value: 'gc', label: 'GC (Chromatographie en phase gazeuse)' },
                    { value: 'tlc', label: 'TLC (Chromatographie sur couche mince)' },
                    { value: 'decarboxylation', label: 'Décarboxylation' },
                    { value: 'fractional-distillation', label: 'Distillation fractionnée' },
                    { value: 'short-path-distillation', label: 'Distillation short-path' },
                    { value: 'molecular-distillation', label: 'Distillation moléculaire' },
                    { value: 'filtration', label: 'Filtration (membrane, charbon actif)' },
                    { value: 'centrifugation', label: 'Centrifugation' },
                    { value: 'vacuum-drying', label: 'Séchage sous vide' },
                    { value: 'recrystallization', label: 'Recristallisation' },
                    { value: 'sublimation', label: 'Sublimation' },
                    { value: 'liquid-liquid-extraction', label: 'Extraction liquide-liquide' },
                    { value: 'other', label: 'Autre méthode' }
                ],
                defaultValue: 'winterization'
            },
            {
                id: 'purificationObjective',
                label: 'Objectif de purification',
                icon: '🎯',
                type: 'multiselect',
                tooltip: 'Ce que vous cherchez à éliminer/purifier',
                options: [
                    { value: 'waxes', label: 'Cires et lipides' },
                    { value: 'fats', label: 'Graisses' },
                    { value: 'chlorophyll', label: 'Chlorophylle' },
                    { value: 'plant-matter', label: 'Matière végétale' },
                    { value: 'residual-solvents', label: 'Solvants résiduels' },
                    { value: 'heavy-metals', label: 'Métaux lourds' },
                    { value: 'pesticides', label: 'Pesticides' },
                    { value: 'mycotoxins', label: 'Mycotoxines' },
                    { value: 'isolate-cannabinoid', label: 'Isoler un cannabinoïde' },
                    { value: 'increase-purity', label: 'Augmenter la pureté globale' }
                ],
                defaultValue: ['waxes', 'fats']
            },
            {
                id: 'batchSize',
                label: 'Taille du batch',
                icon: '📦',
                type: 'number',
                unit: 'g',
                min: 0.1,
                max: 100000,
                step: 0.1,
                tooltip: 'Quantité de matière à purifier',
                defaultValue: 100
            },
            {
                id: 'processingDate',
                label: 'Date de purification',
                icon: '📅',
                type: 'date',
                tooltip: 'Date du processus de purification'
            },
            {
                id: 'processingDuration',
                label: 'Durée totale',
                icon: '⏳',
                type: 'number',
                unit: 'min',
                min: 1,
                max: 1440,
                step: 1,
                tooltip: 'Durée totale du processus'
            },
            {
                id: 'numberOfPasses',
                label: 'Nombre de passes',
                icon: '🔄',
                type: 'stepper',
                min: 1,
                max: 5,
                step: 1,
                tooltip: 'Nombre de fois que le processus est répété',
                defaultValue: 1
            }
        ]
    },

    SOLVANTS: {
        icon: '🧪',
        label: 'Solvants & Réactifs',
        color: '#06b6d4',
        items: [
            {
                id: 'solvants_info',
                label: 'Solvants utilisés selon la méthode',
                icon: 'ℹ️',
                type: 'info',
                tooltip: 'Les champs solvants s\'affichent selon la méthode choisie'
            },
            {
                id: 'primarySolvent',
                label: 'Solvant principal',
                icon: '🧪',
                type: 'select',
                tooltip: 'Solvant principal utilisé',
                options: [
                    { value: 'ethanol', label: 'Éthanol (EtOH)' },
                    { value: 'methanol', label: 'Méthanol (MeOH)' },
                    { value: 'isopropanol', label: 'Isopropanol (IPA)' },
                    { value: 'acetone', label: 'Acétone' },
                    { value: 'hexane', label: 'Hexane' },
                    { value: 'pentane', label: 'Pentane' },
                    { value: 'heptane', label: 'Heptane' },
                    { value: 'dichloromethane', label: 'Dichlorométhane (DCM)' },
                    { value: 'chloroform', label: 'Chloroforme' },
                    { value: 'butane', label: 'Butane' },
                    { value: 'propane', label: 'Propane' },
                    { value: 'co2', label: 'CO₂ supercritique' },
                    { value: 'water', label: 'Eau' },
                    { value: 'none', label: 'Aucun (méthode physique)' }
                ],
                defaultValue: 'ethanol',
                showIf: (data) => {
                    const methodsWithSolvents = ['winterization', 'chromatography', 'flash-chromatography',
                        'hplc', 'liquid-liquid-extraction', 'recrystallization']
                    return methodsWithSolvents.includes(data.purificationMethod)
                }
            },
            {
                id: 'solventRatio',
                label: 'Ratio solvant/matière',
                icon: '⚖️',
                type: 'number',
                unit: 'mL/g',
                min: 1,
                max: 100,
                step: 0.5,
                tooltip: 'Volume de solvant par gramme de matière',
                defaultValue: 10,
                showIf: (data) => data.primarySolvent && data.primarySolvent !== 'none'
            },
            {
                id: 'solventPurity',
                label: 'Pureté du solvant',
                icon: '💎',
                type: 'select',
                tooltip: 'Grade de pureté du solvant',
                options: [
                    { value: 'technical', label: 'Technique (≥95%)' },
                    { value: 'analytical', label: 'Analytique (≥99%)' },
                    { value: 'hplc', label: 'HPLC grade (≥99.5%)' },
                    { value: 'spectroscopy', label: 'Spectroscopie (≥99.9%)' },
                    { value: 'food-grade', label: 'Food grade' }
                ],
                defaultValue: 'analytical',
                showIf: (data) => data.primarySolvent && data.primarySolvent !== 'none'
            },
            {
                id: 'secondarySolvent',
                label: 'Solvant secondaire (optionnel)',
                icon: '🧪',
                type: 'select',
                tooltip: 'Solvant secondaire pour gradient ou co-solvant',
                options: [
                    { value: 'none', label: 'Aucun' },
                    { value: 'ethanol', label: 'Éthanol' },
                    { value: 'methanol', label: 'Méthanol' },
                    { value: 'water', label: 'Eau' },
                    { value: 'acetonitrile', label: 'Acétonitrile' },
                    { value: 'ethyl-acetate', label: 'Acétate d\'éthyle' }
                ],
                defaultValue: 'none',
                showIf: (data) => ['chromatography', 'flash-chromatography', 'hplc'].includes(data.purificationMethod)
            }
        ]
    },

    WINTERIZATION: {
        icon: '❄️',
        label: 'Winterisation',
        color: '#06b6d4',
        items: [
            {
                id: 'winterization_temperature',
                label: 'Température winterisation',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: -80,
                max: -5,
                step: 1,
                tooltip: 'Température de congélation (typiquement -20°C à -40°C)',
                defaultValue: -20,
                dependsOn: 'purificationMethod',
                showIf: (data) => data.purificationMethod === 'winterization'
            },
            {
                id: 'winterization_duration',
                label: 'Durée de congélation',
                icon: '⏱️',
                type: 'number',
                unit: 'heures',
                min: 1,
                max: 72,
                step: 1,
                tooltip: 'Temps de maintien au froid (24-48h recommandé)',
                defaultValue: 24,
                dependsOn: 'purificationMethod',
                showIf: (data) => data.purificationMethod === 'winterization'
            },
            {
                id: 'winterization_filtration',
                label: 'Type de filtration',
                icon: '🔬',
                type: 'select',
                tooltip: 'Méthode de filtration après winterisation',
                options: [
                    { value: 'buchner', label: 'Filtre Buchner (vide)' },
                    { value: 'paper', label: 'Papier filtre simple' },
                    { value: 'membrane', label: 'Filtre membrane (0.2-0.45µm)' },
                    { value: 'gravity', label: 'Filtration par gravité' },
                    { value: 'centrifuge', label: 'Centrifugation' }
                ],
                defaultValue: 'buchner',
                dependsOn: 'purificationMethod',
                showIf: (data) => data.purificationMethod === 'winterization'
            }
        ]
    },

    CHROMATOGRAPHY: {
        icon: '🌈',
        label: 'Chromatographie',
        color: '#8b5cf6',
        items: [
            {
                id: 'column_type',
                label: 'Type de colonne',
                icon: '🧪',
                type: 'select',
                tooltip: 'Type de colonne chromatographique',
                options: [
                    { value: 'silica', label: 'Silice (SiO₂)' },
                    { value: 'alumina', label: 'Alumine (Al₂O₃)' },
                    { value: 'c18', label: 'C18 (phase inverse)' },
                    { value: 'ion-exchange', label: 'Échange d\'ions' },
                    { value: 'size-exclusion', label: 'Exclusion de taille' },
                    { value: 'custom', label: 'Personnalisée' }
                ],
                defaultValue: 'silica',
                dependsOn: 'purificationMethod',
                showIf: (data) => ['chromatography', 'flash-chromatography', 'hplc'].includes(data.purificationMethod)
            },
            {
                id: 'column_dimensions',
                label: 'Dimensions colonne',
                icon: '📏',
                type: 'dimensions',
                zones: ['Diamètre (cm)', 'Hauteur (cm)'],
                tooltip: 'Taille de la colonne chromatographique',
                dependsOn: 'purificationMethod',
                showIf: (data) => ['chromatography', 'flash-chromatography'].includes(data.purificationMethod)
            },
            {
                id: 'mobile_phase',
                label: 'Phase mobile',
                icon: '💧',
                type: 'textarea',
                tooltip: 'Composition de la phase mobile (ex: Hexane/EtOAc 90:10)',
                maxLength: 200,
                dependsOn: 'purificationMethod',
                showIf: (data) => ['chromatography', 'flash-chromatography', 'hplc'].includes(data.purificationMethod)
            },
            {
                id: 'flow_rate',
                label: 'Débit',
                icon: '💨',
                type: 'number',
                unit: 'mL/min',
                min: 0.1,
                max: 100,
                step: 0.1,
                tooltip: 'Vitesse d\'écoulement de la phase mobile',
                defaultValue: 1,
                dependsOn: 'purificationMethod',
                showIf: (data) => ['flash-chromatography', 'hplc'].includes(data.purificationMethod)
            },
            {
                id: 'gradient',
                label: 'Gradient utilisé',
                icon: '📊',
                type: 'toggle',
                tooltip: 'Utilisation d\'un gradient de solvants',
                defaultValue: false,
                dependsOn: 'purificationMethod',
                showIf: (data) => ['flash-chromatography', 'hplc'].includes(data.purificationMethod)
            }
        ]
    },

    DISTILLATION: {
        icon: '🌡️',
        label: 'Distillation',
        color: '#f59e0b',
        items: [
            {
                id: 'distillation_type',
                label: 'Type de distillation',
                icon: '⚗️',
                type: 'select',
                tooltip: 'Méthode de distillation utilisée',
                options: [
                    { value: 'fractional', label: 'Fractionnée' },
                    { value: 'short-path', label: 'Short-path' },
                    { value: 'molecular', label: 'Moléculaire' },
                    { value: 'vacuum', label: 'Sous vide' },
                    { value: 'steam', label: 'Entraînement vapeur' }
                ],
                defaultValue: 'short-path',
                dependsOn: 'purificationMethod',
                showIf: (data) => ['fractional-distillation', 'short-path-distillation', 'molecular-distillation'].includes(data.purificationMethod)
            },
            {
                id: 'distillation_temperature',
                label: 'Température de distillation',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: 25,
                max: 300,
                step: 1,
                tooltip: 'Température du ballon de distillation',
                defaultValue: 180,
                dependsOn: 'purificationMethod',
                showIf: (data) => ['fractional-distillation', 'short-path-distillation', 'molecular-distillation'].includes(data.purificationMethod)
            },
            {
                id: 'distillation_pressure',
                label: 'Pression',
                icon: '💨',
                type: 'number',
                unit: 'mbar',
                min: 0.001,
                max: 1000,
                step: 0.1,
                tooltip: 'Pression durant la distillation (vide poussé = < 1 mbar)',
                defaultValue: 1,
                dependsOn: 'purificationMethod',
                showIf: (data) => ['short-path-distillation', 'molecular-distillation'].includes(data.purificationMethod)
            },
            {
                id: 'number_fractions',
                label: 'Nombre de fractions collectées',
                icon: '🧪',
                type: 'stepper',
                min: 1,
                max: 10,
                step: 1,
                tooltip: 'Nombre de fractions séparées',
                defaultValue: 3,
                dependsOn: 'purificationMethod',
                showIf: (data) => ['fractional-distillation', 'short-path-distillation'].includes(data.purificationMethod)
            }
        ]
    },

    DECARBOXYLATION: {
        icon: '🔥',
        label: 'Décarboxylation',
        color: '#ef4444',
        items: [
            {
                id: 'decarb_temperature',
                label: 'Température décarboxylation',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: 100,
                max: 160,
                step: 1,
                tooltip: 'Cinétique Wang et al. 2016 : >95% de conversion en 20 min à 110°C, sans franchir le seuil de dégradation (145°C)',
                defaultValue: 110,
                dependsOn: 'purificationMethod',
                showIf: (data) => data.purificationMethod === 'decarboxylation'
            },
            {
                id: 'decarb_duration',
                label: 'Durée décarboxylation',
                icon: '⏱️',
                type: 'number',
                unit: 'min',
                min: 15,
                max: 180,
                step: 5,
                tooltip: 'À 110°C, >95% de conversion en 20-30 min (Wang et al. 2016) — préserve mieux les terpènes qu\'un protocole haute température',
                defaultValue: 25,
                dependsOn: 'purificationMethod',
                showIf: (data) => data.purificationMethod === 'decarboxylation'
            },
            {
                id: 'decarb_atmosphere',
                label: 'Atmosphère',
                icon: '💨',
                type: 'select',
                tooltip: 'Environnement gazeux durant la décarboxylation',
                options: [
                    { value: 'air', label: 'Air ambiant' },
                    { value: 'nitrogen', label: 'Azote (N₂)' },
                    { value: 'vacuum', label: 'Sous vide' },
                    { value: 'co2', label: 'CO₂' }
                ],
                defaultValue: 'air',
                dependsOn: 'purificationMethod',
                showIf: (data) => data.purificationMethod === 'decarboxylation'
            }
        ]
    },

    FILTRATION: {
        icon: '🔬',
        label: 'Filtration',
        color: '#10b981',
        items: [
            {
                id: 'filter_type',
                label: 'Type de filtre',
                icon: '🎯',
                type: 'select',
                tooltip: 'Type de membrane ou filtre',
                options: [
                    { value: 'membrane-022', label: 'Membrane 0.22µm (stérile)' },
                    { value: 'membrane-045', label: 'Membrane 0.45µm' },
                    { value: 'membrane-1', label: 'Membrane 1µm' },
                    { value: 'activated-carbon', label: 'Charbon actif' },
                    { value: 'celite', label: 'Célite (terre de diatomée)' },
                    { value: 'buchner', label: 'Buchner (papier)' },
                    { value: 'syringe', label: 'Filtre seringue' }
                ],
                defaultValue: 'membrane-045',
                dependsOn: 'purificationMethod',
                showIf: (data) => data.purificationMethod === 'filtration'
            },
            {
                id: 'filtration_pressure',
                label: 'Pression de filtration',
                icon: '💨',
                type: 'select',
                tooltip: 'Méthode de filtration',
                options: [
                    { value: 'gravity', label: 'Gravité' },
                    { value: 'vacuum', label: 'Sous vide' },
                    { value: 'positive-pressure', label: 'Pression positive' }
                ],
                defaultValue: 'vacuum',
                dependsOn: 'purificationMethod',
                showIf: (data) => data.purificationMethod === 'filtration'
            }
        ]
    },

    QUALITE: {
        icon: '💎',
        label: 'Qualité & Pureté',
        color: '#a855f7',
        items: [
            {
                id: 'purity_before',
                label: 'Pureté initiale',
                icon: '📉',
                type: 'slider',
                unit: '%',
                min: 0,
                max: 100,
                step: 0.1,
                tooltip: 'Pureté du produit avant purification (estimée ou mesurée)',
                defaultValue: 70
            },
            {
                id: 'purity_after',
                label: 'Pureté finale',
                icon: '📈',
                type: 'slider',
                unit: '%',
                min: 0,
                max: 100,
                step: 0.1,
                tooltip: 'Pureté du produit après purification',
                defaultValue: 95
            },
            {
                id: 'purity_gain',
                label: 'Gain de pureté',
                icon: '🎯',
                type: 'computed',
                unit: '%',
                tooltip: 'Augmentation de pureté (final - initial)',
                computeFrom: ['purity_before', 'purity_after'],
                computeFn: (data) => {
                    const gain = (data.purity_after || 0) - (data.purity_before || 0)
                    return gain.toFixed(1)
                }
            },
            {
                id: 'contamination_removed',
                label: 'Contaminants éliminés',
                icon: '🧹',
                type: 'multiselect',
                tooltip: 'Types de contaminants effectivement retirés',
                options: [
                    { value: 'waxes', label: 'Cires' },
                    { value: 'lipids', label: 'Lipides' },
                    { value: 'chlorophyll', label: 'Chlorophylle' },
                    { value: 'plant-matter', label: 'Matière végétale' },
                    { value: 'residual-solvents', label: 'Solvants résiduels' },
                    { value: 'water', label: 'Eau' },
                    { value: 'heavy-metals', label: 'Métaux lourds' },
                    { value: 'pesticides', label: 'Pesticides' }
                ]
            },
            {
                id: 'lab_tested',
                label: 'Testé en laboratoire',
                icon: '🔬',
                type: 'toggle',
                tooltip: 'Résultats confirmés par analyse labo',
                defaultValue: false
            }
        ]
    },

    RENDEMENT: {
        icon: '📊',
        label: 'Rendement & Pertes',
        color: '#f59e0b',
        items: [
            {
                id: 'weight_input',
                label: 'Poids initial',
                icon: '⚖️',
                type: 'number',
                unit: 'g',
                min: 0.1,
                max: 100000,
                step: 0.1,
                tooltip: 'Poids de matière avant purification'
            },
            {
                id: 'weight_output',
                label: 'Poids final',
                icon: '⚖️',
                type: 'number',
                unit: 'g',
                min: 0,
                max: 100000,
                step: 0.1,
                tooltip: 'Poids de matière après purification'
            },
            {
                id: 'yield_percentage',
                label: 'Rendement',
                icon: '📈',
                type: 'computed',
                unit: '%',
                tooltip: 'Pourcentage de récupération (final/initial × 100)',
                computeFrom: ['weight_input', 'weight_output'],
                computeFn: (data) => {
                    if (!data.weight_input || data.weight_input === 0) return 0
                    return ((data.weight_output || 0) / data.weight_input * 100).toFixed(2)
                }
            },
            {
                id: 'losses',
                label: 'Pertes',
                icon: '📉',
                type: 'computed',
                unit: 'g',
                tooltip: 'Poids perdu durant la purification',
                computeFrom: ['weight_input', 'weight_output'],
                computeFn: (data) => {
                    const loss = (data.weight_input || 0) - (data.weight_output || 0)
                    return Math.max(0, loss).toFixed(2)
                }
            },
            {
                id: 'loss_reasons',
                label: 'Raisons des pertes',
                icon: '⚠️',
                type: 'multiselect',
                tooltip: 'Causes identifiées des pertes de matière',
                options: [
                    { value: 'evaporation', label: 'Évaporation' },
                    { value: 'filtration', label: 'Filtration (résidus)' },
                    { value: 'transfer', label: 'Transferts' },
                    { value: 'degradation', label: 'Dégradation' },
                    { value: 'contamination-removal', label: 'Retrait contaminants' },
                    { value: 'equipment', label: 'Adhésion équipement' },
                    { value: 'sampling', label: 'Échantillonnage' }
                ]
            }
        ]
    },

    NOTES: {
        icon: '📝',
        label: 'Notes & Observations',
        color: '#64748b',
        items: [
            {
                id: 'generalNotes',
                label: 'Notes générales',
                icon: '📄',
                type: 'textarea',
                tooltip: 'Observations sur le processus de purification',
                maxLength: 1000
            },
            {
                id: 'difficulties',
                label: 'Difficultés rencontrées',
                icon: '⚠️',
                type: 'textarea',
                tooltip: 'Problèmes durant la purification',
                maxLength: 500
            },
            {
                id: 'improvements',
                label: 'Améliorations possibles',
                icon: '💡',
                type: 'textarea',
                tooltip: 'Idées d\'optimisation pour futures purifications',
                maxLength: 500
            }
        ]
    }
}

/**
 * Obtenir tous les IDs des champs
 */
export function getAllPurificationFieldIds() {
    const ids = []
    Object.values(PURIFICATION_SIDEBAR_CONTENT).forEach(section => {
        section.items.forEach(item => {
            ids.push(item.id)
        })
    })
    return ids
}

/**
 * Obtenir un champ par son ID
 */
export function getPurificationFieldById(id) {
    for (const section of Object.values(PURIFICATION_SIDEBAR_CONTENT)) {
        const field = section.items.find(item => item.id === id)
        if (field) return field
    }
    return null
}

/**
 * Vérifier si un champ doit être affiché
 */
export function shouldShowField(field, data) {
    if (!field.showIf && !field.dependsOn) return true

    if (field.dependsOn && data[field.dependsOn] === undefined) {
        return false
    }

    if (field.showIf && typeof field.showIf === 'function') {
        return field.showIf(data)
    }

    return true
}

/**
 * Obtenir les champs par méthode de purification
 */
export function getFieldsByPurificationMethod(method) {
    const methodSections = {
        'winterization': ['CONFIGURATION', 'SOLVANTS', 'WINTERIZATION', 'QUALITE', 'RENDEMENT', 'NOTES'],
        'chromatography': ['CONFIGURATION', 'SOLVANTS', 'CHROMATOGRAPHY', 'QUALITE', 'RENDEMENT', 'NOTES'],
        'flash-chromatography': ['CONFIGURATION', 'SOLVANTS', 'CHROMATOGRAPHY', 'QUALITE', 'RENDEMENT', 'NOTES'],
        'hplc': ['CONFIGURATION', 'SOLVANTS', 'CHROMATOGRAPHY', 'QUALITE', 'RENDEMENT', 'NOTES'],
        'decarboxylation': ['CONFIGURATION', 'DECARBOXYLATION', 'QUALITE', 'RENDEMENT', 'NOTES'],
        'fractional-distillation': ['CONFIGURATION', 'DISTILLATION', 'QUALITE', 'RENDEMENT', 'NOTES'],
        'short-path-distillation': ['CONFIGURATION', 'DISTILLATION', 'QUALITE', 'RENDEMENT', 'NOTES'],
        'molecular-distillation': ['CONFIGURATION', 'DISTILLATION', 'QUALITE', 'RENDEMENT', 'NOTES'],
        'filtration': ['CONFIGURATION', 'FILTRATION', 'QUALITE', 'RENDEMENT', 'NOTES']
    }

    const sections = methodSections[method] || ['CONFIGURATION', 'QUALITE', 'RENDEMENT', 'NOTES']

    const fields = []
    sections.forEach(sectionKey => {
        const section = PURIFICATION_SIDEBAR_CONTENT[sectionKey]
        if (section) {
            section.items.forEach(item => fields.push(item.id))
        }
    })

    return fields
}

export default PURIFICATION_SIDEBAR_CONTENT
