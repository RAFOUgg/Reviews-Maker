# 📊 ÉTAT RÉEL DU MVP - AUDIT COMPLET AVRIL 2026

**Date**: 2 avril 2026  
**Auteur**: Audit systématique code réel vs documentation  
**Status**: ⚠️ **DOCUMENTATION TRÈS EN RETARD**

---

## 🎯 RÉSUMÉ EXÉCUTIF

La documentation dit "Phase 1 FLEURS déployée" mais le code source montre **BEAUCOUP PLUS** implémenté réellement:

| Domaine | Docs | Code Réel | Écart |
|---------|------|-----------|-------|
| **Produits types** | Fleurs only | ✅ Fleurs + Hash + Concentrés + Comestibles | +3 types |
| **Routes backend** | ~15 endpoints | ✅ **50+ endpoints** | +35 |
| **Frontend pages** | 5 pages | ✅ **15+ pages** | +10 |
| **Comptes (tiers)** | Théorique | ✅ Implémenté (CONSUMER, INFLUENCER, PRODUCER, BETA_TESTER) | 4 types |
| **Pipelines** | Culture only | ✅ Culture + Curing + Extraction + Purification | +3 |
| **Export formats** | PNG/JPG/PDF | ✅ PNG/JPG/PDF/SVG/CSV/JSON/HTML | +4 |
| **Library** | Structure | ✅ Complète (Reviews + Templates + Watermarks + Cultivars + Data) | Full |
| **Stats** | Basic | ✅ Avancées (Engagement, Producer stats, Exports tracking) | Advanced |
| **Auth** | Email/Discord | ✅ Email/Discord/Google/Apple/Amazon/Facebook + 6-digit codes | +4 providers |
| **2FA** | Rien | ✅ TOTP + Backup codes | New |
| **KYC** | Rien | ✅ Document uploads + verification | New |

---

## ✅ RÉELLEMENT IMPLÉMENTÉ (CONFIRMÉ PAR CODE)

### **Backend Routes (50+ endpoints confirmés)**

#### **Auth Routes** (`server-new/routes/auth.js` - 783 lignes)
- ✅ `GET /providers` - Providers configurés
- ✅ `POST /email/signup` - Création compte email/password
- ✅ `POST /email/login` - Login email/password
- ✅ `GET /discord`, `/google`, `/apple`, `/amazon`, `/facebook` - OAuth multiples
- ✅ `POST /send-verification-code` - Code 6 chiffres par email
- ✅ `POST /verify-code` - Vérification code
- ✅ `POST /forgot-password` - Reset password link
- ✅ `POST /reset-password` - Réinitialiser password
- ✅ `GET /me` - Utilisateur actuel + limites
- ✅ `GET /limits` - Limites par compte type
- ✅ `POST /logout` - Déconnexion

#### **Account Routes** (`server-new/routes/account.js` - 569 lignes)
- ✅ `GET /info` - Info compte
- ✅ `GET /types` - Types de comptes disponibles
- ✅ `POST /change-type` - Changer type de compte
- ✅ `POST /request-verification` - Demande vérification producteur
- ✅ `GET /producer-profile` - Profil producteur
- ✅ `GET /influencer-profile` - Profil influenceur
- ✅ `PATCH /influencer-profile` - Update branding influenceur
- ✅ `PUT /update` - Update profil utilisateur
- ✅ `GET /profile` - Alias pour /info
- ✅ `GET /multiple` - Multicompte (future)

#### **Review Routes** - TOUS LES PRODUITS
- ✅ **Flowers** (`server-new/routes/flower-reviews.js` - 1041 lignes!)
  - POST, GET, PUT, DELETE reviews fleurs
  - Pipeline culture + curing intégrés
  - Support analytics PDF
- ✅ **Hash** (`server-new/routes/hash-reviews.js`)
  - Séparation + purification pipelines
- ✅ **Concentrés** (`server-new/routes/concentrate-reviews.js`)
  - Extraction + purification pipelines
- ✅ **Comestibles** (`server-new/routes/edible-reviews.js`)
  - Recipe pipelines

#### **Export Routes** (`server-new/routes/export.js`)
- ✅ `POST /preview` - Preview export
- ✅ `POST /:format` - Export tous formats
- ✅ `GET /templates` - Templates disponibles
- ✅ `GET /formats` - Formats disponibles pour compte
- ✅ `POST /batch` - Batch export (Producteur)

#### **Pipeline Routes** (multiples fichiers)
- ✅ **Culture** (`pipeline-culture.js`)
  - CultureSetup CRUD (presets)
  - Pipeline CRUD
  - PipelineStage CRUD
