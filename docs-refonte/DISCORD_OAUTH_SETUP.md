# 🔐 Configuration Discord OAuth2 - Guide Complet

## 📋 Prérequis

Tu as besoin de créer une application Discord pour obtenir les credentials OAuth2.

---

## 🚀 Étape 1 : Créer l'application Discord

### 1.1 Accéder au Developer Portal
1. Va sur https://discord.com/developers/applications
2. Clique sur **"New Application"**
3. Nomme ton app : **"Reviews Maker DEV"**
4. Accepte les conditions

### 1.2 Configurer OAuth2
1. Dans le menu latéral, clique sur **"OAuth2"**
2. Dans **"Redirects"**, ajoute :
   ```
   http://localhost:3000/api/auth/discord/callback
   ```
3. Clique sur **"Save Changes"**

### 1.3 Récupérer les credentials
1. Sur la page OAuth2, copie :
   - **Client ID** (ex: 1435040931375091825)
   - **Client Secret** (clique sur "Reset Secret" si besoin)

⚠️ **IMPORTANT** : Ne partage JAMAIS ton Client Secret !

---

## 🔧 Étape 2 : Configuration Backend (Phase 2)

### 2.1 Créer le fichier `.env`
Dans `server-new/`, crée un fichier `.env` :

```env
# Discord OAuth2
DISCORD_CLIENT_ID=ton_client_id_ici
DISCORD_CLIENT_SECRET=ton_client_secret_ici
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback

# Session
SESSION_SECRET=un_secret_aleatoire_tres_long_minimum_32_caracteres

# Database
DATABASE_URL="file:../db/reviews.sqlite"

# Server
PORT=3000
NODE_ENV=development
```

### 2.2 Générer un SESSION_SECRET
```powershell
# Génération aléatoire sécurisée
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎯 Étape 3 : Routes Backend à créer (Phase 2)

### Routes nécessaires :
```
GET  /api/auth/discord          → Redirige vers Discord OAuth2
GET  /api/auth/discord/callback → Callback après authentification
GET  /api/auth/me               → Récupère l'utilisateur actuel
POST /api/auth/logout           → Déconnexion
```

### Exemple de flow :
```
1. User clique "Se connecter" → Frontend
2. Redirect vers /api/auth/discord → Backend
3. Discord demande autorisation → Externe
4. Callback vers /api/auth/discord/callback → Backend
5. Création session + Redirect vers /auth/callback → Frontend
6. Frontend récupère user via /api/auth/me → Backend
7. Redirect vers / avec user connecté → Frontend
```

---

## 📦 Dépendances Backend nécessaires

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "passport": "^0.7.0",
    "passport-discord": "^0.1.4",
    "dotenv": "^16.3.1"
  }
}
```

---

## ✅ Checklist Configuration

### Discord Developer Portal
- [ ] Application créée
- [ ] OAuth2 redirect configuré : `http://localhost:3000/api/auth/discord/callback`
- [ ] Client ID copié
- [ ] Client Secret copié

### Backend (Phase 2)
- [ ] Dossier `server-new/` créé
- [ ] Fichier `.env` créé avec credentials
- [ ] Dépendances installées
- [ ] Routes d'authentification créées
- [ ] Middleware session configuré
- [ ] Passport.js configuré avec Discord strategy

### Frontend (Phase 1 ✅)
- [x] Hook `useAuth.js` créé
- [x] Bouton "Se connecter" avec Discord icon
- [x] Route `/auth/callback` créée
- [x] Dropdown menu déconnexion
- [x] Avatar Discord affiché

---

## 🔍 Testing

### Test en dev local :
1. Lance le backend : `cd server-new && npm run dev`
2. Lance le frontend : `cd client && npm run dev`
3. Va sur http://localhost:5173
4. Clique "Se connecter"
5. Autorise l'app Discord
6. Tu dois être redirigé vers `/` avec ton avatar

### Vérifier la session :
```powershell
# Vérifier si connecté
curl http://localhost:3000/api/auth/me -H "Cookie: connect.sid=..."
```

---

## 🚨 Dépannage

### Erreur "redirect_uri mismatch"
→ Vérifie que l'URL dans Discord Developer Portal correspond exactement à `DISCORD_REDIRECT_URI` dans `.env`

### Erreur "invalid_client"
→ Vérifie que `DISCORD_CLIENT_ID` et `DISCORD_CLIENT_SECRET` sont corrects

### Session non persistante
→ Vérifie que `SESSION_SECRET` est défini et que les cookies sont activés

---

## 📚 Ressources

- [Discord OAuth2 Documentation](https://discord.com/developers/docs/topics/oauth2)
- [Passport.js Discord Strategy](https://www.passportjs.org/packages/passport-discord/)
- [Express Session](https://github.com/expressjs/session)

---

**Status actuel** : Frontend prêt ✅ | Backend à créer (Phase 2) ⏳  
**Prochaine étape** : Créer `server-new/` avec routes d'authentification
