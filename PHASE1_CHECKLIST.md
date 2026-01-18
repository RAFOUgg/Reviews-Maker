# ✅ MVP1 Development Checklist

**Project:** Terpologie MVP1  
**Target:** 15 Février 2026  
**Status:** Phase 1 - Backend Foundation (Starting)  
**Reference:** [MVP1_GIT_WORKFLOW.md](./MVP1_GIT_WORKFLOW.md)

---

## 📋 Feature 1: Backend - Normalize Account Types ⭐ PRIORITY

### Setup
- [ ] Create branch: `git checkout -b feat/backend-normalize-account-types`
- [ ] Reference: CAHIER_DES_CHARGES_FINAL_GELE.md Section 1.1

### Task Breakdown
- [ ] **Audit current implementation**
  - [ ] Check: `server-new/services/account.js` - ACCOUNT_TYPES values
  - [ ] Check: `server-new/routes/auth.js` - sanitizeUser() return structure
  - [ ] Check: `server-new/routes/account.js` - POST `/api/account/change-type`
  - [ ] Check: `server-new/middleware/permissions.js` - ACCOUNT_TYPES export
  - [ ] Check: `client/src/hooks/useAccountPermissions.js` - ACCOUNT_TYPES frontend

- [ ] **Identify naming inconsistencies**
  - [ ] Backend currently uses: CONSUMER, PRODUCER, INFLUENCER, BETA_TESTER
  - [ ] Frontend uses: AMATEUR, PRODUCTEUR, INFLUENCEUR
  - [ ] Normalize to: `'amateur'`, `'producteur'`, `'influenceur'` (strings, lowercase)

- [ ] **Update Backend (server-new/)**
  - [ ] `server-new/services/account.js`
    - [ ] Update ACCOUNT_TYPES object (use lowercase strings)
    - [ ] Update getUserAccountType() function
  - [ ] `server-new/routes/auth.js`
    - [ ] Update sanitizeUser() to return correct tier strings
  - [ ] `server-new/routes/account.js`
    - [ ] Update POST `/api/account/change-type` validation
    - [ ] Update GET `/api/account/types` response
  - [ ] `server-new/middleware/permissions.js`
    - [ ] Update ACCOUNT_TYPES export
    - [ ] Update all tier checks

- [ ] **Update Frontend (client/src/)**
  - [ ] `client/src/hooks/useAccountPermissions.js`
    - [ ] Update ACCOUNT_TYPES (use lowercase strings)
    - [ ] Update all permission checks
  - [ ] `client/src/stores/` or Zustand store
    - [ ] Update user.accountType initial value
    - [ ] Update setAccountType() setter

- [ ] **Database/Prisma**
  - [ ] Check: `server-new/prisma/schema.prisma` - User.accountType field
  - [ ] Verify: field type is string with enum or no enum (flexible)
  - [ ] Migration: Script to update existing users (if needed)

- [ ] **Tests**
  - [ ] Test tier changes: Amateur → Influenceur → Producteur → Amateur
  - [ ] Test API: GET `/api/account/types` returns correct structure
  - [ ] Test Zustand: user.accountType updates on login
  - [ ] Test permissions: Hooks return correct values per tier

### Code Review Checklist
- [ ] No hardcoded ACCOUNT_TYPES values (use const)
- [ ] All files updated (backend + frontend)
- [ ] Zostand store synced with backend tier
- [ ] Tests pass locally
- [ ] No console errors

### Commit Messages
```
feat(backend): Normalize account types to amateur/producteur/influenceur (#1)
refactor(frontend): Update ACCOUNT_TYPES to lowercase strings
test(auth): Verify tier changes work correctly
```

### Done Criteria
- [ ] All ACCOUNT_TYPES use: `'amateur'`, `'producteur'`, `'influenceur'`
- [ ] Backend & Frontend in sync
- [ ] No runtime errors
- [ ] Tests pass

---

## 📋 Feature 2: Backend - Centralize FEATURE_MATRIX & Permissions

