/**
 * curingSchema - Schéma champs Pipeline Curing/Maturation
 * Compatible Fleurs, Hash, Concentrés
 */

export const curingSchema = {
    sections: [
        {
            id: 'environment',
            label: 'Environnement',
            icon: '🌡️',
            collapsed: false,
            fields: [
                {
                    key: 'environment.temperature',
                    label: 'Température',
                    type: 'number',
                    min: -20,
                    max: 50,
                    step: 0.5,
                    unit: '°C',
                    placeholder: '18',
                    tooltip: 'Température ambiante de curing'
                },
                {
                    key: 'environment.humidity',
                    label: 'Humidité relative',
                    type: 'slider',
                    min: 0,
                    max: 100,
                    step: 1,
                    unit: '%',
                    placeholder: '62',
                    tooltip: 'Humidité dans le contenant'
                }
            ]
        },
        {
            id: 'storage',
            label: 'Stockage',
            icon: '📦',
            collapsed: false,
            fields: [
                {
                    key: 'storage.containerType',
                    label: 'Type de contenant',
                    type: 'select',
                    options: ['Verre', 'Plastique', 'Air libre', 'Métal', 'Autre'],
                    placeholder: 'Sélectionner...'
                },
                {
                    key: 'storage.packaging',
                    label: 'Emballage primaire',
                    type: 'select',
                    options: [
                        'Cellophane',
                        'Papier cuisson',
                        'Aluminium',
                        'Paper hash',
                        'Sac à vide',
                        'Congelation',
                        'Sous vide complet',
                        'Sous vide partiel',
                        'Autre'
                    ]
                },
                {
                    key: 'storage.opacity',
                    label: 'Opacité',
                    type: 'select',
                    options: ['Opaque', 'Semi-opaque', 'Transparent', 'Ambré']
                },
                {
                    key: 'storage.volumeOccupied',
                    label: 'Volume occupé',
                    type: 'number',
                    min: 0,
                    step: 0.1,
                    unit: 'mL',
                    placeholder: '500'
                },
                {
                    key: 'storage.curingType',
                    label: 'Type de curing',
                    type: 'select',
                    options: ['Froid (<5°C)', 'Chaud (>5°C)']
                }
            ]
        },
        {
            id: 'reviewEvolution',
            label: 'Évolution des notes',
            icon: '📊',
            collapsed: false,
            fields: [
                // Visuel
                {
                    key: 'reviewEvolution.visual.color',
                    label: 'Couleur',
                    type: 'slider',
                    min: 0,
                    max: 10,
                    step: 0.5,
                    unit: '/10'
                },
                {
                    key: 'reviewEvolution.visual.density',
                    label: 'Densité',
                    type: 'slider',
                    min: 0,
                    max: 10,
                    step: 0.5,
                    unit: '/10'
                },
                {
                    key: 'reviewEvolution.visual.trichomes',
                    label: 'Trichomes',
                    type: 'slider',
                    min: 0,
                    max: 10,
                    step: 0.5,
                    unit: '/10'
                },

                // Odeurs
                {
                    key: 'reviewEvolution.aromas.intensity',
                    label: 'Intensité aromatique',
                    type: 'slider',
                    min: 0,
                    max: 10,
                    step: 0.5,
                    unit: '/10'
                },
                {
                    key: 'reviewEvolution.aromas.dominant',
                    label: 'Arômes dominants',
                    type: 'multiselect',
                    options: [
                        'Agrumes', 'Citron', 'Orange', 'Pamplemousse', 'Mandarine',
                        'Fruits', 'Baies', 'Fraise', 'Myrtille', 'Raisin', 'Mangue', 'Ananas',
                        'Floral', 'Rose', 'Lavande', 'Jasmin',
                        'Épices', 'Poivre', 'Cannelle', 'Clou de girofle',
                        'Boisé', 'Pin', 'Cèdre', 'Chêne', 'Santal',
                        'Terreux', 'Sous-bois', 'Humide', 'Moisi',
                        'Chimique', 'Diesel', 'Essence', 'Ammoniaque',
                        'Sucré', 'Vanille', 'Caramel', 'Miel',
                        'Herbal', 'Menthe', 'Eucalyptus', 'Thym',
                        'Fromage', 'Skunk', 'Ail', 'Oignon'
                    ],
                    maxItems: 7
                },

                // Goûts
                {
                    key: 'reviewEvolution.tastes.intensity',
                    label: 'Intensité gustative',
                    type: 'slider',
                    min: 0,
                    max: 10,
                    step: 0.5,
                    unit: '/10'
                },
                {
                    key: 'reviewEvolution.tastes.aggressiveness',
                    label: 'Agressivité/Piquant',
                    type: 'slider',
                    min: 0,
                    max: 10,
                    step: 0.5,
                    unit: '/10'
                },
                {
                    key: 'reviewEvolution.tastes.dominant',
                    label: 'Goûts dominants',
                    type: 'multiselect',
                    options: [
                        'Citronné', 'Fruité', 'Floral', 'Épicé', 'Boisé',
                        'Terreux', 'Diesel', 'Sucré', 'Herbal', 'Fromage',
                        'Amer', 'Acide', 'Salé', 'Umami'
                    ],
                    maxItems: 7
                },

                // Effets
                {
                    key: 'reviewEvolution.effects.onset',
                    label: 'Rapidité montée',
                    type: 'slider',
                    min: 0,
                    max: 10,
                    step: 0.5,
                    unit: '/10'
                },
                {
                    key: 'reviewEvolution.effects.intensity',
                    label: 'Intensité effets',
                    type: 'slider',
                    min: 0,
                    max: 10,
                    step: 0.5,
                    unit: '/10'
                },
                {
                    key: 'reviewEvolution.effects.effects',
                    label: 'Effets ressentis',
                    type: 'multiselect',
                    options: [
                        // Mentaux positifs
                        'Euphorique', 'Créatif', 'Focus', 'Énergisant', 'Sociable',
                        'Heureux', 'Motivé', 'Lucide',
                        // Physiques positifs
                        'Relaxant', 'Sédatif', 'Corporel', 'Lourd', 'Chaleur',
                        // Thérapeutiques
                        'Antidouleur', 'Anti-inflammatoire', 'Antiémétique',
                        'Anxiolytique', 'Antistress', 'Sommeil',
                        // Négatifs
                        'Anxiété', 'Paranoïa', 'Yeux secs', 'Bouche sèche',
                        'Faim', 'Léthargie', 'Confusion'
                    ],
                    maxItems: 8
                }
            ]
        },
        {
            id: 'notes',
            label: 'Notes & Observations',
            icon: '📝',
            collapsed: true,
            fields: [
                {
                    key: 'notes',
                    label: 'Notes libres',
                    type: 'textarea',
                    rows: 4,
                    maxLength: 500,
                    placeholder: 'Observations, événements, modifications...'
                }
            ]
        }
    ]
};
