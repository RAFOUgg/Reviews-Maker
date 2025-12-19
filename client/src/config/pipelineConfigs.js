/**
 * CONFIGURATION CENTRALE DES PIPELINES - CDC COMPLET
 * 
 * Basé sur PIPELINE_DONNEE_CULTURES.md (version corrigée 19/12/2025)
 * Toutes les pipelines (Culture, Curing, Séparation, Extraction, Recette)
 * utilisent le même composant UnifiedPipeline avec des configurations différentes
 * 
 * Architecture:
 * - timelineConfig: Configuration de la timeline (type d'intervalles, phases, etc.)
 * - sidebarContent: Données disponibles organisées par sections
 * - generalFields: Champs de configuration générale (dates, mode, etc.)
 * 
 * PRINCIPE: Tous les champs numériques sont LIBRES (pas de validation min/max stricte)
 * Les suggestions/catégories sont des aides UX, jamais des contraintes
 */

import { CULTURE_FORM_DATA } from '../data/cultureFormData'

// ============================================================================
// CULTURE PIPELINE (Fleurs) - 85+ champs CDC
// ============================================================================
export const CULTURE_PIPELINE_CONFIG = {
    type: 'culture',
    title: '🌱 Pipeline de Culture',
    description: 'Traçabilité complète de la culture du cannabis',

    // Configuration des types d'intervalles disponibles
    intervalTypes: [
        { value: 'jour', label: 'Jours', icon: '📅', maxCells: 365 },
        { value: 'semaine', label: 'Semaines', icon: '📆', maxCells: 52 },
        { value: 'phase', label: 'Phases physiologiques', icon: '🌱', maxCells: 12 }
    ],

    // Phases physiologiques (si type = 'phase')
    phases: [
        { id: 'graine', label: '🌰 Graine (J0)', duration: 1 },
        { id: 'germination', label: '🌱 Germination', duration: 3 },
        { id: 'plantule', label: '🌿 Plantule', duration: 7 },
        { id: 'croissance-debut', label: '🌾 Début croissance', duration: 14 },
        { id: 'croissance-milieu', label: '🌳 Milieu croissance', duration: 14 },
        { id: 'croissance-fin', label: '🌴 Fin croissance', duration: 7 },
        { id: 'stretch-debut', label: '🌸 Début stretch', duration: 7 },
        { id: 'stretch-milieu', label: '💐 Milieu stretch', duration: 7 },
        { id: 'stretch-fin', label: '🌺 Fin stretch', duration: 7 },
        { id: 'floraison-debut', label: '🌼 Début floraison', duration: 14 },
        { id: 'floraison-milieu', label: '🌻 Milieu floraison', duration: 14 },
        { id: 'floraison-fin', label: '🏵️ Fin floraison', duration: 14 }
    ],

    // Panneau latéral - Contenus disponibles
    sidebarContent: [
        {
            id: 'general',
            label: 'GÉNÉRAL',
            icon: '⚙️',
            items: [
                {
                    id: 'modeCulture',
                    label: 'Mode de culture',
                    icon: '🏕️',
                    type: 'select',
                    options: CULTURE_FORM_DATA.modes_culture
                },
                {
                    id: 'typeEspace',
                    label: "Type d'espace",
                    icon: '📦',
                    type: 'select',
                    options: CULTURE_FORM_DATA.espaces_culture
                },
                {
                    id: 'uniteDimensions',
                    label: 'Unité de mesure',
                    icon: '📏',
                    type: 'select',
                    options: CULTURE_FORM_DATA.unites_dimensions
                },
                { id: 'dimensionsL', label: 'Longueur', icon: '📏', type: 'number', placeholder: 'Valeur libre' },
                { id: 'dimensionsl', label: 'Largeur', icon: '📏', type: 'number', placeholder: 'Valeur libre' },
                { id: 'dimensionsH', label: 'Hauteur', icon: '📏', type: 'number', placeholder: 'Valeur libre' },
                { id: 'surfaceSol', label: 'Surface au sol (m²)', icon: '📐', type: 'number', step: 0.01, placeholder: 'Calculée ou saisie', unit: 'm²' },
                { id: 'volumeTotal', label: 'Volume total (m³)', icon: '📦', type: 'number', step: 0.01, placeholder: 'Calculé ou saisi', unit: 'm³' },
                {
                    id: 'techniquePropagation',
                    label: 'Technique de propagation',
                    icon: '🌰',
                    type: 'select',
                    options: CULTURE_FORM_DATA.techniques_propagation
                },
                { id: 'nombrePlantes', label: 'Nombre de plantes', icon: '🌱', type: 'number', placeholder: 'Valeur libre', unit: 'plante(s)' }
            ]
        },
        {
            id: 'substrat',
            label: 'SUBSTRAT & COMPOSITION',
            icon: '🪴',
            items: [
                {
                    id: 'typeSubstrat',
                    label: 'Type de substrat',
                    icon: '🧪',
                    type: 'select',
                    options: CULTURE_FORM_DATA.types_substrat
                },
                {
                    id: 'drainageSubstrat',
                    label: 'Drainage',
                    icon: '💧',
                    type: 'select',
                    options: CULTURE_FORM_DATA.drainage_substrat
                },
                { id: 'volumeSubstrat', label: 'Volume pot/contenant (L)', icon: '📊', type: 'number', step: 0.1, placeholder: 'Valeur libre', unit: 'L' },
                {
                    id: 'compositionSubstrat',
                    label: 'Composants substrat (%)',
                    icon: '📊',
                    type: 'multiselect',
                    options: CULTURE_FORM_DATA.composants_substrat,
                    withPercentage: true
                },
                {
                    id: 'marquesSubstrat',
                    label: 'Marques substrat',
                    icon: '🏷️',
                    type: 'select',
                    options: CULTURE_FORM_DATA.marques_substrat,
                    allowCustom: true
                },
                { id: 'phSubstrat', label: 'pH substrat', icon: '🧪', type: 'number', step: 0.1, placeholder: 'Valeur libre (0-14)', unit: 'pH' },
                { id: 'ecSubstrat', label: 'EC substrat (mS/cm)', icon: '⚡', type: 'number', step: 0.1, placeholder: 'Valeur libre', unit: 'mS/cm' }
            ]
        },
        {
            id: 'environnement',
            label: 'ENVIRONNEMENT',
            icon: '🌡️',
            items: [
                { id: 'temperatureMoyenne', label: 'Température moyenne (°C)', icon: '🌡️', type: 'number', step: 0.5, placeholder: 'Valeur libre', unit: '°C' },
                { id: 'temperatureMin', label: 'Température MIN (°C)', icon: '❄️', type: 'number', step: 0.5, placeholder: 'Plage personnalisée', unit: '°C', helper: 'Suggestions: Végétatif jour 22-30°C, nuit 18-24°C' },
                { id: 'temperatureMax', label: 'Température MAX (°C)', icon: '🔥', type: 'number', step: 0.5, placeholder: 'Plage personnalisée', unit: '°C', helper: 'Suggestions: Floraison jour 20-28°C, nuit 16-22°C' },
                {
                    id: 'modeControleTemperature',
                    label: 'Mode contrôle température',
                    icon: '🎛️',
                    type: 'select',
                    options: CULTURE_FORM_DATA.modes_controle_temperature
                },
                { id: 'humiditeMoyenne', label: 'Humidité relative moyenne (%)', icon: '💧', type: 'number', placeholder: 'Valeur libre', unit: '%' },
                { id: 'humiditeMin', label: 'Humidité MIN (%)', icon: '💧', type: 'number', placeholder: 'Plage personnalisée', unit: '%', helper: 'Suggestions: Germination 70-90%, Croissance 55-80%, Floraison 40-60%' },
                { id: 'humiditeMax', label: 'Humidité MAX (%)', icon: '💧', type: 'number', placeholder: 'Plage personnalisée', unit: '%', helper: 'Suggestions: Fin floraison 35-50%' },
                { id: 'vpd', label: 'VPD (kPa)', icon: '📊', type: 'number', step: 0.05, placeholder: 'Calculé automatiquement ou saisi manuellement', unit: 'kPa', helper: 'Vapor Pressure Deficit - optionnel avancé' },
                { id: 'co2Valeur', label: 'CO₂ valeur personnalisée (ppm)', icon: '🫧', type: 'number', step: 50, placeholder: 'Valeur libre', unit: 'ppm', helper: 'Suggestions: Non enrichi 400-500, Enrichi 600-1200+' },
                {
                    id: 'co2Mode',
                    label: 'Mode injection CO₂',
                    icon: '🔬',
                    type: 'select',
                    options: CULTURE_FORM_DATA.modes_injection_co2
                },
                {
                    id: 'typeVentilation',
                    label: 'Type de ventilation',
                    icon: '🌀',
                    type: 'multiselect',
                    options: CULTURE_FORM_DATA.types_ventilation
                },
                { id: 'debitExtracteur', label: 'Débit extracteur (m³/h)', icon: '💨', type: 'number', placeholder: 'Valeur libre', unit: 'm³/h' },
                { id: 'puissanceVentilateur', label: 'Puissance ventilateur (W)', icon: '⚡', type: 'number', placeholder: 'Valeur libre', unit: 'W' },
                {
                    id: 'modeVentilation',
                    label: 'Mode ventilation',
                    icon: '🔁',
                    type: 'select',
                    options: CULTURE_FORM_DATA.modes_ventilation
                }
            ]
        },
        {
            id: 'lumiere',
            label: 'LUMIÈRE & SPECTRE',
            icon: '💡',
            items: [
                {
                    id: 'typeLampe',
                    label: 'Type de lampe',
                    icon: '💡',
                    type: 'select',
                    options: CULTURE_FORM_DATA.types_lampe
                },
                {
                    id: 'fabricantLampe',
                    label: 'Fabricant / Marque',
                    icon: '🏭',
                    type: 'select',
                    options: CULTURE_FORM_DATA.fabricants_lampe,
                    allowCustom: true
                },
                { id: 'modeleLampe', label: 'Modèle', icon: '🏷️', type: 'text', placeholder: 'Ex: SF-4000, TS-1000, HLG 550...' },
                {
                    id: 'spectreLumiere',
                    label: 'Spectre lumineux',
                    icon: '🌈',
                    type: 'select',
                    options: CULTURE_FORM_DATA.spectres_lumiere
                },
                {
                    id: 'uniteDistanceLampe',
                    label: 'Unité distance',
                    icon: '📏',
                    type: 'select',
                    options: CULTURE_FORM_DATA.unites_distance_lampe
                },
                { id: 'distanceLampePlante', label: 'Distance lampe-plante', icon: '📏', type: 'number', placeholder: 'Valeur libre' },
                {
                    id: 'modeDistanceLampe',
                    label: 'Mode distance',
                    icon: '🔄',
                    type: 'select',
                    options: CULTURE_FORM_DATA.modes_distance_lampe
                },
                { id: 'puissanceTotale', label: 'Puissance totale (W)', icon: '⚡', type: 'number', placeholder: 'Valeur libre', unit: 'W', helper: 'Puissance/m² = Puissance totale / Surface au sol' },
                { id: 'dimmable', label: 'Dimmable', icon: '🔅', type: 'select', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },
                {
                    id: 'photoperiode',
                    label: 'Photopériode',
                    icon: '⏰',
                    type: 'select',
                    options: CULTURE_FORM_DATA.photoperiodes
                },
                { id: 'photoperiodeHeuresON', label: 'Heures ON (si personnalisée)', icon: '☀️', type: 'number', placeholder: '0-24', helper: 'Uniquement si photopériode personnalisée' },
                { id: 'photoperiodeHeuresOFF', label: 'Heures OFF (si personnalisée)', icon: '🌙', type: 'number', placeholder: '0-24', helper: 'Uniquement si photopériode personnalisée' },
                { id: 'dli', label: 'DLI (mol/m²/jour)', icon: '📊', type: 'number', step: 0.1, placeholder: 'Valeur libre', unit: 'mol/m²/j' },
                { id: 'ppfd', label: 'PPFD moyen (µmol/m²/s)', icon: '🔆', type: 'number', placeholder: 'Valeur libre', unit: 'µmol/m²/s' },
                {
                    id: 'kelvin',
                    label: 'Température couleur (K)',
                    icon: '🌡️',
                    type: 'select',
                    options: CULTURE_FORM_DATA.temperatures_couleur_kelvin,
                    allowCustom: true
                }
            ]
        },
        {
            id: 'irrigation',
            label: 'IRRIGATION & FRÉQUENCE',
            icon: '💧',
            items: [
                {
                    id: 'systemeIrrigation',
                    label: 'Système d\'irrigation',
                    icon: '💦',
                    type: 'select',
                    options: CULTURE_FORM_DATA.systemes_irrigation
                },
                {
                    id: 'frequenceIrrigation',
                    label: 'Fréquence arrosage',
                    icon: '🔁',
                    type: 'select',
                    options: [...CULTURE_FORM_DATA.frequences_arrosage_jour, ...CULTURE_FORM_DATA.frequences_arrosage_semaine, ...CULTURE_FORM_DATA.frequences_arrosage_speciales]
                },
                {
                    id: 'uniteVolumeEau',
                    label: 'Unité volume eau',
                    icon: '💧',
                    type: 'select',
                    options: CULTURE_FORM_DATA.unites_volume_eau
                },
                { id: 'volumeEauParArrosage', label: 'Volume eau par arrosage', icon: '🚰', type: 'number', step: 0.01, placeholder: 'Valeur libre' },
                {
                    id: 'modeVolumeEau',
                    label: 'Mode volume',
                    icon: '📊',
                    type: 'select',
                    options: CULTURE_FORM_DATA.modes_volume_eau
                },
                {
                    id: 'uniteDureeArrosage',
                    label: 'Unité durée',
                    icon: '⏱️',
                    type: 'select',
                    options: CULTURE_FORM_DATA.unites_duree_arrosage
                },
                { id: 'dureeArrosage', label: 'Durée arrosage', icon: '⏱️', type: 'number', placeholder: 'Valeur libre' },
                { id: 'phEau', label: 'pH eau', icon: '🧪', type: 'number', step: 0.1, placeholder: 'Valeur libre (0-14)', unit: 'pH' },
                { id: 'ecEau', label: 'EC eau (mS/cm)', icon: '⚡', type: 'number', step: 0.1, placeholder: 'Valeur libre', unit: 'mS/cm' },
                { id: 'tempEau', label: 'Température eau (°C)', icon: '🌡️', type: 'number', step: 0.5, placeholder: 'Valeur libre', unit: '°C' }
            ]
        },
        {
            id: 'engrais',
            label: 'ENGRAIS & DOSAGE',
            icon: '🧪',
            items: [
                {
                    id: 'typeEngrais',
                    label: 'Type d\'engrais',
                    icon: '🌿',
                    type: 'select',
                    options: CULTURE_FORM_DATA.types_engrais
                },
                {
                    id: 'marqueEngrais',
                    label: 'Marque / gamme',
                    icon: '🏷️',
                    type: 'select',
                    options: CULTURE_FORM_DATA.marques_engrais,
                    allowCustom: true
                },
                { id: 'nomProduitEngrais', label: 'Nom du produit', icon: '📦', type: 'text', placeholder: 'Ex: Bio-Bloom, Sensi Grow Part A...' },
                {
                    id: 'uniteDosage',
                    label: 'Unité dosage',
                    icon: '⚖️',
                    type: 'select',
                    options: CULTURE_FORM_DATA.unites_dosage
                },
                { id: 'dosageEngrais', label: 'Dosage', icon: '💧', type: 'number', step: 0.1, placeholder: 'Valeur libre' },
                { id: 'phSolution', label: 'pH cible de la solution', icon: '🧪', type: 'number', step: 0.1, placeholder: 'Valeur libre (0-14)', unit: 'pH' },
                {
                    id: 'frequenceEngraissage',
                    label: 'Fréquence application',
                    icon: '🔁',
                    type: 'select',
                    options: CULTURE_FORM_DATA.frequences_application_engrais
                },
                { id: 'additifs', label: 'Additifs utilisés', icon: '🧴', type: 'text', placeholder: 'Enzymes, stimulateurs, PK...' }
            ]
        },
        {
            id: 'palissage',
            label: 'PALISSAGE & TECHNIQUES',
            icon: '✂️',
            items: [
                {
                    id: 'methodePalissage',
                    label: 'Méthode de palissage',
                    icon: '🪢',
                    type: 'multiselect',
                    options: CULTURE_FORM_DATA.methodologies_palissage
                },
                { id: 'commentairePalissage', label: 'Commentaire palissage', icon: '📝', type: 'textarea', placeholder: 'Détails des manipulations...' }
            ]
        },
        {
            id: 'morphologie',
            label: 'MORPHOLOGIE PLANTE',
            icon: '🌳',
            items: [
                { id: 'taillePlante', label: 'Taille de la plante (cm)', icon: '📏', type: 'number', placeholder: 'Valeur libre', unit: 'cm', helper: 'Catégories: <30, 30-60, 60-90, 90-120, 120-150, 150-200, >200 cm' },
                { id: 'volumeCanopee', label: 'Volume canopée', icon: '📦', type: 'select', options: CULTURE_FORM_DATA.categories_volume_canopee },
                { id: 'volumeCanopeeChiffre', label: 'Volume canopée chiffré (m³)', icon: '📐', type: 'number', step: 0.01, placeholder: 'Valeur libre', unit: 'm³' },
                {
                    id: 'unitePoidsPlante',
                    label: 'Unité poids',
                    icon: '⚖️',
                    type: 'select',
                    options: CULTURE_FORM_DATA.unites_poids_plante
                },
                { id: 'poidsPlanteF raiche', label: 'Poids plante fraîche (hors racines)', icon: '⚖️', type: 'number', step: 0.1, placeholder: 'Valeur libre' },
                { id: 'nombreBranchesPrincipales', label: 'Nombre de branches principales', icon: '🌿', type: 'number', placeholder: 'Valeur libre (sans unité)', helper: 'Catégories: 1-4, 5-8, 9-12, >12' },
                { id: 'nombreFeuilles', label: 'Nombre de feuilles estimé', icon: '🍃', type: 'number', placeholder: 'Valeur libre (sans unité)', helper: 'Catégories: <50, 50-100, 100-200, >200' },
                { id: 'nombreBuds', label: 'Nombre de buds/têtes', icon: '🌺', type: 'number', placeholder: 'Valeur libre (sans unité)', helper: 'Catégories: <20, 20-50, 50-100, >100' }
            ]
        },
        {
            id: 'recolte',
            label: 'RÉCOLTE',
            icon: '✂️',
            items: [
                {
                    id: 'couleurTrichomes',
                    label: 'Couleur trichomes récolte',
                    icon: '💎',
                    type: 'multiselect',
                    options: CULTURE_FORM_DATA.couleurs_trichomes,
                    withPercentage: true
                },
                { id: 'dateRecolte', label: 'Date de récolte', icon: '📅', type: 'date' },
                { id: 'poidsBrutRecolte', label: 'Poids brut total (g)', icon: '⚖️', type: 'number', step: 0.1, placeholder: 'Valeur libre', unit: 'g' },
                { id: 'poidsNetTrim', label: 'Poids net après trim (g)', icon: '⚖️', type: 'number', step: 0.1, placeholder: 'Valeur libre', unit: 'g' },
                { id: 'poidsSecFinal', label: 'Poids sec final (g)', icon: '⚖️', type: 'number', step: 0.1, placeholder: 'Optionnel', unit: 'g' },
                { id: 'tauxPerte', label: 'Taux de perte (%)', icon: '📉', type: 'number', step: 0.1, placeholder: 'Calculé automatiquement', unit: '%', helper: 'Formule: ((Poids brut - Poids sec) / Poids brut) × 100', calculated: true },
                { id: 'rendementM2', label: 'Rendement (g/m²)', icon: '📊', type: 'number', step: 0.1, placeholder: 'Valeur libre', unit: 'g/m²' },
                { id: 'rendementPlante', label: 'Rendement (g/plante)', icon: '🌱', type: 'number', step: 0.1, placeholder: 'Valeur libre', unit: 'g/plante' },
                { id: 'rendementWatt', label: 'Rendement (g/W)', icon: '⚡', type: 'number', step: 0.01, placeholder: 'Calculé automatiquement', unit: 'g/W', helper: 'Formule: Poids sec final (g) / Puissance totale (W)', calculated: true },
                {
                    id: 'categorieRendement',
                    label: 'Catégorie rendement',
                    icon: '🏆',
                    type: 'select',
                    options: CULTURE_FORM_DATA.categories_rendement
                }
            ]
        }
    ]
}