### Setup
- [ ] Create branch: `git checkout -b feat/backend-centralize-permissions`
- [ ] Reference: CAHIER_DES_CHARGES_FINAL_GELE.md Section 8.1-8.2
- [ ] Depends on: Feature 1 ✅

### Task Breakdown
- [ ] **Create Central FEATURE_MATRIX**
  - [ ] New file: `server-new/services/permissions.js`
  - [ ] Define FEATURE_MATRIX object (what tiers can access what)
  - [ ] Example:
    ```javascript
    const FEATURE_MATRIX = {
      'pipeline_culture': { amateur: false, influenceur: false, producteur: true },
      'export_svg': { amateur: false, influenceur: true, producteur: true },
      'filigrane_custom': { amateur: false, influenceur: true, producteur: true },
      'arbre_genealogie': { amateur: false, influenceur: false, producteur: true },
      // ... all features from cahier
    };
    ```

- [ ] **Implement Permission Functions**
  - [ ] `canAccessFeature(tier, featureId)` → boolean
  - [ ] `canExportFormat(tier, format)` → boolean (PNG, JPEG, PDF, SVG, CSV, JSON, HTML)
  - [ ] `getMaxDPI(tier)` → number (150, 300)
  - [ ] `getMaxWatermarks(tier)` → number (0 for amateur, 5 for influenceur, unlimited for producteur)
  - [ ] `canEditPipeline(tier, pipelineType)` → boolean

- [ ] **Implement Backend Middleware**
  - [ ] `requireFeature(featureId)` middleware
    - [ ] Get user.accountType from JWT
    - [ ] Check canAccessFeature(accountType, featureId)
    - [ ] Return 403 Forbidden if denied
  - [ ] `requireTier(tier)` middleware
    - [ ] Check if user.accountType matches tier(s)
    - [ ] Return 403 Forbidden if denied

- [ ] **Apply Middleware to Protected Routes**
  - [ ] List all sensitive endpoints:
    - [ ] POST `/api/fiches` (create Fiche)
    - [ ] PUT `/api/fiches/:id` (edit Fiche)
    - [ ] POST `/api/pipelines/culture` (create culture pipeline - Producteur only)
    - [ ] POST `/api/pipelines/curing` (create curing pipeline - Payants only)
    - [ ] POST `/api/genealogy` (create arbre généalogique - Producteur only)
    - [ ] POST `/api/export` (export Fiche - with format check)
    - [ ] POST `/api/watermarks` (create custom watermark)
    - [ ] (Add all from cahier des charges)
  - [ ] Apply middleware to each:
    ```javascript
    router.post('/api/pipelines/culture', 
      requireAuth, 
      requireTier('producteur'), 
      createPipeline
    );
    ```

- [ ] **Logging & Audit**
  - [ ] Log when access denied: `[403] User X tried to access feature Y (tier Z not allowed)`
  - [ ] Store in database if important
  - [ ] Admin can view logs at `/admin/logs`

- [ ] **Tests**
  - [ ] Test tier permissions: Amateur can't access feature, Producteur can
  - [ ] Test API returns 403 Forbidden for unauthorized tier
  - [ ] Test middleware applied to all protected routes
  - [ ] Test export format restrictions (Amateur: PNG/JPEG/PDF only)

### Code Review Checklist
- [ ] FEATURE_MATRIX covers all features from cahier des charges
- [ ] No permission bypass (all POST/PUT checked)
- [ ] Error messages helpful (not revealing system details)
- [ ] Tests pass
- [ ] Logging present for audit trail

### Commit Messages
```
feat(backend): Create centralized FEATURE_MATRIX and permission functions (#2)
feat(backend): Implement requireFeature and requireTier middleware
test(permissions): Verify all tier restrictions work correctly
```

### Done Criteria
- [ ] FEATURE_MATRIX comprehensive
- [ ] All protected endpoints use middleware
- [ ] 403 Forbidden for unauthorized access
- [ ] Tests pass
- [ ] No console errors

---

