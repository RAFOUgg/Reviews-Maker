# 🔐 Authentification et Système de Tiers - Reviews-Maker

## 🎯 Vue d'Ensemble

Le système d'authentification gère l'accès utilisateurs avec 3 niveaux de fonctionnalités (tiers) basés sur le type de compte.

---

## 👥 Les 3 Tiers d'Utilisateurs

### 1. AMATEUR (Gratuit)

**Profil:**
- Utilisateurs individuels découvrant la plateforme
- Amateurs cannabis créant des reviews
- Accès de base sans limitations dures

**Fonctionnalités:**

| Feature | Disponible | Détails |
|---------|-----------|---------|
| Créer reviews | ✅ | Toutes sections sauf génétiques avancées |
| Éditer reviews | ✅ | Illimité |
| Supprimer reviews | ✅ | Illimité |
| Exports | ✅ | Templates: Compact, Détaillé, Complète |
| Qualité export | ✅ | Standard (72 DPI, compression) |
| Formats export | ✅ | PNG, JPEG, PDF |
| Partage social | ✅ | Basique |
| Personnalisation | ⚠️ | Thème + couleurs basiques |
| Pipelines | ✅ | Lecture seule, pas d'édition |
| Génétiques | ❌ | N/A |
| KYC | ❌ | N/A |
| Accès galerie publique | ✅ | Lecture seule |

**Limites:**
- Max 100 reviews (stockage limité)
- Pas d'exports payants
- Pas de polices personnalisées
- Pas d'arbre généalogique

**Conversion upgrade:**
- Bouton "Upgrade to PRODUCTEUR" visible partout
- À 80 reviews → notification "Bientôt limite"

---

### 2. PRODUCTEUR (Payant: 29.99€/mois)

**Profil:**
- Producteurs/cultivateurs professionnels
- Hashmakers, extracteurs
- Créateurs de contenu premium

**Fonctionnalités:**

| Feature | Disponible | Détails |
|---------|-----------|---------|
| **TOUT d'AMATEUR** | ✅ | + toutes les fonctionnalités premium |
| Template Personnalisé | ✅ | Drag & drop, création libre |
| Pipelines édition | ✅ | Complètes et configurables |
| Ajouter étapes custom | ✅ | Illimité par pipeline |
| Génétiques | ✅ | Bibliothèque + arbre généalogique |
| Projets PhenoHunt | ✅ | Gestion génétiques en cours |
| Arbre généalogique | ✅ | Visualisation graphique |
| Exports haute qualité | ✅ | 300 DPI, sans compression |
| Formats export | ✅ | PNG, JPEG, PDF, SVG, CSV, JSON, HTML |
| Polices custom | ✅ | Google Fonts + upload |
| Filigrane | ✅ | Custom + positionnement |
| Statistiques avancées | ✅ | Rendements, tendances |
| Reviews illimitées | ✅ | Stockage illimité |
| Priorité support | ✅ | Email 24h |

**Avantages additionnels:**
- Badge "PRODUCTEUR" sur profil public
- Accès à des analytics détaillées
- Priorité sur nouvelles features
- Accès API (bientôt)

**Tarification:**
- 29.99€/mois ou 299€/an (10% discount)
- Annulation possible à tout moment
- Abonnement automatique

---

### 3. INFLUENCEUR (Payant: 15.99€/mois)

**Profil:**
- Testeurs/critiques de cannabis
- Créateurs de contenu social
- Influenceurs cherchant à promouvoir
- Journalistes/média

**Fonctionnalités:**

| Feature | Disponible | Détails |
|---------|-----------|---------|
| **Créer reviews** | ✅ | Sections complètes |
| **Exports** | ✅ | Formats: PNG, JPEG, SVG, PDF 300 DPI |
| **Qualité export** | ✅ | 300 DPI haute qualité |
| **Template Influenceur** | ✅ | Format 9:16 optimisé réseaux |
| **Galerie publique** | ✅ | Mise en avant, analytics |
| **Stats engagement** | ✅ | Likes, partages, comments |
| **Priorité support** | ✅ | Email 24h |
| **Édition reviews** | ✅ | Illimité |
| **Personnalisation** | ⚠️ | Thème + couleurs (pas de fonts custom) |
| **Template Personnalisé** | ❌ | Templates figés seulement |
| **Pipelines édition** | ❌ | Lecture seule |
| **Génétiques** | ❌ | N/A |
| **API Access** | ❌ | N/A |

