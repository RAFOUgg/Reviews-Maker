# 🗺️ GUIDE NAVIGATION CODEBASE - REVIEW-MAKER AVRIL 2026

**Objectif**: Te montrer exactement où aller pour chaque domaine du MVP  
**Mise à jour**: 2 avril 2026  
**État**: À jour vs code réel

---

## 📍 STRUCTURE REPO (Vue d'ensemble)

```
Reviews-Maker/
├── client/                          # Frontend Vite + React
│   ├── src/
│   │   ├── pages/                  # Routes principales
│   │   ├── components/             # Composants réutilisables
│   │   ├── store/                  # Zustand global state
│   │   ├── hooks/                  # Hooks personnalisés
│   │   └── utils/                  # Helpers + constants
│   └── dist/                        # Build production
│
├── server-new/                      # Backend Express + Prisma
│   ├── routes/                      # API endpoints (50+)
│   ├── prisma/
│   │   ├── schema.prisma            # Data model
│   │   └── migrations/              # DB versioning
│   ├── services/                    # Business logic
│   ├── middleware/                  # Auth, validation
│   └── server.js                    # Entrypoint
│
├── db/                              # Data storage
│   ├── review_images/               # User uploads
│   ├── kyc_documents/               # KYC files
│   ├── avatars/                     # User avatars
│   └── data.sqlite                  # DB file
│
└── data/                            # Static lookups
    ├── aromas.json
    ├── effects.json
    ├── tastes.json
    └── terpenes.json
```

---

## 🎯 PAR DOMAINE FONCTIONNEL

### **1️⃣ CRÉATION DE REVIEWS**

**Flux utilisateur**: HomePage → Select type → CreateReviewPage → Tabs → Sections → Save

#### Frontend (à connaître en priorité)
| Fichier | Lignes | Rôle |
|---------|--------|------|
| `pages/review/CreateReviewPage.jsx` | 300+ | **Router central** - Détecte type produit, redirige |
| `pages/review/CreateFlowerReview/index.jsx` | 500+ | **Modèle complet** - Copier pour Hash/Concentrate |
| `pages/review/CreateFlowerReview/sections/` | N/A | 8 sections (Info, Genetics, Odor, Taste, etc.) |
| `components/pipelines/core/PipelineCore.jsx` | 400+ | **GitHub-style grid** - Réutilisé pour tous produits |
| `components/forms/` | N/A | AutocompleteField, PieComposition, Terpene inputs |
| `components/ui/LiquidUI.jsx` | 1000+ | **Design system** - Cards, buttons, modals |

**Comment ça marche**:
1. User goes to `/create/:type` (e.g., `/create/flower`)
2. `CreateFlowerReview` loads and renders 8 tabs
3. Each section has its own form state
4. Pipelines use `PipelineCore` for GitHub-grid UI
5. On submit → POST `/api/reviews/flower`

#### Backend (à connaître)
| Endpoint | Fichier | Lignes | Rôle |
|----------|---------|--------|------|
| `POST /api/reviews/flower` | `server-new/routes/flower-reviews.js` | 1041 | **Modèle de référence** - CREATE + UPDATE |
| `POST /api/reviews/hash` | `server-new/routes/hash-reviews.js` | 400+ | Hash reviews |
| `POST /api/reviews/concentrate` | `server-new/routes/concentrate-reviews.js` | 450+ | Concentrate reviews |
| `POST /api/reviews/edible` | `server-new/routes/edible-reviews.js` | 375+ | Edible reviews |

**Clé à retenir**: Data flows into `Review` (base) + `[Type]Review` (specific). E.g.,:
```javascript
// Base table (all products)
Review { id, holderName, type, images, isPublic, authorId }

// Flower-specific
FlowerReview { reviewId, cultivar, breeder, terpeneProfile, ... }
```

---

### **2️⃣ EXPORT MAKER (Rendu + Configuration)**

**État**: Templates rendering ✅ | DB save ⏳ | Full generation ⏳

