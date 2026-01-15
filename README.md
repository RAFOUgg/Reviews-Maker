# Reviews-Maker - MVP Beta 🚀

Plateforme web complète pour créer, gérer et partager des reviews détaillées sur des produits cannabis avec support complet des pipelines de culture et maturation.

## ✨ Fonctionnalités Principales

- **Création de Reviews** : Fleurs, Hash, Concentrés, Comestibles
- **Pipelines Interactives** : Timeline drag & drop pour documenter culture et curing
- **Export Pro** : PNG, PDF, SVG, JSON, CSV avec templates personnalisés
- **Génétiques (PhenoHunt)** : Arbre généalogique de cultivars
- **Galerie Publique** : Partage et découverte de reviews
- **Authentification** : Discord OAuth + Email/Password
- **Système d'Abonnement** : Amateur, Producteur, Influenceur
- **Vérification KYC** : Documents d'identité pour producteurs

## 🚀 Stack Technique

- **Frontend** : React 18 + Vite, TailwindCSS, React Router v6, Zustand
- **Backend** : Node.js + Express, Prisma + SQLite3
- **Auth** : Passport.js (Discord, Google, Facebook OAuth2)
- **Déploiement** : PM2, Nginx reverse proxy, Docker-ready

## 🛠️ Installation Locale

### ⚡ Quick Start (5 minutes)

**Windows:**
```bash
.\setup-dev-local.ps1  # Setup automatique
```

**Mac/Linux:**
```bash
bash setup-dev-local.sh  # Setup automatique
```

Cela va:
- ✅ Créer `.env` 
- ✅ Générer `SESSION_SECRET`
- ✅ Installer les dépendances
- ✅ Initialiser la DB
- ✅ Créer l'utilisateur de test

Ensuite:

```bash
# Terminal 1 - Backend
cd server-new && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev

# Ouvre http://localhost:5173
```

👉 **Documentation complète:** [DEV_LOCAL_SETUP.md](./DEV_LOCAL_SETUP.md)

### 🔑 Credentials de Test (auto-créés)
```
Email: test@example.com
Mot de passe: test123456
```

### Prérequis
- Node.js 18+ 
- npm ou yarn
- SQLite3 (inclus avec Prisma)

### Configuration (.env)

Le `.env` est créé automatiquement, mais tu peux l'éditer:

```env
# Frontend
FRONTEND_URL=http://localhost:5173

# Backend
NODE_ENV=development
PORT=3000
DATABASE_URL=file:../db/reviews.sqlite

# Session
SESSION_SECRET=<auto-généré>
SESSION_SECURE=false

# OAuth (optionnel pour dev)
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
# ...
```

## 📁 Structure du Projet

Voir [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) pour la documentation complète de l'architecture.

**Résumé** :
- `/client` → Frontend React (Vite)
- `/server-new` → Backend Express + Prisma
- `/data` → Données statiques JSON
- `/scripts` → Scripts de déploiement
- `/db` → Base de données SQLite

## 🚀 Déploiement Production

### VPS (Recommandé)

```bash
# SSH vers le VPS
ssh vps-lafoncedalle

# Déploiement automatisé
./scripts/deploy-vps.sh

# Gestion du serveur
./scripts/manage-server-vps.sh
./scripts/restart-server-vps.sh
```

## 📚 Documentation

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Architecture complète
- **[.github/instructions/](./github/instructions/)** - Guides développement
- **[scripts/README.md](scripts/README.md)** - Documentation scripts

## 🎯 Fonctionnalités MVP Beta

### ✅ Produits Supportés
- **Fleurs (Buds)** - Avec pipelines culture complet
- **Hash** - Avec pipeline séparation/purification
- **Concentrés (Rosin, BHO)** - Avec méthodes extraction
- **Comestibles** - Avec recettes structurées

### ✅ Pipelines Interactives
- **Timeline drag & drop** - Joours/Semaines/Phases
- **Édition multi-cellules** - Sélection et application groupée
- **Préréglages** - Sauvegarde et chargement rapide
- **Déroulé analytique** - Suivi complet du processus

### ✅ Exports
- **Formats** : PNG, JPEG, PDF (1:1, 16:9, A4, 9:16)
- **Templates** : Compact, Détaillé, Complète, Influenceur
- **Personnalisation** : Thèmes, couleurs, filigrane (Producteur)
- **Partage** : Réseaux sociaux + Email

### ✅ Authentification & Sécurité
- **OAuth2** : Discord, Google, Facebook (optionnel)
- **Email/Password** : Authentification classique
- **Session** : Express-session + SQLite3
- **KYC** : Vérification d'identité (Producteur)
- **Age Gate** : Vérification légale (21+)

### ✅ Galerie Publique
- **Découverte** : Filtres avancés par type, notes, récence
- **Interactions** : Likes, commentaires, partages
- **Modération** : Signalement et revue par Admin

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev                    # Frontend + Backend (concurrent)

# Build & Test
npm run build                  # Production build
npm run lint                   # ESLint check

# Base de données
npm run prisma:studio         # Prisma UI
npm run prisma:migrate        # Appliquer migrations
npm run seed                  # Seed données initiales

# Maintenance
./scripts/db-backup.sh        # Backup BD
./scripts/db-restore.sh       # Restore BD
```

## 🐛 Troubleshooting

### Port déjà utilisé
```bash
# Port 5173 (Vite)
lsof -i :5173 | kill -9 [PID]

# Port 3001 (Express)
lsof -i :3001 | kill -9 [PID]
```

### Problèmes de BD
```bash
# Réinitialiser Prisma
rm -rf server-new/prisma/migrations
npm run prisma:generate
npm run prisma:migrate dev --name init
```

### Logs de debug
Les `console.log` ont été supprimés pour le MVP.
Utiliser l'onglet Network des DevTools pour déboguer les API.

## 📊 Monitoring Production

```bash
# Vérifier le statut du serveur
pm2 status

# Voir les logs
pm2 logs reviews-maker

# Redémarrer
pm2 restart reviews-maker

# Arrêter
pm2 stop reviews-maker
```

## 🤝 Contribution

1. Créer une branche feature (`git checkout -b feat/ma-feature`)
2. Commit avec messages clairs (`git commit -m "feat: description"`)
3. Push et créer une Pull Request
4. Vérifier que les tests passent

## 📄 License

Propriétaire - Tous droits réservés

## 📞 Support

Pour les problèmes :
1. Consulter la [documentation](PROJECT_STRUCTURE.md)
2. Vérifier les logs : `pm2 logs`
3. Contacter l'équipe de développement

---

**Status** : MVP Beta Ready 🚀  
**Dernière mise à jour** : 2026-01-13  
**Version** : 1.0.0-beta
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
