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
DISCORD_CALLBACK_URL="http://localhost:3000/api/auth/discord/callback"

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

```powershell
npm run dev              # Dev avec hot-reload
npx prisma studio        # Interface admin DB (http://localhost:5555)
npx prisma migrate dev   # Créer nouvelle migration
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