#### Frontend Architecture
```
OrchardPanel (main modal)
  ├─ ConfigPane (LEFT - 3 tabs)
  │  ├─ TemplateSelector
  │  ├─ ContentModuleControls (~80 toggles)
  │  └─ TypographyControls, ColorPaletteControls
  ├─ PageManager (MIDDLE - pagination)
  └─ PreviewPane (RIGHT - canvas)
     └─ TemplateRenderer
        ├─ ModernCompactTemplate
        ├─ DetailedCardTemplate
        ├─ BlogArticleTemplate
        ├─ SocialStoryTemplate (9:16)
        └─ CustomTemplate (drag-drop)
```

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `components/shared/orchard/OrchardPanel.jsx` | ~850 | **Main export modal** - Config + preview |
| `store/orchardStore.js` | 300+ | Zustand state (template, colors, modules) |
| `store/orchardPagesStore.js` | 200+ | Pages state for pagination |
| `components/templates/ModernCompactTemplate.jsx` | 400+ | Compact template rendering |
| `components/templates/DetailedCardTemplate.jsx` | 500+ | Detailed layout |
| `components/templates/BlogArticleTemplate.jsx` | 600+ | Article format |
| `components/templates/SocialStoryTemplate.jsx` | 400+ | 9:16 story format |
| `components/shared/config/ContentModuleControls.jsx` | 400+ | Config toggles (~80 for flower) |
| `components/export/ExportMaker.jsx` | 2100 | LEGACY - Old export system (still used) |

#### Backend (Export generation)
| Route | Status | Note |
|-------|--------|------|
| `POST /api/export/preview` | ✅ Done | Returns preview metadata |
| `POST /api/export/png` | ⏳ Incomplete | Dynamic generation needed |
| `POST /api/export/pdf` | ⏳ Incomplete | html2canvas + jsPDF |
| `POST /api/export/svg` | ⏳ Incomplete | Custom renderer |
| `POST /api/export/csv` | ⏳ Incomplete | Data serialization |

**Missing**: DB save for export configurations (so they persist on reload)

**PRIORITY**: Implement ExportConfiguration save immediately

---

### **3️⃣ ACCOUNT & TIERS (Authentification + Permissions)**

**État**: 4 account types defined + backend routes ready ✅ | Frontend tier-specific UI ⏳

#### Account Types (Defined in code)
```javascript
// server-new/routes/account.js
ACCOUNT_TYPES = {
  BETA_TESTER: 'beta_tester',         // Accès complet bêta
  CONSUMER: 'consumer',                 // Gratuit (Amateur)
  INFLUENCER: 'influencer',            // 15.99€/month
  PRODUCER: 'producer'                 // 29.99€/month (KYC needed)
}
```

#### Permissions par tier

| Feature | Consumer | Influencer | Producer |
|---------|----------|------------|----------|
| Review types | Fleurs | Fleurs | Fleurs + Hash + Concen + Comest |
| Templates | Compact, Detailed, Complete | + Influencer | + Custom + Personalized |
| Export formats | PNG, JPG, PDF 150dpi | + SVG 300dpi | + CSV, JSON, HTML |
| Pipelines | Curing only | Curing | Culture + Curing + Extraction |
| Exports/day | 3 | 10 | Unlimited |
| Reviews saved | 20 | Unlimited | Unlimited |
| Library features | Basic | Basic | Advanced (Cultivars, Data) |

**Frontend Routes**:
| File | Rôle |
|------|------|
| `pages/auth/LoginPage.jsx` | Login |
| `pages/auth/RegisterPage.jsx` | Register + account type selection |
| `pages/auth/AgeVerification.jsx` | Age gate (18+ or US 21+) |
| `pages/auth/EmailVerification.jsx` | Email verification code |
| `pages/account/AccountPage.jsx` | User profile + settings |
| `pages/account/ManageSubscription.jsx` | Tier management |
| `pages/account/PaymentPage.jsx` | Checkout (MOCK) |

