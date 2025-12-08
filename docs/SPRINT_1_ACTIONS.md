# 🚀 Actions Immédiates - Démarrage Sprint 1

**Date:** 7 décembre 2025  
**Sprint:** 1-2 (Auth + Légal)  
**Durée:** 2 semaines  

---

## 🎯 Objectif Sprint 1

Implémenter l'authentification multi-providers (Discord, Google, Apple, Amazon, Facebook) + système légal complet (RDR, âge, pays, consentement) + TOTP optionnel.

---

## ⚠️ Actions Bloquantes (À faire MAINTENANT)

### 1. Configuration OAuth Providers

#### Discord (✅ Déjà configuré)
- [x] Application créée sur Discord Developer Portal
- [x] Client ID et Secret dans `.env`
- [x] Redirect URI configuré

#### Google OAuth2 (🔴 À faire)
**Étapes:**
1. Aller sur https://console.cloud.google.com/
2. Créer projet "Reviews-Maker"
3. Activer "Google+ API"
4. Créer credentials OAuth 2.0
5. Ajouter redirect URI:
   - `http://localhost:3000/api/auth/google/callback` (dev)
   - `https://reviews-maker.fr/api/auth/google/callback` (prod)
6. Copier Client ID et Secret

**Variables .env à ajouter:**
```env
GOOGLE_CLIENT_ID="ton_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="ton_secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"
```

#### Apple Sign In (🔴 À faire)
**Étapes:**
1. Aller sur https://developer.apple.com/account
2. Créer App ID "Reviews-Maker"
3. Activer "Sign in with Apple"
4. Créer Service ID
5. Configurer domaine et redirect URL
6. Créer clé privée (.p8)

**Variables .env:**
```env
APPLE_CLIENT_ID="fr.reviews-maker.signin"
APPLE_TEAM_ID="ton_team_id"
APPLE_KEY_ID="ton_key_id"
APPLE_PRIVATE_KEY_PATH="./config/AuthKey_XXXXX.p8"
APPLE_CALLBACK_URL="http://localhost:3000/api/auth/apple/callback"
```

#### Amazon Login (🔴 À faire)
**Étapes:**
1. Aller sur https://developer.amazon.com/loginwithamazon/console
2. Créer Security Profile "Reviews-Maker"
3. Ajouter Allowed Return URLs
4. Copier Client ID et Secret

**Variables .env:**
```env
AMAZON_CLIENT_ID="amzn1.application-oa2-client.xxxxx"
AMAZON_CLIENT_SECRET="ton_secret"
AMAZON_CALLBACK_URL="http://localhost:3000/api/auth/amazon/callback"
```

#### Facebook Login (🔴 À faire)
**Étapes:**
1. Aller sur https://developers.facebook.com/
2. Créer app "Reviews-Maker"
3. Ajouter produit "Facebook Login"
4. Configurer Valid OAuth Redirect URIs
5. Copier App ID et App Secret

**Variables .env:**
```env
FACEBOOK_APP_ID="ton_app_id"
FACEBOOK_APP_SECRET="ton_secret"
FACEBOOK_CALLBACK_URL="http://localhost:3000/api/auth/facebook/callback"
```

---

### 2. Installer Dépendances Backend

```powershell
cd server-new

# OAuth strategies
npm install passport-google-oauth20
npm install passport-apple
npm install passport-amazon
npm install passport-facebook

# TOTP
npm install speakeasy qrcode

# Email (backup auth + notifications)
npm install nodemailer
# OU
npm install resend  # Recommandé (API simple)

# Rate limiting
npm install express-rate-limit

# Security
npm install helmet csurf

# Utils
npm install crypto-js  # Pour hashing
```

---

### 3. Installer Dépendances Frontend

```powershell
cd client

# I18n
npm install react-i18next i18next i18next-browser-languagedetector

# QR Code (TOTP setup)
npm install qrcode.react

# Date picker (age verification)
npm install react-datepicker

# Country selector
npm install react-select-country-list
```

---

### 4. Créer Structure Fichiers Backend

