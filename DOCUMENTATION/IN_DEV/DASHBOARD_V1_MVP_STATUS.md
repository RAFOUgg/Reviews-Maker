# 📊 DASHBOARD V1 MVP - STATUS & DÉCISIONS

**Version**: 1.0  
**Date**: 16 janvier 2026  
**Audience**: Management, Tech Lead, Équipe Dev  
**Format**: Vue d'ensemble 360°

---

## 🎯 VISION V1 MVP (EN 30 SECONDES)

**Qu'on fait**: Système complet pour documenter revues fleur cannabis
- 10 sections remplissables (infos → effets)
- Tracking culture jour/semaine/phase
- Arbre généalogique PhenoHunt
- Export PNG/PDF/JSON
- Galerie publique partageable

**Accessibilité**: 3 niveaux de comptes
- **Amateur** (gratuit): Basique, max 10 reviews
- **Producteur** ($29.99/mois): Pro, illimité
- **Influenceur** ($15.99/mois): Social, max 50 reviews

**Timeline**: 3-4 semaines (2-3 devs)  
**Fin**: ~5 février 2026

---

## 📈 COMPOSANTS STATUS

### 🟢 COMPLET & PRÊT (5 items)

| Item | Statut | Notes |
|---|---|---|
| **Section 1: Infos Générales** | ✅ 95% | Prêt production |
| **Section 4: Analytiques** | ✅ 95% | THC/CBD persist |
| **Sections 5-9: Évaluations** | ✅ 95% | Sliders/selects OK |
| **Galerie Publique Display** | ✅ 60% | Peut partager |
| **Backend Prisma + Routes** | ✅ 90% | CRUD complet |

### 🟡 EN COURS (2 items)

| Item | Statut | Notes |
|---|---|---|
| **Section 2: Génétiques** | ⚠️ 60% | Basique OK, PhenoHunt pending |
| **Bibliothèque** | ⚠️ 70% | Backend OK, UI incomplete |

### 🔴 CRITIQUE (4 items)

| Item | Statut | Effort | Start |
|---|---|---|---|
| **Permissions** | ❌ 0% | 2-3j | Immediate |
| **PhenoHunt UI** | ❌ 40% | 4-5j | Week 1.5 |
| **Pipelines Grid** | ❌ 40% | 5-6j | Week 2 |
| **Export Complet** | ❌ 50% | 6-7j | Week 2.5 |

---

## 🔐 PRIORITIES (ORDRE EXÉCUTION)

### 1️⃣ PERMISSIONS (DO FIRST)
**Raison**: Business-critical, touche TOUT le système  
**Impact**: 60 tests, 3 account types  
**Effort**: 2-3 jours  
**Risque**: 🔴 BLOCKER si pas fait

```
Priority: IMMEDIATE
Assign: 1 senior dev
Duration: Jan 16-22
Definition Done:
  ✅ Middleware auth complet
  ✅ Frontend masquage correct
  ✅ 60 tests passant
  ✅ Zéro bypass permissions
```

### 2️⃣ PHENOHUNT (DO EARLY)
**Raison**: Producteur feature clé, complexe  
**Impact**: PhenoHunt tree + Section 2  
**Effort**: 6-7 jours  
**Risque**: React Flow library issues?

```
Priority: HIGH
Assign: 1.5 devs (parallel with Permissions)
Duration: Jan 22-28
Depends: Permissions done
Definition Done:
  ✅ Canvas drag-drop works
  ✅ Save/load persistent
  ✅ Export/import JSON OK
  ✅ Graph smooth (50+ nodes)
```

### 3️⃣ PIPELINES (DO MIDDLE)
**Raison**: Culture tracking = core feature  
**Impact**: Section 3 + 10, 9 groupes  
**Effort**: 8-9 jours  
**Risque**: Grid performance (365 cells)?

```
Priority: HIGH
Assign: 2 devs (parallel with Export)
Duration: Jan 28-Feb 4
Depends: Permissions done
Definition Done:
  ✅ Grille Jours/Semaines/Phases renders
  ✅ Modal édition 9 groupes complet
  ✅ Preset system working
  ✅ No lag with 365 carrés
```

### 4️⃣ EXPORT (DO PARALLEL)
**Raison**: Délivre valeur user (multi-format)  
**Impact**: Tous templates  
**Effort**: 6-7 jours  
**Risque**: Format complexity (JSON/CSV/HTML)?

```
Priority: HIGH
Assign: 1-2 devs (parallel with Pipelines)
Duration: Feb 4-11
Depends: Permissions done
Definition Done:
  ✅ PNG/PDF/JSON/CSV/HTML working
  ✅ 4 templates (Compact/Détaillé/etc.)
  ✅ Quality selectable
  ✅ Export < 5s (10 pages)
```

### 5️⃣ BIBLIOTHÈQUE (DO AFTER)
**Raison**: Réutilisabilité presets  
**Impact**: Workflow améloré  
**Effort**: 4-5 jours  
**Risque**: CRUD UI complexity?

