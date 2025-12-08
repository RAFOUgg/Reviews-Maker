# 🌿 Reviews-Maker MVP - README Complet

![Version](https://img.shields.io/badge/version-2.0.0--MVP-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.3-61dafb)

**Plateforme moderne de création et gestion de reviews de cannabis avec authentification multi-providers, conformité légale RDR et système d'abonnements.**

---

## 📑 Table des Matières

- [Vision du Projet](#-vision-du-projet)
- [Fonctionnalités MVP](#-fonctionnalités-mvp)
- [Architecture](#-architecture)
- [Installation Rapide](#-installation-rapide)
- [Configuration](#-configuration)
- [Documentation](#-documentation)
- [Développement](#-développement)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)
- [Roadmap](#-roadmap)
- [Support](#-support)

---

## 🎯 Vision du Projet

Reviews-Maker est une plateforme complète permettant aux consommateurs, influenceurs et producteurs de cannabis de créer des reviews détaillées, fiables et conformes aux réglementations locales.

### Objectifs MVP
- ✅ **Authentification universelle** : OAuth multi-providers (Discord, Google, Apple, Amazon, Facebook)
- ✅ **Conformité légale** : Bandeau RDR, vérification âge/pays, RGPD
- ✅ **Création reviews** : 4 types (Weed, Hash, Concentrés, Comestibles)
- ✅ **Galerie publique** : Filtres avancés, recherche, profils publics
- ✅ **Exports professionnels** : Templates personnalisables + mode Orchard influenceur
- ✅ **Monétisation** : 4 plans Stripe (Gratuit, Influenceur Basic/Pro, Producteur, Marchand)
- ✅ **Modération** : Signalements, bannissements, audit trail
- ✅ **International** : FR/EN complet (ES/DE phase 2)

---

## 🚀 Fonctionnalités MVP

### Authentification & Sécurité
- **5 providers OAuth** : Discord, Google, Apple, Amazon, Facebook
- **Email backup** : Code 6 chiffres pour connexion alternative
- **TOTP 2FA** : Authentification à deux facteurs optionnelle
- **Sessions sécurisées** : 7 jours, cookies httpOnly
- **Rate limiting** : Protection contre brute-force
- **CSP + CSRF** : Protection XSS et CSRF

### Conformité Légale
- **Bandeau RDR** : Affiché en permanence (sticky)
- **Vérification âge** : 18 ou 21 ans selon pays
- **Vérification pays** : Liste pays autorisés configurable
- **Consentement explicite** : Modal acceptation politique
- **RGPD** : Export et suppression données personnelles
- **Mentions légales** : Par pays (FR, US, CA, DE, ES...)

### Création de Reviews
- **4 familles** : Weed (fleur), Hash, Concentrés, Comestibles
- **Formulaires guidés** : Sections collapsibles par étape
- **Upload médias** : 5-20 images selon plan (compression auto)
- **Autosave** : Sauvegarde brouillon toutes les 30s
- **Presets mobiles** : Modèles pré-remplis pour accélérer création
- **150+ champs** : Terpènes, effets, pipelines, recettes...

### Galerie & Recherche
- **Filtres avancés** : Type, effets, intensité, notes, tags, date
- **Recherche texte** : Nom variété, cultivar, breeder
- **Pagination infinie** : Scroll progressif
- **Profils publics** : Affichage reviews + stats utilisateur
- **Likes/Dislikes** : Système de réactions

### Exports & Templates
- **Formats** : PNG, PDF
- **Templates personnalisables** : Logo, palette, champs visibles
- **Mode Orchard** : Branding influenceur (logo, couleurs, filigrane)
- **Presets** : Bibliothèque templates communautaires

### Statistiques Personnelles
- **Total reviews** : Compteur global
- **Moyenne notes** : Par type de produit
- **Top 5 tags/effets** : Les plus utilisés
- **Activité mensuelle** : Graphique évolution
- **Export CSV** : Données brutes

### Modération & Admin
- **Signalements** : Review ou utilisateur (spam, inappropriate, illegal)
- **Panel admin** : Liste signalements, actions (masquer, supprimer, bannir)
- **Audit trail** : Journal toutes actions critiques
- **Bannissement** : Temporaire ou permanent avec raison

### Abonnements Stripe
- **Consommateur** : Gratuit (5 images/review, exports basiques)
- **Influenceur Basic** : 7.99€/mois (10 images, mode Orchard, presets)
- **Influenceur Pro** : 15.99€/mois (20 images, branding avancé)
- **Producteur** : 29.99€/mois (pipelines culture, JDB - phase 2)
- **Marchand** : 25.99€/mois (connecteur Shopify - phase 2)

---

## 🏗️ Architecture

### Stack Technique

#### Frontend
```
React 18.3          → Framework UI
Vite 6.0            → Build ultra-rapide
React Router 6.28   → Routing SPA
Zustand 5.0         → State management
TailwindCSS 3.4     → Styling utility-first
Framer Motion 11.11 → Animations fluides
React Hook Form     → Gestion formulaires
Zod                 → Validation schémas
react-i18next       → Internationalisation
Recharts            → Graphiques statistiques
```

#### Backend
```
Node.js 18+         → Runtime JavaScript
Express 4.18        → Framework web
Prisma 5.7          → ORM type-safe
SQLite / PostgreSQL → Base de données
Passport.js         → Authentification OAuth
Multer              → Upload fichiers
Sharp               → Traitement images
Stripe SDK          → Paiements
Winston             → Logs structurés
Helmet              → Headers sécurité
```

#### Infrastructure
```
VPS (OVH/Hetzner)   → Hébergement
Nginx               → Reverse proxy
PM2 / systemd       → Process management
Cloudflare          → CDN + DDoS protection
Let's Encrypt       → Certificats SSL
Sentry              → Monitoring erreurs
Uptime Robot        → Monitoring uptime
```

### Architecture Système

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (React)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Pages: Home, Gallery, Create, Edit, Stats, Settings     │  │
│  │ Components: ReviewCard, Filter, Export, Moderation      │  │
│  │ Store (Zustand): auth, reviews, ui                      │  │
│  │ i18n: FR/EN translations                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS (credentials: include)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                        │
│  - SSL Termination (Let's Encrypt)                             │
│  - Static files serving (/images, /exports)                    │
│  - Rate limiting (IP-based)                                    │
│  - Gzip compression                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  EXPRESS SERVER (Node.js)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Middleware:                                              │  │
│  │  - helmet (CSP, XSS protection)                         │  │
│  │  - csurf (CSRF tokens)                                  │  │
│  │  - express-rate-limit (API throttling)                 │  │
│  │  - passport (OAuth sessions)                            │  │
│  │  - legal (age/country verification)                     │  │
│  │  - rbac (role-based access control)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Routes:                                                  │  │
│  │  /api/auth/*       → OAuth (5 providers) + TOTP        │  │
│  │  /api/reviews/*    → CRUD reviews + likes              │  │
│  │  /api/users/*      → Profiles + stats + GDPR           │  │
│  │  /api/templates/*  → Export templates                  │  │
│  │  /api/subscriptions/* → Stripe webhooks                │  │
│  │  /api/reports/*    → Moderation                        │  │
│  │  /api/admin/*      → Admin panel                       │  │
│  │  /api/legal/*      → Age/country verification          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ Prisma Client
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE (SQLite → PostgreSQL prod)                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tables:                                                  │  │
│  │  - users (OAuth IDs, legal fields, roles)              │  │
│  │  - sessions (express-session storage)                   │  │
│  │  - reviews (150+ fields, 4 types)                      │  │
│  │  - review_likes (user reactions)                        │  │
│  │  - subscriptions (Stripe sync)                          │  │
│  │  - influencer_profiles (branding)                       │  │
│  │  - producer_profiles (verification)                     │  │
│  │  - reports (moderation queue)                           │  │
│  │  - audit_logs (actions tracking)                        │  │
│  │  - templates (export configs)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICES EXTERNES                            │
│  - Stripe (paiements)                                           │
│  - Resend/SendGrid (emails)                                     │
│  - Cloudflare (CDN images)                                      │
│  - Sentry (monitoring erreurs)                                  │
│  - Discord/Google/Apple/Amazon/Facebook OAuth                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Installation Rapide

### Prérequis
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **Git**
- Comptes développeur : Discord, Google, Stripe (gratuits)

### 1. Cloner le Repository
```powershell
git clone https://github.com/RAFOUgg/Reviews-Maker.git
cd Reviews-Maker
```

### 2. Configuration OAuth Providers

#### Discord (Obligatoire)
1. https://discord.com/developers/applications
2. New Application → "Reviews-Maker Dev"
3. OAuth2 → Redirects → `http://localhost:3000/api/auth/discord/callback`
4. Copier Client ID + Client Secret

#### Google (Obligatoire)
1. https://console.cloud.google.com/
2. Créer projet → Activer Google+ API
3. Credentials → OAuth 2.0 Client ID
4. Redirect URI → `http://localhost:3000/api/auth/google/callback`
5. Copier Client ID + Client Secret

#### Stripe (Obligatoire pour abonnements)
1. https://dashboard.stripe.com/register
2. Mode test (gratuit)
3. Développeurs → Clés API → Copier clé secrète
4. Webhooks → `http://localhost:3000/api/subscriptions/webhook`

### 3. Configuration Backend
```powershell
cd server-new
npm install

# Copier le template
cp .env.example .env

# Éditer .env avec vos clés
notepad .env
```

**Fichier `.env` minimal :**
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DATABASE_URL="file:../db/reviews.sqlite"

SESSION_SECRET="genere_une_chaine_aleatoire_64_caracteres_minimum"

DISCORD_CLIENT_ID="ton_discord_client_id"
DISCORD_CLIENT_SECRET="ton_discord_secret"
DISCORD_REDIRECT_URI="http://localhost:3000/api/auth/discord/callback"

GOOGLE_CLIENT_ID="ton_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="ton_google_secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="noreply@reviews-maker.local"
```

**Initialiser la base de données :**
```powershell
npx prisma generate
npx prisma migrate dev
```

### 4. Configuration Frontend
```powershell
cd ../client
npm install

# Créer .env
echo "VITE_API_URL=http://localhost:3000" > .env
```

### 5. Lancer en Développement
```powershell
# Terminal 1 : Backend
cd server-new
npm run dev

# Terminal 2 : Frontend
cd client
npm run dev
```

**URLs :**
- Frontend : http://localhost:5173
- Backend : http://localhost:3000
- Prisma Studio : `npx prisma studio` (http://localhost:5555)

---

## 🔧 Configuration

### Variables d'Environnement

#### Backend (`server-new/.env`)
Voir [.env.example](server-new/.env.example) pour la liste complète.

**Essentielles :**
```env
# Base
NODE_ENV=development|production
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=file:../db/reviews.sqlite

# Session
SESSION_SECRET=your_random_64_chars_string

# OAuth (5 providers)
DISCORD_CLIENT_ID + SECRET + REDIRECT_URI
GOOGLE_CLIENT_ID + SECRET + CALLBACK_URL
APPLE_CLIENT_ID + TEAM_ID + KEY_ID + PRIVATE_KEY_PATH
AMAZON_CLIENT_ID + SECRET + CALLBACK_URL
FACEBOOK_APP_ID + SECRET + CALLBACK_URL

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@domain.com

# Legal
LEGAL_MIN_AGE_DEFAULT=18
LEGAL_COUNTRIES_ALLOWED=FR,DE,ES,CA,US
```

#### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

### Configuration Stripe

1. Créer produits dans Dashboard Stripe :
   - Influenceur Basic : 7.99€/mois
   - Influenceur Pro : 15.99€/mois
   - Producteur : 29.99€/mois
   - Marchand : 25.99€/mois

2. Copier Price IDs dans `server-new/config/stripe.js`

3. Configurer webhook endpoint :
   - URL : `https://votre-domaine.fr/api/subscriptions/webhook`
   - Events : `invoice.paid`, `customer.subscription.created`, `customer.subscription.deleted`, `customer.subscription.updated`

---

## 📚 Documentation

### Guides Complets
- [📖 Guide Utilisateur](docs/USER_GUIDE.md) - Utilisation de la plateforme
- [👨‍💻 Guide Développeur](docs/DEVELOPER_GUIDE.md) - Architecture et conventions
- [🔐 Guide Sécurité](docs/SECURITY.md) - Bonnes pratiques
- [🚀 Guide Déploiement](docs/DEPLOYMENT.md) - Production sur VPS
- [🐛 Troubleshooting](docs/TROUBLESHOOTING.md) - Résolution problèmes
- [📊 API Reference](docs/API_REFERENCE.md) - Documentation endpoints
- [🎨 Design System](docs/DESIGN_SYSTEM.md) - Composants UI

### Documents Techniques
- [MVP Plan Technique](MVP_PLAN_TECHNIQUE.md) - Vision complète MVP
- [Gap Analysis](GAP_ANALYSIS.md) - Analyse état actuel vs cible
- [Sprint 1 Actions](SPRINT_1_ACTIONS.md) - Actions immédiates
- [CHANGELOG](CHANGELOG.md) - Historique versions

---

## 👨‍💻 Développement

### Structure du Projet
```
Reviews-Maker/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   │   ├── auth/          # OAuth, TOTP, Email
│   │   │   ├── legal/         # RDR, Age, Consent
│   │   │   ├── reviews/       # ReviewCard, Editor
│   │   │   └── moderation/    # Reports, Admin
│   │   ├── pages/             # Pages principales
│   │   ├── hooks/             # Custom hooks
│   │   ├── store/             # Zustand stores
│   │   ├── services/          # API clients
│   │   ├── i18n/              # Traductions FR/EN
│   │   └── utils/             # Helpers
│   ├── public/                # Assets statiques
│   └── package.json
│
├── server-new/                 # Backend Express
│   ├── routes/                # Routes API
│   │   ├── auth.js           # OAuth multi-providers
│   │   ├── reviews.js        # CRUD reviews
│   │   ├── users.js          # Profils + GDPR
│   │   ├── subscriptions.js  # Stripe
│   │   ├── reports.js        # Modération
│   │   ├── admin.js          # Admin panel
│   │   └── legal.js          # Age/country
│   ├── middleware/            # Middleware Express
│   │   ├── auth.js           # requireAuth, RBAC
│   │   ├── legal.js          # Age/country check
│   │   └── ratelimit.js      # Throttling
│   ├── services/              # Logique métier
│   │   ├── email.js          # Envoi emails
│   │   ├── totp.js           # TOTP 2FA
│   │   └── stripe.js         # Webhooks Stripe
│   ├── config/                # Configurations
│   │   ├── passport.js       # OAuth strategies
│   │   └── stripe.js         # Plans Stripe
│   ├── prisma/
│   │   └── schema.prisma     # Modèles DB
│   ├── uploads/               # Médias uploadés
│   └── package.json
│
├── db/                         # Base de données
│   ├── reviews.sqlite         # SQLite dev
│   └── review_images/         # Images reviews
│
├── docs/                       # Documentation
├── scripts/                    # Scripts utilitaires
└── .github/                    # CI/CD GitHub Actions
```

### Conventions de Code

#### Backend
- **Routing** : RESTful (GET, POST, PUT, DELETE, PATCH)
- **Nommage** : camelCase variables, PascalCase models Prisma
- **Async/await** : Toujours gérer erreurs avec try/catch
- **Logs** : Winston structuré (info, warn, error)
- **Validation** : Zod schémas pour body/query

#### Frontend
- **Components** : PascalCase, un composant par fichier
- **Hooks** : Préfixe `use` (ex: `useAuth`, `useReviews`)
- **Styles** : TailwindCSS classes, pas de CSS custom sauf exception
- **State** : Zustand pour global, useState/useReducer pour local
- **i18n** : Clés explicites `auth.login.title` pas `t1`, `t2`

### Scripts Utiles

#### Backend
```powershell
cd server-new

npm run dev          # Mode watch avec nodemon
npm start            # Production
npm run prisma:studio # Interface DB graphique
npm run prisma:migrate # Créer migration
npm run test         # Tests unitaires (à venir)
npm run lint         # ESLint
```

#### Frontend
```powershell
cd client

npm run dev          # Dev server Vite
npm run build        # Build production
npm run preview      # Prévisualiser build
npm run lint         # ESLint + Prettier
npm run test         # Vitest (à venir)
```

### Tests

#### E2E avec Playwright
```powershell
cd client
npm install -D @playwright/test
npx playwright install

npx playwright test                # Tous tests
npx playwright test --ui           # Mode UI
npx playwright test auth.spec.js   # Test spécifique
```

**Tests critiques à couvrir :**
- [ ] Flow signup complet (OAuth → Age → Consentement)
- [ ] Création review (4 types)
- [ ] Upload images
- [ ] Exports PNG/PDF
- [ ] Filtres galerie
- [ ] Signalement review
- [ ] Abonnement Stripe

---

## 🚀 Déploiement

### Production sur VPS

#### 1. Prérequis Serveur
```bash
# Ubuntu 22.04 LTS
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx nodejs npm git

# Installer PM2
sudo npm install -g pm2
```

#### 2. Configuration Nginx
```nginx
# /etc/nginx/sites-available/reviews-maker
server {
    listen 80;
    server_name reviews-maker.fr;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name reviews-maker.fr;

    ssl_certificate /etc/letsencrypt/live/reviews-maker.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reviews-maker.fr/privkey.pem;

    # Frontend
    root /var/www/reviews-maker/client/dist;
    index index.html;

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static images
    location /images {
        alias /var/www/reviews-maker/db/review_images;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 3. Déploiement Automatisé
```bash
# Cloner sur serveur
cd /var/www
git clone https://github.com/RAFOUgg/Reviews-Maker.git
cd Reviews-Maker

# Backend
cd server-new
cp .env.example .env
nano .env  # Éditer avec vraies clés PRODUCTION
npm install --production
npx prisma generate
npx prisma migrate deploy

# Frontend
cd ../client
npm install
npm run build

# PM2
cd ../server-new
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup  # Générer script démarrage auto

# SSL
sudo certbot --nginx -d reviews-maker.fr
```

#### 4. Monitoring
```bash
pm2 monit              # Dashboard temps réel
pm2 logs reviews-maker # Logs applicatifs
pm2 restart reviews-maker --update-env  # Restart avec nouvelles vars
```

### Backups Automatiques
```bash
# Cron daily backup
# /etc/cron.daily/reviews-maker-backup
#!/bin/bash
tar czf /backups/reviews-$(date +%F).tar.gz \
  /var/www/reviews-maker/db/reviews.sqlite \
  /var/www/reviews-maker/db/review_images

# Conserver 30 jours
find /backups -name "reviews-*.tar.gz" -mtime +30 -delete
```

---

## 🤝 Contribution

### Workflow Git

1. **Créer une branche**
```bash
git checkout -b feat/ma-fonctionnalite
# ou
git checkout -b fix/mon-bug
```

2. **Développer + Commiter**
```bash
git add .
git commit -m "feat: ajouter export PDF avancé"
# Suivre convention Conventional Commits
```

3. **Push + Pull Request**
```bash
git push origin feat/ma-fonctionnalite
# Ouvrir PR sur GitHub
```

### Convention Commits
```
feat: nouvelle fonctionnalité
fix: correction bug
docs: documentation
style: formatage code (pas de changement logique)
refactor: refacto sans changer comportement
test: ajout tests
chore: maintenance (deps, config)
```

### Code Review Checklist
- [ ] Code testé localement
- [ ] Pas de console.log oubliés
- [ ] Variables sensibles dans .env
- [ ] Documentation mise à jour si nécessaire
- [ ] Tests E2E passent (si modif critique)
- [ ] Build frontend passe sans warnings

---

## 🗺️ Roadmap

### ✅ Phase 1 : MVP (Actuel)
- [x] Architecture React + Express
- [x] Discord OAuth
- [x] CRUD reviews complet
- [x] Upload médias
- [ ] OAuth multi-providers (Sprint 1)
- [ ] Système légal RDR (Sprint 1)
- [ ] i18n FR/EN (Sprint 1)
- [ ] Exports avancés (Sprint 5-6)
- [ ] Abonnements Stripe (Sprint 9-12)
- [ ] Modération (Sprint 7-8)

### 🔜 Phase 2 : Producteurs (Q2 2026)
- [ ] Pipelines culture (substrat, fertilisation)
- [ ] Journal de bord (JDB) J+X
- [ ] Gestion lots/batches
- [ ] Certifications (bio, lab tests)

### 🔮 Phase 3 : Marchands (Q3 2026)
- [ ] Connecteur Shopify
- [ ] Preuve d'achat → review vérifiée
- [ ] Webhooks commandes
- [ ] Widget reviews embarquable

### 🌍 Phase 4 : International (Q4 2026)
- [ ] i18n ES/DE
- [ ] Mind-map phénotypes/généalogie
- [ ] Exports pro multi-pages
- [ ] Mobile app (React Native)

---

## 💬 Support

### Documentation
- [Guide Utilisateur](docs/USER_GUIDE.md)
- [FAQ](docs/FAQ.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### Contact
- **Email** : support@reviews-maker.fr
- **Discord** : https://discord.gg/reviews-maker
- **GitHub Issues** : https://github.com/RAFOUgg/Reviews-Maker/issues

### Problèmes Courants

#### Backend ne démarre pas
```powershell
# Vérifier variables .env
cd server-new
cat .env

# Régénérer Prisma client
npx prisma generate

# Logs détaillés
npm run dev
```

#### Frontend erreur CORS
```javascript
// Vérifier FRONTEND_URL dans server-new/.env
FRONTEND_URL=http://localhost:5173

// Vérifier fetch avec credentials
fetch('/api/...', { credentials: 'include' })
```

#### Images ne s'affichent pas
```bash
# Vérifier permissions dossier
ls -la db/review_images/

# Vérifier route Nginx/Express
# /images doit pointer vers db/review_images/
```

---

## 📄 Licence

MIT License - voir [LICENSE](LICENSE)

---

## 🙏 Remerciements

- **React Team** pour React 18
- **Vercel** pour Vite
- **Prisma Team** pour Prisma ORM
- **Stripe** pour API paiements
- **Communauté Discord** pour les retours beta

---

**Version actuelle :** 2.0.0-MVP  
**Dernière mise à jour :** 7 décembre 2025  
**Auteur principal :** [@RAFOUgg](https://github.com/RAFOUgg)

**Fabriqué avec ❤️ et 🌿 en France**
