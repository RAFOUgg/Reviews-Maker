# 🔍 AUDIT DATABASE - Synthèse Exécutive

**Date**: 2026-01-16  
**Status**: 🔴 **CRITIQUE** - Actions requises  
**Responsible**: GitHub Copilot  

---

## TL;DR - Le Problème en 2 Phrases

1. **Énumération incohérente**: Backend utilise français (`'producteur'`) tandis que frontend attend anglais (`'producer'`)
2. **Résultat**: Votre compte Dev affiche "Standard" (inexistant) au lieu de "Producteur"

---

## 📋 Documents Créés

| Document | Contenu | Durée Lecture |
|----------|---------|---------------|
| **AUDIT_DATABASE_COMPLET_2026-01-16.md** | Audit détaillé de tous les problèmes | 15 min |
| **ACTION_PLAN_DATABASE_FIX.md** | Plan d'action avec étapes exactes | 20 min |
| **scripts/fix-account-types-migration.js** | Script de migration automatisée | Auto |

---

## 🚨 PROBLÈMES CRITIQUES

### 1. INCOHÉRENCE MASIVE DES ÉNUMÉRATIONS

```
Backend (account.js):          Frontend:              Permissions.js:
AMATEUR: 'amateur'             expects 'consumer'     CONSUMER: 'consumer'
PRODUCTEUR: 'producteur'       expects 'producer'     PRODUCER: 'producer'
INFLUENCEUR: 'influenceur'     expects 'influencer'   INFLUENCER: 'influencer'
```

**Impact**: Les comparaisons échouent → Comptes invalides

### 2. VOTRE COMPTE EST CASSÉ
- Actuellement: `accountType: "consumer"` (défaut)
- Devrait être: `accountType: "producer"` + `roles: ["producer", "admin"]`
- Résultat: Affichage "Standard" (n'existe pas)

### 3. PROFILS INCOMPLETS
- ProducerProfile: Manque champs (cultivars, certifications, stats)
- InfluencerProfile: Manque champs (audience, engagement, collabs)
- KYCDocument: Modèle manquant complètement

### 4. SYSTÈME DE SUBSCRIPTION CASSÉ
- Table Subscription existe mais jamais utilisée
- Champ User.subscriptionType redondant
- Aucune gestion Stripe/renouvellement

---

## ⚡ SOLUTION RAPIDE (3 HEURES)

### Étape 1: Unifier les énumérations à ANGLAIS
**Fichier**: `server-new/services/account.js`

Changer:
```javascript
// Avant
AMATEUR: 'amateur'
PRODUCTEUR: 'producteur'
INFLUENCEUR: 'influenceur'

// Après
CONSUMER: 'consumer'
PRODUCER: 'producer'
INFLUENCER: 'influencer'
```

### Étape 2: Exécuter la migration
```bash
cd server-new
node ../scripts/fix-account-types-migration.js
```

### Étape 3: Fixer votre compte
Via Prisma Studio ou script:
```javascript
// Vous rendre 'producer' + 'admin'
UPDATE User 
SET accountType = 'producer', 
    roles = '{"roles":["producer","admin"]}'
WHERE email = 'bgmgaming09@gmail.com'
```

### Étape 4: Vérifier
```bash
# Redémarrer le backend
pm2 restart ecosystem.config.cjs

# Vérifier dans le navigateur
# - /account/settings devrait afficher "Producteur"
# - /account/profile devrait montrer badge 🌱
```

---

## 📊 IMPACT

| Utilisateurs | Problème | Sévérité |
|--------------|----------|----------|
| **TOUS** | Énumération incohérente | 🔴 CRITIQUE |
| **PRODUCTEURS** | Pas de ProducerProfile | 🟡 IMPORTANT |
| **INFLUENCEURS** | Pas de InfluencerProfile | 🟡 IMPORTANT |
| **PAYANTS** | Subscription cassée | 🟡 IMPORTANT |
| **PRODUCTEURS** | Pas de KYC | 🟡 IMPORTANT |

---

## 📈 ROADMAP COMPLET

```
PHASE 1 (Immédiat - 3h)
├─ Unifier ACCOUNT_TYPES à ANGLAIS
├─ Exécuter migration
├─ Fixer compte DEV
└─ Tests manuels

PHASE 2 (Demain - 10h)
├─ Compléter ProducerProfile
├─ Compléter InfluencerProfile
├─ Ajouter KYCDocument
└─ Migrations Prisma

PHASE 3 (Cette semaine - 8h)
├─ Nettoyer User model
├─ Améliorer Subscription
├─ Ajouter Stripe webhooks
└─ Tester checkout

PHASE 4 (Semaine suivante - 5h)
├─ Data integrity tests
├─ Performance tests
├─ E2E tests
└─ Merge to main
```

---

## ✅ DOCUMENTS À LIRE

1. **Immédiatement**:
   - Lire: `AUDIT_DATABASE_COMPLET_2026-01-16.md` (15 min)
   - Action: Phase 1 de `ACTION_PLAN_DATABASE_FIX.md` (3h)

2. **Après Phase 1**:
   - Lire: Phase 2 du plan (10h)
   - Exécuter: Migrations Prisma
   - Tester: Tests unitaires

3. **Production**:
   - Valider: Data integrity
   - Merger: À main après validation

---

## 🎯 NEXT STEPS

```
1. cd server-new
2. Éditez account.js (unifier ACCOUNT_TYPES)
3. node ../scripts/fix-account-types-migration.js
4. pm2 restart ecosystem.config.cjs
5. Test dans /account/settings
6. Commit & Push
```

---

## 📞 QUESTIONS?

- **Audit complet**: Lire `AUDIT_DATABASE_COMPLET_2026-01-16.md`
- **Plan détaillé**: Lire `ACTION_PLAN_DATABASE_FIX.md`
- **Migration**: Exécuter `scripts/fix-account-types-migration.js`

---

**Créé par**: GitHub Copilot  
**Date**: 2026-01-16  
**Statut**: 🔴 EN ATTENTE D'ACTION
