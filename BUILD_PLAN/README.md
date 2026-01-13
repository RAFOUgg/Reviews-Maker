# Reviews-Maker - Documentation Complète

## 📋 Vue d'ensemble

**Reviews-Maker** est une plateforme web complète permettant aux utilisateurs de créer, documenter et exporter des fiches techniques détaillées (reviews) pour différents types de produits cannabis.

### Objectif principal
Offrir un système structuré et professionnel pour documenter les produits cannabis avec:
- Saisie de données complète et organisée
- Système de pipeline évolutif (time-series)
- Exports en multiple formats (PNG/JPEG/PDF/SVG/CSV/JSON/HTML)
- Galerie publique avec système de notation
- Gestion des génétiques et phénotypes (producteurs)
- Système de tiers d'abonnement (Amateur/Producteur/Influenceur)

---

## 📂 Structure Documentation

Cette documentation est organisée en fichiers thématiques:

| Fichier | Contenu |
|---------|---------|
| **[README.md](README.md)** | Vue d'ensemble et index |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Architecture système et flux de données |
| **[STACK.md](STACK.md)** | Technologies et dépendances |
| **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** | Hiérarchie complète des dossiers |
| **[FEATURES.md](FEATURES.md)** | Liste exhaustive des fonctionnalités |
| **[GETTING_STARTED.md](GETTING_STARTED.md)** | Guide de démarrage rapide |
| **[DEVELOPMENT.md](DEVELOPMENT.md)** | Workflow et bonnes pratiques |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Déploiement et DevOps |
| **[API.md](API.md)** | Documentation des endpoints API |
| **[TESTING.md](TESTING.md)** | Stratégie et méthodes de test |
| **[SECURITY.md](SECURITY.md)** | Sécurité et authentification |
| **[CONVENTIONS.md](CONVENTIONS.md)** | Standards de codage et style guide |

---

## 🚀 Démarrage Rapide

### Installation & Lancement (5 minutes)

```bash
# Frontend
cd client
npm install
npm run dev  # http://localhost:5173

# Backend (dans un autre terminal)
cd server-new
npm install
npm run check-env
npm run dev  # http://localhost:3000
```

### Vérification de l'environnement
```bash
cd server-new
npm run check-env  # Valide les variables d'environnement
```

---

## 📊 État du Projet

### ✅ Status MVP Beta
- **Date**: Janvier 2026
- **Version**: 1.0.0-beta
- **Statut**: Prêt pour testing externe

### 🎯 Progression
- ✅ Architecture modulaire complète
- ✅ System de pipeline Phase 4.1 CDC-compliant
- ✅ 3 types de produits (Fleur, Hash, Concentré, Comestible)
- ✅ System de tiers (Amateur/Producteur/Influenceur)
- ✅ Exports multi-formats avec templates
- ✅ Authentification OAuth2 + Email/Password
- ✅ Galerie publique avec modération
- ✅ Code cleanup & optimisation complète
- ⏳ System de génétiques (Phase 2)
- ⏳ PhenoHunt et canvas de sélection

### 📈 Métriques Code
- **Frontend**: 311 fichiers JSX, ~50K lignes
- **Backend**: 35+ routes API, Prisma ORM
- **Database**: SQLite3 avec seed data
- **Logs**: Nettoyés (0 console.log en prod)
- **Fichiers inutiles**: Supprimés (94 .bak, 23 fichiers obsolètes)

---

## 🏗️ Architecture Générale

```
Reviews-Maker
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── pages/      # Pages principales
│   │   ├── components/ # Composants réutilisables
│   │   ├── hooks/      # Custom hooks
│   │   └── utils/      # Utilities & helpers
│   └── public/         # Assets statiques
│
├── server-new/          # Backend Node.js + Express
│   ├── routes/         # API endpoints
│   ├── prisma/         # Schema & migrations
│   ├── middleware/     # Express middleware
│   └── session-options.js # Configuration sessions
│
├── data/               # Données statiques (JSON)
├── db/                 # Base de données
└── scripts/            # Scripts utilitaires & diagnostics
```

Pour plus de détails → [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)

---

## 🔑 Concepts Clés

### Pipeline System
Système de saisie structurée permettant de documenter les étapes temporelles d'un processus (culture, curing, extraction, recette).

**Trame de Pipeline**:
- **Jours** - Un jour = une case
- **Semaines** - Une semaine = une case  
- **Phases** - Phases prédéfinies selon type produit
- **Mois** - Un mois = une case

Chaque case contient des données modifiables (notes, images, paramètres).

