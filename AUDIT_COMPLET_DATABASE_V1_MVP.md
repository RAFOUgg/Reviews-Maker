# 🔍 AUDIT COMPLET - Base de Données & Gestion des Données

## CONTEXTE
- **Logiciel**: Français FIRST, traduction EN/DE/ES APRÈS
- **Problème rapporté**: Vous voyez "Standard" alors que vous devriez voir "Producteur"
- **Issue réelle identifiée**: Incohérence entre enums français et anglais + rôles non assignés

---

## 1️⃣ DIAGNOSTIC - LE VRAI PROBLÈME

### 1.1 Incohérence des Enums

**Le code Python est FRANÇAIS**, mais les enums sont en ANGLAIS. C'est confus!

#### Actuellement dans `server-new/middleware/permissions.js`:
```javascript
const ACCOUNT_TYPES = {
    CONSUMER: 'consumer',      // ❌ Clé anglaise
    INFLUENCER: 'influencer',  // ❌ Clé anglaise
    PRODUCER: 'producer'       // ❌ Clé anglaise
}
```

#### Mais le schéma Prisma dit:
```prisma
// Type de compte (Amateur, Influenceur, Producteur)
accountType   String   @default("consumer")
```

### 1.2 Problème avec vos Rôles

**Situation réelle**:
- ✅ Vous êtes connecté (Discord OK)
- ✅ Vous êtes dans la DB
- ❌ Vos **rôles ne sont probablement PAS définis** en DB
- ❌ Donc le système retourne le rôle par défaut: "consumer" (amateur)

### 1.3 Pourquoi "Standard"?

La valeur "Standard" vient de **la page SettingsPage** qui affiche `'Standard'` en fallback:

```jsx
// Ligne 122 de SettingsPage.jsx (AVANT la correction)
{user.subscriptionType || 'Standard'}  // ← Le fallback 'Standard'
```

Même après notre fix en 'Amateur', si le `accountType` n'existe pas en DB, ça affiche le fallback.

---

## 2️⃣ ÉTAT ACTUEL DE LA DATABASE

### 2.1 Schéma User (Structure)

```
User {
  id                    String @id
  
  // OAuth
  discordId            String? @unique
  // ... autres OAuth
  
  // Infos de base
  username              String
  email                 String?
  avatar                String?
  
  // CRITIQUE: Les rôles
  roles                 String  @default("{\"roles\":[\"consumer\"]}")  ← JSON ARRAY
  
  // CRITIQUE: Le type
  accountType           String  @default("consumer")  ← Simple String
  
  // Abonnement
  subscriptionType      String?  ← "influencer" | "producer" | null
  subscriptionStatus    String   @default("inactive")
  
  // KYC (pour vérification Producer)
  kycStatus             String?  ← "none" | "pending" | "verified" | "rejected"
  kycVerifiedAt         DateTime?
  
  // Préférences
  locale                String   @default("fr")
  theme                 String   @default("violet-lean")
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### 2.2 Problèmes Identifiés

| Champ | Problème | Impact | Priorité |
|-------|---------|--------|----------|
| `roles` (JSON) | Peut être NULL ou vide | Défaut toujours "consumer" | 🔴 CRITIQUE |
| `accountType` | Enum mismatch français/anglais | Confusion dans le code | 🟠 MAJEUR |
| `subscriptionType` | Peut être NULL | Impossible de vérifier l'abonnement | 🟠 MAJEUR |
| `kycStatus` | Pas utilisé correctement | Producer ne peut pas accéder à ses fonctionnalités | 🔴 CRITIQUE |
| Données de profil | Trop peu de champs | Pas assez pour profil complet | 🟡 MINEUR |

---

## 3️⃣ VÉRIFICATION DANS LE CODE

### 3.1 Comment le Type de Compte est Déterminé

**Fichier**: `server-new/services/account.js`

```javascript
// Actuellement (français mélangé):
export function getUserAccountType(user) {
    const roles = getRoles(user)
    
    if (roles.includes('producer') || user.isProducer) {
        return ACCOUNT_TYPES.PRODUCTEUR  // ← Retourne "producteur"
    }
    if (roles.includes('influencer') || user.isInfluencer) {
        return ACCOUNT_TYPES.INFLUENCEUR  // ← Retourne "influenceur"
    }
    
    return ACCOUNT_TYPES.CONSOMMATEUR  // ← Retourne "consommateur"
}
```

**Problème**: Le code est **mélangé français/anglais**:
- Les conditions vérifient `'producer'` (anglais)
- Mais retournent `ACCOUNT_TYPES.PRODUCTEUR` (français)

### 3.2 Comment les Rôles sont Stockés

**En DB**, les rôles sont stockés comme JSON:

```json
{
  "roles": ["consumer"]
}
```

Ou peut-être `null`, ce qui cause un fallback à `["consumer"]`.

### 3.3 Le Problème du Frontend

**Dans le frontend**, on compare avec les **valeurs retournées**:

```javascript
// ProfilePage.jsx ligne 95
if (profile.accountType === 'producer') {  // ← Attend l'anglais!
    badges.push({ icon: '🌱', label: 'Producteur Certifié' })
}
```

**Mais le backend retourne**:
```
'producteur'  // ← Français!
```

Donc la condition ÉCHOUE silencieusement.

---

## 4️⃣ FLUX ACTUEL VS SOUHAITÉ

### Flux Actuel (Cassé)

```
Utilisateur se connecte via Discord
          ↓