// ============================================================================
// CURING/MATURATION PIPELINE (Tous produits) - CDC
// ============================================================================
export const CURING_PIPELINE_CONFIG = {
    type: 'curing',
    title: '🌡️ Pipeline Curing & Maturation',
    description: 'Suivi de l\'affinage et de la maturation',

    intervalTypes: [
        { value: 'seconde', label: 'Secondes', icon: '⏱️', maxCells: 3600 },
        { value: 'minute', label: 'Minutes', icon: '⏱️', maxCells: 1440 },
        { value: 'heure', label: 'Heures', icon: '🕐', maxCells: 720 },
        { value: 'jour', label: 'Jours', icon: '📅', maxCells: 365 },
        { value: 'semaine', label: 'Semaines', icon: '📆', maxCells: 52 },
        { value: 'mois', label: 'Mois', icon: '📆', maxCells: 24 }
    ],

    sidebarContent: [
        {
            id: 'temperature',
            label: 'TEMPÉRATURE',
            icon: '🌡️',
            items: [
                {
                    id: 'typeCuring',
                    label: 'Type de curing',
                    icon: '❄️',
                    type: 'select',
                    options: [
                        { value: 'froid', label: 'Froid (< 5°C)' },
                        { value: 'temperature-ambiante', label: 'Température ambiante (15-25°C)' },
                        { value: 'chaud', label: 'Chaud (> 25°C)' },
                        { value: 'variable', label: 'Variable contrôlée' }
                    ]
                },
                { id: 'temperatureCuring', label: 'Température (°C)', icon: '🌡️', type: 'number', min: -20, max: 50, step: 0.5, unit: '°C' }
            ]
        },
        {
            id: 'humidite',
            label: 'HUMIDITÉ',
            icon: '💧',
            items: [
                { id: 'humiditeRecipient', label: 'Humidité relative (%)', icon: '💧', type: 'number', min: 0, max: 100, unit: '%' },
                { id: 'boveda', label: 'Boveda / Integra (g)', icon: '📦', type: 'number', min: 0, max: 100, unit: 'g' }
            ]
        },
        {
            id: 'recipient',
            label: 'CONTENANT',
            icon: '🫙',
            items: [
                {
                    id: 'typeRecipient',
                    label: 'Type de récipient',
                    icon: '🫙',
                    type: 'select',
                    options: [
                        { value: 'air-libre', label: 'Air libre' },
                        { value: 'verre', label: 'Bocal en verre' },
                        { value: 'plastique', label: 'Contenant plastique' },
                        { value: 'metal', label: 'Boîte métallique' },
                        { value: 'bois', label: 'Boîte en bois' },
                        { value: 'papier', label: 'Papier kraft' },
                        { value: 'vacuum', label: 'Sous vide' },
                        { value: 'autre', label: 'Autre' }
                    ]
                },
                {
                    id: 'opaciteRecipient',
                    label: 'Opacité du récipient',
                    icon: '🌑',
                    type: 'select',
                    options: [
                        { value: 'opaque', label: 'Opaque (bloque lumière)' },
                        { value: 'semi-opaque', label: 'Semi-opaque' },
                        { value: 'transparent', label: 'Transparent' },
                        { value: 'ambre', label: 'Verre ambré (UV)' },
                        { value: 'noir', label: 'Noir complet' }
                    ]
                },
                { id: 'volumeOccupe', label: 'Volume occupé par produit (mL)', icon: '📏', type: 'number', min: 0.1, max: 100000, step: 0.1, unit: 'mL' }
            ]
        },
        {
            id: 'emballage',
            label: 'EMBALLAGE PRIMAIRE',
            icon: '📦',
            items: [
                {
                    id: 'emballagePrimaire',
                    label: 'Type d\'emballage',
                    icon: '📦',
                    type: 'multiselect',
                    options: [
                        { value: 'cellophane', label: 'Cellophane' },
                        { value: 'papier-cuisson', label: 'Papier cuisson' },
                        { value: 'aluminium', label: 'Aluminium' },
                        { value: 'paper-hash', label: 'Paper hash (parchment)' },
                        { value: 'sac-vide', label: 'Sac à vide' },
                        { value: 'congelation', label: 'Sac congélation' },
                        { value: 'sous-vide-complet', label: 'Sous vide complet (machine)' },
                        { value: 'sous-vide-partiel', label: 'Sous vide partiel (manuel)' },
                        { value: 'aucun', label: 'Aucun emballage' }
                    ]
                }
            ]
        }
    ]
}

