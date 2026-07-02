/**
 * phenoNodeFields.js
 *
 * Configuration des champs de breeding pour un nœud PhenoHunt (GenNode.genetics, JSON).
 * Piloté par config pour éviter un formulaire monolithique — NodeFormModal.jsx itère
 * dessus pour générer les sections/champs.
 *
 * Volontairement EXCLUS car déjà capturés par la fiche technique liée (FlowerReview/etc.)
 * et ne doivent pas être dupliqués ici : odeur/arôme, profil terpénique, profil
 * cannabinoïde, production de résine, maturité des trichomes, couleur/pigmentation,
 * notes de goût. Volontairement EXCLUS car déjà représentés par la structure du graphe
 * (nœuds + arêtes) plutôt que dupliqués en texte : sexe des parents (sur le nœud parent
 * lui-même), lien parent-enfant strict (les arêtes), code du pollen donor/de la mère
 * (ce sont d'autres nœuds, avec leur propre phenotypeCode).
 *
 * Clés historiques à ne jamais renommer (lues ailleurs : CultivarNode.jsx, Genetiques.jsx) :
 * sex, type, breeder, ratio, notes, phenotypeCode, relations.
 *
 * Champs `type: 'number-unit'` stockent { value: number, unit: string } (jamais de string brute) —
 * voir NodeFormModal.jsx renderField(). Unités de rendement partagées avec la Bibliothèque Cultivars
 * via client/src/config/unitOptions.js (g/m² et g/plant ne sont jamais convertis l'un vers l'autre).
 */

import { YIELD_UNITS } from './unitOptions'

