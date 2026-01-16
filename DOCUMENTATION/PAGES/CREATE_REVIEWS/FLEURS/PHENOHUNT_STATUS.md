# État du Système PhenoHunt - 2026-01-15

**Statut Global**: 🟡 **60% - En Place, À Améliorer**

---

## 1. Backend: Routes & Models ✅ 70% Complet

### Modèles Prisma EXISTANTS

| Model | Status | Notes |
|-------|--------|-------|
| `Cultivar` | ✅ Complet | Cultivars individuels avec breeder, type |
| `GeneticTree` | ✅ Complet | Arbres généalogiques, projectType |
| `PhenoType` | ✅ Complet | Phénotypes, code, parents, characteristics |
| `User` | ✅ Complet | Relation ownership |

### API Routes EXISTANTES

**Fichier**: `server-new/routes/genetics.js` (82+ lignes)

```javascript
✅ POST /api/genetics/trees - Créer arbre généalogique
✅ GET /api/genetics/trees - Lister les arbres
✅ GET /api/genetics/trees/:id - Détails
✅ PUT /api/genetics/trees/:id - Modifier
✅ DELETE /api/genetics/trees/:id - Supprimer
✅ POST /api/genetics/cultivars - Ajouter cultivar
✅ GET /api/genetics/cultivars - Lister cultivars
✅ PUT /api/genetics/cultivars/:id - Modifier cultivar
✅ DELETE /api/genetics/cultivars/:id - Supprimer cultivar
✅ POST /api/genetics/phenotypes - Ajouter phénotype
```

**Total**: 10 endpoints existants ✅

### Middleware EXISTANT

- ✅ `server-new/middleware/validateGenetics.js` - Validation structures
- ✅ Auth integration (verifyToken)

### Migrations DÉPLOYÉES

- ✅ `20260115153357_test` - Tables genetics complètes

---

## 2. Frontend: Pages & Components ✅ 50% Complet

### Pages EXISTANTES

| Path | Status | Notes |
|------|--------|-------|
| `client/src/pages/genetics/PhenoHuntPage.jsx` | ⏳ Basic | Structure basique |
| `client/src/pages/genetics/GeneticsManagementPage.jsx` | ⏳ ? | À vérifier |

### Components EXISTANTS

| Component | Path | Status |
|-----------|------|--------|
| `CanevasPhenoHunt` | `client/src/components/genetics/` | ⏳ Basic |
| Genetics UI stubs | Various | ⏳ Partial |

### Canvas Features EXISTANTES

- ⏳ Basic drag-drop skeleton
- ❌ Split-screen multi-tree view
- ❌ Tab system pour multiples arbres
- ❌ Cultivar imports depuis sidebar

---

## 3. Intégration avec SECTION 2: Génétiques 🔴 10% Complet

### Problèmes Actuels

1. **Isolation**: PhenoHunt est silo'd dans `/genetics`, pas intégré à ReviewForm
2. **No Import Flow**: Pas de "Import cultivar depuis PhenoHunt" dans SECTION 2
3. **No Link Back**: Pas de "Ouvrir PhenoHunt" depuis SECTION 2

### À Implémenter Phase 1

```
ReviewFormSection2 (Génétiques)
    ├─ Cultivar Input Field
    │   ├─ Autocomplete dropdown
    │   └─ [Button: "Charger du PhenoHunt"] ← AJOUTER
    │       └─ Modal/Popup affiche PhenoHunt
    │           ├─ Liste des arbres
    │           ├─ Sélection arbre + phénotype
    │           └─ Import button → remplit Cultivar field
    │
    └─ Données génétiques (parents, type, %)
```

### Workflow Complet À Créer

```
Producteur crée fiche Fleur
├─ SECTION 1: Info Générale ✅ (déjà)
├─ SECTION 2: Génétiques (À améliorer)
│   ├─ Cultivar via autocomplete (déjà)
│   └─ Import depuis PhenoHunt (NOUVEAU Phase 1) ← ICI
│       └─ Retroune avec phénotype pré-rempli + code
├─ SECTION 3: Pipeline Culture (NOUVEAU Phase 1)
│   └─ Données réutilisables par groupe
└─ SECTIONS 4-9: Evaluations
```

---

## 4. Système de Presets/Setups: 🔴 0% Complet

### Status

- ❌ Model `CultureSetup` n'existe PAS encore
- ❌ Aucune API pour créer/charger presets
- ❌ Aucun stockage de données réutilisables
- ❌ Pas d'interface pour gérer presets

### À Créer Phase 1

