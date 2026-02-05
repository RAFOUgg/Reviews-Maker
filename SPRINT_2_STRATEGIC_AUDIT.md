# 🎯 SPRINT 2 - AUDIT STRATÉGIQUE & ROADMAP

**Date**: 22 janvier 2026  
**Statut**: Phase 1 FLEURS live ✅ → Phase 2 Planning  
**Pour**: Clarifier ce qui existe vs ce qui manque vs ce qui doit être fixé

---

## 📊 ÉTAT ACTUEL DU SYSTÈME

### ✅ EXISTE & FONCTIONNE (à adapter/finaliser)

#### **A. EXPORT MAKER / EXPORT SYSTEM** 
**État**: 80% fait - Code existant
- ✅ `OrchardPanel.jsx` (684 lignes) - composant principal
- ✅ `normalizeByType.js` - normalisation générique par type
- ✅ `productTypeMappings.js` - mappings pour Fleurs/Hash/Concentré/Comestible
- ✅ 10+ composants support (PagedPreviewPane, PageManager, PipelineEditor, etc.)

**À faire**:
- 🔴 Adapter à chaque type de compte (Amateur/Producteur/Influenceur)
- 🔴 Adapter à chaque type de fiche (Fleurs/Hash/Concentré/Comestible)
- 🔴 Gérer les permissions (qui peut exporter quoi)
- 🔴 Audit code & bug fixes (voir section C)

**Localisation**: `client/src/utils/orchard/` + `client/src/components/shared/orchard/`

---

#### **B. PIPELINES SYSTEM**
**État**: 90% conforme au cahier des charges

**Qui est OK**:
- ✅ Culture (Fleurs) - 12 phases, 9 groupes données
- ✅ Curing/Maturation - pour tous produits
- ✅ Structure générale (phases, intervalles, data)
- ✅ Documentation (SECTION_3_DATA_COMPLETE.md = 800+ lignes)

**À revoir**: **DONNÉES SEULEMENT**
- 🟡 Groupes données: Valider/corriger les champs
- 🟡 Sous-données: Vérifier types, options, validations
- 🟡 Valeurs par défaut: Revoir si cohérentes
- ⚠️ **NE PAS TOUCHER** à la structure/logique, just data

**Localisation**: `DOCUMENTATION/PAGES/CREATE_REVIEWS/FLEURS/SECTION_3_PIPELINE_CULTURE/`

---

#### **C. DONNÉES PRODUITS (Fleurs/Hash/Concentré/Comestible)**
**État**: Correctes mais besoin de code fixes

**Qui existe**:
- ✅ Fleurs: Toutes sections documentées
- ✅ Hash: Structure existe (sections 1-2 complètes)
- ✅ Concentré: Structure existe (sections 1-2 complètes)
- ✅ Comestible: Structure existe (sections 1-2 complètes)

**À faire**:
- 🔴 **Audit code errors**: Chercher bugs dans normalizeByType, mappings, UI
- 🔴 **Fix ces erreurs** (pas toucher aux données)
- 🔴 Compléter sections sensory (Odeurs, Goûts, Texture, Effets) pour Hash/Concentré/Comestible

---

### ❌ N'EXISTE PAS (À créer/généraliser)

#### **D. PHENOHUNT SYSTEM** 
**État**: Minimal - système existe mais NON généralisé

**Qui existe**:
- ✅ `geneticsHelper.js` (backend) - basics
- ✅ Feature flags (front) - accès Producteur seulement
- ✅ Documentation (phenohunt_sys.md)
- ❌ Pas de UI générale
- ❌ Pas d'intégration library
- ❌ Pas de sauvegarde/projets
- ❌ Pas d'arbre généalogique visual

**À faire** (PRIORITÉ HAUTE pour SPRINT 2+):
1. Créer UI Phenohunt complet (sidebar + canvas)
2. Généraliser système (pas juste Fleurs)
3. Intégrer dans Library
4. Ajouter sauvegarde/projets
5. Ajouter arbre généalogique visual

**Localisation**: À créer dans `client/src/components/genetics/`

---

#### **E. ADMIN PANEL** 
**État**: Nécessaire avant paiements

**À faire** (PRIORITÉ CRITIQUE):
1. Dashboard admin (statistiques, modération)
2. Gestion users (accounts, permissions)
3. Gestion subscriptions (activer/désactiver)
4. Modération galerie publique
5. Support/tickets

**Localisation**: À créer dans `client/src/components/admin/`

---

### 🔴 PROBLÈMES IMMÉDIATS À FIXER

#### **F. CODE BUGS/ERRORS**

**Dans orchard/normalizeByType.js**:
```javascript
// ⚠️ Issue 1: Hardcoded categoryFieldsMap dans OrchardPanel.jsx
// Duplique productTypeMappings - utiliser la fonction à la place
// Lines 48-53: Définition inline au lieu de getCategoryFieldsByType()

// ⚠️ Issue 2: Structure data inconsistente
// categoryRatings vs categoryFields mismatch
// Certains produits ont sous-champs, pas la moyenne

// ⚠️ Issue 3: Type normalization manquant
// Hash, Concentré, Comestible ont plein de variations de nom
// productTypeMappings gère certains cas mais pas tous
```