Créer User en DB avec:
  - roles: "{\"roles\":[\"consumer\"]}"  ← Hardcodé
  - accountType: "consumer"                ← Hardcodé
          ↓
Frontend demande /api/auth/me
          ↓
Backend retourne:
  - accountType: "consumer"  OU  "producteur"  OU  "influenceur"
  - roles: ["consumer"]
          ↓
Frontend affiche:
  - SettingsPage: "Standard" OU "Amateur" (confus)
  - ProfilePage: Pas de badge (condition échoue)
```

### Flux Souhaité (Correct)

```
Utilisateur se connecte via Discord
          ↓
Créer User en DB avec:
  - roles: "{\"roles\":[\"consumer\"]}"
  - accountType: "consommateur"  ← EN FRANÇAIS
  - subscriptionType: null
  - kycStatus: "none"
          ↓
ADMIN crée PRODUCER pour cet utilisateur:
  - roles: "{\"roles\":[\"producer\"]}"
  - accountType: "producteur"  ← EN FRANÇAIS
  - subscriptionType: "producer"
  - kycStatus: "verified"  ← Si KYC passée
          ↓
Frontend demande /api/auth/me
          ↓
Backend retourne (cohérent):
  - accountType: "producteur"
  - roles: ["producer"]
  - subscriptionType: "producer"
          ↓
Frontend affiche (correct):
  - SettingsPage: "Producteur" ✅
  - ProfilePage: Badge 🌱 ✅
  - AccèsPages: Producer features ✅