export const PHENO_NODE_SECTIONS = [
    {
        id: 'identity',
        label: 'Identité & génération',
        icon: '🏷️',
        fields: [
            { id: 'generation', label: 'Génération', type: 'select', hint: 'Position dans le programme de sélection (comptage de générations).', options: [
                { value: '', label: 'Non précisé' },
                { value: 'P', label: 'P (Parentale)' },
                { value: 'F1', label: 'F1' },
                { value: 'F2', label: 'F2' },
                { value: 'F3', label: 'F3' },
                { value: 'F4', label: 'F4' },
                { value: 'BX1', label: 'BX1 (Rétrocroisement 1)' },
                { value: 'BX2', label: 'BX2 (Rétrocroisement 2)' },
                { value: 'BX3', label: 'BX3 (Rétrocroisement 3)' },
                { value: 'S1', label: 'S1 (Selfing)' },
                { value: 'other', label: 'Autre' }
            ]},
            { id: 'seedType', label: 'Type de graine', type: 'select', options: [
                { value: '', label: 'Non précisé' },
                { value: 'regular', label: 'Régulière' },
                { value: 'feminized', label: 'Féminisée' },
                { value: 'auto', label: 'Automatique' }
            ]},
            { id: 'crossDate', label: 'Date de création du cross', type: 'date' },
            { id: 'plantingDate', label: 'Date de mise en culture', type: 'date' },
            { id: 'selectionGoal', label: 'Objectif de sélection', type: 'text', placeholder: 'ex: rendement, structure, résistance...' },
            { id: 'parentsNote', label: 'Parents (texte libre)', type: 'text', placeholder: 'ex: Mère X × Père Y', hint: 'Complète le graphe — utile si un parent n\'est pas encore dans l\'arbre' }
        ]
    },
    {
        id: 'genetic-type',
        label: 'Type génétique',
        icon: '🧬',
        fields: [
            { id: 'geneticType', label: 'Classification', type: 'select', hint: 'Classification génétique globale — pour la génération exacte du cross (F1, BX1...), voir le champ Génération ci-dessus.', options: [
                { value: '', label: 'Non précisé' },
                { value: 'landrace', label: 'Landrace / variété locale' },
                { value: 'ibl', label: 'IBL (lignée consanguine stable)' },
                { value: 'polyhybrid', label: 'Polyhybride' },
                { value: 'auto', label: 'Automatique (ruderalis)' }
            ]},
            { id: 'origin', label: 'Origine', type: 'select', options: [
                { value: '', label: 'Non précisé' },
                { value: 'seedbank', label: 'Banque de graines' },
                { value: 'breeder', label: 'Sélectionneur' },
                { value: 'clone', label: 'Clone' },
                { value: 'landrace', label: 'Landrace' },
                { value: 'ibl', label: 'IBL' },
                { value: 'polyhybrid', label: 'Polyhybride' }
            ]}
        ]
    },
    {
        id: 'selection',
        label: 'Infos de sélection',
        icon: '🎯',
        sectionHint: 'Évaluation qualitative auto-rapportée, non issue d\'une mesure normalisée.',
        fields: [
            { id: 'selectionCriteria', label: 'Critères de sélection', type: 'textarea', placeholder: 'Critères utilisés pour cette génération...' },
            { id: 'phenotypesKept', label: 'Phénotypes retenus', type: 'text' },
            { id: 'phenotypesRejected', label: 'Phénotypes rejetés', type: 'text' },
            { id: 'individualsTested', label: 'Individus testés', type: 'text', placeholder: 'ex: 20' },
            { id: 'maleFemaleRatio', label: 'Ratio mâles/femelles', type: 'text', placeholder: 'ex: 10/10' },
            { id: 'selectionIntensity', label: 'Intensité de sélection', type: 'text', placeholder: 'ex: 3 retenues sur 20' },
            { id: 'stability', label: 'Stabilité observée', type: 'select', options: [
                { value: '', label: 'Non évalué' }, { value: 'low', label: 'Faible' }, { value: 'medium', label: 'Moyenne' }, { value: 'high', label: 'Élevée' }
            ]},
            { id: 'uniformity', label: 'Uniformité de la descendance', type: 'select', options: [
                { value: '', label: 'Non évalué' }, { value: 'low', label: 'Faible' }, { value: 'medium', label: 'Moyenne' }, { value: 'high', label: 'Élevée' }
            ]},
            { id: 'phenotypicDeviation', label: 'Déviation phénotypique', type: 'text' },
            { id: 'heterosis', label: 'Vigueur hybride (hétérosis, si F1)', type: 'checkbox' }
        ]
    },
    {
        id: 'technical',
        label: 'Caractères techniques (croissance de la plante)',
        icon: '🌱',
        sectionHint: 'Évaluation qualitative auto-rapportée, non issue d\'une mesure normalisée.',
        fields: [
            { id: 'growthStructure', label: 'Structure de croissance', type: 'text' },
            { id: 'vigor', label: 'Vigueur', type: 'select', options: [
                { value: '', label: 'Non évalué' }, { value: 'low', label: 'Faible' }, { value: 'medium', label: 'Moyenne' }, { value: 'high', label: 'Élevée' }
            ]},
            { id: 'germinationSpeed', label: 'Vitesse de germination', type: 'number-unit', units: [{ value: 'h', label: 'heures' }, { value: 'j', label: 'jours' }], defaultUnit: 'h' },
            { id: 'vegTime', label: 'Temps de croissance végétative', type: 'number-unit', units: [{ value: 'j', label: 'jours' }, { value: 'sem', label: 'semaines' }], defaultUnit: 'sem' },
            { id: 'floweringTime', label: 'Temps de floraison', type: 'number-unit', units: [{ value: 'j', label: 'jours' }, { value: 'sem', label: 'semaines' }], defaultUnit: 'sem' },
            { id: 'yieldEstimate', label: 'Rendement', type: 'number-unit', units: [...YIELD_UNITS, { value: 'oz_plant', label: 'oz/plant' }], defaultUnit: 'g_m2', hint: 'g/m² et g/plant ne sont pas convertibles l\'un vers l\'autre sans connaître la densité de plantation.' },
            { id: 'floralDensity', label: 'Densité florale', type: 'select', options: [
                { value: '', label: 'Non évalué' }, { value: 'low', label: 'Faible' }, { value: 'medium', label: 'Moyenne' }, { value: 'high', label: 'Élevée' }
            ]},
            { id: 'branching', label: 'Ramification', type: 'select', options: [
                { value: '', label: 'Non évalué' }, { value: 'low', label: 'Faible' }, { value: 'medium', label: 'Moyenne' }, { value: 'high', label: 'Élevée' }
            ]},
            { id: 'stretch', label: 'Stretch', type: 'select', options: [
                { value: '', label: 'Non évalué' }, { value: 'low', label: 'Faible' }, { value: 'medium', label: 'Moyen' }, { value: 'high', label: 'Important' }
            ]},
            { id: 'stressResistance', label: 'Résistance (stress, maladies, parasites)', type: 'textarea' },
            { id: 'nutrientSensitivity', label: 'Sensibilité à la nutrition', type: 'select', options: [
                { value: '', label: 'Non évalué' }, { value: 'low', label: 'Faible' }, { value: 'medium', label: 'Moyenne' }, { value: 'high', label: 'Élevée' }
            ]},
            { id: 'hermaphroditeTendency', label: 'Tendance hermaphrodite / intersexuée', type: 'select', options: [
                { value: '', label: 'Aucune observée' }, { value: 'occasional', label: 'Occasionnelle' }, { value: 'frequent', label: 'Fréquente' }
            ]}
        ]
    },
    {
        id: 'traceability',
        label: 'Traçabilité & culture',
        icon: '📍',
        fields: [
            { id: 'seedSource', label: 'Source des graines/clones', type: 'text', placeholder: 'ex: Banque X, clone du grower Y...' },
            { id: 'cultivationNotes', label: 'Conditions de culture (lumière, substrat, nutrition, T°, humidité)', type: 'textarea' }
        ]
    },
    {
        id: 'status',
        label: 'Statut & fiabilité (usage pro)',
        icon: '📊',
        fields: [
            { id: 'status', label: 'Statut de la lignée', type: 'select', options: [
                { value: '', label: 'Non précisé' },
                { value: 'prototype', label: 'Prototype' },
                { value: 'selection', label: 'En sélection' },
                { value: 'stabilized', label: 'Stabilisée' },
                { value: 'commercialized', label: 'Commercialisée' }
            ]},
            { id: 'parentageReliability', label: 'Fiabilité du parentage', type: 'select', options: [
                { value: '', label: 'Non précisé' },
                { value: 'confirmed', label: 'Confirmé (observation/test de descendance)' },
                { value: 'probable', label: 'Probable' },
                { value: 'claimed', label: 'Revendiqué (non vérifié)' }
            ]},
            { id: 'geneticStabilityIndex', label: 'Indice de stabilité génétique', type: 'text', hint: 'Aucune échelle standardisée officielle — précisez votre méthode si renseigné (ex: % de plants conformes au phénotype cible sur N générations).' },
            { id: 'reproducibilityScore', label: 'Score de reproductibilité du phénotype', type: 'text', hint: 'Score empirique propre à votre suivi — non comparable entre éleveurs sans méthode commune.' },
            { id: 'inbreedingLevel', label: 'Niveau de consanguinité', type: 'text', hint: 'Idéalement exprimé en coefficient de consanguinité F (0–1) ou en nombre de générations de selfing/backcross si connu.' },
            { id: 'keeperHistory', label: 'Historique des phénotypes "keepers"', type: 'textarea' },
            { id: 'multiRunObservations', label: 'Observations sur plusieurs runs', type: 'textarea' },
            { id: 'version', label: 'Version de la lignée', type: 'text', placeholder: 'ex: v1.2' }
        ]
    }
]

