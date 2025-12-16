/**
 * PIPELINE SYSTEM - Types & Interfaces
 * Reviews-Maker MVP - Refonte CDC-compliant
 * 
 * Structures de données pour tous les types de pipelines
 */

// ============================================================================
// TYPES DE BASE
// ============================================================================

export const INTERVAL_TYPES = {
    SECONDS: 'seconds',
    MINUTES: 'minutes',
    HOURS: 'hours',
    DAYS: 'days',
    WEEKS: 'weeks',
    MONTHS: 'months',
    PHASES: 'phases'
};

export const PIPELINE_TYPES = {
    CULTURE: 'culture',           // Fleurs uniquement
    CURING: 'curing',             // Tous sauf comestibles
    SEPARATION: 'separation',     // Hash uniquement
    EXTRACTION: 'extraction',     // Concentrés uniquement
    PURIFICATION: 'purification', // Hash + Concentrés
    RECIPE: 'recipe'              // Comestibles uniquement
};

export const PRODUCT_TYPES = {
    FLOWER: 'flower',
    HASH: 'hash',
    CONCENTRATE: 'concentrate',
    EDIBLE: 'edible'
};

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Cellule de pipeline - Structure universelle
 */
export interface PipelineCell {
    index: number;                // Position dans la timeline
    timestamp?: string;           // Date ISO (optionnel)

    environment?: Environment;    // Données environnement
    substrate?: Substrate;        // Substrat & composition
    irrigation?: Irrigation;      // Système irrigation
    fertilizers?: Fertilizer[];   // Engrais & additifs
    training?: Training;          // Palissage & manipulations
    morphology?: Morphology;      // Morphologie plante

    reviewEvolution?: ReviewEvolution;  // 🔥 CRITIQUE: Évolution notes

    storage?: Storage;            // Conteneur & stockage (curing)
    separation?: Separation;      // Process séparation (hash)
    extraction?: Extraction;      // Process extraction (concentré)
    purification?: Purification;  // Process purification

    notes?: string;               // Notes libres (max 500 car)
    events?: Event[];             // Événements marquants
}

// ============================================================================
// ENVIRONMENT
// ============================================================================

export interface Environment {
    temperature?: number;         // °C
    humidity?: number;            // %
    co2?: number;                 // ppm
    light?: Light;
    ventilation?: Ventilation;
}

export interface Light {
    type?: string;                // LED, HPS, CFL, Natural, Mixte
    spectrum?: string;            // Full, Blue, Red, Custom
    distance?: number;            // cm
    power?: number;               // W
    duration?: number;            // h/jour
    ppfd?: number;                // µmol/m²/s
    dli?: number;                 // mol/m²/jour
    kelvin?: number;              // K
}

export interface Ventilation {
    type?: string;                // Active, Passive
    speed?: string;               // low, medium, high
    frequency?: string;           // Continue, Intermittent
}

// ============================================================================
// SUBSTRATE & IRRIGATION
// ============================================================================

export interface Substrate {
    type?: string;                // Hydro, Bio, Organique, Coco, Soil
    volume?: number;              // L
    composition?: SubstrateComponent[];
}

export interface SubstrateComponent {
    ingredient: string;           // Terre, Coco, Perlite, Vermiculite
    percentage: number;           // %
    brand?: string;               // Marque
}

export interface Irrigation {
    type?: string;                // Goutte à goutte, Inondation, Manuel, DWC
    frequency?: string;           // 2x/jour, 3x/semaine
    volume?: number;              // L par arrosage
    ph?: number;                  // 5.5-7.0
    ec?: number;                  // mS/cm
}

// ============================================================================
// FERTILIZERS
// ============================================================================

export interface Fertilizer {
    type: string;                 // Bio, Chimique, Organique, Mixte
    brand?: string;               // Marque
    product?: string;             // Nom produit
    dosage?: string;              // g/L ou ml/L
    npk?: string;                 // 10-10-10
    frequency?: string;           // Chaque arrosage, 1x/semaine
    notes?: string;
}

