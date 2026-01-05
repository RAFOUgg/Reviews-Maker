/**
 * HASH SEPARATION SIDEBAR CONTENT - Configuration CDC complète
 * 
 * Structure hiérarchique pour Pipeline Séparation (Hash)
 * Conforme Dev_Séparations.md
 * 
 * Sections principales :
 * - Configuration batch & trame
 * - Matière première
 * - Ice-Water / Bubble Hash
 * - Dry-sift / Kief
 */

export const HASH_SEPARATION_SIDEBAR_CONTENT = {
    CONFIG: {
        icon: '⚙️',
        label: 'Configuration batch',
        color: 'blue',
        collapsed: false,
        items: [
            {
                id: 'batchSize',
                label: 'Taille du batch',
                type: 'slider',
                min: 50,
                max: 5000,
                step: 50,
                unit: 'g',
                icon: '⚖️',
                defaultValue: 500,
                tooltip: 'Quantité de matière première utilisée'
            },
            {
                id: 'separationMethod',
                label: 'Méthode principale',
                type: 'select',
                options: [
                    { value: 'dry_sift', label: 'Tamisage à sec', icon: '🥄' },
                    { value: 'ice_water', label: 'Eau & glace', icon: '❄️' },
                    { value: 'machine', label: 'Machine rotative', icon: '⚙️' },
                    { value: 'drum', label: 'Tambour', icon: '🥁' },
                    { value: 'manual', label: 'Manuel / friction', icon: '✋' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '🔬',
                tooltip: 'Méthode de séparation des trichomes'
            }
        ]
    },

    MATIERE: {
        icon: '🌿',
        label: 'Matière première',
        color: 'green',
        collapsed: false,
        items: [
            {
                id: 'materialType',
                label: 'Type de matière',
                type: 'multiselect',
                options: [
                    { value: 'trim', label: 'Trim', icon: '✂️' },
                    { value: 'buds', label: 'Buds entiers', icon: '🌸' },
                    { value: 'mini-buds', label: 'Mini buds', icon: '🌼' },
                    { value: 'sugar-leaves', label: 'Sugar leaves', icon: '🍃' },
                    { value: 'whole-plant', label: 'Plante entière', icon: '🌳' },
                    { value: 'fresh-frozen', label: 'Fresh frozen', icon: '❄️' },
                    { value: 'dried', label: 'Séché', icon: '🌾' },
                    { value: 'outdoor', label: 'Outdoor', icon: '🌞' },
                    { value: 'indoor', label: 'Indoor', icon: '🏠' },
                    { value: 'greenhouse', label: 'Greenhouse', icon: '🏡' }
                ],
                icon: '🌿',
                tooltip: 'Types de matière végétale utilisée'
            },
            {
                id: 'materialState',
                label: 'État de la matière',
                type: 'select',
                options: [
                    { value: 'fresh', label: 'Fraîche', icon: '🌿' },
                    { value: 'dry-cured', label: 'Dry cured', icon: '🌾' },
                    { value: 'fresh-frozen', label: 'Fresh frozen', icon: '❄️' },
                    { value: 'aged', label: 'Vieillie / stockée', icon: '📦' }
                ],
                icon: '📋',
                tooltip: 'État de conservation de la matière'
            },
            {
                id: 'materialQuality',
                label: 'Qualité matière (subjectif)',
                type: 'slider',
                min: 1,
                max: 10,
                step: 1,
                icon: '⭐',
                defaultValue: 7,
                tooltip: 'Qualité perçue de la matière première'
            },
            {
                id: 'materialTags',
                label: 'Tags qualité',
                type: 'multiselect',
                options: [
                    { value: 'no-mold', label: 'Aucune moisissure visible', icon: '✅' },
                    { value: 'resinous', label: 'Très résineux', icon: '💎' },
                    { value: 'immature', label: 'Plante immature', icon: '🌱' },
                    { value: 'over-mature', label: 'Sur-mûre', icon: '🍂' }
                ],
                icon: '🏷️',
                tooltip: 'Caractéristiques qualitatives'
            }
        ]
    },

    ICE_WATER: {
        icon: '❄️',
        label: 'Ice-Water / Bubble Hash',
        color: 'cyan',
        collapsed: true,
        items: [
            {
                id: 'waterTemp',
                label: 'Température eau/mélange',
                type: 'slider',
                min: 0,
                max: 10,
                step: 0.5,
                unit: '°C',
                icon: '🌡️',
                defaultValue: 2,
                tooltip: 'Température de l\'eau (presque gelée / très froide)',
                zones: [
                    { min: 0, max: 2, label: 'Presque gelée (optimal)', color: 'blue' },
                    { min: 2, max: 5, label: 'Très froide', color: 'cyan' },
                    { min: 5, max: 10, label: 'Froide', color: 'green' }
                ]
            },
            {
                id: 'waterType',
                label: 'Type d\'eau',
                type: 'select',
                options: [
                    { value: 'ro', label: 'RO (osmosée)', icon: '💧' },
                    { value: 'distilled', label: 'Distillée', icon: '🧊' },
                    { value: 'filtered', label: 'Filtrée charbon', icon: '🔵' },
                    { value: 'tap', label: 'Robinet', icon: '🚰' }
                ],
                icon: '💧',
                tooltip: 'Type d\'eau utilisée'
            },
            {
                id: 'iceType',
                label: 'Type de glace',
                type: 'select',
                options: [
                    { value: 'ro-ice', label: 'Glace RO', icon: '🧊' },
                    { value: 'homemade', label: 'Glace maison', icon: '🏠' },
                    { value: 'block', label: 'Bloc', icon: '📦' },
                    { value: 'crushed', label: 'Crushed ice', icon: '❄️' }
                ],
                icon: '🧊',
                tooltip: 'Type de glace utilisée'
            },
            {
                id: 'iceRatio',
                label: 'Ratio glace/eau',
                type: 'slider',
                min: 0,
                max: 100,
                step: 5,
                unit: '%',
                icon: '📊',
                defaultValue: 50,
                tooltip: 'Pourcentage de glace dans le mélange'
            },
            {
                id: 'waterMaterialRatio',
                label: 'Ratio eau/matière',
                type: 'slider',
                min: 1,
                max: 10,
                step: 0.5,
                unit: ':1',
                icon: '⚖️',
                defaultValue: 5,
                tooltip: 'Litres d\'eau par kg de matière'
            },
            {
                id: 'numberOfWashes',
                label: 'Nombre de washes (passes)',
                type: 'stepper',
                min: 1,
                max: 10,
                icon: '🔄',
                defaultValue: 3,
                tooltip: 'Nombre de passes d\'extraction'
            },
            {
                id: 'washIntensity',
                label: 'Intensité par wash',
                type: 'select',
                options: [
                    { value: 'soft', label: 'Soft (doux)', icon: '🟢' },
                    { value: 'medium', label: 'Medium (moyen)', icon: '🟡' },
                    { value: 'hard', label: 'Hard (fort)', icon: '🔴' }
                ],
                icon: '💪',
                tooltip: 'Force d\'agitation moyenne'
            },
            {
                id: 'washDuration',
                label: 'Durée par wash',
                type: 'slider',
                min: 5,
                max: 45,
                step: 5,
                unit: 'min',
                icon: '⏱️',
                defaultValue: 15,
                tooltip: 'Durée moyenne d\'un wash'
            },
            {
                id: 'machineType',
                label: 'Type de machine',
                type: 'select',
                options: [
                    { value: 'none', label: 'Manuel / Sac', icon: '✋' },
                    { value: 'bubble', label: 'Machine bubble dédiée', icon: '⚙️' },
                    { value: 'washing', label: 'Machine à laver modifiée', icon: '🌀' },
                    { value: 'drum', label: 'Drum rotatif', icon: '🥁' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '🏭',
                tooltip: 'Équipement utilisé pour agitation'
            },
            {
                id: 'meshSizesUsed',
                label: 'Tailles de mailles (µm)',
                type: 'multiselect',
                options: [
                    { value: 25, label: '25µm (Ultra)', icon: '💎' },
                    { value: 40, label: '40µm', icon: '🌟' },
                    { value: 45, label: '45µm (Haute)', icon: '⭐' },
                    { value: 70, label: '70µm', icon: '🟡' },
                    { value: 73, label: '73µm (Moyenne-Haute)', icon: '🟢' },
                    { value: 90, label: '90µm (Moyenne)', icon: '🔵' },
                    { value: 104, label: '104µm', icon: '🟣' },
                    { value: 120, label: '120µm (Basse)', icon: '🟤' },
                    { value: 150, label: '150µm', icon: '⚪' },
                    { value: 160, label: '160µm', icon: '⚫' },
                    { value: 190, label: '190µm (Contamination)', icon: '🔴' },
                    { value: 220, label: '220µm (Contamination)', icon: '🔴' }
                ],
                icon: '🕸️',
                tooltip: 'Mailles utilisées dans le bag set'
            }
        ]
    },

    DRY_SIFT: {
        icon: '🥄',
        label: 'Dry-sift / Kief',
        color: 'amber',
        collapsed: true,
        items: [
            {
                id: 'drySiftSupport',
                label: 'Type de support',
                type: 'select',
                options: [
                    { value: 'manual-screen', label: 'Tamis manuel', icon: '🥄' },
                    { value: 'vibrating-table', label: 'Table vibrante', icon: '📳' },
                    { value: 'rotary-drum', label: 'Tambour rotatif', icon: '🥁' },
                    { value: 'card', label: 'Carte + tamis', icon: '💳' },
                    { value: 'pollinator', label: 'Pollinator', icon: '⚙️' }
                ],
                icon: '🛠️',
                tooltip: 'Équipement de tamisage utilisé'
            },
            {
                id: 'drySiftMeshes',
                label: 'Liste des microns (tamis)',
                type: 'multiselect',
                options: [
                    { value: 25, label: '25µm', icon: '💎' },
                    { value: 40, label: '40µm', icon: '🌟' },
                    { value: 45, label: '45µm', icon: '⭐' },
                    { value: 70, label: '70µm', icon: '🟡' },
                    { value: 73, label: '73µm', icon: '🟢' },
                    { value: 90, label: '90µm', icon: '🔵' },
                    { value: 104, label: '104µm', icon: '🟣' },
                    { value: 120, label: '120µm', icon: '🟤' },
                    { value: 150, label: '150µm', icon: '⚪' },
                    { value: 160, label: '160µm', icon: '⚫' },
                    { value: 190, label: '190µm', icon: '🔴' },
                    { value: 220, label: '220µm', icon: '🔴' }
                ],
                icon: '🕸️',
                tooltip: 'Tailles de tamis utilisés dans la cascade'
            },
            {
                id: 'siftDurationPerScreen',
                label: 'Durée par micron',
                type: 'slider',
                min: 1,
                max: 60,
                step: 1,
                unit: 'min',
                icon: '⏱️',
                defaultValue: 10,
                tooltip: 'Temps de tamisage moyen par taille de maille'
            },
            {
                id: 'siftIntensity',
                label: 'Intensité tamisage',
                type: 'slider',
                min: 1,
                max: 10,
                step: 1,
                icon: '💪',
                defaultValue: 5,
                tooltip: 'Force appliquée lors du tamisage (1=doux, 10=agressif)'
            },
            {
                id: 'ambientTemp',
                label: 'Température ambiante',
                type: 'slider',
                min: -20,
                max: 25,
                step: 1,
                unit: '°C',
                icon: '🌡️',
                defaultValue: 5,
                tooltip: 'Température de la pièce de travail',
                zones: [
                    { min: -20, max: 0, label: 'Très froid (optimal)', color: 'blue' },
                    { min: 0, max: 10, label: 'Froid', color: 'cyan' },
                    { min: 10, max: 25, label: 'Tempéré', color: 'yellow' }
                ]
            },
            {
                id: 'staticControl',
                label: 'Contrôle statique',
                type: 'boolean',
                icon: '⚡',
                tooltip: 'Utilisation de mesures anti-statique'
            },
            {
                id: 'humidityControl',
                label: 'Humidité relative',
                type: 'slider',
                min: 20,
                max: 80,
                step: 5,
                unit: '%',
                icon: '💧',
                defaultValue: 45,
                tooltip: 'Humidité ambiante durant le tamisage'
            }
        ]
    },

    RENDEMENT: {
        icon: '📊',
        label: 'Rendement & Qualité',
        color: 'purple',
        collapsed: true,
        items: [
            {
                id: 'totalYield',
                label: 'Rendement total',
                type: 'slider',
                min: 0,
                max: 100,
                step: 0.1,
                unit: 'g',
                icon: '⚖️',
                defaultValue: 25,
                tooltip: 'Poids total de hash produit'
            },
            {
                id: 'yieldPercentage',
                label: 'Rendement (%)',
                type: 'computed',
                unit: '%',
                icon: '📈',
                computeFrom: ['totalYield', 'batchSize'],
                computeFn: (data) => {
                    if (!data.totalYield || !data.batchSize) return 0
                    return ((data.totalYield / data.batchSize) * 100).toFixed(2)
                },
                tooltip: 'Pourcentage de rendement (hash / matière)'
            },
            {
                id: 'qualityGrade',
                label: 'Grade de qualité',
                type: 'select',
                options: [
                    { value: 'full-melt', label: 'Full Melt (6★)', icon: '💎' },
                    { value: '5-star', label: '5★ (High quality)', icon: '⭐' },
                    { value: '4-star', label: '4★ (Good)', icon: '🌟' },
                    { value: '3-star', label: '3★ (Average)', icon: '✨' },
                    { value: '2-star', label: '2★ (Food grade)', icon: '🍴' },
                    { value: '1-star', label: '1★ (Contaminated)', icon: '⚠️' }
                ],
                icon: '⭐',
                tooltip: 'Grade de pureté du hash produit'
            },
            {
                id: 'colorGrade',
                label: 'Couleur/Grade visuel',
                type: 'select',
                options: [
                    { value: 'white', label: 'Blanc/Crème (top)', icon: '⚪' },
                    { value: 'blonde', label: 'Blond doré', icon: '🟡' },
                    { value: 'amber', label: 'Ambré', icon: '🟠' },
                    { value: 'brown', label: 'Brun', icon: '🟤' },
                    { value: 'dark', label: 'Sombre/Noir', icon: '⚫' }
                ],
                icon: '🎨',
                tooltip: 'Couleur visuelle du hash produit'
            },
            {
                id: 'contaminationLevel',
                label: 'Niveau de contamination',
                type: 'slider',
                min: 0,
                max: 10,
                step: 1,
                icon: '🔬',
                defaultValue: 2,
                tooltip: 'Présence de matière végétale (0=pure, 10=très contaminé)'
            },
            {
                id: 'meltQuality',
                label: 'Qualité de melting',
                type: 'slider',
                min: 0,
                max: 10,
                step: 1,
                icon: '🔥',
                defaultValue: 7,
                tooltip: 'Capacité de fusion complète (0=aucune, 10=full melt)'
            }
        ]
    }
}

/**
 * Helper: Obtenir tous les IDs de champs (flat)
 */
export const getAllHashSeparationFieldIds = () => {
    const ids = []
    Object.values(HASH_SEPARATION_SIDEBAR_CONTENT).forEach(section => {
        section.items.forEach(item => {
            ids.push(item.id)
        })
    })
    return ids
}

/**
 * Helper: Obtenir un champ par ID
 */
export const getHashSeparationFieldById = (id) => {
    for (const section of Object.values(HASH_SEPARATION_SIDEBAR_CONTENT)) {
        const field = section.items.find(item => item.id === id)
        if (field) return field
    }
    return null
}

/**
 * Helper: Valider les dépendances d'un champ
 */
export const shouldShowHashSeparationField = (field, data) => {
    if (!field.dependsOn) return true
    if (!field.showIf) return true
    return field.showIf(data)
}
