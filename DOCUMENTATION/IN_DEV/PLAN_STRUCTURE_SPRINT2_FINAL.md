# ✅ PLAN D'ACTION STRUCTURE SPRINT 2 - DÉFINITIF

**Date**: 17 janvier 2026  
**Status**: SettingsPage error FIXÉ ✅  
**Objectif**: Organisation claire sans doublons

---

## 📊 DÉCOUVERTES FINALES

### Files Existants
```
✅ AccountPage.jsx           (326 lignes - infos user basique)
✅ PreferencesPage.jsx       (214 lignes - onglets: général, saved-data, templates, watermarks, export)
❌ ProfileSettingsPage.jsx   (N'EXISTE PAS - conflit App.jsx)
✅ StatsPage.jsx             (Exist)
✅ ManageSubscription.jsx    (Exist)
✅ PaymentPage.jsx           (Exist)
```

### Commits Récents (Hier = SPRINT 2 final)
```
08e36fe feat: Add comprehensive action plan for MVP V1
9e5d163 fix: Remove AccountSetupPage lazy import
2dcd641 fix: Remove AccountSetupPage completely, /account shows AccountPage
```

✅ AccountPage était le focus des derniers commits hier

---

## 🎯 HIÉRARCHIE DÉFINITIVE À CONSTRUIRE

### **A. PAGE PROFIL** (`/account`)

**Actuel**: AccountPage (326 lignes, basique)  
**Problème**: Manque KYC, données entreprise, préférences avancées

**À Faire**: REFACTORISER AccountPage en sections modulaires

```
/account → AccountPage.jsx (orchestrateur)
├─ Section 1: Infos Personnelles
│  ├─ Email, username, prénom, nom
│  ├─ Avatar
│  ├─ Bio + Website
│  └─ Profil public toggle
├─ Section 2: Données Entreprise (Producteur/Influenceur seulement)
│  ├─ Infos pro (SIRET, adresse, etc.)
│  ├─ KYC status + upload
│  └─ Historique vérification
├─ Section 3: Préférences (from PreferencesPage)
│  ├─ Onglets: Général, Données sauvegardées, Templates, Filigrane, Export
│  └─ Quotas d'usage
├─ Section 4: Facturation
│  ├─ Abonnement actif
│  ├─ Historique factures
│  └─ Changer méthode paiement
├─ Section 5: Sécurité
│  ├─ Changer mot de passe
│  ├─ 2FA activation
│  ├─ Sessions actives
│  └─ OAuth linking
└─ Section 6: Actions
   ├─ Upgrade button (Amateur)
   ├─ Manage subscription button (Payants)
   └─ Logout button
```

**Route Mapping**:
```
/account                  → AccountPage (complète)
/manage-subscription      → ManageSubscription (modal overlay ou page)
/payment                  → PaymentPage (modal overlay ou page)
/stats                    → StatsPage (dashboard séparé)
```

**Files à Fusionner**:
```
PreferencesPage → AccountPage Section 3
(ProfileSettingsPage n'existe pas → ignore)
```

---

### **B. EXPORT & ORCHARD** (Généraliser)

**Actuel**:
```
ExportMaker.jsx (principal)
├─ Appelé depuis CreateFlowerReview
├─ Has OrchardPanel for flower only
└─ Orchard/ folder (11 components, ancien)

Orchard/ (11 components, 683 lignes OrchardPanel)
├─ Ancien code
├─ Non à jour avec pipelines
├─ Non générique (Fleurs only)
└─ À restructurer
```

**À Faire**: Restructurer Orchard comme composant réutilisable

```
components/export/
├─ ExportMaker.jsx (main orchestrator)
├─ OrchardPanel.jsx (wrapper reusable)
├─ orchard/
│  ├─ core/
│  │  ├─ OrchardPanel.jsx (refactored from original)
│  │  ├─ UnifiedPipeline.jsx (keep, already generic)
│  │  └─ PageManager.jsx
│  ├─ ui/
│  │  ├─ PreviewPane.jsx
│  │  ├─ PagedPreviewPane.jsx
│  │  ├─ EditorPane.jsx
│  │  ├─ Toolbar.jsx
│  │  └─ Sidebar.jsx
│  ├─ presets/
│  │  ├─ PresetPanel.jsx
│  │  └─ PresetGroupPicker.jsx
│  └─ config/
│     ├─ ConfigPane.jsx
│     └─ CustomLayout.jsx
└─ ExportOptions.jsx
```

**Usage pour tous types**:
```
CreateFlowerReview     → ExportMaker.jsx (type='flower')
CreateHashReview       → ExportMaker.jsx (type='hash')
CreateConcentrateReview → ExportMaker.jsx (type='concentrate')
CreateEdibleReview     → ExportMaker.jsx (type='edible')
```

---

### **C. LIBRARY** (Enrichir)

**Actuel**: LibraryPage.jsx (basic: list + filter + actions)  
**À Faire**: Ajouter sections exhaustives

