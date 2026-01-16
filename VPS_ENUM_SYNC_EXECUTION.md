# Exécution des Correctifs Enum sur VPS

## 📋 Résumé des Changements

✅ **permissions.js** a été synchronisé avec account.js:
- `CONSUMER` → `AMATEUR`
- `PRODUCER` → `PRODUCTEUR`  
- `INFLUENCER` → `INFLUENCEUR`
- `BETA_TESTER` / `MERCHANT` → `ADMIN`

✅ **Commit pushé:** `21036aa`

✅ **Scripts de migration disponibles:**
- `server-new/scripts/migrate-account-types-to-french.js` - Convertit tous les comptes utilisateurs
- `server-new/scripts/set-user-as-producer.js` - Promeut un utilisateur en Producteur

---

## 🔧 Étapes d'Exécution sur le VPS

### 1️⃣ Pull du code corrigé
```bash
cd ~/Reviews-Maker
git fetch origin
git checkout refactor/project-structure
git pull origin refactor/project-structure
```

### 2️⃣ Vérifier que les scripts existent
```bash
ls -la server-new/scripts/migrate-account-types-to-french.js
ls -la server-new/scripts/set-user-as-producer.js
```

### 3️⃣ Installer/Mettre à jour les dépendances
```bash
cd server-new
npm install
```

### 4️⃣ Générer Prisma (si changement de schema)
```bash
npm run prisma:generate
```

### 5️⃣ Exécuter la migration des enums
```bash
node scripts/migrate-account-types-to-french.js
```

**Sortie attendue:**
```
✅ Migration terminée:
   - X utilisateurs mises à jour
   - Enums CONSUMER → AMATEUR
   - Enums PRODUCER → PRODUCTEUR
   - Enums INFLUENCER → INFLUENCEUR
```

### 6️⃣ Promouvoir l'utilisateur bgmgaming00@gmail.com en Producteur
```bash
node scripts/set-user-as-producer.js bgmgaming00@gmail.com
```

**Sortie attendue:**
```
✅ Utilisateur bgmgaming00@gmail.com promu en producteur
   Ancien type: consumer
   Nouveau type: producteur
   Ancien rôles: ["consumer"]
   Nouveau rôles: ["producteur"]
```

### 7️⃣ Redémarrer le backend avec PM2
```bash
pm2 restart ecosystem.config.cjs
pm2 logs ecosystem --lines 20
```

**Vérifier dans les logs:**
```
[RM2] App now started: all processes online
Reviews-Maker successfully started
```

### 8️⃣ Tester l'API
```bash
curl -I https://terpologie.eu/api/auth/me
# Doit retourner 200 (pas 502)

curl https://terpologie.eu/api/auth/me -H "Cookie: sessionId=..." 
# Vérifier que accountType = "producteur"
```

---

## 📝 Commandes Quick (Copier-Coller)

```bash
# ===== PHASE 1: Pull code =====
cd ~/Reviews-Maker && \
git fetch origin && \
git checkout refactor/project-structure && \
git pull origin refactor/project-structure

# ===== PHASE 2: Installer =====
cd ~/Reviews-Maker/server-new && \
npm install && \
npm run prisma:generate

# ===== PHASE 3: Migrer =====
node scripts/migrate-account-types-to-french.js && \
node scripts/set-user-as-producer.js bgmgaming00@gmail.com

# ===== PHASE 4: Redémarrer =====
cd ~/Reviews-Maker && \
pm2 restart ecosystem.config.cjs && \
pm2 logs ecosystem --lines 20

# ===== PHASE 5: Tester =====
curl -I https://terpologie.eu/api/auth/me
```

---

## ✅ Vérifications Post-Déploiement

### 1. Vérifier les enums en DB
```bash
cd ~/Reviews-Maker/server-new
sqlite3 ../db/reviews.sqlite "SELECT id, email, accountType, roles FROM User LIMIT 5;"
```

**Attendu:** accountType doit être 'amateur', 'producteur', 'influenceur', ou 'admin' (jamais 'consumer' ou 'producer')

### 2. Vérifier dans le navigateur
```
https://terpologie.eu/account/settings
✅ Doit afficher: "Producteur" (pas "Standard")

https://terpologie.eu/account/profile
✅ Doit afficher le badge 🌱 (Producteur)
```

### 3. Vérifier console  browser
```
F12 → Console
✅ Aucune erreur "accountType is undefined"
✅ Aucune erreur "Cannot read property 'accountType'"
```

### 4. Vérifier les logs PM2
```bash
pm2 logs ecosystem | grep -i "error\|warn\|account\|permission"
✅ Aucune erreur d'enum non défini
```

---

## 🆘 Dépannage

### Erreur: Scripts not found
**Cause:** Git pull n'a pas fonctionné correctement
```bash
git status  # Vérifier branche correcte
git log --oneline | head -1  # Voir commit actuel
# Doit être: 21036aa fix: Synchronize all ACCOUNT_TYPES enums...
```

### Erreur: Cannot find module 'ACCOUNT_TYPES.AMATEUR'
**Cause:** permissions.js n'a pas été synchronisé correctement
```bash
grep "AMATEUR\|CONSUMER" ~/Reviews-Maker/server-new/middleware/permissions.js
# Doit contenir: AMATEUR (pas CONSUMER)
```

### Erreur 502 après redémarrage
```bash
pm2 logs ecosystem | tail -30  # Voir l'erreur réelle
pm2 stop ecosystem
pm2 delete ecosystem
pm2 start ecosystem.config.cjs
```

### Utilisateur toujours "Standard"
```bash
# Vérifier que la migration s'est bien exécutée
sqlite3 ~/Reviews-Maker/db/reviews.sqlite \
  "SELECT email, accountType FROM User WHERE email='bgmgaming00@gmail.com';"
# Doit afficher: bgmgaming00@gmail.com | producteur
```

---

## 📚 Ressources

- **Commit enum sync:** `21036aa`
- **Migration script:** `server-new/scripts/migrate-account-types-to-french.js`
- **Promotion script:** `server-new/scripts/set-user-as-producer.js`
- **Fichier modifié:** `server-new/middleware/permissions.js`
- **Branche:** `refactor/project-structure`

---

**⏱️ Temps estimé:** 5-10 minutes

**🎯 Résultat attendu:** 
- ✅ Tous les enums français cohérents
- ✅ Utilisateur bgmgaming00@gmail.com en Producteur
- ✅ Interface affiche "Producteur" (pas "Standard")
- ✅ Pas d'erreurs 502
