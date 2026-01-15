# Système PipeLines - Documentation Technique & Architecture

## 📋 Concept Fondamental

Les **PipeLines** sont des systèmes de documentation structurée permettant de tracer l'évolution d'un produit à travers différentes étapes temporelles. Chaque étape enregistre des données spécifiques pouvant modifier les caractéristiques du produit.

Inspiration: Visualisation GitHub Commits Calendar (grille de cases colorées par intensité)

---

## 🎯 Types de Pipelines

### **1. CULTURE (Fleurs uniquement)**

#### Finalité
Documenter toutes les étapes de culture d'une plante, de la graine à la récolte.

#### Modes Temporels
```
JOURS:
├─ Date début/fin obligatoires
├─ Chaque case = 1 jour (max 365 jours)
├─ Visualisation: Grille 52x7 (Github style)
└─ Granularité: Très détaillée

SEMAINES:
├─ Semaine début obligatoire, fin facultatif
├─ Chaque case = 1 semaine (S1, S2...S52)
├─ Visualisation: Timeline 52 semaines
└─ Granularité: Modérée

PHASES (Prédéfini):
├─ 12 phases fixes (voir ci-dessous)
├─ Chaque case = 1 phase
├─ Visualisation: Timeline 12 phases
└─ Granularité: Moins détaillée
```

#### Phases Prédéfinies Culture
```
Phase 0:  Graine (avant plantation)
Phase 1:  Germination (0-7 jours)
Phase 2:  Plantule (7-14 jours)
Phase 3:  Croissance Début (2-3 semaines)
Phase 4:  Croissance Milieu (3-4 semaines)
Phase 5:  Croissance Fin (4-6 semaines)
Phase 6:  Stretch Début (6-8 semaines)
Phase 7:  Stretch Milieu (8-9 semaines)
Phase 8:  Stretch Fin (9-10 semaines)
Phase 9:  Floraison Début (10-13 semaines)
Phase 10: Floraison Milieu (13-18 semaines)
Phase 11: Floraison Fin / Récolte (18-24 semaines)
```

#### Données par Étape Culture
```json
{
  "stageName": "Croissance J15",
  "stageOrder": 15,
  "timestamp": "2024-12-20T10:00:00Z",
  "duration": 1,
  "measurements": {
    "temperature": 23.5,
    "humidity": 65,
    "plantHeight": 45,
    "plantVolume": 0.8,
    "branches": 8,
    "leaves": 120,
    "buds": 45,
    "waterVolume": 2,
    "lightHours": 18,
    "ppfd": 450,
    "dli": 28.8,
    "notes": "Croissance excellente, pas de problèmes"
  },
  "images": ["url1", "url2"],
  "modifiedSections": {
    "visual_technique": {
      "density": 7.5,
      "color": 6.0
    }
  }
}
```

---

### **2. SÉPARATION (Hash)**

#### Finalité
Documenter le processus de séparation des trichomes.

#### Modes Temporels
```
SECONDES / MINUTES / HEURES:
├─ Modes selon méthode et détail souhaité
├─ Granularité très détaillée pour processus rapides
└─ Utile pour méthodes eau/glace, tamisage
```

#### Données par Étape Séparation
```json
{
  "passNumber": 1,
  "temperature": 5,
  "duration": 15,
  "equipment": "Bubble bags 73µm",
  "observations": "Première passe très productive",
  "intermediateWeight": 38,
  "purityScore": 85,
  "materialLoss": 2
}
```

---

### **3. EXTRACTION (Concentrés)**

#### Finalité
Documenter le processus d'extraction du solvant ou pressage.

#### Paramètres par Étape
```json
{
  "stepNumber": 1,
  "extractionMethod": "BHO",
  "temperature": -78,
  "pressure": null,
  "duration": 20,
  "solventUsed": "Butane",
  "solventAmount": 500,
  "duration": 20,
  "intermediateWeight": 120,
  "observations": "Extraction claire et brillante"
}
```

#### Suivi Rendement
```
Matière première: 1000g @ 20% THC = 200g THC potentiel
Étape 1 (Extraction): 150g extrait brut
Étape 2 (Purification): 140g après winterisation
Étape 3 (Séchage): 135g final
Rendement: 13.5% (de la matière primo)
```

---

### **4. PURIFICATION (Concentrés)**

#### Finalité
Documenter les étapes de purification post-extraction.

