# 🔧 Correction Authentification Discord

## ❌ Problème identifié

Les credentials Discord OAuth2 ne sont pas configurés dans le fichier `.env`.

## ✅ Solution en 5 étapes

### Étape 1 : Créer l'application Discord (si pas déjà fait)

1. Va sur https://discord.com/developers/applications
2. Clique sur **"New Application"**
3. Nomme-la : **"Reviews Maker"** (ou "Reviews Maker DEV" pour le dev)
4. Clique **"Create"**

### Étape 2 : Configurer OAuth2

1. Dans le menu latéral, clique sur **"OAuth2"** → **"General"**
2. Copie le **Client ID** (longue série de chiffres)
3. Clique sur **"Reset Secret"** puis copie le **Client Secret** (garde-le secret !)
4. Dans la section **"Redirects"**, clique **"Add Redirect"** et ajoute :
   ```
   http://localhost:3000/api/auth/discord/callback
   ```
5. Clique **"Save Changes"**

### Étape 3 : Mettre à jour le fichier .env

Ouvre le fichier `server-new/.env` et remplace les lignes suivantes :

```env
# Discord OAuth2
DISCORD_CLIENT_ID=TON_CLIENT_ID_ICI_DEPUIS_DISCORD
DISCORD_CLIENT_SECRET=TON_CLIENT_SECRET_ICI_DEPUIS_DISCORD
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
```

⚠️ **Remplace** `TON_CLIENT_ID_ICI_DEPUIS_DISCORD` et `TON_CLIENT_SECRET_ICI_DEPUIS_DISCORD` par les vraies valeurs copiées depuis Discord.

### Étape 4 : Générer un SESSION_SECRET sécurisé

Si ce n'est pas déjà fait, génère un secret aléatoire :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie le résultat et remplace dans `.env` :

```env
SESSION_SECRET=le_secret_genere_ici
```

### Étape 5 : Démarrer le serveur

```powershell
# Terminal 1 : Backend
cd server-new
npm run dev

# Terminal 2 : Frontend
cd client
npm run dev
```

## 🧪 Tester la connexion

1. Ouvre http://localhost:5173
2. Clique sur **"Se connecter"**
3. Tu devrais être redirigé vers Discord
4. Autorise l'application
5. Tu devrais être redirigé vers le site avec ton avatar Discord

## 🔍 Debug si ça ne marche toujours pas

### Vérifier les logs serveur

Le serveur backend devrait afficher :
```
🚀 Server running on http://localhost:3000
📊 Environment: development
🎯 Frontend URL: http://localhost:5173
✅ Ready to accept requests!
```

### Vérifier l'erreur dans la console navigateur

1. Ouvre la console (F12)
2. Clique "Se connecter"
3. Note l'erreur affichée

### Vérifier le redirect URI

L'URL de callback doit EXACTEMENT correspondre dans :
- Discord Developer Portal (OAuth2 → Redirects)
- Fichier `.env` (DISCORD_REDIRECT_URI)

## 📋 Checklist finale

- [ ] Application Discord créée
- [ ] Client ID copié dans `.env`
- [ ] Client Secret copié dans `.env`
- [ ] Redirect URI configuré dans Discord : `http://localhost:3000/api/auth/discord/callback`
- [ ] SESSION_SECRET généré et dans `.env`
- [ ] Backend démarré (`npm run dev` dans `server-new/`)
- [ ] Frontend démarré (`npm run dev` dans `client/`)
- [ ] Test de connexion réussi

## 🆘 Si ça ne marche toujours pas

Partage :
1. L'URL exacte de l'erreur dans le navigateur
2. Les logs du serveur backend
3. L'erreur dans la console navigateur (F12)