```powershell
cd server-new

# Nouvelles routes
New-Item -ItemType File -Path "routes/legal.js"
New-Item -ItemType File -Path "routes/subscriptions.js" -Force
New-Item -ItemType File -Path "routes/reports.js" -Force
New-Item -ItemType File -Path "routes/admin.js" -Force

# Nouveaux middlewares
New-Item -ItemType File -Path "middleware/legal.js" -Force
New-Item -ItemType File -Path "middleware/rbac.js" -Force
New-Item -ItemType File -Path "middleware/ratelimit.js" -Force

# Services
New-Item -ItemType Directory -Path "services" -Force
New-Item -ItemType File -Path "services/email.js" -Force
New-Item -ItemType File -Path "services/totp.js" -Force
New-Item -ItemType File -Path "services/stripe.js" -Force

# Config
New-Item -ItemType File -Path "config/stripe.js" -Force
New-Item -ItemType File -Path "config/legal.js" -Force
```

---

### 5. Créer Structure Fichiers Frontend

```powershell
cd client/src

# Composants auth
New-Item -ItemType Directory -Path "components/auth" -Force
New-Item -ItemType File -Path "components/auth/OAuthButtons.jsx" -Force
New-Item -ItemType File -Path "components/auth/EmailAuth.jsx" -Force
New-Item -ItemType File -Path "components/auth/TOTPSetup.jsx" -Force

# Composants légaux
New-Item -ItemType Directory -Path "components/legal" -Force
New-Item -ItemType File -Path "components/legal/RDRBanner.jsx" -Force
New-Item -ItemType File -Path "components/legal/AgeVerification.jsx" -Force
New-Item -ItemType File -Path "components/legal/ConsentModal.jsx" -Force
New-Item -ItemType File -Path "components/legal/LegalNotice.jsx" -Force

# I18n
New-Item -ItemType Directory -Path "i18n" -Force
New-Item -ItemType File -Path "i18n/i18n.js" -Force
New-Item -ItemType File -Path "i18n/fr.json" -Force
New-Item -ItemType File -Path "i18n/en.json" -Force

# Pages auth
New-Item -ItemType Directory -Path "pages/auth" -Force
New-Item -ItemType File -Path "pages/auth/SignupPage.jsx" -Force
New-Item -ItemType File -Path "pages/auth/LoginPage.jsx" -Force
```

---

## 📝 Checklist Sprint 1 (Semaine 1)

### Backend

#### OAuth Multi-Providers
- [ ] Ajouter strategy Google dans `config/passport.js`
- [ ] Ajouter strategy Apple dans `config/passport.js`
- [ ] Ajouter strategy Amazon dans `config/passport.js`
- [ ] Ajouter strategy Facebook dans `config/passport.js`
- [ ] Ajouter routes `/api/auth/google*` dans `routes/auth.js`
- [ ] Ajouter routes `/api/auth/apple*` dans `routes/auth.js`
- [ ] Ajouter routes `/api/auth/amazon*` dans `routes/auth.js`
- [ ] Ajouter routes `/api/auth/facebook*` dans `routes/auth.js`

#### Email Backup Auth
- [ ] Créer service `services/email.js` (envoi code 6 chiffres)
- [ ] Créer route `POST /api/auth/email/request-code`
- [ ] Créer route `POST /api/auth/email/verify-code`
- [ ] Implémenter stockage codes temporaires (Map en mémoire ou Redis)
- [ ] Configurer Resend API key

#### TOTP
- [ ] Créer service `services/totp.js` (génération secret, QR, vérification)
- [ ] Créer route `POST /api/auth/totp/setup`
- [ ] Créer route `POST /api/auth/totp/verify`
- [ ] Ajouter champs `totpSecret`, `totpEnabled` dans User

#### Légal
- [ ] Créer middleware `legal.js` (vérifier âge/pays)
- [ ] Créer fichier config `config/legal.js` (pays autorisés, âges légaux)
- [ ] Créer route `POST /api/legal/verify-age`
- [ ] Créer route `POST /api/legal/consent-rdr`
- [ ] Créer route `GET /api/legal/countries`
- [ ] Créer route `GET /api/legal/notice/:country`

