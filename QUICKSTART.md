# 🚀 Démarrage Rapide - Reviews-Maker v2.0

## 📋 Prérequis

- Node.js 18+ et npm installés
- Compte Discord Developer (pour OAuth2)
- Git installé

## ⚡ Installation en 5 minutes

### 1️⃣ Configuration Discord OAuth2

1. Aller sur https://discord.com/developers/applications
2. Créer une nouvelle application "Reviews-Maker"
3. Onglet **OAuth2** → Copier **Client ID** et **Client Secret**
4. Ajouter l'URL de redirection : `http://localhost:3000/api/auth/discord/callback`

### 2️⃣ Configuration Backend

```powershell
# Aller dans le dossier backend
cd server-new

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos credentials Discord
notepad .env
```

**Contenu minimal du .env :**
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DATABASE_URL="file:../db/reviews.sqlite"

DISCORD_CLIENT_ID=votre_client_id_ici
DISCORD_CLIENT_SECRET=votre_client_secret_ici
DISCORD_CALLBACK_URL=http://localhost:3000/api/auth/discord/callback

SESSION_SECRET=changez_moi_par_une_chaine_aleatoire_longue
```

**Initialiser la base de données :**
```powershell
# Toujours dans server-new/
npx prisma generate
npx prisma migrate dev --name init
```

### 3️⃣ Configuration Frontend

```powershell
# Depuis la racine du projet
cd client

# Installer les dépendances
npm install
```

### 4️⃣ Lancement

**Terminal 1 - Backend :**
```powershell
cd server-new
npm run dev
```

**Terminal 2 - Frontend :**
```powershell
cd client
npm run dev
```

### 5️⃣ Tester l'application

1. Ouvrir http://localhost:5173 dans votre navigateur
2. Cliquer sur **"Se connecter"** en haut à droite
3. Autoriser l'application Discord
4. Vous êtes connecté ! Créez votre première review 🎉

---

## 🔧 Commandes Utiles

### Backend (server-new/)

```powershell
npm run dev              # Démarrer avec hot-reload
npm start                # Démarrer en production
npm run prisma:generate  # Générer client Prisma
npm run prisma:migrate   # Appliquer migrations
npm run prisma:studio    # Interface admin DB
```

### Frontend (client/)

```powershell
npm run dev      # Serveur dev Vite
npm run build    # Build production
npm run preview  # Preview du build
npm run lint     # Vérifier le code
```

---

## 🐛 Problèmes Courants

### Le backend ne démarre pas

- ✅ Vérifier que `.env` existe et contient toutes les variables
- ✅ Vérifier que le port 3000 n'est pas déjà utilisé
- ✅ Vérifier que Prisma est initialisé : `npx prisma generate`

### La connexion Discord échoue

- ✅ Vérifier `DISCORD_CLIENT_ID` et `DISCORD_CLIENT_SECRET` dans `.env`
- ✅ Vérifier l'URL de callback dans Discord Developer Portal
- ✅ Vérifier que `FRONTEND_URL` pointe vers `http://localhost:5173`

### Les images ne s'affichent pas

- ✅ Vérifier que le dossier `db/review_images/` existe
- ✅ Vérifier les permissions du dossier
- ✅ Vérifier les logs du serveur pour erreurs Multer

### Erreur "Cannot find module"

- ✅ Supprimer `node_modules/` et refaire `npm install`
- ✅ Vérifier que vous êtes dans le bon dossier (client/ ou server-new/)

---

## 📚 Documentation Complète

Pour aller plus loin, consulter le dossier **docs/** :

- `INDEX_REFONTE.md` - Vue d'ensemble du projet
- `REFONTE_AUTONOME_2025.md` - Architecture détaillée
- `DESIGN_SYSTEM.md` - Guide du design
- `DISCORD_OAUTH_SETUP.md` - Configuration OAuth2 détaillée
- `DONNEES_CANNABIS.md` - Listes de données (terpènes, effets, etc.)
- `UX_SAISIE_FACILITEE.md` - Composants interactifs

---

## 🌐 Déploiement Production

Voir les scripts de déploiement :
- `deploy.sh` (Linux/Mac)
- `deploy.ps1` (Windows)
- `ecosystem.config.cjs` (Configuration PM2)
- `nginx.conf` (Configuration Nginx)

---

**Prêt à créer des reviews ! 🌿**
