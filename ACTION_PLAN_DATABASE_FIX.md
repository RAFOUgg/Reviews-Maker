# PLAN D'ACTION - Correction Database & Gestion des Données V1 MVP

**Date**: 2026-01-16  
**Priority**: 🔴 CRITIQUE  
**Estimated Effort**: ~35 heures (Phase 1 immédiate: 3h)  

---

## 🚨 SITUATION ACTUELLE

**Problème Principal**: Incohérence majeure des énumérations ACCOUNT_TYPES
- Backend utilise FRANÇAIS: `'amateur'`, `'producteur'`, `'influenceur'`
- Frontend attend ANGLAIS: `'consumer'`, `'producer'`, `'influencer'`
- Permissions.js utilise ANGLAIS avec constantes différentes
- Résultat: Aucun compte n'est typé correctement

**Votre Compte**: Marqué "Standard" (qui n'existe pas)
- Devrait être: `'producer'` + `'admin'`
- Actuellement: `'consumer'` (défaut) ou corrompu

---

## ⏱️ PHASE 1: FIX IMMÉDIAT (3 heures)

### 1.1 - Unifier ACCOUNT_TYPES à ANGLAIS (1h)

**Fichier à modifier**: `server-new/services/account.js`

#### Changement 1: Redéfinir ACCOUNT_TYPES
```javascript
// BEFORE
export const ACCOUNT_TYPES = {
    AMATEUR: 'amateur',
    PRODUCTEUR: 'producteur',
    INFLUENCEUR: 'influenceur',
    ADMIN: 'admin',
};

// AFTER
export const ACCOUNT_TYPES = {
    CONSUMER: 'consumer',      // Gratuit
    PRODUCER: 'producer',       // 29.99€
    INFLUENCER: 'influencer',   // 15.99€
    ADMIN: 'admin',
};
```

#### Changement 2: Mettre à jour getUserAccountType()
```javascript
// BEFORE
if (roles.includes('admin')) return ACCOUNT_TYPES.ADMIN;
if (roles.includes('producteur')) return ACCOUNT_TYPES.PRODUCTEUR;
if (roles.includes('influenceur')) return ACCOUNT_TYPES.INFLUENCEUR;
if (roles.includes('producer')) return ACCOUNT_TYPES.PRODUCTEUR;  // Rétrocompat
if (roles.includes('consumer')) return ACCOUNT_TYPES.AMATEUR;

// AFTER
if (roles.includes('admin')) return ACCOUNT_TYPES.ADMIN;
if (roles.includes('producer')) return ACCOUNT_TYPES.PRODUCER;
if (roles.includes('influencer')) return ACCOUNT_TYPES.INFLUENCER;
if (roles.includes('consumer')) return ACCOUNT_TYPES.CONSUMER;
// Rétrocompat avec anciennes valeurs françaises:
if (roles.includes('producteur')) return ACCOUNT_TYPES.PRODUCER;
if (roles.includes('influenceur')) return ACCOUNT_TYPES.INFLUENCER;
if (roles.includes('amateur')) return ACCOUNT_TYPES.CONSUMER;
```

#### Changement 3: Mettre à jour canUpgradeAccountType()
```javascript
// Remplacer tous les ACCOUNT_TYPES.PRODUCTEUR par ACCOUNT_TYPES.PRODUCER
// Remplacer tous les ACCOUNT_TYPES.INFLUENCEUR par ACCOUNT_TYPES.INFLUENCER
// Remplacer tous les ACCOUNT_TYPES.AMATEUR par ACCOUNT_TYPES.CONSUMER
```

#### Changement 4: Mettre à jour changeAccountType()
```javascript
// Line 209: Changer 'producer' en 'producer'
if (newType === ACCOUNT_TYPES.PRODUCER && !user.producerProfile) {
    // ← Garder pareil mais utiliser la constante

// Line 215: Changer 'influenceur' en 'influencer'
if (ACCOUNT_TYPES.INFLUENCER === newType && !user.influencerProfile) {
    // ← Pareil, constante
```

#### Changement 5: Mettre à jour SUBSCRIPTION_PRICES
```javascript
// BEFORE
export const SUBSCRIPTION_PRICES = {
    amateur: 0,
    producteur: 29.99,
    influenceur: 15.99
};

// AFTER
export const SUBSCRIPTION_PRICES = {
    consumer: 0,
    producer: 29.99,
    influencer: 15.99
};
```

**Fichier à modifier**: `server-new/middleware/permissions.js`

**Action**: Supprimer la définition locale de ACCOUNT_TYPES (lignes 17-24)
- ✅ Déjà importé depuis services/account.js (ligne 11)
- ✅ Re-exported pour les routes (ligne 14)
- ✅ Ne pas redéfinir localement

### 1.2 - Créer une Migration Script (1h)

**Fichier**: `scripts/fix-account-types-migration.js` (DÉJÀ CRÉÉ)

**Action**: Exécuter le script
```bash
cd server-new
node ../scripts/fix-account-types-migration.js
```

**Cela fait**:
- ✅ Convertit `'amateur'` → `'consumer'`
- ✅ Convertit `'producteur'` → `'producer'`
- ✅ Convertit `'influenceur'` → `'influencer'`
- ✅ Synchronise les rôles avec accountType
- ✅ Crée les ProducerProfile/InfluencerProfile manquants
- ✅ Valide la cohérence

### 1.3 - Fixer votre compte DEV (1h)

**Action Immédiate**: Vous rendre 'producer' + 'admin'

**Option A**: Manuellement via Prisma Studio
```bash
cd server-new
npx prisma studio
```
- Aller dans User table
- Trouver votre utilisateur (RAFOU)
- Changer `accountType` = `"producer"`
- Changer `roles` = `{"roles":["producer","admin"]}`
- Créer ProducerProfile avec:
  - userId: your_id
  - companyName: "RAFOU Dev"
  - country: "FR"
  - isVerified: true

**Option B**: Via script custom
```javascript
// add-dev-producer.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const user = await prisma.user.update({
    where: { email: 'bgmgaming09@gmail.com' },  // Votre email
    data: {
        accountType: 'producer',
        roles: JSON.stringify({ roles: ['producer', 'admin'] })
    }
});

const profile = await prisma.producerProfile.create({
    data: {
        userId: user.id,
        companyName: 'RAFOU Development',
        country: 'FR',
        isVerified: true
    }
});

console.log('✅ Compte DEV créé:', user.username, user.accountType);
```

---

## ⏱️ PHASE 2: VALIDATION & TESTS (2 heures)

### 2.1 - Tests Manuels (1h)

**Action 1**: Vérifier dans le navigateur
```
1. Go to /account/settings
2. Vérifier: "Type de compte : Producteur" (pas "Standard"!)
3. Go to /account/profile
4. Vérifier: Badge 🌱 "Producteur Certifié" est visible
5. F12 → Console → Pas d'erreurs
```

**Action 2**: Vérifier l'API
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```
Vérifier:
- `accountType: "producer"` ✅
- `roles: ["producer", "admin"]` ✅

### 2.2 - Tests Automatisés (1h)

**Créer test file**: `server-new/__tests__/account-types.test.js`

```javascript
import { test, describe, expect } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { getUserAccountType, ACCOUNT_TYPES } from '../services/account.js';

const prisma = new PrismaClient();

describe('Account Types Consistency', () => {
    test('ACCOUNT_TYPES should use English values only', () => {
        expect(Object.values(ACCOUNT_TYPES)).toEqual(
            expect.not.arrayContaining(['amateur', 'producteur', 'influenceur'])
        );
    });

    test('All users should have valid account types', async () => {
        const users = await prisma.user.findMany();
        
        for (const user of users) {
            const type = user.accountType;
            expect(['consumer', 'producer', 'influencer', 'admin']).toContain(type);
        }
    });

    test('Roles should match accountType', async () => {
        const users = await prisma.user.findMany();
        
        for (const user of users) {
            const type = getUserAccountType(user);
            expect(type).not.toContain('producteur');
            expect(type).not.toContain('influenceur');
            expect(type).not.toContain('amateur');
        }
    });

    test('Producer accounts should have ProducerProfile', async () => {
        const producers = await prisma.user.findMany({
            where: { accountType: 'producer' },
            include: { producerProfile: true }
        });

        for (const producer of producers) {
            expect(producer.producerProfile).toBeDefined();
        }
    });
});
```

---

## ⏱️ PHASE 2B: STRUCTURE DE DONNÉES (10 heures)

### 2B.1 - Compléter ProducerProfile (3h)

**Fichier**: `server-new/prisma/schema.prisma`

```prisma
model ProducerProfile {
    id                String   @id @default(uuid())
    userId            String   @unique
    user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    
    // Infos légales
    companyName       String
    siret             String?  @unique  // France
    ein               String?  @unique  // USA
    vatNumber         String?           // Europe
    country           String   @default("FR")
    
    // Certifications & Vérification
    isVerified        Boolean  @default(false)
    verifiedAt        DateTime?
    verificationNotes String?
    
    // Infos publiques
    publicBio         String?           // Bio affichée publiquement
    website           String?
    socialLinks       String?           // JSON: {instagram, twitter, facebook}
    profileImage      String?           // Avatar professionnel
    
    // Statistiques
    totalReviewsPublished  Int  @default(0)
    totalFollowers         Int  @default(0)
    engagementRate         Float?
    averageRating          Float?
    
    // Relations
    cultivarLibrary   Cultivar[] @relation("ProducerCultivars")
    phenoProjects     GeneticTree[]
    certifications    String?           // JSON: [{name, date, issuer}]
    
    // Timestamps
    createdAt         DateTime @default(now())
    updatedAt         DateTime @updatedAt
    
    @@map("producer_profiles")
}
```

**Migration**:
```bash
npx prisma migrate dev --name add_producer_profile_fields
```

### 2B.2 - Compléter InfluencerProfile (3h)

```prisma
model InfluencerProfile {
    id                String   @id @default(uuid())
    userId            String   @unique
    user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    
    // Branding
    brandName         String   @default("") // Brand name (peut être différent de username)
    brandLogo         String?
    brandColors       String?             // JSON: {primary, secondary, accent}
    brandDescription  String?
    
    // Vérification
    isVerified        Boolean  @default(false)
    verifiedAt        DateTime?
    verificationNotes String?
    
    // Stats Publiques
    followerCount     Int      @default(0)
    engagementRate    Float?
    monthlyEngagement Int?
    totalReachMonthly Int?
    
    // Audience & Statistiques
    audienceAge       String?             // JSON: {18-25: 30%, 26-35: 40%, ...}
    audienceLocation  String?             // JSON: {FR: 50%, BE: 20%, ...}
    topCategories     String?             // JSON: ["cannabis", "recipes", ...]
    collaborationRate Int?                // % de collabs vs reviews solo
    
    // Infos publiques
    publicBio         String?
    website           String?
    socialLinks       String?             // JSON: {instagram, tiktok, youtube, twitter}
    
    // Contenu Populaire
    topReviews        String?             // JSON: [review_ids]
    recentPosts       String?             // JSON: [review_ids]
    
    // Timestamps
    createdAt         DateTime @default(now())
    updatedAt         DateTime @updatedAt
    
    @@map("influencer_profiles")
}
```

### 2B.3 - Ajouter KYCDocument Model (2h)

```prisma
model KYCDocument {
    id              String   @id @default(uuid())
    userId          String
    user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    
    // Document Info
    documentType    String   // "id_card", "passport", "siret", "ein", "vat", "article_asso"
    documentUrl     String   // URL du fichier uploadé
    documentName    String?  // Nom du fichier
    
    // Statut Review
    status          String   @default("pending")  // pending, approved, rejected
    submittedAt     DateTime @default(now())
    reviewedAt      DateTime?
    reviewedBy      String?  // Admin ID
    rejectionReason String?
    
    // Metadata
    metadata        String?  // JSON: {fileSize, uploadDate, expiryDate, etc}
    
    // Timestamps
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    
    @@index([userId])
    @@index([status])
    @@map("kyc_documents")
}
```

---

## ⏱️ PHASE 3: SYSTÈME DE SUBSCRIPTION (8 heures)

### 3.1 - Nettoyer User Model (2h)

**Problème**: Champ `subscriptionType` dans User est redondant

**Solution**: Utiliser uniquement la table `Subscription`

```prisma
// BEFORE
model User {
    subscriptionType    String?  // ❌ REDONDANT
    subscriptionStart   DateTime?
    subscriptionEnd     DateTime?
    subscriptionStatus  String   // ❌ REDONDANT
    ...
}

// AFTER
model User {
    // Subscriptions gérées via relation à Subscription table
    subscription        Subscription?
    ...
}
```

### 3.2 - Améliorer Subscription Model (3h)

```prisma
model Subscription {
    id                      String   @id @default(uuid())
    userId                  String   @unique
    user                    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    
    // Subscription Info
    type                    String   // "producer", "influencer"
    plan                    String   // "monthly", "yearly"
    status                  String   @default("active")  // active, cancelled, expired, suspended
    
    // Stripe Integration
    stripeCustomerId        String?  @unique
    stripeSubscriptionId    String?  @unique
    stripeCurrentPeriodEnd  DateTime?
    
    // Billing
    amount                  Float   // Montant en euros
    currency                String  @default("EUR")
    billingEmail            String?
    
    // Period
    currentPeriodStart      DateTime
    currentPeriodEnd        DateTime
    
    // Cancellation
    cancelledAt             DateTime?
    cancelReason            String?
    feedbackOnCancellation  String?
    
    // Trial (si applicable)
    trialEnd                DateTime?
    trialStartedAt          DateTime?
    
    // Logs
    nextBillingDate         DateTime?
    
    createdAt               DateTime @default(now())
    updatedAt               DateTime @updatedAt
    
    @@map("subscriptions")
}
```

### 3.3 - Ajouter Webhook Handler (3h)

**Fichier**: `server-new/routes/webhooks.js`

```javascript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();
const router = express.Router();

router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different events
    switch (event.type) {
        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionCancelled(event.data.object);
            break;
        case 'invoice.payment_succeeded':
            await handlePaymentSucceeded(event.data.object);
            break;
        case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
    }

    res.json({received: true});
});

