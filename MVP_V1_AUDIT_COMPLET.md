# 🔍 AUDIT COMPLET MVP V1 - État vs CDD

**Date**: 19 janvier 2026  
**Version MVP**: V1 (en production sur VPS)  
**Phase 1 FLEURS**: Déployée sur main (v1.0.0-phase1)

---

## 📋 RÉSUMÉ EXÉCUTIF

### ✅ État Général
- **Codebase**: Structurée et en production
- **Déploiement**: Live sur https://www.terpologie.eu (VPS)
- **Phase 1 FLEURS**: Implémentée et mergée sur main
- **Utilisateurs actifs**: 2 reviews créées (Inconnu, Zkittles)

### ⚠️ Problèmes Identifiés
1. **Pages Account/Library/Stats** - PAS ADAPTÉES AU CDD (types de compte)
2. **Statistiques** - Affichées identiques pour tous (pas de différenciation par tier)
3. **Bibliothèque** - Structure vague, pas de permissions par type
4. **Dashboard** - Manque perspective producteur/influenceur

---

## 🏗️ SYSTÈME DE COMPTES (Backend ✅, Frontend ❌)

### Backend: IMPLÉMENTÉ ✅

**Fichier**: [server-new/services/account.js](server-new/services/account.js)

```
Trois tiers définis:
- AMATEUR (gratuit) ..................... 0€
- PRODUCTEUR (payant) .................. 29.99€/mois
- INFLUENCEUR (payant) ................. 15.99€/mois
```

**Fonctions disponibles**:
- ✅ `getUserAccountType(user)` - Récupère le type
- ✅ `canUpgradeAccountType(user, targetType)` - Valide transition
- ✅ `changeAccountType(userId, newType)` - Change le type
- ✅ Gestion des profils (producerProfile, influencerProfile)
- ✅ Migration rétrocompatible depuis anciens types

**Transition Autorisées**:
```
Amateur → Producteur ✅
Amateur → Influenceur ✅
Producteur ↔ Influenceur ✅ (avec upgrade/downgrade)
```

### Frontend: NON ADAPTÉ ❌

**Problèmes critiques**:

1. **Page Account** (`client/src/pages/account/AccountPage.jsx`)
   - ❌ Pas de section "Abonnement/Subscription"
   - ❌ Pas d'affichage du type de compte actuel
   - ❌ Pas d'options de changement de tier
   - ❌ Onglets fixes, indépendants du type de compte

2. **Page Statistiques** (`client/src/pages/account/StatsPage.jsx`)
   - ❌ Affiche identiquement pour tous les types
   - ❌ Pas de statistiques avancées pour Producteur (rendements, cultures, etc.)
   - ❌ Pas de statistiques sociales pour Influenceur (likes, partages)
   - ⚠️ Calculs basiques, pas d'agrégation par période

3. **Bibliothèque** (`client/src/pages/review/ReviewLibrary.jsx`)
   - ❌ Pas de démarcation par type de compte
   - ❌ Pas de limite d'accès (templates personnalisés Producteur only)
   - ❌ Pas de fonctionnalités drag-drop Producteur

---

## 📊 PHASE 1 FLEURS - Statut Déploiement

### Backend: ✅ COMPLET
- 15 endpoints API implémentés
- 3 modèles Prisma (CultureSetup, Pipeline, PipelineStage)
- Migrations prêtes
- Seed data préparé

### Frontend: ✅ IMPLÉMENTÉ
- 4 composants React
- 4 fichiers CSS (responsive)
- Section 3 ("Culture Pipeline") intégrée
- Formulaire de création complet

### Tests: ✅ PRÊTS (non exécutés sur VPS)
- 18 tests API
- 5 tests composants
- 3 tests intégration

### État Production
```
Git: main branch v1.0.0-phase1 ✅
VPS: Services running ✅
Database: Migration ready ⏳ (drift non appliquée)
UI: Visible sur création review fleur ✅
```

---

## 🔴 PROBLÈMES CRITIQUES À CORRIGER

### Priorité 1: URGENT (Bloque utilisation)

