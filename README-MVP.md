# 🌿 Reviews-Maker MVP v1.0

**Plateforme de tracabilité et reviews pour produits cannabiniques**

## 🎨 Phase 1 - Design System & Auth (TERMINÉE)

### ✅ Fonctionnalités implémentées

#### Design System V2
- ✨ **6 thèmes Liquid Glass** : Light, Dark, Violet Lean, Vert Émeraude, Bleu Tahiti, Sakura
- 🎭 **Composants UI Apple-like** : LiquidButton, LiquidModal, LiquidCard, LiquidInput
- 🔄 **ThemeSwitcher** avec dropdown animé
- 💫 **Transitions fluides** avec Framer Motion
- 📱 **Responsive** : Desktop, Tablet, Mobile

#### Authentification
- 🔐 **Email/Password** : Login + Signup sécurisés
- 🌐 **OAuth2** : Discord, Google, Apple, Facebook, Amazon
- 👤 **Types de comptes** : Amateur (gratuit), Influenceur (15.99€), Producteur (29.99€)
- 🎯 **LoginPage refonte** complète avec nouveau design

#### Infrastructure
- 🗄️ **Zustand Stores** : themeStore, twoFactorStore
- ⚙️ **Configuration** : accountFeatures avec limits par compte
- 🎨 **Variables CSS** complètes pour tous les thèmes

---

## 🚀 Installation & Déploiement

### Développement local

```bash
# Client
cd client
npm install
npm run dev  # http://localhost:5173

# Serveur
cd server-new
npm install
npm run dev  # http://localhost:3000
```

### Déploiement production

```bash
# Méthode automatique (recommandée)
bash deploy-mvp.sh

# Méthode manuelle
cd client && npm run build
ssh vps-lafoncedalle
cd /home/ubuntu/Reviews-Maker
git pull origin feat/mvp-v1
cd client && npm run build
sudo cp -r dist /var/www/reviews-maker/client/
pm2 restart reviews-maker
sudo systemctl reload nginx
```

---

## 📊 Roadmap MVP (Prochaines phases)

### Phase 2 - Pipelines (Priorité Haute)
- [ ] Pipeline Culture (jours/semaines/phases)
- [ ] Pipeline Curing/Maturation
- [ ] TimelineGrid GitHub-like
- [ ] Saisie données par étape

### Phase 3 - Exports Avancés (Priorité Haute)
- [ ] Templates : Compact, Détaillé, Complet
- [ ] Formats : PNG, JPEG, PDF, SVG
- [ ] Drag & drop personnalisation
- [ ] Qualité selon type compte

### Phase 4 - 2FA & Sécurité (Priorité Moyenne)
- [ ] TOTP (Google Authenticator, Authy)
- [ ] Codes de backup
- [ ] Gestion sessions actives
- [ ] Email 2FA

### Phase 5 - KYC & Compliance (Priorité Moyenne)
- [ ] Upload pièce identité
- [ ] Vérification âge stricte
- [ ] Disclaimer RDR par pays
- [ ] eKYC service tiers

### Phase 6 - Features Avancées (Priorité Basse)
- [ ] Génétique Canvas (arbre généalogique)
- [ ] Galerie publique (likes/comments)
- [ ] Stats avancées producteurs
- [ ] PWA mobile

---

## 🎯 Types de Comptes & Features

### 🌱 Amateur (Gratuit)
- Sections : Général, Visuel, Odeurs, Goûts, Effets
- Templates : Compact, Détaillé
- Exports : PNG, JPEG, PDF standard
- 10 exports/jour max
- 50 reviews max

### 🎬 Influenceur (15.99€/mois)
- Toutes sections + Texture + Expérience
- Templates : Compact, Détaillé, Complet, Social
- Exports : PNG, JPEG, PDF HD, SVG
- 100 exports/jour
- 500 reviews
- Pipelines disponibles
- Watermark personnalisé

### 🏭 Producteur (29.99€/mois)
- Toutes sections + Analytics
- Tous templates + Personnalisé
- Exports : PNG, JPEG, PDF Pro, SVG, CSV, JSON, HTML
- Exports illimités
- Reviews illimitées
- Pipelines complets
- Génétique Canvas
- API access
- Tracabilité complète

---

## 🛠️ Stack Technique

### Frontend
- **Framework** : React 18 + Vite
- **Routing** : React Router v6
- **State** : Zustand (stores)
- **Styling** : Tailwind CSS + Variables CSS
- **Animations** : Framer Motion
- **Icons** : Lucide React
- **i18n** : i18next

### Backend
- **Runtime** : Node.js 24.x
- **Framework** : Express.js
- **Database** : SQLite + Prisma ORM
- **Auth** : Passport.js (OAuth2 + Local)
- **2FA** : Speakeasy
- **Sessions** : express-session + connect-sqlite3
- **Email** : Resend
- **Process** : PM2

### Infrastructure
- **Server** : VPS Ubuntu (OVH)
- **Web Server** : Nginx
- **SSL** : Let's Encrypt
- **Domain** : terpologie.eu
- **Git** : GitHub

---

## 📁 Structure Projet

```
Reviews-Maker/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── assets/           # CSS themes
│   │   ├── components/       # Composants React
│   │   │   ├── LiquidButton.jsx
│   │   │   ├── LiquidModal.jsx
│   │   │   ├── LiquidCard.jsx
│   │   │   ├── LiquidInput.jsx
│   │   │   └── ThemeSwitcher.jsx
│   │   ├── config/           # Configuration
│   │   │   └── accountFeatures.js
│   │   ├── pages/            # Pages
│   │   ├── store/            # Zustand stores
│   │   │   ├── themeStore.js
│   │   │   ├── twoFactorStore.js
│   │   │   └── useStore.js
│   │   └── services/         # API calls
│   └── dist/                 # Build production
│
├── server-new/               # Backend Express
│   ├── routes/               # API routes
│   ├── middleware/           # Middlewares
│   ├── services/             # Business logic
│   ├── prisma/               # Database schema
│   └── config/               # Server config
│
├── deploy-mvp.sh             # Script déploiement auto
└── README-MVP.md             # Cette doc
```

---

## 🌐 URLs Importantes

- **Production** : https://terpologie.eu
- **API** : https://terpologie.eu/api
- **GitHub** : [Votre repo]

---

## 🐛 Debug & Logs

```bash
# Logs PM2 (backend)
pm2 logs reviews-maker

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Status services
pm2 status
sudo systemctl status nginx
```

---

## 📝 Notes de Version

### v1.0.0 - MVP Phase 1 (13/12/2024)
- ✅ Design System Liquid Glass
- ✅ 6 thèmes Apple-like
- ✅ Composants UI de base
- ✅ LoginPage refonte
- ✅ OAuth2 + Email auth
- ✅ Configuration types comptes
- ✅ Infrastructure déploiement

---

## 👨‍💻 Développement

**Auteur** : RAFOUgg  
**License** : MIT  
**Contact** : [Votre contact]

---

## ⚡ Quick Start

```bash
# 1. Clone
git clone [votre-repo]
cd Reviews-Maker

# 2. Install
cd client && npm install
cd ../server-new && npm install

# 3. Config
cp server-new/.env.example server-new/.env
# Éditer .env avec vos credentials

# 4. Dev
npm run dev  # Dans client/
npm run dev  # Dans server-new/

# 5. Deploy
bash deploy-mvp.sh
```

---

**🎉 Bon développement !**
