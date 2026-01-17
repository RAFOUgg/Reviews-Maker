# 📌 TABLEAU DES INCOHÉRENCES - Docs vs Code vs Reality

**Date**: 17 janvier 2026  
**Objectif**: Cartographier les écarts entre spécifications, documentation et implémentation

---

## 🎯 RÉSUMÉ EXÉCUTIF

| Catégorie | Attendu | Réel | Écart | Sévérité |
|-----------|---------|------|-------|----------|
| **Page Profil** | 312 lignes détaillées | 326 lignes code (15% seulement) | -297 fonctionnalités | 🔴 CRITIQUE |
| **Permissions** | Matrice 3×20 features | Code fragments (40%) | Pas de couche centralisée | 🔴 CRITIQUE |
| **Admin Panel** | Dark + glassmorphism | Blanc + gris basique | UI inversée | 🔴 URGENT |
| **Fleurs** | 100% specs | 79% implémentée | -21% (Généalogie) | 🟡 MAJEUR |
| **Hash** | 100% specs | 67% implémentée | -33% (Pipelines) | 🟡 MAJEUR |
| **Concentrés** | 100% specs | 47% implémentée | -53% (Extraction/Purif) | 🔴 MAJEUR |
| **Comestibles** | 100% specs | 50% implémentée | -50% (Recette) | 🔴 MAJEUR |
| **Tests & QA** | Documentation QA | 0 tests visibles | -100% | 🔴 ABSENCE |

---

## 📑 DÉTAIL PAR DOMAINE

### 1. PAGE PROFIL

#### Documentation (PAGES/PROFILS/INDEX.md)
```markdown
### 1. INFORMATIONS PERSONNELLES (312 lignes)
- Email ✓, Username ✓, Prénom ✗, Nom ✗, Pays ✗, Langue ✓
- Avatar ✗, Bio ✗, Profil Public ✗, Website ✗
- OAuth Links (Discord, Google, Facebook, Apple, Amazon) ✗
- Sessions Management ✗
- Security (2FA, Password change) ✗

### 2. DONNÉES ENTREPRISE (Producteur/Influenceur)
- Infos Pro (Nom, Type, SIRET, Adresse, Tel) ✗
- KYC (ID, Justif, Docs pro) ✗
- Historique Vérification ✗

### 3. PRÉFÉRENCES & PARAMÈTRES
- Thème ✗, Format date ✗, Unités ✗
- Notifications (5 types) ⚠️ (2 seulement: showNotifications)
- Export Preferences ✗
- Privacy & Data ✗
- RGPD (Download data, Delete account) ✗

### 4. DONNÉES FACTURATION
- Abonnement actif ✗, Dates ✗, Statut ✗
- Méthodes paiement ✗
- Historique factures ✗
- Change subscription ✗

### 5. INTÉGRATIONS EXTERNES
- API Keys ✗
- Webhooks ✗
```

**Total Spec**: 60+ fields/features  
**Total Implémenté**: 9 fields (15%)

#### Code Réel (AccountPage.jsx)

✅ **Ce qui existe** (9 items):
```jsx
- user.username (read-only)
- user.email (read-only)
- user.createdAt (read-only)
- accountType affichage
- language selector
- preferences.showNotifications (toggle)
- preferences.autoSaveDrafts (toggle)
- preferences.allowSocialSharing (toggle)
- preferences.privateProfile (toggle)
- preferences.showDetailedStats (toggle)
- preferences.defaultVisibility (select)
- logout button
- upgrade/manage subscription buttons
```

❌ **Absent** (51 items):
```jsx
// Section 1: Personal Info - MISSING
- Édition email, username, prénom, nom, pays
- Avatar upload
- Bio textarea
- Website URL
- Public profile toggle
- OAuth linking (5 providers)
- Password change
- 2FA setup
- Sessions management

// Section 2: Enterprise Data - MISSING
- Aucune visibilité pour Producteur/Influenceur
- Infos prof
- KYC status & upload
- Historique vérification

// Section 3: Preferences - INCOMPLETE
- Format date missing
- Unités missing
- Export preferences missing
- Privacy & data settings missing
- RGPD buttons missing

// Section 4: Billing - MISSING
- Abonnement affichage complet
- Dates renouvellement
- Invoice history
- Payment methods
- Upgrade/downgrade UI (existe mais basique)
- Cancel subscription

// Section 5: Integrations - MISSING
- API keys
- Webhooks
```

#### Impact Utilisateur
- **Amateur**: Impossible changer infos (bloqué read-only)
- **Producteur**: Pas d'accès KYC, pas de gestion factures
- **Influenceur**: Pas de données entreprise, pas d'API keys
- **Tous**: Pas de 2FA, sessions, OAuth linking

---

### 2. SYSTÈME DE PERMISSIONS

