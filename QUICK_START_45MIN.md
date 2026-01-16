# ⚡ QUICK START - Vous corriger en 45 minutes

> **Pour ceux qui veulent juste AGIR, sans lire toute la doc**

---

## 🎯 LE PROBLÈME EN 1 PHRASE

Vous voyez "Standard" parce que vous êtes marqué comme `consumer` en DB, et il y a une incohérence entre enums français et anglais.

---

## ✅ LA SOLUTION EN 3 ÉTAPES

### Étape 1: Modifier le Code (15 min)

Les enums doivent être en FRANÇAIS puisque c'est un projet français.

**Fichiers à modifier**: 5 fichiers

Copier-coller les changements de: [`PLAN_ACTION_CORRECTION_FRENCH.md`](./PLAN_ACTION_CORRECTION_FRENCH.md)

Sections ÉTAPE 1, 2, 3 du document.

Puis:
```bash
git add -A
git commit -m "refactor: Use French enums for account types"
git push origin refactor/project-structure
```

### Étape 2: Migrer la DB (10 min)

Sur le VPS:
```bash
cd ~/Reviews-Maker
git pull origin refactor/project-structure

cd server-new

# Convertir tous les enums anglais en français
node scripts/migrate-account-types-to-french.js

# Vous assigner comme producteur
node scripts/set-user-as-producer.js bgmgaming00@gmail.com
```

### Étape 3: Redémarrer et Tester (10 min)

```bash
pm2 restart ecosystem.config.cjs
pm2 logs ecosystem --lines 20
```

Dans le navigateur:
1. Aller à `https://terpologie.eu/account/settings`
   - ✅ Vérifier "Producteur" au lieu de "Standard"

2. Aller à `https://terpologie.eu/account/profile`
   - ✅ Vérifier le badge 🌱

3. Appuyer `F12` → Console
   - ✅ Pas d'erreurs rouges

---

## 📋 CHECKLIST

- [ ] Lire ce document (2 min)
- [ ] Modifier 5 fichiers (15 min)
- [ ] Committer et pusher (5 min)
- [ ] Exécuter script migration (5 min)
- [ ] Exécuter script promotion (2 min)
- [ ] Redémarrer backend (2 min)
- [ ] Tester dans navigateur (5 min)
- [ ] ✅ Vous êtes "Producteur"!

**Temps total**: 45 minutes

---

## 🚀 COMMANDES À COPIER-COLLER

### Localement
```bash
# 1. Modifier les 5 fichiers
# (Voir PLAN_ACTION_CORRECTION_FRENCH.md)

git add -A
git commit -m "refactor: Use French enums for account types"
git push origin refactor/project-structure
```

### Sur le VPS
```bash
cd ~/Reviews-Maker
git pull origin refactor/project-structure

cd server-new

# 2. Migrer les comptes
node scripts/migrate-account-types-to-french.js

# 3. Vous assigner
node scripts/set-user-as-producer.js bgmgaming00@gmail.com

# 4. Redémarrer
pm2 restart ecosystem.config.cjs
```

### Dans le navigateur
```
1. https://terpologie.eu/account/settings
   → Vérifier "Producteur"

2. https://terpologie.eu/account/profile
   → Vérifier badge 🌱

3. F12 → Console
   → Pas d'erreurs
```

---

## 📖 SI VOUS ÊTES BLOQUÉ

**Q: Où sont les changements de code à faire?**  
R: [`PLAN_ACTION_CORRECTION_FRENCH.md`](./PLAN_ACTION_CORRECTION_FRENCH.md) - ÉTAPE 1, 2, 3

**Q: Script migration ne trouve pas Prisma?**  
R: `npm install` d'abord dans `server-new/`

**Q: Toujours "Standard" après restart?**  
R: Hard refresh navigateur: `Ctrl+Shift+R`

**Q: Je dois voir le détail?**  
R: [`POURQUOI_VOUS_VOYEZ_STANDARD.md`](./POURQUOI_VOUS_VOYEZ_STANDARD.md)

---

## 📊 RÉSULTAT ATTENDU

```
AVANT:
Type de compte: Standard ❌
Badge: (aucun) ❌
Accès producteur: Non ❌

APRÈS:
Type de compte: Producteur ✅
Badge: 🌱 Producteur Certifié ✅
Accès producteur: Oui ✅
```

---

## ⏰ TIMELINE

```
t=0:    Lire ce document (2 min)
t=2:    Modifier code (15 min)
t=17:   Commit & push (5 min)
t=22:   Arriver sur VPS
t=22:   Migration DB (5 min)
t=27:   Promotion user (2 min)
t=29:   Redémarrer (2 min)
t=31:   Tester (10 min)
t=41:   ✅ DONE!
```

---

## 🎁 VOUS GAGNEZ

Après cette étape:
- ✅ Accès complet Producteur
- ✅ PhenoHunt (génétique, phénotypes)
- ✅ Templates personnalisés drag-drop
- ✅ Export avancé (SVG, CSV, JSON, PDF 300dpi)
- ✅ Features déblocage complet
- ✅ Tout! 🚀

---

## 🚀 C'EST PARTI!

1. **Lire**: [`PLAN_ACTION_CORRECTION_FRENCH.md`](./PLAN_ACTION_CORRECTION_FRENCH.md)
   - Sections ÉTAPE 1 → 3 (code exact)

2. **Copier-coller** les changements

3. **Exécuter** les commandes

4. **Vérifier** dans navigateur

**Vous serez "Producteur" dans moins d'une heure!** 💪

---

**Besoin d'aide?** → [`POURQUOI_VOUS_VOYEZ_STANDARD.md`](./POURQUOI_VOUS_VOYEZ_STANDARD.md)  
**Implémentation détaillée?** → [`PLAN_ACTION_CORRECTION_FRENCH.md`](./PLAN_ACTION_CORRECTION_FRENCH.md)  
**Audit complet?** → [`AUDIT_COMPLET_DATABASE_V1_MVP.md`](./AUDIT_COMPLET_DATABASE_V1_MVP.md)

**Allez-y!** 🚀