#### 1. Page Account ne montre pas type de compte
**Fichier**: `client/src/pages/account/AccountPage.jsx`

**Ce qui manque**:
```jsx
// MANQUE:
<div className="profile-section">
  <h3>Type d'abonnement</h3>
  <p>{accountType.toUpperCase()}</p>
  <Button onClick={showUpgradeModal}>Changer d'abonnement</Button>
</div>
```

**Impact**: L'utilisateur ne sait pas quel tier il a.

---

#### 2. Stats Page identique pour tous
**Fichier**: `client/src/pages/account/StatsPage.jsx`

**Ce qui manque** (pour Producteur):
- Nombre de cultures créées
- Rendements moyens (g/m²)
- Timeline de croissance
- Statistiques engrais utilisés
- Comparaisons cultivars

**Ce qui manque** (pour Influenceur):
- Likes reçus par review
- Partages sociaux
- Commentaires reçus
- Top reviews par engagement
- Abonnés (futur)

**Solution**: Refactoriser avec condition `if (accountType === 'producteur')`

---

#### 3. Onglets Account masqués selon tier
**Actuel**:
```jsx
const TAB_SECTIONS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'preferences', label: 'Préférences', icon: Settings },
  { id: 'saved-data', label: 'Données sauvegardées', icon: Save, locked: false },
  { id: 'templates', label: 'Templates', icon: '⭐', locked: false },
  { id: 'watermarks', label: 'Filigranes', icon: '🏷️', locked: false },
  { id: 'export', label: 'Export', icon: '📤', locked: false },
]
```

**À faire**: 
- Templates: Producteur + Influenceur only
- Filigranes: Producteur only
- Engrais/Substrats (saved-data): Producteur only

---

### Priorité 2: IMPORTANTE (Manque fonctionnalités clé)

#### 4. Pas de modal "Upgrade Abonnement"
**À créer**: `client/src/components/account/UpgradeModal.jsx`

Afficher:
- Tarifs des 3 tiers
- Bénéfices de chaque tier
- Bouton Stripe pour paiement
- Comparaison features

---

#### 5. Bibliothèque sans permissions
**Fichier**: `client/src/pages/review/ReviewLibrary.jsx`

**À ajouter**:
```jsx
// Pour templates personnalisés
if (template.isCustom && accountType !== 'producteur') {
  return <LockedBadge reason="Premium Producteur" />
}

// Pour drag-drop
if (accountType !== 'producteur') {
  return <div>Fonctionnalité Premium</div>
}
```

---

#### 6. Gestion Subscription UI manquante
**Fichier**: `client/src/pages/account/ManageSubscription.jsx`

**État**: Fichier existe mais incomplet
- ❌ Pas d'affichage de l'abonnement actuel
- ❌ Pas de bouton "Annuler"
- ❌ Pas de factures/invoices
- ❌ Pas d'historique paiements

---

### Priorité 3: AMÉLIORATIONS (Polish)

#### 7. Page Library génériques
- Ajouter filtres par type (Fleur, Hash, etc.)
- Afficher "Premium" sur templates Producteur
- Ajouter système de ratings/favoris

#### 8. Dashboard Producteur manquant
**À créer**: `client/src/pages/ProductorDashboard.jsx`

Afficher:
- Nombre de cultures en cours
- Timeline récoltes prévues
- Rendements moyens
- Analyse engrais
- Top cultivars (rendement/qualité)

#### 9. Dashboard Influenceur manquant
**À créer**: `client/src/pages/InfluencerDashboard.jsx`

Afficher:
- Reviews les plus populaires
- Engagement total (likes+partages+comments)
- Growth chart
- Cultivars tendance
- Audience démographique

---

## 📁 FICHIERS À CRÉER/MODIFIER

### Créer (7 fichiers):
```
client/src/components/account/UpgradeModal.jsx ........... NEW (modal upgrade)
client/src/components/account/AccountTypeDisplay.jsx ... NEW (affiche tier)
client/src/components/account/SubscriptionCard.jsx ...... NEW (détail subscription)
client/src/pages/ProductorDashboard.jsx ................. NEW (dashboard producteur)
client/src/pages/InfluencerDashboard.jsx ................ NEW (dashboard influenceur)
client/src/pages/admin/AdminPanel.jsx ................... NEW (panel admin - futur)
client/src/hooks/useAccountFeatures.js .................. NEW (hook permissions)
```

