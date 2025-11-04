# 🚀 Reviews-Maker V1DEV - Base de développement propre

**Version** : 1.0 DEV  
**Date** : 4 novembre 2025  
**Statut** : ✅ Fonctionnel - Authentification Discord opérationnelle

---

## 📋 Vue d'ensemble

Application web de gestion de reviews de produits cannabis avec authentification Discord OAuth2.

### Stack technique
- **Frontend** : React 18 + Vite + TailwindCSS
- **Backend** : Node.js + Express + Prisma ORM
- **Base de données** : SQLite
- **Authentification** : Discord OAuth2 + Passport.js
- **Session** : express-session avec cookies httpOnly

---

## 🏗️ Structure du projet

```
Reviews-Maker/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── hooks/         # Custom hooks (useAuth, useStore)
│   │   ├── pages/         # Pages de l'application
│   │   └── store/         # State management (Zustand)
│   ├── public/            # Assets statiques
│   └── package.json
│
├── server-new/            # Backend Express + Prisma
│   ├── config/            # Configuration (Passport)
│   ├── routes/            # Routes API (auth, reviews, users)
│   ├── middleware/        # Middlewares Express
│   ├── prisma/            # Schéma Prisma + migrations
│   ├── .env               # Variables d'environnement (NE PAS COMMIT)
│   └── server.js          # Point d'entrée
│
├── db/                    # Base de données SQLite
│   ├── reviews.sqlite     # Base principale
│   └── review_images/     # Images uploadées
│
├── data/                  # Données statiques JSON
│   ├── aromas.json
│   ├── effects.json
│   ├── tastes.json
│   └── terpenes.json
│
├── docs/                  # Documentation projet
├── archive/               # Anciens fichiers et backups
│
├── *.bat                  # Scripts Windows de démarrage
├── README.md              # Documentation utilisateur
├── QUICKSTART.md          # Guide de démarrage rapide
└── V1DEV.md               # Ce fichier
```

---

## ⚙️ Configuration actuelle

### Variables d'environnement (server-new/.env)

```env
# Discord OAuth2
DISCORD_CLIENT_ID=1435040931375091825
DISCORD_CLIENT_SECRET=<secret>
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback

# Session
SESSION_SECRET=<généré>

# Database
DATABASE_URL="file:../db/reviews.sqlite"

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Ports utilisés
- **Backend API** : `http://localhost:3000`
- **Frontend Dev** : `http://localhost:5173` (ou 5174 si occupé)

---

## 🚀 Démarrage rapide

### Méthode 1 : Script automatique (Recommandé)
```cmd
START_SERVER.bat
```

### Méthode 2 : Manuel
```cmd
# Terminal 1 - Backend
cd server-new
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Méthode 3 : Menu interactif
```cmd
MENU_REVIEWS_MAKER.bat
```

---

## 🔐 Authentification Discord

### Flow OAuth2
1. User clique "Se connecter"
2. Redirection vers Discord OAuth2
3. User autorise l'application
4. Callback vers `/api/auth/discord/callback`
5. Création/Update user en DB via Prisma
6. Session créée avec cookie httpOnly
7. Redirection vers frontend `/auth/callback`
8. Frontend récupère user via `/api/auth/me`
9. User connecté avec avatar et username

### Endpoints API
```
GET  /api/auth/discord          - Initier connexion Discord
GET  /api/auth/discord/callback - Callback OAuth2 (auto)
GET  /api/auth/me               - Infos utilisateur connecté
POST /api/auth/logout           - Déconnexion
```

---

## 📡 API Endpoints

### Reviews
```
GET    /api/reviews              - Liste avec filtres (type, search, page, limit)
GET    /api/reviews/:id          - Détail d'une review
POST   /api/reviews              - Créer (auth + multipart/form-data)
PUT    /api/reviews/:id          - Modifier (ownership requis)
DELETE /api/reviews/:id          - Supprimer (ownership requis)
```

### Users
```
GET    /api/users/:discordId     - Profil utilisateur
GET    /api/users/:discordId/reviews - Reviews d'un utilisateur
```

---

## 🗃️ Schéma de base de données (Prisma)

```prisma
model User {
  id            Int       @id @default(autoincrement())
  discordId     String    @unique
  username      String
  discriminator String?
  avatar        String?
  email         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  reviews       Review[]
}

