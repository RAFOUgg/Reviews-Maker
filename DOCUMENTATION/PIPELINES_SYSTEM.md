# 🔀 Système de Pipelines - Reviews-Maker

## 📋 Vue d'Ensemble

Les **pipelines** permettent de documenter temporellement les étapes de production/transformation des produits cannabis. C'est le cœur du système de traçabilité de Reviews-Maker.

---

## 🎯 Types de Pipelines

### 1. **CultivationPipeline** (FLOWER uniquement)

Documente l'ensemble du cycle de culture du plant (germination → récolte).

#### Configuration

```javascript
{
  frameType: "JOURS" | "SEMAINES" | "PHASES" | "MOIS",
  startDate: "2025-10-01",
  endDate: "2026-01-10",
  
  // Mode PHASES (prédéfini)
  phases: [
    { id: 1, name: "Germination", dayRange: "0-7" },
    { id: 2, name: "Plantule", dayRange: "8-21" },
    { id: 3, name: "Croissance début", dayRange: "22-35" },
    { id: 4, name: "Croissance milieu", dayRange: "36-50" },
    { id: 5, name: "Croissance fin", dayRange: "51-70" },
    { id: 6, name: "Stretch début", dayRange: "71-80" },
    { id: 7, name: "Stretch milieu", dayRange: "81-90" },
    { id: 8, name: "Stretch fin", dayRange: "91-100" },
    { id: 9, name: "Floraison début", dayRange: "101-150" },
    { id: 10, name: "Floraison milieu", dayRange: "151-200" },
    { id: 11, name: "Floraison fin", dayRange: "201-240" },
    { id: 12, name: "Curing", dayRange: "241+" }
  ]
}
```

#### Données Saisies par Étape

**[GENERAL]**
```javascript
{
  indoorOutdoor: "Indoor|Outdoor|Greenhouse",
  cultivationSpace: {
    type: "Armoire|Tente|Serre|Extérieur",
    dimensions: { length: 100, width: 80, height: 160, unit: "cm" },
    surfaceArea: 8,  // m²
    volume: 12.8     // m³
  },
  substrat: {
    type: "Hydro|Bio|Organique",
    volume: 40,      // L
    composition: {
      earth: 60,     // %
      coco: 30,
      perlite: 10
    },
    ingredients: [
      { name: "Coco Coir", brand: "FoxFarm", percentage: 30 }
    ]
  }
}
```

**[ENVIRONNEMENT]**
```javascript
{
  propagationTechnique: "Graine|Clone|Bouture|Sopalin",
  irrigation: {
    type: "Goutte à goutte|Inondation|Manuel",
    frequency: 2,       // par jour
    volumePerWatering: 5  // L
  },
  fertilizers: [
    {
      brand: "General Hydroponics",
      gamme: "FloraNutrients",
      type: "Chimique",
      dosage: 1.5,    // g/L
      frequency: "Chaque arrosage",
      schedule: "jours: [3, 6, 9]"  // optionnel
    }
  ],
  lighting: {
    type: "LED|HPS|CFL|Naturel|Mixte",
    spectrum: "Complet|Bleu|Rouge",
    distanceFromPlant: 60,  // cm
    totalPower: 600,        // W
    photoperiod: 18,        // heures par jour
    dli: 17,                // mol/m²/jour
    ppfd: 1000,             // µmol/m²/s
    kelvin: 3500            // K
  },
  environment: {
    tempAverage: 22,        // °C
    humidityAverage: 55,    // %
    co2: 1200,              // ppm
    ventilation: "Extraction active"
  }
}
```

**[PALISSAGE/TRAINING]**
```javascript
{
  trainingMethods: ["SCROG", "Main-Lining"],
  scrogDetails: {
    netHeight: 30,
    meshSize: 5,
    notes: "Net placé à J+35, stretch très contrôlé"
  }
}
```

