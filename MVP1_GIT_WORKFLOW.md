# 🚀 MVP1 Git Workflow & Branch Structure

**Project:** Terpologie MVP1  
**Deadline:** 15 Février 2026 (28 jours)  
**Reference:** [CAHIER_DES_CHARGES_FINAL_GELE.md](./CAHIER_DES_CHARGES_FINAL_GELE.md)

---

## 📋 Branch Strategy

### Main Branches (Protégées)

```
main (Protected)
├─ Production-ready code
├─ Tag releases (v1.0.0, v1.0.1, etc)
└─ Merge ONLY via PR + approvals

dev (Integration)
├─ Daily development base
├─ Features merged here first
├─ Staging tests before main
└─ ALWAYS stable
```

### Feature Branches (Temporaires)

```
Format: <type>/<feature-name>

Types autorisés:
├─ feat/  → Nouvelle feature (cahier des charges)
├─ fix/   → Bug fix
├─ refactor/ → Restructuring (no functional change)
├─ docs/  → Documentation uniquement
├─ perf/  → Optimisations
└─ test/  → Tests uniquement

Exemples:
├─ feat/backend-normalize-account-types
├─ feat/frontend-restructure-accountpage
├─ fix/admin-panel-security
├─ refactor/clean-imports
└─ docs/section-3-data-complete
```

---

## 🎯 15 Features à Développer (MVP1)

### Phase 1: Backend Foundation (Jours 1-5)

#### Feature 1: Account Types Normalization ⭐ PRIORITY
```
Branch: feat/backend-normalize-account-types
├─ Normalize ACCOUNT_TYPES across backend (amateur/producteur/influenceur)
├─ Update Prisma schema (accountType field)
├─ Sync with existing code (account.js, auth.js, permissions.js)
├─ Test: Migration script for existing users
└─ Files: server-new/services/account.js, server-new/routes/auth.js

Dependencies: None
Estimated: 3-4 hours
```

#### Feature 2: Centralize FEATURE_MATRIX ⭐ PRIORITY
```
Branch: feat/backend-centralize-permissions
├─ Create central FEATURE_MATRIX in server-new/services/permissions.js
├─ Implement canAccessFeature('feature_id') function
├─ Implement canExportFormat('format') by tier
├─ Implement requireFeature() middleware
├─ Apply middleware to all protected routes (POST/PUT sensibles)
├─ Test: API rejects with 403 Forbidden for unauthorized tier
└─ Files: server-new/services/permissions.js, server-new/routes/*.js

Dependencies: Feature 1
Estimated: 4-5 hours
```

### Phase 2: Frontend Architecture (Jours 6-10)

#### Feature 3: Restructure AccountPage
```
Branch: feat/frontend-restructure-accountpage
├─ Remove: SavedDataSection, TemplatesSection, WatermarksSection
├─ Keep: ProfileSection, PreferencesSection
├─ Add: EnterpriseDataSection (Producteur/Influenceur), BillingSection
├─ Update routes/navigation
├─ Test: Sections visible/hidden per tier
└─ Files: client/src/pages/account/AccountPage.jsx, sections/*

Dependencies: None
Estimated: 3-4 hours
```

#### Feature 4: Create LibraryPage
```
Branch: feat/frontend-create-librarypage
├─ New page: /library with 5 tabs
│  ├─ CultivarsTab (Producteur only) - import from sections if exists
│  ├─ FicheTechniquesTab (Tous) - move from AccountPage
│  ├─ TemplatesTab (Tous) - move from AccountPage
│  ├─ FiliggramesTab (Tous, restrictions) - move from AccountPage
│  └─ DataRecurrentesTab (Producteur only)
├─ Update routing
├─ Test: Permission guards per tab
└─ Files: client/src/pages/library/LibraryPage.jsx, client/src/pages/library/*

Dependencies: Feature 1 (permissions)
Estimated: 4-5 hours
```

### Phase 3: Core Data Structures (Jours 11-16)

#### Feature 5: Fiche Technique Sections 1-10 Data
```
Branch: feat/fiche-technique-sections-complete
├─ Section 1: Infos Générales (complete fields)
├─ Section 2: Génétiques & Généalogie (avec arbre Producteur)
├─ Section 3: Pipeline Culture (modes: Jours/Semaines/Phases/Mois)
├─ Section 4: Données Analytiques (optionnel)
├─ Section 5: Visuel & Technique (7 critères)
├─ Section 6: Odeurs (max 7 notes)
├─ Section 7: Texture (5 critères)
├─ Section 8: Goûts (profils saveurs)
├─ Section 9: Effets Ressentis (max 8 profils)
├─ Section 10: Pipeline Maturation (modes: S/H/J/S/M)
├─ Update Prisma schema if needed
├─ Reference: CAHIER_DES_CHARGES_FINAL_GELE.md section 2.2
└─ Files: client/src/pages/create-fiche-technique/*, server-new/routes/fiches.js

Dependencies: None (parallel OK)
Estimated: 8-10 hours
```