### Types de Produits
1. **Fleur** - Cannabis séché avec culture pipeline complète
2. **Hash** - Concentré séparé avec pipeline extraction/séparation
3. **Concentré** - Rosin/BHO/Solvant avec pipeline extraction
4. **Comestible** - Produit comestible avec recette

### Tiers d'Abonnement
- **Amateur** (gratuit) - Accès basique, templates prédéfinis
- **Producteur** (29.99€/mois) - All features, customisation complète
- **Influenceur** (15.99€/mois) - Focus preview, exports qualité

---

## 🔐 Authentification

- **OAuth2**: Discord integration (connexion rapide)
- **Email/Password**: Inscription et connexion traditionnelle
- **Sessions**: Gestion via Passport.js + express-session
- **Age Verification**: Vérification obligatoire avant utilisation
- **KYC** (optionnel): Upload documents pour producteurs

---

## 📡 API & Backend

Base URL: `/api/v1/`

**Routes principales**:
- `/api/auth/` - Authentication
- `/api/reviews/` - CRUD reviews
- `/api/exports/` - Export management
- `/api/genetics/` - Genetics management
- `/api/uploads/` - File uploads

Pour documentation complète → [API.md](API.md)

---

## 🎨 Frontend

- **Framework**: React 18 + Vite
- **State**: Zustand (global state)
- **Router**: React Router v6
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Internationalization**: i18next (FR/EN)
- **Exports**: html-to-image, jspdf, jszip

---

## 📦 Dépendances Clés

**Backend**:
- Express.js
- Prisma ORM
- SQLite3
- Passport.js
- Multer (uploads)

**Frontend**:
- React 18
- Vite
- TailwindCSS
- Zustand
- React Router

Pour liste complète → [STACK.md](STACK.md)

---

## 🌐 Déploiement

**VPS**: `vps-lafoncedalle`

```bash
# Build & deploy
./deploy-vps.sh

# ou avec PM2
pm2 start ecosystem.config.cjs
```

Configuration Nginx: `nginx-reviews-maker-ssl.conf`

Pour guide détaillé → [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 👨‍💻 Développement

### Règles Principales
1. **Git Workflow**: Feature branches → Pull Requests
2. **Commits**: Atomiques avec messages explicites
3. **Code Style**: Respect CONVENTIONS.md
4. **Testing**: Validation manuelle en priorité

### Commandes Utiles
```bash
# Frontend dev
cd client && npm run dev

# Backend dev
cd server-new && npm run dev

# Prisma studio (inspect DB)
cd server-new && npm run prisma:studio

# Build frontend
cd client && npm run build

# Check environment
cd server-new && npm run check-env
```

Pour guide complet → [DEVELOPMENT.md](DEVELOPMENT.md)

---

## 📝 Conventions & Standards

- **Nommage**: camelCase (JS), kebab-case (fichiers)
- **React**: Functional components avec hooks
- **Imports**: Grouped (React, libraries, internal)
- **Comments**: JSDoc pour fonctions complexes
- **Formatage**: ESLint + Prettier (si configuré)

Pour détails → [CONVENTIONS.md](CONVENTIONS.md)

---

## 🔒 Sécurité

- **HTTPS**: SSL obligatoire en production
- **Sessions**: httpOnly, secure cookies
- **Auth**: Validation stricte, rate limiting
- **Uploads**: Validation type/size, antivirus scanning
- **Data**: Encryption sensible, sanitization

Pour guide sécurité → [SECURITY.md](SECURITY.md)

---

## 🧪 Testing

- **Manual Testing**: Via navigateur (préféré)
- **End-to-End**: Validation des exports
- **Integration**: Vérification des API flows
- **Build Check**: `npm run build` validation

Pour stratégie détaillée → [TESTING.md](TESTING.md)

---

## 📞 Support & Contact

Pour issues, questions ou suggestions:
- GitHub Issues
- VPS Diagnostics: `scripts/diagnostics.sh`
- Logs Backend: PM2 logs via `ecosystem.config.cjs`

---

## 📜 Changelog

### v1.0.0-beta (Jan 2026)
- ✅ MVP launch ready
- ✅ Code cleanup complète (0 dead code)
- ✅ Pipeline Phase 4.1 CDC-compliant
- ✅ 4 types de produits supportés
- ✅ System de tiers opérationnel

Détails complets → [FEATURES.md](FEATURES.md)

---

## 📚 Ressources Additionnelles

- **CDC (Cahier des Charges)**: Documentation produit détaillée
- **Copilot Instructions**: `.github/copilot-instructions.md`
- **VPS Instructions**: `.github/instructions/vps.instructions.md`
- **Architecture Notes**: Documents dans `/PLAN/`

---

**Dernière mise à jour**: 13 Jan 2026  
**Branche**: main  
**Status**: MVP Beta Ready ✅
