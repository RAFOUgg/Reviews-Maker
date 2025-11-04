# 🌿 Reviews-Maker - Version 2.0

Application moderne de gestion et création de reviews de cannabis, avec authentification Discord et interface React.

## 🚀 Installation Rapide

### 1. Prérequis
- Node.js 18+ et npm
- Compte Discord Developer (pour OAuth2)

### 2. Configuration Discord
Créer une application Discord et obtenir `DISCORD_CLIENT_ID` et `DISCORD_CLIENT_SECRET`.  
Ajouter l'URL de callback : `http://localhost:3000/api/auth/discord/callback`

### 3. Backend

```powershell
cd server-new
npm install

# Créer et configurer .env
cp .env.example .env
# Éditer .env avec vos credentials Discord

# Initialiser base de données
npx prisma generate
npx prisma migrate dev --name init

# Démarrer serveur
npm run dev
```

### 4. Frontend

```powershell
cd client
npm install
npm run dev
```

### 5. Accéder à l'application
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000

## 📁 Structure du Projet

```
Reviews-Maker/
├── client/          # Frontend React + Vite + TailwindCSS
│   ├── src/         # Code source (components, pages, hooks)
│   └── package.json
├── server-new/      # Backend Express + Prisma + SQLite
│   ├── routes/      # API endpoints (auth, reviews, users)
│   ├── config/      # Configuration (Passport Discord)
│   ├── prisma/      # Schema base de données
│   └── server.js    # Point d'entrée serveur
├── data/            # Données cannabis (terpènes, goûts, effets)
├── db/              # Base SQLite + images uploadées
├── docs/            # Documentation complète (ex docs-refonte/)
└── archive/         # Ancienne version legacy
```

## 🎯 Fonctionnalités

### ✅ Authentification
- Connexion via Discord OAuth2
- Sessions persistantes (7 jours)
- Profils utilisateurs avec avatar Discord

### ✅ Gestion Reviews
- Création avec formulaire complet
- Upload jusqu'à 10 images (10MB max chacune)
- Sélection terpènes, arômes, effets, goûts
- Notes par critère (apparence, arôme, goût, effet)
- Types : Indica, Sativa, Hybride, CBD
- Reviews publiques ou privées

### ✅ Profils Utilisateurs
- Statistiques personnelles (total, moyenne notes)
- Historique complet de reviews
- Profils publics consultables

## 🛠️ Stack Technique

### Frontend
- **React 18** - Interface utilisateur moderne
- **Vite 6** - Build tool ultra-rapide
- **TailwindCSS 3** - Design system avec dark mode
- **Framer Motion** - Animations fluides
- **Zustand** - State management
- **React Router** - Navigation SPA

### Backend
- **Express 4** - API RESTful
- **Prisma ORM** - Gestion base de données
- **SQLite** - Base de données légère
- **Passport.js** - Authentification Discord
- **Multer** - Upload d'images

## 📡 API Endpoints

### Auth
- `GET /api/auth/discord` - Connexion Discord
- `GET /api/auth/discord/callback` - Callback OAuth2
- `GET /api/auth/me` - User connecté
- `POST /api/auth/logout` - Déconnexion

### Reviews
- `GET /api/reviews` - Liste (filtres: type, search, pagination)
- `GET /api/reviews/:id` - Détail review
- `POST /api/reviews` - Créer (auth requis)
- `PUT /api/reviews/:id` - Modifier (ownership requis)
- `DELETE /api/reviews/:id` - Supprimer (ownership requis)

### Users
- `GET /api/users/me/reviews` - Mes reviews
- `GET /api/users/me/stats` - Mes statistiques
- `GET /api/users/:id/profile` - Profil public
- `GET /api/users/:id/reviews` - Reviews publiques user

---

**Status** : Phase 1 en cours (Init React + Vite)  
**Date** : Novembre 2025
