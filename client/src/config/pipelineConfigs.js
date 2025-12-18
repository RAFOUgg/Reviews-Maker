/**
 * CONFIGURATION CENTRALE DES PIPELINES - CDC COMPLIANT
 * 
 * Toutes les pipelines (Culture, Curing, Séparation, Extraction, Recette)
 * utilisent le même composant UnifiedPipeline avec des configurations différentes
 * 
 * Architecture:
 * - timelineConfig: Configuration de la timeline (type d'intervalles, phases, etc.)
 * - sidebarContent: Données disponibles organisées par sections
 * - generalFields: Champs de configuration générale (dates, mode, etc.)
 */

import { CULTURE_VALUES } from '../data/formValues'

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
                    options: [
                        { value: 'indoor', label: 'Indoor (intérieur)' },
                        { value: 'outdoor', label: 'Outdoor (extérieur)' },
                        { value: 'greenhouse', label: 'Greenhouse / Serre chauffée' },
                        { value: 'greenhouse-froide', label: 'Greenhouse froide' },
                        { value: 'greenhouse-lumiere', label: 'Greenhouse avec lumière' },
                        { value: 'no-till-indoor', label: 'No-till indoor' },
                        { value: 'no-till-outdoor', label: 'No-till outdoor' },
                        { value: 'container', label: 'Culture en container' },
                        { value: 'verticale', label: 'Culture verticale' },
                        { value: 'mixte', label: 'Culture mixte' }
                    ]
                },
                { 
                    id: 'typeEspace', 
                    label: "Type d'espace", 
                    icon: '📦', 
                    type: 'select',
                    options: [
                        { value: 'armoire', label: 'Armoire' },
                        { value: 'tente', label: 'Tente de culture' },
                        { value: 'serre', label: 'Serre' },
                        { value: 'exterieur', label: 'Extérieur plein champ' },
                        { value: 'piece-dediee', label: 'Pièce dédiée' },
                        { value: 'container', label: 'Container maritime' },
                        { value: 'souterrain', label: 'Souterrain' },
                        { value: 'autre', label: 'Autre' }
                    ]
                },
                { id: 'dimensionsL', label: 'Longueur (cm)', icon: '📏', type: 'number', min: 1, max: 10000, unit: 'cm' },
                { id: 'dimensionsl', label: 'Largeur (cm)', icon: '📏', type: 'number', min: 1, max: 10000, unit: 'cm' },
                { id: 'dimensionsH', label: 'Hauteur (cm)', icon: '📏', type: 'number', min: 1, max: 1000, unit: 'cm' },
                { id: 'surfaceSol', label: 'Surface au sol (m²)', icon: '📐', type: 'number', min: 0.01, max: 10000, step: 0.01, unit: 'm²' },
                { id: 'volumeTotal', label: 'Volume total (m³)', icon: '📦', type: 'number', min: 0.01, max: 100000, step: 0.01, unit: 'm³' },
                { 
                    id: 'techniquePropagation', 
                    label: 'Technique de propagation', 
                    icon: '🌰', 
                    type: 'select',
                    options: [
                        { value: 'graine', label: 'Graine' },
                        { value: 'clone', label: 'Clone' },
                        { value: 'bouture', label: 'Bouture' },
                        { value: 'sopalin', label: 'Germination sopalin' },
                        { value: 'coton', label: 'Germination coton' },
                        { value: 'jiffy', label: 'Pastille Jiffy' },
                        { value: 'rockwool', label: 'Laine de roche' },
                        { value: 'direct-pot', label: 'Direct en pot' },
                        { value: 'autre', label: 'Autre' }
                    ]
                },
                { id: 'nombrePlantes', label: 'Nombre de plantes', icon: '🌱', type: 'number', min: 1, max: 1000, unit: 'plante(s)' }
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
                    options: [
                        { value: 'terre', label: 'Terre' },
                        { value: 'coco', label: 'Coco' },
                        { value: 'hydro', label: 'Hydroponique' },
                        { value: 'aero', label: 'Aéroponique' },
                        { value: 'aqua', label: 'Aquaponique' },
                        { value: 'bio', label: 'Biologique' },
                        { value: 'organique', label: 'Organique' },
                        { value: 'laine-roche', label: 'Laine de roche' },
                        { value: 'perlite', label: 'Perlite pure' },
                        { value: 'billes-argile', label: 'Billes d\'argile' },
                        { value: 'mixte', label: 'Mélange personnalisé' }
                    ]
                },
                { id: 'volumeSubstrat', label: 'Volume pot/contenant (L)', icon: '📊', type: 'number', min: 0.1, max: 1000, step: 0.1, unit: 'L' },
                { id: 'compositionTerre', label: '% Terre', icon: '🟤', type: 'number', min: 0, max: 100, unit: '%' },
                { id: 'compositionCoco', label: '% Coco', icon: '🟠', type: 'number', min: 0, max: 100, unit: '%' },
                { id: 'compositionPerlite', label: '% Perlite', icon: '⚪', type: 'number', min: 0, max: 100, unit: '%' },
                { id: 'compositionVermiculite', label: '% Vermiculite', icon: '🟡', type: 'number', min: 0, max: 100, unit: '%' },
                { id: 'compositionHumus', label: '% Humus/Compost', icon: '🟫', type: 'number', min: 0, max: 100, unit: '%' },
                { id: 'compositionTourbe', label: '% Tourbe', icon: '🟤', type: 'number', min: 0, max: 100, unit: '%' },
                { id: 'marquesSubstrat', label: 'Marques substrat', icon: '🏷️', type: 'text', placeholder: 'BioBizz, Plagron...' },
                { id: 'phSubstrat', label: 'pH substrat', icon: '🧪', type: 'number', min: 3, max: 10, step: 0.1, unit: 'pH' },
                { id: 'ecSubstrat', label: 'EC substrat (mS/cm)', icon: '⚡', type: 'number', min: 0, max: 10, step: 0.1, unit: 'mS/cm' }
            ]
        },
        {
            id: 'environnement',
            label: 'ENVIRONNEMENT',
            icon: '🌡️',
            items: [
                { id: 'temperatureJour', label: 'Température jour (°C)', icon: '☀️', type: 'number', min: 10, max: 50, step: 0.5, unit: '°C' },
                { id: 'temperatureNuit', label: 'Température nuit (°C)', icon: '🌙', type: 'number', min: 5, max: 40, step: 0.5, unit: '°C' },
                { id: 'humiditeJour', label: 'Humidité jour (%)', icon: '💧', type: 'number', min: 10, max: 100, unit: '%' },
                { id: 'humiditeNuit', label: 'Humidité nuit (%)', icon: '🌙', type: 'number', min: 10, max: 100, unit: '%' },
                { id: 'vpd', label: 'VPD (kPa)', icon: '📊', type: 'number', min: 0.2, max: 2.5, step: 0.05, unit: 'kPa' },
                { id: 'co2', label: 'CO₂ (ppm)', icon: '🫧', type: 'number', min: 200, max: 2000, step: 50, unit: 'ppm' },
                { 
                    id: 'typeVentilation', 
                    label: 'Type de ventilation', 
                    icon: '🌀', 
                    type: 'select',
                    options: [
                        { value: 'extracteur', label: 'Extracteur seul' },
                        { value: 'extracteur-intracteur', label: 'Extracteur + Intracteur' },
                        { value: 'brassage', label: 'Ventilateurs brassage' },
                        { value: 'climatisation', label: 'Climatisation' },
                        { value: 'passive', label: 'Ventilation passive' },
                        { value: 'mecanique-controlee', label: 'VMC double flux' },
                        { value: 'naturelle', label: 'Naturelle (outdoor)' }
                    ]
                },
                { id: 'debitExtraction', label: 'Débit extraction (m³/h)', icon: '💨', type: 'number', min: 10, max: 5000, unit: 'm³/h' },
                { 
                    id: 'frequenceVentilation', 
                    label: 'Fréquence ventilation', 
                    icon: '🔁', 
                    type: 'select',
                    options: [
                        { value: 'continu', label: 'Continu 24h/24' },
                        { value: 'intermittent-15-45', label: 'Intermittent 15min ON / 45min OFF' },
                        { value: 'intermittent-30-30', label: 'Intermittent 30min / 30min' },
                        { value: 'jour-seulement', label: 'Pendant période lumière uniquement' },
                        { value: 'nuit-seulement', label: 'Pendant période nuit uniquement' },
                        { value: 'variable-thermo', label: 'Variable (thermostat)' }
                    ]
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
                    options: [
                        { value: 'led-full', label: 'LED full spectrum' },
                        { value: 'led-blanche', label: 'LED blanche' },
                        { value: 'led-cob', label: 'LED COB' },
                        { value: 'led-quantum', label: 'LED Quantum board' },
                        { value: 'hps', label: 'HPS (sodium haute pression)' },
                        { value: 'mh', label: 'MH (halogénures métalliques)' },
                        { value: 'cmh-lec', label: 'CMH / LEC (céramique)' },
                        { value: 'cfl', label: 'CFL (néons compacts)' },
                        { value: 'soleil', label: 'Soleil naturel' },
                        { value: 'mixte', label: 'Mélange LED + HPS/MH' }
                    ]
                },
                { 
                    id: 'spectreLumiere', 
                    label: 'Spectre lumineux', 
                    icon: '🌈', 
                    type: 'select',
                    options: [
                        { value: 'full-spectrum', label: 'Full spectrum' },
                        { value: 'bleu-croissance', label: 'Bleu (croissance)' },
                        { value: 'rouge-floraison', label: 'Rouge (floraison)' },
                        { value: 'mixte-bleu-rouge', label: 'Mixte bleu/rouge' },
                        { value: '3500k', label: '3500K (blanc chaud)' },
                        { value: '4000k', label: '4000K (blanc neutre)' },
                        { value: '6500k', label: '6500K (blanc froid)' },
                        { value: 'variable', label: 'Variable (contrôle spectre)' }
                    ]
                },
                { id: 'distanceLampePlante', label: 'Distance lampe-plante (cm)', icon: '📏', type: 'number', min: 5, max: 200, unit: 'cm' },
                { id: 'puissanceTotale', label: 'Puissance totale (W)', icon: '⚡', type: 'number', min: 10, max: 10000, unit: 'W' },
                { id: 'dureeEclairage', label: 'Durée éclairage (h/jour)', icon: '⏰', type: 'number', min: 0, max: 24, step: 0.5, unit: 'h' },
                { id: 'dli', label: 'DLI (mol/m²/jour)', icon: '📊', type: 'number', min: 0, max: 100, step: 0.1, unit: 'mol/m²/j' },
                { id: 'ppfd', label: 'PPFD moyen (µmol/m²/s)', icon: '🔆', type: 'number', min: 0, max: 3000, unit: 'µmol/m²/s' },
                { id: 'kelvin', label: 'Température couleur (K)', icon: '🌡️', type: 'number', min: 2000, max: 10000, step: 100, unit: 'K' }
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
                    options: [
                        { value: 'goutte-goutte', label: 'Goutte à goutte' },
                        { value: 'inondation-drainage', label: 'Inondation et drainage' },
                        { value: 'manuel', label: 'Arrosage manuel' },
                        { value: 'subirrigation', label: 'Sub-irrigation (par capillarité)' },
                        { value: 'aspersion', label: 'Aspersion (spray)' },
                        { value: 'dwc', label: 'DWC (Deep Water Culture)' },
                        { value: 'nft', label: 'NFT (Nutrient Film Technique)' },
                        { value: 'aeroponie', label: 'Aéroponie' },
                        { value: 'automatique-timer', label: 'Automatique avec minuteur' }
                    ]
                },
                { id: 'frequenceIrrigation', label: 'Fréquence (fois/jour)', icon: '🔁', type: 'number', min: 0.1, max: 24, step: 0.1, unit: 'x/jour' },
                { id: 'volumeEauParArrosage', label: 'Volume eau par arrosage (L)', icon: '🚰', type: 'number', min: 0.01, max: 1000, step: 0.01, unit: 'L' },
                { id: 'phEau', label: 'pH eau', icon: '🧪', type: 'number', min: 3, max: 10, step: 0.1, unit: 'pH' },
                { id: 'ecEau', label: 'EC eau (mS/cm)', icon: '⚡', type: 'number', min: 0, max: 5, step: 0.1, unit: 'mS/cm' },
                { id: 'tempEau', label: 'Température eau (°C)', icon: '🌡️', type: 'number', min: 10, max: 30, step: 0.5, unit: '°C' }
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
                    options: [
                        { value: 'mineral', label: 'Minéral (chimique)' },
                        { value: 'organique', label: 'Organique' },
                        { value: 'bio', label: 'Biologique certifié' },
                        { value: 'mixte', label: 'Mixte minéral/organique' },
                        { value: 'living-soil', label: 'Living soil (sans engrais)' },
                        { value: 'compost-tea', label: 'Thé de compost' },
                        { value: 'bokashi', label: 'Bokashi' }
                    ]
                },
                { id: 'marqueGamme', label: 'Marque et gamme', icon: '🏷️', type: 'text', placeholder: 'BioBizz, Advanced Nutrients...' },
                { id: 'dosageNPK', label: 'Dosage NPK actuel', icon: '📊', type: 'text', placeholder: 'Ex: 10-5-7' },
                { id: 'dosageEngrais', label: 'Dosage (ml/L ou g/L)', icon: '💧', type: 'number', min: 0, max: 50, step: 0.1, unit: 'ml/L' },
                { id: 'frequenceEngraissage', label: 'Fréquence engraissage', icon: '🔁', type: 'text', placeholder: 'Ex: 1x/2 arrosages' },
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
                    options: [
                        { value: 'scrog', label: 'SCROG (Screen of Green)' },
                        { value: 'sog', label: 'SOG (Sea of Green)' },
                        { value: 'lst', label: 'LST (Low Stress Training)' },
                        { value: 'hst', label: 'HST (High Stress Training)' },
                        { value: 'topping', label: 'Topping (étêtage)' },
                        { value: 'fimming', label: 'FIM (étêtage partiel)' },
                        { value: 'main-lining', label: 'Main-lining (manifold)' },
                        { value: 'super-cropping', label: 'Super-cropping (pliage)' },
                        { value: 'lollipopping', label: 'Lollipopping (défoliation basse)' },
                        { value: 'schwazzing', label: 'Schwazzing (défoliation totale)' },
                        { value: 'aucun', label: 'Aucun palissage' }
                    ]
                },
                { id: 'commentairePalissage', label: 'Commentaire palissage', icon: '📝', type: 'textarea', placeholder: 'Détails des manipulations...' }
            ]
        },
        {
            id: 'morphologie',
            label: 'MORPHOLOGIE PLANTE',
            icon: '🌳',
            items: [
                { id: 'taillePlante', label: 'Taille de la plante (cm)', icon: '📏', type: 'number', min: 1, max: 1000, unit: 'cm' },
                { id: 'volumePlante', label: 'Volume estimé (L)', icon: '📦', type: 'number', min: 0.1, max: 10000, step: 0.1, unit: 'L' },
                { id: 'poidsBrutRecolte', label: 'Poids brut récolte (g)', icon: '⚖️', type: 'number', min: 0, max: 100000, step: 0.1, unit: 'g' },
                { id: 'nombreBranchesPrincipales', label: 'Nombre de branches principales', icon: '🌿', type: 'number', min: 1, max: 100 },
                { id: 'nombreFeuilles', label: 'Nombre de feuilles estimé', icon: '🍃', type: 'number', min: 1, max: 10000 },
                { id: 'nombreBuds', label: 'Nombre de buds/têtes', icon: '🌺', type: 'number', min: 1, max: 1000 }
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
                    options: [
                        { value: 'translucide', label: 'Translucide (immature)' },
                        { value: 'laiteux', label: 'Laiteux (mûr)' },
                        { value: 'ambre-10', label: 'Ambré 10%' },
                        { value: 'ambre-30', label: 'Ambré 30%' },
                        { value: 'ambre-50', label: 'Ambré 50%' },
                        { value: 'ambre-70', label: 'Ambré 70%' },
                        { value: 'ambre-90', label: 'Ambré 90%+' }
                    ]
                },
                { id: 'dateRecolte', label: 'Date de récolte', icon: '📅', type: 'date' },
                { id: 'poidsBrutRecolte', label: 'Poids brut total (g)', icon: '⚖️', type: 'number', min: 0, max: 100000, step: 0.1, unit: 'g' },
                { id: 'poidsNetRecolte', label: 'Poids net après trim (g)', icon: '⚖️', type: 'number', min: 0, max: 100000, step: 0.1, unit: 'g' },
                { id: 'rendement', label: 'Rendement (g/m² ou g/plante)', icon: '📊', type: 'number', min: 0, max: 5000, step: 0.1, unit: 'g' }
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
                { id: 'uniteIngredient', label: 'Unité', icon: '📏', type: 'select', options: [
                    { value: 'g', label: 'Grammes (g)' },
                    { value: 'ml', label: 'Millilitres (ml)' },
                    { value: 'L', label: 'Litres (L)' },
                    { value: 'pcs', label: 'Pièces' },
                    { value: 'cuillere-cafe', label: 'Cuillère à café' },
                    { value: 'cuillere-soupe', label: 'Cuillère à soupe' }
                ]}
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