#### Rate Limiting
- [ ] Créer middleware `middleware/ratelimit.js`
- [ ] Appliquer sur routes sensibles (auth, reports)

#### Migration DB
- [ ] Ajouter champs OAuth dans User (googleId, appleId, amazonId, facebookId)
- [ ] Ajouter champs légaux (birthdate, country, region, legalAge, consentRDR, consentDate)
- [ ] Ajouter champs TOTP (totpSecret, totpEnabled)
- [ ] Ajouter champs préférences (locale, theme)
- [ ] Ajouter champs rôles (roles JSON, isBanned, banReason)
- [ ] Générer migration Prisma: `npx prisma migrate dev --name add_oauth_legal_fields`

---

### Frontend

#### OAuth Buttons
- [ ] Créer composant `OAuthButtons.jsx` (5 boutons avec icônes)
- [ ] Intégrer icônes OAuth (react-icons ou SVG custom)
- [ ] Gérer redirections vers `/api/auth/{provider}`

#### Email Backup
- [ ] Créer composant `EmailAuth.jsx` (formulaire email + code)
- [ ] Gérer états (demande code, saisie code, erreurs)
- [ ] Afficher timer countdown (code expire en 5min)

#### TOTP
- [ ] Créer composant `TOTPSetup.jsx` dans settings
- [ ] Afficher QR code (qrcode.react)
- [ ] Formulaire vérification code
- [ ] Afficher codes backup (à sauvegarder)

#### Légal
- [ ] Créer composant `RDRBanner.jsx` (sticky top, fermeture temporaire)
- [ ] Créer modal `AgeVerification.jsx` (date picker + sélecteur pays)
- [ ] Créer modal `ConsentModal.jsx` (checkbox politique + accepter)
- [ ] Créer page `LegalNotice.jsx` (mentions par pays)
- [ ] Gérer affichage conditionnel (user.consentRDR, user.legalAge)

#### I18n
- [ ] Configurer react-i18next dans `i18n/i18n.js`
- [ ] Créer fichiers `fr.json` et `en.json`
- [ ] Traduire chaînes existantes (navigation, forms, errors)
- [ ] Créer composant `LanguageSwitcher` (dropdown FR/EN)
- [ ] Intégrer dans `SettingsPage.jsx`

#### Pages Auth
- [ ] Créer page `SignupPage.jsx` (choix OAuth ou email)
- [ ] Créer page `LoginPage.jsx` (même choix)
- [ ] Ajouter routes `/signup` et `/login` dans Router
- [ ] Gérer redirections post-login (page origine ou home)

---

## 📝 Checklist Sprint 1 (Semaine 2)

### Tests & Validation

#### Backend
- [ ] Tester flow Google OAuth (dev + staging)
- [ ] Tester flow Apple Sign In
- [ ] Tester flow Amazon Login
- [ ] Tester flow Facebook Login
- [ ] Tester auth email (code 6 chiffres)
- [ ] Tester TOTP setup + login
- [ ] Tester vérification âge (mineur rejeté)
- [ ] Tester vérification pays (US, CA, FR, DE, ES)
- [ ] Tester rate limiting (10 tentatives/min)

#### Frontend
- [ ] Tester affichage RDR banner (sticky)
- [ ] Tester modal âge (validation date)
- [ ] Tester modal consentement (checkbox requis)
- [ ] Tester boutons OAuth (5 providers)
- [ ] Tester auth email (demande + vérif code)
- [ ] Tester TOTP setup (QR code + vérif)
- [ ] Tester switch langue FR/EN
- [ ] Tester traductions complètes
- [ ] Vérifier accessibilité (navigation clavier, labels)

#### Intégration
- [ ] Flow complet : signup Google → âge → consentement → redirect home
- [ ] Flow complet : login email → TOTP → home
- [ ] Vérifier session persistante (7 jours)
- [ ] Vérifier logout + cleanup session
- [ ] Tester sur mobile (responsive)

---

## 🔧 Configuration Environnement

### Fichier `.env` complet (server-new/)

