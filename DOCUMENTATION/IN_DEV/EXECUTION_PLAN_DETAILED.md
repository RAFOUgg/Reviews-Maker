# 🔨 PLAN DÉTAILLÉ REFACTORISATION SPRINT 2

**Date**: 17 janvier 2026  
**Status**: Début exécution

---

## 📍 SITUATION ACTUELLE DÉTAILLÉE

### Export System
```
ExportMaker.jsx (405 lignes)
├─ Current: Main export handler
├─ Used in: All product types
├─ Issue: Has DragDropExport but not wired to OrchardPanel

OrchardPanel.jsx (683 lignes) + 10 support files
├─ Currently: ONLY FLOWERS
├─ Wired in: CreateFlowerReview/index.jsx (line 332)
├─ Wired in: CreateReviewPage.jsx (old system, being deprecated)
├─ Wired in: EditReviewPage.jsx (generic, uses for all types)
├─ Issue: NOT generalized for Hash/Concentrates/Edibles

CreateFlowerReview/index.jsx (Has OrchardPanel)
CreateHashReview/index.jsx (NO OrchardPanel = INCOMPLETE)
CreateConcentrateReview/index.jsx (NO OrchardPanel = INCOMPLETE)
CreateEdibleReview/index.jsx (NO OrchardPanel = INCOMPLETE)
```

### Current Export Paths for Each Type
```
Fleurs (Flowers):
  CreateFlowerReview → OrchardPanel ✅ → ExportMaker ✅

Hash:
  CreateHashReview → ??? (NO EXPORT) ❌ → ExportMaker (incomplete)

Concentrés (Concentrates):
  CreateConcentrateReview → ??? (NO EXPORT) ❌ → ExportMaker (incomplete)

Comestibles (Edibles):
  CreateEdibleReview → ??? (NO EXPORT) ❌ → ExportMaker (incomplete)
```

---

## 🎯 PLAN D'EXÉCUTION

### PHASE 1: INTEGRATE PreferencesPage INTO AccountPage (1-2H)
**Goal**: Single unified `/account` page with all sections

**Steps**:
1. [ ] Analyze PreferencesPage.jsx structure completely
2. [ ] Design AccountPage modular sections architecture
3. [ ] Create section components (PersonalInfo, Preferences, Security, etc.)
4. [ ] Refactor AccountPage as container orchestrator
5. [ ] Integrate PreferencesPage tabs into Section 3 (Preferences)
6. [ ] Verify routes and navigation work
7. [ ] Test that localStorage/API calls work
8. [ ] Delete PreferencesPage.jsx (now obsolete)

**Output**: 
- AccountPage.jsx refactored into modular sections
- PreferencesPage.jsx deleted
- All functionality preserved in single `/account` page

---

### PHASE 2: GENERALIZE OrchardMaker (3-4H)
**Goal**: Extract OrchardPanel from Flowers, make reusable for all product types

**Current Structure**:
```
components/shared/orchard/ (11 files, 683 lines OrchardPanel)
├─ Old: Tightly coupled to Flower data structure
├─ Problem: Hardcoded field mappings for flowers
└─ Solution: Extract generic core, support productType prop
```

**Steps**:
1. [ ] Analyze OrchardPanel.jsx and all 10 support files
2. [ ] Identify Flower-specific vs Generic code
3. [ ] Extract productType-agnostic logic into core
4. [ ] Create product-type handlers (productType-specific field mappings)
5. [ ] Add `productType` prop to OrchardPanel
6. [ ] Refactor to support: 'flower', 'hash', 'concentrate', 'edible'
7. [ ] Test with CreateFlowerReview (ensure no regression)
8. [ ] Test with CreateHashReview
9. [ ] Test with CreateConcentrateReview
10. [ ] Test with CreateEdibleReview

**Key Changes**:
- Add productType prop to OrchardPanel
- Create mapping files: orchardMappings.flower.js, orchardMappings.hash.js, etc.
- Update field normalizers to handle each type's unique structure
- Ensure UnifiedPipeline (already generic) works for all types

**Output**:
- OrchardPanel works with all product types
- Clean separation of generic vs product-specific code

---

### PHASE 3: WIRE OrchardPanel TO ALL PRODUCT TYPES (2-3H)
**Goal**: Add OrchardPanel to Hash/Concentrates/Edibles creation pages

**Steps**:
1. [ ] Add OrchardPanel import to CreateHashReview/index.jsx
2. [ ] Wire it with productType="hash"
3. [ ] Test export flow for Hash
4. [ ] Add OrchardPanel to CreateConcentrateReview/index.jsx
5. [ ] Wire with productType="concentrate"
6. [ ] Test export flow for Concentrates
7. [ ] Add OrchardPanel to CreateEdibleReview/index.jsx
8. [ ] Wire with productType="edible"
9. [ ] Test export flow for Edibles
10. [ ] Verify all 4 product types have complete export flow

