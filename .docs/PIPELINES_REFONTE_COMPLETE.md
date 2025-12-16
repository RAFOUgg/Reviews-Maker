# 🔄 REFONTE COMPLÈTE SYSTÈME PIPELINES - CDC Conforme

**Date:** 15 décembre 2025  
**Statut:** Architecture - À implémenter  
**Priorité:** 🔴 CRITIQUE - Cœur métier

---

## ❌ Problèmes actuels

### PipelineGitHubGrid existant
- ✅ Visuel GitHub-style correct
- ✅ Phases/jours/semaines/mois
- ❌ **Données limitées:** uniquement température, humidité, contenant, emballage
- ❌ **Pas de modification des notes:** visuel/odeurs/goûts ne peuvent pas évoluer
- ❌ **Pas spécifique par produit:** même composant pour tout
- ❌ **Pipelines manquants:** séparation, extraction, purification, recette

---

## ✅ Architecture cible CDC

### Concept central
> **"Chaque infos est définissable, et modifiable à un moment de la PipeLine"**

Chaque case de la timeline doit pouvoir contenir:
1. **Données environnement** (température, humidité, lumière, CO2...)
2. **Modifications des notes** (visuel/odeurs/goûts évoluent dans le temps)
3. **Actions/événements** (taille, arrosage, engraissage, récolte...)
4. **Notes custom** (commentaire 500 caractères)

### Structure de données unifiée

```typescript
interface PipelineCell {
  index: number; // Position dans la timeline
  timestamp?: Date; // Date réelle (optionnel)
  
  // Environnement
  environment?: {
    temperature?: number; // °C
    humidity?: number; // %
    co2?: number; // ppm
    light?: {
      type?: string; // LED, HPS, Natural
      spectrum?: string; // Full, Blue, Red
      distance?: number; // cm
      power?: number; // W
      duration?: number; // h/jour
      ppfd?: number; // µmol/m²/s
      dli?: number; // mol/m²/jour
    };
    ventilation?: {
      type?: string;
      speed?: string; // low, medium, high
    };
  };
  
  // Substrat & Irrigation (Culture)
  substrate?: {
    type?: string; // Hydro, Bio, Organique
    volume?: number; // L
    composition?: Array<{
      ingredient: string;
      percentage: number;
      brand?: string;
    }>;
  };
  
  irrigation?: {
    type?: string; // Goutte à goutte, manuel
    frequency?: string; // 2x/jour
    volume?: number; // L
    ph?: number;
    ec?: number; // mS/cm
  };
  
  // Fertilisation
  fertilizers?: Array<{
    type: string; // bio, chimique
    brand?: string;
    product?: string;
    dosage?: string; // g/L ou ml/L
    npk?: string; // 10-10-10
    notes?: string;
  }>;
  
  // Palissage & Actions
  training?: {
    methods?: string[]; // LST, HST, SCROG, SOG
    actions?: string; // Commentaire décrivant manipulation
  };
  
  // Morphologie plante (évolution)
  morphology?: {
    height?: number; // cm
    volume?: number; // L
    weight?: number; // g
    branches?: number;
    leaves?: number;
    buds?: number;
  };
  
  // 🔥 CRUCIAL: Modification des notes qualitatives
  reviewEvolution?: {
    visual?: {
      color?: number; // /10
      density?: number;
      trichomes?: number;
      pistils?: number;
      trimming?: number;
    };
    aromas?: {
      intensity?: number;
      dominant?: string[]; // Max 7
      secondary?: string[];
      fidelity?: number; // Fidélité cultivar
    };
    tastes?: {
      intensity?: number;
      aggressiveness?: number;
      dryPuff?: string[];
      inhalation?: string[];
      exhalation?: string[];
    };
    effects?: {
      onset?: number; // Rapidité montée /10
      intensity?: number;
      effects?: string[]; // Max 8
      duration?: string;
    };
  };
  
  // Conteneur & Stockage (Curing)
  storage?: {
    containerType?: string; // Verre, plastique, air libre
    packaging?: string; // Cellophane, papier, aluminium
    opacity?: string; // Opaque, transparent
    volumeOccupied?: number; // L/mL
    curingType?: string; // cold (<5°C), warm (>5°C)
  };
  
  // Process Hash/Concentré
  separation?: {
    method?: string; // Manuel, tamisage sec, eau/glace
    temperature?: number;
    passes?: number;
    meshSizes?: number[]; // µm
    sourceMaterial?: string; // Trim, buds, sugar leaves
    sourceQuality?: number; // /10
    yield?: number; // %
    duration?: number; // minutes
  };
  
  extraction?: {
    method?: string; // EHO, BHO, Rosin, PHO, etc.
    temperature?: number;
    pressure?: number; // PSI
    duration?: number; // minutes
    solvent?: string;
    solventVolume?: number; // mL
    yield?: number; // %
  };
  
  purification?: {
    method?: string; // Winterisation, Chromatographie, etc.
    temperature?: number;
    duration?: number;
    solvent?: string;
    steps?: string; // Description
  };
  
  // Notes libres
  notes?: string; // Max 500 caractères
  
  // Événements
  events?: Array<{
    type: string; // harvest, trim, transplant, pruning
    description?: string;
    timestamp?: Date;
  }>;
}
```

