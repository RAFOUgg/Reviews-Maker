# 🔧 VPS Migration Scripts - CORRECTED

## Problèmes Résolus

✅ **Erreur 1: Shebang bash au lieu de commentaire JavaScript**
- Les fichiers avaient `#!/bin/bash` au lieu d'un commentaire JS
- **Fixé:** Remplacé par des commentaires `/** ... */`

✅ **Erreur 2: Migration vers `consommateur` au lieu de `amateur`**
- `account.js` définit `AMATEUR` (pas `consommateur`)
- Les scripts migraient vers `consommateur` (incorrect)
- **Fixé:** Tous les changements utilisent maintenant `amateur`

---

## Commit

```
0d9fe25 fix: Correct migration scripts - fix shebang syntax and use AMATEUR instead of CONSOMMATEUR
```

---

## 🚀 Exécution Corrigée sur le VPS

```bash
# 1. Pull le code (incluant les corrections)
cd ~/Reviews-Maker
git pull origin refactor/project-structure

# 2. Migrer les enums (MAINTENANT ÇA FONCTIONNE!)
cd server-new
node scripts/migrate-account-types-to-french.js

# 3. Promouvoir l'utilisateur
node scripts/set-user-as-producer.js bgmgaming00@gmail.com

# 4. Redémarrer
cd ..
pm2 restart ecosystem.config.cjs

# 5. Vérifier
curl -I https://terpologie.eu/api/auth/me
```

---

## Sortie Attendue

```
🔄 Starting Account Types Migration (English → French)...

✅ Migrated 1 consumer → amateur
✅ Migrated 0 influencer → influenceur
✅ Migrated 0 producer → producteur
✅ Migrated 1 users roles to French
✅ Migrated 0 subscriptionType consumer → amateur
✅ Migrated 0 subscriptionType influencer → influenceur
✅ Migrated 0 subscriptionType producer → producteur

✅ Migration completed successfully!

🔧 Setting user as PRODUCTEUR (Producer)...

📋 Found user: (bgmgaming00@gmail.com)
Current type: amateur

✅ User updated successfully!

New configuration:
  accountType:      producteur
  roles:            {"roles":["producteur","admin"]}
  subscriptionType: producteur
  subscriptionStatus: active
  kycStatus:        verified

Next steps:
1. Restart backend: pm2 restart ecosystem.config.cjs
2. Clear browser cache: Ctrl+Shift+R
3. Reload page and verify SettingsPage shows "Producteur"
4. Check ProfilePage for 🌱 badge
```

---

## ✅ Vérification

Après redémarrage, naviguer vers:
- `https://terpologie.eu/account/settings` → Doit afficher **"Producteur"**
- `https://terpologie.eu/account/profile` → Doit afficher badge **🌱**

Pas d'erreur 502 ✅