```typescript
// AJOUTER À schema.prisma
model CultureSetup {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name                String
  group               String   // "espace" | "substrat" | "lumiere" etc
  data                Json     // Configuration complète du groupe
  usageCount          Int      @default(0)
  usedInReviews       String[] // IDs reviews utilisant ce setup
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### Après Phase 1

Users pourront:
- ✅ Créer preset "Indoor LED Standard"
- ✅ Réutiliser dans 5 fiches techniques
- ✅ Modifier une fois → mis à jour partout
- ✅ Voir stats "Utilisé dans 5 fiches"

---

## 5. Données Seed Existantes 🟡 30% Complet

### Seed Fichiers Existants

- ⏳ `server-new/seed-templates.js` - Templates d'exports (?)
- ⏳ `server-new/seed-test-user.js` - Utilisateur test (?) 
- ❌ Pas de seed pour cultivars/arbres/phénotypes

### À Créer Phase 1

`server-new/seed-data-phase1.js`:
- Créer 1 utilisateur test
- Créer 3 cultivars (OG Kush, GSC, Jack Herer)
- Créer 1 GeneticTree (Pheno Hunt 2024)
- Créer 2 PhenoTypes (Pheno_A1, Pheno_B2)
- Créer 3 CultureSetups (Espace, Substrat, Lumière)
- Créer 1 Pipeline complet avec 10 stages exemple

---

## 6. Documentation Existante 🟢 80% Complet

### Ce qui EXISTE

- ✅ [DOCUMENTATION/PAGES/BIBLIOTHEQUE/Phenohunt/phenohunt_sys.md](../../BIBLIOTHEQUE/Phenohunt/phenohunt_sys.md)
  - Décrit la vision système (canvas, onglets, drag-drop)
  - Explique l'intégration avec bibliothèque
  - Workflow: dupliquer phénotype → auto-import SECTION 2

- ✅ SYNTHESE_ARCHITECTURE.md (mentions PhenoHunt)
  - Référence PhenoHunt comme "Spécial Producteur"
  - Explique arbre généalogique interactif

- ✅ ROADMAP_IMPLEMENTATION.md
  - PhenoHunt listé dans Phase 2 (mais demande utilisateur = Phase 1)

### Ce qui MANQUE

- ❌ Document technique détaillé: "PhenoHunt Technical Spec"
- ❌ API documentation pour genetics endpoints
- ❌ Frontend component architecture pour canvas
- ❌ Integration guide Section 2 ↔ PhenoHunt

---

## 7. Architecture Proposée pour Phase 1

### 7.1 Backend

```
server-new/
├── routes/
│   ├── genetics.js (EXISTE - 10 endpoints) ✅
│   ├── cultureSetup.js (NOUVEAU - 8 endpoints) ← CREATE
│   └── pipeline.js (NOUVEAU - 13 endpoints) ← CREATE
├── middleware/
│   ├── validateGenetics.js (EXISTE) ✅
│   └── validatePipeline.js (NOUVEAU) ← CREATE
├── prisma/
│   ├── schema.prisma (EXISTE, À AMÉLIORER)
│   └── migrations/
│       └── _001_add_culture_setup.sql ← CREATE
├── services/
│   ├── geneticsService.js (NOUVEAU) ← CREATE
│   └── pipelineService.js (NOUVEAU) ← CREATE
└── seed-data-phase1.js (NOUVEAU) ← CREATE
```

### 7.2 Frontend

```
client/src/
├── pages/
│   ├── ReviewForm.jsx (EXISTE, À AMÉLIORER)
│   ├── ReviewFormSection2.jsx (EXISTE, À AMÉLIORER)
│   └── ReviewFormSection3.jsx (NOUVEAU) ← CREATE
├── components/
│   ├── genetics/
│   │   ├── CanevasPhenoHunt.jsx (EXISTE, À AMÉLIORER)
│   │   ├── PhenoHuntImportModal.jsx (NOUVEAU) ← CREATE
│   │   └── Cultivarselector.jsx (NOUVEAU) ← CREATE
│   ├── pipeline/
│   │   ├── PipelineBuilder.jsx (NOUVEAU) ← CREATE
│   │   ├── CalendarView.jsx (NOUVEAU) ← CREATE
│   │   └── SetupSelector.jsx (NOUVEAU) ← CREATE
│   └── forms/
│       └── ... (existing)
└── hooks/
    ├── usePhenoHunt.js (NOUVEAU) ← CREATE
    └── usePipeline.js (NOUVEAU) ← CREATE