**[MORPHOLOGIE]**
```javascript
{
  height: 120,           // cm
  volume: 80,            // L estimé
  weight: null,          // avant récolte
  mainBranches: 6,
  leaves: 450,
  buds: 280
}
```

**[RÉCOLTE]**
```javascript
{
  trichodensityAtHarvest: "Ambre 80%", // Translucide|Laiteux|Ambre
  harvestDate: "2026-01-10",
  grossWeight: 850,      // g
  netWeight: 720,        // g après 1er défoliation
  yield: 90              // g/m²
}
```

---

### 2. **SeparationPipeline** (HASH uniquement)

Documente le processus de séparation trichomes → hash.

#### Types de Séparation

```javascript
const separationMethods = [
  {
    name: "Tamisage à sec",
    fields: {
      meshSizes: [120, 100, 73, 45],  // µm
      temperature: null,
      timePerMesh: 30  // minutes
    }
  },
  {
    name: "Eau/Glace",
    fields: {
      numberOfPasses: 3,
      iceWaterTemperature: 3,          // °C
      bagSizes: ["220µm", "160µm", "73µm", "45µm"]
    }
  },
  {
    name: "Manuelle",
    fields: {
      technique: "String",
      estimatedDuration: 120            // minutes
    }
  }
];

// Pipeline de purification possible après séparation
const purificationMethods = [
  "Chromatographie sur colonne",
  "Flash Chromatography",
  "HPLC",
  "Winterisation",
  "Décarboxylation",
  "Fractionnement par température"
];
```

#### Données par Étape

```javascript
{
  rawMaterialQuality: 8,           // /10
  rawMaterialType: "Trim|Buds|Sugar leaves",
  
  separationStep: {
    meshUsed: "120µm",
    temperature: 18,
    duration: 45,                  // minutes
    yieldPercentage: 8.2           // %
  },
  
  purificationSteps: [
    {
      method: "Chromatographie sur colonne",
      solvents: "Hexane|Éthanol",
      temperature: 25,
      duration: 120,
      recovery: 95                 // %
    }
  ]
}
```

---

### 3. **ExtractionPipeline** (CONCENTRATE uniquement)

Documente l'extraction et purification de concentrés.

#### Méthodes d'Extraction

```javascript
const extractionMethods = [
  {
    name: "Extraction à l'éthanol (EHO)",
    fields: {
      solventQuality: "Food-grade|Lab-grade",
      temperature: "Ambient|-20°C|-40°C",
      contactTime: 600,             // secondes
      solventVolume: 500,            // mL
      recoveryMethod: "Rotovap|Vacuum"
    }
  },
  {
    name: "Extraction au butane (BHO)",
    fields: {
      butaneQuality: "N-Butane|Iso-Butane",
      tubeType: "Open|Closed loop",
      temperature: -40,
      pressure: "Atmospheric|Vacuum",
      purgingMethod: "Vacuum oven|Heat"
    }
  },
  {
    name: "Pressage à chaud (Rosin)",
    fields: {
      pressType: "Hydraulic|Pneumatic",
      plateTemperature: 95,          // °C
      plateSize: "3x5",              // pouces
      pressurePsi: 1200,
      pressTime: 120                 // secondes
    }
  },
  {
    name: "CO₂ Supercritique",
    fields: {
      pressure: 1500,                // psi
      temperature: 40,               // °C
      flowRate: 2,                   // kg/h
      extractionTime: 180            // minutes
    }
  }
];
```

#### Données par Étape

```javascript
{
  extractionMethod: "Pressage à chaud",
  
  extractionParameters: {
    inputMaterial: 3.5,              // g
    inputMaterialType: "Fleur séchée",
    inputQuality: 7,                 // /10
    
    pressurePsi: 1200,
    plateTemp: 95,
    pressTime: 120,
    
    outputWeight: 1.05,              // g
    recoveryRate: 30                 // %
  },
  
  purificationSteps: [
    {
      method: "Winterisation",
      solvent: "Éthanol",
      temperature: -20,
      duration: 24,                  // heures
      recoveryWeightLoss: 0.15       // g
    },
    {
      method: "Vacuum purge",
      vacuum: 29,                    // inHg
      temperature: 90,
      duration: 720,                 // minutes
      finalWeight: 0.90              // g
    }
  ]
}
```

