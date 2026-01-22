# 🚀 PLAN EXÉCUTION FINAL - SPRINT 2 & 3

**Date**: 22 janvier 2026  
**Vision**: De Sprint 2 (foundation) jusqu'à Phase 1 Fleur COMPLÈTE & LIVE

---

## 📊 DÉPENDANCES CRITIQUES

```
Phase 1 Fleur COMPLÈTE dépend de:
│
├─ ✅ Backend Fleur (déjà livré v1.0.0-phase1)
├─ ✅ Frontend Fleur (déjà livré v1.0.0-phase1)
│
├─ 🔴 Account Page REFONTE (bloquant)
│   └─ Tâche 1: Doit être fini AVANT Stage de tests
│
├─ 🔴 ExportMaker UNIFIÉE (bloquant)
│   └─ Tâche 2: Doit être fonctionnel AVANT ExportMaker Tests
│
├─ 🟡 Library ARCHITECTURE (dépendance Phase 2)
│   └─ Tâche 3: Base structure, finition quand Fleur v1 done
│
└─ ✅ 3-Tier Permission System (déjà fait)
```

---

## 🗓️ TIMELINE EXECUTIVE

```
SEMAINE 1 (MAINTENANT - 22-26 jan)
├─ SPRINT 2: Account Page + ExportMaker Foundation
│   ├─ J1-2: Account Page Refonte (16h)
│   ├─ J2-3: ExportMaker Core (20h)
│   └─ J3-4: Library Base + Tests (12h)
└─ DELIVERABLE: MVP complet (Account + Export + Library base)

SEMAINE 2 (26 jan - 2 fév)
├─ SPRINT 3: Fleur v1 FINALE + Producteur/Influenceur Adaptations
│   ├─ Phase 2 Products (Hash, Concentrés, Comestibles) (20h)
│   ├─ ExportMaker Integration All Products (12h)
│   ├─ Statistics Adaptation (8h)
│   └─ Full Testing + Polish (12h)
└─ DELIVERABLE: Phase 1 Fleur LIVE + Phase 2 Ready

SEMAINE 3+ (Après)
├─ Phase 3: Advanced Features (PhenoHunt, Company, etc.)
└─ Phase 4: Public Gallery + Social
```

---

## 📋 TÂCHES DÉTAILLÉES

### **SPRINT 2 - FOUNDATION (This Week)**

#### **TÂCHE 1: Account Page Refonte (16h total)**

**1.1: Structure & Routing (4h)**
- [ ] Create AccountPageLayout.jsx (route par type)
- [ ] Create tabs selector logic
- [ ] Responsive grid layout
- [ ] Animation between tabs

**1.2: Core Sections - Tous types (6h)**
- [ ] Modify ProfileSection (ajouter phone, website, bio)
- [ ] Create SubscriptionSection (display current, upgrade button)
- [ ] Create SecuritySection (password, 2FA, sessions)
- [ ] Refactor PreferencesSection
- [ ] Adapt SavedDataSection (Amateur LITE only)

**1.3: Producteur Sections (4h)**
- [ ] Create PaymentSection + PaymentMethodManager
- [ ] Create CompanySection + CompanyForm
- [ ] Create KycSection (base upload interface)
- [ ] Create WatermarkSection (simple management)
- [ ] Create TemplateSection (link to Library)

**1.4: Influenceur Sections (2h)**
- [ ] Adapt KycSection for Influenceur
- [ ] Create StatisticsSection (link to /stats)

**Deliverable**: Fully functional Account page with dynamic tabs ✅

---

#### **TÂCHE 2: ExportMaker Core (20h total)**

**2.1: Structure & Flow (4h)**
- [ ] Create ExportMaker.jsx (main controller)
- [ ] Create step navigation system
- [ ] Create preview panel (real-time)
- [ ] Progress indicator

**2.2: Step Components (8h)**
- [ ] StepFormatSelector (PNG, JPEG, PDF)
- [ ] StepTemplateSelector (Compact, Detailed, Complete)
- [ ] StepCustomization (colors, fonts, layout)
- [ ] StepPreview (full-screen, responsive)
- [ ] StepGeneration & Download

**2.3: Template Components (6h)**
- [ ] TemplateCompact.jsx (render Fleur compact)
- [ ] TemplateDetailed.jsx (render Fleur detailed)
- [ ] TemplateComplete.jsx (render Fleur complete)
- [ ] CSS styling for all templates
- [ ] Responsive design (mobile, tablet, desktop)

**2.4: Generators (2h)**
- [ ] generateHTML.js (template + data → HTML string)
- [ ] Integrate html-to-image (PNG/JPEG)
- [ ] Integrate jsPDF (PDF)
- [ ] Download trigger

**Testing with Fleur**:
- [ ] Test PNG export
- [ ] Test JPEG export
- [ ] Test PDF export
- [ ] Test all templates
- [ ] Test customization changes
- [ ] Test preview responsiveness

**Deliverable**: Fully functional ExportMaker for Fleur reviews ✅

---