**Avantages focus social:**
- Badge "INFLUENCEUR" sur profil
- Format 9:16 natif réseaux sociaux
- Prévisualisation avant partage
- Intégrations réseaux natives

**Tarification:**
- 15.99€/mois ou 159€/an (10% discount)
- Annulation possible à tout moment

---

## 🔑 Système d'Authentification

### Architecture Globale

```
┌────────────────────────────────────────────────────────┐
│              USER LOGIN/REGISTER                        │
└────────────────┬─────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ↓            ↓            ↓
  EMAIL        OAUTH2       DISCORD
  /Pass        (Google)      OAuth
    │            │            │
    └────────────┼────────────┘
                 │
    ┌────────────↓────────────┐
    │  Passport.js            │
    │  (Local + OAuth)        │
    │  (Session Management)   │
    └────────────┬────────────┘
                 │
    ┌────────────↓────────────┐
    │  Generate JWT Token     │
    │  + httpOnly Session     │
    │  + Refresh Token        │
    └────────────┬────────────┘
                 │
    ┌────────────↓────────────┐
    │  Database: Create/      │
    │  Update User record     │
    │  + Tier assignment      │
    └────────────┬────────────┘
                 │
    ┌────────────↓────────────┐
    │  Return to client       │
    │  + Set cookies          │
    │  + Redirect dashboard   │
    └────────────────────────┘
```

### Flow d'Authentification Local

```javascript
// 1. Utilisateur visite /register
//    ↓
// 2. Formulaire: email, password, name
//    ├─ Validation email format
//    ├─ Password strength check (min 8 chars, 1 majuscule, 1 chiffre)
//    └─ Vérifier email pas existant
//    ↓
// 3. Backend POST /auth/register
//    ├─ Hash password (bcrypt, 10 rounds)
//    ├─ Créer User record (tier: AMATEUR par défaut)
//    ├─ Créer UserStats record (stats: { reviews: 0, exports: 0 })
//    └─ Generate JWT token
//    ↓
// 4. Response retourne
//    ├─ JWT token (dans httpOnly cookie)
//    ├─ User data (email, name, tier)
//    └─ Redirect to onboarding ou dashboard
```

### Flow OAuth Discord

```
1. Frontend: User clique "Connecter avec Discord"
   ↓
2. Redirect to: 
   /auth/discord
   └─ Passport.js intercept
   ↓
3. Discord OAuth consent screen
   ├─ Demander: email, username, avatar
   └─ Utilisateur approuve
   ↓
4. Discord callback with auth code
   ↓
5. Backend POST /auth/discord/callback
   ├─ Exchange code → access_token
   ├─ Fetch user profile from Discord
   ├─ Chercher user existant par discordId
   ├─ Si n'existe pas: Créer nouveau User (tier: AMATEUR)
   ├─ Update last login
   └─ Generate JWT
   ↓
6. Redirect to dashboard avec session établie
```

### Endpoints d'Authentification

```javascript
// Authentification

POST /auth/register
{
  email: "user@example.com",
  password: "SecurePass123!",
  name: "John Doe"
}
Response 201:
{
  success: true,
  user: { id, email, name, tier, avatar },
  token: "jwt-token",
  expiresIn: 86400000  // 24h
}

POST /auth/login
{
  email: "user@example.com",
  password: "SecurePass123!"
}
Response 200:
{
  success: true,
  user: { ... },
  token: "jwt-token"
}

GET /auth/logout
Response 200:
{
  success: true,
  message: "Logged out"
}

GET /auth/me
Headers: { Authorization: "Bearer {token}" }
Response 200:
{
  success: true,
  user: { id, email, name, tier, avatar, ... }
}

POST /auth/refresh
Headers: { Authorization: "Bearer {token}" }
Response 200:
{
  success: true,
  token: "new-jwt-token"
}

POST /auth/discord
Response: Redirect to Discord

GET /auth/discord/callback?code=xxx&state=xxx
Response: Redirect to app + session

GET /auth/verify-email
Query: { token: "verification-token" }
Response 200:
{
  success: true,
  message: "Email verified"
}

POST /auth/forgot-password
{ email: "user@example.com" }
Response 200:
{
  success: true,
  message: "Reset link sent to email"
}

POST /auth/reset-password
{
  token: "reset-token",
  newPassword: "NewPass123!"
}
Response 200:
{
  success: true,
  message: "Password reset successful"
}
```

---

## 🎯 Session Management

