# 🎯 Reviews-Maker MVP - Plan Technique Détaillé
**Version:** 1.0.0  
**Date:** 7 décembre 2025  
**Durée:** 8-12 semaines  

---

## 📋 Table des matières
1. [Vision & Périmètre](#vision--périmètre)
2. [Architecture Technique](#architecture-technique)
3. [Schéma de Données](#schéma-de-données)
4. [API Endpoints](#api-endpoints)
5. [Roadmap Sprint par Sprint](#roadmap-sprint-par-sprint)
6. [Critères d'Acceptation](#critères-dacceptation)
7. [Stack Technique](#stack-technique)

---

## 🎯 Vision & Périmètre

### Objectif MVP
Livrer une plateforme fonctionnelle permettant de :
- **Créer des reviews fiables** pour 4 familles (Weed, Hash, Concentrés, Comestibles)
- **Authentifier via OAuth** (Discord, Google, Apple, Amazon, Facebook)
- **Respecter la conformité légale** (RDR, âge, pays, RGPD)
- **Publier et filtrer** dans une galerie publique
- **Exporter simplement** (PNG/PDF) avec mode "Orchard" influenceur
- **Consulter ses stats** personnelles

### Inclus dans MVP
✅ Auth OAuth multi-providers + TOTP optionnel  
✅ Bandeau RDR permanent + vérification âge/pays  
✅ Éditeur reviews guidé (4 types) + médias  
✅ Galerie publique + filtres avancés  
✅ Profils publics + statistiques perso  
✅ Exports simples + mode Orchard influenceur  
✅ Modération basique (signalement, masquage)  
✅ I18n FR/EN complet  
✅ Abonnements Stripe (Consommateur gratuit, Producteur, Marchand, Influenceur)  

### Hors périmètre MVP
❌ Pipelines producteur (culture/extraction/JDB)  
❌ Mind-map phénotypes/généalogie avancée  
❌ Connecteur Shopify marchands  
❌ I18n ES/DE (phase 2)  
❌ Exports pro avancés (multi-pages, watermark sophistiqué)  

---

## 🏗️ Architecture Technique

### État Actuel (Analysé)
```
client/                     ← React 18 + Vite + TailwindCSS ✅
├── src/
│   ├── components/         ← Composants UI (Layout, Toast, ErrorBoundary)
│   ├── pages/              ← HomePage, CreateReview, Library, Stats, Settings
│   ├── hooks/              ← useAuth (Discord OAuth)
│   ├── store/              ← Zustand (user, theme)
│   ├── services/           ← API calls
│   └── App.jsx             ← Router React

server-new/                 ← Express + Prisma + SQLite ✅
├── routes/
│   ├── auth.js             ← Discord OAuth (Passport.js)
│   ├── reviews.js          ← CRUD reviews + likes
│   ├── users.js            ← Profils + stats
│   └── templates.js        ← Templates export
├── middleware/
│   └── auth.js             ← requireAuth, optionalAuth
├── config/
│   └── passport.js         ← Discord strategy
├── prisma/
│   └── schema.prisma       ← Models: User, Review, Session, ReviewLike, Template
└── server.js               ← Point d'entrée Express

db/
├── reviews.sqlite          ← Base SQLite
└── review_images/          ← Upload images
```

### Architecture Cible MVP
```
client/
├── src/
│   ├── components/
│   │   ├── auth/           ← OAuthButtons, AgeVerification, ConsentModal
│   │   ├── legal/          ← RDRBanner, LegalNotice
│   │   ├── reviews/        ← ReviewEditor, ReviewCard, FilterBar
│   │   ├── export/         ← ExportStudio, OrchardMode
│   │   └── moderation/     ← ReportModal, AdminPanel
│   ├── pages/
│   │   ├── auth/           ← Login, Signup, AgeVerification
│   │   ├── reviews/        ← Gallery, Detail, Create, Edit
│   │   ├── profile/        ← MyProfile, PublicProfile, Settings
│   │   └── admin/          ← Moderation, Audit, Reports
│   ├── i18n/               ← 🆕 FR/EN translations
│   ├── services/
│   │   ├── api.js          ← API client centralisé
│   │   └── stripe.js       ← 🆕 Stripe checkout
│   └── store/
│       ├── authStore.js    ← User, session, RBAC
│       ├── reviewStore.js  ← Reviews, filters, cache
│       └── uiStore.js      ← Theme, locale, modals

server-new/
├── routes/
│   ├── auth.js             ← 🔄 Multi-OAuth (Discord, Google, Apple, Amazon, FB) + TOTP
│   ├── reviews.js          ← ✅ Déjà robuste
│   ├── users.js            ← 🔄 + Subscription, preferences
│   ├── templates.js        ← 🔄 + Orchard presets
│   ├── subscriptions.js    ← 🆕 Stripe webhooks, gestion abonnements
│   ├── reports.js          ← 🆕 Signalements + modération
│   └── admin.js            ← 🆕 Audit logs, bannissements
├── middleware/
│   ├── auth.js             ← 🔄 + RBAC roles (consumer, influencer, producer, merchant, admin)
│   ├── legal.js            ← 🆕 Age/country verification
│   └── ratelimit.js        ← 🆕 Rate limiting
├── config/
│   ├── passport.js         ← 🔄 5 strategies OAuth
│   └── stripe.js           ← 🆕 Stripe config
├── prisma/
│   └── schema.prisma       ← 🔄 + Subscription, Report, AuditLog, ProducerProfile, InfluencerProfile
└── services/
    ├── email.js            ← 🆕 Notifications (Resend/SendGrid)
    └── cdn.js              ← 🆕 Image optimization (Sharp)
```

---

## 🗄️ Schéma de Données

### Modèles Existants (Prisma)
```prisma
✅ User (id, discordId, username, avatar, email, createdAt)
✅ Session (id, sid, userId, expiresAt)
✅ Review (holderName, type, ratings, terpenes, effects, images, authorId, isPublic)
✅ ReviewLike (reviewId, userId, isLike)
✅ Template (name, ownerId, config, thumbnail)
```

### Modèles à Ajouter pour MVP
```prisma
// 🆕 Abonnements Stripe
model Subscription {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  stripeCustomerId  String?  @unique
  stripeSubscriptionId String? @unique
  stripePriceId     String?
  
  plan              String   // "free", "influencer_basic", "influencer_pro", "producer", "merchant"
  status            String   // "active", "canceled", "past_due", "trialing"
  
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  cancelAtPeriodEnd  Boolean  @default(false)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([userId])
  @@index([stripeCustomerId])
  @@map("subscriptions")
}

// 🆕 Profils Influenceur
model InfluencerProfile {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  brandName     String?  // Nom de marque pour exports Orchard
  brandLogo     String?  // URL logo
  brandColors   String?  // JSON: {primary, secondary}
  
  isVerified    Boolean  @default(false) // Badge vérifié
  followerCount Int?     // Compteur followers (externe)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("influencer_profiles")
}

// 🆕 Profils Producteur (préparation phase 2)
model ProducerProfile {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  companyName   String
  siret         String?
  country       String
  
  isVerified    Boolean  @default(false)
  verificationDoc String? // URL doc vérifié
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("producer_profiles")
}

// 🆕 Signalements
model Report {
  id          String   @id @default(uuid())
  reviewId    String?  // Si signalement review
  userId      String?  // Si signalement user
  reporterId  String   // Qui signale
  
  review      Review?  @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reportedUser User?   @relation("ReportedUser", fields: [userId], references: [id], onDelete: Cascade)
  reporter    User     @relation("Reporter", fields: [reporterId], references: [id], onDelete: Cascade)
  
  reason      String   // "spam", "inappropriate", "copyright", "illegal"
  details     String?  // Détails texte
  status      String   @default("pending") // "pending", "reviewed", "resolved", "dismissed"
  
  moderatedBy String?  // ID admin qui a traité
  moderatedAt DateTime?
  moderationNote String?
  
  createdAt   DateTime @default(now())
  
  @@index([reviewId])
  @@index([userId])
  @@index([reporterId])
  @@index([status])
  @@map("reports")
}

// 🆕 Journal d'audit
model AuditLog {
  id          String   @id @default(uuid())
  userId      String?  // ID de l'acteur (null si système)
  action      String   // "review.delete", "user.ban", "report.resolve"
  entityType  String?  // "review", "user", "report"
  entityId    String?  // ID de l'entité concernée
  
  metadata    String?  // JSON: détails action
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}

// 🔄 Modifier User pour ajouter champs légaux et rôles
model User {
  // ... champs existants
  
  // 🆕 OAuth multi-providers
  googleId      String?  @unique
  appleId       String?  @unique
  amazonId      String?  @unique
  facebookId    String?  @unique
  
  // 🆕 Email backup + TOTP
  emailBackup   String?
  totpSecret    String?  // Si TOTP activé
  totpEnabled   Boolean  @default(false)
  
  // 🆕 Légal & conformité
  birthdate     DateTime?
  country       String?  // Code ISO (FR, US, CA...)
  region        String?  // État/Province si pertinent
  legalAge      Boolean  @default(false) // Âge légal validé
  consentRDR    Boolean  @default(false) // Consentement bandeau RDR
  consentDate   DateTime?
  
  // 🆕 Rôles & permissions
  roles         String   @default("consumer") // JSON: ["consumer", "influencer", "producer", "merchant", "admin"]
  isBanned      Boolean  @default(false)
  bannedAt      DateTime?
  banReason     String?
  
  // 🆕 Préférences
  locale        String   @default("fr") // "fr", "en"
  theme         String   @default("violet-lean")
  defaultExportTemplate String? // ID template par défaut
  
  // Relations nouvelles
  subscription  Subscription?
  influencerProfile InfluencerProfile?
  producerProfile   ProducerProfile?
  
  reportsSubmitted Report[] @relation("Reporter")
  reportsReceived  Report[] @relation("ReportedUser")
}
```

---

## 🌐 API Endpoints

### Auth & Utilisateurs

#### OAuth Multi-Providers
```
GET  /api/auth/discord
GET  /api/auth/discord/callback
GET  /api/auth/google             🆕
GET  /api/auth/google/callback    🆕
GET  /api/auth/apple              🆕
GET  /api/auth/apple/callback     🆕
GET  /api/auth/amazon             🆕
GET  /api/auth/amazon/callback    🆕
GET  /api/auth/facebook           🆕
GET  /api/auth/facebook/callback  🆕

POST /api/auth/email/request-code 🆕 Demande code 6 chiffres
POST /api/auth/email/verify-code  🆕 Connexion email backup
POST /api/auth/totp/setup         🆕 Activer TOTP
POST /api/auth/totp/verify        🆕 Vérifier code TOTP
POST /api/auth/logout             ✅
GET  /api/auth/me                 ✅
```

#### Profils & Paramètres
```
GET    /api/users/me              ✅
PATCH  /api/users/me              🔄 + birthdate, country, locale, theme
GET    /api/users/me/stats        ✅
GET    /api/users/me/reviews      ✅
DELETE /api/users/me              🆕 Suppression RGPD
GET    /api/users/me/data-export  🆕 Export RGPD (JSON)

GET    /api/users/:id/profile     ✅
GET    /api/users/:id/reviews     ✅
```

#### Légal & Conformité
```
POST /api/legal/verify-age        🆕 Vérifier âge légal
POST /api/legal/consent-rdr       🆕 Enregistrer consentement RDR
GET  /api/legal/countries         🆕 Liste pays autorisés
GET  /api/legal/notice/:country   🆕 Mentions légales par pays
```

### Reviews (Déjà robuste ✅)
```
GET    /api/reviews               ✅ Filtres: type, search, effects, intensity, tags, sort
GET    /api/reviews/:id           ✅
POST   /api/reviews               ✅ multipart/form-data + auth
PUT    /api/reviews/:id           ✅ ownership requis
DELETE /api/reviews/:id           ✅
PATCH  /api/reviews/:id/visibility ✅

POST   /api/reviews/:id/like      ✅
POST   /api/reviews/:id/dislike   ✅
GET    /api/reviews/:id/likes     ✅
```

### Exports & Templates
```
GET  /api/templates               ✅ Liste templates (publics + user)
GET  /api/templates/:id           ✅
POST /api/templates               ✅ Créer template custom
PUT  /api/templates/:id           ✅
DELETE /api/templates/:id         ✅
POST /api/templates/:id/copy      ✅ Dupliquer
POST /api/templates/:id/export    ✅ Export PNG/PDF

GET  /api/templates/orchard-presets 🆕 Presets influenceur
POST /api/reviews/:id/export      🆕 Export review (template + format)
```

### Abonnements Stripe
```
GET  /api/subscriptions/plans     🆕 Liste plans disponibles
POST /api/subscriptions/checkout  🆕 Créer session Stripe
GET  /api/subscriptions/portal    🆕 URL portail Stripe
POST /api/subscriptions/webhook   🆕 Webhook Stripe events
GET  /api/subscriptions/me        🆕 Mon abonnement actuel
POST /api/subscriptions/cancel    🆕 Annuler abonnement
```

### Modération & Admin
```
POST /api/reports                 🆕 Créer signalement (auth requis)
GET  /api/reports                 🆕 Liste signalements (admin only)
PATCH /api/reports/:id            🆕 Traiter signalement (admin)

POST /api/admin/users/:id/ban     🆕 Bannir utilisateur
POST /api/admin/users/:id/unban   🆕 Débannir
DELETE /api/admin/reviews/:id     🆕 Supprimer review (force)
DELETE /api/admin/media/:id       🆕 Supprimer média

GET  /api/admin/audit-logs        🆕 Journal audit (pagination)
GET  /api/admin/stats             🆕 Stats plateforme (users, reviews, reports)
```

---

## 📅 Roadmap Sprint par Sprint (8-12 semaines)

### 🟢 Sprint 1-2 : Auth + Légal (S1-2)
**Durée:** 2 semaines  
**Objectif:** OAuth multi-providers + bandeau RDR + vérification âge/pays

#### Tâches Backend
- [ ] Ajouter strategies Passport (Google, Apple, Amazon, Facebook)
- [ ] Implémenter auth email backup (code 6 chiffres)
- [ ] Intégrer TOTP optionnel (speakeasy ou otpauth)
- [ ] Créer middleware `legal.js` (vérification âge/pays)
- [ ] Migrer schéma Prisma : ajouter champs User (googleId, appleId, birthdate, country, consentRDR, roles)
- [ ] Créer routes `/api/legal/*` (verify-age, consent-rdr, countries)
- [ ] Ajouter ratelimiting (express-rate-limit)

#### Tâches Frontend
- [ ] Créer composant `AgeVerificationModal` (date naissance + pays)
- [ ] Créer composant `RDRBanner` permanent (sticky top)
- [ ] Créer composant `ConsentModal` (checkbox + politique)
- [ ] Créer page `/auth/signup` (choix OAuth ou email)
- [ ] Intégrer boutons OAuth (Discord, Google, Apple, Amazon, Facebook)
- [ ] Créer composant `TOTPSetup` dans settings
- [ ] Ajouter i18n basique (react-i18next) pour FR/EN

#### Livrables
✅ Auth multi-providers fonctionnelle  
✅ Bandeau RDR affiché et persistant  
✅ Vérification âge/pays obligatoire à l'inscription  
✅ TOTP activable en settings  

---

### 🟡 Sprint 3-4 : Éditeur Reviews + Médias (S3-4)
**Durée:** 2 semaines  
**Objectif:** Éditeur guidé 4 types + presets mobile + autosave

#### Tâches Backend
- [ ] Valider schéma Review existant (OK, déjà complet)
- [ ] Ajouter compression images (Sharp) + CDN logic
- [ ] Implémenter quotas upload par rôle (consumer: 5 images, influencer: 10, producer: 20)
- [ ] Ajouter endpoint brouillon `/api/reviews/drafts` (isPublic=false)
- [ ] Implémenter autosave toutes les 30s (PATCH sans validation complète)

#### Tâches Frontend
- [ ] Refactoriser `CreateReviewPage.jsx` en composants modulaires
- [ ] Créer `ReviewTypeSelector` (4 tuiles : Weed, Hash, Concentré, Comestible)
- [ ] Créer formulaires guidés par type (sections collapsibles)
- [ ] Créer composant `ImageUploader` avec drag&drop + preview
- [ ] Créer `PresetsModal` (presets prédéfinis pour mobile)
- [ ] Implémenter autosave (debounce 30s + indicateur "Sauvegardé")
- [ ] Ajouter validation étape par étape (stepper)
- [ ] Créer `ReviewPreview` (aperçu temps réel)

#### Livrables
✅ Création review guidée (4 types)  
✅ Upload médias avec compression  
✅ Autosave brouillon fonctionnel  
✅ Presets rapides mobile  

---

### 🔵 Sprint 5-6 : Exports + Galerie + Filtres (S5-6)
**Durée:** 2 semaines  
**Objectif:** Templates export + mode Orchard + galerie publique filtrée

#### Tâches Backend
- [ ] Créer presets Orchard (JSON templates influenceur)
- [ ] Implémenter génération PNG (html-to-image via Puppeteer ou Sharp)
- [ ] Implémenter génération PDF (PDFKit ou jsPDF côté serveur)
- [ ] Ajouter filigrane pour mode Orchard (logo + brand)
- [ ] Optimiser endpoint `/api/reviews` (index DB, pagination efficace)
- [ ] Ajouter filtres avancés (effets, intensité, notes min/max, tags)

#### Tâches Frontend
- [ ] Refactoriser `ExportStudio` (modal templates)
- [ ] Créer `OrchardModeToggle` (switch influenceur)
- [ ] Créer `TemplateCustomizer` (palette, logo, champs visibles)
- [ ] Créer `ExportPreview` (iframe live)
- [ ] Téléchargement direct (PNG/PDF)
- [ ] Refactoriser `HomePage.jsx` (galerie cards responsive)
- [ ] Créer `FilterBar` (type, effets, intensité, notes, tags, date)
- [ ] Créer `SearchInput` (debounce 300ms)
- [ ] Ajouter pagination infinie (Intersection Observer)
- [ ] Créer pages profil publiques `/users/:id`

#### Livrables
✅ Exports PNG/PDF personnalisables  
✅ Mode Orchard influenceur activable  
✅ Galerie publique avec filtres avancés  
✅ Profils publics avec liste reviews  

---

### 🟣 Sprint 7-8 : Stats + Modération + I18n (S7-8)
**Durée:** 2 semaines  
**Objectif:** Stats perso + modération basique + FR/EN complet

#### Tâches Backend
- [ ] Migrer schéma : ajouter models Report, AuditLog
- [ ] Créer routes `/api/reports/*`
- [ ] Créer routes `/api/admin/*` (ban, audit, delete)
- [ ] Implémenter journal audit (middleware qui log actions critiques)
- [ ] Enrichir endpoint `/api/users/me/stats` (top effets, tags, activité par mois)
- [ ] Créer endpoint `/api/users/me/data-export` (RGPD)
- [ ] Créer endpoint `DELETE /api/users/me` (suppression compte)

#### Tâches Frontend
- [ ] Créer page `StatsPage` (graphiques Chart.js ou Recharts)
- [ ] Afficher top 5 tags/effets, activité mensuelle, moyenne notes
- [ ] Créer `ReportModal` (formulaire signalement)
- [ ] Créer page `/admin/moderation` (liste reports + actions)
- [ ] Créer `AdminPanel` (stats plateforme, audit logs)
- [ ] Finaliser i18n FR/EN (externaliser toutes chaînes)
- [ ] Créer `LanguageSwitcher` (dropdown EN/FR)
- [ ] Traduire erreurs API + validations

#### Livrables
✅ Statistiques personnelles avancées  
✅ Système de signalement fonctionnel  
✅ Panel admin modération  
✅ I18n FR/EN complet  
✅ Export/suppression données RGPD  

---

### 🟠 Sprint 9-12 : Stripe + RBAC + Hardening (S9-12)
**Durée:** 4 semaines  
**Objectif:** Abonnements Stripe + RBAC complet + perf + sécurité

#### Tâches Backend
- [ ] Migrer schéma : ajouter models Subscription, InfluencerProfile, ProducerProfile
- [ ] Configurer Stripe (webhooks, plans, prices)
- [ ] Créer routes `/api/subscriptions/*`
- [ ] Implémenter webhook Stripe (invoice.paid, subscription.deleted)
- [ ] Ajouter middleware RBAC (vérifier roles dans JWT/session)
- [ ] Limiter fonctionnalités par plan (quotas, Orchard mode, etc.)
- [ ] Implémenter CSP headers (helmet.js)
- [ ] Ajouter protection CSRF (csurf)
- [ ] Configurer logs structurés (Winston ou Pino)
- [ ] Ajouter monitoring (Sentry pour erreurs)
- [ ] Optimiser queries Prisma (include, select)
- [ ] Ajouter cache Redis optionnel (sessions, compteurs)
- [ ] Tests de charge (autocannon ou k6)

#### Tâches Frontend
- [ ] Créer page `/settings/subscription` (plan actuel, upgrade/downgrade)
- [ ] Intégrer Stripe Checkout (redirect)
- [ ] Créer bouton "Upgrade to Orchard" (influenceurs)
- [ ] Créer page `/settings/billing` (historique factures)
- [ ] Afficher badges rôles (Influenceur vérifié, Producteur)
- [ ] Implémenter gestion erreurs globale (ErrorBoundary + Sentry)
- [ ] Optimiser bundle (code splitting, lazy loading)
- [ ] Ajouter tests E2E (Playwright ou Cypress) sur flows critiques
- [ ] Tests accessibilité (WCAG 2.1 AA, axe-core)
- [ ] Créer page `/onboarding` (guide premier lancement)

#### Livrables
✅ Abonnements Stripe fonctionnels (4 plans)  
✅ RBAC complet (consumer, influencer, producer, merchant, admin)  
✅ CSP + CSRF + logs structurés  
✅ Monitoring erreurs (Sentry)  
✅ Tests E2E sur flows critiques  
✅ Accessibilité WCAG 2.1 AA  
✅ Onboarding guidé  

---

## ✅ Critères d'Acceptation MVP

### Fonctionnels
- [ ] **Auth OAuth opérationnelle** : 5 providers (Discord, Google, Apple, Amazon, Facebook) + email backup + TOTP
- [ ] **Contrôle légal** : Vérification âge/pays + consentement RDR + bandeau permanent
- [ ] **Création reviews** : 4 types (Weed, Hash, Concentré, Comestible) avec formulaires guidés + médias + autosave
- [ ] **Exports** : PNG/PDF à partir de templates + mode Orchard influenceur
- [ ] **Galerie publique** : Recherche + 5 filtres (type, effets, intensité, notes, tags) + pagination
- [ ] **Profils publics** : Affichage reviews + stats (moyenne, total, badges)
- [ ] **Stats perso** : Total reviews, moyenne, top 5 tags/effets, activité mensuelle, export CSV
- [ ] **Modération** : Signalement + masquage + suppression + bannissement
- [ ] **I18n** : FR/EN complet (toutes chaînes externalisées)
- [ ] **Abonnements** : 4 plans Stripe + upgrade/downgrade + webhooks

### Techniques
- [ ] **Disponibilité** : ≥ 99.5% uptime sur 1 mois beta
- [ ] **Latence** : < 300ms p95 pour pages clés (liste reviews, détail)
- [ ] **Sécurité** : CSP, CSRF, XSS, ratelimiting, secrets chiffrés
- [ ] **RGPD** : Export données, suppression compte, rétention documentée
- [ ] **Accessibilité** : WCAG 2.1 AA (formulaires, navigation clavier)
- [ ] **Observabilité** : Logs structurés, métriques (API, erreurs), Sentry
- [ ] **Tests** : E2E sur flows critiques (auth, création review, export)

---

## 🛠️ Stack Technique

### Frontend
- **Framework** : React 18.3
- **Build** : Vite 6.0
- **Routing** : React Router 6.28
- **State** : Zustand 5.0
- **Styling** : TailwindCSS 3.4
- **Animation** : Framer Motion 11.11
- **Forms** : React Hook Form + Zod
- **I18n** : react-i18next
- **Charts** : Recharts ou Chart.js
- **Tests** : Vitest + Testing Library + Playwright
- **Payments** : @stripe/stripe-js

### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express 4.18
- **ORM** : Prisma 5.7
- **Database** : SQLite (MVP), PostgreSQL (prod)
- **Auth** : Passport.js (Discord, Google, Apple, Amazon, Facebook)
- **Sessions** : express-session + connect-sqlite3
- **Uploads** : Multer 1.4
- **Images** : Sharp (compression/resize)
- **Emails** : Nodemailer + Resend/SendGrid
- **Payments** : Stripe SDK
- **Security** : helmet, csurf, express-rate-limit
- **Logs** : Winston ou Pino
- **Monitoring** : Sentry
- **Tests** : Vitest + Supertest

### Infra & Déploiement
- **Hosting** : VPS (OVH/Hetzner) + Nginx reverse proxy
- **Process** : PM2 ou systemd
- **CI/CD** : GitHub Actions
- **CDN** : Cloudflare (images)
- **Backup** : Cron SQLite daily + S3/Spaces
- **SSL** : Let's Encrypt (Certbot)
- **Monitoring** : Uptime Robot + Sentry

---

## 📊 Indicateurs de Succès

### KPIs MVP (Beta 1 mois)
- **Uptime** : ≥ 99.5%
- **Latence p95** : < 300ms pages clés
- **Taux conversion signup** : > 40%
- **Taux complétion review** : > 60%
- **Taux export** : > 30% des reviews créées
- **Taux signalement traité** : 100% sous 48h
- **Score accessibilité** : > 90 (Lighthouse)

### Prochaines Phases (Post-MVP)
- **Phase 2** : Pipelines producteur (culture, extraction, JDB)
- **Phase 3** : Connecteur Shopify marchands
- **Phase 4** : Mind-map phénotypes/généalogie
- **Phase 5** : I18n ES/DE + exports pro avancés

---

## 📞 Support & Documentation

### Documentation Livrée
- [x] API OpenAPI spec (Swagger UI)
- [ ] Guide admin/modération (PDF)
- [ ] Politique RGPD (mentions légales par pays)
- [ ] Playbook incidents (runbook)
- [ ] Guide développeur (architecture, conventions)

### Formation
- [ ] Session admin (modération, audit)
- [ ] Session producteur (pipelines - Phase 2)
- [ ] FAQ utilisateurs (base connaissances)

---

**Date de mise à jour** : 7 décembre 2025  
**Responsable technique** : [À définir]  
**Prochaine révision** : Fin Sprint 2 (S2)