## 📋 Feature 3: Frontend - Restructure AccountPage

### Setup
- [ ] Create branch: `git checkout -b feat/frontend-restructure-accountpage`
- [ ] Reference: CAHIER_DES_CHARGES_FINAL_GELE.md Section 5
- [ ] Depends on: Feature 1 ✅

### Task Breakdown
- [ ] **Audit Current AccountPage**
  - [ ] Open: `client/src/pages/account/AccountPage.jsx`
  - [ ] Identify sections to REMOVE:
    - [ ] SavedDataSection (move to Library)
    - [ ] TemplatesSection (move to Library)
    - [ ] WatermarksSection (move to Library)
  - [ ] Identify sections to KEEP:
    - [ ] ProfileSection
    - [ ] PreferencesSection
  - [ ] Identify sections to ADD:
    - [ ] EnterpriseDataSection (Producteur/Influenceur only)
    - [ ] BillingSection (if subscribed)

- [ ] **Remove Unnecessary Sections**
  - [ ] Delete SavedDataSection.jsx (or move to library)
  - [ ] Delete TemplatesSection.jsx (or move to library)
  - [ ] Delete WatermarksSection.jsx (or move to library)
  - [ ] Remove from TAB_SECTIONS array
  - [ ] Remove corresponding imports

- [ ] **Create New Sections**
  - [ ] Create: `client/src/pages/account/sections/EnterpriseDataSection.jsx`
    - [ ] Show: Company name, SIRET, KYC status, etc
    - [ ] Visible: Producteur/Influenceur only
  - [ ] Create: `client/src/pages/account/sections/BillingSection.jsx`
    - [ ] Show: Current plan, renewal date, payment methods
    - [ ] Visible: Only if subscribed (account.accountType != 'amateur')

- [ ] **Update TAB_SECTIONS**
  - [ ] Keep: profile, preferences
  - [ ] Add: enterprise-data (Producteur/Influenceur), billing (if subscribed)
  - [ ] Add visibility guards per tier

- [ ] **Apply Permission Guards**
  - [ ] Use `useAccountPermissions()` hook
  - [ ] Check `permissions.canAccessSection('enterprise_data')`
  - [ ] Hide tabs if not allowed

- [ ] **Update Routing**
  - [ ] Ensure `/account` route still works
  - [ ] No new routes needed

- [ ] **Tests**
  - [ ] Amateur: See profile + preferences only
  - [ ] Influenceur: See profile + preferences + enterprise-data
  - [ ] Producteur: See profile + preferences + enterprise-data
  - [ ] If subscribed: See billing section

### Code Review Checklist
- [ ] No SavedData/Templates/Watermarks sections
- [ ] Permission guards applied
- [ ] Sections visible per tier
- [ ] No console errors
- [ ] Zustand user.accountType triggers correct render

### Commit Messages
```
refactor(frontend): Remove SavedData/Templates/Watermarks from AccountPage (#3)
feat(frontend): Add EnterpriseDataSection and BillingSection to AccountPage
```

### Done Criteria
- [ ] AccountPage shows profile + preferences + tier-specific sections
- [ ] No "wrong content" on wrong page
- [ ] Permission guards working

---

## 📋 Feature 4: Frontend - Create LibraryPage

### Setup
- [ ] Create branch: `git checkout -b feat/frontend-create-librarypage`
- [ ] Reference: CAHIER_DES_CHARGES_FINAL_GELE.md Section 3
- [ ] Depends on: Feature 1 ✅, Feature 3 (cleanup)

### Task Breakdown
- [ ] **Create LibraryPage Structure**
  - [ ] New file: `client/src/pages/library/LibraryPage.jsx`
  - [ ] Layout: Tabbed interface (similar to AccountPage)
  - [ ] Tabs:
    1. `cultivars` (Producteur only) - Cultivos & Généalogie
    2. `fiches` (Tous) - Fiches Techniques Sauvegardées
    3. `templates` (Tous) - Templates & Aperçus
    4. `watermarks` (Tous, restrictions) - Filigranes Personnalisés
    5. `recurring-data` (Producteur only) - Données Récurrentes