### Session Configuration

```javascript
// File: server-new/session-options.js

module.exports = {
  secret: process.env.SESSION_SECRET,
  
  cookie: {
    httpOnly: true,        // Pas accessible via JS
    secure: process.env.NODE_ENV === 'production',  // HTTPS only en prod
    sameSite: 'strict',    // CSRF protection
    maxAge: 86400000,      // 24 heures (en ms)
    domain: '.reviews-maker.com'
  },
  
  store: new PrismaSessionStore(),  // Persister en DB
  
  resave: false,
  saveUninitialized: false,
  
  // Regenération de session ID après login (sécurité)
  regenerateAfterAuthenticate: true
};
```

### JWT Payload

```javascript
{
  sub: "user-123",                    // Subject (user ID)
  email: "user@example.com",
  tier: "AMATEUR|PRODUCTEUR|INFLUENCEUR",
  iat: 1673464747,                    // Issued at
  exp: 1673551147,                    // Expiration (24h)
  iss: "reviews-maker",               // Issuer
  aud: "reviews-maker-app"            // Audience
}
```

### Middleware de Vérification

```javascript
// server-new/middleware/auth.js

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(403).json({ error: 'Invalid token' });
  }
}

function requireTier(tier) {
  return (req, res, next) => {
    const tierHierarchy = { AMATEUR: 0, INFLUENCEUR: 1, PRODUCTEUR: 2 };
    
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (tierHierarchy[req.user.tier] < tierHierarchy[tier]) {
      return res.status(403).json({ error: 'Insufficient tier' });
    }
    
    next();
  };
}

// Usage
router.post('/export/custom', authenticate, requireTier('PRODUCTEUR'), exportHandler);
```

---

## 🛡️ KYC (Know Your Customer)

### Système de Vérification

```javascript
{
  ageVerification: {
    status: 'unverified' | 'verified' | 'failed',
    
    verification: {
      type: 'self-certification' | 'document-based',
      
      selfCert: {
        // Simple checkbox "Je confirme avoir 21+ ans"
        confirmed: true,
        confirmedAt: "2026-01-14",
        confirmedIp: "192.168.1.1"
      },
      
      documents: [
        {
          id: 'doc-123',
          type: 'passport' | 'drivers_license' | 'id_card',
          country: 'FR',
          expiryDate: "2028-12-31",
          verificationStatus: 'verified' | 'pending' | 'rejected',
          uploadedAt: "2026-01-14",
          verifiedAt: "2026-01-15",
          verificationNotes: "Verified by admin"
        }
      ]
    },
    
    restrictions: {
      canCreatePublicReviews: true,
      canAccessExports: true,
      canAccessEffects: true
    }
  }
}
```

### Upload de Documents KYC

```javascript
POST /auth/kyc/upload-document
Headers: { Authorization: "Bearer {token}" }
Multipart FormData:
{
  documentType: 'passport',
  file: <binary file data>,
  expiryDate: "2028-12-31"
}

Response 200:
{
  success: true,
  document: {
    id: 'doc-123',
    type: 'passport',
    status: 'pending',
    message: 'Document received. Verification in progress.'
  }
}

// Admin verification (endpoint admin seulement)
PATCH /admin/kyc/documents/:docId/verify
Headers: { Authorization: "Bearer {admin-token}" }
Body:
{
  status: 'verified' | 'rejected',
  notes: "Optional notes"
}
```

---

## 💳 Système d'Abonnement

### Tier Management

```javascript
// Database model

model Subscription {
  id                String    @id @default(cuid())
  user              User      @relation(fields: [userId], references: [id])
  userId            String    @unique
  
  tier              Tier      @default(AMATEUR)  // PRODUCTEUR | INFLUENCEUR
  
  // Facturation
  stripeCustomerId  String?   @unique
  stripeSubId       String?   @unique
  
  // Dates
  startDate         DateTime  @default(now())
  endDate           DateTime?
  renewalDate       DateTime
  
  // Statut
  status            String    // active, canceled, past_due, trialing
  
  // Prix
  monthlyPrice      Float     // 29.99 pour PRODUCTEUR, 15.99 pour INFLUENCEUR
  yearlyPrice       Float
  billingCycle      String    // 'monthly' | 'yearly'
  
  // Historique
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

### Endpoints Abonnement

```javascript
POST /subscription/upgrade
{
  tier: 'PRODUCTEUR' | 'INFLUENCEUR',
  billingCycle: 'monthly' | 'yearly',
  paymentMethod: 'stripe_payment_method_id'
}