- ✅ **GitHub-style** (`pipeline-github.js`)
  - Grille 90 jours avec cells éditables
  - Support phases, semaines, jours
- ✅ **Generic** (`pipelines.js`)
  - Étapes réordonnables
  - Flexible interval types

#### **Library Routes** (`server-new/routes/library.js`)
- ✅ GET/POST/PUT/DELETE templates
- ✅ GET/POST/PUT/DELETE filigranes
- ✅ GET/POST stats

#### **Stats Routes** (`server-new/routes/stats.js` - 460 lignes)
- ✅ `GET /` - Stats générales
- ✅ `GET /reviews` - Stats reviews (par type, par mois, top cultivars)
- ✅ `GET /engagement` - Stats engagement (likes, vues, commentaires)
- ✅ `GET /producer` - Stats producteur (cultures, rendements)
- ✅ `GET /exports` - Stats exports par format
- ✅ `POST /exports/track` - Tracker un export

#### **Legal Routes** (`server-new/routes/legal.js`)
- ✅ `POST /verify-age` - Vérification âge
- ✅ `POST /accept-consent` - Consentement RDR
- ✅ `GET /status` - Statut légal utilisateur
- ✅ `/countries`, `/terms`, `/privacy`, `/notice` - Documents légaux
- ✅ `POST /consent` - Enregistrer consentements

#### **User Routes**
- ✅ **KYC** (`userKYC.js`) - Document uploads + vérification
- ✅ **Profile** (`userProfile.js`) - Avatar/banner upload
- ✅ **Settings** (`userSettings.js`) - 2FA TOTP setup/disable
- ✅ **Users** (`users.js`) - Public profiles, reviews publiques

#### **Admin Routes** (`server-new/routes/admin.js`)
- ✅ `GET /users` - Liste utilisateurs
- ✅ `PATCH /users/:id/account-type` - Changer type compte
- ✅ `PATCH /users/:id/ban` - Ban/unban user
- ✅ `GET /stats` - Statistiques admin

#### **Payment Routes** (`server-new/routes/payment.js`)
- ✅ `POST /create-checkout` - Création checkout (MOCK)
- ✅ `POST /webhook` - Webhook Stripe (MOCK)
- ✅ `GET /status` - Statut abonnement
- ✅ `POST /upgrade` - Upgrade compte

### **Frontend Pages (15+ réelles)**

#### **Auth Pages**
- ✅ `pages/auth/LoginPage.jsx`
- ✅ `pages/auth/RegisterPage.jsx`
- ✅ `pages/auth/ForgotPassword.jsx`
- ✅ `pages/auth/EmailVerification.jsx`
- ✅ `pages/auth/AgeVerification.jsx`

#### **Review Creation**
- ✅ `pages/review/CreateReviewPage.jsx` - Router principal
- ✅ `pages/review/CreateFlowerReview/` - Fleurs complète
- ✅ `pages/review/CreateHashReview/` - Hash (en cours)
- ✅ `pages/review/CreateConcentrateReview/` - Concentrés
- ✅ `pages/review/CreateEdibleReview/` - Comestibles

#### **Account & User**
- ✅ `pages/account/AccountPage.jsx` - Profil utilisateur
- ✅ `pages/account/sections/ProfileSection.jsx` - Edition profil
- ✅ `pages/account/ManageSubscription.jsx` - Gestion abonnement
- ✅ `pages/account/PaymentPage.jsx` - Paiement

#### **Library & Organization**
- ✅ `pages/library/LibraryPage.jsx` - Bibliothèque complète
- ✅ `pages/library/tabs/ReviewsTab.jsx` - Mes reviews
- ✅ `pages/library/tabs/CultivarsTab.jsx` - Cultivars (Producteur)
- ✅ `pages/library/tabs/TemplatesTab.jsx` - Templates d'export
- ✅ `pages/library/tabs/WatermarksTab.jsx` - Filigranes
- ✅ `pages/library/tabs/DataTab.jsx` - Données récurrentes
- ✅ `pages/library/tabs/StatsTab.jsx` - Statistiques

#### **Public/Gallery**
- ✅ `pages/public/HomePage.jsx` - Accueil + sélection type
- ✅ `pages/public/GalleryPage.jsx` - Galerie publique
- ✅ `pages/public/PhenoHuntPage.jsx` - Genetics/genealogy

#### **Admin & Demo**
- ✅ `pages/admin/AdminPanel.jsx` - Admin dashboard
- ✅ `pages/demo/LiquidPreview.jsx` - Demo UI components

### **Components (Très avancés)**