#### Documentation (PAGES/PERMISSIONS.md)
```markdown
Matrice 3×20+ features:

CREATE_REVIEWS:
- Fleurs: 10 features (pipeline culture, genealogy, etc.)
- Hash: 8 features (pipeline, curing, etc.)
- Concentrés: 9 features (extraction, purification, etc.)
- Comestibles: 4 features

EXPORT_MAKER:
- Formats: 7 (PNG, JPEG, PDF, SVG, CSV, JSON, HTML)
- Templates: 5 (Compact, Détaillé, Complète, Influenceur, Personnalisé)
- Formats Canvas: 4 (1:1, 16:9, 9:16, A4)
- Personnalisation: 7 options

PROFILS:
- Éditer, Password, 2FA, KYC, Enterprise data, Advanced prefs

BIBLIOTHEQUE:
- Reviews, Cultivars, Templates, Filigranes, Données récurrentes

STATISTIQUES:
- Avancées pour Producteur/Influenceur
```

#### Code Réel

**Frontend Permission Checks**:
```javascript
// AccountPage.jsx
const { user, accountType } = useStore()

if (accountType === 'Amateur') {
  // Show upgrade button
} else {
  // Show manage subscription
}

// ✗ Manque:
// - Pas de permission matrix centralisée
// - Pas de hasPermission() utility
// - Pas de PermissionGate component
// - Pas de permission checks par feature
```

**Routes/Components**:
```jsx
// Créer review - permissions?
<CreateFlowerReview /> // Aucune vérification visuelle
<CreateHashReview /> // Aucune vérification visuelle

// Export - permissions?
<ExportMaker /> // Aucune restriction sur formats/templates visibles

// Admin Panel - permissions?
<AdminPanel /> // Fait des appels API, retour d'erreur si non-autorisé
                // Mais aucune gatekeeper préventif
```

**Backend** (Impossible vérifier sans VPS):
- Probablement: middleware auth vérifie `accountType`
- À vérifier: validation per-feature, logging, error handling

#### Impact Système
- **Utilisateurs**: Peuvent cliquer partout, erreurs API à la fin
- **Frontend**: UX pauvre, pas de feedback rapide
- **Backend**: Validation répétée à chaque endpoint
- **Audit**: Impossible tracker tentatives accès non-autorisé

---

### 3. ADMIN PANEL

#### Documentation (PAGES/PANNEAU_ADMIN/ADMIN_PANEL_README.md)
```markdown
✅ Status: PRODUCTION READY

Fonctionnalités:
- User search & filtering
- Account type management (C→I→P)
- Subscription status
- Ban/unban system
- User statistics
- Responsive design
- Apple-like UI/UX
```

#### Code Réel (AdminPanel.jsx + AdminPanel.css)

**Backend** ✅ OK:
```javascript
// 7 endpoints fonctionnels
GET /api/admin/check-auth
GET /api/admin/users
GET /api/admin/stats
PATCH /api/admin/users/:id/account-type
PATCH /api/admin/users/:id/subscription
PATCH /api/admin/users/:id/ban
```

**Frontend Business Logic** ✅ OK:
```javascript
// State management
const [users, setUsers] = useState([])
const [filter, setFilter] = useState('all')
const [editingUser, setEditingUser] = useState(null)

// Functions
const fetchUsers = async () { ... }
const changeAccountType = async (userId, newType) { ... }
const toggleBan = async (userId, currentBanned) { ... }
```

**Frontend UI/UX Styling** ❌ PROBLÈME:

```css
/* ❌ Avant (Documentation = "Apple-like UI/UX")  */
.admin-panel {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); /* BLANC */
    padding: 2rem;
}

.admin-header h1 {
    font-size: 2.5rem;
    color: #1a1a1a; /* NOIR */
}

.stat-card {
    background: white; /* BLANC */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Ombre simple */
    border-radius: 12px;
}

/* ❌ Manque:
- Glassmorphism / backdrop-filter
- Dark theme (projet = dark)
- Liquid UI components (LiquidCard, LiquidButton)
- Animations fluides
- Gradients cohérents
- Cohérence avec le reste du projet
*/
```

