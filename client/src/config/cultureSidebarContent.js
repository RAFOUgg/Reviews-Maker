/**
 * CULTURE SIDEBAR CONTENT - Configuration CDC complète
 * 
 * Structure hiérarchique pour Pipeline Culture (Fleurs)
 * 85+ champs répartis en 8 sections principales
 * 
 * Chaque item définit :
 * - id: identifiant unique pour stockage
 * - label: texte affiché
 * - type: type de champ (select, slider, stepper, date, etc.)
 * - options: valeurs possibles (pour select/multiselect)
 * - min/max/step: bornes (pour slider/stepper)
 * - unit: unité affichée
 * - icon: émoji/icône
 * - computed: si calculé automatiquement
 * - dependsOn: dépendance conditionnelle
 */

export const CULTURE_SIDEBAR_CONTENT = {
    GENERAL: {
        icon: '📋',
        label: 'Informations générales',
        color: 'blue',
        collapsed: false,
        items: [
            {
                id: 'startDate',
                label: 'Début culture',
                type: 'date',
                icon: '📅',
                tooltip: 'Date de germination ou de plantation'
            },
            {
                id: 'endDate',
                label: 'Fin culture',
                type: 'date',
                icon: '📅',
                tooltip: 'Date de récolte'
            },
            {
                id: 'duration',
                label: 'Durée totale',
                type: 'computed',
                unit: 'jours',
                icon: '⏱️',
                computeFrom: ['startDate', 'endDate'],
                computeFn: (data) => {
                    if (!data.startDate || !data.endDate) return 0
                    const start = new Date(data.startDate)
                    const end = new Date(data.endDate)
                    const diff = Math.abs(end - start)
                    return Math.ceil(diff / (1000 * 60 * 60 * 24))
                }
            },
            {
                id: 'mode',
                label: 'Mode de culture',
                type: 'select',
                options: [
                    { value: 'indoor', label: 'Indoor', icon: '🏠' },
                    { value: 'outdoor', label: 'Outdoor', icon: '🌞' },
                    { value: 'greenhouse', label: 'Greenhouse', icon: '🏡' },
                    { value: 'notill', label: 'No-till', icon: '🌿' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '🏠',
                tooltip: 'Environnement de culture principal'
            },
            {
                id: 'spaceType',
                label: 'Type d\'espace',
                type: 'select',
                options: [
                    { value: 'tent', label: 'Tente', icon: '⛺' },
                    { value: 'closet', label: 'Armoire', icon: '🚪' },
                    { value: 'room', label: 'Chambre/Room', icon: '🏠' },
                    { value: 'greenhouse', label: 'Serre', icon: '🏡' },
                    { value: 'outdoor', label: 'Extérieur direct', icon: '🌳' },
                    { value: 'guerilla', label: 'Guérilla', icon: '🌲' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '📦',
                tooltip: 'Type d\'espace de culture'
            },
            {
                id: 'dimensions',
                label: 'Dimensions (L×l×H)',
                type: 'dimensions',
                unit: 'cm',
                icon: '📏',
                tooltip: 'Dimensions de l\'espace de culture',
                defaultValue: { length: 120, width: 120, height: 200 }
            },
            {
                id: 'surfaceAuSol',
                label: 'Surface au sol',
                type: 'computed',
                unit: 'm²',
                icon: '⬜',
                computeFrom: ['dimensions'],
                computeFn: (data) => {
                    if (!data.dimensions) return 0
                    const { length, width } = data.dimensions
                    return ((length / 100) * (width / 100)).toFixed(2)
                }
            },
            {
                id: 'volumeTotal',
                label: 'Volume total',
                type: 'computed',
                unit: 'm³',
                icon: '📦',
                computeFrom: ['dimensions'],
                computeFn: (data) => {
                    if (!data.dimensions) return 0
                    const { length, width, height } = data.dimensions
                    return ((length / 100) * (width / 100) * (height / 100)).toFixed(2)
                }
            },
            {
                id: 'densitePlantation',
                label: 'Densité de plantation',
                type: 'slider',
                min: 0.5,
                max: 16,
                step: 0.5,
                unit: 'plantes/m²',
                icon: '🌿',
                defaultValue: 4,
                tooltip: 'Nombre de plantes par m²',
                suggestions: [
                    { value: 1, label: 'SOG faible (1)' },
                    { value: 4, label: 'Standard (4)' },
                    { value: 9, label: 'SOG dense (9)' },
                    { value: 16, label: 'SOG très dense (16)' }
                ]
            }
        ]
    },

    ENVIRONNEMENT: {
        icon: '🌱',
        label: 'Environnement & Substrat',
        color: 'green',
        collapsed: true,
        items: [
            {
                id: 'propagation',
                label: 'Méthode de propagation',
                type: 'select',
                options: [
                    { value: 'seed', label: 'Graine', icon: '🌰' },
                    { value: 'clone', label: 'Clone', icon: '🧬' },
                    { value: 'cutting', label: 'Bouture', icon: '✂️' },
                    { value: 'tissue', label: 'Tissu humide (sopalin/coton)', icon: '🧻' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '🌱',
                tooltip: 'Méthode de démarrage de la culture'
            },
            {
                id: 'germinationMethod',
                label: 'Méthode germination',
                type: 'select',
                options: [
                    { value: 'soil', label: 'Terre directe', icon: '🪴' },
                    { value: 'paper', label: 'Papier/Sopalin', icon: '🧻' },
                    { value: 'water', label: 'Verre d\'eau', icon: '💧' },
                    { value: 'rockwool', label: 'Laine de roche', icon: '🧱' },
                    { value: 'jiffy', label: 'Pastille Jiffy', icon: '⚪' }
                ],
                icon: '🌱',
                dependsOn: 'propagation',
                showIf: (data) => data.propagation === 'seed',
                tooltip: 'Technique de germination utilisée'
            },
            {
                id: 'seedType',
                label: 'Type de graine',
                type: 'select',
                options: [
                    { value: 'regular', label: 'Régulière', icon: '🌱' },
                    { value: 'feminized', label: 'Féminisée', icon: '♀️' },
                    { value: 'auto', label: 'Auto-florissante', icon: '⚡' }
                ],
                icon: '🌰',
                dependsOn: 'propagation',
                showIf: (data) => data.propagation === 'seed'
            },
            {
                id: 'substrateType',
                label: 'Type de substrat',
                type: 'select',
                options: [
                    { value: 'soil', label: 'Terreau', icon: '🟤' },
                    { value: 'coco', label: 'Coco', icon: '🥥' },
                    { value: 'rockwool', label: 'Laine de roche', icon: '🧱' },
                    { value: 'living-soil', label: 'Mélange organique vivant', icon: '🌿' },
                    { value: 'hydro-dtw', label: 'Hydro drain-to-waste', icon: '💧' },
                    { value: 'dwc', label: 'DWC (Deep Water Culture)', icon: '🌊' },
                    { value: 'nft', label: 'NFT (Nutrient Film Technique)', icon: '💦' },
                    { value: 'aero', label: 'Aéroponique', icon: '💨' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '🪴',
                tooltip: 'Type de milieu de culture'
            },
            {
                id: 'potVolume',
                label: 'Volume du pot',
                type: 'slider',
                min: 0.5,
                max: 100,
                step: 0.5,
                unit: 'L',
                icon: '🪴',
                defaultValue: 11,
                tooltip: 'Volume du contenant par plante',
                suggestions: [
                    { value: 3, label: 'Petit (3L)' },
                    { value: 11, label: 'Standard (11L)' },
                    { value: 25, label: 'Grand (25L)' },
                    { value: 50, label: 'Très grand (50L)' }
                ]
            },
            {
                id: 'substrateComposition',
                label: 'Composition du substrat',
                type: 'pie',
                icon: '📊',
                tooltip: 'Répartition en % des composants du substrat',
                components: [
                    { id: 'soil', label: 'Terreau', color: '#8b4513' },
                    { id: 'coco', label: 'Coco', color: '#d2691e' },
                    { id: 'perlite', label: 'Perlite', color: '#ffffff' },
                    { id: 'vermiculite', label: 'Vermiculite', color: '#ffd700' },
                    { id: 'compost', label: 'Compost', color: '#654321' },
                    { id: 'humus', label: 'Humus', color: '#8b7355' },
                    { id: 'biochar', label: 'Biochar', color: '#2f4f4f' },
                    { id: 'sand', label: 'Sable', color: '#f4a460' },
                    { id: 'rockwool', label: 'Laine roche', color: '#dcdcdc' },
                    { id: 'other', label: 'Autre', color: '#808080' }
                ],
                dependsOn: 'substrateType',
                showIf: (data) => ['soil', 'coco', 'living-soil'].includes(data.substrateType)
            },
            {
                id: 'substrateBrand',
                label: 'Marque substrat',
                type: 'autocomplete',
                icon: '🏷️',
                tooltip: 'Marque/nom du substrat utilisé',
                suggestions: [
                    'BioBizz Light Mix',
                    'BioBizz All Mix',
                    'Plagron Light Mix',
                    'Plagron Royalty Mix',
                    'Canna Terra Professional',
                    'Fox Farm Ocean Forest',
                    'Composté maison',
                    'Autre'
                ]
            }
        ]
    },

    IRRIGATION: {
        icon: '💧',
        label: 'Irrigation & Solution nutritive',
        color: 'cyan',
        collapsed: true,
        items: [
            {
                id: 'irrigationType',
                label: 'Type d\'irrigation',
                type: 'select',
                options: [
                    { value: 'manual', label: 'Manuel', icon: '🚰' },
                    { value: 'drip', label: 'Goutte à goutte', icon: '💧' },
                    { value: 'flood', label: 'Table d\'inondation', icon: '🌊' },
                    { value: 'dtw', label: 'Drip-to-waste', icon: '💦' },
                    { value: 'autopot', label: 'Autopot', icon: '🪴' },
                    { value: 'rdwc', label: 'RDWC', icon: '🔄' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '💧',
                tooltip: 'Système d\'arrosage utilisé'
            },
            {
                id: 'irrigationFrequency',
                label: 'Fréquence d\'arrosage',
                type: 'frequency',
                icon: '🔄',
                tooltip: 'Fréquence des arrosages',
                defaultValue: { value: 2, period: 'day' } // 2 fois par jour
            },
            {
                id: 'waterVolume',
                label: 'Volume par arrosage',
                type: 'slider',
                min: 0.1,
                max: 5,
                step: 0.1,
                unit: 'L',
                icon: '🚰',
                defaultValue: 1,
                tooltip: 'Volume d\'eau/solution par arrosage et par plante'
            },
            {
                id: 'waterPH',
                label: 'pH de l\'eau',
                type: 'slider',
                min: 4.5,
                max: 8.0,
                step: 0.1,
                icon: '⚗️',
                defaultValue: 6.5,
                tooltip: 'pH de la solution nutritive',
                zones: [
                    { min: 5.5, max: 6.5, label: 'Optimal terre', color: 'green' },
                    { min: 5.8, max: 6.2, label: 'Optimal hydro', color: 'blue' }
                ]
            },
            {
                id: 'waterEC',
                label: 'EC (Conductivité)',
                type: 'slider',
                min: 0.2,
                max: 3.0,
                step: 0.1,
                unit: 'mS/cm',
                icon: '⚡',
                defaultValue: 1.2,
                tooltip: 'Conductivité électrique de la solution',
                zones: [
                    { min: 0.8, max: 1.2, label: 'Croissance', color: 'green' },
                    { min: 1.2, max: 2.0, label: 'Floraison', color: 'purple' }
                ]
            },
            {
                id: 'waterType',
                label: 'Type d\'eau',
                type: 'select',
                options: [
                    { value: 'tap', label: 'Eau du robinet', icon: '🚰' },
                    { value: 'ro', label: 'Osmose inverse (RO)', icon: '💧' },
                    { value: 'spring', label: 'Eau de source', icon: '🏔️' },
                    { value: 'rain', label: 'Eau de pluie', icon: '🌧️' },
                    { value: 'mix', label: 'Mélange', icon: '🔄' }
                ],
                icon: '💦',
                tooltip: 'Source d\'eau utilisée'
            }
        ]
    },

    NUTRITION: {
        icon: '🧪',
        label: 'Engrais & Nutrition',
        color: 'yellow',
        collapsed: true,
        items: [
            {
                id: 'fertilizerType',
                label: 'Type d\'engrais',
                type: 'select',
                options: [
                    { value: 'organic', label: 'Organique', icon: '🌿' },
                    { value: 'mineral', label: 'Minéral', icon: '⚗️' },
                    { value: 'organo-mineral', label: 'Organo-minéral', icon: '🔬' },
                    { value: 'living-soil', label: 'Living Soil (sans engrais)', icon: '🪴' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '🧪',
                tooltip: 'Type d\'engrais principal'
            },
            {
                id: 'fertilizerBrand',
                label: 'Marque d\'engrais',
                type: 'autocomplete',
                icon: '🏷️',
                tooltip: 'Marque/gamme d\'engrais utilisée',
                suggestions: [
                    'BioBizz',
                    'General Hydroponics (GHE)',
                    'Advanced Nutrients',
                    'Plagron',
                    'Canna',
                    'House & Garden',
                    'Biobact',
                    'Green House Feeding',
                    'Composté maison',
                    'Autre'
                ]
            },
            {
                id: 'fertilizerLine',
                label: 'Gamme/Produits',
                type: 'multiselect',
                options: [
                    { value: 'grow', label: 'Grow (Croissance)', icon: '🌱' },
                    { value: 'bloom', label: 'Bloom (Floraison)', icon: '🌸' },
                    { value: 'booster', label: 'Booster', icon: '🚀' },
                    { value: 'calmag', label: 'CalMag', icon: '💪' },
                    { value: 'pk', label: 'PK Booster', icon: '⚡' },
                    { value: 'enzymes', label: 'Enzymes', icon: '🧬' },
                    { value: 'microbes', label: 'Micro-organismes', icon: '🦠' },
                    { value: 'vitamins', label: 'Vitamines', icon: '💊' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '📦',
                tooltip: 'Produits utilisés de la gamme'
            },
            {
                id: 'fertilizerDosage',
                label: 'Dosage',
                type: 'slider',
                min: 0.1,
                max: 5.0,
                step: 0.1,
                unit: 'mL/L',
                icon: '💉',
                defaultValue: 2,
                tooltip: 'Dosage moyen utilisé'
            },
            {
                id: 'fertilizerFrequency',
                label: 'Fréquence fertilisation',
                type: 'frequency',
                icon: '🔄',
                tooltip: 'À quelle fréquence les engrais sont appliqués',
                presets: [
                    { label: '1 fois sur 2 arrosages', value: { value: 0.5, period: 'watering' } },
                    { label: 'Chaque arrosage', value: { value: 1, period: 'watering' } },
                    { label: 'Hebdomadaire', value: { value: 1, period: 'week' } }
                ]
            }
        ]
    },

    LUMIERE: {
        icon: '💡',
        label: 'Lumière & Éclairage',
        color: 'amber',
        collapsed: true,
        items: [
            {
                id: 'lightType',
                label: 'Type de lampe',
                type: 'select',
                options: [
                    { value: 'led', label: 'LED', icon: '💡' },
                    { value: 'hps', label: 'HPS (Sodium haute pression)', icon: '🔶' },
                    { value: 'mh', label: 'MH (Halogénures métalliques)', icon: '⚪' },
                    { value: 'cmh', label: 'CMH/LEC (Céramique)', icon: '🌟' },
                    { value: 'cfl', label: 'CFL/T5 (Néons)', icon: '💡' },
                    { value: 'natural', label: 'Lumière naturelle', icon: '☀️' },
                    { value: 'mixed', label: 'Mixte', icon: '🌈' }
                ],
                icon: '💡',
                tooltip: 'Technologie d\'éclairage'
            },
            {
                id: 'lightCount',
                label: 'Nombre de lampes',
                type: 'stepper',
                min: 1,
                max: 20,
                icon: '🔢',
                defaultValue: 1,
                tooltip: 'Nombre de sources lumineuses'
            },
            {
                id: 'lightPowerPerUnit',
                label: 'Puissance par lampe',
                type: 'slider',
                min: 10,
                max: 1000,
                step: 10,
                unit: 'W',
                icon: '⚡',
                defaultValue: 250,
                tooltip: 'Puissance électrique consommée par lampe'
            },
            {
                id: 'lightTotalPower',
                label: 'Puissance totale',
                type: 'computed',
                unit: 'W',
                icon: '⚡',
                computeFrom: ['lightCount', 'lightPowerPerUnit'],
                computeFn: (data) => {
                    return (data.lightCount || 1) * (data.lightPowerPerUnit || 0)
                }
            },
            {
                id: 'lightDistance',
                label: 'Distance lampe/plante',
                type: 'slider',
                min: 10,
                max: 200,
                step: 5,
                unit: 'cm',
                icon: '📏',
                defaultValue: 50,
                tooltip: 'Distance entre la source lumineuse et le sommet des plantes',
                zones: [
                    { min: 20, max: 40, label: 'Proche (LED forte)', color: 'orange' },
                    { min: 40, max: 80, label: 'Optimal', color: 'green' },
                    { min: 80, max: 150, label: 'Éloigné', color: 'blue' }
                ]
            },
            {
                id: 'photoperiod',
                label: 'Photopériode',
                type: 'photoperiod',
                icon: '🌞',
                tooltip: 'Heures d\'éclairage par jour',
                presets: [
                    { label: '18/6 (Croissance)', value: { on: 18, off: 6 } },
                    { label: '20/4 (Croissance intensive)', value: { on: 20, off: 4 } },
                    { label: '24/0 (Continu auto)', value: { on: 24, off: 0 } },
                    { label: '12/12 (Floraison)', value: { on: 12, off: 12 } }
                ]
            },
            {
                id: 'ppfd',
                label: 'PPFD moyen',
                type: 'slider',
                min: 200,
                max: 1200,
                step: 50,
                unit: 'µmol/m²/s',
                icon: '☀️',
                defaultValue: 600,
                tooltip: 'Flux de photons photosynthétiques',
                zones: [
                    { min: 200, max: 400, label: 'Faible', color: 'yellow' },
                    { min: 400, max: 600, label: 'Croissance', color: 'green' },
                    { min: 600, max: 900, label: 'Floraison', color: 'purple' },
                    { min: 900, max: 1200, label: 'Intense (CO2)', color: 'red' }
                ]
            },
            {
                id: 'dli',
                label: 'DLI (Daily Light Integral)',
                type: 'slider',
                min: 10,
                max: 60,
                step: 1,
                unit: 'mol/m²/j',
                icon: '📊',
                defaultValue: 30,
                tooltip: 'Quantité totale de lumière par jour',
                zones: [
                    { min: 15, max: 25, label: 'Croissance', color: 'green' },
                    { min: 25, max: 40, label: 'Floraison', color: 'purple' },
                    { min: 40, max: 60, label: 'Intense (CO2)', color: 'red' }
                ]
            },
            {
                id: 'spectrum',
                label: 'Spectre lumineux',
                type: 'select',
                options: [
                    { value: 'full', label: 'Full Spectrum', icon: '🌈' },
                    { value: 'veg', label: 'Veg (bleu dominé)', icon: '🔵' },
                    { value: 'bloom', label: 'Bloom (rouge dominé)', icon: '🔴' },
                    { value: 'uv', label: 'UV+', icon: '🟣' },
                    { value: 'farred', label: 'Far Red', icon: '🔴' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '🌈',
                tooltip: 'Type de spectre lumineux'
            },
            {
                id: 'spectrumImage',
                label: 'Graphique spectre',
                type: 'image-upload',
                icon: '📊',
                tooltip: 'Upload image du graphique de spectre (optionnel)',
                accept: 'image/*',
                maxSize: 5, // MB
                preview: true
            }
        ]
    },

    CLIMAT: {
        icon: '🌡️',
        label: 'Climat & Atmosphère',
        color: 'red',
        collapsed: true,
        items: [
            {
                id: 'temperatureDay',
                label: 'Température jour',
                type: 'slider',
                min: 10,
                max: 35,
                step: 0.5,
                unit: '°C',
                icon: '🌡️',
                defaultValue: 24,
                tooltip: 'Température pendant la période d\'éclairage',
                zones: [
                    { min: 20, max: 26, label: 'Optimal', color: 'green' },
                    { min: 26, max: 30, label: 'Chaud', color: 'orange' },
                    { min: 30, max: 35, label: 'Très chaud', color: 'red' }
                ]
            },
            {
                id: 'temperatureNight',
                label: 'Température nuit',
                type: 'slider',
                min: 10,
                max: 35,
                step: 0.5,
                unit: '°C',
                icon: '🌙',
                defaultValue: 18,
                tooltip: 'Température pendant la période d\'obscurité',
                zones: [
                    { min: 16, max: 22, label: 'Optimal', color: 'green' }
                ]
            },
            {
                id: 'humidityDay',
                label: 'Humidité jour',
                type: 'slider',
                min: 20,
                max: 90,
                step: 5,
                unit: '%',
                icon: '💧',
                defaultValue: 60,
                tooltip: 'Humidité relative pendant la période d\'éclairage',
                zones: [
                    { min: 40, max: 60, label: 'Croissance', color: 'green' },
                    { min: 40, max: 50, label: 'Floraison', color: 'purple' },
                    { min: 30, max: 40, label: 'Fin floraison', color: 'orange' }
                ]
            },
            {
                id: 'humidityNight',
                label: 'Humidité nuit',
                type: 'slider',
                min: 20,
                max: 90,
                step: 5,
                unit: '%',
                icon: '🌙',
                defaultValue: 50,
                tooltip: 'Humidité relative pendant la période d\'obscurité'
            },
            {
                id: 'vpd',
                label: 'VPD (Vapor Pressure Deficit)',
                type: 'computed',
                unit: 'kPa',
                icon: '📊',
                computeFrom: ['temperatureDay', 'humidityDay'],
                computeFn: (data) => {
                    if (!data.temperatureDay || !data.humidityDay) return 0
                    const temp = data.temperatureDay
                    const rh = data.humidityDay / 100
                    const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3))
                    const vpd = svp * (1 - rh)
                    return vpd.toFixed(2)
                },
                tooltip: 'Déficit de pression de vapeur (calculé auto)',
                zones: [
                    { min: 0.8, max: 1.2, label: 'Optimal', color: 'green' }
                ]
            },
            {
                id: 'co2Enabled',
                label: 'Enrichissement CO2',
                type: 'toggle',
                icon: '💨',
                defaultValue: false,
                tooltip: 'Utilisation d\'enrichissement en CO2'
            },
            {
                id: 'co2Level',
                label: 'Niveau CO2',
                type: 'slider',
                min: 400,
                max: 1600,
                step: 50,
                unit: 'ppm',
                icon: '💨',
                defaultValue: 1200,
                dependsOn: 'co2Enabled',
                showIf: (data) => data.co2Enabled === true,
                tooltip: 'Concentration de CO2',
                zones: [
                    { min: 400, max: 400, label: 'Ambiant', color: 'gray' },
                    { min: 800, max: 1200, label: 'Enrichi', color: 'green' },
                    { min: 1200, max: 1500, label: 'Très enrichi', color: 'orange' }
                ]
            },
            {
                id: 'co2Mode',
                label: 'Mode CO2',
                type: 'select',
                options: [
                    { value: 'continuous', label: 'Continu', icon: '♾️' },
                    { value: 'phases', label: 'Par phases', icon: '⏱️' }
                ],
                icon: '⚙️',
                dependsOn: 'co2Enabled',
                showIf: (data) => data.co2Enabled === true
            },
            {
                id: 'ventilationType',
                label: 'Type de ventilation',
                type: 'select',
                options: [
                    { value: 'extract-intake', label: 'Extracteur + Intracteur', icon: '🔄' },
                    { value: 'extract-only', label: 'Extracteur seul', icon: '💨' },
                    { value: 'passive-fans', label: 'Passif + Ventilateurs', icon: '🌀' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '💨',
                tooltip: 'Système de ventilation'
            },
            {
                id: 'ventilationIntensity',
                label: 'Intensité ventilation',
                type: 'slider',
                min: 0,
                max: 10,
                step: 1,
                icon: '💨',
                defaultValue: 5,
                tooltip: 'Force de la ventilation (0-10)'
            },
            {
                id: 'airRenewal',
                label: 'Renouvellement d\'air',
                type: 'select',
                options: [
                    { value: 10, label: '10 volumes/h', icon: '🔄' },
                    { value: 20, label: '20 volumes/h', icon: '🔄' },
                    { value: 30, label: '30 volumes/h', icon: '🔄' },
                    { value: 60, label: '60 volumes/h', icon: '🔄' }
                ],
                icon: '🔄',
                tooltip: 'Fréquence de renouvellement complet de l\'air'
            }
        ]
    },

    PALISSAGE: {
        icon: '✂️',
        label: 'Palissage & Training',
        color: 'purple',
        collapsed: true,
        items: [
            {
                id: 'trainingMethods',
                label: 'Méthodes utilisées',
                type: 'multiselect',
                options: [
                    { value: 'lst', label: 'LST (Low Stress Training)', icon: '🪢' },
                    { value: 'hst', label: 'HST (High Stress Training)', icon: '✂️' },
                    { value: 'topping', label: 'Topping', icon: '🔝' },
                    { value: 'fim', label: 'FIM', icon: '🌿' },
                    { value: 'mainlining', label: 'Main-lining', icon: '🌳' },
                    { value: 'scrog', label: 'SCROG (Screen of Green)', icon: '🕸️' },
                    { value: 'sog', label: 'SOG (Sea of Green)', icon: '🌊' },
                    { value: 'supercropping', label: 'Supercropping', icon: '💪' },
                    { value: 'defoliation', label: 'Défoliation', icon: '🍃' },
                    { value: 'lollipopping', label: 'Lollipopping', icon: '🍭' },
                    { value: 'schwazzing', label: 'Schwazzing', icon: '🔪' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '✂️',
                tooltip: 'Techniques de palissage appliquées'
            },
            {
                id: 'trainingIntensity',
                label: 'Intensité du palissage',
                type: 'slider',
                min: 0,
                max: 10,
                step: 1,
                icon: '💪',
                defaultValue: 5,
                tooltip: 'Agressivité du palissage (0=doux, 10=agressif)'
            },
            {
                id: 'trainingPhases',
                label: 'Phases d\'application',
                type: 'phases',
                icon: '📅',
                tooltip: 'À quelles phases le palissage est appliqué',
                phases: [
                    'Pré-croissance',
                    'Début croissance',
                    'Milieu croissance',
                    'Fin croissance',
                    'Début stretch',
                    'Milieu stretch',
                    'Fin stretch',
                    'Début floraison',
                    'Milieu floraison',
                    'Fin floraison'
                ]
            },
            {
                id: 'trainingNotes',
                label: 'Notes palissage',
                type: 'textarea',
                maxLength: 500,
                icon: '📝',
                tooltip: 'Notes sur le palissage (max 500 caractères)'
            }
        ]
    },

    MORPHOLOGIE: {
        icon: '📏',
        label: 'Morphologie & Développement',
        color: 'emerald',
        collapsed: true,
        items: [
            {
                id: 'plantHeight',
                label: 'Taille de la plante',
                type: 'slider',
                min: 10,
                max: 300,
                step: 5,
                unit: 'cm',
                icon: '📏',
                defaultValue: 100,
                tooltip: 'Hauteur maximale de la plante'
            },
            {
                id: 'canopyWidth',
                label: 'Largeur de la canopée',
                type: 'slider',
                min: 10,
                max: 200,
                step: 5,
                unit: 'cm',
                icon: '↔️',
                defaultValue: 60,
                tooltip: 'Diamètre de la canopée'
            },
            {
                id: 'plantVolume',
                label: 'Volume approximatif',
                type: 'select',
                options: [
                    { value: 'small', label: 'Petit (<0.5m³)', icon: '🌱' },
                    { value: 'medium', label: 'Moyen (0.5-1m³)', icon: '🌿' },
                    { value: 'large', label: 'Grand (1-2m³)', icon: '🌳' },
                    { value: 'xlarge', label: 'Très grand (>2m³)', icon: '🌲' }
                ],
                icon: '📦',
                tooltip: 'Volume estimé de la plante'
            },
            {
                id: 'vegetativeWeight',
                label: 'Poids végétatif estimé',
                type: 'slider',
                min: 10,
                max: 3000,
                step: 50,
                unit: 'g',
                icon: '⚖️',
                defaultValue: 500,
                tooltip: 'Poids total de la biomasse avant séchage'
            },
            {
                id: 'mainBranches',
                label: 'Branches principales',
                type: 'stepper',
                min: 1,
                max: 32,
                icon: '🌿',
                defaultValue: 8,
                tooltip: 'Nombre de branches primaires'
            },
            {
                id: 'visibleBuds',
                label: 'Buds visibles',
                type: 'stepper',
                min: 1,
                max: 200,
                icon: '🌸',
                defaultValue: 20,
                tooltip: 'Nombre de têtes principales visibles'
            },
            {
                id: 'internodeSpacing',
                label: 'Espacement internodal',
                type: 'select',
                options: [
                    { value: 'tight', label: 'Serré (<3cm)', icon: '🟢' },
                    { value: 'medium', label: 'Moyen (3-6cm)', icon: '🟡' },
                    { value: 'wide', label: 'Large (>6cm)', icon: '🔴' }
                ],
                icon: '📐',
                tooltip: 'Distance entre les nœuds'
            }
        ]
    },

    RECOLTE: {
        icon: '🌾',
        label: 'Récolte & Rendement',
        color: 'yellow',
        collapsed: true,
        items: [
            {
                id: 'harvestDate',
                label: 'Date de récolte',
                type: 'date',
                icon: '📅',
                tooltip: 'Date exacte de la récolte'
            },
            {
                id: 'flushDuration',
                label: 'Durée du rinçage',
                type: 'stepper',
                min: 0,
                max: 21,
                unit: 'jours',
                icon: '💧',
                defaultValue: 7,
                tooltip: 'Période de rinçage avant récolte (0 = pas de rinçage)'
            },
            {
                id: 'trichomeColor',
                label: 'Couleur des trichomes',
                type: 'multiselect',
                options: [
                    { value: 'clear', label: 'Translucides', icon: '⚪', percent: 0 },
                    { value: 'milky', label: 'Laiteux', icon: '🥛', percent: 0 },
                    { value: 'amber', label: 'Ambrés', icon: '🟠', percent: 0 }
                ],
                icon: '🔬',
                tooltip: 'Répartition des couleurs de trichomes au moment de la récolte'
            },
            {
                id: 'trichomeClearPercent',
                label: '% Trichomes translucides',
                type: 'slider',
                min: 0,
                max: 100,
                step: 5,
                unit: '%',
                icon: '⚪',
                defaultValue: 10,
                tooltip: 'Pourcentage de trichomes translucides'
            },
            {
                id: 'trichomeMilkyPercent',
                label: '% Trichomes laiteux',
                type: 'slider',
                min: 0,
                max: 100,
                step: 5,
                unit: '%',
                icon: '🥛',
                defaultValue: 70,
                tooltip: 'Pourcentage de trichomes laiteux (optimal 60-80%)'
            },
            {
                id: 'trichomeAmberPercent',
                label: '% Trichomes ambrés',
                type: 'slider',
                min: 0,
                max: 100,
                step: 5,
                unit: '%',
                icon: '🟠',
                defaultValue: 20,
                tooltip: 'Pourcentage de trichomes ambrés'
            },
            {
                id: 'pistilColor',
                label: 'Couleur des pistils',
                type: 'select',
                options: [
                    { value: 'white', label: 'Majoritairement blancs', icon: '⚪' },
                    { value: 'mixed', label: 'Mixte blanc/orange', icon: '🟡' },
                    { value: 'orange', label: 'Majoritairement oranges', icon: '🟠' },
                    { value: 'brown', label: 'Majoritairement bruns', icon: '🟤' }
                ],
                icon: '🧵',
                tooltip: 'État de maturation des pistils'
            },
            {
                id: 'wetWeight',
                label: 'Poids brut (humide)',
                type: 'slider',
                min: 10,
                max: 5000,
                step: 10,
                unit: 'g',
                icon: '⚖️',
                defaultValue: 500,
                tooltip: 'Poids total juste après la récolte (plante entière ou têtes)'
            },
            {
                id: 'trimmedWeight',
                label: 'Poids après trim humide',
                type: 'slider',
                min: 5,
                max: 3000,
                step: 10,
                unit: 'g',
                icon: '✂️',
                defaultValue: 350,
                tooltip: 'Poids après première défoliation (trim humide)'
            },
            {
                id: 'dryWeight',
                label: 'Poids sec final',
                type: 'slider',
                min: 1,
                max: 1000,
                step: 5,
                unit: 'g',
                icon: '🌾',
                defaultValue: 100,
                tooltip: 'Poids final après séchage complet'
            },
            {
                id: 'trimType',
                label: 'Type de manucure',
                type: 'select',
                options: [
                    { value: 'wet', label: 'Wet trim (humide)', icon: '💧' },
                    { value: 'dry', label: 'Dry trim (sec)', icon: '🌾' },
                    { value: 'mixed', label: 'Mixte', icon: '🔄' },
                    { value: 'none', label: 'Sans trim', icon: '🌿' }
                ],
                icon: '✂️',
                tooltip: 'Technique de manucure utilisée'
            },
            {
                id: 'trimQuality',
                label: 'Qualité de la manucure',
                type: 'slider',
                min: 0,
                max: 10,
                step: 1,
                icon: '💎',
                defaultValue: 7,
                tooltip: 'Qualité de la manucure (0=aucune, 10=parfaite)'
            },
            {
                id: 'yieldPerPlant',
                label: 'Rendement par plante',
                type: 'computed',
                unit: 'g/plante',
                icon: '🌱',
                computeFrom: ['dryWeight', 'densitePlantation'],
                computeFn: (data) => {
                    if (!data.dryWeight || !data.densitePlantation) return 0
                    const plants = data.densitePlantation.value || 1
                    return (data.dryWeight / plants).toFixed(1)
                },
                tooltip: 'Rendement moyen par plante'
            },
            {
                id: 'yieldPerM2',
                label: 'Rendement au m²',
                type: 'computed',
                unit: 'g/m²',
                icon: '⬜',
                computeFrom: ['dryWeight', 'surfaceAuSol'],
                computeFn: (data) => {
                    if (!data.dryWeight || !data.surfaceAuSol) return 0
                    return (data.dryWeight / data.surfaceAuSol).toFixed(1)
                },
                tooltip: 'Rendement par mètre carré'
            },
            {
                id: 'yieldPerWatt',
                label: 'Rendement par Watt',
                type: 'computed',
                unit: 'g/W',
                icon: '⚡',
                computeFrom: ['dryWeight', 'lightTotalPower'],
                computeFn: (data) => {
                    if (!data.dryWeight || !data.lightTotalPower) return 0
                    return (data.dryWeight / data.lightTotalPower).toFixed(2)
                },
                tooltip: 'Efficacité énergétique (grammes par Watt)'
            },
            {
                id: 'budDensity',
                label: 'Densité des têtes',
                type: 'select',
                options: [
                    { value: 'airy', label: 'Aérées (faible)', icon: '💨' },
                    { value: 'medium', label: 'Moyenne', icon: '🌿' },
                    { value: 'dense', label: 'Dense', icon: '💪' },
                    { value: 'rock', label: 'Très dense (rock hard)', icon: '🪨' }
                ],
                icon: '💎',
                tooltip: 'Compacité des têtes récoltées'
            },
            {
                id: 'budStructure',
                label: 'Structure des buds',
                type: 'select',
                options: [
                    { value: 'sativa', label: 'Sativa (allongées)', icon: '🌾' },
                    { value: 'indica', label: 'Indica (compactes)', icon: '🌲' },
                    { value: 'foxtail', label: 'Foxtails', icon: '🦊' },
                    { value: 'spear', label: 'Spear (lance)', icon: '🗡️' }
                ],
                icon: '🌸',
                tooltip: 'Forme caractéristique des têtes'
            },
            {
                id: 'trimWaste',
                label: 'Déchets de trim',
                type: 'slider',
                min: 0,
                max: 50,
                step: 1,
                unit: '%',
                icon: '🗑️',
                defaultValue: 20,
                tooltip: 'Pourcentage de matière végétale retirée au trim'
            },
            {
                id: 'sugarLeafQuality',
                label: 'Qualité sugar leaves',
                type: 'slider',
                min: 0,
                max: 10,
                step: 1,
                icon: '🍬',
                defaultValue: 6,
                tooltip: 'Qualité des petites feuilles résineuses (0-10)'
            },
            {
                id: 'hermaphroditism',
                label: 'Hermaphrodisme',
                type: 'select',
                options: [
                    { value: 'none', label: 'Aucun', icon: '✅' },
                    { value: 'rare', label: 'Rare (1-5 bananes)', icon: '🟡' },
                    { value: 'moderate', label: 'Modéré', icon: '🟠' },
                    { value: 'severe', label: 'Sévère', icon: '🔴' }
                ],
                icon: '⚧️',
                defaultValue: 'none',
                tooltip: 'Présence de caractères hermaphrodites'
            },
            {
                id: 'seedsFound',
                label: 'Graines trouvées',
                type: 'stepper',
                min: 0,
                max: 500,
                icon: '🌰',
                defaultValue: 0,
                tooltip: 'Nombre de graines découvertes (0 = seedless)'
            },
            {
                id: 'moldDetected',
                label: 'Moisissure détectée',
                type: 'select',
                options: [
                    { value: 'none', label: 'Aucune', icon: '✅' },
                    { value: 'light', label: 'Légère (<5%)', icon: '🟡' },
                    { value: 'moderate', label: 'Modérée (5-15%)', icon: '🟠' },
                    { value: 'severe', label: 'Sévère (>15%)', icon: '🔴' }
                ],
                icon: '🍄',
                defaultValue: 'none',
                tooltip: 'Niveau de moisissure/botrytis'
            },
            {
                id: 'pestDamage',
                label: 'Dégâts nuisibles',
                type: 'select',
                options: [
                    { value: 'none', label: 'Aucun', icon: '✅' },
                    { value: 'light', label: 'Légers', icon: '🟡' },
                    { value: 'moderate', label: 'Modérés', icon: '🟠' },
                    { value: 'severe', label: 'Sévères', icon: '🔴' }
                ],
                icon: '🐛',
                defaultValue: 'none',
                tooltip: 'Dommages causés par les nuisibles'
            },
            {
                id: 'overallHarvestQuality',
                label: 'Qualité globale récolte',
                type: 'slider',
                min: 0,
                max: 10,
                step: 0.5,
                icon: '⭐',
                defaultValue: 7,
                tooltip: 'Note globale de la récolte (apparence, densité, santé)'
            },
            {
                id: 'harvestNotes',
                label: 'Notes de récolte',
                type: 'textarea',
                maxLength: 1000,
                icon: '📝',
                tooltip: 'Observations et notes sur la récolte (max 1000 caractères)'
            },
            {
                id: 'nextGrowImprovements',
                label: 'Améliorations futures',
                type: 'textarea',
                maxLength: 500,
                icon: '💡',
                tooltip: 'Ce qui pourrait être amélioré pour la prochaine culture'
            }
        ]
    }
}

/**
 * Helper: Obtenir tous les IDs de champs (flat)
 */
export const getAllCultureFieldIds = () => {
    const ids = []
    Object.values(CULTURE_SIDEBAR_CONTENT).forEach(section => {
        section.items.forEach(item => {
            ids.push(item.id)
        })
    })
    return ids
}

/**
 * Helper: Obtenir un champ par ID
 */
export const getCultureFieldById = (id) => {
    for (const section of Object.values(CULTURE_SIDEBAR_CONTENT)) {
        const field = section.items.find(item => item.id === id)
        if (field) return field
    }
    return null
}

/**
 * Helper: Valider les dépendances d'un champ
 */
export const shouldShowField = (field, data) => {
    if (!field.dependsOn) return true
    if (!field.showIf) return true
    return field.showIf(data)
}
