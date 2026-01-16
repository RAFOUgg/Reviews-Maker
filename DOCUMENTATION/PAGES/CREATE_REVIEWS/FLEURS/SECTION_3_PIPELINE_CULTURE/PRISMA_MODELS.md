# SECTION 3: PIPELINE CULTURE - Modèles Prisma Complets

## 📚 Intégration Prisma

Cette page détaille les modèles Prisma requis pour implémenter le système SECTION 3 (Pipeline Culture).

> **Note**: S'ajoute aux modèles existants (`User`, `Review`, `ReviewSection`, etc.)

---

## 1️⃣ MODÈLE: CultureSetup (Presets/Setups Réutilisables)

```typescript
// Represents a reusable preset for a culture data group
// Can be used across multiple reviews and stages
model CultureSetup {
  id: String @id @default(cuid())
  
  // Ownership
  userId: String
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Metadata
  name: String // "Setup Indoor LED 3x3"
  description: String?
  icon: String? // emoji or icon name
  
  // Classification
  group: String // "space" | "substrate" | "irrigation" | "nutrition" | "light" | "climate" | "techniques" | "morphology" | "harvest"
  productType: String @default("fleurs")
  
  // Versioning
  version: Int @default(1)
  isActive: Boolean @default(true)
  isTemplate: Boolean @default(false) // Can be shared with community
  tags: String[] @default([])
  
  // Data
  data: Json // Complete group data structure (see section data schema)
  
  // Usage Tracking
  usageCount: Int @default(0)
  usedInReviews: String[] @default([]) // Review IDs
  lastUsedAt: DateTime?
  
  // Ratings & Notes
  personalRating: Int? // 1-5 stars
  personalNotes: String?
  
  // Timestamps
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  // Relations
  pipelineStages: PipelineStage[] @relation("SetupStages")
  
  @@index([userId])
  @@index([group])
  @@index([productType])
}
```

### Exemple Données `CultureSetup.data`

```json
{
  "group": "space",
  "name": "Tente 3x3m LED",
  "cultureMode": "indoor",
  "spaceType": "tent",
  "dimensions": {
    "length": { "value": 3, "unit": "m" },
    "width": { "value": 3, "unit": "m" },
    "height": { "value": 2, "unit": "m" }
  },
  "groundSurface": { "value": 9, "unit": "m²" },
  "totalVolume": { "value": 18, "unit": "m³" },
  "plantingDensity": { "value": 4, "unit": "plant/m²" },
  "totalPlants": 36
}
```

---

## 2️⃣ MODÈLE: Pipeline (Pipeline Principale)

```typescript
// Main pipeline structure for a review
// Tracks culture progression from germination to harvest
model Pipeline {
  id: String @id @default(cuid())
  
  // Review
  reviewId: String @unique
  review: Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  // Type & Mode
  type: String @default("culture") // "culture" | "curing" | "separation" | "extraction" | "recipe"
  mode: String @default("days") // "days" | "weeks" | "phases" | "hours" | "minutes"
  
  // Timing
  startDate: DateTime
  endDate: DateTime?
  estimatedDuration: Int? // in days
  actualDuration: Int?
  
  // Active Setups (IDs of CultureSetup being used)
  activeSetups: String[] @default([])
  
  // Phase Definitions (if mode = "phases")
  phaseDefinitions: Json? // Custom phase names/dates if applicable
  
  // Metadata
  totalEvents: Int @default(0)
  totalPhotos: Int @default(0)
  hasNotifications: Boolean @default(true)
  
  // Relations
  stages: PipelineStage[]
  
  // Timestamps
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  @@index([reviewId])
  @@index([type])
  @@index([mode])
}
```

---

## 3️⃣ MODÈLE: PipelineStage (Étapes Individuelles)

```typescript
// Individual stage/event within a pipeline
// Each day/week/phase has one or more stages
model PipelineStage {
  id: String @id @default(cuid())
  
  // Pipeline
  pipelineId: String
  pipeline: Pipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  
  // Stage Identification
  stageNumber: Int // 1-based index
  intervalType: String // "day" | "week" | "phase"
  intervalLabel: String // "Day 42" | "Week 6" | "Vegetative Phase"
  
  // Timing
  scheduledDate: DateTime
  actualDate: DateTime?
  duration: Int? // in hours (for very granular tracking)
  
  // Data Changes (modifications to CultureSetup groups)
  // Structure: { "group_id": { "field": value } }
  dataChanges: Json?
  
  // Observations & Media
  observations: String? // Free text notes (500 chars max)
  photos: String[] @default([]) // Photo URLs/paths
  
  // Event Classification
  event: String? // "watering" | "fertilizing" | "technique_applied" | "climate_adjusted" | "morphology_measured" | "note"
  
  // Event-Specific Data
  eventData: Json? // Varies by event type
  
  // Link to Setup Used
  usedSetupId: String?
  usedSetup: CultureSetup? @relation("SetupStages", fields: [usedSetupId], references: [id])
  
  // Status
  isCompleted: Boolean @default(false)
  isFlagged: Boolean @default(false) // For anomalies
  flagReason: String?
  
  // Timestamps
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  @@index([pipelineId])
  @@index([intervalType])
  @@index([event])
  @@index([scheduledDate])
}
```

