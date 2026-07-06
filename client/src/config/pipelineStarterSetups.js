/**
 * pipelineStarterSetups.js
 * Templates pré-configurés par type de pipeline.
 * Chaque setup inclut : config de trame, groupes de préréglages.
 */

export const PIPELINE_STARTER_SETUPS = {

    culture: [
        {
            id: 'culture-indoor-dwc',
            name: 'Indoor DWC',
            emoji: '💧',
            description: 'Culture hydroponique en Deep Water Culture — environnement contrôlé',
            config: { type: 'phases' },
            groupedPresets: [
                {
                    name: 'Environnement DWC',
                    emoji: '🌡️',
                    description: 'Paramètres environnement standard DWC',
                    fields: [
                        { key: 'temperatureDay', value: 24 },
                        { key: 'humidityDay', value: 60 },
                        { key: 'co2Enabled', value: true },
                        { key: 'co2Level', value: 800 },
                        { key: 'waterPH', value: 5.9 },
                        { key: 'waterEC', value: 1.6 },
                    ]
                },
                {
                    name: 'Éclairage LED',
                    emoji: '💡',
                    description: 'Spectre LED full spectrum',
                    fields: [
                        { key: 'lightType', value: 'led' },
                        { key: 'ppfd', value: 750 },
                        { key: 'vpd', value: 1.2 },
                    ]
                }
            ]
        },
        {
            id: 'culture-indoor-coco',
            name: 'Indoor Coco',
            emoji: '🌱',
            description: 'Culture en fibre de coco — semi-hydroponique',
            config: { type: 'phases' },
            groupedPresets: [
                {
                    name: 'Environnement Coco',
                    emoji: '🌡️',
                    description: 'Paramètres optimaux coco',
                    fields: [
                        { key: 'temperatureDay', value: 23 },
                        { key: 'humidityDay', value: 55 },
                        { key: 'waterPH', value: 6.0 },
                        { key: 'waterEC', value: 1.8 },
                        { key: 'co2Enabled', value: true },
                        { key: 'co2Level', value: 700 },
                    ]
                }
            ]
        },
        {
            id: 'culture-outdoor',
            name: 'Outdoor Plein Sol',
            emoji: '☀️',
            description: 'Culture extérieure en pleine terre — cycle naturel',
            config: { type: 'phases' },
            groupedPresets: [
                {
                    name: 'Sol naturel',
                    emoji: '🌍',
                    description: 'Substrat sol organique',
                    fields: [
                        { key: 'substrateType', value: 'soil' },
                        { key: 'waterPH', value: 6.5 },
                        { key: 'lightType', value: 'natural' },
                    ]
                }
            ]
        },
        {
            id: 'culture-greenhouse',
            name: 'Greenhouse',
            emoji: '🏡',
            description: 'Serre — lumière naturelle avec appoint',
            config: { type: 'phases' },
            groupedPresets: [
                {
                    name: 'Serre standard',
                    emoji: '🌡️',
                    fields: [
                        { key: 'temperatureDay', value: 22 },
                        { key: 'humidityDay', value: 65 },
                        { key: 'lightType', value: 'mixed' },
                        { key: 'substrateType', value: 'soil' },
                        { key: 'waterPH', value: 6.3 },
                    ]
                }
            ]
        }
    ],

    separation: [
        {
            id: 'sep-ice-water',
            name: 'Ice Water Hash (IWE)',
            emoji: '❄️',
            description: 'Extraction eau glacée — full spectrum, préservation terpènes',
            config: { type: 'phases', separationType: 'ice-water' },
            groupedPresets: [
                {
                    name: 'Config IWE Standard',
                    emoji: '❄️',
                    description: 'Paramètres ice water extraction 6 passes',
                    fields: [
                        { key: 'separationType', value: 'ice-water' },
                        { key: 'icewater_enabled', value: true },
                        { key: 'waterTemperature', value: 4 },
                        { key: 'numberOfPasses', value: 3 },
                        { key: 'washDuration', value: 15 },
                        { key: 'ratioWater', value: 1 },
                        { key: 'bagMicrons', value: ['220', '120', '73', '45', '25'] },
                    ]
                }
            ]
        },
        {
            id: 'sep-dry-sift',
            name: 'Dry Sift',
            emoji: '🌀',
            description: 'Tamisage à sec — simple, full spectrum',
            config: { type: 'phases', separationType: 'dry-sift' },
            groupedPresets: [
                {
                    name: 'Dry Sift multi-passes',
                    emoji: '🔬',
                    fields: [
                        { key: 'separationType', value: 'dry-sift' },
                        { key: 'drysift_enabled', value: true },
                        { key: 'numberOfPasses', value: 2 },
                        { key: 'screenMicrons', value: ['160', '120', '75'] },
                        { key: 'ambientTemperature', value: -4 },
                    ]
                }
            ]
        },
        {
            id: 'sep-kief-simple',
            name: 'Kief Simple',
            emoji: '🍃',
            description: 'Collecte simple de kief — rapide (dry-sift, maille unique)',
            config: { type: 'phases', separationType: 'dry-sift' },
            groupedPresets: [
                {
                    name: 'Kief box standard',
                    emoji: '🍃',
                    fields: [
                        { key: 'separationType', value: 'dry-sift' },
                        { key: 'drysift_enabled', value: true },
                        { key: 'screenMicrons', value: ['160'] },
                    ]
                }
            ]
        }
    ],

    extraction: [
        {
            id: 'ext-rosin-cold-cure',
            name: 'Cold Cure Rosin',
            emoji: '🧊',
            description: 'Rosin press basse temp — full spectrum, terpènes préservés',
            config: { type: 'phases', extractionMethod: 'rosin-press' },
            groupedPresets: [
                {
                    name: 'Press Cold Cure',
                    emoji: '🔥',
                    description: '65-75°C / 600 PSI / 90s / 36µm',
                    fields: [
                        { key: 'extractionMethod', value: 'rosin-press' },
                        { key: 'plateTemperature', value: 72 },
                        { key: 'platePressure', value: 600 },
                        { key: 'pressDuration', value: 90 },
                        { key: 'bagMicrons', value: '36' },
                        { key: 'rossinCureMethod', value: 'cold-cure' },
                        { key: 'rosin_enabled', value: true },
                    ]
                }
            ]
        },
        {
            id: 'ext-rosin-live',
            name: 'Live Rosin (Fresh Press)',
            emoji: '🔥',
            description: 'Fresh frozen → press haute temp — consistance liquide',
            config: { type: 'phases', extractionMethod: 'live-rosin' },
            groupedPresets: [
                {
                    name: 'Live Rosin Press',
                    emoji: '🔥',
                    description: '85-95°C / 800 PSI / 120s / 72µm',
                    fields: [
                        { key: 'extractionMethod', value: 'live-rosin' },
                        { key: 'plateTemperature', value: 90 },
                        { key: 'platePressure', value: 800 },
                        { key: 'pressDuration', value: 120 },
                        { key: 'bagMicrons', value: '72' },
                        { key: 'materialType', value: 'fresh-frozen' },
                        { key: 'materialState', value: 'fresh-frozen' },
                        { key: 'rosin_enabled', value: true },
                        { key: 'rossinCureMethod', value: 'room-temp' },
                    ]
                }
            ]
        },
        {
            id: 'ext-bho-fresh-frozen',
            name: 'BHO Fresh Frozen',
            emoji: '🧪',
            description: 'Extraction butane cryo — live resin, max terpènes',
            config: { type: 'phases', extractionMethod: 'bho' },
            groupedPresets: [
                {
                    name: 'BHO Cryo Standard',
                    emoji: '❄️',
                    description: 'Butane N-Tane, -40°C, vacuum purge 48h',
                    fields: [
                        { key: 'extractionMethod', value: 'bho' },
                        { key: 'solvent_enabled', value: true },
                        { key: 'solventType', value: 'butane' },
                        { key: 'solventGrade', value: 'n-tane' },
                        { key: 'cryoExtraction', value: true },
                        { key: 'extractionTemp', value: -40 },
                        { key: 'closedLoopSystem', value: true },
                        { key: 'purgeMethod', value: 'vacuum-oven' },
                        { key: 'purgeTemp', value: 38 },
                        { key: 'purgeDuration', value: 48 },
                        { key: 'materialType', value: 'fresh-frozen' },
                    ]
                }
            ]
        },
        {
            id: 'ext-co2',
            name: 'CO2 Supercritique',
            emoji: '⚗️',
            description: 'Extraction CO2 — propre, spectre large',
            config: { type: 'phases', extractionMethod: 'co2' },
            groupedPresets: [
                {
                    name: 'CO2 Standard',
                    emoji: '⚗️',
                    fields: [
                        { key: 'extractionMethod', value: 'co2' },
                        { key: 'solvent_enabled', value: true },
                        { key: 'solventType', value: 'co2' },
                        { key: 'solventGrade', value: 'food-grade' },
                    ]
                }
            ]
        }
    ],

    curing: [
        {
            id: 'curing-cold-slow',
            name: 'Cold Slow Cure',
            emoji: '❄️',
            description: 'Maturation froide lente — maximum qualité, 8-12 semaines',
            config: { type: 'phases', curingType: 'cold' },
            groupedPresets: [
                {
                    name: 'Cold Slow',
                    emoji: '❄️',
                    description: '18-20°C / 62-65% RH / Jars verre',
                    fields: [
                        { key: 'curingType', value: 'cold' },
                        { key: 'temperature', value: 19 },
                        { key: 'targetHumidity', value: 63 },
                        { key: 'containerType', value: 'glass' },
                        { key: 'burpingFrequency', value: 'daily' },
                    ]
                }
            ]
        },
        {
            id: 'curing-standard',
            name: 'Cure Standard',
            emoji: '🌡️',
            description: 'Cure classique — 4-6 semaines, bon équilibre qualité/temps',
            config: { type: 'phases', curingType: 'room' },
            groupedPresets: [
                {
                    name: 'Standard',
                    emoji: '🌡️',
                    description: '20-22°C / 60-65% RH',
                    fields: [
                        { key: 'curingType', value: 'room' },
                        { key: 'temperature', value: 21 },
                        { key: 'targetHumidity', value: 62 },
                        { key: 'containerType', value: 'glass' },
                        { key: 'burpingFrequency', value: 'daily' },
                    ]
                }
            ]
        },
        {
            id: 'curing-grove-bags',
            name: 'Grove Bags (auto-cure)',
            emoji: '🌿',
            description: 'Sacs terène — auto-régulation humidité, sans ouverture',
            config: { type: 'phases', curingType: 'room' },
            groupedPresets: [
                {
                    name: 'Grove Bags',
                    emoji: '🌿',
                    fields: [
                        { key: 'curingType', value: 'room' },
                        { key: 'containerType', value: 'bag' },
                        { key: 'temperature', value: 20 },
                        { key: 'targetHumidity', value: 58 },
                        { key: 'burpingFrequency', value: 'none' },
                    ]
                }
            ]
        }
    ]
};
