# 🔐 Guide Configuration OAuth - Discord & Google

## ✅ État actuel

Les configurations serveur sont **OPÉRATIONNELLES** :

- ✅ Variables d'environnement correctement configurées dans `.env`
- ✅ Discord ClientID : `1435040931375091825`
- ✅ Google ClientID : `732826204124-5fsssadqh8j86hgp3f0uegrfgq1kfeva.apps.googleusercontent.com`
- ✅ Callback URLs : `https://terpologie.eu/api/auth/{provider}/callback`
- ✅ Routes Express fonctionnelles (302 redirect vers OAuth providers)
- ✅ API `/api/auth/providers` retourne : `{"providers":["discord","google"]}`

## 🚨 Action requise : Enregistrer les URLs de callback

### 1️⃣ Configuration Discord

**URL :** https://discord.com/developers/applications/1435040931375091825

**Étapes :**
1. Connecte-toi sur Discord Developer Portal
2. Sélectionne ton application (ID: `1435040931375091825`)
3. Va dans **OAuth2** → **Redirects**
4. Clique sur **Add Redirect**
5. Ajoute exactement : `https://terpologie.eu/api/auth/discord/callback`
6. **Sauvegarde** les changements

**Vérification :**
```
URL Discord OAuth: https://discord.com/api/oauth2/authorize?response_type=code&redirect_uri=https%3A%2F%2Fterpologie.eu%2Fapi%2Fauth%2Fdiscord%2Fcallback&scope=identify%20email&client_id=1435040931375091825
```

### 2️⃣ Configuration Google

**URL :** https://console.cloud.google.com/apis/credentials?project=YOUR_PROJECT

**Étapes :**
1. Connecte-toi sur Google Cloud Console
2. Va dans **APIs & Services** → **Credentials**
3. Trouve le Client ID OAuth 2.0 : `732826204124-5fsssadqh8j86hgp3f0uegrfgq1kfeva.apps.googleusercontent.com`
4. Clique dessus pour modifier
5. Dans **Authorized redirect URIs**, clique **+ ADD URI**
6. Ajoute exactement : `https://terpologie.eu/api/auth/google/callback`
7. **Save** les changements

**Vérification :**
```
URL Google OAuth: https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=https%3A%2F%2Fterpologie.eu%2Fapi%2Fauth%2Fgoogle%2Fcallback&scope=profile%20email&client_id=732826204124-5fsssadqh8j86hgp3f0uegrfgq1kfeva.apps.googleusercontent.com
```

## 🧪 Test après configuration

Une fois les URLs enregistrées :

1. Va sur https://terpologie.eu/login
2. Clique sur **Se connecter avec Discord** → Devrait afficher la page d'autorisation Discord
3. Clique sur **Se connecter avec Google** → Devrait afficher la page d'autorisation Google
4. Après autorisation, tu seras redirigé vers `https://terpologie.eu/auth/callback`

## 🔍 Debugging

Si ça ne fonctionne toujours pas :

```bash
# Vérifier les logs serveur
ssh vps-lafoncedalle "tail -f ~/server-oauth.log"

# Tester manuellement l'API
curl https://terpologie.eu/api/auth/providers

# Voir les redirects OAuth
curl -I https://terpologie.eu/api/auth/discord
curl -I https://terpologie.eu/api/auth/google
```

## 📋 Checklist finale

- [ ] Discord : Callback URL ajoutée dans Developer Portal
- [ ] Google : Callback URL ajoutée dans Cloud Console  
- [ ] Test Discord login depuis le site
- [ ] Test Google login depuis le site
- [ ] Vérifier création utilisateur dans la base de données

---

**Note :** Les secrets sont bien configurés côté serveur. Seul l'enregistrement des URLs de callback dans les consoles développeurs manque pour que tout fonctionne.