#### Feature 6: Pipeline Culture (Producteur)
```
Branch: feat/pipeline-culture
├─ Modes: JOURS / SEMAINES / PHASES / MOIS
├─ Étapes configurables: [GENERAL] [ENVIRONNEMENT] [PALISSAGE] [MORPHOLOGIE] [RÉCOLTE]
├─ Sous-configurations cascadées (config → sous-config → ...)
├─ UI: Ajouter/modifier/supprimer étapes
├─ Validation: Tous champs optionnels sauf nom/photo
├─ Reference: CAHIER_DES_CHARGES_FINAL_GELE.md section 2.2
└─ Files: client/src/pages/create-fiche-technique/sections/PipelineCulture.jsx

Dependencies: Feature 5
Estimated: 6-8 hours
```

#### Feature 7: Arbre Généalogique (Producteur)
```
Branch: feat/genealogy-tree
├─ Canvas: Drag & drop cultivars depuis biblio
├─ Relations: Support illimité (up to 100 phénos)
├─ Code phénotype: Auto-généré ou preset per projet
├─ Visualisation: Graph interactif (Cytoscape ou Vis.js)
├─ Persistance: Save arbre state
├─ UI: Add/edit/delete phénos dans arbre
├─ Reference: CAHIER_DES_CHARGES_FINAL_GELE.md section 2.2 & 3.1
└─ Files: client/src/components/genealogy/GenealogyCanvas.jsx

Dependencies: Feature 5
Estimated: 8-10 hours
```

#### Feature 8: Pipeline Curing (Tous payants, édition)
```
Branch: feat/pipeline-curing
├─ Modes: SECONDES / HEURES / JOURS / SEMAINES / MOIS
├─ Paramètres: Temp, HR, type récipient, emballage, ballotage cascadé
├─ Étapes: Modifier params + notes + re-évaluation sections
├─ Ballotage: Couche par couche d'emballage (complex structure)
├─ Données évolution: N'écrasent PAS notes finales Fiche
├─ Influenceur: Édition complète
├─ Reference: CAHIER_DES_CHARGES_FINAL_GELE.md section 2.2
└─ Files: client/src/pages/create-fiche-technique/sections/PipelineCuring.jsx

Dependencies: Feature 5
Estimated: 6-8 hours
```

### Phase 4: Export System (Jours 17-20)

#### Feature 9: Export Maker 5 Templates
```
Branch: feat/export-maker-templates
├─ Template 1: Compact (1:1 only)
├─ Template 2: Détaillé (1:1, 16:9, 9:16, A4)
├─ Template 3: Complète (tous formats - Producteur only)
├─ Template 4: Influenceur (9:16 only)
├─ Template 5: Vide/Personnalisé (Producteur/Influenceur - drag&drop)
├─ Canvas selection: 1:1, 16:9, 9:16, A4
├─ Format verrouillé après données ajoutées
├─ Reference: CAHIER_DES_CHARGES_FINAL_GELE.md section 4.1
└─ Files: client/src/pages/export-maker/ExportMaker.jsx, client/src/components/export/*

Dependencies: Features 5-8 (sections data complete)
Estimated: 6-8 hours
```

#### Feature 10: Export File Formats (PNG/JPEG/PDF/SVG/CSV/JSON/HTML)
```
Branch: feat/export-formats
├─ Amateur: PNG, JPEG, PDF (150 DPI)
├─ Influenceur: PNG, JPEG, PDF, SVG, CSV, JSON (300 DPI)
├─ Producteur: PNG, JPEG, PDF, SVG, CSV, JSON, HTML (300 DPI)
├─ CSV/JSON: Par section (pas par étape pipeline)
├─ HTML: Format interactif (sections/pipelines détails)
├─ DPI configurable: Selon tier
├─ Reference: CAHIER_DES_CHARGES_FINAL_GELE.md section 4.3
└─ Files: client/src/services/exportService.js, server-new/services/export.js

Dependencies: Feature 9
Estimated: 6-8 hours
```

### Phase 5: Gallery & Admin (Jours 21-26)