### Exemple `PipelineStage.eventData` par type

#### Type: "watering"
```json
{
  "volumeLiters": 10,
  "phBefore": 6.8,
  "phAfter": null,
  "ecBefore": 0.6,
  "ecAfter": null,
  "temperature": 18.5,
  "runoffPercentage": 10,
  "source": "tap",
  "notes": "Normal watering"
}
```

#### Type: "fertilizing"
```json
{
  "products": [
    {
      "name": "Biobizz Grow",
      "dosage": "2ml/L",
      "appliedWith": "watering",
      "linkedWateringDate": "2024-01-15T10:00:00Z"
    }
  ],
  "totalVolume": 10,
  "concentration": "2ml/L",
  "notes": "Standard feeding"
}
```

#### Type: "technique_applied"
```json
{
  "technique": "main_lining",
  "description": "Topped at node 3, created 2 main stems",
  "expectedRecovery": "3-5 days",
  "severity": "high_stress",
  "photos": ["photo1.jpg", "photo2.jpg"],
  "followUpDate": "2024-01-18"
}
```

#### Type: "climate_adjusted"
```json
{
  "parameter": "temperature",
  "oldValue": 24,
  "newValue": 22,
  "unit": "°C",
  "reason": "Transition to flowering phase",
  "notes": "Adjusted night temp"
}
```

#### Type: "morphology_measured"
```json
{
  "height": { "value": 65, "unit": "cm" },
  "volume": { "value": 180, "unit": "L" },
  "stemThickness": { "value": 2.5, "unit": "cm" },
  "mainBranches": 4,
  "estimatedBuds": 180,
  "leafColor": "deep_green",
  "healthScore": 9.5,
  "notes": "Excellent growth"
}
```

---

## 4️⃣ MODÈLE ÉTENDU: Review (Ajouts pour Pipeline)

```typescript
// Extended Review model to include pipeline
model Review {
  id: String @id @default(cuid())
  userId: String
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Métadonnées
  productType: String // "fleurs" | "hash" | "concentre" | "comestible"
  title: String
  description: String?
  
  // Visibilité
  isPublic: Boolean @default(false)
  isPublished: Boolean @default(false)
  publishedAt: DateTime?
  
  // Contenu Principal
  generalInfo: ReviewGeneralInfo?
  sections: ReviewSection[]
  
  // 🆕 Pipeline Culture
  pipeline: Pipeline?
  
  // Export
  currentTemplate: ExportTemplate?
  lastExportFormat: String?
  lastExportedAt: DateTime?
  exports: ExportRecord[]
  
  // Engagement
  likes: Like[]
  comments: Comment[]
  
  // Status & Lifecycle
  status: String @default("draft") // "draft" | "in_progress" | "completed" | "archived"
  progressPercentage: Int @default(0) // 0-100
  
  // Données
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  deletedAt: DateTime?
}
```

---

## 5️⃣ MODÈLE: ReviewSection (Étapes Évaluatives)

```typescript
// Existing model, kept for reference
model ReviewSection {
  id: String @id @default(cuid())
  reviewId: String
  review: Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  // Section Type
  sectionType: String
  // "visual_technique" | "odors" | "texture" | "tastes" | "effects" | "general_data"
  
  // Scores & Ratings
  scores: Json // {"dimension": 8.5, "another": 7}
  
  // Collections
  notes: String?
  selectedItems: String[] // Multi-select items
  
  // Version Tracking (Important for pipeline changes)
  versionDate: DateTime @default(now())
  linkedPipelineStageId: String? // Link to pipeline stage if measured during culture
  
  updatedAt: DateTime @updatedAt
}
```

---

## 6️⃣ RELATIONS GLOBALES (Diagram)

