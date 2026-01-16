# Phase 1: Workflow Complet + Responsabilités Équipe

---

## 🎨 Workflow Visuel: Producteur crée Fiche Fleur

```
┌──────────────────────────────────────────────────────────────────┐
│                  PRODUCTEUR CRÉE FICHE TECHNIQUE FLEUR            │
└──────────────────────────────────────────────────────────────────┘

┌─ SECTION 1: Informations Générales ────────────────────────────────┐
│                                                                      │
│  📝 Form Simple                                                      │
│  ├─ Nom commercial: "OG Kush #2"                                    │
│  ├─ Farm: "La Cour des Grands"                                      │
│  ├─ Photos: [upload 4x]                                             │
│  └─ Type: Indica-dominant                                           │
│                                                                      │
│  💾 Sauvegarde dans Review                                          │
│  └─ Status: DRAFT                                                   │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─ SECTION 2: Génétiques + PhenoHunt Integration ────────────────────┐
│                                                                      │
│  📊 Formulaire Structuré                                            │
│  ├─ Breeder: "Breeder X" (autocomplete)                             │
│  ├─ Variété: "OG Kush" (autocomplete)                               │
│  │                                                                   │
│  │  ┌─────────────────────────────────────────┐                    │
│  │  │ [Button: CHARGER DU PHENOHUNT] ← NOUVEAU │ ← Phase 1        │
│  │  └─────────────────────────────────────────┘                    │
│  │           ↓ Click                                                │
│  │   ┌──────────────────────────────┐                              │
│  │   │ MODAL: Import Phénotype       │                              │
│  │   ├──────────────────────────────┤                              │
│  │   │ 🌳 Mes Arbres Généalogiques  │                              │
│  │   │                              │                              │
│  │   │ ☐ Pheno Hunt 2024            │                              │
│  │   │   ├─ Pheno_A1                │                              │
│  │   │   └─ Pheno_B2 ✓ Selected     │                              │
│  │   │                              │                              │
│  │   │ [IMPORTER] button            │                              │
│  │   └──────────────────────────────┘                              │
│  │           ↓ Select + Import                                     │
│  │                                                                   │
│  └─ Champ Cultivar auto-filled: "OG Kush - Pheno_B2"               │
│  ├─ Code Phénotype: "Pheno_B2" (auto)                              │
│  ├─ Type: "Indica" (auto from PhenoHunt)                           │
│  └─ Généalogie: [Parents from tree]                                │
│                                                                      │
│  💾 Sauvegarde                                                      │
│  └─ Review.cultivarId = "cultivar_123"                             │
│     Review.phenotypeCode = "Pheno_B2"                              │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─ SECTION 3: Pipeline Culture (Nouvelle) ───────────────────────────┐
│                                                                      │
│  ⏱️ Configuration Pipeline                                          │
│                                                                      │
│  1️⃣ Mode:                                                          │
│    ☑ Jours (90 jours calendrier)                                   │
│    ☐ Semaines (52 semaines)                                        │
│    ☐ Phases (12 phases prédéfinies)                                │
│                                                                      │
│  2️⃣ Dates:                                                         │
│    Date début: 2024-01-01                                          │
│    Date fin: 2024-04-15                                            │
│                                                                      │
│  3️⃣ Sélection des SETUPS réutilisables ← NEW!                     │
│    ☑ Espace: "Indoor LED Standard"                                 │
│    ☑ Substrat: "Bio Composé Standard"                              │
│    ☑ Lumière: "3x600W HPS Floraison"                               │
│    ☐ Irrigation: (non utilisé)                                     │
│    ☐ Engrais: (non utilisé)                                        │
│    ☐ Climat: (non utilisé)                                         │
│    ☐ Palissage: (non utilisé)                                      │
│    ☐ Morphologie: (non utilisé)                                    │
│    ☐ Récolte: (non utilisé)                                        │
│                                                                      │
│  4️⃣ Aperçu Pipeline:                                               │
│    ┌─ CALENDAR VIEW ─────────────────────────────┐                 │
│    │ J1  J2  J3  J4  J5  J6  J7  J8  J9  J10     │                 │
│    │                                              │                 │
│    │ ⚪  ⚪  🔵  ⚪  💧  ⚪  🔵  ⚪  ⚪  💧      │                 │
│    │ J11 J12 J13 J14 J15 J16 J17 J18 J19 J20     │                 │
│    │                                              │                 │
│    │ ⚪  🥗 ⚪  ⚪  💧  ⚪  🔵  ⚪  ⚪  ⚪       │                 │
│    │ ... etc 90 days total                        │                 │
│    │                                              │                 │
│    │ Legend: 💧 = Arrosage, 🥗 = Engrais,      │                 │
│    │         🔵 = Technique, 🌡️ = Climat      │                 │
│    └──────────────────────────────────────────────┘                 │
│                                                                      │
│  5️⃣ Notes Générales:                                               │
│    [Textarea 500 chars]                                             │
│    "Culture indoor standard, HPS 600W, arrosage 2x/semaine..."      │
│                                                                      │
│  💾 Sauvegarde                                                      │
│  └─ Pipeline created                                               │
│     90 PipelineStages created (empty)                              │
│     activeSetups linked                                            │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─ SECTIONS 4-9: Évaluations (Après Phase 1) ──────────────────────────┐
│                                                                      │
│  (Phase 2+)                                                          │
│  ├─ SECTION 4: Données Analytiques                                 │
│  ├─ SECTION 5: Visuel & Technique                                  │
│  ├─ SECTION 6: Odeurs                                              │
│  ├─ SECTION 7: Texture                                             │
│  ├─ SECTION 8: Goûts                                               │
│  └─ SECTION 9: Effets Ressentis                                    │
│                                                                      │
│  ✅ Tous les setups activés + liés                                 │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─ EXPORT MAKER ─────────────────────────────────────────────────────┐
│                                                                      │
│  📄 Choix Template:                                                 │
│  ├─ Compact (1:1 format, 5 éléments)                               │
│  ├─ Détaillé (16:9 format, 12 éléments)                            │
│  ├─ Complet (A4 format, tout)                                      │
│  └─ Personnalisé (Producteur uniquement)                           │
│                                                                      │
│  📊 Inclure Pipeline Culture:                                      │
│    [Checkbox] Afficher pipeline en calendrier                      │
│    [Checkbox] Inclure événements de suivi                          │
│    [Slider] 5 derniers jours / Tous les 90 jours                  │
│                                                                      │
│  💾 Export:                                                         │
│  ├─ PNG 300dpi                                                      │
│  ├─ PDF                                                             │
│  ├─ JSON (toutes les données)                                      │
│  └─ CSV (pour analyse)                                             │
│                                                                      │
│  📤 Partage:                                                        │
│  ├─ Lien public (galerie publique)                                 │
│  ├─ Twitter / Instagram                                            │
│  └─ Email (format personnalisé)                                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Répartition des Tâches par Rôle

### Backend Dev (Lead)

**Responsabilité**: Modèles Prisma + API Routes + Seed Data

**Détail des 5 jours**:

```
📋 JOUR 1 (Mercredi)
├─ Morning (2h):
│  ├─ Lire PHASE_1_KICKOFF.md en entier
│  ├─ Vérifier schema.prisma actuel (tous les models existent?)
│  └─ Vérifier migrations appliquées
├─ Afternoon (3h):
│  ├─ Créer CultureSetup model (si manquant)
│  ├─ Améliorer Pipeline model (ajouter activeSetups, etc)
│  └─ Créer migration: npx prisma migrate dev --name "add_culture_setup"
└─ Testing (1h):
   └─ Vérifier dans Prisma Studio que 6 tables sont présentes

