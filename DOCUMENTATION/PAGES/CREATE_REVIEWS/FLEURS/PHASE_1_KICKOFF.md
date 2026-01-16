# PHASE 1: KICKOFF - Implémentation FLEURS + PhenoHunt

**Statut**: 🚀 DÉMARRAGE IMMÉDIAT  
**Durée**: 2 semaines  
**Objectif**: Fondations Prisma, API stubs, intégration PhenoHunt, seed data  
**Responsable**: Lead Dev Backend  

---

## 📋 État Actuel du PhenoHunt

### Déjà en Place ✅

1. **Backend Routes** (`server-new/routes/genetics.js`)
   - POST `/api/genetics/trees` - Créer arbre généalogique
   - GET `/api/genetics/trees` - Lister les arbres
   - GET `/api/genetics/trees/:id` - Récupérer détails
   - PUT `/api/genetics/trees/:id` - Modifier arbre
   - POST `/api/genetics/cultivars` - Ajouter cultivar
   - Relations parent/enfants fonctionnelles

2. **Prisma Models** (`server-new/prisma/schema.prisma`)
   - `Cultivar` - Cultivars individuels
   - `GeneticTree` - Arbres généalogiques
   - `PhenoType` - Phénotypes (sélections)
   - Migrations déployées (20260115153357_test)

3. **Frontend Pages**
   - `client/src/pages/genetics/PhenoHuntPage.jsx` - Page principale
   - `client/src/components/genetics/CanevasPhenoHunt.jsx` - Canvas drag-drop

4. **Middleware**
   - `server-new/middleware/validateGenetics.js` - Validation

### À Compléter ⏳

1. **Intégration SECTION 2 Fleurs**
   - Lier PhenoHunt à la création de fiche technique
   - Importer cultivars depuis bibliothèque PhenoHunt
   - Préfiller le champ "Cultivar" avec sélection de l'arbre

2. **Amplification Canvas**
   - Split-screen pour 4 arbres simultanés
   - System d'onglets fenêtrés
   - Drag-drop cultivars de biblioliothèque vers canvas
   - Duplication de phénotypes avec code auto-généré

3. **Workflow Complet**
   - Du PhenoHunt → SECTION 2 (Génétiques) → Fiche technique
   - Retour de données d'expérimentation vers l'arbre

---

## 🎯 Plan de Phase 1: Intégration FLEURS + PhenoHunt

### Étape 1: Modèles Prisma Complets (3 jours)

#### 1.1 Vérifier/Compléter CultureSetup Model

```typescript
// Déjà dans schema.prisma? À vérifier
model CultureSetup {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Métadonnées
  name                String
  description         String?
  group               String   // "espace" | "substrat" | "irrigation" | "engrais" | "lumiere" | "climat" | "palissage" | "morphologie" | "recolte"
  productType         String   @default("fleurs")
  
  // Versioning & Gestion
  version             Int      @default(1)
  isActive            Boolean  @default(true)
  isTemplate          Boolean  @default(false)
  
  // Usage stats
  usageCount          Int      @default(0)
  usedInReviews       String[] // IDs des reviews
  personalRating      Int?     // Note 1-5
  
  // Données
  data                Json     // Structure complète du groupe
  
  // Timestamps
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  // Relations
  pipelineStages      PipelineStage[]
}
```

**Checklist**:
- [ ] Vérifier existence du model
- [ ] Ajouter fields si manquants
- [ ] Créer migration Prisma
- [ ] Run `npx prisma migrate dev`
- [ ] Vérifier schema.prisma est à jour

#### 1.2 Vérifier/Améliorer Pipeline Model