// ============================================================================
// SEPARATION PIPELINE (Hash) - CDC
// ============================================================================
export const SEPARATION_PIPELINE_CONFIG = {
    type: 'separation',
    title: '🧊 Pipeline Séparation Hash',
    description: 'Extraction des trichomes par tamisage ou eau glacée',

    intervalTypes: [
        { value: 'seconde', label: 'Secondes', icon: '⏱️', maxCells: 3600 },
        { value: 'minute', label: 'Minutes', icon: '⏱️', maxCells: 180 },
        { value: 'heure', label: 'Heures', icon: '🕐', maxCells: 24 }
    ],

    sidebarContent: [
        {
            id: 'methode',
            label: 'MÉTHODE DE SÉPARATION',
            icon: '🔬',
            items: [
                {
                    id: 'methodeSeparation',
                    label: 'Méthode',
                    icon: '🔬',
                    type: 'select',
                    options: [
                        { value: 'manuel', label: 'Tamisage manuel' },
                        { value: 'dry-sift', label: 'Dry sift (tamisage à sec)' },
                        { value: 'ice-water', label: 'Ice-O-Lator (eau glacée)' },
                        { value: 'bubble-hash', label: 'Bubble hash (machine à laver)' },
                        { value: 'pollinator', label: 'Pollinator (tambour rotatif)' },
                        { value: 'rosin-tech', label: 'Rosin tech (chaleur/pression)' },
                        { value: 'autre', label: 'Autre méthode' }
                    ]
                },
                { id: 'nombrePasses', label: 'Nombre de passes', icon: '🔁', type: 'number', min: 1, max: 20 },
                { id: 'temperatureEau', label: 'Température eau (°C)', icon: '🌡️', type: 'number', min: -5, max: 25, step: 0.5, unit: '°C' },
                {
                    id: 'tailleMailles',
                    label: 'Taille des mailles (µm)',
                    icon: '🔬',
                    type: 'multiselect',
                    options: [
                        { value: '220', label: '220µm (Bag 1 - Travail)' },
                        { value: '190', label: '190µm (Bag 2)' },
                        { value: '160', label: '160µm (Bag 3)' },
                        { value: '120', label: '120µm (Bag 4 - Full melt)' },
                        { value: '90', label: '90µm (Bag 5 - Full melt)' },
                        { value: '73', label: '73µm (Bag 6 - Premium)' },
                        { value: '45', label: '45µm (Bag 7 - Food grade)' },
                        { value: '25', label: '25µm (Bag 8 - Contaminants)' }
                    ]
                }
            ]
        },
        {
            id: 'matiere-premiere',
            label: 'MATIÈRE PREMIÈRE',
            icon: '🌿',
            items: [
                {
                    id: 'typeMatierePremi',
                    label: 'Type de matière',
                    icon: '🌿',
                    type: 'multiselect',
                    options: [
                        { value: 'trim-frais', label: 'Trim frais' },
                        { value: 'trim-sec', label: 'Trim séché' },
                        { value: 'buds-frais', label: 'Buds frais (fresh frozen)' },
                        { value: 'buds-secs', label: 'Buds séchés' },
                        { value: 'sugar-leaves', label: 'Sugar leaves' },
                        { value: 'fan-leaves', label: 'Fan leaves (grandes feuilles)' },
                        { value: 'tiges', label: 'Tiges' },
                        { value: 'melange', label: 'Mélange' }
                    ]
                },
                { id: 'qualiteMatierePremi', label: 'Qualité matière (1-10)', icon: '⭐', type: 'number', min: 1, max: 10 },
                { id: 'rendementEstime', label: 'Rendement estimé (%)', icon: '📊', type: 'number', min: 0, max: 50, step: 0.1, unit: '%' },
                { id: 'tempsSeparation', label: 'Temps total (minutes)', icon: '⏱️', type: 'number', min: 1, max: 300, unit: 'min' }
            ]
        }
    ]
}