- [ ] **Tab 1: Cultivars & Génétiques (Producteur only)**
  - [ ] Move from AccountPage or create new
  - [ ] Features:
    - [ ] List cultivars (name, breeder, type)
    - [ ] Create new cultivar
    - [ ] Edit / Duplicate / Delete
    - [ ] View arbre généalogique
    - [ ] Filters: breeder, type, search

- [ ] **Tab 2: Fiches Techniques Sauvegardées (Tous)**
  - [ ] Move from AccountPage
  - [ ] Features:
    - [ ] View list (list/grid/timeline toggle)
    - [ ] Filters: type, date, status, search
    - [ ] Actions: Edit, Duplicate, Delete, Share, Publish
    - [ ] Display: Fiche title, cultivar, date created

- [ ] **Tab 3: Templates & Aperçus (Tous)**
  - [ ] Move from AccountPage
  - [ ] Features:
    - [ ] List predefined templates (read-only)
    - [ ] List custom templates (Producteur/Influenceur)
    - [ ] Create new template
    - [ ] Edit / Duplicate / Delete
    - [ ] Mark as default
    - [ ] Display: Template name, canvas format, preview

- [ ] **Tab 4: Filigranes Personnalisés (Tous)**
  - [ ] Move from AccountPage with tier restrictions
  - [ ] Features:
    - [ ] List watermarks
    - [ ] Create new (Producteur/Influenceur)
    - [ ] Edit / Duplicate / Delete
    - [ ] Mark as default
    - [ ] Restrictions per tier:
      - [ ] Amateur: Texte simple seulement, positions prédéfinies
      - [ ] Influenceur: Texte + Image, opacités prédéfinies
      - [ ] Producteur: All types, position/opacité/scale custom

- [ ] **Tab 5: Données Récurrentes (Producteur only)**
  - [ ] New tab (from requirements)
  - [ ] Categories:
    - [ ] Substrats Récurrents
    - [ ] Engrais Récurrents
    - [ ] Matériel Récurrent
    - [ ] Techniques Récurrentes
  - [ ] Features:
    - [ ] Add / Edit / Delete
    - [ ] View: Name, type, usage count, last used
    - [ ] Auto-suggest en formulaire Culture

- [ ] **Routing**
  - [ ] Add route: `/library` → LibraryPage
  - [ ] Update nav: Link to /library from AccountPage or menu

- [ ] **Permission Guards**
  - [ ] Use `useAccountPermissions()` hook
  - [ ] Hide tabs if not allowed per tier
  - [ ] Show "Upgrade to access" for locked tabs

- [ ] **Tests**
  - [ ] Amateur: See fiches + templates + watermarks (restrict creation)
  - [ ] Influenceur: See all tabs except cultivars + recurring-data
  - [ ] Producteur: See all tabs

### Code Review Checklist
- [ ] All 5 tabs present
- [ ] Permission guards applied per tab
- [ ] No errors moving sections from AccountPage
- [ ] Routing correct
- [ ] Zustand state updated

### Commit Messages
```
feat(frontend): Create LibraryPage with 5 tabs (cultivars/fiches/templates/watermarks/recurring) (#4)
refactor(frontend): Move sections from AccountPage to LibraryPage
```

### Done Criteria
- [ ] LibraryPage shows all 5 tabs (with tier restrictions)
- [ ] Tabs functional and connected to data
- [ ] Navigation works

---

## 🎯 What's Next

After Feature 4 complete:
- **Phase 2 (Features 5-8):** Core data structures (Fiches Techniques 1-10, Pipelines)
- **Sync with server:** Ensure Zustand ↔ API communication

**Current Status:** Phase 1, Feature 1 starting

---

**Ready to code? Start Feature 1:**

```bash
git checkout dev/integrate-latest
git pull origin dev/integrate-latest
git checkout -b feat/backend-normalize-account-types
```