#### Feature 11: Galerie Publique (Completion)
```
Branch: feat/gallery-public-complete
├─ Display: Fiches publiques (grid/list/timeline)
├─ Filtres: Type, date, rating, recherche FT, payant only
├─ Tri: Récent, Top, Trending, Alphabétique
├─ Pagination: 25 items/page, "Voir plus"
├─ Likes: Counter simple
├─ Commentaires: Container prêt (modération keyword + /admin)
├─ Authentification: Login requis pour interaction
├─ Reference: CAHIER_DES_CHARGES_FINAL_GELE.md section 6.1-6.2
└─ Files: client/src/pages/gallery/GalleryPage.jsx

Dependencies: Features 5, 2 (permissions)
Estimated: 5-7 hours
```

#### Feature 12: Admin Panel Security ⭐ URGENT FIX
```
Branch: fix/admin-panel-security
├─ Current issue: Accessible par tous (même non connecté)
├─ Fix: requireAuth + requireAdmin middleware
├─ Endpoints: GET/POST /admin/* (admin only)
├─ Features:
│  ├─ Voir signalements
│  ├─ Approuver/Rejeter Fiches publiques
│  ├─ Supprimer Fiches/commentaires
│  ├─ Ban utilisateurs (temporaire/permanent)
│  └─ Logs modération
├─ Keyword blacklist: Auto-filter
├─ Reference: CAHIER_DES_CHARGES_FINAL_GELE.md section 6.3
└─ Files: server-new/middleware/auth.js, server-new/routes/admin.js

Dependencies: Feature 2 (permissions middleware)
Estimated: 3-4 hours
```

### Phase 6: Payment & Permissions (Jours 27-28)

#### Feature 13: Payment Setup (PayPal + GooglePay + Bypass)
```
Branch: feat/payment-integration
├─ PayPal integration (NPM: paypal-checkout-sdk)
├─ GooglePay integration (NPM: @google-pay/button-react)
├─ Subscription flow: Influenceur & Producteur
├─ Tier upgrade/downgrade logic
├─ Pause abonnement (1 mois min)
├─ Invoice generation (PDF)
├─ BYPASS SYSTEM: Env var PAYMENT_BYPASS=true
│  ├─ Skip payment check when true
│  ├─ Allows all tiers in beta
│  ├─ Toggle in 1 click: Set PAYMENT_BYPASS=false after MVP1
├─ Reference: CAHIER_DES_CHARGES_FINAL_GELE.md section 5.4
└─ Files: server-new/routes/payment.js, client/src/pages/billing/BillingPage.jsx

Dependencies: Feature 1 (account types)
Estimated: 5-7 hours
```

#### Feature 14: Frontend/Backend Permissions Sync
```
Branch: feat/permissions-sync
├─ Frontend:
│  ├─ Hook: usePermissions() (check droits)
│  ├─ Component: FeatureGuard (masquer UI)
│  ├─ Component: SectionGuard (sections tier-restricted)
│  ├─ Zustand: user.accountType sync
│  └─ Routes: PrivateRoute protégées
├─ Backend:
│  ├─ Middleware: requireFeature('feature_id')
│  ├─ Vérification: POST/PUT sensibles
│  ├─ Rejet: 403 Forbidden
│  └─ Logs audit
├─ Sync: API returns accountType, Frontend re-checks
├─ Reference: CAHIER_DES_CHARGES_FINAL_GELE.md section 8.2
└─ Files: client/src/hooks/usePermissions.js, server-new/services/permissions.js

Dependencies: Features 1-4, 12
Estimated: 4-6 hours
```

#### Feature 15: E2E Testing (Tous tiers)
```
Branch: test/e2e-all-tiers
├─ Test framework: Playwright ou Cypress
├─ Scenarios:
│  ├─ Amateur flow: Create fiche, export 150DPI, voir filigrane TERPOLOGIE
│  ├─ Influenceur flow: Create + pipeline curing, export 300DPI+SVG, custom watermark
│  ├─ Producteur flow: Full pipeline + arbre généalogique + export tous formats
├─ Permission tests: Vérifier 403 Forbidden si unauthorized
├─ Gallery tests: Like/comment (requires login), filters work
├─ Admin tests: Only admin can access /admin
├─ Reference: CAHIER_DES_CHARGES_FINAL_GELE.md section 8.1
└─ Files: playwright/e2e/*, cypress/e2e/*

Dependencies: All features (15)
Estimated: 6-8 hours
```

---