---

### 4. **CuringPipeline** (Tous types)

Documente le curing/maturation du produit final.

#### Configuration

```javascript
{
  frameType: "JOURS|SEMAINES|MOIS",
  duration: 30,
  
  curingType: "Froid (<5°C)|Chaud (>5°C)",
  temperature: 3,                    // °C
  humidity: 62,                      // %
  
  containerType: "Bocal verre|Plastique|Sous vide",
  primaryPackaging: "Cellophane|Papier cuisson|Sous vide",
  containerOpacity: "Opaque|Semi-opaque|Transparent|Ambré",
  productVolume: 0.8,                // L
  
  // Notes initiales de la review
  initialAttributes: {
    visualScore: 8.5,
    aromaScore: 7.8,
    tasteScore: 8.2
  }
}
```

#### Données par Étape

```javascript
{
  daysSinceCuringStart: 7,
  
  conditions: {
    temperature: 3.2,
    humidity: 61,
    notes: "Équilibre parfait, aucune condensation"
  },
  
  // Comparaison aux scores initiaux
  modifications: {
    visual: { score: 8.7, notes: "Couleurs plus développées" },
    aroma: { score: 8.1, notes: "Arômes plus complexes" },
    taste: { score: 8.5, notes: "Plus lisse" },
    effects: { score: 8.3, notes: "Plus de body" }
  },
  
  images: ["cure_day7_1.jpg", "cure_day7_2.jpg"]
}
```

---

### 5. **RecipePipeline** (EDIBLE uniquement)

Documente la préparation des comestibles.

#### Structure de Recette

```javascript
{
  recipeType: "Baking|Cooking|Infusion",
  servings: 6,
  
  ingredients: [
    {
      id: "flour-standard",
      type: "standard",
      name: "Farine tout usage",
      quantity: 2,
      unit: "tasses",
      brand: "King Arthur"
    },
    {
      id: "concentrate-custom",
      type: "cannabinoid",
      name: "Concentré Rosin",
      quantity: 7,
      unit: "g",
      cannabinoidContent: { thc: 85, cbd: 2 },
      infusionMethod: "Mélangé directement",
      decarb: { temperature: 110, duration: 30 }  // °C, minutes
    },
    {
      id: "butter-standard",
      type: "standard",
      name: "Beurre",
      quantity: 1,
      unit: "tasse"
    }
  ],
  
  preparationSteps: [
    {
      stepNumber: 1,
      action: "Mélanger sec",
      duration: 5,
      details: "Farine, sucre, sel",
      temperature: null
    },
    {
      stepNumber: 2,
      action: "Chauffer",
      temperature: 65,
      duration: 120,
      details: "Beurre infusé au bain-marie"
    },
    {
      stepNumber: 3,
      action: "Cuire",
      temperature: 180,
      duration: 25,
      details: "Cuire jusqu'à doré"
    }
  ]
}
```

---

## 🎨 Visualisation: GitHub-Style Grid

### Vue Frontend

```
┌─────────────────────────────────────────┐
│ CultivationPipeline Timeline Viewer    │
├─────────────────────────────────────────┤
│                                         │
│  J+0 J+1 J+2 J+3 J+4 J+5 J+6 J+7  ...  │
│  ┌───┬───┬───┬───┬───┬───┬───┬───┐     │
│  │ S │ S │ G │ ▨ │ ▨ │ V │ S │ D │     │
│  │ 1 │ 2 │ R │   │   │   │ 4 │ 5 │     │
│  └───┴───┴───┴───┴───┴───┴───┴───┘     │
│                                         │
│  S = Seminated   G = Germination       │
│  V = Vegetating  D = Data entry        │
│  ▨ = No data                           │
│                                         │
│  Click cell → Edit/View detailed data   │
│  Drag cell → Add image/notes            │
│  Color gradient = Data completeness     │
│                                         │
└─────────────────────────────────────────┘
```

