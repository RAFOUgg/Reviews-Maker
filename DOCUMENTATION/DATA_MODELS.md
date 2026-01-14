# 📊 Modèles de Données - Reviews-Maker

## 🗃️ Vue d'Ensemble

Cette documentation détaille tous les modèles de données du système (Prisma, JSON statiques, flux de données).

---

## 🎯 Modèles Prisma (Schema.prisma)

### User Model

```prisma
model User {
  id                String      @id @default(cuid())
  email             String      @unique
  passwordHash      String
  name              String?
  avatar            String?
  tier              Tier        @default(AMATEUR)  // AMATEUR | PRODUCTEUR | INFLUENCEUR
  
  // Profil
  bio               String?
  website           String?
  company           String?
  location          String?
  
  // Données KYC
  kycVerified       Boolean     @default(false)
  kycDocuments      String[]    // URLs des documents
  ageVerified       Boolean     @default(false)
  
  // Relations
  reviews           Review[]
  templates         ExportTemplate[]
  watermarks        Watermark[]
  geneticProjects   GeneticProject[]
  cultivarLibrary   Cultivar[]
  
  // Metadata
  preferences       Json?       // Préférences utilisateur
  stats             UserStats?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

enum Tier {
  AMATEUR      // Accès limité
  PRODUCTEUR   // Accès complet + exports payants
  INFLUENCEUR  // Exports sociaux + galerie publique
}
```

**Champs clés:**
- `tier`: Détermine les accès et fonctionnalités disponibles
- `kycVerified`: Requis pour les exports payants
- `preferences`: Stocke les paramètres utilisateur (thème, langue, etc.)

---

### Review Model