```

---

## 8. Les 5 Points Clés pour Phase 1

### Point 1: Traçabilité 3D Réelle
**Besoin**: Plan (espace) + Temps (90 jours) + Événements (ce qui se passe)

**Implémentation Phase 1**:
- [ ] Pipeline.mode = "jours" → créer 90 PipelineStages
- [ ] Chaque stage peut avoir 0-1 événement (arrosage, engraissage, etc)
- [ ] CalendarView affiche grille 90j avec points colorés = événements
- [ ] Click sur jour → voir/ajouter événements

### Point 2: Réutilisation de Setups (Preset System)
**Besoin**: Producteur crée "Setup Indoor LED" 1x, réutilise dans 5+ fiches

**Implémentation Phase 1**:
- [ ] CultureSetup model créé
- [ ] POST /api/culture-setup - créer preset
- [ ] Pipeline.activeSetups = ["setup_123"] - lier à pipeline
- [ ] Statistique d'utilisation: usageCount++

### Point 3: Import PhenoHunt → Fiche Technique
**Besoin**: "OG Kush Pheno_A1" depuis PhenoHunt pré-remplit SECTION 2

**Implémentation Phase 1**:
- [ ] Modal import dans ReviewFormSection2
- [ ] Liste d'arbres + phénotypes
- [ ] Sélection → remplit Cultivar field + code phénotype
- [ ] Save → linked review.cultivarId

### Point 4: Canvas Amélioré
**Besoin**: Multi-tree view, drag-drop cultivars, phénotype duplication

**Implémentation Phase 1 (MVP)**:
- [ ] Tab system pour ouvrir 2-4 arbres
- [ ] Drag cultivars depuis sidebar vers canvas
- [ ] Context menu "Dupliquer" → auto-génère Pheno_A2, etc

### Point 5: Données Exhaustives
**Besoin**: 9 groupes de données, 80+ champs, structures JSON claires

**Implémentation Phase 1**:
- [ ] 3 groupes codifiés: Espace, Substrat, Lumière
- [ ] JSON structures validées
- [ ] 5 types d'événements documentés
- [ ] 30+ champs accessibles via API

---

## 9. Migration Path: Dev Local → VPS

### Local (Dev)

```bash
# 1. Update schema.prisma
# 2. Create migration
npx prisma migrate dev --name "add_culture_setup"

# 3. Run seed
node server-new/seed-data-phase1.js

# 4. Test API
curl http://localhost:3001/api/culture-setup

# 5. Test frontend
npm run dev (client)
npm run dev (server-new)
```

### VPS (Production)

```bash
# 1. SSH à vps-lafoncedalle
ssh vps-lafoncedalle

# 2. Pull changes
git pull origin main

# 3. Backend build
cd server-new
npm install
npx prisma migrate deploy  # Production migration

# 4. Seed production (optional)
node seed-data-phase1.js --prod

# 5. Restart PM2
pm2 restart ecosystem.config.cjs
```

---

## 10. Quick Checklist pour Démarrer Phase 1

```markdown
# PHASE 1 STARTUP CHECKLIST

## Avant de commencer (Today)
- [ ] Read this document (État du PhenoHunt)
- [ ] Read PHASE_1_KICKOFF.md
- [ ] Vérifier database.db existe et migrations sont appliquées
- [ ] Vérifier `npm run dev` fonctionne (client + server)

## Day 1: Models
- [ ] Vérifier Cultivar, GeneticTree, PhenoType dans schema.prisma
- [ ] Créer CultureSetup model
- [ ] Créer migration et run `npx prisma migrate dev`
- [ ] Vérifier dans Prisma Studio que 5 tables existent

## Day 2: API Routes
- [ ] Créer server-new/routes/cultureSetup.js (8 endpoints)
- [ ] Créer server-new/routes/pipeline.js (13 endpoints)
- [ ] Tester avec Postman: POST /api/culture-setup (201 ✅)
- [ ] Tester avec Postman: GET /api/culture-setup (200 ✅)

## Day 3-4: Frontend
- [ ] Vérifier ReviewFormSection2.jsx existe
- [ ] Ajouter button "Charger du PhenoHunt"
- [ ] Créer ReviewFormSection3.jsx (calendar view)
- [ ] Test: créer pipeline en UI

## Day 5: Seed & Testing
- [ ] Créer seed-data-phase1.js
- [ ] Run seed script
- [ ] 18+ tests backend
- [ ] 5+ tests frontend

## By End of Week
- [ ] Tout Phase 1 checklist ✅
- [ ] Demo ready
- [ ] Feedback collecté pour Phase 2
```

---

## Résumé Exécutif

| Aspect | Status | Coverage | Next |
|--------|--------|----------|------|
| **Models Prisma** | 70% ✅ | Genetics OK, CultureSetup MANQUE | Créer CultureSetup model |
| **API Routes** | 70% ✅ | Genetics OK, Pipeline MANQUE | Créer 21 endpoints (culture + pipeline) |
| **Frontend Pages** | 50% ⏳ | Section 1-2 partiels | Améliorer S2, créer S3 |
| **PhenoHunt Integration** | 20% 🔴 | Pas de lien à Section 2 | Créer import modal |
| **Preset System** | 0% 🔴 | N'existe pas | Créer CultureSetup + API |
| **Documentation** | 80% ✅ | Spec existe, API manque | Créer API_PHASE1.md |
| **Seed Data** | 20% ⏳ | Basic exist, complet manque | Créer seed-data-phase1.js |

**Verdict**: **Démarrage Phase 1 possible immédiatement. 10 jours pour 70% complet.**

---

**Créé**: 2026-01-15  
**Révisé**: LIVE NOW  
**Responsable**: Tech Lead  
**Statut**: 🟢 Ready for Phase 1 Kickoff