📋 JOUR 2 (Jeudi)
├─ Morning (3h):
│  ├─ Créer server-new/routes/cultureSetup.js (8 endpoints)
│  ├─ CRUD: POST, GET (all + by ID), PUT, DELETE
│  └─ Add: duplicate endpoint
├─ Afternoon (3h):
│  ├─ Créer server-new/routes/pipeline.js (13 endpoints)
│  ├─ Pipeline CRUD + stages management
│  └─ Event handling for stages
└─ Testing (1h):
   └─ Postman: tester 16 endpoints (201, 200, 404, etc)

📋 JOUR 3 (Vendredi)
├─ Morning (2h):
│  ├─ Améliorer server-new/routes/genetics.js
│  ├─ Ajouter 3 endpoints manquants:
│  │  └─ GET /api/genetics/cultivars/:id/usage
│  │  └─ POST /api/reviews/:reviewId/import-phenotype
│  │  └─ GET /api/genetics/trees/:id/stats
│  └─ Tester intégration
├─ Afternoon (2h):
│  ├─ Créer server-new/middleware/validatePipeline.js
│  ├─ Validation structures événements
│  └─ Test avec invalid payloads
└─ Documentation (1h):
   └─ Créer DOCUMENTATION/API_PHASE1.md (20 endpoints)