```prisma
model Review {
  id                  String        @id @default(cuid())
  
  // Identité
  name                String        // Nom commercial
  type                ReviewType    // FLOWER | HASH | CONCENTRATE | EDIBLE
  status              ReviewStatus  @default(DRAFT)
  
  // Contenu général
  description         String?
  images              ReviewImage[]
  
  // Données structurées par type
  generalInfo         Json          // Infos communes
  genetics            Json?         // Pour FLOWER
  production          Json?         // For HASH/CONCENTRATE
  recipe              Json?         // Pour EDIBLE
  
  // Sections de données
  visualTechnical     VisualTechnical?
  aromas              AromaSection?
  tastes              TasteSection?
  texture             TextureSection?
  effectsExperience   EffectsExperience?
  
  // Pipelines
  cultivationPipeline CultivationPipeline?
  separationPipeline  SeparationPipeline?
  extractionPipeline  ExtractionPipeline?
  recipePipeline      RecipePipeline?
  curingPipeline      CuringPipeline?
  
  // Exports et partage
  exportConfigs       ExportTemplate[]
  isPublic            Boolean       @default(false)
  publicGalleryEntry  GalleryEntry?
  
  // Metadata
  user                User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId              String
  likes               Int           @default(0)
  comments            Int           @default(0)
  shares              Int           @default(0)
  
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
}

enum ReviewType {
  FLOWER
  HASH
  CONCENTRATE
  EDIBLE
}

enum ReviewStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**Flux de données:**
1. Utilisateur crée une review → `status: DRAFT`
2. Remplit les sections → données stockées dans modèles imbriqués
3. Configure un template d'export → `ExportTemplate` créé
4. Publie → `status: PUBLISHED` et optionnellement `isPublic: true`

---

### Pipeline Models

#### CultivationPipeline

```prisma
model CultivationPipeline {
  id                String    @id @default(cuid())
  review            Review    @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reviewId          String    @unique
  
  // Configuration
  frameType         FrameType   // JOURS | SEMAINES | PHASES | MOIS
  startDate         DateTime
  endDate           DateTime?
  
  // Paramètres généraux
  indoorOutdoor     String      // Indoor/Outdoor/Greenhouse
  cultivationSpace  Json        // { type, dimensions, surface, volume }
  substrat          Json        // { type, volume, composition }
  
  // Conditions environnementales
  environment       Json        // { temp, humidity, co2, ventilation }
  lights            Json        // { type, spectrum, distance, power, photoperiod, dli, ppfd, kelvin }
  watering          Json        // { type, frequency, volume }
  fertilizers       Json[]      // Array de fertilisants
  
  // Manipulation
  trainingMethods   String[]    // SCROG, SOG, Main-Lining, etc.
  morphology        Json        // { height, volume, weight, branches, leaves, buds }
  
  // Récolte
  harvest           Json        // { trichodensity, date, grossWeight, netWeight, yield }
  
  // Timeline d'étapes
  stages            PipelineStage[]
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model PipelineStage {
  id                String    @id @default(cuid())
  pipeline          CultivationPipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  pipelineId        String
  
  // Position dans la timeline
  frameValue        Int           // 1, 2, 3... ou jour/semaine/mois
  frameType         FrameType
  
  // Données de l'étape
  notes             String?       // Max 500 chars
  images            String[]
  measurements      Json          // Données quantitatives
  customFields      Json
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

enum FrameType {
  JOURS
  SEMAINES
  PHASES
  MOIS
  SECONDES
  MINUTES
  HEURES
}
```

**Logique:**
- FrameType détermine la granularité
- Chaque `PipelineStage` représente un point dans le temps
- Support des phases prédéfinies (germination → floraison → curing)

#### CuringPipeline

```prisma
model CuringPipeline {
  id                String    @id @default(cuid())
  review            Review    @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reviewId          String    @unique
  
  // Configuration
  frameType         FrameType
  duration          Int           // en jours/semaines/mois selon frameType
  
  // Paramètres de curing
  curingType        String        // "froid" (<5°C) | "chaud" (>5°C)
  temperature       Float         // °C
  humidity          Float         // %
  containerType     String
  primaryPackaging  String
  containerOpacity  String
  productVolume     Float         // L ou mL
  
  // Étapes de curing
  stages            PipelineStage[]
  
  // Modifications comparées à la review initiale
  modifiedSections  Json          // Quelles sections ont changé
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}
```

---

### Section Models

#### VisualTechnical

```prisma
model VisualTechnical {
  id                String    @id @default(cuid())
  review            Review    @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reviewId          String    @unique
  
  // Scores /10
  color             Int           @db.Tinyint        // Nuancier
  density           Int           @db.Tinyint
  trichomes         Int           @db.Tinyint
  pistils           Int           @db.Tinyint
  manicure          Int           @db.Tinyint
  mold              Int           @db.Tinyint        // 10 = aucune
  seeds             Int           @db.Tinyint        // 10 = aucune
  
  // Metadata
  colorNotes        String?
  observations      String?
  
  createdAt         DateTime      @default(now())
}

model AromaSection {
  id                String        @id @default(cuid())
  review            Review        @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reviewId          String        @unique
  
  // Notes (max 7 chacun)
  dominantNotes     String[]
  secondaryNotes    String[]
  
  // Expérience olfactive
  inhalationPrimary String[]
  inhalationSecondary String[]
  exhalationNotes   String[]
  
  // Intensité
  intensity         Int           @db.Tinyint       // /10
  
  observations      String?
  createdAt         DateTime      @default(now())
}

model TasteSection {
  id                String        @id @default(cuid())
  review            Review        @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reviewId          String        @unique
  
  // Notes (max 7 chacun)
  dominantFlavors   String[]
  secondaryFlavors  String[]
  
  // Tirage
  dryPuff           String[]      // Max 7
  inhalation        String[]
  exhalation        String[]
  
  // Évaluation
  intensity         Int           @db.Tinyint       // /10
  aggressiveness    Int           @db.Tinyint       // /10
  
  observations      String?
  createdAt         DateTime      @default(now())
}

model TextureSection {
  id                String        @id @default(cuid())
  review            Review        @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reviewId          String        @unique
  
  hardness          Int           @db.Tinyint       // /10
  tactileDensity    Int           @db.Tinyint
  elasticity        Int           @db.Tinyint
  stickiness        Int           @db.Tinyint
  
  // Pour concentrés
  friability        Int           @db.Tinyint
  viscosity         Int           @db.Tinyint
  melting           Int           @db.Tinyint       // /10
  residues          Int           @db.Tinyint
  
  observations      String?
  createdAt         DateTime      @default(now())
}

model EffectsExperience {
  id                String        @id @default(cuid())
  review            Review        @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reviewId          String        @unique
  
  // Évaluation
  onset             Int           @db.Tinyint       // /10 - rapidité
  intensity         Int           @db.Tinyint       // /10
  duration          String                          // courte/moyenne/longue
  
  // Profils d'effets (max 8)
  effectProfiles    String[]      // Choix parmi liste
  positiveEffects   String[]
  negativeEffects   String[]
  
  // Consommation
  consumptionMethod String        // Combustion/Vapeur/Infusion
  dosage            String        // "0.5g", "2-3mg"
  durationTime      String        // "HH:MM"
  secondaryEffects  String[]
  
  // Usage
  preferredTime     String        // matin/soir/n'importe quand
  socialContext     String        // seul/social
  medicalUse        String?
  
  observations      String?
  createdAt         DateTime      @default(now())
}
```

---

## 📁 Données JSON Statiques

### aromas.json

```json
{
  "dominant": [
    {
      "id": "fruity",
      "name": "Fruité",
      "description": "Odeurs de fruits",
      "category": "naturel",
      "subtypes": ["berries", "citrus", "tropical", "stone-fruit"]
    },
    {
      "id": "herbal",
      "name": "Herbacé",
      "description": "Notes vertes et végétales",
      "category": "naturel",
      "subtypes": ["pine", "mint", "grass"]
    },
    // ... 10+ entrées
  ],
  "secondary": [
    // Format identique
  ],
  "profiles": {
    "floral": { /* ... */ },
    "woody": { /* ... */ },
    "spicy": { /* ... */ }
  }
}
```

**Utilisation:**
- Frontend: autocomplete/multiselect
- Backend: validation
- Export: affichage des notes

### effects.json

```json
{
  "mental": [
    {
      "id": "relaxing",
      "name": "Relaxant",
      "category": "positif",
      "icon": "🧘"
    },
    {
      "id": "energizing",
      "name": "Énergisant",
      "category": "positif",
      "icon": "⚡"
    },
    // ... 8+ entrées
  ],
  "physical": [
    {
      "id": "pain_relief",
      "name": "Soulagement de la douleur",
      "category": "thérapeutique",
      "icon": "💊"
    }
    // ...
  ],
  "therapeutic": [
    // ...
  ]
}
```

### tastes.json et terpenes.json

Même structure que `aromas.json`, avec variants spécifiques.

---

## 🔀 Flux de Données

### Création d'une Revue (FLOWER)

```
1. Utilisateur crée nouvelle revue
   ├─ Type: FLOWER
   ├─ Tier check: Si AMATEUR, certaines sections désactivées
   └─ Status: DRAFT

2. Section Infos Générales
   ├─ name* (requis)
   ├─ cultivar (select depuis data ou custom)
   ├─ farm
   ├─ type (Indica/Sativa/Hybride)
   └─ images (1-4)

3. Section Génétiques (PRODUCTEUR uniquement)
   ├─ breeder
   ├─ variety (auto-complete)
   ├─ percentages
   └─ genealogy (GeneticProject reference)

4. Pipelines (structure identique)
   ├─ Configure frame (JOURS/SEMAINES/PHASES)
   ├─ Define start/end
   └─ Ajouter étapes

5. Sections évaluation
   ├─ VisualTechnical /10
   ├─ AromaticProfile (notes + intensité)
   ├─ TasteProfile
   ├─ TextureProfile
   └─ EffectsExperience

6. Publication
   ├─ Créer ExportTemplate par défaut
   ├─ isPublic: false par défaut
   └─ Status: PUBLISHED si utilisateur choisit
```

### Flux d'Export

```
1. Utilisateur accède ExportMaker
   └─ Charge review depuis ReviewStore

2. Choix template
   ├─ Prébuilt: Compact/Détaillé/Complète/Influenceur
   └─ Custom (si PRODUCTEUR): Drag & drop setup

3. Configuration visuelle
   ├─ Format: 1:1, 16:9, A4, 9:16
   ├─ Thème: Clair/Sombre
   ├─ Couleurs personnalisées
   ├─ Fonts (si PRODUCTEUR)
   └─ Filigrane (si PRODUCTEUR)

4. Rendu
   ├─ DOM généré dynamiquement
   ├─ html-to-image → canvas
   ├─ jspdf/jszip pour format final
   └─ Pagination si nécessaire (max 9 pages)

5. Export ou partage
   ├─ Téléchargement local
   ├─ Partage réseaux sociaux
   └─ Envoi email
```

---

## 🎛️ Cas d'usage par Tier

### AMATEUR
- ✅ Créer reviews (toutes sections)
- ✅ Pipelines: Lecture uniquement des données
- ✅ Export: Templates prédéfinis uniquement (Compact/Détaillé/Complète)
- ✅ Format export: PNG/JPEG/PDF (qualité standard)
- ❌ Personnalisation avancée
- ❌ Pipelines configurables
- ❌ Exports SVG/CSV/JSON/HTML

### PRODUCTEUR
- ✅ Toutes les fonctionnalités AMATEUR
- ✅ Template Personnalisé + drag & drop
- ✅ Pipelines configurables (ajouter étapes custom)
- ✅ Export haute qualité: 300dpi + SVG/CSV/JSON/HTML
- ✅ Polices personnalisées
- ✅ Filigrane
- ✅ Arbre généalogique (FLOWER)
- ✅ Accès bibliothèque génétiques complète

### INFLUENCEUR
- ✅ Exports haute qualité (PNG/JPEG/SVG/PDF 300dpi)
- ✅ Galerie publique avec système de likes/commentaires
- ✅ Aperçu détaillé et rendu complet
- ✅ Drag & drop configuration
- ❌ Accès limité aux pipelines avancées
- ❌ Exports CSV/JSON/HTML

---

## 🔒 Règles de Validation

### Au niveau Backend (routes)

```javascript
// Validation du tier
if (req.user.tier === 'AMATEUR' && data.includesPipelineEdit) {
  throw new Error('Feature not available for AMATEUR tier');
}

// Validation des données structurées
validateReviewData(reviewType, data);

// File upload validation
if (file.size > MAX_FILE_SIZE) throw new Error('File too large');
if (!ALLOWED_MIMES.includes(file.mimetype)) throw new Error('Invalid file type');

// String length validation
if (data.notes.length > 500) throw new Error('Notes exceed 500 characters');
```

---

## 📈 Scalabilité et Performance

### Indexing Prisma

```prisma
// Recherche rapide par utilisateur
model Review {
  @@index([userId])
  @@index([createdAt])
  @@index([isPublic])
  @@fulltext([name, description])  // Search fulltext
}
```

### Caching Strategy

- Données statiques (`aromas.json`, etc.) → Browser cache + CDN
- Reviews personnelles → Client cache (Zustand)
- Gallery publique → Server-side pagination + lazy load images

---

## 🚀 Évolutions Futures

1. **Tags systématiques** pour reviews (cultivar, farm, region)
2. **Comparaison d'exports** côte à côte
3. **Version history** des reviews (audit trail)
4. **Batch exports** de plusieurs reviews
5. **API webhooks** pour intégrations tierces