async function handleSubscriptionUpdated(subscription) {
    const user = await prisma.user.findUnique({
        where: { stripeCustomerId: subscription.customer }
    });

    if (!user) return;

    await prisma.subscription.update({
        where: { userId: user.id },
        data: {
            status: subscription.status,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
    });
}

export default router;
```

---

## ⏱️ PHASE 4: VALIDATION COMPLÈTE (5 heures)

### 4.1 - Data Integrity Tests (3h)

```javascript
// server-new/__tests__/data-integrity.test.js
import { describe, test, expect } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Data Integrity Checks', () => {
    test('No user has old enum values', async () => {
        const badUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { accountType: { in: ['amateur', 'producteur', 'influenceur'] } },
                    { roles: { contains: 'amateur' } },
                    { roles: { contains: 'producteur' } }
                ]
            }
        });
        expect(badUsers).toHaveLength(0);
    });

    test('All producers have ProducerProfile', async () => {
        const orphans = await prisma.user.findMany({
            where: {
                accountType: 'producer',
                producerProfile: null
            }
        });
        expect(orphans).toHaveLength(0);
    });

    test('All influencers have InfluencerProfile', async () => {
        const orphans = await prisma.user.findMany({
            where: {
                accountType: 'influencer',
                influencerProfile: null
            }
        });
        expect(orphans).toHaveLength(0);
    });

    test('Roles match accountType', async () => {
        const users = await prisma.user.findMany();
        
        for (const user of users) {
            const roles = JSON.parse(user.roles).roles;
            // If user is producer, roles should include 'producer'
            if (user.accountType === 'producer') {
                expect(roles).toContain('producer');
            }
        }
    });
});
```

### 4.2 - Performance Tests (1h)

Vérifier que les migrations n'ont pas ralenti les queries

### 4.3 - End-to-End Tests (1h)

- ✅ Login → Verify account type
- ✅ Settings page → Display correct type
- ✅ Profile page → Show correct badges
- ✅ Export limits → Enforced per type

---

## 📊 RÉSUMÉ PHASE 1

| Tâche | Durée | Priorité | Status |
|-------|-------|----------|--------|
| Unifier ACCOUNT_TYPES | 1h | 🔴 CRITIQUE | ⏳ Ready |
| Migration Script | 1h | 🔴 CRITIQUE | ⏳ Ready |
| Fixer compte DEV | 1h | 🔴 CRITIQUE | ⏳ Ready |
| **TOTAL PHASE 1** | **3h** | | |

---

## 🎯 CHECKLIST FINAL

### PHASE 1 (AUJOURD'HUI)
- [ ] Unifier ACCOUNT_TYPES dans account.js
- [ ] Exécuter migration script
- [ ] Votre compte = 'producer' + 'admin'
- [ ] Tests manuels OK
- [ ] ✅ GitHub commit

### PHASE 2 (DEMAIN)
- [ ] Compléter ProducerProfile schema
- [ ] Compléter InfluencerProfile schema
- [ ] Ajouter KYCDocument model
- [ ] Migration Prisma
- [ ] Tests unitaires

### PHASE 3 (CETTE SEMAINE)
- [ ] Nettoyer User model (subscriptionType)
- [ ] Améliorer Subscription model
- [ ] Ajouter Stripe webhook handler
- [ ] Tester checkout flow

### PHASE 4 (LA SEMAINE SUIVANTE)
- [ ] Data integrity tests
- [ ] Performance tests
- [ ] E2E tests
- [ ] ✅ Merge to main

---

**Prochaine étape**: Commencer par la Phase 1 immédiate! 🚀