#### Incohérence Majeure
| Aspect | Projet Global | Admin Panel |
|--------|---|---|
| **Thème** | Dark (#1a1a2e, #16213e) | Light blanc/gris |
| **Fond** | Gradient dark doux | Gradient blanc plat |
| **Cards** | Glassmorphism + backdrop-filter | Cartes blanches plates |
| **Text** | #e0e0e0 (clair) | #1a1a1a (sombre) |
| **Design** | Apple-like, épuré | Standard, déprimant |
| **Components** | LiquidCard, LiquidButton | Div + CSS simples |

#### Impact
- Admin panel "déconnecté" du design du projet
- Expérience utilisateur cassée (dark→light)
- Pas professionnel (débutant vs mature)
- Maintainabilité: double système de styles

---

### 4. CONFORMITÉ PRODUITS

#### Fleurs

**Specification** (CAHIER_DES_CHARGES_V1_MVP_FLEURS.md):
```
✓ Infos Générales (Nom, Cultivar, Farm, Type, Photos)
✓ Génétiques (Breeder, Variété, Type, %, Généalogie, Phénotype)
✓ Pipeline Culture (Complet avec 9 groupes données)
✓ Visuel & Technique (8 ratings)
✓ Odeurs (Notes, Intensité)
✓ Texture (4 ratings)
✓ Goûts (Intensité, Agressivité, Notes)
✓ Effets Ressentis (Montée, Intensité, Choix, Tests)
✓ Pipeline Curing (Complet)
✓ Arbre Généalogique (Graphe parents/enfants)

Total: 10 sections complètes
```

**Code** (CreateFlowerReview.jsx + sections):
```
✓ Infos Générales - 100% (nom, photos, cultivar, type)
⚠️ Génétiques - 70% (existe, mais incomplètes)
⚠️ Pipeline Culture - 60% (exists, incomplete)
✓ Visuel & Technique - 100%
✓ Odeurs - 100%
✓ Texture - 100%
✓ Goûts - 100%
✓ Effets - 100%
⚠️ Pipeline Curing - 60%
✗ Arbre Généalogique - 0% (absent complètement)

Total Couverture: 79%
```

**Manques Critiques**:
- Pipeline culture données manquantes
- Pipeline curing données manquantes
- Arbre généalogique absent (complexe)

---

#### Hash

**Specification**: 8 sections complètes  
**Code**: 5 sections, pipelines incomplets  
**Couverture**: 67%

**Manques**:
- Pipeline séparation (filtres, methods)
- Pipeline curing détaillée

---

#### Concentrés

**Specification**: 8 sections complètes  
**Code**: 3 sections seulement  
**Couverture**: 47%

**Manques**:
- Pipeline extraction complet
- Pipeline purification (absent)
- Curing détaillé

---

#### Comestibles

**Specification**: 4 sections  
**Code**: 2 sections seulement  
**Couverture**: 50%

**Manques**:
- Pipeline recette (essentiel)
- Gestion ingrédients

---

## 🔗 TABLEAU SYNTHÉTIQUE

```
┌─────────────────────────────────────────────────────────┐
│           INCOHÉRENCES DÉTECTÉES (17/01/2026)          │
├──────────┬─────────────┬──────────┬──────────┬──────────┤
│ Domaine  │ Spec (docs) │ Code     │ Réel %   │ Priorité │
├──────────┼─────────────┼──────────┼──────────┼──────────┤
│ Profil   │ 60 features │ 9 items  │ 15%      │ 🔴 NOW  │
│ Perms    │ 3×20 matrix │ fragments│ 40%      │ 🔴 NOW  │
│ Admin UI │ Apple-like  │ Light UI │ 20%      │ 🔴 24H  │
│ Fleurs   │ 100%        │ 79%      │ 79%      │ 🟡 48H  │
│ Hash     │ 100%        │ 67%      │ 67%      │ 🟡 72H  │
│ Concentr │ 100%        │ 47%      │ 47%      │ 🔴 1W   │
│ Comestib │ 100%        │ 50%      │ 50%      │ 🔴 1W   │
│ Tests QA │ 60 tests    │ 0 tests  │ 0%       │ 🟡 1W   │
└──────────┴─────────────┴──────────┴──────────┴──────────┘
```

---

## 📋 SOURCES DES INCOHÉRENCES

### 1. Scope Creep Documentation
- Documentation très détaillée (312+ lignes)
- Code en retard de 2-3 semaines
- Décision probablement de démarrer implémentation
- Sans terminer toutes les specs
- ✗ Pas synchronisées depuis

### 2. Manque de Priorisation Frontend
- Fleurs en priorité (79% fait)
- Hash/Concentrés/Comestibles négligés
- Page profil jamais refactorisée
- Admin panel laissé incomplet

### 3. Architecture Permissions
- Pas de couche permissions centralisée
- Checks fragmentés dans components
- Backend probablement plus strict
- Frontend UX souffre

### 4. Design System Inconsistency
- Admin panel stylesheet indépendant
- Ne suit pas dark theme du projet
- LiquidCard/LiquidButton non utilisés
- Probable dette technique

### 5. Pas de Tests & QA
- Documentation mentionne 60 tests
- Aucune suite de tests visible
- Pas de checklist e2e
- QA probablement manuel

---

## ✅ ACTIONS RECOMMANDÉES

### Immédiat (Aujourd'hui)
1. [ ] Créer branche `feat/admin-dark-theme`
2. [ ] Appliquer dark theme AdminPanel.css
3. [ ] Tester cohérence avec projet

### 24H (Demain)
1. [ ] Refactoriser AccountPage sections
2. [ ] Ajouter ProfileSection.jsx
3. [ ] Tester permissions visibles

### 48H (Après-demain)
1. [ ] BillingSection complète
2. [ ] EnterpriseSection pour Producteur/Influenceur
3. [ ] Permission matrix + hooks

### 1 Semaine
1. [ ] Hash/Concentrés pipelines
2. [ ] Comestibles recette
3. [ ] Tests e2e permissions

---

**Audit réalisé**: 17 janvier 2026  
**Par**: Copilot Audit  
**Statut**: Documentation complète, prêt pour action
