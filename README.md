# 🌿 Reviews-Maker v2.0

Application moderne de gestion et création de reviews de cannabis, avec authentification Discord et interface React.

**⚠️ Mode développement uniquement - Application locale**

## 🚀 Installation & Lancement

### 1. Prérequis
- Node.js 18+ et npm installés
- Compte Discord Developer (gratuit)

### 2. Configuration Discord OAuth2

1. Va sur https://discord.com/developers/applications
2. Créer une nouvelle application "Reviews-Maker Dev"
3. Dans **OAuth2** → **General**, copier :
   - Client ID
   - Client Secret (cliquer "Reset Secret" si besoin)
4. Dans **OAuth2** → **Redirects**, ajouter :
   ```
   http://localhost:3000/api/auth/discord/callback
   ```

### 3. Configuration Backend

```powershell
cd server-new
npm install

# Créer le fichier .env
cp .env.example .env
```

**Éditer `.env` et remplacer avec tes vraies clés** :
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DATABASE_URL="file:../db/reviews.sqlite"

DISCORD_CLIENT_ID="ton_client_id_ici"
DISCORD_CLIENT_SECRET="ton_secret_ici"
DISCORD_CALLBACK_URL="http://localhost:3000/api/auth/discord/callback"

SESSION_SECRET="genere_une_longue_chaine_aleatoire"
```

**Initialiser la base de données** :
```powershell
npx prisma generate
npx prisma migrate dev --name init
```

**Démarrer le serveur** :
```powershell
npm run dev
```

### 4. Configuration Frontend

**Dans un nouveau terminal** :
```powershell
cd client
npm install
npm run dev
```

### 5. Accès à l'application
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Prisma Studio** : `npx prisma studio` (interface DB)

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

## 📡 API Endpoints (localhost:3000)

### Authentification
- `GET /api/auth/discord` - Initier connexion Discord
- `GET /api/auth/discord/callback` - Callback OAuth2
- `GET /api/auth/me` - Obtenir utilisateur connecté
- `POST /api/auth/logout` - Déconnexion

### Reviews
- `GET /api/reviews` - Liste avec filtres (type, search, page, limit)
- `GET /api/reviews/:id` - Détail d'une review
- `POST /api/reviews` - Créer review (auth + multipart/form-data)
- `PUT /api/reviews/:id` - Modifier review (ownership requis)
- `DELETE /api/reviews/:id` - Supprimer review (ownership requis)

### Utilisateurs
- `GET /api/users/me/reviews` - Mes reviews
- `GET /api/users/me/stats` - Mes statistiques (total, moyenne, breakdown)
- `GET /api/users/:id/profile` - Profil public d'un utilisateur
- `GET /api/users/:id/reviews` - Reviews publiques d'un utilisateur

## 🐛 Troubleshooting

### Le backend ne démarre pas
- Vérifier que le fichier `.env` existe dans `server-new/`
- Vérifier que toutes les variables sont renseignées
- Vérifier que le port 3000 est libre

### Erreur OAuth2Strategy
- Les clés Discord doivent être entre guillemets dans `.env`
- Vérifier que l'URL de callback est bien configurée sur Discord

### Le frontend ne se connecte pas à l'API
- Vérifier que le backend tourne sur port 3000
- Vérifier la console navigateur pour erreurs CORS

## 📚 Documentation

Consulter le dossier `docs/` pour plus d'infos :
- Architecture détaillée
- Design system
- Guide des données cannabis
- Composants UX

---

**Version** : 2.0.0 (Refonte complète)  
**Date** : Novembre 2025  
**Mode** : Développement local uniquement