```
/library → LibraryPage.jsx
├─ Tabs/Sections:
│  ├─ Reviews (current: list + filter)
│  ├─ Templates
│  │  └─ Saved OrchardMaker presets
│  ├─ Cultivars (Producteur only)
│  │  ├─ Genetics library
│  │  ├─ PhenoHunt projects
│  │  └─ Genealogy tree
│  ├─ Recurring Data
│  │  ├─ Nutrients (fréquents)
│  │  ├─ Substrates (fréquents)
│  │  ├─ Equipment (fréquent)
│  │  └─ Locations
│  ├─ Watermarks
│  │  ├─ Saved watermarks
│  │  └─ Quick editor
│  └─ Exports
│     └─ Recent exports + history
```

---

## 🔧 PHASES D'EXÉCUTION

### **PHASE 0: BUILD FIX** ✅ TERMINÉE
```
✅ Removed SettingsPage import from App.jsx line 34
✅ Build should pass now on VPS
```

### **PHASE 1: PROFIL ACCOUNT** (2-4H)
```
[ ] Create modular AccountPage sections
    ├─ PersonalInfoSection.jsx
    ├─ EnterpriseDataSection.jsx
    ├─ PreferencesSection.jsx (from PreferencesPage)
    ├─ BillingSection.jsx
    ├─ SecuritySection.jsx
    └─ ActionsSection.jsx
[ ] Refactor AccountPage.jsx as orchestrator
[ ] Merge PreferencesPage content into AccountPage
[ ] Test routes /account, /preferences, /manage-subscription
[ ] Verify nothing broken
```

**Route Changes**:
- `/preferences` → merges into `/account` (or keep as section)
- `/profile-settings` → removes (ProfileSettingsPage doesn't exist)

### **PHASE 2: ORCHARD RESTRUCTURE** (3-4H)
```
[ ] Create orchard/core/, orchard/ui/, orchard/presets/, orchard/config/
[ ] Move 11 components into respective folders
[ ] Update imports in OrchardPanel
[ ] Create unified ExportMaker integration
[ ] Add type prop to make generic (flower, hash, concentrate, edible)
[ ] Test with CreateFlowerReview first
[ ] Extend to CreateHashReview, CreateConcentrateReview, CreateEdibleReview
```

### **PHASE 3: ENRICH LIBRARY** (2-3H)
```
[ ] Add tabs structure to LibraryPage
[ ] Create sub-components for each section
[ ] Add templates section (load from localStorage or API)
[ ] Add cultivars section (Producteur only)
[ ] Add recurring data section
[ ] Add watermarks section
[ ] Add exports history section
```

### **PHASE 4: PHENOHUNT INTEGRATION** (?)
```
[ ] After Orchard works, integrate PhenoHunt into Library
[ ] Add Genetics management with genealogy tree
```

---

## 📋 FILES À SUPPRIMER / CRÉER

### À SUPPRIMER
- [ ] SettingsPage.jsx (already removed from import, but file might still exist)
- [ ] Duplicate/obsolete files in orchard/ (to identify)

### À CRÉER
```
client/src/pages/account/
├─ sections/
│  ├─ PersonalInfoSection.jsx
│  ├─ EnterpriseDataSection.jsx
│  ├─ PreferencesSection.jsx
│  ├─ BillingSection.jsx
│  ├─ SecuritySection.jsx
│  └─ ActionsSection.jsx

client/src/components/export/orchard/
├─ core/
├─ ui/
├─ presets/
└─ config/
```

---

## ✅ CHECKLIST AVANT DE COMMENCER CHAQUE PHASE

### Phase 1 Checklist
- [ ] Vérifier si SettingsPage.jsx file existe physiquement
- [ ] Vérifier PreferencesPage.jsx contenu complet
- [ ] Vérifier AccountPage.jsx API calls
- [ ] Verify route /preferences current behavior
- [ ] Backup AccountPage before refactoring

### Phase 2 Checklist
- [ ] List all 11 orchard components and their dependencies
- [ ] Check what calls OrchardPanel currently
- [ ] Verify UnifiedPipeline is truly generic
- [ ] Identify obsolete vs needed components

### Phase 3 Checklist
- [ ] Verify LibraryPage current API calls
- [ ] Check where templates would be stored
- [ ] Identify Producteur-only sections
- [ ] Plan data structure for recurring data

---

## 🚀 GO? 

**Next Step**: Start PHASE 1 refactoring AccountPage?

**Or first**: 
1. Confirm structure plan
2. Verify which files physically exist
3. Check if SettingsPage.jsx file needs deleting

**Recommendation**: 
- PHASE 0 (BUILD) ✅ DONE
- Start PHASE 1 ASAP (AccountPage is critical)
- PHASE 2 (Orchard) depends on PHASE 1
- PHASE 3 (Library) is independent

---

**Status**: Ready for PHASE 1 execution ✅