📋 JOUR 4 (Lundi)
├─ Morning (4h):
│  ├─ Créer server-new/seed-data-phase1.js
│  ├─ Seed 1 user + 3 cultivars + 1 tree + 3 setups
│  ├─ Seed 1 review + 1 pipeline + 10 stages with events
│  └─ Run: node seed-data-phase1.js
├─ Afternoon (2h):
│  ├─ Créer test suite (Jest)
│  ├─ 18 tests: CRUD, auth, validation
│  └─ npm test → ✅ 18/18 passing
└─ QA (1h):
   └─ Final check: database reset + fresh seed

📋 JOUR 5 (Mardi)
├─ Morning (2h):
│  ├─ Bug fixes from QA
│  ├─ Performance: check N+1 queries
│  └─ Add indexes if needed
├─ Afternoon (2h):
│  ├─ Documentation review
│  ├─ Prepare demo data
│  └─ Write API_PHASE1.md examples
└─ Handoff (1h):
   └─ Demo to frontend team + review code
```

**Success Criteria**:
- ✅ All 21 API endpoints created
- ✅ All Prisma models complete
- ✅ Seed script creates realistic test data
- ✅ 18 tests passing
- ✅ API documented with cURL examples
- ✅ Frontend dev can integrate without backend questions

---

### Frontend Dev (React)

**Responsabilité**: Intégration PhenoHunt + SECTION 3 Form + Canvas Improvements

**Détail des 5 jours**:

```
📋 JOUR 1 (Mercredi)
├─ Morning (2h):
│  ├─ Lire PHASE_1_KICKOFF.md en entier
│  ├─ Lire PHENOHUNT_STATUS.md
│  └─ Vérifier ReviewForm.jsx structure
├─ Afternoon (3h):
│  ├─ Audit ReviewFormSection2.jsx
│  ├─ Identifier où ajouter button "Charger du PhenoHunt"
│  └─ Design: modal ou popup?
└─ Research (1h):
   └─ Vérifier CanevasPhenoHunt.jsx complexity

📋 JOUR 2 (Jeudi)
├─ Morning (3h):
│  ├─ Créer client/src/components/genetics/PhenoHuntImportModal.jsx
│  ├─ Modal: liste d'arbres + phénotypes
│  ├─ Select dropdown + import button
│  └─ Style: Tailwind (Apple-like design)
├─ Afternoon (2h):
│  ├─ Intégrer modal à ReviewFormSection2.jsx
│  ├─ Button click → opens modal
│  └─ Select cultivar → remplit field + closes
└─ Testing (1h):
   └─ Manual: click flow works end-to-end

📋 JOUR 3 (Vendredi)
├─ Morning (4h):
│  ├─ Créer client/src/pages/ReviewFormSection3.jsx
│  ├─ Inputs: mode (radio), dates (calendar picker)
│  ├─ Setup selector (checkboxes, 9 options)
│  └─ Textarea for notes
├─ Afternoon (2h):
│  ├─ Créer client/src/components/pipeline/CalendarView.jsx
│  ├─ Grid: 90 days (10x9 layout)
│  ├─ Dots for events (colored: arrosage=🔵, engrais=🥗)
│  └─ Interactive: click day → see/add events
└─ Responsive (1h):
   └─ Test mobile (iPhone, iPad)

📋 JOUR 4 (Lundi)
├─ Morning (3h):
│  ├─ Améliorer CanevasPhenoHunt.jsx
│  ├─ Add: Tab system (React Tabs component)
│  ├─ Add: Cultivar drag-from-sidebar
│  └─ Test: UI works with 2 tabs open
├─ Afternoon (2h):
│  ├─ Context menu "Dupliquer phénotype"
│  ├─ Auto-generate code: Pheno_A1 → Pheno_A2
│  └─ Test: duplication logic correct
└─ Styling (1h):
   └─ Polish: animations, transitions

📋 JOUR 5 (Mardi)
├─ Morning (2h):
│  ├─ Integration testing Section 2 → Section 3
│  ├─ Flow: Select cultivar → check it persists
│  └─ API integration: test POST /api/pipelines
├─ Afternoon (2h):
│  ├─ Component tests (Jest/Vitest)
│  ├─ 5 tests: modal, calendar, form, integration
│  └─ npm test → ✅ 5/5 passing
└─ Handoff (1h):
   └─ Demo to product + backend handoff