// ============================================================================
// TRAINING & MORPHOLOGY
// ============================================================================

export interface Training {
    methods?: string[];           // LST, HST, SCROG, SOG, Topping, Fimming, Lollipopping
    actions?: string;             // Description des manipulations
}

export interface Morphology {
    height?: number;              // cm
    volume?: number;              // L (estimation)
    weight?: number;              // g (poids frais si en cours)
    branches?: number;            // Nombre branches principales
    leaves?: number;              // Nombre feuilles (estimation)
    buds?: number;                // Nombre têtes visibles
}

// ============================================================================
// 🔥 REVIEW EVOLUTION - CRITIQUE
// ============================================================================

export interface ReviewEvolution {
    visual?: VisualEvolution;
    aromas?: AromasEvolution;
    tastes?: TastesEvolution;
    effects?: EffectsEvolution;
}

export interface VisualEvolution {
    color?: number;               // /10
    density?: number;             // /10
    trichomes?: number;           // /10
    pistils?: number;             // /10
    trimming?: number;            // /10 (manucure)
    mold?: number;                // /10 (10 = aucune)
    seeds?: number;               // /10 (10 = aucune)
    colorTransparency?: number;   // /10 (Hash/Concentré)
    visualPurity?: number;        // /10 (Hash/Concentré)
    viscosity?: number;           // /10 (Concentré)
    melting?: number;             // /10 (Hash/Concentré)
    residue?: number;             // /10 (Concentré, 10 = aucun)
}

export interface AromasEvolution {
    intensity?: number;           // /10
    fidelity?: number;            // /10 (Fidélité cultivar)
    dominant?: string[];          // Max 7 arômes
    secondary?: string[];         // Max 7 arômes
}

export interface TastesEvolution {
    intensity?: number;           // /10
    aggressiveness?: number;      // /10 (Piquant)
    dryPuff?: string[];           // Max 7
    inhalation?: string[];        // Max 7
    exhalation?: string[];        // Max 7
    ash?: number;                 // /10 (Qualité cendre - Fleurs)
    smoothness?: number;          // /10 (Douceur - Concentré)
}

export interface EffectsEvolution {
    onset?: number;               // /10 (Rapidité montée)
    intensity?: number;           // /10
    effects?: string[];           // Max 8 effets
    duration?: string;            // 5-15min, 15-30min, 30-60min, 1-2h, 2h+, 4h+, 8h+, 24h+
}

// ============================================================================
// STORAGE (CURING)
// ============================================================================

export interface Storage {
    containerType?: string;       // Verre, Plastique, Air libre, Métal
    packaging?: string;           // Cellophane, Papier cuisson, Aluminium, Paper hash, Sac vide, Congelation, Sous vide
    opacity?: string;             // Opaque, Semi-opaque, Transparent, Ambré
    volumeOccupied?: number;      // L ou mL
    curingType?: string;          // cold (<5°C), warm (>5°C)
}

// ============================================================================
// SEPARATION (HASH)
// ============================================================================

export interface Separation {
    method?: string;              // Manuel, Tamisage sec, Eau/glace, Autre
    temperature?: number;         // °C (si eau/glace)
    passes?: number;              // Nombre passes (si eau/glace)
    meshSizes?: number[];         // Tailles mailles en µm [220, 160, 120, 90, 73, 45, 25]
    sourceMaterial?: string;      // Trim, Buds, Sugar leaves, Autre
    sourceQuality?: number;       // /10
    yield?: number;               // %
    duration?: number;            // minutes
}

// ============================================================================
// EXTRACTION (CONCENTRÉS)
// ============================================================================

export interface Extraction {
    method?: string;              // EHO, IPA, AHO, BHO, IHO, PHO, HHO, Huiles végétales, CO2, Rosin chaud, Rosin froid, UAE, MAE, Tensioactifs, Autre
    temperature?: number;         // °C
    pressure?: number;            // PSI (pour Rosin, CO2)
    duration?: number;            // minutes
    solvent?: string;             // Éthanol, Butane, Propane, CO2, Eau, Aucun (Rosin)
    solventVolume?: number;       // mL
    sourceMaterial?: string;      // Fleurs, Hash, Trim, Kief
    yield?: number;               // %
}