```
Priority: MEDIUM-HIGH
Assign: 1 dev
Duration: Feb 11-16
Depends: Pipelines done
Definition Done:
  ✅ Lister/éditer/dupliquer reviews
  ✅ Presets CRUD complet
  ✅ Load preset → review prefilled
```

### 6️⃣ POLISH (DO LAST)
**Raison**: UX final + galerie  
**Impact**: User experience smooth  
**Effort**: 3-4 jours  
**Risque**: Scope creep?

```
Priority: MEDIUM
Assign: 1 dev
Duration: Feb 16-20
Depends: All features done
Definition Done:
  ✅ Dark mode OK
  ✅ Responsive mobile/tablet
  ✅ Validation live
  ✅ Tooltips contextuels
```

---

## 💰 EFFORT ESTIMATION

### Par Sprint

```
Sprint 1 (Permissions):      4-5 jours
Sprint 2 (PhenoHunt):        6-7 jours  ← 2 devs parallèle
Sprint 3 (Pipelines):        8-9 jours  ← 2 devs parallèle
Sprint 4 (Export):           6-7 jours  ← 1 dev parallèle
Sprint 5 (Bibliothèque):     4-5 jours
Sprint 6 (Polish):           3-4 jours
Sprint 7 (Testing):          5-6 jours
Deploy:                      2-3 jours
────────────────────────────────────────
TOTAL:                       39-46 jours
```

### Par Ressource

**Si 1 dev solo**: 46 jours = 9 semaines
**Si 2 devs**: Parallèle Sprint 2-4 = 5-6 semaines  
**Si 3 devs**: Parallèle + testing = 4-5 semaines

**Recommandé**: 2-3 devs = **3.5-4.5 semaines** ✅

---

## 🎯 DECISIONS CONFIRMÉES

### ✅ Decision 1: V1 = Fleurs ONLY
**Choix**: Compléter Fleurs avant Hash/Concentrés/Comestibles  
**Raison**: Prove architecture, reuse for other types  
**Impact**: 3-4 autres types = 2-3 semaines each (after V1)  
**Status**: ✅ Confirmé

### ✅ Decision 2: Permissions par Account Type
**Choix**: 3 niveaux (Amateur/Producteur/Influenceur)  
**Mappings**:
```
Amateur (gratuit):
  Sections: 1, 4-9 (8 sections)
  Export: PNG/PDF (Compact template)
  Reviews: max 10
  Price: Free

Producteur ($29.99/mo):
  Sections: 1-10 (ALL)
  Export: All formats + templates
  Reviews: unlimited
  Features: PhenoHunt, pipelines complets
  Price: €29.99/mois

Influenceur ($15.99/mo):
  Sections: 1, 4-10 (pas pipeline culture)
  Export: PNG/PDF (Influenceur template 9:16)
  Reviews: max 50
  Features: Social optimized
  Price: €15.99/mois
```
**Status**: ✅ Confirmé

### ✅ Decision 3: Pipeline 3 Modes
**Choix**: Jours (365 carrés) / Semaines (S1-S52) / Phases (12 fixes)  
**Architecture**: Unified backend, 3 UI visualizations  
**Status**: ✅ Confirmé

### ✅ Decision 4: Export Formats
**Choix**: PNG/PDF (images) + JSON/CSV/HTML (data)  
**Templates**: Compact/Détaillé/Complète/Influenceur/Personnalisé  
**Status**: ✅ Confirmé

### ✅ Decision 5: Nettoyage Fichiers
**Choix**: 
- Supprimer: 19 scripts fix/refactor obsolètes
- Archiver: 29 docs audit/refactor
- Garder: 3 docs principaux (Cahier + Validation + Guide)

**Effort**: 2 heures total  
**Status**: ✅ À exécuter

---

## ⚠️ RISKS & MITIGATIONS

### Risk 1: Permissions Implementation Complexity

**Risk**: Bypass opportunities, logic errors  
**Mitigation**:
- Middleware centralisé (une seule source de vérité)
- 60 tests exhaustifs (3 types × 20 features)
- Code review strict
- Logging complet tentatives bypass

**Owner**: Senior dev  
**Priority**: 🔴 CRITICAL

### Risk 2: Pipeline Grid Performance

**Risk**: 365 carrés render lag, UX bad  
**Mitigation**:
- Virtualization (render visible cells only)
- Pagination (split into 12 months)
- CSS grid optimized
- Test on mobile early

**Fallback**: Simplified day-by-day nav  
**Owner**: Frontend lead  
**Priority**: 🔴 CRITICAL

### Risk 3: PhenoHunt Complexity

**Risk**: React Flow library issues, graph rendering lag  
**Mitigation**:
- Start Sprint 2 early
- Spike/research week 1
- Fallback: Simplified node-edge UI (SVG)
- User testing UI early

**Owner**: React specialist  
**Priority**: 🟠 HIGH

### Risk 4: Export Formats Complexity

**Risk**: JSON/CSV/HTML implementations take too long  
**Mitigation**:
- Start with JSON (simplest format)
- CSV = flatten JSON
- HTML = template rendering
- If blocked: PNG/PDF only for V1 → formats V1.1

**Owner**: Backend dev  
**Priority**: 🟠 HIGH

