# AUDIT COMPLET - Base de Données et Gestion des Données V1 MVP
**Date**: 2026-01-16  
**Status**: 🔴 **CRITIQUE** - Incohérences majeures détectées  

---

## 🚨 PROBLÈMES CRITIQUES DÉTECTÉS

### 1. INCOHÉRENCE MAJEURE DES ÉNUMÉRATIONS DE COMPTES

**Problème**:
Il existe **2 définitions différentes** de `ACCOUNT_TYPES` dans le codebase:

#### Définition A: `server-new/services/account.js` (FRANÇAISE)
```javascript
export const ACCOUNT_TYPES = {
    AMATEUR: 'amateur',           // Gratuit
    PRODUCTEUR: 'producteur',     // 29.99€/mois
    INFLUENCEUR: 'influenceur',   // 15.99€/mois
    ADMIN: 'admin',
};
```

#### Définition B: `server-new/middleware/permissions.js` (ANGLAIS)
```javascript
export const ACCOUNT_TYPES = {
    BETA_TESTER: 'beta_tester',
    CONSUMER: 'consumer',          // Amateur
    INFLUENCER: 'influencer',      // Influenceur
    PRODUCER: 'producer',          // Producteur
    MERCHANT: 'merchant',
};
```

**Impact**:
- ❌ Frontend attend: `'consumer'`, `'influencer'`, `'producer'` (ANGLAIS)
- ❌ Backend envoie: `'amateur'`, `'influenceur'`, `'producteur'` (FRANÇAIS)
- ❌ Ou ne sait pas ce qu'il envoie (mélange)
- ❌ Les vérifications de rôles dans `services/account.js` recherchent les valeurs FRANÇAISES
- ❌ Résultat: Les comparaisons échouent, aucun compte n'est reconnu correctement

**Exemple du Problème**:
```
Utilisateur en DB avec roles: ["producteur"]
    ↓
services/account.js recherche: roles.includes('producteur') ✅ Trouvé
    ↓
Retourne: ACCOUNT_TYPES.PRODUCTEUR = 'producteur'
    ↓
Frontend reçoit: 'producteur'
Frontend compare: profile.accountType === 'producer' ❌ FAUX!
    ↓
Badges n'apparaissent pas, compte invalide
```

---

### 2. PROFIL UTILISATEUR INCOMPLET