```

---

## 5️⃣ SOLUTION - PLAN DE CORRECTION

### Phase 1: Unifier les Enums en FRANÇAIS ✅ [À faire]

#### Avant (Mélangé):
```javascript
// permissions.js
const ACCOUNT_TYPES = {
    CONSUMER: 'consumer',
    INFLUENCER: 'influencer',
    PRODUCER: 'producer'
}
```

#### Après (Français):
```javascript
// permissions.js
const ACCOUNT_TYPES = {
    CONSOMMATEUR: 'consommateur',      // ← Amateur
    INFLUENCEUR: 'influenceur',        // ← Influenceur
    PRODUCTEUR: 'producteur'           // ← Producteur
}
```

#### Aussi en account.js:
```javascript
export const ACCOUNT_TYPES = {
    CONSOMMATEUR: 'consommateur',
    INFLUENCEUR: 'influenceur',
    PRODUCTEUR: 'producteur'
}
```

### Phase 2: Corriger le Frontend ✅ [À faire]

**ProfilePage.jsx**:
```javascript
// Avant (attend anglais):
if (profile.accountType === 'producer') {

// Après (reçoit français):
if (profile.accountType === 'producteur') {
    badges.push({ icon: '🌱', label: 'Producteur Certifié' })
} else if (profile.accountType === 'influenceur') {
    badges.push({ icon: '⭐', label: 'Influenceur' })
}
```

### Phase 3: Créer un Script de Migration ✅ [À faire]

Mettre à jour tous les comptes existants:

```javascript
// Script: server-new/scripts/migrate-account-types-to-french.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateAccountTypes() {
    console.log('🔄 Migration: Account types to French...');
    
    // Mettre à jour consumer → consommateur
    await prisma.user.updateMany({
        where: { accountType: 'consumer' },
        data: { accountType: 'consommateur' }
    });
    
    // Mettre à jour influencer → influenceur
    await prisma.user.updateMany({
        where: { accountType: 'influencer' },
        data: { accountType: 'influenceur' }
    });
    
    // Mettre à jour producer → producteur
    await prisma.user.updateMany({
        where: { accountType: 'producer' },
        data: { accountType: 'producteur' }
    });
    
    console.log('✅ Migration completed!');
}

migrateAccountTypes()
    .catch(e => console.error('❌ Error:', e))
    .finally(() => process.exit(0));
```

### Phase 4: Assigner votre Compte comme Producteur ✅ [À faire]

```sql
-- UPDATE votre compte pour qu'il soit producteur:
UPDATE User 
SET 
  roles = '{"roles":["producer"]}',
  accountType = 'producteur',
  subscriptionType = 'producer',
  subscriptionStatus = 'active',
  kycStatus = 'verified'
WHERE email = 'bgmgaming00@gmail.com';
```

Ou via script Node.js:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeUserProducer(email) {
    const user = await prisma.user.update({
        where: { email },
        data: {
            roles: JSON.stringify({ roles: ['producer'] }),
            accountType: 'producteur',
            subscriptionType: 'producer',
            subscriptionStatus: 'active',
            kycStatus: 'verified'
        }
    });
    
    console.log('✅ User updated:', user.username);
}

makeUserProducer('bgmgaming00@gmail.com')
    .catch(e => console.error('❌ Error:', e))
    .finally(() => process.exit(0));
```

---

## 6️⃣ ÉTAT DE LA BASE DE DONNÉES - CE QUI MANQUE

### Pour un Profil Producteur COMPLET

| Champ | Actuellement | Devrait Être | Priorité |
|-------|-------------|-------------|----------|
| `accountType` | "consumer" | "producteur" | 🔴 CRITIQUE |
| `roles` | '{"roles":["consumer"]}' | '{"roles":["producer"]}' | 🔴 CRITIQUE |
| `subscriptionType` | null | "producer" | 🟠 MAJEUR |
| `subscriptionStatus` | "inactive" | "active" | 🟠 MAJEUR |
| `kycStatus` | null | "verified" | 🟡 MINEUR |
| Profil personnalisé | ❌ N'existe pas | Devrait avoir tabla | 🟡 MINEUR |

### Données Supplémentaires Manquantes

Le schéma Prisma ne contient PAS les infos pour un **profil complet**:

❌ **Bio/Description personnelle**  
❌ **Photo de profil secondaire**  
❌ **Localisation (ville, région)**  
❌ **Spécialités/Types de produits**  
❌ **Réseaux sociaux**  
❌ **Portfolio/Galerie publique**  
❌ **Statistiques d'export/reviews**  
❌ **Préférences de notification**  

---

## 7️⃣ RECOMMANDATIONS - ACTIONS IMMÉDIATES