```
User
├── CultureSetup[] (Presets)
│   ├── name, description
│   ├── group (space, substrate, etc.)
│   └── data (JSON structure)
│
└── Review[]
    ├── Pipeline (1 par review)
    │   ├── stages: PipelineStage[]
    │   ├── mode (days/weeks/phases)
    │   ├── activeSetups (ref CultureSetup[])
    │   └── timeline: scheduledDate → actualDate
    │
    ├── ReviewSection[] (Évaluations)
    │   ├── versionDate (tracking changes)
    │   └── linkedPipelineStageId? (audit trail)
    │
    └── Metadata
        ├── status, progressPercentage
        └── timestamps
```

---

## 🔄 Workflow Prisma

### 1. Créer Nouvelle Review avec Pipeline

```typescript
const review = await prisma.review.create({
  data: {
    userId: "user_123",
    productType: "fleurs",
    title: "GSC Indoor 2024",
    status: "draft",
    pipeline: {
      create: {
        type: "culture",
        mode: "days", // or "weeks" | "phases"
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-03-15"),
        estimatedDuration: 73 // en jours
      }
    }
  },
  include: { pipeline: true }
});
```

### 2. Charger Preset et l'utiliser

```typescript
const preset = await prisma.cultureSetup.findUnique({
  where: { id: "preset_123" }
});

const updatedPipeline = await prisma.pipeline.update({
  where: { reviewId: "review_123" },
  data: {
    activeSetups: {
      push: preset.id
    }
  }
});
```

### 3. Créer une Étape

```typescript
const stage = await prisma.pipelineStage.create({
  data: {
    pipelineId: "pipeline_123",
    stageNumber: 1,
    intervalType: "day",
    intervalLabel: "Day 1",
    scheduledDate: new Date("2024-01-01"),
    event: "watering",
    eventData: {
      volumeLiters: 10,
      phBefore: 6.8,
      temperature: 18.5,
      runoffPercentage: 10
    },
    observations: "Initial watering, plants adjusting well",
    photos: ["photo1.jpg", "photo2.jpg"]
  }
});
```

### 4. Modifier une Étape (ex: enregistrer morphologie observée)

```typescript
const updatedStage = await prisma.pipelineStage.update({
  where: { id: "stage_123" },
  data: {
    isCompleted: true,
    actualDate: new Date(),
    event: "morphology_measured",
    eventData: {
      height: { value: 65, unit: "cm" },
      stemThickness: { value: 2.5, unit: "cm" },
      mainBranches: 4,
      estimatedBuds: 180
    }
  }
});
```

### 5. Tracker Usage d'un Preset

```typescript
const updatedSetup = await prisma.cultureSetup.update({
  where: { id: "preset_123" },
  data: {
    usageCount: {
      increment: 1
    },
    usedInReviews: {
      push: "review_123"
    },
    lastUsedAt: new Date()
  }
});
```

### 6. Query: Récupérer Pipeline Complète

```typescript
const pipelineComplete = await prisma.pipeline.findUnique({
  where: { reviewId: "review_123" },
  include: {
    stages: {
      orderBy: { stageNumber: "asc" },
      include: {
        usedSetup: true
      }
    }
  }
});
```

---

## 🎯 Points d'Intégration API

### Routes Nécessaires

```
// Setups (Presets)
POST   /api/reviews/:reviewId/pipeline/setups
GET    /api/users/me/library/setups
GET    /api/users/me/library/setups?group=space
PUT    /api/library/setups/:setupId
DELETE /api/library/setups/:setupId

// Pipeline
POST   /api/reviews/:reviewId/pipeline
GET    /api/reviews/:reviewId/pipeline
PUT    /api/reviews/:reviewId/pipeline
DELETE /api/reviews/:reviewId/pipeline

// Stages
POST   /api/pipelines/:pipelineId/stages
GET    /api/pipelines/:pipelineId/stages
PUT    /api/pipelines/:pipelineId/stages/:stageId
DELETE /api/pipelines/:pipelineId/stages/:stageId
GET    /api/pipelines/:pipelineId/stages?date=2024-01-15

// Statistics
GET    /api/users/me/statistics/culture
GET    /api/users/me/statistics/setups-usage
```

---

## 📊 Migrations Prisma

```bash
# Après ajout modèles:
npx prisma migrate dev --name add_pipeline_culture

# Ou créer manuellement:
# migration_timestamp_add_pipeline_culture.sql
```

---

## ✅ Checklist Implémentation

- [ ] Créer modèles Prisma
- [ ] Générer types TypeScript (`npm run prisma:generate`)
- [ ] Créer migrations
- [ ] Appliquer migrations (`npm run prisma:migrate`)
- [ ] Tester queries de base
- [ ] Implémenter routes API CRUD
- [ ] Ajouter validation données
- [ ] Créer seed data pour presets courants
- [ ] Intégrer avec UI composants