// ============================================================================
// PURIFICATION PIPELINE (Hash & Concentrés) - CDC
// ============================================================================
export const PURIFICATION_PIPELINE_CONFIG = {
    type: 'purification',
    title: '🧬 Pipeline Purification',
    description: 'Raffinage et purification post-extraction',

    intervalTypes: [
        { value: 'seconde', label: 'Secondes', icon: '⏱️', maxCells: 600 },
        { value: 'minute', label: 'Minutes', icon: '⏱️', maxCells: 120 },
        { value: 'heure', label: 'Heures', icon: '🕐', maxCells: 48 }
    ],

    sidebarContent: [
        {
            id: 'methode-purification',
            label: 'MÉTHODE',
            icon: '🧪',
            items: [
                {
                    id: 'methodePurification',
                    label: 'Technique de purification',
                    icon: '🧪',
                    type: 'multiselect',
                    options: [
                        { value: 'chromatographie-colonne', label: 'Chromatographie sur colonne' },
                        { value: 'flash-chromatography', label: 'Flash Chromatography' },
                        { value: 'hplc', label: 'HPLC (liquide haute performance)' },
                        { value: 'gc', label: 'GC (chromatographie en phase gazeuse)' },
                        { value: 'tlc', label: 'TLC (couche mince)' },
                        { value: 'winterisation', label: 'Winterisation (dégommage)' },
                        { value: 'decarboxylation', label: 'Décarboxylation' },
                        { value: 'fractionnement-temp', label: 'Fractionnement par température' },
                        { value: 'fractionnement-solubilite', label: 'Fractionnement par solubilité' },
                        { value: 'filtration', label: 'Filtration' },
                        { value: 'centrifugation', label: 'Centrifugation' },
                        { value: 'decantation', label: 'Décantation' },
                        { value: 'sechage-vide', label: 'Séchage sous vide' },
                        { value: 'recristallisation', label: 'Recristallisation' },
                        { value: 'sublimation', label: 'Sublimation' },
                        { value: 'extraction-liquide-liquide', label: 'Extraction liquide-liquide' },
                        { value: 'charbon-actif', label: 'Adsorption charbon actif' },
                        { value: 'filtration-membranaire', label: 'Filtration membranaire' }
                    ]
                },
                { id: 'temperaturePurification', label: 'Température (°C)', icon: '🌡️', type: 'number', min: -80, max: 300, step: 0.5, unit: '°C' },
                { id: 'dureePurification', label: 'Durée (minutes)', icon: '⏱️', type: 'number', min: 1, max: 1440, unit: 'min' },
                { id: 'solvantUtilise', label: 'Solvant utilisé', icon: '🧪', type: 'text', placeholder: 'Éthanol, pentane...' }
            ]
        }
    ]
}