/**
 * Méthodes d'insémination/pollinisation — propriété de la RELATION (arête) parent→enfant.
 * Le rétrocroisement (BX) est volontairement ABSENT ici : c'est une stratégie de génération
 * (déjà capturée par `generation` = BX1/BX2/BX3 sur le nœud enfant), pas une technique physique
 * de pollinisation — l'inclure ici créait un doublon de catégorie avec le champ `generation`.
 */
export const POLLINATION_METHODS = [
    { value: '', label: 'Non précisé' },
    { value: 'open', label: 'Pollinisation ouverte' },
    { value: 'controlled-manual', label: 'Pollinisation contrôlée manuelle' },
    { value: 'isolation-selected-male', label: 'Isolation plante mère + mâle sélectionné' },
    { value: 'pollination-bag', label: 'Sac de pollinisation' },
    { value: 'brush', label: 'Pinceau' },
    { value: 'pollen-collection-storage', label: 'Collecte et conservation du pollen' },
    { value: 'male-flower-harvest', label: 'Récolte sur fleurs mâles' },
    { value: 'selfing-inversion', label: 'Selfing / inversion sexuelle (obtention de S1/féminisées)' },
    { value: 'chemical-feminization', label: 'Féminisation chimique (traitement de la mère, ex: STS — produit du pollen féminisé)' }
]