```typescript
model Pipeline {
  id                  String   @id @default(cuid())
  reviewId            String
  review              Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  // Configuration
  type                String   @default("culture")  // "culture" | "separation" | "extraction" | "curing"
  mode                String   // "jours" | "semaines" | "phases"
  
  // Dates
  startDate           DateTime
  endDate             DateTime?
  estimatedDuration   String?  // "3 mois" etc
  
  // Active setups par groupe (references à CultureSetup.id)
  activeSetups        String[] // Array d'IDs CultureSetup
  
  // Stages
  stages              PipelineStage[]
  
  // Timestamps
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

**Checklist**:
- [ ] Vérifier existence du model
- [ ] Ajouter `activeSetups` si manquant
- [ ] Créer migration si nécessaire
- [ ] Test: `npx prisma db push`

#### 1.3 Vérifier/Améliorer PipelineStage Model

```typescript
model PipelineStage {
  id                  String   @id @default(cuid())
  pipelineId          String
  pipeline            Pipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  
  // Stage info
  stageNumber         Int      // 0-364 pour jours, 0-51 pour semaines, 0-11 pour phases
  intervalType        String   // "jour" | "semaine" | "phase"
  intervalLabel       String   // "Jour 1", "Semaine 1", "Phase: Germination"
  scheduledDate       DateTime?
  actualDate          DateTime?
  
  // Events & data changes
  event               String?  // "arrosage" | "engraissage" | "technique" | "climat" | "morphologie"
  eventData           Json?    // Structure spécifique par type d'événement (cf ci-dessous)
  dataChanges         Json?    // Modifications aux sections existantes
  
  // Observations
  observations        String?  // Notes libres (500 chars)
  photos              String[] // URLs ou IDs de photos
  
  // Timestamps
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

**Event Data Structures**:

```typescript
// Arrosage
{
  "type": "arrosage",
  "volume": 2.5,           // Litres
  "volumeUnit": "L",
  "temperature": 22,       // °C
  "pH": 6.8,
  "ec": 1.2,               // mS/cm
  "runoffPercentage": 15,  // %
  "notes": "Runoff clair"
}

// Engraissage
{
  "type": "engraissage",
  "products": ["BioBizz Growth 2mL", "BioBizz Bloom 1mL"],
  "volume": 2.5,           // Volume total eau
  "dosagePerLiter": "selon instruc",
  "appliedWith": "arrosage",
  "notes": "PK boost ajouté"
}

// Technique appliquée
{
  "type": "technique",
  "technique": "Main-Lining",
  "description": "Coupe du tronc principal à 3 feuilles",
  "severity": "medium",   // "light" | "medium" | "heavy"
  "recoveryDays": 7,
  "notes": "Excellente réaction de la plante"
}

// Climat ajusté
{
  "type": "climat",
  "parameter": "humidity",
  "oldValue": 65,
  "newValue": 55,
  "unit": "%",
  "reason": "Prévention moisissure",
  "notes": "Ventilateur augmenté"
}

// Morphologie mesurée
{
  "type": "morphologie",
  "height": 45,            // cm
  "volume": 8,             // litres estimés
  "weight": null,          // g (non disponible avant récolte)
  "mainBranches": 6,
  "buds": 124,
  "healthScore": 9,        // 1-10
  "notes": "Croissance vigoureuse"
}
```

**Checklist**:
- [ ] Vérifier model existe et fields complets
- [ ] Ajouter `activeSetupReference` si manquant (pour tracer quel setup était actif à ce stage)
- [ ] Créer migration
- [ ] Test seed avec 5 stages exemple

#### 1.4 Vérifier/Améliorer Cultivar + GeneticTree + PhenoType

**Cultivar** (pour bibliothèque):
```typescript
model Cultivar {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Infos
  name                String
  breeder             String?
  type                String   // "indica" | "sativa" | "hybrid"
  description         String?
  
  // Génétiques
  geneticId           String?
  geneticTree         GeneticTree? @relation(fields: [geneticId], references: [id])
  
  // Stats
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

**GeneticTree** (arbre généalogique):
```typescript
model GeneticTree {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation("userGeneticTrees", fields: [userId], references: [id], onDelete: Cascade)
  
  // Projet
  name                String   // "Pheno Hunt 2024"
  projectType         String   @default("phenohunt")  // "phenohunt" | "selection" | "crossing" | "hunt"
  description         String?
  
  // Structure
  cultivars           Cultivar[]
  phenotypes          PhenoType[]
  
  // Sharing
  isPublic            Boolean  @default(false)
  shareCode           String?  @unique
  
  // Timestamps
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

**PhenoType** (phénotypes/sélections):
```typescript
model PhenoType {
  id                  String   @id @default(cuid())
  geneticTreeId       String
  geneticTree         GeneticTree @relation(fields: [geneticTreeId], references: [id], onDelete: Cascade)
  
  // Phénotype
  code                String   // "Pheno_A1", "Pheno_B3"
  name                String?
  parentIds           String[] // IDs des phénotypes parents
  
  // Caractéristiques
  characteristics     Json?    // Notes et observations
  experimentData      Json?    // Résultats expérimentation
  
  // Status
  isFavorite          Boolean  @default(false)
  notes               String?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

**Checklist**:
- [ ] Vérifier tous les models existent
- [ ] Vérifier migrations sont appliquées
- [ ] Test: `npx prisma studio` - visualiser les tables
- [ ] Créer seed initial pour 3 cultivars exemple

---

### Étape 2: API Routes & Stubs (4 jours)

#### 2.1 Routes CultureSetup

**Fichier**: `server-new/routes/cultureSetup.js`

```javascript
// GET /api/culture-setup - Lister tous les setups de l'utilisateur
// GET /api/culture-setup?group=espace - Filtrer par groupe
// GET /api/culture-setup/:id - Détail d'un setup
// POST /api/culture-setup - Créer nouveau setup
// PUT /api/culture-setup/:id - Modifier setup
// DELETE /api/culture-setup/:id - Supprimer setup
// POST /api/culture-setup/:id/duplicate - Dupliquer setup
// GET /api/culture-setup/:id/usage - Récupérer stats d'utilisation
```

**Checklist**:
- [ ] Créer fichier routes/cultureSetup.js
- [ ] Implémenter les 8 endpoints (CRUD + duplicate + usage)
- [ ] Ajouter validation avec Joi/Zod
- [ ] Ajouter authentification (verifyToken middleware)
- [ ] Tester avec Postman/Insomnia

#### 2.2 Routes Pipeline & PipelineStage

**Fichier**: `server-new/routes/pipeline.js`

```javascript
// Culture Pipelines
// POST /api/reviews/:reviewId/pipelines - Créer pipeline
// GET /api/reviews/:reviewId/pipelines - Lister pipelines de la review
// GET /api/reviews/:reviewId/pipelines/:pipelineId - Détail
// PUT /api/reviews/:reviewId/pipelines/:pipelineId - Modifier
// DELETE /api/reviews/:reviewId/pipelines/:pipelineId - Supprimer

// Pipeline Stages
// POST /api/pipelines/:pipelineId/stages - Ajouter stage
// PUT /api/pipelines/:pipelineId/stages/:stageId - Modifier stage
// DELETE /api/pipelines/:pipelineId/stages/:stageId - Supprimer stage
// POST /api/pipelines/:pipelineId/stages/:stageId/event - Ajouter événement
// GET /api/pipelines/:pipelineId/stages - Lister tous les stages (calendar view)

// Setup Management dans Pipeline
// POST /api/pipelines/:pipelineId/active-setups - Ajouter un setup actif
// DELETE /api/pipelines/:pipelineId/active-setups/:setupId - Retirer setup actif
// GET /api/pipelines/:pipelineId/active-setups - Lister setups actifs
```

**Checklist**:
- [ ] Créer fichier routes/pipeline.js
- [ ] Implémenter les 13 endpoints (minimal working)
- [ ] Ajouter validation des events (type, structure eventData)
- [ ] Ajouter authentification + ownership checks
- [ ] Test CRUD complet

#### 2.3 Routes PhenoHunt/Genetics (déjà en place, à améliorer)

**Fichier**: `server-new/routes/genetics.js`

**À améliorer**:
```javascript
// Récupération cultivars pour SECTION 2
// GET /api/genetics/cultivars/:cultivarId - Détail pour importer dans fiche

// Integration SECTION 2
// POST /api/reviews/:reviewId/sections/2/import-phenotype 
//   - Importe phénotype depuis PhenoHunt vers SECTION 2
//   - Params: { geneticTreeId, phenotypeId, cultivarIds }

// Statistics & usage tracking
// GET /api/genetics/cultivars/:id/usage - Stats d'utilisation dans fiches
// GET /api/genetics/trees/:id/stats - Stats d'utilisation de l'arbre
```

**Checklist**:
- [ ] Vérifier existants endpoints fonctionnent
- [ ] Ajouter 3 endpoints manquants (import phénotype, stats)
- [ ] Implémenter tracking d'utilisation
- [ ] Documentation API (OpenAPI/Swagger format)

---

### Étape 3: Seed Data & Fixtures (2 jours)

#### 3.1 Seed Utilisateur de Test

**Fichier**: `server-new/seed-data-phase1.js`

```javascript
const seedPhase1 = async () => {
  // 1. Créer utilisateur test
  const testUser = await prisma.user.create({
    data: {
      username: "test-producer",
      email: "producer@test.local",
      accountType: "producer",
      roles: '{"roles":["producer"]}',
    }
  });
  
  // 2. Créer Cultivars
  const cultivars = await prisma.cultivar.createMany({
    data: [
      { userId: testUser.id, name: "OG Kush", breeder: "Breeder1", type: "indica" },
      { userId: testUser.id, name: "Girl Scout Cookies", breeder: "Breeder2", type: "hybrid" },
      { userId: testUser.id, name: "Jack Herer", breeder: "Breeder3", type: "sativa" },
    ]
  });
  
  // 3. Créer GeneticTree
  const geneticTree = await prisma.geneticTree.create({
    data: {
      userId: testUser.id,
      name: "Pheno Hunt 2024",
      projectType: "phenohunt",
    }
  });
  
  // 4. Créer PhenoTypes
  const phenotypes = await prisma.phenoType.createMany({
    data: [
      { geneticTreeId: geneticTree.id, code: "Pheno_A1", name: "OG Pheno Strong" },
      { geneticTreeId: geneticTree.id, code: "Pheno_B2", name: "OG Pheno Yield" },
    ]
  });
  
  // 5. Créer CultureSetups (presets)
  const setupEnv = await prisma.cultureSetup.create({
    data: {
      userId: testUser.id,
      name: "Indoor LED Standard",
      group: "environnement",
      data: {
        mode: "Indoor",
        type: "Armoire 100x100x200cm",
        surface: 1,
        volume: 2,
      }
    }
  });
  
  // 6. Créer Review avec Pipeline
  const review = await prisma.review.create({
    data: {
      userId: testUser.id,
      productType: "fleurs",
      status: "draft",
    }
  });
  
  // 7. Créer Pipeline Culture
  const pipeline = await prisma.pipeline.create({
    data: {
      reviewId: review.id,
      type: "culture",
      mode: "jours",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-04-15"),
      activeSetups: [setupEnv.id],
    }
  });
  
  // 8. Créer Stages avec events
  // Jour 1-5 (Germination)
  for (let i = 0; i < 5; i++) {
    await prisma.pipelineStage.create({
      data: {
        pipelineId: pipeline.id,
        stageNumber: i,
        intervalType: "jour",
        intervalLabel: `Jour ${i + 1}`,
        scheduledDate: new Date("2024-01-01"),
        event: i === 3 ? "arrosage" : null,
        eventData: i === 3 ? {
          type: "arrosage",
          volume: 0.5,
          temperature: 22,
          pH: 6.5,
        } : null,
      }
    });
  }
  
  console.log("✅ Seed Phase 1 complete");
};
```

**Checklist**:
- [ ] Créer script seed-data-phase1.js
- [ ] Run: `node server-new/seed-data-phase1.js`
- [ ] Vérifier données dans Prisma Studio
- [ ] Tester API endpoints avec les données

#### 3.2 Fixtures JSON pour Frontend

**Fichier**: `client/public/fixtures/phase1-data.json`

```json
{
  "user": {
    "id": "user_test_1",
    "username": "test-producer",
    "accountType": "producer"
  },
  "cultivars": [
    {
      "id": "cultivar_1",
      "name": "OG Kush",
      "breeder": "Breeder1",
      "type": "indica"
    }
  ],
  "cultureSetups": [
    {
      "id": "setup_env_1",
      "name": "Indoor LED Standard",
      "group": "environnement",
      "data": {
        "mode": "Indoor",
        "type": "Armoire 100x100x200cm"
      }
    }
  ],
  "pipeline": {
    "id": "pipeline_1",
    "mode": "jours",
    "stages": 90
  }
}
```

**Checklist**:
- [ ] Créer fixtures JSON
- [ ] Servir sur `/api/fixtures/phase1-data` pour tests frontend

---

### Étape 4: Intégration Frontend (3 jours)

#### 4.1 Form Components SECTION 1 & 2

**État**: Probablement 50-70% complet, à valider

**Checklist**:
- [ ] Vérifier `client/src/pages/ReviewForm.jsx` existe et fonctionne
- [ ] Vérifier Section 1 (Info Générale) complète
- [ ] Vérifier Section 2 (Génétiques) avec:
  - [ ] Champ Cultivar avec autocomplete
  - [ ] Import depuis PhenoHunt (button "Charger du PhenoHunt")
  - [ ] Display du cultivar sélectionné
- [ ] Tester intégration PhenoHunt → Cultivar input

#### 4.2 Form Components SECTION 3 (Basic Version)

**Fichier**: `client/src/pages/ReviewFormSection3.jsx`

**Minimal MVP**:
```jsx
// 1. Sélection mode (jours/semaines/phases)
// 2. Sélection dates (start/end)
// 3. Sélection 3 setups (Espace, Substrat, Lumière)
// 4. Input pour notes
// 5. Calendar view des 90 jours (simplified)
// 6. Save button

export default function ReviewFormSection3() {
  const [mode, setMode] = useState("jours");
  const [startDate, setStartDate] = useState(null);
  const [selectedSetups, setSelectedSetups] = useState([]);
  const [calendarView, setCalendarView] = useState(null);
  
  return (
    <div className="section-3">
      {/* Mode selection */}
      {/* Date range picker */}
      {/* Setups selector */}
      {/* Calendar preview */}
      {/* Save button */}
    </div>
  );
}
```

**Checklist**:
- [ ] Créer composant ReviewFormSection3.jsx
- [ ] Implémenter 5 éléments ci-dessus
- [ ] Intégrer avec API routes pipeline
- [ ] Test save/load

#### 4.3 PhenoHunt Canvas Improvements

**Améliorations minimales**:
- [ ] Add onglets fenêtrés (tab system pour multiples arbres)
- [ ] Add drag-drop cultivars depuis sidebar vers canvas
- [ ] Add context menu "Dupliquer phénotype" avec code auto-généré
- [ ] Test: drag-drop → validation

**Checklist**:
- [ ] Modifier `client/src/components/genetics/CanevasPhenoHunt.jsx`
- [ ] Ajouter 3 améliorations
- [ ] Test drag-drop workflow

---

### Étape 5: Documentation & Testing (2 jours)

#### 5.1 API Documentation

**Fichier**: `DOCUMENTATION/PAGES/CREATE_REVIEWS/FLEURS/API_PHASE1.md`

```markdown
# Phase 1 API Documentation

## CultureSetup Endpoints

### POST /api/culture-setup
Create a new setup preset

**Request**:
```json
{
  "name": "Indoor LED Standard",
  "group": "environnement",
  "data": {
    "mode": "Indoor",
    "type": "Armoire 100x100x200cm"
  }
}
```

**Response**:
```json
{
  "id": "setup_123",
  "name": "Indoor LED Standard",
  "group": "environnement",
  "usageCount": 0,
  "createdAt": "2026-01-15T..."
}
```

## Pipeline Endpoints
...
```

**Checklist**:
- [ ] Créer API_PHASE1.md
- [ ] Documenter 20+ endpoints (POST, GET, PUT, DELETE)
- [ ] Ajouter examples cURL
- [ ] Ajouter error responses (400, 404, 500)

#### 5.2 Testing Checklist

```markdown
# Phase 1 Testing Checklist

## Backend API Tests
- [ ] CultureSetup CRUD complet (4 tests)
- [ ] Pipeline CRUD complet (4 tests)
- [ ] PipelineStage creation avec events (3 tests)
- [ ] Authentification & authorization (3 tests)
- [ ] Error handling (4 tests)
- **Total**: 18 tests backend

## Frontend Component Tests
- [ ] ReviewFormSection1 loads correctly
- [ ] ReviewFormSection2 imports from PhenoHunt
- [ ] ReviewFormSection3 creates pipeline
- [ ] Calendar view renders 90 days
- [ ] Save flow persists to backend
- **Total**: 5 tests frontend

## Integration Tests
- [ ] Full flow: Cultivar → PhenoHunt → Section2 → Section3
- [ ] Preset creation → reuse in 2nd review
- [ ] Event tracking for usage stats
- **Total**: 3 tests integration

## Manual QA
- [ ] Mobile responsiveness (iPhone, iPad)
- [ ] Keyboard navigation
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Performance (< 3s page load)
```

**Checklist**:
- [ ] Créer test suite (Jest + Vitest)
- [ ] Run 18 backend tests
- [ ] Run 5 frontend component tests
- [ ] Run 3 integration tests
- [ ] Manual QA checklist

---

## 📅 Timeline Détaillée (2 semaines)

### Semaine 1

| Jour | Tâche | Hours | Status |
|------|-------|-------|--------|
| Mon  | 1.1: CultureSetup Model | 3 | ⏳ |
| Tue  | 1.2-1.3: Pipeline Models | 3 | ⏳ |
| Tue  | 1.4: Genetics Models validation | 2 | ⏳ |
| Wed  | 2.1: CultureSetup Routes | 4 | ⏳ |
| Wed  | 2.2: Pipeline Routes | 4 | ⏳ |
| Thu  | 2.3: Genetics Routes improvements | 3 | ⏳ |
| Thu  | 3.1: Seed data script | 3 | ⏳ |
| Fri  | 3.2: Fixtures JSON | 2 | ⏳ |
| Fri  | Testing & QA | 2 | ⏳ |
| **Week 1 Total** | | **26h** | |

### Semaine 2

| Jour | Tâche | Hours | Status |
|------|-------|-------|--------|
| Mon  | 4.1: Section1 & 2 validation | 4 | ⏳ |
| Mon  | 4.1: Section2 PhenoHunt integration | 3 | ⏳ |
| Tue  | 4.2: Section 3 basic form | 5 | ⏳ |
| Tue  | 4.2: Calendar view basic | 3 | ⏳ |
| Wed  | 4.3: Canvas improvements | 4 | ⏳ |
| Wed  | 4.3: Drag-drop testing | 2 | ⏳ |
| Thu  | 5.1: API Documentation | 3 | ⏳ |
| Thu  | 5.2: Test suite creation | 4 | ⏳ |
| Fri  | Final QA & bug fixes | 4 | ⏳ |
| Fri  | Demo preparation | 2 | ⏳ |
| **Week 2 Total** | | **34h** | |

**Total Phase 1**: ~60 hours (1.5 full-time developer weeks)

---

## 🎯 Critères de Succès Phase 1

### Technical ✅
- [ ] Tous les Prisma models sont créés et migré
- [ ] 20+ API endpoints fonctionnels et testés
- [ ] Seed data crée 3 cultivars + 1 arbre + 3 setups + 1 pipeline complet
- [ ] Authentification fonctionne sur tous les endpoints
- [ ] Database schema validé avec Prisma Studio

### UX ✅
- [ ] Section 1 & 2 formes affichent correctement
- [ ] Import PhenoHunt → Section 2 fonctionne end-to-end
- [ ] Calendar view affiche les 90 jours
- [ ] Utilisateurs peuvent créer pipeline en < 5 min
- [ ] Mobile responsive (testé iPhone 12 & iPad)

### Exhaustivité ✅
- [ ] 3 groupes de presets codifiés (Espace, Substrat, Lumière)
- [ ] 5 types d'événements documentés + structurés (arrosage, engraissage, technique, climat, morphologie)
- [ ] PhenoHunt intégré au flux SECTION 2
- [ ] Utilisateurs peuvent réutiliser presets dans 2+ reviews

### Documentation ✅
- [ ] API endpoints documentés (20+ routes)
- [ ] Testing checklist complétée (26 tests)
- [ ] Phase 1 retrospective écrite
- [ ] Readiness assessment pour Phase 2

---

## 🚀 Prochain: Phase 2 Kickoff

**Phase 2**: Sections 4-9 (Évaluations Sensorielles)
- Duration: 2 weeks
- Focus: Export templates, evaluation forms, statistics

---

## 📞 Questions & Decisions à Prendre

1. **Database**: SQLite pour dev / PostgreSQL prod ready? ✓ Déjà décidé (SQLite local)
2. **Event architecture**: Queue-based ou direct DB writes? → **Direct DB writes** (Phase 1 MVP)
3. **Calendar visualization**: Github-style ou Timeline? → **Github-style** (90-day calendar)
4. **PhenoHunt split-screen**: React tabs ou actual split? → **Tabs** (Phase 1), split-screen Phase 2+
5. **Stats tracking**: Real-time ou batch processed? → **Real-time counts** (Phase 1)

---

## 📝 Notes pour Lead Dev

- Vérifier que `server-new/middleware/verifyToken.js` existe et fonctionne
- Vérifier que Prisma client est générée: `npx prisma generate`
- Utiliser UUID pour les IDs (cuid ou crypto.randomUUID)
- Ajouter proper error handling (try/catch avec logging)
- Rate limiting sur API (recommandé: 100 req/min par user)
- Ajouter CORS headers si frontend est domaine différent

---

**Créé**: 2026-01-15  
**Last Updated**: 2026-01-15  
**Responsable**: Lead Dev Backend  
**Statut**: 🟢 Ready to Start