**Output**:
- All 4 product types have OrchardPanel
- All have complete, consistent export experience

---

### PHASE 4: ERADICATE OBSOLETE EXPORT SYSTEMS (1-2H)
**Goal**: Remove incomplete/redundant export code

**To Investigate & Remove**:
- [ ] Check CreateHashReview for any export code (partial/incomplete)
- [ ] Check CreateConcentrateReview for any export code (partial/incomplete)
- [ ] Check CreateEdibleReview for any export code (partial/incomplete)
- [ ] Check DragDropExport.jsx - is this redundant with OrchardPanel?
- [ ] Check FlowerExportModal.jsx - is this redundant with ExportMaker?
- [ ] Check if old export logic in CreateReviewPage.jsx is still used
- [ ] Remove all obsolete files
- [ ] Clean up imports in ExportMaker.jsx
- [ ] Consolidate export logic into single flow: OrchardPanel → ExportMaker

**Output**:
- No redundant/incomplete export code
- Single unified export flow for all product types

---

## 📋 FILES TO CREATE / MODIFY

### Create (New)
```
client/src/pages/account/sections/
├─ PersonalInfoSection.jsx
├─ EnterpriseDataSection.jsx
├─ PreferencesSection.jsx
├─ BillingSection.jsx
├─ SecuritySection.jsx
└─ ActionsSection.jsx

client/src/utils/orchard/
├─ orchardMappings.flower.js
├─ orchardMappings.hash.js
├─ orchardMappings.concentrate.js
├─ orchardMappings.edible.js
└─ orchardNormalizers.js
```

### Modify
```
client/src/pages/account/AccountPage.jsx
  → Refactor as container, integrate PreferencesPage

client/src/components/shared/orchard/OrchardPanel.jsx
  → Add productType prop, use mappings

client/src/pages/review/CreateHashReview/index.jsx
  → Add OrchardPanel import + wire

client/src/pages/review/CreateConcentrateReview/index.jsx
  → Add OrchardPanel import + wire

client/src/pages/review/CreateEdibleReview/index.jsx
  → Add OrchardPanel import + wire

client/src/components/export/ExportMaker.jsx
  → Verify it works with all product types
```

### Delete (Obsolete)
```
client/src/pages/account/PreferencesPage.jsx
  → Code migrated to AccountPage

TBD based on investigation:
- DragDropExport.jsx (if redundant)
- FlowerExportModal.jsx (if redundant)
- Old export code in CreateHashReview/Concentrate/Edible (if exists)
```

---

## 🚀 EXECUTION ORDER

```
✅ PHASE 0: BUILD FIX (DONE)
  ✅ Remove phantom imports
  ✅ Remove phantom routes

→ PHASE 1: ACCOUNT PAGE (2H) - DO NEXT
  [ ] Refactor AccountPage
  [ ] Integrate PreferencesPage
  [ ] Create section components
  [ ] Delete PreferencesPage.jsx

→ PHASE 2: ORCHARD GENERALIZE (3-4H) - AFTER PHASE 1
  [ ] Analyze OrchardPanel structure
  [ ] Extract generic code
  [ ] Create product-type mappings
  [ ] Refactor OrchardPanel to be generic

→ PHASE 3: WIRE TO ALL TYPES (2-3H) - AFTER PHASE 2
  [ ] Add to CreateHashReview
  [ ] Add to CreateConcentrateReview
  [ ] Add to CreateEdibleReview
  [ ] Test all flows

→ PHASE 4: CLEANUP (1-2H) - AFTER PHASE 3
  [ ] Identify obsolete export systems
  [ ] Remove redundant code
  [ ] Consolidate export flows
  [ ] Final testing

→ PHASE 5: LIBRARY REFACTOR (AFTER THIS) - PENDING USER
  [ ] User will request after OrchardMaker is done
  [ ] Requires genealogy persistence + arbre + relations
```

---

## ✅ PRE-CHECKS BEFORE STARTING

- [x] Build error fixed (SettingsPage imports removed)
- [ ] Verify build passes with current state
- [ ] PreferencesPage.jsx fully read and understood
- [ ] OrchardPanel.jsx + 10 support files understood
- [ ] CreateFlowerReview OrchardPanel integration understood
- [ ] CreateHashReview structure understood

---

**Status**: Ready for PHASE 1 execution 🚀

---

## 📌 NOTES

- Don't touch product creation forms (they're correct)
- Focus on export/account infrastructure
- Keep genealogy/pipeline structure intact for Phase 5
- Make sure no regressions in Flower exports during refactoring