**Backend Routes**:
| Endpoint | File | Rôle |
|----------|------|------|
| `GET /api/auth/me` | `auth.js` | Current user + limits |
| `POST /api/auth/email/signup` | `auth.js` | Create account |
| `POST /api/auth/discord` | `auth.js` | OAuth |
| `POST /api/account/change-type` | `account.js` | Upgrade/downgrade |
| `GET /api/auth/limits` | `auth.js` | User quotas |

**KEY**: Permissions checked in backend via `getUserAccountType(user)` function

---

### **4️⃣ LIBRARY (Bibliothèque utilisateur)**

**État**: Fully designed (~2944 lignes frontend + 400 backend) | Ready to import

#### Pages
| Tab | File | Rôle |
|-----|------|------|
| Mes Reviews | `library/tabs/ReviewsTab.jsx` | Grid/list/timeline view |
| Cultivars | `library/tabs/CultivarsTab.jsx` | Genetics library (Producer) |
| Templates | `library/tabs/TemplatesTab.jsx` | Export templates saved |
| Filigranes | `library/tabs/WatermarksTab.jsx` | Custom watermarks |
| Données | `library/tabs/DataTab.jsx` | Saved substrates, nutrients, etc. |
| Stats | `library/tabs/StatsTab.jsx` | User statistics |

#### Backend Routes
```
GET    /api/library/reviews              - List user reviews
GET    /api/library/templates            - List templates
POST   /api/library/templates            - Save template
DELETE /api/library/templates/:id        - Delete template

GET    /api/library/watermarks           - List watermarks
POST   /api/library/watermarks           - Create watermark
DELETE /api/library/watermarks/:id       - Delete

GET    /api/library/cultivars            - List cultivars (Producer)
POST   /api/library/cultivars            - Add cultivar
DELETE /api/library/cultivars/:id        - Delete
```

---

### **5️⃣ STATISTIQUES**

**État**: Backend routes complete ✅ | Frontend differentiation ⏳

#### Backend (`server-new/routes/stats.js` - 460 lignes)

| Endpoint | Rôle |
|----------|------|
| `GET /api/stats/` | Overview (reviews, exports, likes, etc.) |
| `GET /api/stats/reviews` | Reviews analytics (by type, by month, top cultivars) |
| `GET /api/stats/engagement` | Engagement (likes, views, comments) |
| `GET /api/stats/producer` | Producer-exclusive (yields, culture types) |
| `GET /api/stats/exports` | Export tracking (by format) |
| `POST /api/stats/exports/track` | Log an export |
| `GET /api/stats/quick/:userId` | Quick stats for public profile |

#### What's missing
- [ ] Different stats page layout for each tier
- [ ] Producer culture dashboard
- [ ] Influencer engagement heatmaps
- [ ] Public gallery ranking system

---

### **6️⃣ PIPELINES (Timeline tracking)**

**État**: All types implemented ✅ | Need to standardize

#### Three Parallel Systems (Consolidate needed)

**System A: PipelineCore (Best - React Flow)**
- File: `components/pipelines/core/PipelineCore.jsx`
- Supports: DAYS, WEEKS, PHASES, CUSTOM
- GitHub-style 90-day grid
- Fully generic/reusable
- **Recommendation**: Use this for all

**System B: Culture Presets**
- File: `server-new/routes/pipeline-culture.js`
- 9 preset groups (Espace, Substrat, Irrigation, Engrais, Lumière, Climat, etc.)
- CultureSetup CRUD
- *Integrate with System A*

**System C: GitHub Pipeline**
- File: `server-new/routes/pipeline-github.js`
- Simpler interval-based
- Used by hash/concentrate/edible
- *Migrate to System A*

#### Recommendation
Standardize everything on **PipelineCore** (System A) − it's the most flexible

---

### **7️⃣ AUTHENTIFICATION & SÉCURITÉ**

**État**: Well-implemented ✅