// ============================================================================
// EXTRACTION PIPELINE (Concentrés) - CDC
// ============================================================================
export const EXTRACTION_PIPELINE_CONFIG = {
    type: 'extraction',
    title: '⚗️ Pipeline Extraction',
    description: 'Extraction de cannabinoïdes et terpènes',

    intervalTypes: [
        { value: 'seconde', label: 'Secondes', icon: '⏱️', maxCells: 600 },
        { value: 'minute', label: 'Minutes', icon: '⏱️', maxCells: 120 },
        { value: 'heure', label: 'Heures', icon: '🕐', maxCells: 24 }
    ],

    sidebarContent: [
        {
            id: 'methode-extraction',
            label: 'MÉTHODE D\'EXTRACTION',
            icon: '⚗️',
            items: [
                {
                    id: 'methodeExtraction',
                    label: 'Technique d\'extraction',
                    icon: '⚗️',
                    type: 'select',
                    options: [
                        { value: 'ethanol-eho', label: 'Extraction à l\'éthanol (EHO)' },
                        { value: 'isopropanol-ipa', label: 'Extraction IPA (alcool isopropylique)' },
                        { value: 'acetone-aho', label: 'Extraction à l\'acétone (AHO)' },
                        { value: 'butane-bho', label: 'Extraction au butane (BHO)' },
                        { value: 'isobutane-iho', label: 'Extraction à l\'isobutane (IHO)' },
                        { value: 'propane-pho', label: 'Extraction au propane (PHO)' },
                        { value: 'hexane-hho', label: 'Extraction à l\'hexane (HHO)' },
                        { value: 'huile-vegetale', label: 'Extraction huiles végétales (coco, olive)' },
                        { value: 'co2-supercritique', label: 'Extraction CO₂ supercritique' },
                        { value: 'rosin-chaud', label: 'Pressage à chaud (Rosin)' },
                        { value: 'rosin-froid', label: 'Pressage à froid' },
                        { value: 'ultrasons-uae', label: 'Extraction par ultrasons (UAE)' },
                        { value: 'micro-ondes-mae', label: 'Extraction assistée micro-ondes (MAE)' },
                        { value: 'tensioactifs', label: 'Extraction avec tensioactifs (Tween 20)' },
                        { value: 'autre', label: 'Autre méthode' }
                    ]
                },
                { id: 'temperatureExtraction', label: 'Température (°C)', icon: '🌡️', type: 'number', min: -80, max: 300, step: 0.5, unit: '°C' },
                { id: 'pressionExtraction', label: 'Pression (bar)', icon: '💪', type: 'number', min: 0, max: 500, step: 1, unit: 'bar' },
                { id: 'dureeExtraction', label: 'Durée (minutes)', icon: '⏱️', type: 'number', min: 1, max: 1440, unit: 'min' },
                { id: 'rendementExtraction', label: 'Rendement (%)', icon: '📊', type: 'number', min: 0, max: 100, step: 0.1, unit: '%' }
            ]
        }
    ]
}