#### Méthodes Enchaînables
```
Séquence exemple:
1. Winterisation @ -20°C pendant 12h
2. Filtration (paper filter 1µm)
3. Séchage sous vide @ 40°C, 2h
4. Recristallisation @ -5°C
```

#### Données par Étape Purification
```json
{
  "method": "winterization",
  "order": 1,
  "temperature": -20,
  "duration": 720,
  "solvent": "ethanol",
  "solventVolume": 1000,
  "materialBefore": 150,
  "materialAfter": 142,
  "materialLoss": 5.3,
  "purityBefore": 85,
  "purityAfter": 92.5,
  "observations": "Séparation nette graisses/cannabinoides"
}
```

---

### **5. RECETTE (Comestibles)**

#### Finalité
Documenter les étapes de préparation d'un comestible.

#### Structure Unique (pas temporelle)
Pas de timing strict, mais ordre d'exécution structuré.

#### Données Étape Recette
```json
{
  "order": 1,
  "action": "Chauffer",
  "ingredients": [
    {
      "name": "Beurre",
      "quantity": 100,
      "unit": "g"
    }
  ],
  "duration": 5,
  "temperature": 50,
  "notes": "Beurre fondu, pas bouillant"
}
```

---

### **6. MATURATION/CURING (Tous Produits)**

#### Finalité
Documenter l'évolution du produit pendant son stockage.

#### Modes Temporels
```
SECONDES/MINUTES/HEURES: Pour tests très rapides
JOURS/SEMAINES/MOIS: Standard curing (1 mois - 6 mois typiquement)
```

#### Paramètres Curing
```json
{
  "type": "curing",
  "containerType": "verre",
  "packaging": "sous_vide",
  "opacity": "opaque",
  "temperature": 18,
  "humidity": 62,
  "volumeOccupied": 2.5,
  "stages": [
    {
      "weekNumber": 1,
      "temperature": 20,
      "humidity": 65,
      "observations": "Odeur herbacée forte",
      "modifiedSections": {
        "odors": {
          "intensity": 7.5,
          "notes": ["Herbacée", "Fraîche"]
        },
        "visual": {
          "color": 7.0
        },
        "effects": {
          "intensity": 8.0
        }
      }
    }
  ]
}
```

---

## 🎨 Visualisation Pipeline

### Interface Commune

#### Mode Calendrier (Jours)
```
JANVIER 2024 - CULTURE FLEURS

Dim Lun Mar Mer Jeu Ven Sam
                      [1] [2]
[3] [4] [5] [6] [7] [8] [9]
...
[31]

Légende Couleurs (intensité d'activité):
█ Blanc    = Pas de données
█ Vert clair = Peu d'activité
█ Vert    = Activité normale
█ Vert foncé = Beaucoup d'activité
```

#### Mode Timeline (Semaines)
```
PIPELINE CULTURE - SEMAINES

[S1] [S2] [S3] [S4] [S5] [S6] [S7] [S8] ...
 █   █   █   █   █   █   █   █

Click sur case → Voir détails semaine
```

#### Mode Phases (12 phases)
```
PHASES DE CULTURE:

[Germ] [Plant] [Crois début] [Crois mid] [Crois fin] [Stretch début] ...
  █      █         █           █          █           █

Chaque phase = 1 case
```

### Interaction

**Hover sur Case**
```
Affiche tooltip:
├─ Date/Semaine/Phase
├─ Résumé données
└─ Nombre mesures enregistrées
```

**Click sur Case**
```
Modal détail:
├─ Toutes les mesures
├─ Observations texte
├─ Images si existantes
├─ Modifications des tests
└─ Boutons: Éditer, Supprimer
```

**Ajouter Étape**
```
Click [+] → Modal création nouvelle étape
├─ Date/Timing
├─ Mesures (température, humidité, etc.)
├─ Observations
└─ Inclure modifications tests? [Toggle par section]
```

---

## 📊 Impact des Pipelines sur Review

### Modification Sections Parallèles

Lors de création/édition étape pipeline, option:
```
[✓] Modifier aussi Visuel & Technique
    ├─ Nouvelle photo?
    ├─ Nouvelles notes couleur/densité?
    └─ Nouveaux scores pour cette étape
    
[✓] Modifier aussi Odeurs
    ├─ Évolution aromatique?
    └─ Changement intensité?
    
[✓] Modifier aussi Goûts
    ├─ Changement saveurs?
    └─ Nouvelle intensité?
    
[✓] Modifier aussi Effets
    ├─ Changement profils?
    └─ Nouvelle intensité?
```

