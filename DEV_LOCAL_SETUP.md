# 🚀 Développement Local - Setup Guide

Ce guide explique comment développer **entièrement localement** sans VPS, avec un backend SQLite et frontend Vite.

## ⚡ Quick Start (5 minutes)

### Windows
```bash
# 1. Exécute le script setup
.\setup-dev-local.ps1

# 2. Terminal 1 - Backend
cd server-new
npm run dev

# 3. Terminal 2 - Frontend  
cd client
npm run dev

# 4. Accède à http://localhost:5173
```

### Mac/Linux
```bash
# 1. Exécute le script setup
bash setup-dev-local.sh

# 2. Terminal 1 - Backend
cd server-new
npm run dev

# 3. Terminal 2 - Frontend
cd client
npm run dev

# 4. Accède à http://localhost:5173
```

## 📋 Qu'est-ce qui se passe dans le setup?

Le script `setup-dev-local` automatise:

1. ✅ **Crée `.env`** depuis `.env.example`
2. ✅ **Génère `SESSION_SECRET`** (clé de sécurité)
3. ✅ **Installe les dépendances** (npm install)
4. ✅ **Initialise Prisma** (génère client + DB migrations)
5. ✅ **Crée un utilisateur de test** dans la DB

## 🔑 Credentials de Test

```
Email: test@example.com
Mot de passe: test123456
```

> Créés automatiquement lors du setup

## 🎯 Architecture Locale

```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)               │
│  http://localhost:5173                 │
│                                        │
│  Requêtes API proxy vers:              │
│  http://localhost:3000/api             │
└────────────────────┬────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────┐
│  Backend (Node.js + Express)           │
│  http://localhost:3000                 │
│                                        │
│  Sessions: SQLite                      │
│  Database: SQLite (db/reviews.sqlite)  │
└─────────────────────────────────────────┘
```

## 📂 Structure des Fichiers

```
Reviews-Maker/
├── client/                  # Frontend React
│   ├── src/
│   ├── vite.config.js      # Configure proxy /api → localhost:3000
│   └── npm run dev         # Lance Vite sur 5173
│
├── server-new/             # Backend Express
│   ├── server.js           # Point d'entrée
│   ├── package.json
│   ├── .env               # Configuration (créé par setup)
│   ├── prisma/
│   │   └── schema.prisma  # Schéma DB
│   └── npm run dev        # Lance sur 3000
│
├── db/
│   └── reviews.sqlite     # Base de données (créée automatiquement)
│
├── setup-dev-local.sh     # Setup script (Mac/Linux)
└── setup-dev-local.ps1    # Setup script (Windows)
```

## 🛠️ Commandes Utiles

### Backend

```bash
cd server-new

# Développement en watch mode
npm run dev

# Démarrer sans watch
npm start

# Vérifier environnement
npm run check-env

# Prisma: Générer le client
npm run prisma:generate

# Prisma: Créer/Exécuter migrations
npm run prisma:migrate

# Prisma: Visualiser la DB en GUI
npm run prisma:studio
```

### Frontend

```bash
cd client

# Développement 
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## 🔄 Réinitialiser la Base de Données

Si tu veux recommencer à zéro:

```bash
# 1. Supprime la DB
rm db/reviews.sqlite

# 2. Réexécute les migrations
cd server-new
npm run prisma:migrate

# 3. Recrée l'utilisateur de test
node seed-test-user.js
```

## 🔍 Déboguer la BD

Visualise et édite la DB en GUI:

```bash
cd server-new
npm run prisma:studio
```

Cela ouvre http://localhost:5555 avec une interface interactive pour:
- Voir tous les utilisateurs
- Voir tous les reviews
- Éditer les données directement
- Tester les requêtes

## 🌙 Mode Auto-Login (Optionnel)

En développement, tu peux activer l'auto-login automatique qui te connecte avec le user de test.

Dans ton composant App ou Page principale:

```jsx
import { useDevelopmentAutoLogin } from '@/hooks/useDevelopmentAutoLogin'

export default function App() {
    // Auto-login si mode dev + pas connecté
    useDevelopmentAutoLogin()
    
    return (
        // ... rest of app
    )
}
```

Ou pour remplir le formulaire de login manuellement:

```jsx
import { fillDevTestCredentials } from '@/hooks/useDevelopmentAutoLogin'

export default function LoginPage() {
    useEffect(() => {
        fillDevTestCredentials() // Remplit les inputs
    }, [])
    
    return (
        // ... login form
    )
}
```

## 🐛 Troubleshooting

### ❌ "Port 3000 ou 5173 en utilisation"

```bash
# Voir quel process utilise le port (Mac/Linux)
lsof -i :3000
lsof -i :5173

# Tuer le process
kill -9 <PID>

# Ou utiliser un port différent
PORT=3001 npm run dev
```

### ❌ "Cannot find module 'dotenv'"

```bash
# Réinstalle les dépendances
cd server-new
rm -rf node_modules package-lock.json
npm install
```

### ❌ "ECONNREFUSED 127.0.0.1:3000"

Le backend n'est pas lancé. Assure-toi que:
- Terminal 1 (Backend) est lancé: `cd server-new && npm run dev`
- Le serveur affiche: `✨ Server running on http://localhost:3000`

### ❌ "Prisma: Need to run migrations"

```bash
cd server-new
npm run prisma:migrate
```

### ❌ "No such table: User"

La DB n'a pas été créée. Exécute:

```bash
cd server-new
npm run prisma:migrate
node seed-test-user.js
```

## 📝 Variables d'Environnement

Le fichier `.env` est généré automatiquement, mais tu peux l'éditer:

```env
# Mode
NODE_ENV=development

# Ports
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="file:../db/reviews.sqlite"

# Session
SESSION_SECRET=<auto-généré>
SESSION_SECURE=false

# OAuth (optionnel pour dev - tu peux laisser vides)
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
# ...
```

## 🎓 Workflow Développement Recommandé

1. **Avant de coder**
   ```bash
   git pull origin main
   ```

2. **Crée une branche**
   ```bash
   git checkout -b feat/ma-feature
   ```

3. **Lance le dev local**
   ```bash
   # Terminal 1
   cd server-new && npm run dev
   
   # Terminal 2
   cd client && npm run dev
   ```

4. **Ouvre le navigateur**
   ```
   http://localhost:5173
   ```

5. **Fais tes changements** (hot-reload automatique)

6. **Teste dans le navigateur** et la console

7. **Commit et push**
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin feat/ma-feature
   ```

## 🚀 Déployer sur VPS une fois prêt

Une fois que tout fonctionne localement:

```bash
git push origin feat/ma-feature
# Ouvre une PR
# Merge sur main
# Deploy script redéploiera automatiquement sur le VPS
```

## 💡 Pro Tips

- 🔥 **Hot Reload**: Les fichiers `.jsx` et `.css` se rechargent automatiquement
- 🎯 **Prisma Studio**: Ouvre http://localhost:5555 pour visualiser la DB
- 🐛 **DevTools**: Les erreurs sont visibles en:
  - Terminal (Backend logs)
  - Terminal (Frontend logs)
  - Console du navigateur (F12)
- 📊 **Network Tab**: Vérifie les appels API en F12 → Network

## 📚 Documentation Complète

- [Setup Vite](https://vitejs.dev/guide/)
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs/)
- [SQLite](https://www.sqlite.org/)

---

**Questions?** Vérifie les logs ou ouvre une issue! 🎉