**Dans productTypeMappings.js**:
```javascript
// ⚠️ Issue 1: EDIBLE_CATEGORY_FIELDS vide
// Comestible a besoin de taste + effects au minimum

// ⚠️ Issue 2: Field names inconsistents
// "aromasIntensity" vs "intensiteAromatique" (mixed lang)
// Créer un mapping de synonymes

// ⚠️ Issue 3: Missing fields pour Hash/Concentré
// Manquent: viscosite, melting, residus dans certains
```

**Dans components orchard**:
```javascript
// ⚠️ Issue: Account type awareness manquant
// OrchardPanel pas aware si user est Amateur/Producteur/Influenceur
// Besoin de hook useAccountFeatures pour filtrer options

// ⚠️ Issue: Permission checks absents
// Aucune vérification si user peut vraiment exporter SVG/CSV/JSON
// Producteur seulement pour ça
```

---

## 📋 ROADMAP SPRINT 2 CORRIGÉE

### **TÂCHE 1: ACCOUNT PAGE REFONTE** (16 heures) 
- ✅ 3 versions per tier
- ✅ Tous onglets
- ✅ Subscription management
- ✅ KYC integration

### **TÂCHE 2: EXPORT MAKER FIXES & ADAPTATION** (20 heures)
1. **Fix code errors** (6 heures)
   - Unifier categoryFieldsMap (use productTypeMappings)
   - Fix EDIBLE_CATEGORY_FIELDS
   - Fix field name inconsistencies
   - Add account type awareness

2. **Adapter per type de compte** (6 heures)
   - Amateur: PNG/JPEG/PDF only (filigrane Terpologie obligatoire, templates prédéfinis)
   - Producteur: PNG/JPEG/SVG/PDF/CSV/JSON
   - Influenceur: PNG/JPEG/SVG/PDF only

3. **Adapter per type de produit** (8 heures)
   - Fleurs: Toutes sections
   - Hash: Sections 3-4 manquantes
   - Concentré: Sections 3-4 manquantes
   - Comestible: Section 3 manquante

### **TÂCHE 3: LIBRARY BASE ARCHITECTURE** (12 heures)
- Reviews sauvegardées
- Templates/Presets
- Sauvegarde données
- Filigrane personnalisés

### **TÂCHE 4: STATISTICS SYSTEM** (8 heures)
- Amateur: Basic stats
- Producteur: Business intelligence
- Influenceur: Audience analytics

### **TÂCHE 5: ADMIN PANEL ESSENTIALS** (16 heures)
**BLOQUANT POUR PAIEMENTS**
- Dashboard
- User management
- Subscription controls
- Gallery moderation

### **TÂCHE 6: PHENOHUNT GENERALIZATION** (12 heures)
**SPRINT 2+ (pas prioritaire pour MVP)**
1. UI générale (canvas + sidebar)
2. Backend généralisé
3. Intégration library
4. Sauvegarde/projets

---

## 🎯 ORDRE DE PRIORITÉ

### **SPRINT 2 (1 semaine - 56 heures)**
1. **TÂCHE 5**: Admin Panel (bloquant paiements)
2. **TÂCHE 1**: Account Page
3. **TÂCHE 2**: Orchard/Export (fixes + adapts)
4. **TÂCHE 3**: Library Base

### **SPRINT 3 (1-2 semaines)**
1. **TÂCHE 4**: Statistics
2. **TÂCHE 6**: Phenohunt Generalization
3. **TÂCHE 2 suite**: Advanced export features (SVG/CSV)
4. **Tests** + Déploiement v1.1.0

---

## 📝 DÉCISIONS À CONFIRMER

**Q1**: Faire Admin Panel avant Paiements?
- **Oui** (bloquant) → Avancer TÂCHE 5 en priorité

**Q2**: Phenohunt pour SPRINT 2?
- **Non** (SPRINT 3) → Focus Account/Export/Library/Admin

**Q3**: Compléter Hash/Concentré/Comestible maintenant?
- **OUI** (sections sensory) → Ajouter aux heures Tâche 2

**Q4**: Audit/fix les pipeline data ou juste documenter?
- **Juste fixer erreurs** (pas restructurer) → Audit puis patch code

---

## ✅ CHECKLIST PROCHAINES ÉTAPES

```
PHASE 0: AUDIT CODE (2 heures)
- [ ] Examiner tous les erreurs OrchardPanel/productTypeMappings
- [ ] Lister les bugs exacts à fixer
- [ ] Vérifier account-type-awareness dans components

PHASE 1: FIX URGENT (8 heures)
- [ ] Fix categoryFieldsMap duplication
- [ ] Fix EDIBLE_CATEGORY_FIELDS
- [ ] Fix field name inconsistencies
- [ ] Add account-type checks

PHASE 2: SPRINT 2 PREP (4 heures)
- [ ] Finalize Admin Panel design
- [ ] Finalize Account Page 3-tier structure
- [ ] Determine Pipeline data corrections needed
- [ ] Setup Phenohunt skeleton (SPRINT 3)

PHASE 3: SPRINT 2 EXECUTION
- [ ] Follow SPRINT_2_GETTING_STARTED.md
- [ ] Daily commits
- [ ] Weekly sync
```

---

**Status**: 🟡 Audit complete - Waiting for your confirmation before starting fixes