---

## 📦 Pipelines par type de produit

### 🌿 A. FLEURS - 2 Pipelines

#### 1. Pipeline Culture (GLOBAL)
**Intervalles:** `phases` (12 prédéfinies)  
**Données par phase:**
- Environment (temp, humidité, lumière, CO2, ventilation)
- Substrat & composition
- Irrigation (type, fréquence, volume, pH, EC)
- Engrais (type, marque, dosage, NPK)
- Palissage (méthodes LST/HST/SCROG)
- Morphologie (taille, volume, poids, branches)
- **Évolution notes visuelles** (densité, trichomes, pistils)
- Notes & événements

#### 2. Pipeline Curing
**Intervalles:** `s, m, h, days, weeks, months`  
**Données par période:**
- Environment (température, humidité)
- Storage (contenant, emballage, opacité, volume)
- **Évolution COMPLÈTE:** visuel, odeurs, goûts, effets
- Notes

---

### 🪨 B. HASH - 3 Pipelines

#### 1. Pipeline Séparation
**Intervalles:** `s, m, h`  
**Données:**
- Méthode (manuel, tamisage sec, eau/glace, autre)
- Température eau (si eau/glace)
- Nombre de passes
- Mailles utilisées (µm)
- Matière première (trim, buds, sugar leaves, autre)
- Qualité matière première (/10)
- Rendement (%)
- Durée totale
- Notes

#### 2. Pipeline Purification
**Méthodes disponibles:**
- Chromatographie sur colonne
- Flash Chromatography
- HPLC, GC, TLC
- Winterisation
- Décarboxylation
- Fractionnement (température/solubilité)
- Filtration, Centrifugation, Décantation
- Séchage sous vide
- Recristallisation, Sublimation
- Extraction liquide-liquide
- Adsorption charbon actif
- Filtration membranaire

**Données par méthode:**
- Température
- Durée
- Solvant (type, volume)
- Pression (si applicable)
- Paramètres spécifiques
- Notes

#### 3. Pipeline Curing
Identique Fleurs

---

### 💎 C. CONCENTRÉS - 3 Pipelines

#### 1. Pipeline Extraction
**Intervalles:** `s, m, h`  
**Méthodes disponibles:**
- Extraction éthanol (EHO)
- Extraction alcool isopropylique (IPA)
- Extraction acétone (AHO)
- Extraction butane (BHO)
- Extraction isobutane (IHO)
- Extraction propane (PHO)
- Extraction hexane (HHO)
- Extraction huiles végétales (coco, olive)
- Extraction CO₂ supercritique
- Pressage à chaud (Rosin)
- Pressage à froid
- Extraction ultrasons (UAE)
- Extraction micro-ondes (MAE)
- Extraction tensioactifs (Tween 20)
- Autre

**Données par étape:**
- Température
- Pression (PSI)
- Durée
- Solvant (type, volume)
- Matière première
- Rendement (%)
- Notes

#### 2. Pipeline Purification
Identique Hash

#### 3. Pipeline Curing
Identique Fleurs/Hash

---

### 🍪 D. COMESTIBLES - 1 Pipeline

#### Pipeline Recette
**Structure différente:** Pas de timeline, mais séquence ingrédients → actions

**Données:**
```typescript
interface RecipePipeline {
  ingredients: Array<{
    id: string;
    type: 'standard' | 'cannabis'; // Différencier produit normal vs cannabinique
    name: string;
    quantity: number;
    unit: string; // g, ml, pcs, tsp, tbsp
    brand?: string;
    notes?: string;
  }>;
  
  protocol: Array<{
    id: string;
    order: number;
    action: string; // Prédéfini: mixer, chauffer, infuser, cuire, refroidir, etc.
    ingredientIds: string[]; // Ingrédients concernés
    temperature?: number;
    duration?: number; // minutes
    instructions?: string;
  }>;
}
```

---

## 🛠️ Implémentation technique

### Architecture composants

```
components/
└── pipeline/
    ├── PipelineCore.jsx                    # Composant base timeline GitHub-style
    ├── PipelineCellEditor.jsx              # Modal édition case (tous types)
    │
    ├── flower/
    │   ├── CulturePipeline.jsx             # Pipeline culture fleurs (phases)
    │   └── CuringPipeline.jsx              # Pipeline curing fleurs
    │
    ├── hash/
    │   ├── SeparationPipeline.jsx          # Pipeline séparation
    │   ├── PurificationPipeline.jsx        # Pipeline purification
    │   └── CuringPipeline.jsx              # Pipeline curing hash
    │
    ├── concentrate/
    │   ├── ExtractionPipeline.jsx          # Pipeline extraction
    │   ├── PurificationPipeline.jsx        # Pipeline purification
    │   └── CuringPipeline.jsx              # Pipeline curing concentré
    │
    └── edible/
        └── RecipePipeline.jsx              # Pipeline recette (structure différente)
```