```

**Success Criteria**:
- ✅ PhenoHunt import modal works end-to-end
- ✅ SECTION 3 form displays correctly
- ✅ Calendar view shows 90 days with events
- ✅ Setup selector functional
- ✅ Canvas improvements: tabs + drag-drop + duplication
- ✅ All mobile responsive
- ✅ 5 tests passing

---

### QA/Testing Lead

**Responsabilité**: Test plan + execution + bug tracking

**Détail des 5 jours**:

```
📋 JOUR 1 (Mercredi)
├─ Morning (1h):
│  └─ Lire PHASE_1_KICKOFF.md Testing section
├─ Afternoon (4h):
│  ├─ Créer test matrix (18 backend + 5 frontend + 3 integration)
│  ├─ Créer Jira tickets pour chaque test
│  ├─ Assign to QA team
│  └─ Setup test environment (local + staging)
└─ Prep (1h):
   └─ Prepare Postman collection

📋 JOUR 2-3 (Jeudi-Vendredi)
├─ Continuous (4h/day):
│  ├─ Backend testing as APIs delivered
│  ├─ Run 18 backend tests daily
│  ├─ Frontend component testing as components delivered
│  ├─ Run 5 frontend tests daily
│  └─ Bug reporting → Jira
└─ Documentation (1h/day):
   └─ Test results spreadsheet

📋 JOUR 4 (Lundi)
├─ Full Day Integration Testing (6h):
│  ├─ End-to-end: Cultivar select → Pipeline creation
│  ├─ Test all 3 workflows:
│  │  └─ Simple: Single setup
│  │  └─ Complex: Multiple setups
│  │  └─ Edge: Minimal data
│  ├─ Test error cases:
│  │  └─ Invalid dates, empty fields, etc
│  └─ Document issues → Jira
└─ Regression (1h):
   └─ Previous functionality still works

📋 JOUR 5 (Mardi)
├─ Morning (2h):
│  ├─ Bug triage
│  ├─ Critical bugs: block launch
│  ├─ Major: fix before demo
│  └─ Minor: post-launch
├─ Afternoon (2h):
│  ├─ Final test run
│  ├─ Create test report
│  └─ Sign-off for launch
└─ Documentation (1h):
   └─ Testing retrospective
```

**Success Criteria**:
- ✅ 18 backend tests passing
- ✅ 5 frontend tests passing
- ✅ 3 integration tests passing
- ✅ < 5 critical bugs unfixed
- ✅ All tests documented
- ✅ Coverage report: ≥ 80%

---

### Product Manager / Tech Lead

**Responsabilité**: Alignment + blockers removal + demos

**Détail des 5 jours**:

```
📋 JOUR 1 (Mercredi)
├─ Daily Standup (30min): Kickoff
│  ├─ Explain vision
│  ├─ Clarify blockers
│  └─ Setup communication channels
├─ Documentation Review (1h):
│  ├─ Read PHASE_1_KICKOFF.md with team
│  ├─ Clarify any questions
│  └─ Confirm timeline realistic
└─ Risk Mitigation (1h):
   ├─ Identify blockers (auth issues, infra, etc)
   ├─ Prep mitigation plans
   └─ Communicate to stakeholders

📋 JOUR 2-4 (Jeudi-Samedi)
├─ Daily (15min standup):
│  ├─ Dev status: on track? blocked?
│  ├─ Frontend status
│  ├─ QA status
│  └─ Action items for today
├─ 1:1 Checkins (1h total):
│  ├─ Backend dev: questions about API design?
│  ├─ Frontend dev: integration issues?
│  ├─ QA lead: findings?
│  └─ Act as proxy to unblock
└─ Weekly Planning (30min):
   └─ Adjust timeline if needed

📋 JOUR 5 (Mardi)
├─ Demo Preparation (2h):
│  ├─ Validate everything works
│  ├─ Create demo script
│  ├─ Prepare contingency (pre-recorded video)
│  └─ Brief team on demo flow
├─ Internal Demo (1h):
│  ├─ Show: Cultivar import → Pipeline creation
│  ├─ Show: Calendar view
│  ├─ Show: Setup presets
│  └─ Gather feedback
├─ Retrospective (1h):
│  ├─ What went well?
│  ├─ What was hard?
│  ├─ Improvements for Phase 2
│  └─ Document learnings
└─ Phase 2 Planning (1h):
   ├─ Discuss Section 4-9 (Evaluations)
   ├─ Start Phase 2 scope
   └─ Schedule Phase 2 kickoff
