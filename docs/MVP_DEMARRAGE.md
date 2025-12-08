# 🚀 MVP Refonte - Démarrage Sprint 1

**Date de démarrage:** 7 décembre 2025  
**Statut:** ✅ Prêt à commencer  

---

## 📦 Documents Créés

### Documentation Complète
- ✅ [README_MVP.md](README_MVP.md) - Guide complet du projet
- ✅ [MODE_OPERATOIRE.md](MODE_OPERATOIRE.md) - Workflow développement quotidien
- ✅ [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Résolution problèmes courants
- ✅ [MVP_PLAN_TECHNIQUE.md](MVP_PLAN_TECHNIQUE.md) - Architecture & roadmap détaillée
- ✅ [GAP_ANALYSIS.md](GAP_ANALYSIS.md) - Analyse écarts état actuel vs cible
- ✅ [SPRINT_1_ACTIONS.md](SPRINT_1_ACTIONS.md) - Actions immédiates Sprint 1

### Configuration
- ✅ [server-new/.env.example](server-new/.env.example) - Template variables complètes

### Base de Données
- ✅ [server-new/prisma/schema.prisma](server-new/prisma/schema.prisma) - Modèles étendus
  - User : OAuth multi-providers + légal + RBAC
  - Subscription : Abonnements Stripe
  - InfluencerProfile : Branding Orchard
  - ProducerProfile : Phase 2 (préparé)
  - Report : Modération signalements
  - AuditLog : Traçabilité actions

---

## 🎯 Prochaines Étapes Immédiates

### 1. Appliquer Migration Prisma (15 min)

```powershell
# Se placer dans server-new
cd server-new

# Générer migration avec nom descriptif
npx prisma migrate dev --name add_mvp_models_oauth_legal_rbac

# Si erreur, vérifier schema.prisma
# Puis régénérer client
npx prisma generate

# Vérifier création tables
npx prisma studio
# → Ouvrir http://localhost:5555
# → Vérifier présence tables : users (champs étendus), subscriptions, influencer_profiles, reports, audit_logs
```

### 2. Installer Dépendances Manquantes (10 min)

```powershell
# Toujours dans server-new/
npm install passport-google-oauth20 passport-apple passport-amazon passport-facebook speakeasy qrcode resend express-rate-limit helmet csurf

# Frontend
cd ../client
npm install react-i18next i18next i18next-browser-languagedetector qrcode.react react-datepicker react-select-country-list

# Retour backend
cd ../server-new
```

### 3. Configurer OAuth Providers (1-2h)

Suivre [SPRINT_1_ACTIONS.md section "Configuration OAuth Providers"](SPRINT_1_ACTIONS.md#1-configuration-oauth-providers)

**Google OAuth2** :
1. https://console.cloud.google.com/
2. Créer projet "Reviews-Maker"
3. Activer Google+ API
4. Créer OAuth 2.0 Client ID
5. Redirect URI : `http://localhost:3000/api/auth/google/callback`
6. Copier Client ID + Secret dans `.env`

**Apple Sign In** :
1. https://developer.apple.com/account
2. Créer App ID + Service ID
3. Configurer redirect URL
4. Générer clé privée (.p8)
5. Ajouter credentials dans `.env`

**Amazon Login** :
1. https://developer.amazon.com/loginwithamazon/console
2. Créer Security Profile
3. Copier Client ID + Secret

**Facebook Login** :
1. https://developers.facebook.com/
2. Créer app
3. Ajouter produit "Facebook Login"
4. Copier App ID + Secret

### 4. Créer Fichiers Structure Sprint 1 (30 min)

```powershell
# Backend routes
cd server-new
New-Item -ItemType File -Path "routes/legal.js" -Force
New-Item -ItemType File -Path "routes/subscriptions.js" -Force
New-Item -ItemType File -Path "routes/reports.js" -Force
New-Item -ItemType File -Path "routes/admin.js" -Force

# Backend middleware
New-Item -ItemType File -Path "middleware/legal.js" -Force
New-Item -ItemType File -Path "middleware/rbac.js" -Force
New-Item -ItemType File -Path "middleware/ratelimit.js" -Force

# Backend services
New-Item -ItemType Directory -Path "services" -Force
New-Item -ItemType File -Path "services/email.js" -Force
New-Item -ItemType File -Path "services/totp.js" -Force
New-Item -ItemType File -Path "services/stripe.js" -Force

# Backend config
New-Item -ItemType File -Path "config/stripe.js" -Force
New-Item -ItemType File -Path "config/legal.js" -Force

# Frontend composants auth
cd ../client/src
New-Item -ItemType Directory -Path "components/auth" -Force
New-Item -ItemType File -Path "components/auth/OAuthButtons.jsx" -Force
New-Item -ItemType File -Path "components/auth/EmailAuth.jsx" -Force
New-Item -ItemType File -Path "components/auth/TOTPSetup.jsx" -Force

# Frontend composants légaux
New-Item -ItemType Directory -Path "components/legal" -Force
New-Item -ItemType File -Path "components/legal/RDRBanner.jsx" -Force
New-Item -ItemType File -Path "components/legal/AgeVerification.jsx" -Force
New-Item -ItemType File -Path "components/legal/ConsentModal.jsx" -Force

# Frontend i18n
New-Item -ItemType Directory -Path "i18n" -Force
New-Item -ItemType File -Path "i18n/i18n.js" -Force
New-Item -ItemType File -Path "i18n/fr.json" -Force
New-Item -ItemType File -Path "i18n/en.json" -Force
```

### 5. Implémenter Middleware Legal (1h)

Copier code depuis [TROUBLESHOOTING.md Fix #2](TROUBLESHOOTING.md#fix-2--créer-middleware-legal) dans `server-new/middleware/legal.js`

### 6. Créer Composant RDRBanner (30 min)

Copier code depuis [TROUBLESHOOTING.md Fix #3](TROUBLESHOOTING.md#fix-3--créer-composant-rdrbanner) dans `client/src/components/legal/RDRBanner.jsx`

### 7. Créer Modal AgeVerification (1h)

Copier code depuis [TROUBLESHOOTING.md Fix #4](TROUBLESHOOTING.md#fix-4--créer-modal-age-verification) dans `client/src/components/legal/AgeVerification.jsx`

### 8. Setup i18n (45 min)

Copier code depuis [TROUBLESHOOTING.md Fix #5](TROUBLESHOOTING.md#fix-5--setup-i18n-basique) dans `client/src/i18n/i18n.js`

---

## ✅ Checklist Pré-Développement

### Configuration Environnement
- [ ] `.env` backend créé et rempli (copier de `.env.example`)
- [ ] SESSION_SECRET généré (64+ caractères aléatoires)
- [ ] Discord OAuth credentials configurés
- [ ] Google OAuth credentials configurés
- [ ] Compte Resend créé + API key
- [ ] Compte Stripe créé (mode test)

### Base de Données
- [ ] Migration Prisma appliquée (`npx prisma migrate dev`)
- [ ] Prisma client généré (`npx prisma generate`)
- [ ] Prisma Studio testé (`npx prisma studio`)
- [ ] Tables vérifiées (users, subscriptions, reports, audit_logs, etc.)

### Dépendances
- [ ] Backend : Toutes dépendances installées
- [ ] Frontend : Toutes dépendances installées
- [ ] Pas d'erreurs `npm install`

### Serveurs
- [ ] Backend démarre sans erreurs (`npm run dev`)
- [ ] Frontend démarre sans erreurs (`npm run dev`)
- [ ] Accès frontend : http://localhost:5173
- [ ] Accès backend : http://localhost:3000/api/health

---

## 📊 Métriques de Succès Sprint 1

### Semaine 1 (7-13 décembre)
- [ ] 5 providers OAuth fonctionnels (Discord ✅ + Google + Apple + Amazon + Facebook)
- [ ] Auth email backup avec code 6 chiffres
- [ ] Middleware legal (age/country) implémenté
- [ ] Routes `/api/legal/*` créées et testées

### Semaine 2 (14-20 décembre)
- [ ] Bandeau RDR affiché (sticky permanent)
- [ ] Modal vérification âge fonctionnelle
- [ ] Modal consentement RDR fonctionnelle
- [ ] i18n FR/EN setup complet (auth + legal)
- [ ] TOTP 2FA activable en settings
- [ ] Tests E2E flow signup complet

---

## 🐛 Points d'Attention

### Problèmes Potentiels Identifiés

#### 1. Migration Prisma peut échouer si DB non vide
**Solution** : Backup DB avant migration
```powershell
Copy-Item "../db/reviews.sqlite" "../db/reviews.sqlite.backup"
```

#### 2. OAuth Apple complexe (certificat .p8)
**Solution** : Implémenter Google en priorité, Apple phase 2 si blocage

#### 3. Sessions pas persistantes
**Solution** : Vérifier `SESSION_SECRET` défini + cookies autorisés navigateur

#### 4. CORS errors frontend/backend
**Solution** : Vérifier `FRONTEND_URL` dans `.env` + `credentials: 'include'` dans tous les `fetch()`

---

## 📞 Support & Ressources

### Documentation Technique
- Prisma Docs : https://www.prisma.io/docs
- Passport.js Strategies : https://www.passportjs.org/packages/
- React-i18next : https://react.i18next.com/
- Resend API : https://resend.com/docs

### OAuth Providers Docs
- Google : https://developers.google.com/identity/protocols/oauth2
- Apple : https://developer.apple.com/sign-in-with-apple/
- Amazon : https://developer.amazon.com/docs/login-with-amazon/
- Facebook : https://developers.facebook.com/docs/facebook-login/

---

## 🚦 Feu Vert pour Démarrer

**Conditions remplies** :
- ✅ Documentation complète créée
- ✅ Schema Prisma étendu avec nouveaux modèles
- ✅ `.env.example` mis à jour
- ✅ Checklists Sprint 1 détaillées
- ✅ Fixes prioritaires documentés
- ✅ Mode opératoire défini

**Prêt à lancer Sprint 1** : ✅ **OUI**

**Commande pour démarrer** :
```powershell
# 1. Appliquer migration
cd server-new
npx prisma migrate dev --name add_mvp_models_oauth_legal_rbac

# 2. Installer dépendances
npm install passport-google-oauth20 passport-apple passport-amazon passport-facebook speakeasy qrcode resend express-rate-limit helmet csurf

# 3. Lancer dev
npm run dev
```

---

**Bon courage pour le Sprint 1 ! 🚀**  
**Objectif** : OAuth multi-providers + Légal + i18n en 2 semaines  
**Date cible fin Sprint 1** : 20 décembre 2025  

---

**Document créé par** : GitHub Copilot  
**Dernière révision** : 7 décembre 2025  
**Statut** : ✅ Ready to Ship
