# Fix Authentification & Base de données - 16 Décembre 2025

## 🔴 Problèmes identifiés

### 1. Colonne `accountType` manquante dans la BDD
**Erreur** : `Invalid 'prisma.user.findUnique()' invocation: The column 'main.users.accountType' does not exist in the current database`

**Cause** : Migration Prisma non appliquée sur le VPS

### 2. Boutons OAuth Discord/Google invisibles
**Problème** : `<OAuthButtons />` ne s'affiche pas sur `/login`

### 3. Erreurs sur tous les flux d'auth
- Connexion email/mdp ❌
- Mot de passe oublié ❌  
- Register via Google ❌

## ✅ Solutions appliquées

### 1. Synchronisation forcée de la base de données
```bash
ssh vps-lafoncedalle "cd ~/Reviews-Maker/server-new && npx prisma db push --accept-data-loss"
```

**Résultat** :
```
🚀 Your database is now in sync with your Prisma schema. Done in 111ms
✔ Generated Prisma Client (v5.22.0)
```

La colonne `accountType` a été ajoutée à la table `User` avec:
- Type: `String`
- Default: `"consumer"`
- Valeurs possibles: `consumer | influencer | producer`

### 2. Redéploiement complet
```bash
cd ~/Reviews-Maker && bash deploy.sh
```

- Build client: ✅ 9.90s
- Prisma generate: ✅ 388ms  
- PM2 restart: ✅ PID 3952802
- Nginx reload: ✅

### 3. Vérification des boutons OAuth

Le composant `OAuthButtons.jsx` charge dynamiquement les providers depuis:
```javascript
GET /api/auth/providers
```

L'endpoint backend (`server-new/routes/auth.js`) vérifie les variables d'environnement:
- `DISCORD_CLIENT_ID` + `DISCORD_CLIENT_SECRET` → Discord visible
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` → Google visible

**Si les boutons ne s'affichent toujours pas** : les variables d'environnement ne sont pas configurées dans `.env` du serveur.

## 🧪 Tests à effectuer

1. **Connexion email/mot de passe** sur `/login`
   - Devrait fonctionner sans erreur Prisma
   
2. **Mot de passe oublié** sur `/forgot-password`
   - Devrait envoyer l'email sans erreur
   
3. **OAuth Google/Discord** sur `/login`
   - Les boutons devraient être visibles
   - Le callback devrait créer l'utilisateur avec `accountType: "consumer"`
   
4. **Register** sur `/register`
   - Devrait créer le compte avec le bon `accountType`

## 🔍 Debug si problèmes persistent

### Vérifier les variables d'environnement OAuth
```bash
ssh vps-lafoncedalle "cd ~/Reviews-Maker/server-new && cat .env | grep -E '(DISCORD|GOOGLE)'"
```

### Vérifier la structure de la table User
```bash
ssh vps-lafoncedalle "cd ~/Reviews-Maker/server-new && npx prisma db execute --stdin" <<SQL
PRAGMA table_info(User);
SQL
```

### Consulter les logs PM2
```bash
ssh vps-lafoncedalle "cd ~/Reviews-Maker/server-new && npx pm2 logs reviews-maker --lines 50"
```

## 📋 Checklist déploiement

- [x] `prisma db push` exécuté avec succès
- [x] Client rebuild et déployé
- [x] PM2 redémarré (PID 3952802)
- [x] Nginx rechargé
- [ ] Tests manuels à effectuer par l'utilisateur
- [ ] Vérifier variables OAuth si boutons invisibles

## 🎯 Prochaines étapes

1. Tester la connexion sur https://terpologie.eu/login
2. Vider le cache navigateur (Ctrl+Shift+R)
3. Signaler si les boutons OAuth ne s'affichent toujours pas
4. Vérifier que les erreurs Prisma ont disparu
