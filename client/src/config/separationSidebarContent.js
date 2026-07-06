/**
 * separationSidebarContent.js
 * 
 * Configuration des champs pour Pipeline Séparation (Hash)
 * Conforme CDC - Phase 3
 * 
 * Sections:
 * - CONFIGURATION: Type séparation, trame, batch
 * - MATIERE_PREMIERE: Type matière, état, qualité
 * - ICE_WATER: Méthode eau/glace (bubble hash, ice-o-lator)
 * - DRY_SIFT: Méthode tamisage à sec (kief, dry-sift)
 * - RENDEMENT: Calculs poids, rendement par passe
 * - NOTES: Notes générales, observations
 */

export const SEPARATION_SIDEBAR_CONTENT = {
    CONFIGURATION: {
        icon: '⚙️',
        label: 'Configuration',
        color: '#3b82f6',
        items: [
            {
                id: 'separationType',
                label: 'Type de séparation',
                icon: '🔬',
                type: 'select',
                tooltip: 'Méthode de séparation des trichomes',
                options: [
                    { value: 'ice-water', label: 'Ice-Water / Bubble Hash' },
                    { value: 'dry-sift', label: 'Dry-Sift / Tamisage à sec' },
                    { value: 'ice-o-lator', label: 'Ice-O-Lator' },
                    { value: 'rosin-press', label: 'Pré-pressage (Rosin)' },
                    { value: 'electrostatic', label: 'Électrostatique / Triboélectrique' },
                    { value: 'manual', label: 'Manuel / Artisanal' },
                    { value: 'other', label: 'Autre méthode' }
                ],
                defaultValue: 'ice-water'
            },
            {
                id: 'intervalType',
                label: 'Trame temporelle',
                icon: '⏱️',
                type: 'select',
                tooltip: 'Unité de temps pour chaque étape',
                options: [
                    { value: 'seconds', label: 'Secondes' },
                    { value: 'minutes', label: 'Minutes' },
                    { value: 'hours', label: 'Heures' }
                ],
                defaultValue: 'minutes'
            },
            {
                id: 'batchSize',
                label: 'Taille du batch',
                icon: '📦',
                type: 'number',
                unit: 'g',
                min: 1,
                max: 100000,
                step: 1,
                tooltip: 'Quantité totale de matière première utilisée',
                defaultValue: 1000
            },
            {
                id: 'numberOfPasses',
                label: 'Nombre de passes/washes',
                icon: '🔄',
                type: 'stepper',
                min: 1,
                max: 10,
                step: 1,
                tooltip: 'Nombre total de passes de séparation',
                defaultValue: 3
            },
            {
                id: 'processingDate',
                label: 'Date de séparation',
                icon: '📅',
                type: 'date',
                tooltip: 'Date du processus de séparation'
            },
            {
                id: 'processingDuration',
                label: 'Durée totale',
                icon: '⏳',
                type: 'number',
                unit: 'min',
                min: 1,
                max: 480,
                step: 1,
                tooltip: 'Durée totale du processus de séparation'
            }
        ]
    },

    MATIERE_PREMIERE: {
        icon: '🌿',
        label: 'Matière première',
        color: '#10b981',
        items: [
            {
                id: 'materialType',
                label: 'Type de matière',
                icon: '🌱',
                type: 'select',
                tooltip: 'Type de matière végétale utilisée',
                options: [
                    { value: 'buds', label: 'Buds / Têtes' },
                    { value: 'trim', label: 'Trim / Feuilles de taille' },
                    { value: 'sugar-leaves', label: 'Sugar Leaves' },
                    { value: 'fresh-frozen', label: 'Fresh Frozen' },
                    { value: 'dry-material', label: 'Matière sèche' },
                    { value: 'whole-plant', label: 'Plante entière' },
                    { value: 'mix', label: 'Mélange' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'trim'
            },
            {
                id: 'materialState',
                label: 'État de la matière',
                icon: '❄️',
                type: 'select',
                tooltip: 'État physique de la matière au moment de la séparation',
                options: [
                    { value: 'fresh-frozen', label: 'Fraîche congelée' },
                    { value: 'dried', label: 'Séchée' },
                    { value: 'cured', label: 'Curée' },
                    { value: 'semi-dry', label: 'Semi-sèche' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'dried'
            },
            {
                id: 'materialQuality',
                label: 'Qualité de la matière',
                icon: '⭐',
                type: 'slider',
                min: 0,
                max: 10,
                step: 0.5,
                tooltip: 'Qualité visuelle de la matière première (trichomes, couleur)',
                defaultValue: 7
            },
            {
                id: 'moistureContent',
                label: 'Humidité résiduelle',
                icon: '💧',
                type: 'slider',
                unit: '%',
                min: 0,
                max: 100,
                step: 1,
                tooltip: 'Taux d\'humidité estimé de la matière',
                defaultValue: 10
            },
            {
                id: 'cultivars',
                label: 'Cultivar(s) utilisé(s)',
                icon: '🧬',
                type: 'autocomplete',
                tooltip: 'Variété(s) de cannabis utilisée(s)',
                suggestions: []
            }
        ]
    },

    ICE_WATER: {
        icon: '🧊',
        label: 'Ice-Water / Bubble',
        color: '#06b6d4',
        items: [
            {
                id: 'icewater_enabled',
                label: 'Méthode Ice-Water activée',
                icon: '✓',
                type: 'toggle',
                tooltip: 'Activer les champs spécifiques à la méthode ice-water',
                defaultValue: false
            },
            {
                id: 'waterTemperature',
                label: 'Température de l\'eau',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: 0,
                max: 10,
                step: 0.5,
                tooltip: 'Température de l\'eau durant le processus',
                defaultValue: 2,
                dependsOn: 'icewater_enabled',
                showIf: (data) => data.icewater_enabled === true
            },
            {
                id: 'waterType',
                label: 'Type d\'eau',
                icon: '💧',
                type: 'select',
                tooltip: 'Qualité de l\'eau utilisée',
                options: [
                    { value: 'ro', label: 'Osmose inverse (RO)' },
                    { value: 'distilled', label: 'Distillée' },
                    { value: 'filtered', label: 'Filtrée' },
                    { value: 'tap', label: 'Robinet' },
                    { value: 'spring', label: 'Source' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'ro',
                dependsOn: 'icewater_enabled',
                showIf: (data) => data.icewater_enabled === true
            },
            {
                id: 'iceType',
                label: 'Type de glace',
                icon: '🧊',
                type: 'select',
                tooltip: 'Type de glace utilisée',
                options: [
                    { value: 'cubes', label: 'Glaçons classiques' },
                    { value: 'crushed', label: 'Glace pilée' },
                    { value: 'block', label: 'Blocs de glace' },
                    { value: 'dry-ice', label: 'Glace carbonique (dry ice)' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'cubes',
                dependsOn: 'icewater_enabled',
                showIf: (data) => data.icewater_enabled === true
            },
            {
                id: 'ratioWater',
                label: 'Ratio eau',
                icon: '💧',
                type: 'number',
                unit: 'L',
                min: 0,
                max: 500,
                step: 0.5,
                tooltip: 'Volume d\'eau utilisé',
                dependsOn: 'icewater_enabled',
                showIf: (data) => data.icewater_enabled === true
            },
            {
                id: 'ratioIce',
                label: 'Ratio glace',
                icon: '🧊',
                type: 'number',
                unit: 'kg',
                min: 0,
                max: 500,
                step: 0.5,
                tooltip: 'Poids de glace utilisé',
                dependsOn: 'icewater_enabled',
                showIf: (data) => data.icewater_enabled === true
            },
            {
                id: 'agitationIntensity',
                label: 'Intensité agitation',
                icon: '🔄',
                type: 'slider',
                min: 0,
                max: 10,
                step: 0.5,
                tooltip: 'Intensité de l\'agitation (0=doux, 10=violent)',
                defaultValue: 5,
                dependsOn: 'icewater_enabled',
                showIf: (data) => data.icewater_enabled === true
            },
            {
                id: 'washDuration',
                label: 'Durée par wash',
                icon: '⏱️',
                type: 'number',
                unit: 'min',
                min: 1,
                max: 60,
                step: 1,
                tooltip: 'Durée d\'agitation par wash',
                defaultValue: 15,
                dependsOn: 'icewater_enabled',
                showIf: (data) => data.icewater_enabled === true
            },
            {
                id: 'machineType',
                label: 'Type de machine',
                icon: '🏭',
                type: 'select',
                tooltip: 'Machine utilisée pour l\'agitation',
                options: [
                    { value: 'washing-machine', label: 'Machine à laver' },
                    { value: 'bubble-machine', label: 'Bubble Machine dédiée' },
                    { value: 'manual', label: 'Manuel (paddle/cuillère)' },
                    { value: 'drill-mixer', label: 'Mélangeur perceuse' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'bubble-machine',
                dependsOn: 'icewater_enabled',
                showIf: (data) => data.icewater_enabled === true
            },
            {
                id: 'bagMicrons',
                label: 'Microns bags utilisés',
                icon: '🎯',
                type: 'multiselect',
                tooltip: 'Tailles de mailles utilisées (µm)',
                options: [
                    { value: '220', label: '220µm (Work bag)' },
                    { value: '190', label: '190µm' },
                    { value: '160', label: '160µm' },
                    { value: '120', label: '120µm (Premium)' },
                    { value: '90', label: '90µm' },
                    { value: '73', label: '73µm (Premium)' },
                    { value: '45', label: '45µm' },
                    { value: '25', label: '25µm (Contaminants)' }
                ],
                defaultValue: ['220', '120', '73', '45', '25'],
                dependsOn: 'icewater_enabled',
                showIf: (data) => data.icewater_enabled === true
            }
        ]
    },

    DRY_SIFT: {
        icon: '🔍',
        label: 'Dry-Sift / Kief',
        color: '#f59e0b',
        items: [
            {
                id: 'drysift_enabled',
                label: 'Méthode Dry-Sift activée',
                icon: '✓',
                type: 'toggle',
                tooltip: 'Activer les champs spécifiques au tamisage à sec',
                defaultValue: false
            },
            {
                id: 'screenType',
                label: 'Type de support',
                icon: '🎯',
                type: 'select',
                tooltip: 'Type de tamis/support utilisé',
                options: [
                    { value: 'manual-screen', label: 'Tamis manuel' },
                    { value: 'vibrating-table', label: 'Table vibrante' },
                    { value: 'tumbler', label: 'Tambour rotatif (tumbler)' },
                    { value: 'pollinator', label: 'Pollinator' },
                    { value: 'custom', label: 'Système custom' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'manual-screen',
                dependsOn: 'drysift_enabled',
                showIf: (data) => data.drysift_enabled === true
            },
            {
                id: 'screenMicrons',
                label: 'Microns tamis utilisés',
                icon: '🎯',
                type: 'multiselect',
                tooltip: 'Tailles de mailles des tamis (µm)',
                options: [
                    { value: '220', label: '220µm' },
                    { value: '190', label: '190µm' },
                    { value: '160', label: '160µm' },
                    { value: '120', label: '120µm' },
                    { value: '90', label: '90µm' },
                    { value: '75', label: '75µm' },
                    { value: '45', label: '45µm' },
                    { value: '25', label: '25µm' }
                ],
                defaultValue: ['160', '120', '75'],
                dependsOn: 'drysift_enabled',
                showIf: (data) => data.drysift_enabled === true
            },
            {
                id: 'siftingDuration',
                label: 'Durée de tamisage',
                icon: '⏱️',
                type: 'number',
                unit: 'min',
                min: 1,
                max: 240,
                step: 1,
                tooltip: 'Durée totale du tamisage',
                dependsOn: 'drysift_enabled',
                showIf: (data) => data.drysift_enabled === true
            },
            {
                id: 'siftingIntensity',
                label: 'Intensité du tamisage',
                icon: '💪',
                type: 'slider',
                min: 0,
                max: 10,
                step: 0.5,
                tooltip: 'Intensité de vibration/mouvement (0=doux, 10=intense)',
                defaultValue: 5,
                dependsOn: 'drysift_enabled',
                showIf: (data) => data.drysift_enabled === true
            },
            {
                id: 'ambientTemperature',
                label: 'Température ambiante',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: -20,
                max: 40,
                step: 0.5,
                tooltip: 'Température de la pièce durant le tamisage',
                defaultValue: 20,
                dependsOn: 'drysift_enabled',
                showIf: (data) => data.drysift_enabled === true
            },
            {
                id: 'materialFreezed',
                label: 'Matière pré-congelée',
                icon: '❄️',
                type: 'toggle',
                tooltip: 'La matière a-t-elle été pré-congelée ?',
                defaultValue: false,
                dependsOn: 'drysift_enabled',
                showIf: (data) => data.drysift_enabled === true
            }
        ]
    },

    ELECTROSTATIC: {
        icon: '⚡',
        label: 'Électrostatique / Triboélectrique',
        color: '#a855f7',
        sectionHint: 'Technique de frontière (ex: "Teflon Tech"/"Electrostatic Separator" chez HashCru) — paramètres précis (kV, températures) non publiés publiquement par les fabricants à ce stade. Champ notes à privilégier tant que le protocole n\'est pas stabilisé.',
        items: [
            {
                id: 'electrostatic_enabled',
                label: 'Séparation électrostatique',
                icon: '⚡',
                type: 'toggle',
                tooltip: 'Séparation par charge triboélectrique (plaques/tiges PTFE polarisées)',
                defaultValue: false,
                dependsOn: 'separationType',
                showIf: (data) => data.separationType === 'electrostatic'
            },
            {
                id: 'electrostaticMethod',
                label: 'Procédé',
                icon: '🔌',
                type: 'select',
                tooltip: 'Variante de séparation électrostatique utilisée',
                options: [
                    { value: 'teflon-tech', label: 'Teflon Tech (plaques/tiges PTFE)' },
                    { value: 'electrostatic-separator', label: 'Electrostatic Separator' },
                    { value: 'other', label: 'Autre / non nommé' }
                ],
                defaultValue: 'teflon-tech',
                dependsOn: 'electrostatic_enabled',
                showIf: (data) => data.electrostatic_enabled === true
            },
            {
                id: 'electrostaticTemp',
                label: 'Température',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: -10,
                max: 15,
                step: 1,
                tooltip: 'Procédé rapporté à basse température (0-10°C)',
                defaultValue: 5,
                dependsOn: 'electrostatic_enabled',
                showIf: (data) => data.electrostatic_enabled === true
            },
            {
                id: 'electrostaticNotes',
                label: 'Détails du protocole',
                icon: '📝',
                type: 'textarea',
                maxLength: 500,
                tooltip: 'Tension (kV), équipement, durée — paramètres non standardisés publiquement, à documenter librement',
                dependsOn: 'electrostatic_enabled',
                showIf: (data) => data.electrostatic_enabled === true
            }
        ]
    },

    FINITION: {
        icon: '🧹',
        label: 'Finition (HashVac / Stalk removal)',
        color: '#06b6d4',
        sectionHint: 'Sous-étapes de finition rapportées par la communauté professionnelle (HashCru), applicables en aval d\'un ice-water ou d\'un dry-sift — pas des méthodes de séparation concurrentes.',
        items: [
            {
                id: 'hashvac_enabled',
                label: 'HashVac (séchage + raffinage sous vide)',
                icon: '🌀',
                type: 'toggle',
                tooltip: 'Aspirateur + tamis fin pour sécher et raffiner le hash humide immédiatement après ice-water',
                defaultValue: false
            },
            {
                id: 'hashvacMeshMicrons',
                label: 'Maille du tamis HashVac',
                icon: '🎯',
                type: 'select',
                options: [
                    { value: '45', label: '45µm' },
                    { value: '70', label: '70µm (typique, nylon)' },
                    { value: '90', label: '90µm' },
                    { value: '120', label: '120µm' }
                ],
                defaultValue: '70',
                dependsOn: 'hashvac_enabled',
                showIf: (data) => data.hashvac_enabled === true
            },
            {
                id: 'hashvacDuration',
                label: 'Durée de séchage',
                icon: '⏳',
                type: 'number',
                unit: 'min',
                min: 1,
                max: 240,
                step: 1,
                tooltip: 'Performance rapportée : activité de l\'eau (Aw) <0,6 en moins de 60 min',
                defaultValue: 60,
                dependsOn: 'hashvac_enabled',
                showIf: (data) => data.hashvac_enabled === true
            },
            {
                id: 'stalkRemoval_enabled',
                label: 'Stalk removal (Headhunter SRS)',
                icon: '🗡️',
                type: 'toggle',
                tooltip: 'Tamis de finition acier inoxydable 304 pour retirer les fragments de tige résiduels',
                defaultValue: false
            },
            {
                id: 'stalkRemovalDuration',
                label: 'Durée par tamis',
                icon: '⏱️',
                type: 'number',
                unit: 'min',
                min: 0.5,
                max: 5,
                step: 0.5,
                tooltip: 'Usage recommandé sous 2 min/tamis (feuille d\'acier fine)',
                defaultValue: 2,
                dependsOn: 'stalkRemoval_enabled',
                showIf: (data) => data.stalkRemoval_enabled === true
            },
            {
                id: 'finitionNotes',
                label: 'Notes de finition',
                icon: '📝',
                type: 'textarea',
                maxLength: 500,
                dependsOn: 'hashvac_enabled',
                showIf: (data) => data.hashvac_enabled === true || data.stalkRemoval_enabled === true
            }
        ]
    },

    RENDEMENT: {
        icon: '📊',
        label: 'Rendement & Qualité',
        color: '#8b5cf6',
        items: [
            {
                id: 'passes',
                label: 'Passes / Washes',
                icon: '🔄',
                type: 'records-list',
                recordLabel: 'Passe',
                tooltip: 'Détail de chaque passe : les rendements ci-dessous sont calculés automatiquement à partir de ces données',
                recordFields: [
                    {
                        key: 'microns', label: 'Microns', type: 'select', options: [
                            { value: '220', label: '220µm' },
                            { value: '190', label: '190µm' },
                            { value: '160', label: '160µm' },
                            { value: '120', label: '120µm' },
                            { value: '90', label: '90µm' },
                            { value: '73', label: '73µm' },
                            { value: '45', label: '45µm' },
                            { value: '25', label: '25µm' }
                        ]
                    },
                    { key: 'weight', label: 'Poids', type: 'number', unit: 'g', min: 0, step: 0.1 },
                    { key: 'quality', label: 'Qualité', type: 'slider', unit: '/10', min: 0, max: 10, step: 0.5 },
                    { key: 'melt', label: 'Melt', type: 'slider', unit: '/10', min: 0, max: 10, step: 1 },
                    {
                        key: 'color', label: 'Couleur', type: 'select', options: [
                            { value: 'blonde', label: 'Blonde' },
                            { value: 'gold', label: 'Or' },
                            { value: 'brown', label: 'Brune' },
                            { value: 'green', label: 'Verte' },
                            { value: 'dark', label: 'Foncée' }
                        ]
                    },
                    {
                        key: 'texture', label: 'Texture', type: 'select', options: [
                            { value: 'sandy', label: 'Sableuse' },
                            { value: 'greasy', label: 'Grasse' },
                            { value: 'sticky', label: 'Collante' },
                            { value: 'crumbly', label: 'Friable' },
                            { value: 'full-melt', label: 'Full melt' }
                        ]
                    },
                    { key: 'duration', label: 'Durée', type: 'number', unit: 'min', min: 0 },
                    { key: 'notes', label: 'Notes', type: 'text' }
                ]
            },
            {
                id: 'totalYield',
                label: 'Rendement total',
                icon: '⚖️',
                type: 'computed',
                unit: 'g',
                tooltip: 'Poids total de hash obtenu (toutes passes confondues)',
                computeFrom: ['passes'],
                computeFn: (data) => {
                    if (!data.passes || !Array.isArray(data.passes)) return 0
                    return data.passes.reduce((sum, pass) => sum + (pass.weight || 0), 0)
                }
            },
            {
                id: 'yieldPercentage',
                label: 'Rendement %',
                icon: '📈',
                type: 'computed',
                unit: '%',
                tooltip: 'Pourcentage de rendement (hash/matière)',
                computeFrom: ['totalYield', 'batchSize'],
                computeFn: (data) => {
                    if (!data.totalYield || !data.batchSize) return 0
                    return ((data.totalYield / data.batchSize) * 100).toFixed(2)
                }
            },
            {
                id: 'averageQuality',
                label: 'Qualité moyenne',
                icon: '⭐',
                type: 'computed',
                unit: '/10',
                tooltip: 'Note moyenne de qualité (toutes passes)',
                computeFrom: ['passes'],
                computeFn: (data) => {
                    if (!data.passes || !Array.isArray(data.passes) || data.passes.length === 0) return 0
                    const sum = data.passes.reduce((acc, pass) => acc + (pass.quality || 0), 0)
                    return (sum / data.passes.length).toFixed(1)
                }
            },
            {
                id: 'premiumYield',
                label: 'Rendement premium',
                icon: '💎',
                type: 'computed',
                unit: 'g',
                tooltip: 'Poids de hash premium (qualité ≥ 8/10)',
                computeFrom: ['passes'],
                computeFn: (data) => {
                    if (!data.passes || !Array.isArray(data.passes)) return 0
                    return data.passes
                        .filter(pass => pass.quality >= 8)
                        .reduce((sum, pass) => sum + (pass.weight || 0), 0)
                }
            },
            {
                id: 'contamination',
                label: 'Contamination estimée',
                icon: '⚠️',
                type: 'slider',
                unit: '%',
                min: 0,
                max: 50,
                step: 1,
                tooltip: 'Estimation du taux de contamination (matière végétale, impuretés)',
                defaultValue: 5
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
                tooltip: 'Observations générales sur le processus de séparation',
                maxLength: 1000
            },
            {
                id: 'difficulties',
                label: 'Difficultés rencontrées',
                icon: '⚠️',
                type: 'textarea',
                tooltip: 'Problèmes ou difficultés durant la séparation',
                maxLength: 500
            },
            {
                id: 'improvements',
                label: 'Améliorations possibles',
                icon: '💡',
                type: 'textarea',
                tooltip: 'Idées d\'amélioration pour les prochaines séparations',
                maxLength: 500
            }
        ]
    }
}

/**
 * Structure de données pour une passe de séparation
 */
export const SEPARATION_PASS_STRUCTURE = {
    passNumber: 1,                  // Numéro de la passe (1-10)
    duration: 15,                   // Durée en minutes
    microns: '120',                 // Taille du tamis/bag utilisé
    weight: 0,                      // Poids obtenu (g)
    quality: 0,                     // Qualité /10
    color: '',                      // Couleur (blonde, brune, etc.)
    texture: '',                    // Texture (sableuse, grasse, etc.)
    melt: 0,                        // Melt quality /10 (full melt = 10)
    notes: '',                      // Notes spécifiques à cette passe
    timestamp: new Date().toISOString()
}

/**
 * Obtenir tous les IDs des champs
 */
export function getAllSeparationFieldIds() {
    const ids = []
    Object.values(SEPARATION_SIDEBAR_CONTENT).forEach(section => {
        section.items.forEach(item => {
            ids.push(item.id)
        })
    })
    return ids
}

/**
 * Obtenir un champ par son ID
 */
export function getSeparationFieldById(id) {
    for (const section of Object.values(SEPARATION_SIDEBAR_CONTENT)) {
        const field = section.items.find(item => item.id === id)
        if (field) return field
    }
    return null
}

/**
 * Vérifier si un champ doit être affiché selon les conditions
 */
export function shouldShowField(field, data) {
    // Si pas de condition, toujours afficher
    if (!field.showIf && !field.dependsOn) return true

    // Vérifier dépendance simple
    if (field.dependsOn && data[field.dependsOn] === undefined) {
        return false
    }

    // Vérifier fonction showIf
    if (field.showIf && typeof field.showIf === 'function') {
        return field.showIf(data)
    }

    return true
}

/**
 * Obtenir les champs par type de séparation
 */
export function getFieldsBySeparationType(separationType) {
    const allFields = getAllSeparationFieldIds()

    if (separationType === 'ice-water' || separationType === 'ice-o-lator') {
        return allFields.filter(id => !id.startsWith('drysift_'))
    }

    if (separationType === 'dry-sift') {
        return allFields.filter(id => !id.startsWith('icewater_'))
    }

    return allFields
}

export default SEPARATION_SIDEBAR_CONTENT