```

**Success Criteria**:
- ✅ No blockers left unresolved
- ✅ Team feels supported
- ✅ Demo is successful
- ✅ Feedback collected for Phase 2
- ✅ Timeline met (or documented delay reason)

---

## 📊 Daily Standup Format

```
⏰ 9:00 AM DAILY (10-15 minutes)

Attendees: Backend Lead, Frontend Lead, QA Lead, PM/Tech Lead

Format:
┌─ BACKEND ────────────────────────────────────┐
│ What done yesterday?                          │
│ - CultureSetup model completed               │
│ - 4/8 endpoints implemented                  │
│                                               │
│ What's today?                                │
│ - Complete 4 remaining endpoints             │
│ - Start on pipeline routes                   │
│                                               │
│ Blockers?                                    │
│ - (none) or list them                        │
└───────────────────────────────────────────────┘

┌─ FRONTEND ────────────────────────────────────┐
│ What done yesterday?                          │
│ - Reviewed Section 2 form structure          │
│ - Designed import modal                      │
│                                               │
│ What's today?                                │
│ - Create PhenoHuntImportModal component      │
│ - Integrate with Section 2                   │
│                                               │
│ Blockers?                                    │
│ - Waiting on backend: GET /api/genetics/trees │
└───────────────────────────────────────────────┘

┌─ QA ──────────────────────────────────────────┐
│ What tested?                                  │
│ - Backend POST /api/culture-setup (✅)       │
│ - Backend GET /api/culture-setup (✅)        │
│                                               │
│ Issues found?                                │
│ - None so far                                │
│                                               │
│ What's today?                                │
│ - Test remaining endpoints                  │
│ - Start frontend component tests             │
└───────────────────────────────────────────────┘

Action Items → Jira
```

---

## 📈 Success Metrics Phase 1

### Technical Metrics

| Metric | Target | Week 1 | Week 2 | Final |
|--------|--------|--------|--------|-------|
| Backend endpoints | 20 | 10 | 18 | ✅ 20+ |
| Prisma models | 6 | 4 | 6 | ✅ 6 |
| API tests passing | 18 | 8 | 18 | ✅ 18 |
| Frontend components | 5 | 2 | 5 | ✅ 5 |
| Integration tests | 3 | 1 | 3 | ✅ 3 |
| Bugs critical | <5 | - | - | ✅ 0 |
| Bugs major | <10 | - | - | ✅ <3 |

### User Experience Metrics

| Metric | Target | Baseline | Week 2 |
|--------|--------|----------|--------|
| Time to create review | <5 min | N/A | ✅ <4 min |
| PhenoHunt import clicks | 1 | N/A | ✅ 1-2 |
| Mobile responsive | 100% | 50% | ✅ 100% |
| Accessibility score | 85+ | 60 | ✅ 88 |

### Code Quality Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Test coverage | 80%+ | ⏳ Week 2 |
| Code duplication | <5% | ⏳ Week 2 |
| Performance (FCP) | <2s | ⏳ Week 2 |
| API response time | <100ms | ⏳ Week 2 |

---

## 🎯 Definition of "Done" Phase 1

```
✅ DONE Criteria:

Backend:
├─ All 20 API endpoints implemented
├─ All Prisma models created + migrated
├─ Seed script creates realistic test data
├─ 18 backend tests passing (100%)
├─ API documented (OpenAPI/Swagger)
└─ All endpoints return proper error codes

Frontend:
├─ PhenoHunt import modal functional
├─ Section 1-3 forms display correctly
├─ Calendar view shows 90 days + events
├─ All components responsive (mobile OK)
├─ 5 frontend tests passing (100%)
└─ No console errors in dev mode

QA:
├─ 3 integration tests passing
├─ <5 critical bugs
├─ <10 major bugs
├─ All test cases documented
└─ Test report signed off

Documentation:
├─ API_PHASE1.md complete (20+ endpoints)
├─ Architecture diagram updated
├─ Testing report completed
├─ Lessons learned documented
└─ Phase 2 kickoff plan created

Demo:
├─ Live demo successful
├─ Stakeholder feedback collected
├─ Features match requirements
└─ Timeline met (or delay documented)
```

---

**Créé**: 2026-01-15  
**Responsable**: Product Manager + Tech Lead  
**Statut**: 🟢 Ready to Share with Team
