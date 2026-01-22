# 🎯 SPRINT 2 - Frontend Adaptation (1 semaine)

**Objectif**: Adapter frontend MVP V1 au système 3-tiers CDD  
**Priorité**: URGENT - Bloque utilisation correcte par type  
**Deadline**: Fin semaine  

---

## 📋 Tâches Détaillées

### **TÂCHE 1: Créer hook `useAccountFeatures()`** ⭐ PRIORITÉ 0
**Fichier à créer**: `client/src/hooks/useAccountFeatures.js`

Ce hook centralisera la logique d'accès aux features par tier.

```javascript
// Exemple d'utilisation:
const { canAccessTemplates, canExportCSV, isDashboardPremium } = useAccountFeatures()

if (!canAccessTemplates) {
  return <LockedFeature reason="Premium Producteur" />
}
```

**Features à mapper**:
- Templates personnalisés (Producteur only)
- Filigranes (Producteur only)  
- Export SVG/CSV/JSON (Producteur only)
- Statistiques avancées (Producteur + Influenceur)
- Drag-drop dans export (Producteur only)
- Dashboard (Producteur + Influenceur)

**Difficulté**: ⭐⭐ (2h)

---

### **TÂCHE 2: Ajouter section "Abonnement" sur AccountPage** ⭐ PRIORITÉ 1
**Fichier à modifier**: `client/src/pages/account/AccountPage.jsx`

**Localisation**: Après section "Profil"  
**Nouveau composant**: `AccountTypeDisplay.jsx` (à créer)

**À ajouter**:
```jsx
<div className="subscription-section">
  <h3>Votre Abonnement</h3>
  <AccountTypeDisplay 
    accountType={accountType}
    email={user.email}
    isActive={subscription?.active}
  />
  {accountType === 'amateur' && (
    <Button onClick={showUpgradeModal}>Upgrade à Producteur/Influenceur</Button>
  )}
</div>
```

**Affiche**:
- Type actuel (AMATEUR / PRODUCTEUR / INFLUENCEUR)
- Prix mensuel
- Bouton "Upgrade" ou "Gérer mon abonnement"
- Statut (actif/expiré)

**Difficulté**: ⭐⭐ (3h)

---

### **TÂCHE 3: Créer UpgradeModal** ⭐ PRIORITÉ 1
**Fichier à créer**: `client/src/components/account/UpgradeModal.jsx`

**Affiche**:
- Tableau comparatif 3 tiers (features + prix)
- Boutons "Upgrade vers X" 
- Intégration Stripe (stub pour maintenant)
- FAQ accordion

**Structure**:
```jsx
<Modal title="Choisir votre abonnement">
  <div className="grid grid-cols-3">
    <TierCard tier="amateur" price="0€" locked={currentTier} />
    <TierCard tier="producteur" price="29.99€" locked={currentTier} />
    <TierCard tier="influenceur" price="15.99€" locked={currentTier} />
  </div>
</Modal>
```

**Tiers à afficher**:
```
AMATEUR (Gratuit)
├─ 5 exports/mois
├─ Templates prédéfinis seulement
├─ Statistiques basiques
└─ Pas de drag-drop

PRODUCTEUR (29.99€/mois)
├─ Exports illimités
├─ Templates personnalisés + drag-drop
├─ Pipelines configurables
├─ Statistiques avancées (rendements, etc.)
└─ Export CSV/JSON/SVG

INFLUENCEUR (15.99€/mois)
├─ Exports haute qualité
├─ Statistiques d'engagement
├─ Prévisualisations détaillées
├─ Analytics popularité reviews
└─ Export 300dpi
```

**Difficulté**: ⭐⭐⭐ (5h)

---

### **TÂCHE 4: Adapter StatsPage par type** ⭐ PRIORITÉ 1
**Fichier à modifier**: `client/src/pages/account/StatsPage.jsx`

**Logique**:
```jsx
if (accountType === 'amateur') {
  return <BasicStatsPage />
} else if (accountType === 'producteur') {
  return <ProductorStatsPage />
} else if (accountType === 'influenceur') {
  return <InfluencerStatsPage />
}
```

#### **BasicStatsPage** (Amateur):
- ✅ Nombre de reviews
- ✅ Note moyenne
- ✅ Type préféré
- ✅ Top cultivars

#### **ProductorStatsPage** (Producteur):
- ✅ Nombre de cultures actives
- ✅ Rendement moyen (g/m²)
- ✅ Timeline récoltes (date prévue vs réelle)
- ✅ Cultivar avec meilleur rendement
- ✅ Engrais utilisés (fréquence)
- ✅ Comparaison indoor/outdoor/greenhouse
- ✅ Durée moyenne culture (semaines)
- ✅ Méthodes de palissage (popularité)

#### **InfluencerStatsPage** (Influenceur):
- ✅ Nombre de reviews publiées
- ✅ Engagement total (likes + partages + comments)
- ✅ Top 5 reviews par engagement
- ✅ Growth chart (mois sur mois)
- ✅ Cultivars tendance (mention fréquence)
- ✅ Taux d'engagement moyen

**Difficulté**: ⭐⭐⭐ (6h)

---

