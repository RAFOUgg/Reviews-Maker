# Schémas de Données Complets

## 📊 Modèles de Données Principaux

### 1. USER - Entité Utilisateur

```typescript
model User {
  id: String @id @default(cuid())
  email: String @unique
  username: String @unique
  passwordHash: String?
  tier: String @default("amateur") // "amateur" | "producteur" | "influenceur"
  
  // Profil
  profile: UserProfile?
  
  // Authentification OAuth
  oauthProviders: OAuthAccount[]
  
  // KYC
  kycStatus: String @default("pending") // "pending" | "verified" | "rejected"
  kycDocument: String?
  
  // Sessions
  sessions: Session[]
  
  // Ressources
  reviews: Review[]
  templates: ExportTemplate[]
  watermarks: Watermark[]
  cultivars: Cultivar[]
  
  // Metadata
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  lastLogin: DateTime?
  isActive: Boolean @default(true)
}
```

### 2. USER_PROFILE - Profil Utilisateur

```typescript
model UserProfile {
  id: String @id @default(cuid())
  userId: String @unique
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Infos personnelles
  firstName: String?
  lastName: String?
  avatar: String?
  bio: String?
  country: String?
  language: String @default("fr")
  
  // Préférences
  theme: String @default("light") // "light" | "dark"
  emailNotifications: Boolean @default(true)
  publicProfile: Boolean @default(false)
  
  // Infos professionnelles (Producteur/Influenceur)
  companyName: String?
  businessLicense: String?
  farmLocation: String?
  websiteUrl: String?
  
  // Statistiques
  totalReviews: Int @default(0)
  totalExports: Int @default(0)
  totalLikes: Int @default(0)
  totalComments: Int @default(0)
  
  updatedAt: DateTime @updatedAt
}
```

### 3. REVIEW - Review Principale

```typescript
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
  
  // Contenu
  generalInfo: ReviewGeneralInfo?
  sections: ReviewSection[]
  pipelines: Pipeline[]
  
  // Export
  currentTemplate: ExportTemplate?
  lastExportFormat: String?
  lastExportedAt: DateTime?
  exports: ExportRecord[]
  
  // Engagement
  likes: Like[]
  comments: Comment[]
  
  // Données
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  deletedAt: DateTime?
}
```

### 4. REVIEW_GENERAL_INFO - Infos Générales

```typescript
model ReviewGeneralInfo {
  id: String @id @default(cuid())
  reviewId: String @unique
  review: Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  // Champs communs
  commercialName: String
  mainPhoto: String?
  additionalPhotos: String[]
  
  // Spécifique Fleurs
  cultivar: String?
  farm: String?
  type: String? // "indica" | "sativa" | "hybride" | etc
  breeder: String?
  
  // Spécifique Hash
  hashmaker: String?
  lab: String?
  
  // Spécifique Concentré
  extraction: String? // "BHO" | "Rosin" | "CO2" | etc
  
  // Spécifique Comestible
  productType: String?
  manufacturer: String?
  
  additionalData: Json? // Données flexibles supplémentaires
  updatedAt: DateTime @updatedAt
}
```

### 5. REVIEW_SECTION - Sections Évaluatives

```typescript
model ReviewSection {
  id: String @id @default(cuid())
  reviewId: String
  review: Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  // Type de section
  sectionType: String
  // "visual_technique" | "odors" | "texture" | "tastes" | "effects"
  
  // Données évaluatives
  scores: Json // {"dimension": 8.5, "another": 7}
  notes: String?
  selectedItems: String[] // Pour multi-select
  
  updatedAt: DateTime @updatedAt
}
```

### 6. PIPELINE - Pipelines de Production

