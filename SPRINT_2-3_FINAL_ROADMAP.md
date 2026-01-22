# 🎯 SPRINT 2-3 FINAL ROADMAP (Révisé)

**Date**: 22 janvier 2026  
**Basé sur**: User feedback - Phenohunt prioritaire, Admin Panel minimal
**Durée**: ~3 semaines intensives

---

## 📊 RESTRUCTURE PRIORITÉS

### **AVANT (Ancien plan)**
1. Admin Panel full (16h)
2. Account Page (16h)
3. Orchard/Export (20h)
4. Library (12h)
5. Phenohunt (12h) ← TROP BAS!

### **APRÈS (Nouveau plan)**
1. Account Page (16h) ← Start NOW
2. Phenohunt COMPLET (24h) ← TOP PRIORITY
3. Bibliothèque Fleurs (16h) + préparer autres
4. Admin Panel LIGHT (6h) ← Test/moderation only
5. Orchard/Export fixes (ongoing, pas bloquant)

---

## 🚀 DÉTAIL PAR PHASE

### **PHASE 1: ACCOUNT PAGE REFONTE** (16 heures)
**Status**: Documentation parfaite dans PAGES/PROFILS/  
**Start**: Dès maintenant

#### Tâches
- [ ] Amateur version (5 onglets: Profil, Subscription, Préferences, Sécurité, Support)
- [ ] Producteur version (9 onglets: + Company, KYC, Payment, Invoices, Bank)
- [ ] Influenceur version (7 onglets: + KYC, Payment, Factures)
- [ ] Components réutilisables (tabs, forms, modals)
- [ ] Intégration Zustand (profile store)
- [ ] Backend endpoints (GET/POST /api/users/profile, etc.)
- [ ] Tests UX

#### Files à créer/modifier
```
client/src/pages/account/
├─ AccountPage.jsx (refonte complète)
├─ tabs/
│  ├─ ProfileTab.jsx
│  ├─ SubscriptionTab.jsx
│  ├─ CompanyTab.jsx (Producteur)
│  ├─ KYCTab.jsx
│  ├─ PaymentTab.jsx
│  ├─ InvoicesTab.jsx
│  ├─ BankTab.jsx
│  ├─ PreferencesTab.jsx
│  ├─ SecurityTab.jsx
│  └─ SupportTab.jsx

server-new/routes/
├─ userProfile.js (nouveau)
├─ userSettings.js (nouveau)
└─ userKYC.js (nouveau)

server-new/prisma/
└─ (update schema pour Company, Payment, KYC)
```

---

### **PHASE 2: PHENOHUNT SYSTEM - COMPLET** (24 heures)
**Status**: Existe mais NON généralisé → FULL GENERALIZATION  
**Priority**: ABSOLUE - doit être entièrement fini

#### 2.1 UI Canvas + Sidebar (8h)
```
client/src/components/genetics/
├─ GeneticsWorkspace.jsx (main container)
├─ GeneticsCanvas.jsx (drag-drop nodes)
├─ GeneticsSidebar.jsx (cultivars list)
├─ CultivarNode.jsx (single node visual)
├─ RelationshipLine.jsx (parent→child lines)
├─ ProjectManager.jsx (save/load projects)
└─ PhaseSelectionModal.jsx (phenotype naming)

Features:
- Drag-drop cultivars from library onto canvas
- Create parent/child relationships
- Visual tree rendering (like GitHub commits)
- Delete/edit nodes
- Save/load projects
- Export genealogy (PNG/SVG/JSON)
```

#### 2.2 Backend Generalization (8h)
```
server-new/utils/
├─ geneticsHelper.js (expand significantly)
└─ phenohuntEngine.js (new - core logic)

server-new/routes/
├─ genetics.js (expand)
└─ phenohunt.js (new)

Database (Prisma):
- PhenoHuntProject (project management)
- PhenoHuntPhase (phase tracking)
- GeneticTree (already exists - expand)
- GeneticTreeNode (cultivar in project)
- GeneticRelationship (parent/child)
- SavedPheno (save favorite phenotypes)

Support for:
- Fleurs (primary - full)
- Hash (tracking only)
- Concentré (lineage tracking)
- Comestible (ingredient tracking)
```