```env
# Node
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
BASE_PATH=

# Database
DATABASE_URL="file:../db/reviews.sqlite"

# Session
SESSION_SECRET="genere_une_longue_chaine_aleatoire_64_caracteres_minimum_xyz123"

# Discord OAuth
DISCORD_CLIENT_ID="ton_client_id"
DISCORD_CLIENT_SECRET="ton_secret"
DISCORD_REDIRECT_URI="http://localhost:3000/api/auth/discord/callback"

# Google OAuth
GOOGLE_CLIENT_ID="ton_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="ton_secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# Apple Sign In
APPLE_CLIENT_ID="fr.reviews-maker.signin"
APPLE_TEAM_ID="ton_team_id"
APPLE_KEY_ID="ton_key_id"
APPLE_PRIVATE_KEY_PATH="./config/AuthKey_XXXXX.p8"
APPLE_CALLBACK_URL="http://localhost:3000/api/auth/apple/callback"

# Amazon Login
AMAZON_CLIENT_ID="amzn1.application-oa2-client.xxxxx"
AMAZON_CLIENT_SECRET="ton_secret"
AMAZON_CALLBACK_URL="http://localhost:3000/api/auth/amazon/callback"

# Facebook Login
FACEBOOK_APP_ID="ton_app_id"
FACEBOOK_APP_SECRET="ton_secret"
FACEBOOK_CALLBACK_URL="http://localhost:3000/api/auth/facebook/callback"

# Email Service (Resend recommandé)
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="noreply@reviews-maker.fr"

# Legal
LEGAL_MIN_AGE_DEFAULT=18
LEGAL_COUNTRIES_ALLOWED="FR,DE,ES,PT,IT,NL,BE,CH,CA,US"
LEGAL_US_STATES_21="CA,WA,OR,NV,CO,IL,MA,MI,AZ,NJ,NY,MT"
```

---

## 📦 Commandes Rapides

### Installation complète
```powershell
# Backend
cd server-new
npm install passport-google-oauth20 passport-apple passport-amazon passport-facebook speakeasy qrcode resend express-rate-limit helmet csurf

# Frontend
cd ../client
npm install react-i18next i18next i18next-browser-languagedetector qrcode.react react-datepicker react-select-country-list
```

### Migration DB
```powershell
cd server-new
npx prisma migrate dev --name add_oauth_legal_totp_fields
npx prisma generate
```

### Lancer dev
```powershell
# Terminal 1 : Backend
cd server-new
npm run dev

# Terminal 2 : Frontend
cd client
npm run dev
```

---

## 🎯 Objectifs de Fin Sprint 1

### Livrables Attendus
✅ 5 providers OAuth fonctionnels (Discord, Google, Apple, Amazon, Facebook)  
✅ Auth email backup avec code 6 chiffres  
✅ TOTP optionnel activable en settings  
✅ Bandeau RDR permanent affiché  
✅ Vérification âge/pays obligatoire à l'inscription  
✅ Modal consentement RDR  
✅ I18n FR/EN complet sur auth + légal  
✅ Rate limiting sur routes sensibles  
✅ Tests E2E sur flow complet signup  

### Démonstration Sprint Review
1. Inscription avec Google OAuth
2. Vérification âge (date naissance + pays)
3. Acceptation consentement RDR
4. Affichage bandeau RDR
5. Activation TOTP en settings
6. Login avec email backup + code 6 chiffres
7. Switch langue FR/EN
8. Logout + vérification session

---

## 📞 Support & Ressources

### Documentation OAuth
- Discord: https://discord.com/developers/docs/topics/oauth2
- Google: https://developers.google.com/identity/protocols/oauth2
- Apple: https://developer.apple.com/sign-in-with-apple/
- Amazon: https://developer.amazon.com/docs/login-with-amazon/documentation-overview.html
- Facebook: https://developers.facebook.com/docs/facebook-login/

### Librairies
- Passport.js: https://www.passportjs.org/
- Speakeasy (TOTP): https://github.com/speakeasyjs/speakeasy
- React-i18next: https://react.i18next.com/

---

**Prochaine mise à jour** : Fin Semaine 1 Sprint 1  
**Contact** : [Tech Lead à définir]