### PipelineCore - Composant réutilisable

```jsx
/**
 * PipelineCore - Timeline universelle GitHub-style
 * Gère affichage grille + interactions
 * Délègue contenu cellule à chaque pipeline spécifique
 */
export default function PipelineCore({
  type, // 'culture' | 'curing' | 'separation' | 'extraction' | 'purification' | 'recipe'
  productType, // 'flower' | 'hash' | 'concentrate' | 'edible'
  intervals, // Configuration trame (phases, days, weeks, etc.)
  cells, // Données des cellules
  onCellEdit, // Callback édition cellule
  fieldSchema, // Schéma des champs éditables (spécifique au type)
  renderCell, // Fonction custom pour rendu cellule
  showEvolutionTracking = false // Si true, affiche graphiques évolution notes
}) {
  // ...
}
```

### PipelineCellEditor - Modal universel

```jsx
/**
 * Modal édition cellule - S'adapte selon le schéma fourni
 */
export default function PipelineCellEditor({
  cellIndex,
  cellData,
  fieldSchema, // Définition des champs disponibles
  onSave,
  onClose,
  productType,
  pipelineType
}) {
  // Rendu dynamique des champs selon schema
  // Sections: Environment, Substrate, Irrigation, Fertilizers, etc.
  // Section spéciale: reviewEvolution (notes visuelles/odeurs/goûts)
}
```

---

## 🎯 Priorités d'implémentation

### Phase 1 - Core refonte (2-3 jours)
1. ✅ PipelineCore - Timeline universelle
2. ✅ PipelineCellEditor - Modal dynamique
3. ✅ Structure données unifiée (TypeScript interfaces)

### Phase 2 - Fleurs (2 jours)
4. ✅ CulturePipeline - 12 phases avec tous champs
5. ✅ CuringPipeline - Avec évolution notes

### Phase 3 - Hash (2 jours)
6. ✅ SeparationPipeline
7. ✅ PurificationPipeline (méthodes + paramètres)
8. ✅ CuringPipeline Hash

### Phase 4 - Concentrés (2 jours)
9. ✅ ExtractionPipeline (toutes méthodes)
10. ✅ PurificationPipeline Concentré
11. ✅ CuringPipeline Concentré

### Phase 5 - Comestibles (1 jour)
12. ✅ RecipePipeline (ingrédients + protocole)

### Phase 6 - Export GIF (1 jour)
13. ✅ Animation évolution notes (graphiques)
14. ✅ Export GIF timeline complète

---

## 📊 Export GIF - Évolution visuelle

Lors de l'export GIF d'un pipeline:
1. **Frame par frame:** chaque case = 1 frame
2. **Graphiques overlay:**
   - Courbe température
   - Courbe humidité
   - **Évolution notes visuelles** (ligne temps)
   - **Évolution odeurs** (intensité)
   - **Évolution goûts**
3. **Annotations:** événements importants sur timeline

---

## 🔒 Restrictions par compte

### Amateur
- ❌ Pas accès Pipelines Culture/Extraction/Séparation/Purification
- ✅ Accès Pipeline Curing uniquement

### Influenceur
- ❌ Pas accès Pipelines Culture/Extraction/Séparation/Purification
- ✅ Accès Pipeline Curing
- ✅ Export GIF Pipeline Curing

### Producteur
- ✅ Accès TOUS les Pipelines
- ✅ Configuration complète
- ✅ Export GIF tous Pipelines
- ✅ Exports CSV/JSON données brutes pipelines

---

## 📝 Notes importantes

### Points clés CDC
- ✅ "Review en 3D: plan + temps" → Timeline + évolution données
- ✅ "Chaque infos modifiable à un moment" → Toutes données éditables par case
- ✅ "Tracabilité évolutive" → Notes peuvent évoluer dans le temps
- ✅ GitHub-style visuel conservé
- ✅ Phases prédéfinies pour culture (12 phases)
- ✅ Intervalles flexibles (s, m, h, j, sem, mois, phases)

### Tests à réaliser
1. Créer culture fleurs sur 150 jours
2. Modifier notes visuelles phase par phase
3. Tracer évolution odeurs semaine par semaine en curing
4. Export GIF avec évolution graphiques
5. Extraction concentré BHO avec paramètres complets
6. Purification multi-étapes (winterisation + chromatographie)
7. Recette comestible avec 20 ingrédients

---

**Prochaine étape:** Implémenter PipelineCore + Structure données