### Modifier (8 fichiers):
```
client/src/pages/account/AccountPage.jsx ............... (ajouter subscription display + upgrade)
client/src/pages/account/StatsPage.jsx ................. (adapter par type)
client/src/pages/account/ManageSubscription.jsx ........ (compléter UI)
client/src/pages/review/ReviewLibrary.jsx .............. (ajouter permissions)
client/src/components/export/ExportMaker.jsx ........... (adapter par tier)
client/src/store/useStore.js ........................... (ajouter accountType)
client/src/App.jsx .................................... (ajouter routes dashboards)
server-new/routes/subscription.js ....................... (créer endpoint pricing)
```

---

## 🎯 PLAN D'ACTION (Après Phase 1 FLEURS)

### Sprint 2 (1 semaine):
1. ✅ Créer hook `useAccountFeatures()` pour vérifier permissions
2. ✅ Ajouter section "Abonnement" sur AccountPage
3. ✅ Créer UpgradeModal avec tarifs
4. ✅ Adapter StatsPage par type
5. ✅ Verrouiller Templates/Filigranes par permission

### Sprint 3 (1 semaine):
6. ✅ Créer ProductorDashboard
7. ✅ Créer InfluencerDashboard
8. ✅ Compléter ManageSubscription
9. ✅ Adapter ReviewLibrary permissions
10. ✅ Ajouter drag-drop templates (Producteur only)

### Sprint 4+ (Futur):
- Admin Panel
- Système de factures/invoices
- Stripe integration complète
- Analytics avancées par tier

---

## 📊 COMPARAISON CDD vs RÉALITÉ

| Fonctionnalité | CDD | Réalité | Gap |
|---|---|---|---|
| **Système 3 tiers** | ✅ Défini | ✅ Backend OK | Frontend ❌ |
| **Permissions tier** | ✅ Spécifiées | ❌ Non implémentées | URGENT |
| **Export multi-format** | ✅ Détaillé | ⚠️ Partial | Besoin adapter |
| **Templates Producteur** | ✅ Drag-drop | ❌ Pas de UI | IMPORTANT |
| **Stats Producteur** | ✅ Rendements | ❌ Manquantes | IMPORTANT |
| **Stats Influenceur** | ✅ Engagement | ❌ Manquantes | IMPORTANT |
| **Galerie publique** | ✅ Définie | ⚠️ Basique | Besoin filtres |
| **KYC/Vérification** | ✅ Mentionné | ✅ Routes existantes | OK |

---

## 🚀 NEXT STEPS IMMÉDIATS

1. **Avant Phase 2 HASH**:
   - [ ] Ajouter affichage type de compte sur AccountPage
   - [ ] Créer UpgradeModal
   - [ ] Adapter StatsPage pour afficher différentes metrics par tier

2. **En parallèle Phase 2**:
   - [ ] Créer ProductorDashboard
   - [ ] Créer InfluencerDashboard
   - [ ] Implémenter permissions sur features payantes

3. **Après Phase 2 (Priorité basse)**:
   - [ ] Admin Panel
   - [ ] Système d'invoices
   - [ ] Analytics avancées

---

## 📞 RÉSUMÉ POUR RAFOU

**Situtation**: 
- Backend CDD: ✅ Bien implémenté (types, transitions, API)
- Frontend CDD: ❌ Pas du tout adapté (pas de différenciation tier)
- Phase 1 FLEURS: ✅ Déployée et fonctionnelle

**Action urgente**:
- Adapter pages Account/Library/Stats pour montrer différences par tier
- Créer modal upgrade abonnement
- Verrouiller features payantes

**Pas bloquant**:
- Phase 2 HASH peut commencer en parallèle
- Les dashboards Producteur/Influenceur peuvent être polish après