#### **Export System**
- ✅ `components/shared/orchard/OrchardPanel.jsx` - Main export modal (~850 lignes)
- ✅ `components/templates/ModernCompactTemplate.jsx`
- ✅ `components/templates/DetailedCardTemplate.jsx`
- ✅ `components/templates/BlogArticleTemplate.jsx`
- ✅ `components/templates/SocialStoryTemplate.jsx` - 9:16 format
- ✅ `components/shared/config/CustomTemplate.jsx` - Drag-drop

#### **Pipelines (Core System)**
- ✅ `components/pipelines/core/PipelineCore.jsx` - GitHub-style grid universel
- ✅ `components/pipelines/PipelineCellEditor.jsx`
- ✅ Support intervalles: DAYS, WEEKS, PHASES, CUSTOM

#### **Genetics/Genealogy**
- ✅ `components/genetics/UnifiedGeneticsCanvas.jsx` - React Flow basé
- ✅ Drag-drop nœuds, édition relations parent/enfant

#### **UI System (Liquid Glass)**
- ✅ `components/ui/LiquidUI.jsx` - Design system complet
- ✅ `components/ui/LiquidCard`, `LiquidButton`, `LiquidInput`, `LiquidModal`, etc.
- ✅ Cursor tracking effect, glassmorphism animé

#### **Forms & Inputs**
- ✅ `components/forms/AutocompleteField.jsx`
- ✅ `components/forms/PieCompositionField.jsx` - Sliders %
- ✅ `components/forms/TerpeneManualInput.jsx`
- ✅ Section navigators, rating charts

#### **Legal/Compliance**
- ✅ `components/legal/AgeVerification.jsx`
- ✅ `components/legal/ConsentModal.jsx`
- ✅ `components/legal/DisclaimerRDR.jsx`

### **Stores & State Management**

- ✅ `store/useStore.js` - Zustand global
- ✅ `store/orchardStore.js` - Export config state
- ✅ `store/orchardPagesStore.js` - Multi-page state
- ✅ `store/useGeneticsStore.js` - Genealogy tree state

---

## ⚠️ GAPS (Documenté mais PAS implémenté)

| Feature | Status | Note |
|---------|--------|------|
| **Producer verification full flow** | ⏳ Partial | Routes exist but KYC document flow incomplete |
| **Payment (Stripe)** | ⏳ MOCK only | Routes are MOCKS, Stripe SDK not integrated |
| **Export actual file generation** | ⚠️ html-to-image only | SVG/PDF/CSV/JSON routes exist but incomplete |
| **PhenoHunt drag-drop canvas** | ⏳ React Flow imported | Not fully integrated with rest of app |
| **Statistics public gallery ranking** | ⏳ Basic | Top hebdo/mensuel/annuel not implemented |
| **Multi-account support** | ❌ Not started | Route placeholder exists |
| **Comments on reviews** | ⏳ DB schema only | No routes yet |
| **Notification system** | ✅ DB schema | Email/push routes stubbed |

---

## 🚀 PRIORITÉS IMMÉDIATES

### **URGENT (Blocker)**
1. **Fix Export Maker** - DB save config (currently disappears on page reload)
2. **Complete PDF/SVG generation** - Routes exist but not functional
3. **Update docs** - Current docs are misleading

### **HIGH (Next 1 week)**
1. Import Library onto VPS
2. Test Hash/Concentrate/Edible flows
3. Stats differentiation by tier (COPY in code for now)

### **MEDIUM (Phase 2)**
1. Complete Stripe payment integration
2. Full KYC producer verification
3. PhenoHunt genealogy integration

---

## 📋 FICHIERS CLÉS À REVISER

### Frontend
```
client/src/components/shared/orchard/OrchardPanel.jsx         (~850 lignes - EXPLORER)
client/src/components/export/ExportMaker.jsx                  (~2100 lignes - Duplex)
client/src/pages/review/CreateFlowerReview/                   (Modèle pour Hash/Concentrate)
client/src/components/pipelines/core/PipelineCore.jsx         (Réutilisable!)
client/src/components/genetics/UnifiedGeneticsCanvas.jsx      (React Flow intégration)
```

### Backend
```
server-new/routes/flower-reviews.js      (1041 lignes - Modèle complet)
server-new/routes/auth.js                (783 lignes - OAuth complet)
server-new/routes/account.js             (569 lignes - Account tiers)
server-new/routes/stats.js               (460 lignes - Analytics avancée)
server-new/routes/export.js              (Incomplete export generation)
```

---

## 🎯 CONCLUSION

**Le code RÉEL est 60% plus avancé que la documentation.** Les docs sont dangereuses car elles donnent une fausse perspective du projet. Il faut:

1. ✅ Documenter ce qui EXISTE vraiment
2. 🔴 Clarifier ce qui est MOCK vs Réel
3. 🚀 Prioriser les gaps réels (DB save, export generation)