// ============================================================================
// RECIPE PIPELINE (Edibles) - CDC
// ============================================================================
export const RECIPE_PIPELINE_CONFIG = {
    type: 'recipe',
    title: '🍪 Pipeline Recette',
    description: 'Préparation de comestibles au cannabis',

    intervalTypes: [
        { value: 'seconde', label: 'Secondes', icon: '⏱️', maxCells: 300 },
        { value: 'minute', label: 'Minutes', icon: '⏱️', maxCells: 180 },
        { value: 'heure', label: 'Heures', icon: '🕐', maxCells: 12 }
    ],

    phases: [
        { id: 'preparation', label: '🔪 Préparation ingrédients', duration: 15 },
        { id: 'decarboxylation', label: '🔥 Décarboxylation', duration: 40 },
        { id: 'infusion', label: '🧈 Infusion/Mélange', duration: 60 },
        { id: 'cuisson', label: '🍳 Cuisson', duration: 30 },
        { id: 'refroidissement', label: '❄️ Refroidissement', duration: 120 },
        { id: 'conservation', label: '📦 Conservation', duration: 1440 }
    ],

    sidebarContent: [
        {
            id: 'ingredients',
            label: 'INGRÉDIENTS',
            icon: '🥘',
            items: [
                {
                    id: 'typeIngredient',
                    label: 'Type d\'ingrédient',
                    icon: '🌿',
                    type: 'select',
                    options: [
                        { value: 'cannabique', label: 'Ingrédient cannabique' },
                        { value: 'standard', label: 'Ingrédient standard' }
                    ]
                },
                { id: 'nomIngredient', label: 'Nom ingrédient', icon: '🏷️', type: 'text', placeholder: 'Farine, beurre, fleurs...' },
                { id: 'quantiteIngredient', label: 'Quantité', icon: '⚖️', type: 'number', min: 0, max: 10000, step: 0.1 },
                {
                    id: 'uniteIngredient', label: 'Unité', icon: '📏', type: 'select', options: [
                        { value: 'g', label: 'Grammes (g)' },
                        { value: 'ml', label: 'Millilitres (ml)' },
                        { value: 'L', label: 'Litres (L)' },
                        { value: 'pcs', label: 'Pièces' },
                        { value: 'cuillere-cafe', label: 'Cuillère à café' },
                        { value: 'cuillere-soupe', label: 'Cuillère à soupe' }
                    ]
                }
            ]
        },
        {
            id: 'etapes',
            label: 'ÉTAPES DE PRÉPARATION',
            icon: '📝',
            items: [
                {
                    id: 'actionPreparation',
                    label: 'Action',
                    icon: '👨‍🍳',
                    type: 'select',
                    options: [
                        { value: 'hacher', label: 'Hacher / Broyer' },
                        { value: 'melanger', label: 'Mélanger' },
                        { value: 'chauffer', label: 'Chauffer' },
                        { value: 'cuire-four', label: 'Cuire au four' },
                        { value: 'cuire-poele', label: 'Cuire à la poêle' },
                        { value: 'infuser', label: 'Infuser' },
                        { value: 'decarboxyler', label: 'Décarboxyler' },
                        { value: 'refroidir', label: 'Refroidir' },
                        { value: 'filtrer', label: 'Filtrer' },
                        { value: 'emulsionner', label: 'Émulsionner' },
                        { value: 'fouetter', label: 'Fouetter' },
                        { value: 'repos', label: 'Laisser reposer' }
                    ]
                },
                { id: 'temperaturePreparation', label: 'Température (°C)', icon: '🌡️', type: 'number', min: -20, max: 300, step: 1, unit: '°C' },
                { id: 'dureeEtape', label: 'Durée (minutes)', icon: '⏱️', type: 'number', min: 0, max: 480, unit: 'min' },
                { id: 'commentaireEtape', label: 'Commentaire', icon: '📝', type: 'text', placeholder: 'Détails de l\'étape...' }
            ]
        }
    ]
}

// ============================================================================
// CONFIGURATION MAPPER - Récupère la config selon le type
// ============================================================================
export const getPipelineConfig = (type) => {
    const configs = {
        culture: CULTURE_PIPELINE_CONFIG,
        curing: CURING_PIPELINE_CONFIG,
        separation: SEPARATION_PIPELINE_CONFIG,
        purification: PURIFICATION_PIPELINE_CONFIG,
        extraction: EXTRACTION_PIPELINE_CONFIG,
        recipe: RECIPE_PIPELINE_CONFIG
    }

    return configs[type] || CULTURE_PIPELINE_CONFIG
}