model Review {
  id          Int       @id @default(autoincrement())
  authorId    Int
  author      User      @relation(fields: [authorId], references: [id])
  holderName  String
  type        String
  brand       String?
  thcContent  Float?
  cbdContent  Float?
  rating      Float
  comment     String?
  imagePath   String?
  aromas      String?   // JSON array
  effects     String?   // JSON array
  tastes      String?   // JSON array
  terpenes    String?   // JSON array
  isPrivate   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Session {
  id        String   @id
  sid       String   @unique
  data      String
  expiresAt DateTime
}
```

---

## 🧪 Tests et vérification

### Vérifier l'état des serveurs
```cmd
CHECK_STATUS.bat
```

Affiche :
- ✅/❌ Processus Node.js actifs
- ✅/❌ Ports 3000 et 5173 en écoute
- 🌐 Adresse IP locale pour accès mobile
- 🔍 Test de connectivité API

### Test manuel backend
```powershell
# Health check
curl http://localhost:3000/api/health

# Test auth endpoint
curl http://localhost:3000/api/auth/me
```

---

## 🔧 Scripts disponibles

| Script | Description |
|--------|-------------|
| `START_SERVER.bat` | Démarrage optimisé avec vérifications |
| `CHECK_STATUS.bat` | Diagnostic complet des serveurs |
| `STOP_DEV.bat` | Arrêt de tous les processus Node.js |
| `OPEN_SITE.bat` | Ouvre le site (détection auto du port) |
| `MENU_REVIEWS_MAKER.bat` | Menu interactif complet |
| `START_DEV_AUTO.bat` | Démarrage automatique au boot Windows |

---

## 📦 Dépendances principales

### Backend (server-new/)
```json
{
  "@prisma/client": "^6.0.0",
  "express": "^4.18.2",
  "express-session": "^1.18.2",
  "passport": "^0.7.0",
  "passport-discord": "^0.1.4",
  "multer": "^1.4.5",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

### Frontend (client/)
```json
{
  "react": "^18.3.1",
  "react-router-dom": "^7.0.2",
  "zustand": "^5.0.2",
  "vite": "^6.4.1",
  "tailwindcss": "^3.4.17"
}
```

---

## 🐛 Problèmes connus résolus

### ✅ Authentification Discord
- **Problème** : Redirection vers mauvais port après callback
- **Solution** : `FRONTEND_URL` corrigé dans `.env`
- **Statut** : ✅ Résolu

### ✅ Scripts .bat
- **Problème** : Chemin `server` au lieu de `server-new`
- **Solution** : Tous les scripts mis à jour
- **Statut** : ✅ Résolu

---

## 🎯 Points d'amélioration pour les prochaines IA

### Priorité HAUTE
1. **Tests unitaires** : Ajouter Jest/Vitest pour frontend et backend
2. **Validation des données** : Zod ou Yup pour valider les inputs
3. **Error boundaries** : Améliorer la gestion d'erreurs React
4. **Logging** : Winston ou Pino pour logs structurés

### Priorité MOYENNE
5. **Optimisation images** : Compression automatique des uploads
6. **Pagination** : Améliorer la pagination des reviews (scroll infini?)
7. **Filtres avancés** : Plus d'options de tri et filtrage
8. **Mode sombre** : Thème dark/light persistant

### Priorité BASSE
9. **PWA** : Progressive Web App pour mobile
10. **Notifications** : Système de notifications temps réel
11. **Export PDF** : Exporter reviews en PDF
12. **Statistiques** : Dashboard avec graphiques

---

## 📚 Documentation complémentaire

- `README.md` - Documentation utilisateur complète
- `QUICKSTART.md` - Guide de démarrage 5 minutes
- `docs/DISCORD_OAUTH_SETUP.md` - Configuration Discord détaillée
- `docs/REFONTE_AUTONOME_2025.md` - Architecture complète
- `archive/` - Anciennes versions et fichiers debug

---

## 🤝 Contribuer / Continuer le développement

### Pour les développeurs
1. Cloner le repo
2. Copier `server-new/.env.example` vers `server-new/.env`
3. Configurer les credentials Discord (voir `QUICKSTART.md`)
4. Lancer `npm install` dans `server-new/` et `client/`
5. Démarrer avec `START_SERVER.bat`

### Pour les IA
- Lire ce fichier `V1DEV.md` en priorité
- Consulter le schéma Prisma dans `server-new/prisma/schema.prisma`
- Vérifier les routes API dans `server-new/routes/`
- Analyser les composants React dans `client/src/components/`
- Respecter l'architecture existante

---

## ✅ Checklist de l'état actuel

- [x] Backend Express fonctionnel
- [x] Frontend React fonctionnel
- [x] Authentification Discord OAuth2 opérationnelle
- [x] Base de données SQLite + Prisma
- [x] Upload d'images fonctionnel
- [x] CRUD reviews complet
- [x] Sessions persistantes (7 jours)
- [x] Scripts de démarrage Windows
- [x] Documentation à jour
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] CI/CD
- [ ] Déploiement production

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier `CHECK_STATUS.bat`
2. Consulter les logs dans les terminaux backend/frontend
3. Vérifier `.env` est bien configuré
4. Lire la documentation dans `docs/`

---

**Version propre et fonctionnelle - Prête pour développement continu** 🚀
