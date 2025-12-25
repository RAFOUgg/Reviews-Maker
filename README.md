# Reviews-Maker

Plateforme web complète pour créer, gérer et partager des avis sur des produits cannabis.

## 🚀 Stack Technique

- **Frontend** : React 18 + Vite, TailwindCSS, React Router v6
- **Backend** : Node.js + Express, SQLite3
- **Auth** : Discord OAuth2 + Email/Password, JWT tokens
- **Déploiement** : PM2, Nginx reverse proxy

## 📦 Quick Start

### Installation

```bash
# Client
cd client
npm install
npm run dev

# Server
cd server-new
npm install
npm start
```

### Configuration

Copier `.env.example` vers `.env` et configurer :

```env
# Discord OAuth (optionnel)
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...

# Email (requis pour signup email)
EMAIL_USER=...
EMAIL_PASS=...

# Database
DB_PATH=../db/reviews.sqlite
```

## 🌐 Déploiement Production

Voir [docs/COMMANDES_DEPLOIEMENT.md](docs/COMMANDES_DEPLOIEMENT.md) pour le workflow complet.

```bash
# VPS
ssh vps-lafoncedalle
cd /home/ubuntu/Reviews-Maker
git pull origin feat/templates-backend
cd client && npm run build
sudo cp -r dist/* /var/www/reviews-maker/client/
pm2 restart reviews-maker
```

## 📚 Documentation

- **[QUICKSTART.md](docs/QUICKSTART.md)** - Guide démarrage rapide
- **[INTEGRATION_COMPLETE_2025-12-12.md](docs/INTEGRATION_COMPLETE_2025-12-12.md)** - Documentation technique complète
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Résolution problèmes courants
- **[CHANGELOG.md](docs/CHANGELOG.md)** - Historique des versions

### Fonctionnalités

- **Reviews** : 3 types de produits (Hash, Concentrés, Edibles)
- **Comptes** : Amateur, Influenceur Basic/Pro, Producteur
- **Galerie** : Orchard avec filtres avancés, exports personnalisés
- **Authentification** : Discord OAuth + Email/Password
- **Système de thèmes** : Light/Dark mode complet

## 🏗️ Architecture

```
client/               # Application React (Vite)
  src/
    components/       # Composants réutilisables
    pages/           # Pages de routing
    services/        # API calls, auth, state
    v2/              # Nouvelle architecture modulaire

server-new/          # Backend Express
  routes/            # API endpoints
  services/          # Business logic
  middleware/        # Auth, validation
  
db/                  # SQLite database + images
docs/                # Documentation projet
archive/             # Anciennes versions archivées
```

## 📝 Workflow Git

```bash
# Créer nouvelle feature
git checkout -b feat/ma-fonctionnalite

# Commits atomiques
git add .
git commit -m "feat: ajout fonctionnalité X"

# Push et Pull Request
git push origin feat/ma-fonctionnalite
```

Voir [docs/GIT_COMMIT_GUIDE.md](docs/GIT_COMMIT_GUIDE.md) pour conventions.

## 🔧 Scripts Utiles

```bash
# Frontend dev
npm run dev          # Dev server avec HMR
npm run build        # Build production
npm run preview      # Preview build

# Backend
npm start            # Server sur port 3000
npm run test         # Tests unitaires
```

## 📦 Archive

Les anciennes versions de documentation et scripts de debug sont archivées dans `archive/` :

- `archive/docs-old/` - Audits, correctifs, analyses (2024-2025)
- `archive/debug-old/` - Scripts de diagnostic temporaires
- `archive/scripts-old/` - Utilitaires obsolètes

## 📞 Support

Pour toute question ou problème :

1. Consulter [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Vérifier [docs/INTEGRATION_COMPLETE_2025-12-12.md](docs/INTEGRATION_COMPLETE_2025-12-12.md)
3. Créer une issue GitHub

---

**Dernière mise à jour** : Décembre 2025  
**Version** : 2.0.0 (feat/templates-backend)
