# 🛠️ Mode Opératoire MVP - Reviews-Maker

**Document de référence pour l'implémentation complète du MVP**  
**Version:** 1.0.0  
**Date:** 7 décembre 2025  

---

## 📋 Table des Matières

1. [Principes Directeurs](#principes-directeurs)
2. [Workflow Quotidien](#workflow-quotidien)
3. [Standards de Qualité](#standards-de-qualité)
4. [Checklist par Sprint](#checklist-par-sprint)
5. [Gestion des Erreurs](#gestion-des-erreurs)
6. [Tests & Validation](#tests--validation)
7. [Documentation Continue](#documentation-continue)
8. [Review & Merge](#review--merge)

---

## 🎯 Principes Directeurs

### 1. Zero Regression
**Règle d'or** : Ne jamais casser ce qui fonctionne.

```bash
# Avant TOUTE modification :
1. Tester l'état actuel
2. Créer une branche dédiée
3. Implémenter avec tests
4. Valider en local
5. Merge uniquement si tests passent
```

### 2. Documentation First
**Règle** : Documenter AVANT de coder.

```bash
# Pour chaque feature :
1. Créer spec dans docs/ (ex: docs/features/oauth-google.md)
2. Définir API endpoints + schemas
3. Lister tests nécessaires
4. Coder
5. Valider que doc = implémentation
```

### 3. Progressive Enhancement
**Règle** : Ajouter fonctionnalités sans supprimer legacy.

```bash
# Stratégie de migration :
1. Créer nouveau code à côté de l'ancien
2. Feature flag si nécessaire (ex: if (NEW_AUTH_ENABLED))
3. Tester les deux versions
4. Basculer progressivement
5. Supprimer legacy seulement quand nouveau validé 100%
```

### 4. Git Discipliné
**Règle** : Commits atomiques et branches courtes.

```bash
# Structure branches :
main                 → Production stable
├── develop          → Intégration continue
├── feat/oauth-multi → Feature isolée (3-5 jours max)
├── fix/age-modal    → Bugfix
└── refactor/auth    → Refacto (sans changer comportement)

# Commits :
git commit -m "feat(auth): add Google OAuth strategy"
git commit -m "fix(legal): age verification modal z-index"
git commit -m "docs(api): document /auth/google endpoint"
```

---

## 📆 Workflow Quotidien

### Début de Journée (15 min)
```bash
# 1. Sync repository
git checkout develop
git pull origin develop

# 2. Vérifier état branche actuelle
git status
git log --oneline -5

# 3. Lancer environnement local
cd server-new && npm run dev &    # Terminal 1
cd client && npm run dev &         # Terminal 2

# 4. Consulter TODO liste
cat TODO.md

# 5. Choisir tâche prioritaire (1 seule à la fois)
```

### Pendant Développement (Cycle 90 min)
```bash
# 1. Créer/Continuer branche feature
git checkout -b feat/nom-feature
# OU
git checkout feat/nom-feature

# 2. Développer en TDD (Test-Driven Development)
# Écrire test → Coder → Valider → Refacto

# 3. Commit fréquents (toutes les 20-30 min)
git add .
git commit -m "feat(scope): description courte"

# 4. Push régulièrement (backup cloud)
git push origin feat/nom-feature
```

### Fin de Feature (30 min)
```bash
# 1. Tests complets
npm test                          # Tests unitaires
npm run test:e2e                  # Tests E2E critiques

# 2. Vérifier qualité code
npm run lint                      # ESLint
npm run format                    # Prettier (auto-fix)

# 3. Documenter
# - Mettre à jour README si nouveau endpoint
# - Créer/Mettre à jour docs/features/nom-feature.md
# - Ajouter entrée CHANGELOG.md

# 4. Pull Request
git push origin feat/nom-feature
# Ouvrir PR sur GitHub avec template
```

### Fin de Journée (10 min)
```bash
# 1. Commit WIP si travail non terminé
git add .
git commit -m "wip: description état actuel"
git push origin feat/nom-feature

# 2. Mettre à jour TODO.md
nano TODO.md
# - [x] Tâche terminée
# - [~] Tâche en cours (50%)
# - [ ] Tâche à faire

# 3. Log journée
echo "$(date): feat/nom-feature - État: 60% - Blocage: aucun" >> LOG.md
```

---

## ✅ Standards de Qualité

### Code Backend (Express + Prisma)

#### 1. Routing
```javascript
// ✅ BON
router.post('/reviews', requireAuth, upload.array('images', 10), asyncHandler(async (req, res) => {
    const { holderName, type, description } = req.body
    
    // Validation
    if (!holderName || !type) {
        return res.status(400).json({ error: 'missing_fields', message: 'holderName and type required' })
    }
    
    // Logique métier
    const review = await prisma.review.create({
        data: { holderName, type, description, authorId: req.user.id }
    })
    
    res.status(201).json(review)
}))

// ❌ MAUVAIS
router.post('/reviews', async (req, res) => {  // Pas de auth check
    const review = await prisma.review.create({ data: req.body })  // Pas de validation
    res.json(review)  // Pas de status code
})
```

#### 2. Gestion Erreurs
```javascript
// ✅ BON : Middleware global
app.use((err, req, res, next) => {
    console.error('[ERROR]', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
        userId: req.user?.id
    })
    
    res.status(err.status || 500).json({
        error: err.code || 'internal_error',
        message: err.message || 'An error occurred'
    })
})

// ❌ MAUVAIS
app.use((err, req, res, next) => {
    console.log(err)  // Log non structuré
    res.send('error')  // Pas de JSON, pas de détails
})
```

#### 3. Queries Prisma
```javascript
// ✅ BON : Optimisé avec select
const reviews = await prisma.review.findMany({
    where: { authorId: userId, isPublic: true },
    select: {
        id: true,
        holderName: true,
        type: true,
        mainImage: true,
        createdAt: true,
        author: { select: { id: true, username: true, avatar: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    skip: (page - 1) * 20
})

// ❌ MAUVAIS : Over-fetching
const reviews = await prisma.review.findMany({ where: { authorId: userId } })
// → Récupère TOUS les champs (150+) sans pagination
```

### Code Frontend (React + Zustand)

#### 1. Composants
```jsx
// ✅ BON
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

export default function ReviewCard({ review, onLike }) {
    const { t } = useTranslation()
    const [isLiking, setIsLiking] = useState(false)
    
    const handleLike = async () => {
        setIsLiking(true)
        try {
            await onLike(review.id)
        } catch (error) {
            console.error('Like failed:', error)
        } finally {
            setIsLiking(false)
        }
    }
    
    return (
        <article className="glass rounded-xl p-4">
            <h3 className="text-lg font-semibold">{review.holderName}</h3>
            <button 
                onClick={handleLike} 
                disabled={isLiking}
                className="btn-primary"
            >
                {t('review.like')}
            </button>
        </article>
    )
}

ReviewCard.propTypes = {
    review: PropTypes.shape({
        id: PropTypes.string.isRequired,
        holderName: PropTypes.string.isRequired
    }).isRequired,
    onLike: PropTypes.func.isRequired
}

// ❌ MAUVAIS
function Card({ data }) {  // Nom générique, pas de PropTypes
    return <div onClick={() => fetch('/like')}>  {/* Pas de gestion erreur */}
        <p>{data.name}</p>  {/* Pas de i18n */}
    </div>
}
```

#### 2. Stores Zustand
```javascript
// ✅ BON : Slice pattern
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            isAuthenticated: false,
            isLoading: true,
            
            // Actions
            setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
            
            logout: () => {
                set({ user: null, isAuthenticated: false })
                localStorage.clear()
            },
            
            checkAuth: async () => {
                try {
                    const res = await fetch('/api/auth/me', { credentials: 'include' })
                    if (res.ok) {
                        const user = await res.json()
                        get().setUser(user)
                    } else {
                        set({ isLoading: false })
                    }
                } catch (error) {
                    console.error('Auth check failed:', error)
                    set({ isLoading: false })
                }
            }
        }),
        { name: 'auth-storage' }
    )
)

// ❌ MAUVAIS : Tout dans un seul store géant
export const useStore = create((set) => ({
    user: null,
    reviews: [],
    filters: {},
    theme: 'dark',
    // ... 50+ propriétés
    // → Performances dégradées, re-renders inutiles
}))
```

### Base de Données (Prisma)

#### 1. Migrations
```bash
# ✅ BON : Migrations nommées et atomiques
npx prisma migrate dev --name add_google_oauth_fields
npx prisma migrate dev --name add_subscription_model
npx prisma migrate dev --name add_reports_moderation

# ❌ MAUVAIS
npx prisma migrate dev  # Nom auto-généré peu clair
# OU pire : modifier schema.prisma sans migration
```

#### 2. Schema Prisma
```prisma
// ✅ BON
model User {
  id         String   @id @default(uuid())
  discordId  String?  @unique
  googleId   String?  @unique
  email      String?
  username   String
  avatar     String?
  
  // Timestamps
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  // Relations
  reviews    Review[]
  subscription Subscription?
  
  // Index pour performance
  @@index([email])
  @@index([discordId])
  @@index([googleId])
  @@map("users")
}

// ❌ MAUVAIS
model User {
  id String @id @default(uuid())
  data String  // JSON stringifié → Pas de typage, pas de requêtes efficaces
  @@map("users")
}
```

---

## 📝 Checklist par Sprint

### Sprint 1 : Auth + Légal (Semaines 1-2)

#### Semaine 1
- [ ] **Jour 1-2 : Configuration OAuth**
  - [ ] Créer apps Google, Apple, Amazon, Facebook
  - [ ] Copier credentials dans `.env`
  - [ ] Tester redirections OAuth en dev
  - [ ] Documenter dans `docs/oauth-setup.md`

- [ ] **Jour 3-4 : Implémentation Strategies**
  - [ ] `config/passport.js` : Ajouter 4 strategies
  - [ ] `routes/auth.js` : Ajouter 8 routes (4 x 2)
  - [ ] Tester chaque provider individuellement
  - [ ] Commit : `feat(auth): add Google/Apple/Amazon/Facebook OAuth`

- [ ] **Jour 5 : Email Backup**
  - [ ] `services/email.js` : Fonction envoi code 6 chiffres
  - [ ] `routes/auth.js` : POST /email/request-code + /verify-code
  - [ ] Tester avec Resend sandbox
  - [ ] Commit : `feat(auth): add email backup authentication`

#### Semaine 2
- [ ] **Jour 1-2 : Système Légal Backend**
  - [ ] `middleware/legal.js` : vérifyAge, vérifyCountry
  - [ ] `config/legal.js` : Pays autorisés + âges légaux
  - [ ] `routes/legal.js` : 4 endpoints (verify-age, consent, countries, notice)
  - [ ] Commit : `feat(legal): add age and country verification system`

- [ ] **Jour 3-4 : UI Légal**
  - [ ] `components/legal/RDRBanner.jsx` : Sticky banner
  - [ ] `components/legal/AgeVerification.jsx` : Modal date + pays
  - [ ] `components/legal/ConsentModal.jsx` : Checkbox acceptation
  - [ ] Tester flow complet signup → age → consent
  - [ ] Commit : `feat(legal): add RDR banner and verification modals`

- [ ] **Jour 5 : i18n Setup**
  - [ ] `i18n/i18n.js` : Config react-i18next
  - [ ] `i18n/fr.json` + `i18n/en.json` : Traductions auth + legal
  - [ ] `components/LanguageSwitcher.jsx` : Dropdown FR/EN
  - [ ] Tester changement langue temps réel
  - [ ] Commit : `feat(i18n): add FR/EN translations for auth and legal`

#### Tests Sprint 1
```bash
# Backend
curl http://localhost:3000/api/auth/google  # Redirect OK
curl -X POST http://localhost:3000/api/legal/verify-age \
  -H "Content-Type: application/json" \
  -d '{"birthdate":"2000-01-01","country":"FR"}'  # → {legalAge: true}

# Frontend
npm run test:e2e -- auth.spec.js  # Flow OAuth complet
npm run test:e2e -- legal.spec.js  # Vérification âge/pays
```

### Sprint 3-4 : Éditeur Reviews (Semaines 3-4)

#### Checklist
- [ ] Refacto `CreateReviewPage.jsx` en composants modulaires
- [ ] Créer `ReviewTypeSelector.jsx` (4 tuiles cliquables)
- [ ] Créer formulaires par type (Weed, Hash, Concentré, Comestible)
- [ ] Implémenter autosave brouillon (debounce 30s)
- [ ] Créer `PresetsModal.jsx` avec 5 presets rapides
- [ ] Ajouter validation étape par étape (stepper)
- [ ] Tests E2E création review complète

### Sprint 5-6 : Exports + Galerie (Semaines 5-6)

#### Checklist
- [ ] Créer presets Orchard (3 templates influenceur)
- [ ] Implémenter génération PNG (html-to-image)
- [ ] Implémenter génération PDF (jsPDF)
- [ ] Créer `TemplateCustomizer.jsx` (palette, logo, champs)
- [ ] Refacto galerie avec filtres avancés
- [ ] Créer `FilterBar.jsx` (5 filtres + recherche)
- [ ] Pages profil publiques `/users/:id`
- [ ] Tests exports + filtres

### Sprint 7-8 : Stats + Modération (Semaines 7-8)

#### Checklist
- [ ] Migrer schema : Report + AuditLog models
- [ ] Routes `/api/reports/*` (POST, GET, PATCH)
- [ ] Routes `/api/admin/*` (ban, delete, audit)
- [ ] Créer `StatsPage.jsx` avec graphiques (Recharts)
- [ ] Créer `ReportModal.jsx` (formulaire signalement)
- [ ] Créer page `/admin/moderation`
- [ ] Finaliser i18n FR/EN complet (100% chaînes)
- [ ] Tests modération + stats

### Sprint 9-12 : Stripe + RBAC + Hardening (Semaines 9-12)

#### Checklist
- [ ] Configurer Stripe (produits, prix, webhooks)
- [ ] Migrer schema : Subscription, InfluencerProfile, ProducerProfile
- [ ] Routes `/api/subscriptions/*` (checkout, portal, webhook)
- [ ] Middleware RBAC (vérifier roles dans requêtes)
- [ ] Créer page `/settings/subscription`
- [ ] Implémenter CSP + CSRF + rate limiting
- [ ] Configurer Winston logs + Sentry monitoring
- [ ] Tests E2E flows complets (auth → review → export → abonnement)
- [ ] Optimisations performances (bundle, queries DB)
- [ ] Tests charge (autocannon 100 req/s)
- [ ] Documentation complète API (OpenAPI/Swagger)

---

## 🐛 Gestion des Erreurs

### Catégorisation

#### 1. Erreur Bloquante (P0)
**Définition** : Application inutilisable.  
**Exemples** : Serveur crash, DB inaccessible, auth cassée.

**Action immédiate :**
```bash
# 1. Rollback dernière version stable
git revert HEAD
git push origin main --force-with-lease

# 2. Créer branche hotfix
git checkout -b hotfix/critical-crash

# 3. Fix + test + deploy en urgence (<2h)

# 4. Post-mortem dans docs/incidents/YYYY-MM-DD-crash.md
```

#### 2. Erreur Critique (P1)
**Définition** : Feature majeure non fonctionnelle.  
**Exemples** : Création review impossible, uploads échouent, paiements bloqués.

**Action :**
```bash
# Fix dans les 24h
git checkout -b fix/review-creation-fails

# Communication users si nécessaire (Discord, banner app)
```

#### 3. Erreur Mineure (P2)
**Définition** : Bug gênant mais contournable.  
**Exemples** : Traduction manquante, style cassé, filtre inopérant.

**Action :**
```bash
# Fix dans la semaine
# Ajouter dans TODO.md section "Bugs P2"
```

#### 4. Amélioration (P3)
**Définition** : Pas un bug, demande d'amélioration UX.

**Action :**
```bash
# Ajouter dans backlog GitHub Issues
# Prioriser selon votes communauté
```

### Debugging Méthodique

#### Backend
```javascript
// 1. Logs structurés
console.log('[DEBUG]', {
    function: 'createReview',
    userId: req.user.id,
    body: req.body,
    timestamp: new Date().toISOString()
})

// 2. Try/catch exhaustifs
try {
    const review = await prisma.review.create({ data })
} catch (error) {
    if (error.code === 'P2002') {  // Prisma unique constraint
        return res.status(409).json({ error: 'duplicate', message: 'Review already exists' })
    }
    throw error  // Propager aux autres erreurs
}

// 3. Valider inputs
const schema = z.object({
    holderName: z.string().min(1).max(100),
    type: z.enum(['Weed', 'Hash', 'Concentré', 'Comestible'])
})
const validated = schema.parse(req.body)  // Throws si invalide
```

#### Frontend
```javascript
// 1. Error Boundary React
<ErrorBoundary fallback={<ErrorPage />}>
    <App />
</ErrorBoundary>

// 2. Sentry pour tracking production
Sentry.init({
    dsn: 'https://xxxxx@sentry.io/xxxxx',
    environment: process.env.NODE_ENV
})

// 3. Fetch avec gestion erreurs
async function fetchReviews() {
    try {
        const res = await fetch('/api/reviews', { credentials: 'include' })
        if (!res.ok) {
            if (res.status === 401) {
                // Redirect login
                window.location.href = '/login'
                return
            }
            throw new Error(`HTTP ${res.status}`)
        }
        return await res.json()
    } catch (error) {
        console.error('Fetch reviews failed:', error)
        showToast('Erreur chargement reviews', 'error')
        return []
    }
}
```

---

## 🧪 Tests & Validation

### Pyramide des Tests

```
        ┌─────────────┐
        │   E2E (5%)  │  ← Playwright (flows critiques)
        ├─────────────┤
        │ Intégration │  ← Supertest (API endpoints)
        │    (15%)    │
        ├─────────────┤
        │  Unitaires  │  ← Vitest (fonctions pures)
        │    (80%)    │
        └─────────────┘
```

### Tests Unitaires (Vitest)

```javascript
// tests/utils/validation.test.js
import { describe, it, expect } from 'vitest'
import { validateAge } from '../utils/validation'

describe('validateAge', () => {
    it('should return true for 18+ in France', () => {
        const birthdate = new Date('2000-01-01')
        expect(validateAge(birthdate, 'FR')).toBe(true)
    })
    
    it('should return false for 17 in France', () => {
        const birthdate = new Date('2007-01-01')
        expect(validateAge(birthdate, 'FR')).toBe(false)
    })
    
    it('should return false for 20 in California (21+)', () => {
        const birthdate = new Date('2004-01-01')
        expect(validateAge(birthdate, 'US', 'CA')).toBe(false)
    })
})
```

### Tests Intégration (Supertest)

```javascript
// tests/api/auth.test.js
import request from 'supertest'
import { app } from '../server'
import { prisma } from '../prisma'

describe('POST /api/auth/email/verify-code', () => {
    it('should authenticate user with valid code', async () => {
        // Setup : créer code en mémoire
        verificationCodes.set('test@example.com', '123456')
        
        const res = await request(app)
            .post('/api/auth/email/verify-code')
            .send({ email: 'test@example.com', code: '123456' })
        
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('user')
        expect(res.headers['set-cookie']).toBeDefined()
    })
    
    it('should reject invalid code', async () => {
        const res = await request(app)
            .post('/api/auth/email/verify-code')
            .send({ email: 'test@example.com', code: '000000' })
        
        expect(res.status).toBe(401)
        expect(res.body.error).toBe('invalid_code')
    })
})
```

### Tests E2E (Playwright)

```javascript
// tests/e2e/auth.spec.js
import { test, expect } from '@playwright/test'

test('complete OAuth signup flow', async ({ page }) => {
    // 1. Visiter page signup
    await page.goto('http://localhost:5173/signup')
    
    // 2. Cliquer bouton Google OAuth (mock en test)
    await page.click('button:has-text("Se connecter avec Google")')
    
    // 3. Modal vérification âge s'affiche
    await expect(page.locator('[data-testid="age-modal"]')).toBeVisible()
    
    // 4. Remplir date naissance + pays
    await page.fill('input[name="birthdate"]', '01/01/2000')
    await page.selectOption('select[name="country"]', 'FR')
    await page.click('button:has-text("Continuer")')
    
    // 5. Modal consentement RDR
    await expect(page.locator('[data-testid="consent-modal"]')).toBeVisible()
    await page.check('input[name="consent"]')
    await page.click('button:has-text("Accepter")')
    
    // 6. Redirect vers home authentifié
    await expect(page).toHaveURL('http://localhost:5173/')
    await expect(page.locator('text=Mon Profil')).toBeVisible()
})
```

### Checklist Pre-Merge

```bash
# 1. Tests unitaires
npm run test                      # ✅ 100% pass

# 2. Tests intégration
npm run test:integration          # ✅ 100% pass

# 3. Tests E2E critiques
npm run test:e2e -- auth.spec.js review-creation.spec.js  # ✅ Pass

# 4. Lint + Format
npm run lint                      # ✅ 0 errors
npm run format                    # ✅ Auto-fix

# 5. Build production
npm run build                     # ✅ No warnings

# 6. Lighthouse audit (dev tools)
# Performance: >90
# Accessibility: >90
# Best Practices: >90
# SEO: >90
```

---

## 📖 Documentation Continue

### Documents à Maintenir

#### 1. README.md (Racine)
**Mettre à jour quand :**
- Nouvelle feature majeure ajoutée
- Changement prérequis (Node version, dépendances)
- Nouveau provider OAuth
- Instructions installation modifiées

#### 2. CHANGELOG.md
**Format :**
```markdown
## [2.1.0] - 2025-12-15

### Added
- Google OAuth authentication
- Age verification modal
- RDR banner (sticky)

### Changed
- Updated Prisma schema with legal fields
- Refactored auth flow to support multiple providers

### Fixed
- Session persistence on page reload
- CORS issues with cookies

### Deprecated
- Legacy email auth (use OAuth instead)

### Security
- Added CSP headers
- Implemented rate limiting on auth routes
```

#### 3. docs/API_REFERENCE.md
**Documenter chaque endpoint :**
```markdown
### POST /api/auth/email/verify-code

Vérifie un code de vérification email et authentifie l'utilisateur.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Responses:**

200 OK
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "User123"
  }
}
```

401 Unauthorized
```json
{
  "error": "invalid_code",
  "message": "Code incorrect ou expiré"
}
```

**Rate limit:** 5 requêtes/minute par IP
```

#### 4. docs/TROUBLESHOOTING.md
**Ajouter solutions problèmes courants :**
```markdown
### Erreur : "Session not found" après login

**Symptôme :** User se connecte mais session non persistée.

**Cause :** Cookies bloqués ou SESSION_SECRET mal configuré.

**Solution :**
1. Vérifier `.env` : `SESSION_SECRET` doit être défini (64+ chars)
2. Vérifier navigateur : Cookies tiers-party autorisés
3. Vérifier Nginx : Header `proxy_set_header Cookie $http_cookie;`

**Test :**
```bash
curl -c cookies.txt http://localhost:3000/api/auth/discord
curl -b cookies.txt http://localhost:3000/api/auth/me
# Doit retourner user, pas 401
```
```

---

## 🔍 Review & Merge

### Code Review Checklist

#### Reviewer
- [ ] **Fonctionnel** : Feature fonctionne comme prévu
- [ ] **Tests** : Tests passent + nouveaux tests ajoutés
- [ ] **Performance** : Pas de requêtes N+1, bundle size OK
- [ ] **Sécurité** : Pas de secrets hardcodés, inputs validés
- [ ] **Accessibilité** : Navigation clavier, labels ARIA
- [ ] **i18n** : Toutes chaînes externalisées
- [ ] **Documentation** : README/API doc mis à jour si nécessaire
- [ ] **Style** : Lint passe, code cohérent avec codebase

#### Author (Pre-PR)
```bash
# Auto-checklist avant d'ouvrir PR
npm run pre-commit   # Script custom qui lance :
# - npm run lint
# - npm run format
# - npm run test
# - npm run build

# Si tout passe → Ouvrir PR
```

### Merge Strategy

#### Feature Branches → Develop
```bash
# 1. Rebase sur develop
git checkout feat/ma-feature
git rebase develop

# 2. Résoudre conflits si nécessaire
git add .
git rebase --continue

# 3. Push force (car rebase)
git push origin feat/ma-feature --force-with-lease

# 4. Merge via GitHub PR (squash commits)
# → 1 seul commit dans develop avec message clair
```

#### Develop → Main (Release)
```bash
# 1. Tag version
git checkout develop
git tag -a v2.1.0 -m "Release v2.1.0: OAuth multi-providers + Legal system"
git push origin v2.1.0

# 2. Merge develop → main (fast-forward)
git checkout main
git merge develop --ff-only

# 3. Deploy production
git push origin main
# → CI/CD automatique ou script deploy manuel
```

### Hotfix Urgent
```bash
# 1. Branche depuis main
git checkout main
git checkout -b hotfix/critical-bug

# 2. Fix + test
# ...

# 3. Merge dans main ET develop
git checkout main
git merge hotfix/critical-bug
git push origin main

git checkout develop
git merge hotfix/critical-bug
git push origin develop

# 4. Tag patch
git tag -a v2.0.1 -m "Hotfix: critical auth bug"
git push origin v2.0.1
```

---

## 📊 Métriques de Qualité

### KPIs Techniques

| Métrique | Cible MVP | Mesure |
|----------|-----------|--------|
| **Test Coverage** | ≥ 70% | `npm run test:coverage` |
| **Lighthouse Performance** | ≥ 90 | DevTools Lighthouse |
| **Lighthouse Accessibility** | ≥ 90 | DevTools Lighthouse |
| **Bundle Size (gzip)** | < 500 KB | `npm run build --analyze` |
| **API p95 Latency** | < 300 ms | Logs Winston + Sentry |
| **Uptime** | ≥ 99.5% | Uptime Robot |
| **Error Rate** | < 1% | Sentry dashboard |

### Revue Hebdomadaire

**Chaque vendredi 17h :**
```bash
# 1. Générer rapport métriques
npm run report:metrics

# 2. Review TODO.md
# - Combien tâches terminées cette semaine ?
# - Blocages identifiés ?
# - Ajustement planning si nécessaire

# 3. Update docs/PROGRESS.md
echo "## Semaine $(date +%V)" >> docs/PROGRESS.md
echo "- [x] Auth Google OAuth" >> docs/PROGRESS.md
echo "- [~] Age verification (80%)" >> docs/PROGRESS.md
echo "- [ ] Email backup auth" >> docs/PROGRESS.md
```

---

## 🎓 Ressources & Formation

### Documentation Externe
- **React** : https://react.dev/
- **Prisma** : https://www.prisma.io/docs
- **Passport.js** : https://www.passportjs.org/
- **Stripe** : https://stripe.com/docs/api
- **TailwindCSS** : https://tailwindcss.com/docs
- **Playwright** : https://playwright.dev/

### Patterns & Best Practices
- **REST API Design** : https://restfulapi.net/
- **Security OWASP** : https://owasp.org/www-project-top-ten/
- **RGPD** : https://www.cnil.fr/fr/reglement-europeen-protection-donnees

---

**Document vivant - Mis à jour en continu**  
**Responsable** : Tech Lead Reviews-Maker  
**Dernière révision** : 7 décembre 2025