// ============================================================================
// PURIFICATION (HASH + CONCENTRÉS)
// ============================================================================

export interface Purification {
    method?: string;              // Chromatographie colonne, Flash Chromatography, HPLC, GC, TLC, Winterisation, Décarboxylation, Fractionnement temp, Fractionnement solubilité, Filtration, Centrifugation, Décantation, Séchage vide, Recristallisation, Sublimation, Extraction liquide-liquide, Adsorption charbon actif, Filtration membranaire
    temperature?: number;         // °C
    duration?: number;            // minutes
    solvent?: string;             // Type solvant
    solventVolume?: number;       // mL
    pressure?: number;            // Bar/PSI (si applicable)
    steps?: string;               // Description étapes
    yield?: number;               // % rendement après purification
}

// ============================================================================
// EVENTS
// ============================================================================

export interface Event {
    type: string;                 // harvest, trim, transplant, pruning, watering, feeding, training, other
    description?: string;
    timestamp?: string;           // ISO date
}

// ============================================================================
// RECIPE (COMESTIBLES)
// ============================================================================

export interface RecipeIngredient {
    id: string;
    type: 'standard' | 'cannabis'; // Différencier produit normal vs cannabinique
    name: string;
    quantity: number;
    unit: string;                 // g, ml, pcs, tsp, tbsp, cup
    brand?: string;
    thcContent?: number;          // mg THC (si type = cannabis)
    cbdContent?: number;          // mg CBD (si type = cannabis)
    notes?: string;
}

export interface RecipeStep {
    id: string;
    order: number;
    action: string;               // Prédéfini: Mixer, Chauffer, Infuser, Cuire, Refroidir, Mélanger, Fouetter, Repos, Autre
    ingredientIds: string[];      // Ingrédients concernés
    temperature?: number;         // °C
    duration?: number;            // minutes
    instructions?: string;        // Instructions détaillées
}

export interface RecipePipeline {
    ingredients: RecipeIngredient[];
    protocol: RecipeStep[];
    totalPreparationTime?: number; // minutes
    totalCookingTime?: number;     // minutes
    servings?: number;             // Nombre portions
    notes?: string;
}

// ============================================================================
// CONFIGURATION PIPELINE
// ============================================================================

export interface PipelineConfig {
    intervalType: string;         // INTERVAL_TYPES
    startDate?: string;           // ISO date (pour days, weeks)
    endDate?: string;             // ISO date (pour days, weeks)
    duration?: number;            // Nombre unités (pour seconds, minutes, hours, months, phases)
    curingType?: string;          // cold, warm (pour curing)

    // Phases personnalisées (si intervalType = phases et non prédéfini)
    customPhases?: Phase[];
}

export interface Phase {
    id: string;
    name: string;
    icon?: string;
    duration: number;             // Durée estimée en jours
    color?: string;               // Hex color
    order: number;
}

// ============================================================================
// FIELD SCHEMA - Définition champs éditables
// ============================================================================

export interface FieldSchema {
    sections: Section[];
}

export interface Section {
    id: string;
    label: string;
    icon?: string;
    collapsed?: boolean;
    fields: Field[];
}

export interface Field {
    key: string;                  // Clé dans PipelineCell (ex: 'environment.temperature')
    label: string;
    type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'slider' | 'toggle' | 'composition' | 'list';
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;                // °C, %, ppm, cm, L, g, etc.
    options?: string[];           // Pour select/multiselect
    maxItems?: number;            // Pour multiselect/list
    rows?: number;                // Pour textarea
    required?: boolean;
    tooltip?: string;

    // Pour type = 'composition' (ex: substrat)
    compositionFields?: Field[];

    // Pour type = 'list' (ex: fertilizers)
    listItemFields?: Field[];
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    INTERVAL_TYPES,
    PIPELINE_TYPES,
    PRODUCT_TYPES
};