## 📅 Timeline (28 jours - 15 Feb 2026)

```
Semaine 1 (18-24 Janvier):
└─ Phase 1 Backend Foundation
   ├─ Jours 1-3: Feature 1 (account types) + Feature 2 (FEATURE_MATRIX)
   └─ Jours 4-5: Feature 3-4 (Frontend restructure AccountPage + create LibraryPage)

Semaine 2 (25-31 Janvier):
└─ Phase 2-3 Data Structures
   ├─ Jours 6-8: Feature 5 (sections 1-10 data)
   ├─ Jours 9-10: Feature 6-8 (pipelines + arbre généalogique)
   └─ Jours 11-14: Feature 6-8 (continue)

Semaine 3 (1-7 Février):
└─ Phase 4 Export System
   ├─ Jours 15-17: Feature 9 (templates)
   ├─ Jours 18-20: Feature 10 (formats)
   └─ Jours 21-22: Feature 11 (galerie public)

Semaine 4 (8-15 Février):
└─ Phase 5-6 Admin + Payment + Testing
   ├─ Jours 23-24: Feature 12 (admin security)
   ├─ Jours 25-26: Feature 13 (payment) + Feature 14 (permissions sync)
   ├─ Jours 27-28: Feature 15 (E2E testing + bug fixes)
   └─ Jour 28: Final review, production ready
```

---

## 🛠️ Git Workflow per Feature

### Step 1: Create Feature Branch
```bash
git checkout dev
git pull origin dev
git checkout -b feat/my-feature
```

### Step 2: Develop & Commit
```bash
# Small atomic commits
git add <specific files>
git commit -m "feat: Specific change (short desc)"
git push origin feat/my-feature
```

### Step 3: Create Pull Request
```
Title: [FEATURE-X] Brief description
Description:
- What: Changes made
- Why: Reason for change
- How: Implementation approach
- Testing: How tested
- Ref: CAHIER_DES_CHARGES_FINAL_GELE.md (section Y.Z)
```

### Step 4: Code Review & Merge
```bash
# After approval
git checkout dev
git merge --no-ff feat/my-feature
git push origin dev

# If critical/ready for prod:
git checkout main
git merge --no-ff dev
git tag -a v1.X.Y -m "Release version 1.X.Y"
git push origin main --tags
```

---

## ✅ Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat:` - New feature (cahier des charges)
- `fix:` - Bug fix
- `refactor:` - Code restructure (no functional change)
- `perf:` - Performance optimization
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Build, dependencies, etc

### Scope
- `backend`, `frontend`, `db`, `export`, `gallery`, `admin`, `payment`, `permissions`

### Subject
- Imperative, present tense ("add" not "added")
- No period at end
- Max 50 characters
- Reference feature: #1, #2, etc

### Example
```
feat(backend): Normalize account types to amateur/producteur/influenceur (#1)

- Update ACCOUNT_TYPES across account.js, auth.js, permissions.js
- Migration script for existing users
- Tests pass for all tier combinations

Ref: CAHIER_DES_CHARGES_FINAL_GELE.md section 1.1
```

---

## 🔒 Branch Protection Rules

### `main` Branch
- ✅ Require pull request reviews (1 approver min)
- ✅ Dismiss stale reviews
- ✅ Require status checks (tests + linting)
- ✅ Require branch up to date before merge
- ✅ Restrict who can push (maintainers only)

### `dev` Branch
- ✅ Require pull request reviews (optional, for flow)
- ✅ Status checks (tests)
- ✅ Merge via `--no-ff` (preserve history)

---

## 📊 Progress Tracking

Update todo list after each feature completion:
```bash
# Example after Feature 1 complete
- [x] Backend - Normalize account types (amateur/producteur/influenceur)
- [ ] Backend - Centraliser FEATURE_MATRIX & permissions
- ...
```

---

## 🎯 Key Principles

1. **Branch per feature**: 1 branch = 1 feature (from CAHIER_DES_CHARGES_FINAL_GELE.md)
2. **Small commits**: Atomic, reversible changes
3. **Descriptive messages**: Future readers understand WHY
4. **Test before push**: Run locally, pass tests
5. **Reference spec**: Every PR links to cahier des charges section
6. **Merge to dev first**: Integration point
7. **Tag releases**: v1.0.0, v1.0.1 on main
8. **No force pushes**: Only for hotfixes in shared branches (discouraged)

---

**🚀 Ready to start Feature 1? Execute:**

```bash
git checkout dev
git pull origin dev
git checkout -b feat/backend-normalize-account-types
```

