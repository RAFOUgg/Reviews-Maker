# 🚀 Démarrage Rapide - Reviews-Maker v2.0

**Mode développement local uniquement**

## 📋 Prérequis

- Node.js 18+ et npm
- Compte Discord Developer (gratuit)

## ⚡ Installation en 5 minutes

### 1️⃣ Discord OAuth2

1. Va sur https://discord.com/developers/applications
2. Créer "Reviews-Maker Dev"
3. **OAuth2** → **General** : Copier Client ID + Client Secret
4. **OAuth2** → **Redirects** : Ajouter `http://localhost:3000/api/auth/discord/callback`

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

DISCORD_CLIENT_ID="ton_client_id_ici"
DISCORD_CLIENT_SECRET="ton_secret_ici"
DISCORD_REDIRECT_URI="http://localhost:3000/api/auth/discord/callback"

SESSION_SECRET="genere_une_longue_chaine_aleatoire"
```

**💡 Astuce** : Générer un SESSION_SECRET sécurisé :
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Initialiser la base de données** :
```powershell
npx prisma generate
npx prisma migrate dev --name init
```

### 3️⃣ Frontend

```powershell
cd client
npm install
```

### 4️⃣ Lancer l'application

**Terminal 1 - Backend** :
```powershell
cd server-new
npm run dev
```

**Terminal 2 - Frontend** :
```powershell
cd client
npm run dev
```

### 5️⃣ Utiliser l'app

1. Ouvre http://localhost:5173
2. Clique "Se connecter"
3. Autorise Discord
4. Crée ta première review ! �

---

## 🔧 Commandes Utiles

### Backend

Production (PM2)
```powershell
# Make sure to run these commands from the project root
cd /home/ubuntu/Reviews-Maker/server-new
# Recommended: create ~/.env with the production vars and the correct FRONEND_URL and DISCORD_REDIRECT_URI
pm2 stop reviews-backend || true
pm2 delete reviews-backend || true
# If you use the provided ecosystem.config.cjs to manage PM2 cluster mode (recommended):
pm2 startOrReload ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production

pm2 logs reviews-backend --lines 200
```

If you want to run a single instance while debugging, start directly:
```powershell
pm2 start server-new/server.js --name reviews-backend -i 1 --update-env
```

### Frontend

```powershell
npm run dev      # Dev avec hot-reload
npm run build    # Build pour production
npm run lint     # Vérifier le code
```

---

## 🐛 Problèmes Courants

### Backend ne démarre pas
- Vérifier que `.env` existe avec toutes les variables
- Port 3000 déjà utilisé ? Tuer le processus
- Lancer `npx prisma generate` si erreur Prisma

### Connexion Discord échoue
- Les clés Discord doivent être **entre guillemets** dans `.env`
- Vérifier l'URL de callback sur Discord Developer Portal
- `FRONTEND_URL` doit être `http://localhost:5173`

### Déploiement local sur le LAN / petit serveur (production simple)

Si vous voulez rendre l'app accessible sur votre réseau local (ex: http://192.168.1.38:5173) :

- Dans `server-new/.env` :
	- `FRONTEND_URL` -> set à `http://192.168.1.38:5173` (ou votre IP/nom de domaine)
	- `DISCORD_REDIRECT_URI` -> set à `http://<IP_DE_VOTRE_SERVEUR>:3000/api/auth/discord/callback`
	 - If you host your app under a subpath (eg. https://host/reviews), set `BASE_PATH=/reviews` in `server-new/.env` and configure nginx to proxy `/reviews/api` to backend (see docs/PLAN_IMPLEMENTATION.md).

- Dans le portail Discord Developers: ajouter la même `DISCORD_REDIRECT_URI` à la liste des Redirects autorisés
- Si vous utilisez Vite en local pour servir le frontend, vous pouvez démarrer le frontend avec `npm run dev` et le backend avec `npm run dev`; Vite proxyera `/api` vers `http://localhost:3000` comme en développement. Pour le déploiement node/pm2 vous devez servir le frontend construit (`client/dist`) en statique et configurer le backend sur PM2.

💡 Important: sur un VPS/serveur, assurez-vous que le port 3000 est ouvert et que `sessionId` cookie est accessible entre domaine(s) si vous servez frontend et backend sous des domaines différents (cross-domain cookies requièrent configuration `SameSite` et `secure`).

🔒 Pour les environnements de production : utilisez HTTPS (certificat valide). Les navigateurs refusent d'envoyer des cookies cross-site si `SameSite` est `None` et `secure` n'est pas défini. Si vous servez en HTTP sur le LAN (ex: `http://192.168.x.x`), hostez frontend et backend sous le même domaine/port (ou utilisez un reverse proxy TLS) pour que la session fonctionne correctement.

### Images ne s'affichent pas
- Créer le dossier `db/review_images/` si absent
- Vérifier les logs serveur pour erreurs Multer

### "Cannot find module"
- Supprimer `node_modules/` et refaire `npm install`
- Vérifier que tu es dans le bon dossier

---

## 📚 Plus d'infos

Dossier `docs/` :
- Architecture détaillée
- Design system
- Guide données cannabis
- Composants UX interactifs

---

**C'est parti ! 🌿**