### **TÂCHE 5: Créer composant LockedFeature** ⭐ PRIORITÉ 2
**Fichier à créer**: `client/src/components/ui/LockedFeature.jsx`

**Usage**:
```jsx
{isProductorOnly && accountType !== 'producteur' ? (
  <LockedFeature 
    reason="Premium Producteur" 
    onUpgrade={() => showUpgradeModal()}
  />
) : (
  <Features />
)}
```

**Affiche**:
- 🔒 Icône verrou
- Message "Cette fonctionnalité est disponible uniquement pour [TIER]"
- Bouton "Upgrade maintenant"

**Difficulté**: ⭐ (1h)

---

### **TÂCHE 6: Verrouiller features payantes** ⭐ PRIORITÉ 2
**Fichiers à modifier**:
1. `client/src/pages/account/AccountPage.jsx` - Onglets "Templates", "Filigranes"
2. `client/src/components/export/ExportMaker.jsx` - Export CSV/JSON/SVG
3. `client/src/pages/review/ReviewLibrary.jsx` - Templates personnalisés

**Code type**:
```jsx
// Avant:
<Tab id="templates" label="Templates" />

// Après:
{(accountType === 'producteur' || accountType === 'influenceur') && (
  <Tab id="templates" label="Templates" />
)}

// Ou avec badge locked:
<Tab 
  id="templates" 
  label="Templates" 
  badge={accountType !== 'producteur' ? '💎' : null}
  disabled={accountType !== 'producteur'}
/>
```

**Difficulté**: ⭐⭐ (4h)

---

### **TÂCHE 7: Compléter ManageSubscription** ⭐ PRIORITÉ 2
**Fichier à modifier**: `client/src/pages/account/ManageSubscription.jsx`

**À ajouter**:
```jsx
// Affichage abonnement actif
<div>
  <h3>Abonnement actif</h3>
  <p>{subscription.type} - {subscription.price}€/mois</p>
  <p>Renouvellement: {subscription.renewalDate}</p>
</div>

// Historique factures
<div>
  <h3>Historique de facturation</h3>
  <InvoiceTable invoices={invoices} />
</div>

// Bouton annulation
<Button variant="danger" onClick={handleCancelSubscription}>
  Annuler mon abonnement
</Button>
```

**Difficulté**: ⭐⭐ (3h)

---

## 📊 Tableau Récapitulatif Tâches

| Tâche | Fichier | Type | Durée | Priorité | Dépend de |
|-------|---------|------|-------|----------|-----------|
| 1 | `useAccountFeatures.js` | CREATE | 2h | P0 | - |
| 2 | `AccountPage.jsx` | MODIFY | 3h | P1 | T1 |
| 3 | `UpgradeModal.jsx` | CREATE | 5h | P1 | T1 |
| 4 | `StatsPage.jsx` | MODIFY | 6h | P1 | T1 |
| 5 | `LockedFeature.jsx` | CREATE | 1h | P2 | T1 |
| 6 | Mult. fichiers | MODIFY | 4h | P2 | T5 |
| 7 | `ManageSubscription.jsx` | MODIFY | 3h | P2 | - |

**Total**: ~24h (3 jours à temps plein)

---

## 🚀 Ordre d'Exécution Recommandé

### **Jour 1** (8h):
1. ✅ Tâche 1 - Créer hook (2h)
2. ✅ Tâche 2 - Ajouter section Account (3h)
3. ✅ Tâche 5 - Créer LockedFeature (1h)
4. ✅ Tâche 3 (début) - Structure UpgradeModal (2h)

### **Jour 2** (8h):
5. ✅ Tâche 3 (fin) - UpgradeModal + Stripe stub (3h)
6. ✅ Tâche 4 - Adapter StatsPage (5h)

### **Jour 3** (8h):
7. ✅ Tâche 6 - Verrouiller features (4h)
8. ✅ Tâche 7 - Compléter ManageSubscription (3h)
9. ✅ Tests + Polish (1h)

---

## 🔗 Dépendances

```
useAccountFeatures (T1)
    ├─> AccountPage (T2)
    ├─> UpgradeModal (T3)
    ├─> StatsPage (T4)
    └─> LockedFeature (T5)
         └─> Verrouiller features (T6)
```

---

## ✅ Critères d'Acceptation

Sprint 2 est DONE quand:

- [ ] ✅ Hook `useAccountFeatures()` fonctionne
- [ ] ✅ Page Account affiche type de compte + bouton Upgrade
- [ ] ✅ Modal Upgrade montre 3 tiers avec comparaison
- [ ] ✅ StatsPage affiche metrics différentes par tier
- [ ] ✅ Templates/Filigranes/ExportPro verrouillés pour non-Producteur
- [ ] ✅ ManageSubscription complet
- [ ] ✅ Zéro warning/erreur dans console
- [ ] ✅ Responsive (mobile + desktop)
- [ ] ✅ Tests unitaires créés

---

## 🎯 Après Sprint 2

Une fois ces tâches terminées:
- ✅ Frontend respecte 100% du CDD
- ✅ Utilisateurs voient leurs permissions
- ✅ Upgrade path clair et accessible
- ✅ Prêt pour passer à **Phase 2 HASH**