### Risk 5: Timeline Slippage

**Risk**: Features take longer than estimated  
**Mitigation**:
- Daily standups (blockers early)
- 1-week buffer built in
- Scope freeze after Sprint 4
- Cut "nice-to-have" if needed

**Owner**: Tech lead  
**Priority**: 🟠 HIGH

---

## 📋 DEPENDENCIES

```
Permissions (Sprint 1)
    ↓
    ├─ PhenoHunt (Sprint 2) ← Needs permission check Producteur
    ├─ Pipelines (Sprint 3) ← Needs permission check non-Amateur
    └─ Export (Sprint 4) ← Needs permission check formats
         ↓
    Bibliothèque (Sprint 5) ← Needs exports working
         ↓
    Polish (Sprint 6) ← Needs all features complete
         ↓
    Testing (Sprint 7) ← Needs all code done
         ↓
    Deploy (Week 4) ← Needs all tests passing
```

---

## 🎬 NEXT ACTIONS (IMMÉDIAT)

### Today (Jan 16)
- [ ] Tech lead review: PLAN_EXECUTION_V1_MVP.md
- [ ] Assign Permissions sprint to senior dev
- [ ] Approve 3 docs (Cahier, Validation, Guide)

### Tomorrow (Jan 17)
- [ ] Create Jira tickets from Sprint 1-7
- [ ] Setup Slack #v1-mvp-fleurs channel
- [ ] Schedule daily standups 10am
- [ ] Execute nettoyage fichiers (AUDIT_FICHIERS_OBSOLETES.md)

### Monday (Jan 20)
- [ ] 🚀 **Sprint 1 STARTS**: Permissions
- [ ] Dev 1: Backend middleware auth
- [ ] Dev 2: Frontend permission checks

---

## 📊 SUCCESS METRICS

### V1 MVP Validation Gate

| Metric | Target | Status |
|---|---|---|
| Permissions Tests | 60/60 passing | 🔴 Not started |
| Section Coverage | 10/10 functional | 🟡 8/10 done |
| PhenoHunt E2E | Create/Edit/Save/Export | 🔴 Not started |
| Pipeline Visualization | All 3 modes smooth | 🔴 Not started |
| Export Formats | 5 formats working | 🟡 2/5 done |
| Performance | Export < 5s, UI smooth | 🟡 To test |
| Test Coverage | > 80% | 🔴 Not started |
| Security | Zero bypasses | 🔴 To test |
| UX | Team approved | ⚠️ Pending |

### Go-Live Criteria

✅ All metrics above PASSING  
✅ Zero critical bugs  
✅ Team sign-off  
✅ Staging tested 3 days  
✅ Rollback plan ready  

---

## 📞 COMMUNICATION

**Daily**: Standups 10am (Slack thread)  
**Weekly**: Status Friday (30 min)  
**Blockers**: Post immediately #v1-mvp-fleurs  
**Updates**: PLAN_EXECUTION_V1_MVP.md updated daily

**Key Contacts**:
- Product: @PM_name
- Tech Lead: @TechLead_name
- Backend: @Backend_name
- Frontend: @Frontend_name

---

## 📚 DOCUMENTS DE RÉFÉRENCE

### Pour Chacun

**Product Manager**:
```
1. CAHIER_DES_CHARGES_V1_MVP_FLEURS.md (5 min skim)
2. PLAN_EXECUTION_V1_MVP.md (20 min read)
3. Dashboard this doc (5 min reference)
```

**Tech Lead**:
```
1. CAHIER_DES_CHARGES_V1_MVP_FLEURS.md (30 min full read)
2. PLAN_EXECUTION_V1_MVP.md (1h detailed read)
3. VALIDATION_V1_MVP_FLEURS.md (30 min skim)
4. Dashboard this doc (ongoing reference)
```

**Developers**:
```
1. GUIDE_LECTURE_CAHIER_DES_CHARGES.md (10 min → your section)
2. CAHIER_DES_CHARGES_V1_MVP_FLEURS.md (sections relevant)
3. VALIDATION_V1_MVP_FLEURS.md (ongoing checklist)
4. PLAN_EXECUTION_V1_MVP.md (your sprint detail)
```

**QA/Tester**:
```
1. VALIDATION_V1_MVP_FLEURS.md (1h full read)
2. PLAN_EXECUTION_V1_MVP.md Sprints 7 section (30 min)
3. Dashboard this doc (daily reference)
```

---

## 🎯 FINAL DECISION

**Decision**: APPROUVER V1 MVP plan, START Jan 20?

- [ ] ✅ **YES** - Start Sprint 1 Monday, assign resources
- [ ] ⚠️ **CONDITIONAL** - Need clarification (specify what)
- [ ] ❌ **NO** - Delay (specify reason)

**Recommendation**: ✅ **YES** - Architecture solid, team ready, timeline realistic

---

**Document**: Dashboard V1 MVP Status & Decisions  
**Last Updated**: Jan 16 2026  
**Next Review**: Jan 20 2026 (Sprint 1 kickoff)

**GO/NO-GO**: 🟢 **GO** (Pending final approval)