#### Features Implemented
| Feature | File | Status |
|---------|------|--------|
| Email/password | `auth.js` | ✅ Complete with password reset |
| OAuth 5 providers | `auth.js` | ✅ Discord, Google, Apple, Amazon, Facebook |
| 6-digit email codes | `auth.js` | ✅ Send + verify (CDC requirement) |
| 2FA TOTP | `userSettings.js` | ✅ Setup + disable with backup codes |
| Session management | `auth.js` | ✅ Via Passport.js |
| Age verification | `legal.js` | ✅ Birthdate + country validation |
| KYC documents | `userKYC.js` | ✅ Upload + status tracking |

#### Behind the Scenes
- JWT tokens for API
- Session cookies for browser
- Passport strategies for each OAuth provider
- Multer for file uploads (images, KYC docs)
- Argon2 password hashing

---

## 🔧 QUICK REFERENCE: FILES YOU'LL TOUCH MOST

### **Need to understand export system?**
→ Start with: `components/shared/orchard/OrchardPanel.jsx` (850 lines)  
→ Then: `store/orchardStore.js` (state management)  
→ Then: Template components (DetailedCardTemplate, etc.)

### **Need to add a new review type?**
→ Copy: `pages/review/CreateFlowerReview/` folder  
→ Copy backend: `server-new/routes/flower-reviews.js`  
→ Update Prisma schema + run migration

### **Need to understand account permissions?**
→ Start with: `server-new/routes/account.js` (account type definitions)  
→ Check: Middleware in `server-new/middleware/` for `requireAuth`, permission checks
→ Frontend: `hooks/useAccountType.js` for client-side checks

### **Need to add new pipeline type?**
→ Use: `components/pipelines/core/PipelineCore.jsx` (generic grid)  
→ Configure: intervalType + cells structure  
→ Backend: POST to `/api/pipeline-github` or create new table

---

## 🎓 LEARNING PATH (For New Developer)

**If starting fresh**, follow this order:

1. **Auth Flow** (1 hour)
   - Read: `server-new/routes/auth.js` (understand login process)
   - Check: `pages/auth/LoginPage.jsx`, `RegisterPage.jsx`

2. **Review Creation** (2 hours)
   - Read: `pages/review/CreateFlowerReview/` (understand form + sections)
   - Backend: `server-new/routes/flower-reviews.js` (understand data structure)
   - DB: `server-new/prisma/schema.prisma` (tables: Review, FlowerReview, etc.)

3. **Export System** (2 hours)
   - Read: `components/shared/orchard/OrchardPanel.jsx` (main UI)
   - Stores: `orchardStore.js` (state patterns)
   - Templates: Pick one template file to understand rendering

4. **Account Tiers** (1 hour)
   - `server-new/routes/account.js` (tier definitions + endpoints)
   - `server-new/middleware/` (permission checking)
   - `hooks/useAccountType.js` (frontend tier detection)

5. **Pipelines** (1 hour)
   - `components/pipelines/core/PipelineCore.jsx` (generic grid UI)
   - Understand how cells store + update

**Total: ~7 hours** to understand core architecture

---

## ⚠️ THINGS TO WATCH OUT FOR

1. **ExportMaker vs OrchardPanel**: Two export systems! 
   - ExportMaker = OLD legacy system (~2100 lines)
   - OrchardPanel = NEW modern system (~850 lines)
   - Both used currently - consolidate on OrchardPanel

2. **Pipeline Systems**: 3 parallel systems  
   - Standardize on PipelineCore

3. **Auth**: Supports multiple providers
   - Make sure env vars for OAuth are set (DISCORD_CLIENT_ID, etc.)
   - Session strategy uses Passport.js

4. **Database**: SQLite (dev) / PostgreSQL (prod)
   - Check `.env` for `DATABASE_URL`
   - Run `npm run prisma:migrate` after schema changes

5. **Image uploads**:
   - Reviews: `/db/review_images/`
   - KYC docs: `/db/kyc_documents/`
   - Avatars: `/db/avatars/`
   - Make sure these directories exist