#### **TÂCHE 3: Library Base Architecture (12h total)**

**3.1: Database Schema (2h)**
- [ ] Create Prisma models (Review, Cultivar, PhenoHunt, TechnicalSheet, SavedData)
- [ ] Run migrations
- [ ] Test schema

**3.2: Backend API (4h)**
- [ ] Create `/api/library/reviews` endpoints (CRUD)
- [ ] Create `/api/library/cultivars` endpoints
- [ ] Create `/api/library/saved-data` endpoints
- [ ] Add filtering & search logic
- [ ] Add permission checks (public vs private)

**3.3: Frontend Structure (4h)**
- [ ] Create LibraryPage.jsx
- [ ] Create LibraryLayout (sidebar + main)
- [ ] Create ReviewsSection.jsx (list view)
- [ ] Create CultivarsSection.jsx (cards view)
- [ ] Create SavedDataSection.jsx
- [ ] Responsive navigation

**3.4: Core Features (2h)**
- [ ] Filtering (by type, date, rating)
- [ ] Search (fulltext)
- [ ] Basic CRUD operations
- [ ] Tags management

**Deliverable**: Library foundation with Reviews, Cultivars, SavedData ✅

---

#### **TÂCHE 4: Testing & Integration (8h)**

- [ ] Test Account page with all 3 types
- [ ] Test ExportMaker with different settings
- [ ] Test Library CRUD operations
- [ ] Test permissions enforcement
- [ ] Responsive tests (mobile, tablet, desktop)
- [ ] Performance benchmarks
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility (a11y) checks

**Deliverable**: Zero critical bugs, ready for production ✅

---

### **SPRINT 3 - PHASE 2 PRODUCTS & COMPLETION (Next Week)**

#### **TÂCHE 5: Phase 2 Products Implementation (20h)**

**5.1: Hash Product (6h)**
- [ ] Review form (extraction pipeline + sensory data)
- [ ] Hash-specific fields (purity, melting, texture)
- [ ] Testing with ExportMaker
- [ ] Responsive design

**5.2: Concentrate Product (6h)**
- [ ] Review form (extraction + purification pipelines)
- [ ] Concentrate-specific fields (viscosity, melting, residues)
- [ ] Testing with ExportMaker
- [ ] Responsive design

**5.3: Edible Product (6h)**
- [ ] Review form (recipe pipeline)
- [ ] Edible-specific fields (ingredients, dosage, onset time)
- [ ] Testing with ExportMaker
- [ ] Responsive design

**5.4: Mix Reviews (2h)**
- [ ] Support creating reviews with multiple products
- [ ] ExportMaker handles mixed data

**Deliverable**: All 4 product types fully functional ✅

---

#### **TÂCHE 6: ExportMaker Advanced Features (12h)**

**6.1: Product-Specific Templates (6h)**
- [ ] Hash-specific template rendering
- [ ] Concentrate-specific template rendering
- [ ] Edible-specific template rendering
- [ ] Mix-product template handling

**6.2: Advanced Customization (4h)**
- [ ] Color palette selector
- [ ] Font selector (Google Fonts)
- [ ] Layout zones management
- [ ] Watermark integration
- [ ] Save custom template to Library

**6.3: Additional Formats (2h)**
- [ ] SVG export (Producteur only)
- [ ] CSV export (Producteur only)
- [ ] Stub: JSON, HTML, ZIP (Phase 3)

**Deliverable**: ExportMaker fully complete for all products ✅

---

#### **TÂCHE 7: Statistics Adaptation (8h)**

**7.1: Amateur Statistics**
- [ ] Total reviews
- [ ] Average rating
- [ ] Product type breakdown
- [ ] Reviews per month chart

**7.2: Producteur Statistics** (ADVANCED)
- [ ] Culture analytics (rendement, durée, coûts)
- [ ] Timeline récoltes planifiées
- [ ] Environmental data aggregation
- [ ] Resource consumption trends
- [ ] Best cultivars by rendement
- [ ] ROI calculations

**7.3: Influenceur Statistics** (ENGAGEMENT)
- [ ] Total engagement metrics (likes, shares, comments)
- [ ] Top reviews by engagement
- [ ] Audience analytics
- [ ] Trending content
- [ ] Social reach by platform

**Deliverable**: Differentiated stats page per tier ✅

---

#### **TÂCHE 8: Library Completion (8h)**

**8.1: Advanced Sections**
- [ ] Genealogy tree visualization (Cultivars)
- [ ] PhenoHunt canvas basic editor (Producteur only)
- [ ] Technical sheets editor
- [ ] Export templates management

**8.2: Data Management**
- [ ] Import/Export JSON
- [ ] Backup functionality
- [ ] Versioning

**Deliverable**: Library fully complete per specification ✅

---

#### **TÂCHE 9: Full Testing & Deployment (12h)**

**9.1: QA Testing**
- [ ] End-to-end scenarios (account creation → review → export)
- [ ] Cross-product compatibility
- [ ] Permission enforcement
- [ ] Performance under load
- [ ] Error handling & recovery