### Composant Frontend (React)

```javascript
// File: client/src/components/pipelines/PipelineGitHubGrid.jsx

import { useCallback, useState } from 'react';
import { useReviewStore } from '@/store/reviewStore';

export default function PipelineGitHubGrid({ pipelineId, frameType }) {
  const { reviews, updatePipeline } = useReviewStore();
  const [selectedCell, setSelectedCell] = useState(null);
  
  const pipeline = reviews.find(r => r.cultivationPipeline?.id === pipelineId);
  const stages = pipeline?.cultivationPipeline?.stages || [];
  
  const getCellColor = (stage) => {
    // Logique: densité de données = intensité de couleur
    const dataPoints = countDataPoints(stage);
    return getColorGradient(dataPoints);
  };
  
  return (
    <div className="pipeline-grid">
      {/* Rendu du grid */}
      {Array.from({ length: daysTotal }).map((_, idx) => (
        <div
          key={idx}
          className={`cell ${getCellColor(stages[idx])}`}
          onClick={() => setSelectedCell(idx)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, idx)}
        >
          <span className="day-label">J+{idx}</span>
        </div>
      ))}
      
      {/* Modal d'édition de cellule */}
      {selectedCell !== null && (
        <PipelineStageEditor
          stage={stages[selectedCell]}
          onSave={(data) => updatePipeline(pipelineId, selectedCell, data)}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
}
```

---

## 🔄 Flux de Données Pipelines

### Création d'une Pipeline

```
1. Utilisateur configure frameType
   ├─ JOURS: Choisir date début/fin
   ├─ SEMAINES: Choisir semaine début + éventuellement fin
   ├─ PHASES: Prédéfini (12 phases standard)
   └─ MOIS: Choisir mois début/fin

2. Generate stages automatiquement
   └─ Créer PipelineStage pour chaque point de temps

3. Ajouter données à chaque stage
   └─ Via modal ou drag & drop

4. Optionnel: Ajouter custom fields par stage
   └─ Stocker dans customFields JSON
```

### Édition d'une Pipeline

```
User click cell → PipelineStageEditor modal
  ├─ Display current stage data
  ├─ Préfill avec données précédentes
  ├─ Permettre drag-drop images
  └─ Save → API PATCH /reviews/:id/pipelines/:pipelineId/stages/:stageId
  
Data validation:
  ├─ String length checks
  ├─ Numeric ranges (temp -50 à 50°C)
  └─ File size validation
```

---

## 💾 Stockage et Persistence

### Base de Données

```sql
-- CultivationPipeline table
CREATE TABLE cultivation_pipeline (
  id CUID PRIMARY KEY,
  reviewId CUID UNIQUE NOT NULL FOREIGN KEY,
  frameType ENUM (JOURS, SEMAINES, PHASES, MOIS),
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  
  -- Données sérialisées en JSON
  indoorOutdoor VARCHAR(50),
  cultivationSpace JSON,
  substrat JSON,
  lighting JSON,
  fertilizers JSON,
  
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP
);

-- PipelineStage table
CREATE TABLE pipeline_stage (
  id CUID PRIMARY KEY,
  pipelineId CUID NOT NULL FOREIGN KEY,
  frameValue INT,
  frameType ENUM,
  
  -- Données de stage
  notes VARCHAR(500),
  images JSON (array of URLs),
  measurements JSON,
  customFields JSON,
  
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Indexing pour recherche rapide
CREATE INDEX idx_pipeline_review ON cultivation_pipeline(reviewId);
CREATE INDEX idx_stage_pipeline ON pipeline_stage(pipelineId, frameValue);
```