### Export Données Pipeline

**CSV Export**
```
Date, Température, Humidité, Notes, Visuel_Score, Odeur_Intensité, ...
2024-12-20, 23.5, 65, "Croissance excellente", 7.5, 6.0, ...
2024-12-21, 23.8, 64, "RAS", 7.5, 6.0, ...
```

**Graphique Évolution**
```
Température au fil du temps:
└─ Courbe ligne (timeline X vs température Y)

Densité buds au fil du temps:
└─ Courbe ligne (timeline X vs densité Y)

Croissance plante (hauteur/volume):
└─ Double courbe (hauteur + volume)
```

---

## 💾 Modèle de Données Pipeline

### Pipeline Principal
```typescript
model Pipeline {
  id: String @id @default(cuid())
  reviewId: String
  review: Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  // Configuration
  type: String
  // "culture" | "separation" | "extraction" | "purification" | "recipe" | "curing"
  
  mode: String
  // "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "phases"
  
  // Timing
  startDate: DateTime?
  endDate: DateTime?
  duration: Int? // en unités selon mode
  
  // Étapes
  stages: PipelineStage[]
  
  // Configuration additionnelle spécifique type
  config: Json
  // Exemple pour Culture:
  // {
  //   "cultivationMode": "indoor",
  //   "spaceType": "tent",
  //   "dimensions": "80x80x160cm",
  //   "substrate": "coco",
  //   "lighting": "LED",
  //   "lightSpectrum": "full",
  //   ...
  // }
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}

model PipelineStage {
  id: String @id @default(cuid())
  pipelineId: String
  pipeline: Pipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  
  // Identification
  stageName: String // "Croissance J15", "Pass 1", "Semaine 3", etc
  stageOrder: Int // 1, 2, 3...
  
  // Timing
  timestamp: DateTime?
  duration: Int? // en unités du pipeline
  dateReference: DateTime? // Pour jours/semaines
  weekNumber: Int? // Pour semaines
  phaseNumber: Int? // Pour phases
  
  // Données de mesure
  measurements: Json
  // Contient toutes mesures numériques spécifiques au type de pipeline
  
  // Observations texte
  notes: String? // max 500 caractères
  
  // Media
  images: String[] // URLs images étape
  
  // Modifications des tests Review
  modifiedSections: Json? // Cf. documentation ci-dessus
  
  // Metadata
  isManual: Boolean @default(true) // Saisi manuellement vs IoT
  dataSource: String? // "manuel" | "iot_device" | "import"
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

---

## 🔗 Routes API

### CRUD Pipeline
```
POST /api/reviews/:reviewId/pipelines
GET /api/reviews/:reviewId/pipelines
GET /api/reviews/:reviewId/pipelines/:pipelineId
PUT /api/reviews/:reviewId/pipelines/:pipelineId
DELETE /api/reviews/:reviewId/pipelines/:pipelineId
```

### CRUD Stages
```
POST /api/pipelines/:pipelineId/stages
GET /api/pipelines/:pipelineId/stages
PUT /api/pipelines/:pipelineId/stages/:stageId
DELETE /api/pipelines/:pipelineId/stages/:stageId
```

### Export
```
GET /api/pipelines/:pipelineId/export?format=csv|json
GET /api/pipelines/:pipelineId/chart?metric=temperature|humidity
```

---

## 🔗 Fichiers Référence

- Frontend Pipelines: `client/src/components/pipelines/`
- Pipeline Visualisation: `client/src/components/pipelines/PipelineCalendar.jsx`
- Backend: `server-new/routes/pipelines.js`
- Schema: `server-new/prisma/schema.prisma` (Pipeline + PipelineStage)

---

## ✅ Checklists Implementation

### Frontend Pipeline
- [ ] Création pipeline (choix type et mode)
- [ ] Affichage calendrier/timeline
- [ ] Interactivité cases (hover, click, ajouter)
- [ ] Modal détail étape
- [ ] Modal création étape
- [ ] Graphiques évolution
- [ ] Export données
- [ ] Responsive design
- [ ] Modification tests parallèles

### Backend Pipeline
- [ ] Modèle Prisma
- [ ] Routes CRUD
- [ ] Validation données
- [ ] Export CSV/JSON
- [ ] Calculs agrégés (moyennes, etc)