#### 2.3 Library Integration (6h)
```
Features:
- Access Phenohunt from Library sidebar
- Quick-save cultivars to Library
- Auto-populate from existing reviews
- Share genealogy links with other users
- Version history (track pheno changes)
```

#### 2.4 Advanced Features (2h skeleton)
```
For SPRINT 3:
- Breeding calculator (probability traits)
- Performance tracking (yield, potency)
- Phenotype comparison matrix
- Generational analysis
```

#### Files à créer
```
client/src/components/genetics/
├─ index.js
├─ GeneticsWorkspace.jsx (500 lines)
├─ GeneticsCanvas.jsx (400 lines)
├─ GeneticsSidebar.jsx (300 lines)
├─ CultivarNode.jsx (150 lines)
├─ RelationshipLine.jsx (100 lines)
├─ ProjectManager.jsx (200 lines)
├─ PhaseSelectionModal.jsx (100 lines)
└─ hooks/
   ├─ useGeneticsProject.js
   └─ useGeneticsDragDrop.js

server-new/
├─ routes/phenohunt.js (300 lines)
├─ utils/phenohuntEngine.js (400 lines)
└─ prisma/ (schema updates)

Tests:
├─ phenohunt.test.js
├─ geneticsHelper.test.js
└─ E2E: Canvas interactions
```

---

### **PHASE 3: BIBLIOTHÈQUE (LIBRARY) - COMPLET** (16 heures)
**Status**: Partiellement doc'd → FULL IMPLEMENTATION  
**Scope**: Complet pour Fleurs, préparer pour autres types

#### 3.1 Reviews Sauvegardées (4h)
```
Features:
- Browse/search saved reviews
- Organize in folders/tags
- Quick-open to edit
- Duplicate/rename
- Pin favorites
- Bulk operations

Storage:
- SavedReview (Prisma model)
- Fast search (Elasticsearch optional)
- Metadata (dates, tags, status)
```

#### 3.2 Technical Sheets Library (4h)
```
Features:
- Template technical sheets
- Reusable configurations
- Quick-import to new review
- Version management
- Sharing (private/public)

Support:
- Fleurs: Full (complete)
- Hash: Template structure
- Concentré: Template structure
- Comestible: Template structure
```

#### 3.3 Saved Data (Auto-complete) (3h)
```
Features:
- Frequently used values (grow room, fertilizers, etc)
- Auto-suggest in forms
- Batch operations
- Clear/manage

For Fleurs:
- Grow rooms (layouts)
- Fertilizer schedules
- Light configurations
- Strain genetics
```

#### 3.4 Export Templates & Presets (3h)
```
Features:
- Save export configurations
- Quick-apply presets
- Clone/modify
- Share with others
- Default per-tier

Storage:
- ExportPreset (Prisma)
- ExportTemplate (variant)
- User library vs public gallery
```

#### 3.5 Watermarks (1h)
```
Features:
- Upload custom watermark
- Position/opacity settings
- Apply to exports
- Multiple watermarks per user
```

#### 3.6 Company Data (Producteur) (1h)
```
Features:
- Store company info
- Auto-populate forms
- Use in exports
- KYC document management
```

#### Files à créer
```
client/src/components/library/
├─ LibraryPage.jsx (main)
├─ ReviewsLibrary.jsx
├─ TechnicalSheets.jsx
├─ SavedDataManager.jsx
├─ ExportPresetsManager.jsx
├─ WatermarkUpload.jsx
├─ CompanyData.jsx (Producteur only)
└─ hooks/
   ├─ useLibrary.js
   ├─ useTechnicalSheets.js
   └─ useExportPresets.js

server-new/routes/
├─ library.js (500 lines)
├─ technicalSheets.js (300 lines)
├─ exportPresets.js (200 lines)
└─ savedData.js (200 lines)

Prisma schema updates:
- SavedReview
- TechnicalSheet
- ExportPreset
- SavedDataItem
- Watermark
- CompanyData
```

---

### **PHASE 4: ADMIN PANEL - LIGHT** (6 heures)
**Status**: Minimal implementation - Test/Moderation ONLY  
**Scope**: Simple tools pour test + launch