---

## 🚀 API Endpoints

### CRUD Pipelines

```javascript
// GET - Récupérer une pipeline
GET /api/reviews/:reviewId/pipelines/cultivation
Response:
{
  "id": "pipeline-123",
  "frameType": "JOURS",
  "stages": [...]
}

// POST - Créer une pipeline
POST /api/reviews/:reviewId/pipelines/cultivation
Body:
{
  "frameType": "JOURS",
  "startDate": "2025-10-01",
  "endDate": "2026-01-10",
  "cultivationSpace": {...}
}

// PATCH - Mettre à jour stage
PATCH /api/reviews/:reviewId/pipelines/cultivation/stages/:stageId
Body:
{
  "notes": "...",
  "measurements": {...}
}

// PUT - Mettre à jour toute pipeline
PUT /api/reviews/:reviewId/pipelines/cultivation
Body: { ... full pipeline data ... }

// DELETE - Supprimer une pipeline
DELETE /api/reviews/:reviewId/pipelines/cultivation
```

### Validation Backend

```javascript
// server-new/routes/reviews.js

router.patch('/:reviewId/pipelines/cultivation/stages/:stageId', 
  authenticate,
  async (req, res) => {
    const { notes, measurements, images } = req.body;
    
    // Validation
    if (notes && notes.length > 500) {
      return res.status(400).json({ error: 'Notes exceed 500 chars' });
    }
    
    if (measurements) {
      if (measurements.temperature < -50 || measurements.temperature > 60) {
        return res.status(400).json({ error: 'Invalid temperature' });
      }
      if (measurements.humidity < 0 || measurements.humidity > 100) {
        return res.status(400).json({ error: 'Invalid humidity' });
      }
    }
    
    // Update
    const stage = await prisma.pipelineStage.update({
      where: { id: stageId },
      data: req.body
    });
    
    res.json(stage);
  }
);
```

---

## 📊 Cas d'Usage: Documentaire Complet d'une Culture

```
Producteur cultive une génétique hybride 60 jours

J+0:
  - Graine germinée, placée en soil
  - Temp: 24°C, Humidité: 70%
  - Éclairage 24/0
  - Photo prise

J+7:
  - Plantule a 2 vraies feuilles
  - Arrosage: 50mL d'eau pure
  - Temp stable
  - Photo prise

J+14 (Stretch début):
  - Changement photoperiode: 18/6
  - Ajouter engrais croissance
  - Palissage commence
  - Hauteur mesurée: 15cm

J+28 (Stretch fin):
  - Changement à 12/12 (floraison)
  - Hauteur finale: 45cm
  - Stretch déjà fait
  - Photos multiples

...

J+60 (Récolte):
  - Trichomes: 80% ambre, 20% translucide
  - Poids brut: 850g
  - Poids après 1er trim: 720g
  - Rendement: 90g/m²
  - Photos finales

Après récolte: CURING PIPELINE commence
  - 30 jours de curing
  - Temp: 3°C, Humidité: 62%
  - Mesures quotidiennes
  - Notes organoleptiques à J+7, J+14, J+30
  - Couleurs s'intensifient, arômes s'améliorent
```

---

## 🎯 Optimisations Futures

1. **Prédiction d'étapes** - IA pour proposer prochaines étapes basées sur données
2. **Comparaison de pipelines** - Visualiser plusieurs cultures côte à côte
3. **Benchmarking** - Comparer ses rendements avec la communauté
4. **Webhooks** - Alertes si températures sortent des paramètres
5. **Export de pipeline** - Télécharger données en CSV/JSON pour analyse
6. **Templates de pipeline** - Sauvegarder configurations réutilisables
7. **Intégration capteurs IoT** - Récupération automatique des données