**9.2: Deployment**
- [ ] Git merge to main
- [ ] Tag v1.1.0-phase1-complete
- [ ] VPS deployment
- [ ] Database migrations (production)
- [ ] Smoke tests on production
- [ ] Rollback plan

**9.3: Documentation**
- [ ] User guide (Account, Export, Library)
- [ ] Admin guide
- [ ] API documentation
- [ ] Known issues & workarounds

**Deliverable**: Phase 1 Fleur LIVE on production ✅

---

## ⏱️ TIME BREAKDOWN

```
SPRINT 2 (This Week)
├─ Tâche 1: Account Page (16h)
├─ Tâche 2: ExportMaker Core (20h)
├─ Tâche 3: Library Base (12h)
├─ Tâche 4: Testing (8h)
└─ TOTAL: 56h ≈ 7 jours full-time

SPRINT 3 (Next Week)
├─ Tâche 5: Phase 2 Products (20h)
├─ Tâche 6: ExportMaker Advanced (12h)
├─ Tâche 7: Statistics (8h)
├─ Tâche 8: Library Complete (8h)
├─ Tâche 9: Testing & Deploy (12h)
└─ TOTAL: 60h ≈ 7.5 jours full-time

GRAND TOTAL: 116h ≈ 15 jours = 2 semaines intenses
```

---

## ✅ DELIVERABLES PAR PHASE

### **End of SPRINT 2 (Jan 26)**
```
✅ Account Page - Fully functional (all 3 types)
✅ ExportMaker Core - Working for Fleur reviews
✅ Library Foundation - Reviews, Cultivars, SavedData sections
✅ Permissions - Enforced throughout app
✅ Tests - Account, Export, Library all tested
```

### **End of SPRINT 3 (Feb 2)**
```
✅ Phase 2 Products - Hash, Concentrés, Comestibles fully done
✅ ExportMaker - Complete for all products
✅ Statistics - Differentiated by tier
✅ Library - Advanced features (genealogy, PhenoHunt, templates)
✅ LIVE on Production - v1.1.0-phase1-complete deployed
```

---

## 🎯 SUCCESS CRITERIA

### **Technical**
- ✅ Zero console errors on any page
- ✅ All API endpoints return correct data
- ✅ Permissions enforced (no access to paid features unless subscribed)
- ✅ ExportMaker generates all formats correctly
- ✅ Library saves & retrieves data properly
- ✅ Performance: all pages load <2s, interactions <100ms

### **Functional**
- ✅ Users can create reviews for all 4 products
- ✅ Users can export reviews in all formats
- ✅ Users can save, organize, search all library items
- ✅ Statistics show correct data per tier
- ✅ Account page displays all relevant info per tier
- ✅ Responsive on mobile, tablet, desktop

### **User Experience**
- ✅ Intuitive navigation
- ✅ Clear feedback on all actions
- ✅ Help text/tooltips where needed
- ✅ Smooth animations & transitions
- ✅ Accessible (WCAG AA minimum)

---

## 🚨 RISKS & CONTINGENCIES

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| ExportMaker too complex | Medium | High | Break into steps, test early |
| Library data model issues | Low | High | Test migrations carefully |
| Performance issues with large datasets | Medium | Medium | Implement pagination, caching |
| KYC document upload fails | Low | High | Use simple file upload initially |
| Stripe integration blocked | Low | High | Use stub with localStorage |
| Cross-browser compatibility | Low | Medium | Test in main browsers early |

---

## 📌 DECISION POINTS

**Decision 1**: ExportMaker - Keep as one unified system or split by product?
**Answer**: ✅ ONE unified system (confirmed)

**Decision 2**: Library - Finish completely with Phase 1 Fleur or Phase 2 after?
**Answer**: ✅ Base structure with Phase 1, advanced features after (confirmed)

**Decision 3**: Account page - Full Company/KYC management immediately?
**Answer**: ✅ YES, from day 1 (confirmed)

**Decision 4**: Statistics - How detailed for Producteur?
**Answer**: ✅ FULL business intelligence (rendement, costs, timeline, ROI) (confirmed)

---

## 🔗 RELATED DOCUMENTATION

- PLAN_ACCOUNT_PAGE_REFONTE.md (structure details)
- PLAN_EXPORTMAKER_UNIFIEE.md (export system architecture)
- PLAN_LIBRARY_COMPLETE.md (library organization)
- ARCHITECTURE_GLOBALE_V2.md (system overview)

---

## 👤 RESPONSIBLE PARTIES

- **Account Page**: Frontend dev + Backend API
- **ExportMaker**: Frontend dev (components, generation)
- **Library**: Full-stack (DB schema, API, UI)
- **Testing**: QA + automated tests
- **Deployment**: DevOps + validation

---

## 📞 CONTACT & DECISIONS

Questions or blockers? Document here with decision date.

---

**STATUS**: 🟢 READY TO EXECUTE

**Next Step**: Start SPRINT 2 TÂCHE 1 (Account Page Refonte)

**Estimated Completion**: Feb 2, 2026

---
