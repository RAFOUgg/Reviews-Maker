# Reviews-Maker - Structure du Projet MVP Beta

## 📦 Architecture Globale

### Racine du projet
```
/Reviews-Maker
├── client/                    # Frontend - Vite + React
├── server-new/               # Backend - Express + Prisma  
├── data/                     # Données statiques (JSON)
├── db/                       # Base de données
├── scripts/                  # Scripts de déploiement/maintenance
├── public/                   # Fichiers statiques serveur
├── .github/                  # Configuration GitHub & Instructions
├── .env, .env.example        # Variables d'environnement
├── ecosystem.config.cjs      # Configuration PM2
├── README.md                 # Documentation principale
└── [nginx configs]           # Configuration web serveur
```

### Frontend - client/
```
client/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── auth/           # Authentification
│   │   ├── legal/          # Vérifications légales
│   │   ├── forms/          # Formulaires par type
│   │   ├── pipeline/       # Timeline et pipelines
│   │   ├── export/         # Export et templates
│   │   ├── genetics/       # Génétiques (PhenoHunt)
│   │   ├── orchard/        # Galerie et aperçus
│   │   ├── liquid/         # Composants Apple-like
│   │   ├── ui/             # Composants génériques
│   │   ├── layout/         # Layout principal
│   │   └── kyc/            # Vérification d'identité
│   ├── pages/              # Pages principales
│   ├── hooks/              # Hooks React personnalisés
│   ├── store/              # État global (Zustand)
│   ├── services/           # API & Services
│   ├── utils/              # Utilitaires & Helpers
│   ├── i18n/               # Internationalization
│   ├── data/               # Données locales
│   ├── assets/             # Images, icônes
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/                 # Assets publiques
├── dist/                   # Build output (gitignored)
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Backend - server-new/
```
server-new/
├── routes/                # API Routes
│   ├── reviews.js         # CRUD Reviews
│   ├── genetics.js        # Genetic trees
│   ├── auth.js            # Authentification OAuth
│   ├── legal.js           # Vérifications légales
│   ├── kyc.js             # KYC documents
│   ├── templates.js       # Export templates
│   ├── payment.js         # Paiements
│   └── presets.js         # Pipeline presets
├── services/              # Business logic
│   ├── account.js         # Account management
│   └── [autres services]
├── utils/                 # Utilitaires
│   ├── validation.js
│   ├── errorHandler.js
│   ├── reviewFormatter.js
│   └── geneticsHelper.js
├── middleware/            # Middleware Express
│   ├── auth.js
│   └── rbac.js
├── config/                # Configuration
│   └── passport.js        # OAuth strategies
├── prisma/                # Schema & Migrations
│   ├── schema.prisma
│   └── migrations/
├── scripts/               # Utilitaires de maintenance
├── uploads/               # User uploads
│   ├── review_images/
│   └── kyc_documents/
├── server.js              # Application principale
├── package.json
└── .env.example
```

### Data - data/
```
data/
├── aromas.json            # List d'arômes
├── effects.json           # Effects ressentis
├── tastes.json            # Saveurs
├── terpenes.json          # Terpènes
└── [autres data JSON]
```

### Database - db/
```
db/
├── database.sqlite        # SQLite (dev)
├── backups/              # Backups
└── [migrations]          # Migration tracking
```

### Scripts - scripts/
```
scripts/
├── deploy-vps.sh         # Déploiement VPS
├── start-prod.sh         # Démarrage production
├── restart-server-vps.sh # Redémarrage serveur
├── manage-server-vps.sh  # Gestion serveur
├── db-backup.sh          # Backup base de données
└── README.md             # Documentation scripts
```

## 🎯 Conventions de Code

### Naming Conventions
- **Composants React**: PascalCase (ex: `ReviewForm.jsx`)
- **Fichiers utils/hooks**: camelCase (ex: `useAuth.js`)
- **Dossiers**: kebab-case ou snake_case
- **Variables/Fonctions**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Architecture Patterns
- **Components**: Functional components avec hooks
- **State**: Zustand pour l'état global
- **API**: Services axios avec gestion d'erreur centralisée
- **Forms**: Controlled components avec validation
- **Styles**: Tailwind CSS + composants personnalisés

## 📚 Points d'entrée

### Frontend
- **Entrée**: `client/src/main.jsx`
- **App principal**: `client/src/App.jsx`
- **Build**: `npm run build` → `client/dist/`

### Backend
- **Entrée**: `server-new/server.js`
- **Base URL**: `http://localhost:3001` (dev)
- **Démarrage**: `npm run dev`

## 🚀 Commandes clés

```bash
# Frontend
cd client && npm install && npm run dev    # Développement
npm run build                              # Production build

# Backend
cd server-new && npm install && npm run dev # Développement
npm run prisma:migrate                     # Migrations DB
npm run prisma:studio                      # UI Prisma

# Déploiement VPS
./scripts/deploy-vps.sh                    # Déploiement complet
```

## 🔒 Sécurité & Performance

- **Auth**: Passport.js + Discord OAuth2
- **Sessions**: Express-session + SQLite3
- **CORS**: Configuration restrictive par domaine
- **Uploads**: Multer avec validation MIME type
- **Compression**: Gzip enabled
- **HTTPS**: Nginx avec SSL

## 📝 Notes MVP

- ✅ Suppression des logs/console.log en production
- ✅ Suppression des fichiers de test/debug inutiles
- ✅ Suppression des backups et fichiers temporaires
- ✅ Structure organisée et claire
- ✅ Documentation centralisée

---
Generated: 2026-01-13 | Version: MVP Beta Ready