**Votre profil actuellement**:
- ❌ `accountType`: "standard" (N'EXISTE PAS!)
- ❌ `roles`: Probablement vide ou `["consumer"]`
- ❌ Pas de `producerProfile` créé
- ❌ Pas de `influencerProfile` créé

**Attendu pour un DEV (type Producteur)**:
```json
{
  "accountType": "producteur",  // ou "producer" (inconsistent!)
  "roles": ["producteur", "admin"],
  "producerProfile": {
    "companyName": "DEV Company",
    "isVerified": true,
    "verifiedAt": "2026-01-16T...",
    "siret": "...",
    "country": "FR"
  },
  "subscriptionStatus": "active",
  "subscriptionType": "producteur"
}
```

---

### 3. SCHÉMA PRISMA vs RÉALITÉ

**Problème dans `schema.prisma`**:

```prisma
// Line 47-49
accountType   String   @default("consumer")  // ❌ Utilise "consumer" (ANGLAIS)
subscriptionType String?                      // ❌ Double du accountType?
roles         String   @default("{\"roles\":[\"consumer\"]}")  // ❌ Champ JSON mal documenté
```

**Incohérences**:
- ✅ `accountType` défaut: `"consumer"` (ANGLAIS)
- ❌ `roles` défaut: `'["consumer"]'` (ANGLAIS, mais en JSON string)
- ❌ `subscriptionType` existe aussi? (Redondance)
- ❌ Pas de clarté sur qui utilise quoi

---

### 4. AUTH.JS RETOURNE LES MAUVAISES VALEURS

**Fichier**: `server-new/routes/auth.js` (dev mode - ligne 273-276)

```javascript
const mockUser = {
    roles: JSON.stringify({ roles: ['producer'] }),  // ← ANGLAIS 'producer'
    accountType: 'producer',                           // ← ANGLAIS 'producer'
};
```

**Mais** `sanitizeUser()` appelle:
```javascript
const accountType = getUserAccountType(user)  // ← Retourne 'producteur' (FRANÇAIS!)
```

**Résultat**: Retourne `'producteur'` au lieu de `'producer'`

---

### 5. PERMISSIONSYNC FRONTEND EST CORRECT

**Fichier**: `client/src/utils/permissionSync.js`

```javascript
export const DEFAULT_ACCOUNT_TYPES = {
    consumer: { value: 'consumer', label: 'Amateur', badge: '👤' },
    influencer: { value: 'influencer', label: 'Influenceur', badge: '⭐' },
    producer: { value: 'producer', label: 'Producteur', badge: '🌱' }
}
```

✅ **CORRECT**: Frontend attend `'consumer'`, `'influencer'`, `'producer'` (ANGLAIS)

---

## 📊 TABLEAU COMPARATIF

| Aspect | Frontend | Backend account.js | Backend permissions.js | DB (schema.prisma) | Status |
|--------|----------|-------------------|----------------------|-------------------|--------|
| **Amateur** | `'consumer'` | `'amateur'` | `CONSUMER` | `"consumer"` | 🔴 MISMATCH |
| **Influenceur** | `'influencer'` | `'influenceur'` | `INFLUENCER` | `"consumer"` | 🔴 MISMATCH |
| **Producteur** | `'producer'` | `'producteur'` | `PRODUCER` | `"consumer"` | 🔴 MISMATCH |
| **Rôles Défaut** | - | Pas utilisé | Used | `["consumer"]` | 🟡 MIXED |
| **Priorité d'enum** | N/A | Français > Anglais | Anglais | N/A | 🔴 CONFLICT |

---

## 🗄️ ÉTAT ACTUEL DE LA BASE DE DONNÉES

### Problèmes Détectés:

1. **Tous les utilisateurs existants**: `accountType = "consumer"` (défaut) ❌
2. **Rôles mal parsés**: Format JSON inconsistent
3. **Profils manquants**: Aucun Producer/Influencer profile créé
4. **Subscriptions fantasmes**: Champ `subscriptionType` jamais utilisé correctement

### Query de diagnostic:
```sql
-- Tous les utilisateurs
SELECT id, username, email, accountType, roles, subscriptionType FROM User;

-- Résultat attendu (probablement):
-- id | username | email | accountType | roles | subscriptionType
-- xxx | RAFOU | email@gmail.com | consumer | {"roles":["consumer"]} | NULL
```

---

## 🎯 OBJECTIFS V1 MVP (CDC)

### Selon le cahier des charges:

#### Amateur (Gratuit)
- ✅ 3 exports/jour max
- ✅ Templates prédéfinis seulement (Compact, Détaillé, Complète)
- ✅ Exports PNG/JPEG/PDF qualité moyenne
- ✅ 5 reviews publiques max
- ✅ Pas de génétique/phénotypage
- ❌ **Actuellement**: Tous les comptes sont "consumer/amateur"

#### Influenceur (15.99€/mois)
- ✅ 50 exports/jour
- ✅ Tous les templates
- ✅ Exports HD (PNG/JPEG/SVG/PDF 300dpi)
- ✅ Accès aperçu complet
- ✅ Drag & drop contenu
- ❌ **Actuellement**: Aucun compte influenceur créé

#### Producteur (29.99€/mois)
- ✅ Exports illimités
- ✅ Tous les formats (PNG/JPEG/SVG/PDF/CSV/JSON/HTML)
- ✅ Pipelines complets configurables
- ✅ Système génétique & phénotypage
- ✅ PhenoHunt projects
- ❌ **Actuellement**: Aucun compte producteur créé

---

## 🔧 DONNÉES MANQUANTES / INCOMPLÈTES

### 1. Profile Utilisateur (Couches manquantes)

**Manque dans USER model**:
```prisma
// Pour tous les comptes:
- profilePicture (avatar amélioré)
- bio (biographie)
- socialLinks (JSON: {twitter, instagram, discord})
- publicBadges (certifications/vérifications visibles)
- searchKeywords (pour galerie publique)

// Pour Producteur uniquement:
- cultivarLibrary (relation vers Cultivars)
- phenoProjects (relation vers PhenoProjects)
- certificationsHeld (certifications lab, diplômes)
- farmsManaged (si multi-sites)
- statsPublished (nb articles/reviews publiés)

// Pour Influenceur uniquement:
- followerCount (followers totaux)
- engagementRate (% interaction)
- topCategories (JSON: catégories principales)
- collaborationRate (nb collaborations)
- audienceDemographics (JSON: age, location distribution)
```

### 2. Système de Subscription Cassé

**Problème**:
- Table `Subscription` existe mais jamais utilisée
- Champ `subscriptionType` en User redondant
- Aucune gestion de: renouvellement, annulation, upgrade

**Manque**:
```prisma
model Subscription {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type              String   // "influencer", "producer"
  plan              String   // "monthly", "yearly"
  status            String   // "active", "cancelled", "expired"
  
  stripeSubscriptionId String?  // Pour Stripe
  
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelledAt        DateTime?
  cancelReason       String?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### 3. KYC (Know Your Customer) Incomplet

**Actuellement**:
```prisma
kycStatus           String?     // none, pending, verified, rejected
kycDocuments        String?     // JSON array (vague!)
kycVerifiedAt       DateTime?
kycRejectionReason  String?
```

**Manque**:
```prisma
model KYCDocument {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  documentType    String   // "id_card", "passport", "siret", "ein", "article_asso"
  documentUrl     String   // URL du document
  status          String   // "pending", "approved", "rejected"
  submittedAt     DateTime
  reviewedAt      DateTime?
  reviewedBy      String?  // User ID qui a reviewé
  rejectionReason String?
  
  metadata        String?  // JSON: {fileName, uploadDate, fileSize, etc}
}
```

---

## 📋 CHECKLIST: DONNÉES REQUISES V1 MVP

### ✅ Implémenté
- [x] User model de base
- [x] Review model (générique)
- [x] FlowerReview, HashReview, ConcentrateReview, EdibleReview (spécialisés)
- [x] UserStats
- [x] ReviewComment, ReviewLike
- [x] Template/SavedTemplate

### ❌ Manquant ou Incomplet
- [ ] Cohérence ACCOUNT_TYPES (FRANÇAIS vs ANGLAIS)
- [ ] ProducerProfile complétude (cultivars, projects, certifications)
- [ ] InfluencerProfile complétude (stats, audience, engagement)
- [ ] Subscription management (Stripe, renouvellement)
- [ ] KYC documents properly indexed
- [ ] Export history/logs
- [ ] Review analytics (views, likes, engagement)
- [ ] Search indexing pour galerie publique
- [ ] Rate limiting par accountType
- [ ] Audit logs (déjà commencé mais incomplet)

### 🟡 Partiellement Implémenté
- [ ] Pipeline system (structure existe, données manquent)
- [ ] Cultivar system (model existe, pas de relations complètes)
- [ ] GeneticTree (structure basique)
- [ ] PresetSaved data (existe mais peu documenté)

---

## 🔍 VOTRE CAS: POURQUOI "STANDARD"?

### Hypothèse 1: Creation via Discord OAuth
```
1. User se connecte via Discord
2. Backend crée utilisateur avec:
   - accountType: "consumer" (défaut schema.prisma) ✓
   - roles: '["consumer"]' (défaut schema.prisma) ✓
3. Frontend affiche label pour 'consumer' = "Amateur" ✓
4. MAIS sanitizeUser() appelle getUserAccountType()
5. getUserAccountType() cherche roles.includes('producteur') ❌
6. Ne trouve rien, retourne ACCOUNT_TYPES.AMATEUR = 'amateur' ✅
7. Envoie 'amateur' au frontend
8. Frontend cherche comparaison avec 'producer' ❌
9. Affiche fallback "Standard" ❌
```

### Hypothèse 2: Dev mode mock data
```
auth.js dev mode retourne: accountType: 'producer'
Frontend attend: 'producer'
Mais... frontend ne reçoit pas le type correct!
```

---

## 🛠️ SOLUTIONS REQUISES

### Phase 1: FIX IMMÉDIAT (Critique)

**1. Unifier les énumérations**
- [ ] Choisir: FRANÇAIS ou ANGLAIS (recommandation: ANGLAIS)
- [ ] Mettre à jour `services/account.js`:
  ```javascript
  export const ACCOUNT_TYPES = {
      CONSUMER: 'consumer',      // Au lieu de AMATEUR: 'amateur'
      INFLUENCER: 'influencer',  // Au lieu de INFLUENCEUR
      PRODUCER: 'producer',      // Au lieu de PRODUCTEUR
      ADMIN: 'admin'
  };
  ```

**2. Synchroniser les rôles**
- [ ] DB roles doivent utiliser: `consumer`, `influencer`, `producer`
- [ ] Tous les rôles stockés doivent être ANGLAIS

**3. Créer votre compte DEV correctement**
- [ ] UPDATE User SET accountType = 'producer', roles = '{"roles":["producer","admin"]}' WHERE id = YOUR_ID
- [ ] CREATE ProducerProfile avec companyName, country, isVerified=true

### Phase 2: Structure de Données (Important)

**4. Compléter les profiles**
- [ ] Ajouter champs manquants à ProducerProfile
- [ ] Ajouter champs manquants à InfluencerProfile
- [ ] Créer KYCDocument model

**5. Fixer le système de Subscription**
- [ ] Synchroniser Subscription table avec User.subscriptionType
- [ ] Implémenter webhook Stripe
- [ ] Ajouter gestion du renouvellement

**6. Ajouter l'audit trail**
- [ ] Implémenter AuditLog pour tous les changements critiques
- [ ] Tracker les modifications de subscription, KYC, roles

### Phase 3: Validation des Données (Important)

**7. Migration des utilisateurs existants**
- [ ] Audit: qui devrait être producer, influencer, consumer?
- [ ] Migration script pour corriger les données
- [ ] Validation post-migration

**8. Tests de cohérence**
- [ ] Test: accountType vs roles consistency
- [ ] Test: Profile exists pour son type de compte
- [ ] Test: Subscription synced avec accountType

---

## 📈 MATRICE D'IMPACT

| Problème | Utilisateurs Affectés | Sévérité | Effort Fix |
|----------|----------------------|----------|-----------|
| Énumération incohérente | TOUS | 🔴 CRITIQUE | 2h |
| Compte DEV mal typé | 1 (VOUS) | 🔴 CRITIQUE | 0.5h |
| ProducerProfile incomplet | Producteurs | 🟡 IMPORTANT | 4h |
| InfluencerProfile incomplet | Influenceurs | 🟡 IMPORTANT | 4h |
| Subscription cassée | Tous payants | 🟡 IMPORTANT | 8h |
| KYC incomplet | Producteurs | 🟡 IMPORTANT | 6h |
| Export history manquant | Tous | 🟢 MINEUR | 3h |
| Rate limiting absent | Tous | 🟢 MINEUR | 4h |
| **TOTAL IMPACT** | **TOUS** | **🔴 TRÈS CRITIQUE** | **~31h** |

---

## ✅ RECOMMANDATIONS PRIORITAIRES

### IMMÉDIAT (< 1 heure)
1. ✅ Unifier ACCOUNT_TYPES à ANGLAIS
2. ✅ Fixer votre compte: UPDATE le rendre 'producer'
3. ✅ Vérifier auth.js returne les bonnes valeurs

### AUJOURD'HUI (2-3 heures)
4. Migration script: Synchroniser tous les comptes
5. Tests: Vérifier cohérence data end-to-end

### CETTE SEMAINE (Phase 2)
6. Complèter les profiles (ProducerProfile, InfluencerProfile)
7. Implémenter le système de Subscription
8. Ajouter KYCDocument model

### CETTE SEMAINE (Phase 3)
9. Ajouter export history
10. Implémenter rate limiting
11. Ajouter analytics/stats publiques

---

## 🎯 V1 MVP CHECKLIST FINAL

- [ ] ACCOUNT_TYPES unifiés (ANGLAIS)
- [ ] Tous les comptes typés correctement
- [ ] Votre compte = 'producer' + admin
- [ ] ProducerProfile créé pour les producteurs
- [ ] InfluencerProfile créé pour les influenceurs
- [ ] Subscription table synced
- [ ] KYC système fonctionnel
- [ ] Export limits appliqués par type
- [ ] Audit logs implémentés
- [ ] Data validation tests passants

---

**Prochaine étape**: Implémenter les fixes du Phase 1 (Immédiat) 🚀