### 🔴 CRITIQUE (À faire MAINTENANT)

1. **Unifier les enums en FRANÇAIS**
   - Mettre à jour `permissions.js`
   - Mettre à jour `account.js`
   - Mettre à jour `frontend` (ProfilePage, SettingsPage)

2. **Migrer les comptes existants**
   - Exécuter le script de migration vers français
   - Vérifier que vous passez à "producteur"

3. **Vous assigner comme Producteur**
   - UPDATE votre compte via script
   - Vérifier que vous voyez "Producteur" au lieu de "Standard"

### 🟠 MAJEUR (À faire APRÈS)

1. **Améliorer le modèle User**
   - Ajouter `ProducerProfile` pour les données producteur
   - Ajouter `InfluencerProfile` pour les données influenceur
   - Ajouter système de notifications/préférences

2. **Implémenter l'assignation de rôles**
   - Créer endpoint admin pour assigner producteur/influenceur
   - Créer interface pour les demandes d'accès producteur

3. **Système de KYC complet**
   - Vérification d'identité pour producteurs
   - Stockage sécurisé des documents
   - Workflow d'approbation

### 🟡 MINEUR (À faire PLUS TARD)

1. **Enrichir les profils**
   - Ajouter bio, spécialités, réseaux
   - Ajouter portfolio/galerie

2. **Statistiques utilisateur**
   - Tracking des exports
   - Analytics des reviews publiques

---

## 8️⃣ CHECKLIST DE VÉRIFICATION AVANT MERGE

- [ ] Tous les enums sont en FRANÇAIS (consommateur/influenceur/producteur)
- [ ] Frontend utilise les valeurs FRANÇAISES
- [ ] Backend retourne les valeurs FRANÇAISES
- [ ] Script de migration prêt
- [ ] Votre compte est PRODUCTEUR en DB
- [ ] SettingsPage affiche "Producteur" (pas "Standard")
- [ ] ProfilePage affiche le badge 🌱
- [ ] Pas d'erreurs console
- [ ] Tests en production (terpologie.eu)

---

## 9️⃣ FICHIERS À MODIFIER

```
server-new/
  ├─ middleware/permissions.js          ← Enums français
  ├─ services/account.js                ← Enums français
  ├─ routes/auth.js                     ← Dev mock data français
  ├─ scripts/
  │  └─ migrate-account-types.js        ← Nouveau: Migration
  │  └─ set-user-as-producer.js         ← Nouveau: Vous assigner
  └─ prisma/
     └─ schema.prisma                   ← Enums français en commentaires

client/
  ├─ src/pages/account/ProfilePage.jsx  ← Valeurs françaises
  ├─ src/pages/account/SettingsPage.jsx ← Valeurs françaises
  ├─ src/utils/permissionSync.js        ← Valeurs françaises
  └─ src/components/legal/...           ← Vérifier cohérence
```

---

## 🔟 IMPACT DE LA CORRECTION

### Avant
```
Vous voyez:        "Standard"  ❌
Vous pouvez faire: Rien (bloqué à consumer)  ❌
Badge affiché:     Aucun  ❌
```

### Après
```
Vous voyez:        "Producteur"  ✅
Vous pouvez faire: Tout (accès complet)  ✅
Badge affiché:     🌱 "Producteur Certifié"  ✅
```

---

## 🎯 RÉSUMÉ EXÉCUTIF

**Le problème**: Incohérence enums français/anglais + rôles non assignés

**La solution**: 
1. Unifier en FRANÇAIS
2. Migrer les comptes
3. Vous assigner comme producteur

**Temps estimé**: 30 minutes

**Risque**: Très bas (changements simples et localisés)

**Bénéfice**: Vous pouvez accéder à 100% des fonctionnalités producteur

---

**Document créé**: 2026-01-16  
**Status**: 🟢 Prêt à implémenter
