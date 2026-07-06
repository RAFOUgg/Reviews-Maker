/**
 * extractionSidebarContent.js
 *
 * Configuration des champs pour Pipeline Extraction (Concentrés)
 * Conforme CDC - Phase 3
 *
 * Sections:
 * - CONFIGURATION: Type extraction, méthode, trame
 * - MATIERE_PREMIERE: Type matière, état, qualité
 * - ROSIN: Champs spécifiques presse à rosin
 * - SOLVANT: Champs spécifiques BHO/PHO/CO2
 * - PURIFICATION: Winterisation, filtration, décarb, distillation
 * - RENDEMENT: Poids, rendement %, qualité finale
 * - NOTES: Observations et difficultés
 */

export const EXTRACTION_SIDEBAR_CONTENT = {
    CONFIGURATION: {
        icon: '⚙️',
        label: 'Configuration',
        color: '#8b5cf6',
        items: [
            {
                id: 'extractionMethod',
                label: 'Méthode d\'extraction',
                icon: '⚗️',
                type: 'select',
                tooltip: 'Méthode principale d\'extraction des cannabinoïdes',
                options: [
                    { value: 'rosin-press', label: 'Rosin Press (sans solvant)' },
                    { value: 'live-rosin', label: 'Live Rosin (fresh frozen)' },
                    { value: 'cold-cure-rosin', label: 'Cold Cure Rosin' },
                    { value: 'naked-press', label: 'Naked Press (sans sac filtrant, HashCru)' },
                    { value: 'bho', label: 'BHO (Butane Hash Oil)' },
                    { value: 'pho', label: 'PHO (Propane Hash Oil)' },
                    { value: 'co2', label: 'CO2 (supercritique)' },
                    { value: 'live-resin', label: 'Live Resin (BHO fresh frozen)' },
                    { value: 'ethanol', label: 'Extraction à l\'éthanol' },
                    { value: 'dry-ice-rosin', label: 'Dry Ice Rosin' },
                    { value: 'other', label: 'Autre méthode' }
                ],
                defaultValue: 'rosin-press'
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
                defaultValue: 500
            },
            {
                id: 'processingDate',
                label: 'Date d\'extraction',
                icon: '📅',
                type: 'date',
                tooltip: 'Date du processus d\'extraction'
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
                tooltip: 'Durée totale du processus d\'extraction'
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
                    { value: 'fresh-frozen', label: 'Fresh Frozen (entière congelée)' },
                    { value: 'buds', label: 'Buds / Têtes séchées' },
                    { value: 'trim', label: 'Trim / Feuilles de taille' },
                    { value: 'sugar-leaves', label: 'Sugar Leaves' },
                    { value: 'hash', label: 'Hash (pour extraction secondaire)' },
                    { value: 'kief', label: 'Kief / Dry-sift' },
                    { value: 'ice-hash', label: 'Ice Hash (bubble hash)' },
                    { value: 'whole-plant', label: 'Plante entière' },
                    { value: 'mix', label: 'Mélange' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'fresh-frozen'
            },
            {
                id: 'materialState',
                label: 'État de la matière',
                icon: '❄️',
                type: 'select',
                tooltip: 'État physique de la matière au moment de l\'extraction',
                options: [
                    { value: 'fresh-frozen', label: 'Fraîche congelée (< -18°C)' },
                    { value: 'dried-cured', label: 'Séchée et curée' },
                    { value: 'dried', label: 'Séchée seulement' },
                    { value: 'semi-dry', label: 'Semi-sèche' },
                    { value: 'fresh', label: 'Fraîche (non congelée)' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'fresh-frozen'
            },
            {
                id: 'materialQuality',
                label: 'Qualité de la matière',
                icon: '⭐',
                type: 'slider',
                min: 0,
                max: 10,
                step: 0.5,
                tooltip: 'Qualité estimée de la matière première (trichomes, état général)',
                defaultValue: 7
            },
            {
                id: 'trichomeDensity',
                label: 'Densité en trichomes',
                icon: '🔬',
                type: 'slider',
                min: 0,
                max: 10,
                step: 0.5,
                tooltip: 'Densité visuelle de trichomes (0=pauvre, 10=très dense)',
                defaultValue: 7
            },
            {
                id: 'cultivarsUsed',
                label: 'Cultivar(s) utilisé(s)',
                icon: '🧬',
                type: 'autocomplete',
                tooltip: 'Variété(s) de cannabis utilisée(s)',
                librarySource: 'cultivars'
            },
            {
                id: 'harvestDate',
                label: 'Date de récolte',
                icon: '📅',
                type: 'date',
                tooltip: 'Date à laquelle la matière a été récoltée'
            }
        ]
    },

    ROSIN: {
        icon: '🔥',
        label: 'Rosin Press',
        color: '#f97316',
        items: [
            {
                id: 'rosin_enabled',
                label: 'Méthode Rosin activée',
                icon: '✓',
                type: 'toggle',
                tooltip: 'Activer les champs spécifiques à la presse à rosin',
                defaultValue: false
            },
            {
                id: 'plateTemperature',
                label: 'Température des plaques',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: 40,
                max: 150,
                step: 1,
                tooltip: 'Hash/dry-sift : cold press 60-77°C, hot press 77-93°C. Fleur/trim : cold press 82-93°C, hot press 93-104°C (plage vérifiée 2026-07-06). Au-delà de ~110°C, on sort de la pratique normale de pressage.',
                defaultValue: 85,
                dependsOn: 'rosin_enabled',
                showIf: (data) => data.rosin_enabled === true
            },
            {
                id: 'platePressure',
                label: 'Pression appliquée',
                icon: '💨',
                type: 'number',
                unit: 'PSI',
                min: 100,
                max: 2000,
                step: 50,
                tooltip: 'Pression exercée sur la matière (PSI)',
                defaultValue: 600,
                dependsOn: 'rosin_enabled',
                showIf: (data) => data.rosin_enabled === true
            },
            {
                id: 'pressDuration',
                label: 'Durée de presse',
                icon: '⏱️',
                type: 'number',
                unit: 'sec',
                min: 10,
                max: 300,
                step: 5,
                tooltip: 'Durée d\'application de la pression',
                defaultValue: 90,
                dependsOn: 'rosin_enabled',
                showIf: (data) => data.rosin_enabled === true
            },
            {
                id: 'bagMicrons',
                label: 'Microns du sac de presse',
                icon: '🎯',
                type: 'select',
                tooltip: 'Taille des mailles du sac filtrant',
                options: [
                    { value: '15', label: '15µm (THCA crystals)' },
                    { value: '25', label: '25µm (extra fin)' },
                    { value: '36', label: '36µm (hash rosin)' },
                    { value: '45', label: '45µm (ice hash)' },
                    { value: '72', label: '72µm (fleurs)' },
                    { value: '90', label: '90µm (fleurs standard)' },
                    { value: '120', label: '120µm (trim)' },
                    { value: '160', label: '160µm (trim gross)' },
                    { value: 'none', label: 'Sans sac' }
                ],
                defaultValue: '90',
                dependsOn: 'rosin_enabled',
                showIf: (data) => data.rosin_enabled === true
            },
            {
                id: 'prePress',
                label: 'Pré-pressage (pre-press)',
                icon: '📦',
                type: 'toggle',
                tooltip: 'La matière a-t-elle été pré-pressée en puck avant la presse ?',
                defaultValue: false,
                dependsOn: 'rosin_enabled',
                showIf: (data) => data.rosin_enabled === true
            },
            {
                id: 'prePressTemperature',
                label: 'Temp. pré-pressage',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: -20,
                max: 30,
                step: 1,
                tooltip: 'Température du pré-pressage (souvent froid)',
                defaultValue: 4,
                dependsOn: 'rosin_enabled',
                showIf: (data) => data.rosin_enabled === true && data.prePress === true
            },
            {
                id: 'numberOfPresses',
                label: 'Nombre de pressages',
                icon: '🔄',
                type: 'stepper',
                min: 1,
                max: 10,
                step: 1,
                tooltip: 'Nombre de cycles de presse sur la même matière',
                defaultValue: 2,
                dependsOn: 'rosin_enabled',
                showIf: (data) => data.rosin_enabled === true
            },
            {
                id: 'rossinCureMethod',
                label: 'Méthode de cure',
                icon: '❄️',
                type: 'select',
                tooltip: 'Méthode de maturation/cure du rosin après extraction',
                options: [
                    { value: 'cold-cure', label: 'Cold Cure (4-10°C, budder/badder)' },
                    { value: 'room-temp', label: 'Température ambiante (fresh press)' },
                    { value: 'freeze', label: 'Congélation (shatter, sauce)' },
                    { value: 'hot-cure', label: 'Hot Cure (crumble/wax)' },
                    { value: 'none', label: 'Aucune (fresh press direct)' }
                ],
                defaultValue: 'cold-cure',
                dependsOn: 'rosin_enabled',
                showIf: (data) => data.rosin_enabled === true
            }
        ]
    },

    SOLVANT: {
        icon: '🧪',
        label: 'Extraction Solvant (BHO/PHO/CO2)',
        color: '#06b6d4',
        items: [
            {
                id: 'solvent_enabled',
                label: 'Extraction au solvant activée',
                icon: '✓',
                type: 'toggle',
                tooltip: 'Activer les champs spécifiques aux extractions au solvant',
                defaultValue: false
            },
            {
                id: 'solventType',
                label: 'Type de solvant',
                icon: '⚗️',
                type: 'select',
                tooltip: 'Solvant utilisé pour l\'extraction',
                options: [
                    { value: 'butane', label: 'Butane (BHO)' },
                    { value: 'propane', label: 'Propane (PHO)' },
                    { value: 'butane-propane', label: 'Mix Butane/Propane' },
                    { value: 'co2', label: 'CO2 supercritique' },
                    { value: 'ethanol', label: 'Éthanol alimentaire' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'butane',
                dependsOn: 'solvent_enabled',
                showIf: (data) => data.solvent_enabled === true
            },
            {
                id: 'solventGrade',
                label: 'Grade du solvant',
                icon: '✨',
                type: 'select',
                tooltip: 'Pureté / qualité du solvant',
                options: [
                    { value: 'n-tane', label: 'N-Butane (ultra-pur)' },
                    { value: 'food-grade', label: 'Alimentaire (food-grade)' },
                    { value: 'lab-grade', label: 'Grade laboratoire' },
                    { value: 'industrial', label: 'Industriel' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'n-tane',
                dependsOn: 'solvent_enabled',
                showIf: (data) => data.solvent_enabled === true
            },
            {
                id: 'extractionTemp',
                label: 'Température d\'extraction',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: -80,
                max: 60,
                step: 1,
                tooltip: 'Température pendant l\'extraction (négatif = cryo)',
                defaultValue: -40,
                dependsOn: 'solvent_enabled',
                showIf: (data) => data.solvent_enabled === true
            },
            {
                id: 'cryoExtraction',
                label: 'Extraction cryogénique',
                icon: '❄️',
                type: 'toggle',
                tooltip: 'L\'extraction s\'est-elle faite en conditions cryogéniques ?',
                defaultValue: false,
                dependsOn: 'solvent_enabled',
                showIf: (data) => data.solvent_enabled === true
            },
            {
                id: 'closedLoopSystem',
                label: 'Système closed-loop',
                icon: '🔄',
                type: 'toggle',
                tooltip: 'Utilisation d\'un système en circuit fermé',
                defaultValue: true,
                dependsOn: 'solvent_enabled',
                showIf: (data) => data.solvent_enabled === true
            },
            {
                id: 'purgeMethod',
                label: 'Méthode de purge',
                icon: '💨',
                type: 'select',
                tooltip: 'Méthode utilisée pour éliminer les résidus de solvant',
                options: [
                    { value: 'vacuum-oven', label: 'Four à vide (vacuum oven)' },
                    { value: 'desiccator', label: 'Dessiccateur' },
                    { value: 'heat-air', label: 'Chaleur à l\'air libre' },
                    { value: 'hot-plate', label: 'Plaque chauffante' },
                    { value: 'none', label: 'Non purgé' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'vacuum-oven',
                dependsOn: 'solvent_enabled',
                showIf: (data) => data.solvent_enabled === true
            },
            {
                id: 'purgeTemp',
                label: 'Température de purge',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: 20,
                max: 80,
                step: 1,
                tooltip: 'Température du four/plaque pendant la purge',
                defaultValue: 38,
                dependsOn: 'solvent_enabled',
                showIf: (data) => data.solvent_enabled === true
            },
            {
                id: 'purgeDuration',
                label: 'Durée de purge',
                icon: '⏳',
                type: 'number',
                unit: 'h',
                min: 1,
                max: 168,
                step: 1,
                tooltip: 'Durée totale de la purge (heures)',
                defaultValue: 48,
                dependsOn: 'solvent_enabled',
                showIf: (data) => data.solvent_enabled === true
            }
        ]
    },

    PURIFICATION: {
        icon: '✨',
        label: 'Purification',
        color: '#3b82f6',
        items: [
            {
                id: 'winterization',
                label: 'Winterisation',
                icon: '❄️',
                type: 'toggle',
                tooltip: 'Traitement au froid + filtration des cires et lipides',
                defaultValue: false
            },
            {
                id: 'winterizationTemp',
                label: 'Température winterisation',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: -80,
                max: 0,
                step: 1,
                tooltip: 'Température de congélation pour la winterisation',
                defaultValue: -20,
                showIf: (data) => data.winterization === true
            },
            {
                id: 'filtration',
                label: 'Filtration (buchner/vide)',
                icon: '🔬',
                type: 'toggle',
                tooltip: 'Filtration par pression négative (buchner, entonnoir vide)',
                defaultValue: false
            },
            {
                id: 'filtrationMicrons',
                label: 'Microns filtration',
                icon: '🎯',
                type: 'select',
                tooltip: 'Porosité du filtre utilisé',
                options: [
                    { value: '0.2', label: '0,2µm (stérile)' },
                    { value: '0.45', label: '0,45µm' },
                    { value: '1', label: '1µm' },
                    { value: '5', label: '5µm' },
                    { value: '20', label: '20µm' },
                    { value: 'activated-carbon', label: 'Charbon actif' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: '0.45',
                showIf: (data) => data.filtration === true
            },
            {
                id: 'decarboxylation',
                label: 'Décarboxylation',
                icon: '🔥',
                type: 'toggle',
                tooltip: 'Conversion THCA → THC par chauffage',
                defaultValue: false
            },
            {
                id: 'decarboxylationTemp',
                label: 'Température décarb',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: 100,
                max: 160,
                step: 5,
                tooltip: 'Cinétique Wang et al. 2016 : >95% de conversion en 20 min à 110°C sans franchir le seuil de dégradation (145°C, apparition de CBN/Δ8-THC). 90 min à 140°C convertit plus vite mais dégrade davantage les terpènes.',
                defaultValue: 110,
                showIf: (data) => data.decarboxylation === true
            },
            {
                id: 'decarboxylationDuration',
                label: 'Durée décarb',
                icon: '⏱️',
                type: 'number',
                unit: 'min',
                min: 10,
                max: 120,
                step: 5,
                tooltip: 'À 110°C, >95% de conversion en 20-30 min (Wang et al. 2016) — protocole basse température longue durée, préserve mieux les terpènes',
                defaultValue: 25,
                showIf: (data) => data.decarboxylation === true
            },
            {
                id: 'distillation',
                label: 'Distillation (short path / wiped film)',
                icon: '⚗️',
                type: 'toggle',
                tooltip: 'Distillation sous vide pour isoler les cannabinoïdes',
                defaultValue: false
            },
            {
                id: 'distillationMethod',
                label: 'Type de distillation',
                icon: '🔬',
                type: 'select',
                tooltip: 'Méthode de distillation utilisée',
                options: [
                    { value: 'short-path', label: 'Short Path' },
                    { value: 'wiped-film', label: 'Wiped Film' },
                    { value: 'rotary', label: 'Rotary Evaporator' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'short-path',
                showIf: (data) => data.distillation === true
            },
            {
                id: 'distillationTemp',
                label: 'Température distillation',
                icon: '🌡️',
                type: 'slider',
                unit: '°C',
                min: 100,
                max: 250,
                step: 5,
                tooltip: 'Température de la tête de distillation',
                defaultValue: 175,
                showIf: (data) => data.distillation === true
            }
        ]
    },

    RENDEMENT: {
        icon: '📊',
        label: 'Rendement & Qualité',
        color: '#8b5cf6',
        items: [
            {
                id: 'finalWeight',
                label: 'Poids final',
                icon: '⚖️',
                type: 'number',
                unit: 'g',
                min: 0,
                max: 10000,
                step: 0.01,
                tooltip: 'Poids total du concentré obtenu'
            },
            {
                id: 'yieldPercentage',
                label: 'Rendement %',
                icon: '📈',
                type: 'computed',
                unit: '%',
                tooltip: 'Rendement calculé (poids final / batch size × 100)',
                computeFrom: ['finalWeight', 'batchSize'],
                computeFn: (data) => {
                    if (!data.finalWeight || !data.batchSize) return null
                    return ((data.finalWeight / data.batchSize) * 100).toFixed(2)
                }
            },
            {
                id: 'concentrateType',
                label: 'Type de concentré obtenu',
                icon: '🍯',
                type: 'select',
                tooltip: 'Consistance / forme finale du concentré',
                options: [
                    { value: 'fresh-press', label: 'Fresh Press (rosin liquide)' },
                    { value: 'budder', label: 'Budder / Beurre' },
                    { value: 'badder', label: 'Badder' },
                    { value: 'cold-cure', label: 'Cold Cure' },
                    { value: 'shatter', label: 'Shatter' },
                    { value: 'wax', label: 'Wax / Crumble' },
                    { value: 'sauce', label: 'Sauce / Terp Sauce' },
                    { value: 'diamonds', label: 'THCA Diamonds' },
                    { value: 'sugar', label: 'Sugar / Wet Sugar' },
                    { value: 'distillate', label: 'Distillat' },
                    { value: 'rso', label: 'RSO / Full Spectrum' },
                    { value: 'hash', label: 'Hash (solventless)' },
                    { value: 'other', label: 'Autre' }
                ],
                defaultValue: 'cold-cure'
            },
            {
                id: 'finalColor',
                label: 'Couleur / Transparence finale',
                icon: '🎨',
                type: 'slider',
                min: 0,
                max: 10,
                tooltip: '0=opaque/sombre, 10=transparent/doré (full melt)',
                defaultValue: 5
            },
            {
                id: 'finalPurity',
                label: 'Pureté estimée',
                icon: '✨',
                type: 'slider',
                min: 0,
                max: 10,
                tooltip: '0=très contaminé, 10=cristallin/pur',
                defaultValue: 7
            },
            {
                id: 'meltQuality',
                label: 'Qualité melting (Full Melt)',
                icon: '🔥',
                type: 'slider',
                min: 1,
                max: 6,
                step: 1,
                tooltip: '1=1 étoile (très sale), 6=6 étoiles (full melt pur)',
                defaultValue: 3
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
                tooltip: 'Estimation du taux de matière végétale résiduelle',
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
                tooltip: 'Observations générales sur le processus d\'extraction',
                maxLength: 1000
            },
            {
                id: 'difficulties',
                label: 'Difficultés rencontrées',
                icon: '⚠️',
                type: 'textarea',
                tooltip: 'Problèmes ou difficultés durant l\'extraction',
                maxLength: 500
            },
            {
                id: 'improvements',
                label: 'Améliorations possibles',
                icon: '💡',
                type: 'textarea',
                tooltip: 'Idées d\'amélioration pour les prochaines extractions',
                maxLength: 500
            }
        ]
    }
}

export function getAllExtractionFieldIds() {
    const ids = []
    Object.values(EXTRACTION_SIDEBAR_CONTENT).forEach(section => {
        section.items.forEach(item => { ids.push(item.id) })
    })
    return ids
}

export function getExtractionFieldById(id) {
    for (const section of Object.values(EXTRACTION_SIDEBAR_CONTENT)) {
        const field = section.items.find(item => item.id === id)
        if (field) return field
    }
    return null
}

export function shouldShowExtractionField(field, data) {
    if (!field.showIf && !field.dependsOn) return true
    if (field.dependsOn && data[field.dependsOn] === undefined) return false
    if (field.showIf && typeof field.showIf === 'function') return field.showIf(data)
    return true
}

export default EXTRACTION_SIDEBAR_CONTENT