```typescript
model Pipeline {
  id: String @id @default(cuid())
  reviewId: String
  review: Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  // Configuration
  type: String // "culture" | "separation" | "extraction" | "recipe" | "curing"
  mode: String // "days" | "weeks" | "phases" | "hours" | "minutes"
  
  // Timing
  startDate: DateTime?
  endDate: DateTime?
  duration: Int? // en unités selon mode
  
  // Étapes
  stages: PipelineStage[]
  
  // Configuration additionnelle
  config: Json // Paramètres spécifiques par type
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

### 7. PIPELINE_STAGE - Étapes Pipeline

```typescript
model PipelineStage {
  id: String @id @default(cuid())
  pipelineId: String
  pipeline: Pipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  
  // Identification
  stageName: String
  stageOrder: Int
  
  // Timing
  timestamp: DateTime?
  duration: Int? // en unités du pipeline
  
  // Données
  measurements: Json // Température, humidité, etc.
  notes: String?
  images: String[]
  
  // État modifié
  modifiedSections: Json? // Sections modifiées (visual, odors, etc.)
  
  updatedAt: DateTime @updatedAt
}
```

### 8. CULTIVAR - Génétique (Producteur)

```typescript
model Cultivar {
  id: String @id @default(cuid())
  userId: String
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Identification
  name: String
  breeder: String
  type: String // "indica" | "sativa" | "hybrid"
  
  // Génétique
  parents: Cultivar[] @relation("CultivarParents")
  children: Cultivar[] @relation("CultivarParents")
  phenotype: String?
  
  // Données
  genetics: Json // %Indica, %Sativa, etc.
  traits: String[]
  notes: String?
  
  // Réference
  reviews: Review[]
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

### 9. EXPORT_TEMPLATE - Template Export Sauvegardé

```typescript
model ExportTemplate {
  id: String @id @default(cuid())
  userId: String
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Identification
  name: String
  description: String?
  templateType: String // "compact" | "detailed" | "complete" | "influencer" | "custom"
  
  // Configuration Export
  exportConfig: Json // {
  //   formats: ["png", "pdf"],
  //   canvaFormat: "1:1",
  //   sections: [...],
  //   includePipeline: true
  // }
  
  // Personnalisation
  appearance: Json // {
  //   theme: "light",
  //   colorScheme: {...},
  //   fonts: {...},
  //   watermark: {...}
  // }
  
  // Réutilisation
  isDefault: Boolean @default(false)
  usageCount: Int @default(0)
  lastUsed: DateTime?
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

### 10. WATERMARK - Filigrane Personnalisé

```typescript
model Watermark {
  id: String @id @default(cuid())
  userId: String
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Identification
  name: String
  
  // Contenu
  type: String // "text" | "image" | "logo"
  content: String // Texte ou URL image
  
  // Style
  position: String // "top-left" | "center" | "bottom-right" | etc.
  opacity: Float // 0-1
  scale: Float // 0.1-2.0
  
  // Métadonnées
  isDefault: Boolean @default(false)
  usageCount: Int @default(0)
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

### 11. EXPORT_RECORD - Enregistrement Export Réalisé

```typescript
model ExportRecord {
  id: String @id @default(cuid())
  reviewId: String
  review: Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  // Export réalisé
  format: String // "png" | "pdf" | "svg" | "json" | "csv" | etc.
  fileUrl: String
  fileName: String
  fileSize: Int
  
  // Configuration utilisée
  templateUsed: String?
  settingsUsed: Json
  
  // Métadonnées
  exportedAt: DateTime @default(now())
  sharedAt: DateTime?
  sharedOn: String[] // ["twitter", "instagram", "email"]
}
```

### 12. LIKE - Likes sur Reviews Publiques

```typescript
model Like {
  id: String @id @default(cuid())
  reviewId: String
  review: Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  userId: String // Utilisateur ayant liké
  
  createdAt: DateTime @default(now())
  
  @@unique([reviewId, userId])
}
```

### 13. COMMENT - Commentaires

```typescript
model Comment {
  id: String @id @default(cuid())
  reviewId: String
  review: Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  userId: String
  content: String
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  isModerated: Boolean @default(false)
}
```

---

## 🗂️ Fichiers Statiques JSON

### data/aromas.json
```json
{
  "categories": [
    {
      "name": "Fruité",
      "aromas": [
        "Citron",
        "Orange",
        "Pomme",
        "Fraise",
        "Raisin"
      ]
    },
    {
      "name": "Épicé",
      "aromas": [
        "Poivre",
        "Clou de girofle",
        "Cannelle"
      ]
    }
  ]
}
```

### data/effects.json
```json
{
  "mental": [
    "Créatif",
    "Énergique",
    "Euphorie",
    "Concentration"
  ],
  "physical": [
    "Relaxant",
    "Soulagement douleur",
    "Sommeil",
    "Appétit"
  ],
  "therapeutic": [
    "Anxiété",
    "Insomnie",
    "Inflammations",
    "Nausées"
  ]
}
```

### data/tastes.json
```json
{
  "categories": [
    {
      "name": "Sucré",
      "tastes": ["Miel", "Vanille", "Chocolat"]
    },
    {
      "name": "Amer",
      "tastes": ["Café", "Cacao", "Herbe"]
    }
  ]
}
```

### data/terpenes.json
```json
{
  "terpenes": [
    {
      "name": "Myrcène",
      "effects": ["Relaxant", "Anti-inflammatoire"],
      "aroma": "Terreux, Herbacé"
    },
    {
      "name": "Limonène",
      "effects": ["Énergique", "Euphorie"],
      "aroma": "Citronné"
    }
  ]
}
```

---

## 🔄 Relations Principales

```
User 1:N Reviews
User 1:N Templates
User 1:N Watermarks
User 1:N Cultivars
User 1:1 UserProfile

Review 1:1 ReviewGeneralInfo
Review 1:N ReviewSection
Review 1:N Pipeline
Review 1:N ExportRecord
Review 1:N Like
Review 1:N Comment

Pipeline 1:N PipelineStage

Cultivar N:N Cultivar (Parents/Children)

ExportTemplate 1:N ExportRecord (via config)
```

---

## 📝 Exemples de Requêtes

### Créer une Review complète
```graphql
mutation CreateReview($input: ReviewInput!) {
  createReview(input: $input) {
    id
    productType
    generalInfo { commercialName }
    sections { sectionType scores }
    pipelines { type stages { stageName } }
  }
}
```

### Récupérer les reviews publiques
```graphql
query GetPublicReviews($type: String, $page: Int) {
  publicReviews(productType: $type, page: $page) {
    edges {
      node {
        id title user { username }
        likes { totalCount }
        comments { totalCount }
      }
    }
  }
}
```

### Sauvegarder un template export
```graphql
mutation SaveTemplate($input: TemplateInput!) {
  saveExportTemplate(input: $input) {
    id name isDefault usageCount
  }
}
```

---

## 🔗 Fichiers Référence

- Schéma Prisma: `server-new/prisma/schema.prisma`
- Migrations: `server-new/prisma/migrations/`
- Types générés: `node_modules/@prisma/client` (généré après `prisma generate`)