Response 200:
{
  success: true,
  subscription: { ... },
  redirectUrl: 'stripe_payment_url'  // Si paiement nécessaire
}

GET /subscription/current
Response 200:
{
  tier: 'PRODUCTEUR',
  status: 'active',
  renewalDate: '2026-02-14',
  monthlyPrice: 29.99
}

POST /subscription/downgrade
{
  tier: 'AMATEUR',
  effectiveDate: 'immediate' | 'end_of_cycle'
}

Response 200:
{
  success: true,
  message: 'Downgrade scheduled for end of cycle'
}

DELETE /subscription/cancel
{
  reason: 'string',
  feedback: 'string'
}

Response 200:
{
  success: true,
  message: 'Subscription canceled'
}
```

### Intégration Stripe

```javascript
// Webhook Stripe handler

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }
  
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }
  
  res.json({ received: true });
});
```

---

## 🚀 Guards d'Accès Frontend

### Middleware React Router

```javascript
// File: client/src/components/ProtectedRoute.jsx

import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ element, requiredTier }) {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredTier && !hasTierAccess(user.tier, requiredTier)) {
    return (
      <div className="access-denied">
        <h2>Accès limité</h2>
        <p>Cette fonctionnalité requiert un abonnement {requiredTier}</p>
        <button onClick={() => navigate('/upgrade')}>
          Upgrade maintenant
        </button>
      </div>
    );
  }
  
  return element;
}

function hasTierAccess(userTier, requiredTier) {
  const hierarchy = { AMATEUR: 0, INFLUENCEUR: 1, PRODUCTEUR: 2 };
  return hierarchy[userTier] >= hierarchy[requiredTier];
}

// Usage dans routes
<Route
  path="/export/custom"
  element={<ProtectedRoute element={<CustomExport />} requiredTier="PRODUCTEUR" />}
/>
```

### Feature Flags

```javascript
// client/src/utils/featureFlags.ts

export const FEATURES = {
  CUSTOM_TEMPLATES: {
    AMATEUR: false,
    INFLUENCEUR: false,
    PRODUCTEUR: true
  },
  
  GENETICS_MANAGEMENT: {
    AMATEUR: false,
    INFLUENCEUR: false,
    PRODUCTEUR: true
  },
  
  PIPELINE_EDITING: {
    AMATEUR: false,
    INFLUENCEUR: false,
    PRODUCTEUR: true
  },
  
  EXPORT_QUALITY_300DPI: {
    AMATEUR: false,
    INFLUENCEUR: true,
    PRODUCTEUR: true
  },
  
  EXPORT_FORMATS_ADVANCED: {
    AMATEUR: false,
    INFLUENCEUR: false,
    PRODUCTEUR: true  // SVG, CSV, JSON, HTML
  }
};

export function canAccessFeature(feature, tier) {
  return FEATURES[feature]?.[tier] ?? false;
}
```

---

## 📊 Audit et Sécurité

### Logging d'Authentification

```javascript
// Table: AuthLog

model AuthLog {
  id            String    @id @default(cuid())
  user          User      @relation(fields: [userId], references: [id])
  userId        String
  
  action        String    // login | logout | register | password_reset
  method        String    // local | discord | google
  
  ipAddress     String
  userAgent     String
  
  success       Boolean
  failureReason String?
  
  timestamp     DateTime  @default(now())
  
  @@index([userId])
  @@index([timestamp])
}
```

### Rate Limiting

```javascript
// Limiter les tentatives de login

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 tentatives max
  message: 'Trop de tentatives. Réessayez dans 15 minutes.',
  
  keyGenerator: (req) => req.body.email || req.ip,
  
  skip: (req) => {
    // Sauter les IPs administrateur
    return isAdminIp(req.ip);
  }
});

router.post('/auth/login', loginLimiter, async (req, res) => {
  // ... handler
});
```

---

## 🎯 Roadmap Authentification

1. **Two-Factor Authentication (2FA)** - TOTP via Google Authenticator
2. **Social login** - Facebook, Apple Sign-In
3. **SSO Enterprise** - SAML pour équipes
4. **Passwordless** - Magic links par email
5. **Biometric** - Fingerprint/Face ID sur mobile
6. **Session management dashboard** - Voir/révoquer sessions actives
7. **API Keys** - Pour accès programmatique
8. **Audit trail complet** - Dashboard admin d'activité