#### Features minimalistes
```
Dashboard:
- Total users (count)
- Accounts by type (Amateur/Producteur/Influenceur)
- Recent registrations
- Recent published reviews

User Management:
- List all users (search/filter)
- View account details
- CHANGE ACCOUNT TYPE (for quick testing) ← KEY
- Enable/disable account
- View user reviews

Moderation:
- Pending public gallery submissions
- Flag/approve/reject reviews
- Mass operations
- Simple moderation queue

System:
- View error logs
- Check API health
- Basic analytics
```

#### Files à créer
```
client/src/pages/admin/
├─ AdminDashboard.jsx (200 lines)
├─ UserManagement.jsx (300 lines)
├─ ModerationQueue.jsx (250 lines)
└─ SystemMonitoring.jsx (150 lines)

server-new/routes/
├─ admin.js (300 lines) - auth check (admin only)

Prisma:
- AdminLog (for audit trail)
```

#### Limitations intentionnelles (for MVP)
```
❌ NOT included:
- Complex permission management
- Payment reconciliation
- Revenue analytics
- Advanced moderation (comment filtering)
- User segmentation
- A/B testing controls

✅ ONLY:
- See accounts
- Change type for testing
- Approve/reject public submissions
- View logs
```

---

## ⏱️ TIMELINE

### **Week 1 (56 heures)**
```
Mon-Tue: Account Page (16h)
  - Create all 3 versions
  - All tabs/components
  - Backend integration

Wed-Thu: Phenohunt Phase 1 (16h)
  - UI Canvas + Sidebar
  - Drag-drop functionality
  - Basic node creation

Fri: Phenohunt Phase 2 (8h)
  - Backend setup
  - Database schema
  - API endpoints
```

### **Week 2 (56 heures)**
```
Mon: Phenohunt Phase 3-4 (8h)
  - Library integration
  - Testing suite
  - Advanced features skeleton

Tue-Wed: Bibliothèque Phase 1-2 (16h)
  - Reviews saved system
  - Technical sheets

Thu: Bibliothèque Phase 3-5 (8h)
  - Saved data manager
  - Export presets
  - Watermarks

Fri: Bibliothèque Phase 6 (4h) + Polish
  - Company data
  - Testing
```

### **Week 3 (optional buffer)**
```
Mon-Tue: Admin Panel Light (6h)
  - Dashboard
  - User management
  - Moderation queue

Wed-Fri: Testing & Deployment
  - Full QA
  - Integration tests
  - Deploy v1.1.0 to VPS
```

---

## 📋 VALIDATION BEFORE START

**Before coding Phase 1, confirm:**

1. **Account Page structure OK per PAGES/PROFILS/** ?
   - [ ] Amateur: 5 tabs confirmed
   - [ ] Producteur: 9 tabs confirmed
   - [ ] Influenceur: 7 tabs confirmed

2. **Phenohunt scope clear** ?
   - [ ] UI (canvas + sidebar) = must-have
   - [ ] Generalized for all products = must-have
   - [ ] Library integration = must-have
   - [ ] Advanced features skeleton = nice-to-have for SPRINT 3

3. **Bibliothèque pour Fleurs ONLY first** ?
   - [ ] Reviews saved ✅
   - [ ] Technical sheets ✅
   - [ ] Saved data ✅
   - [ ] Export presets ✅
   - [ ] Watermarks ✅
   - [ ] Others templates for Hash/Conc/Edible after?

4. **Admin Panel = LIGHT only** ?
   - [ ] View users
   - [ ] Change type
   - [ ] Moderation queue
   - [ ] No complex features

5. **Cleanup = AFTER everything** ?
   - [ ] NOT during coding
   - [ ] Risk too high per user feedback
   - [ ] Wait for all docs finalized

---

## 🎯 NEXT IMMEDIATE STEPS

Once you confirm above:

1. **Create detailed Phenohunt implementation guide**
   - Canvas architecture
   - State management (Zustand)
   - Backend routes
   - Database schema specifics

2. **Create detailed Bibliothèque implementation guide**
   - Library data model
   - Search/filter logic
   - Sharing system

3. **Start CODING Phase 1** (Account Page)
   - Follow PAGES/PROFILS structure exactly
   - Create all components
   - Wire to backend

**Total Scope**: 62 hours (+ Admin 6h optional = 68h = ~2.5 weeks intensive)

---

**Status**: 🟡 Ready to code - waiting for your 5 confirmations above
