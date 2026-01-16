# 🔍 AUDIT RÉSUMÉ - Pourquoi Vous Voyez "Standard"

> **Contexte**: Vous êtes connecté, mais votre profil affiche "Standard" au lieu de "Producteur". Ceci n'existe même pas!

---

## 🎯 LE VRAI PROBLÈME EXPLIQUÉ SIMPLEMENT

### Cause Racine

Votre compte est marqué comme `"consumer"` en base de données, alors qu'il devrait être `"producteur"`.

**Pourquoi?** Lors de votre inscription via Discord, le système a assigné automatiquement le rôle par défaut: `consumer` (amateur). 

Personne ne vous a encore **promu en Producteur**.

---

## 🔧 L'INCOHÉRENCE CODE

### Le Code est en Français...

```python
# Le code du projet parle français
# Noms de fichiers: "utilisateur", "profil", "permissions"
# Commentaires: français
# Variable: `accountType` (qui stocke français)
```

### ...Mais les Enums sont en Anglais

```javascript
// Dans permissions.js
const ACCOUNT_TYPES = {
    CONSUMER: 'consumer',      // ❌ Anglais
    INFLUENCER: 'influencer',  // ❌ Anglais
    PRODUCER: 'producer'       // ❌ Anglais
}
```

### Ce qui Cause le Bug

```
Vous êtes en DB:      accountType = 'consumer'

Backend retourne:     'consumer'
                      (pas 'consommateur')

Frontend s'attend à:  'producteur'
                      (valeur française)

Résultat:             Aucune correspondance
                      ↓
                      Affiche le fallback: 'Standard'
```

---

## 📊 LA SITUATION ACTUELLEMENT

### Votre Compte en Base de Données

```json
{
  "id": "your-user-id",
  "username": "RAFOU",
  "email": "bgmgaming00@gmail.com",
  "accountType": "consumer",           // ❌ FAUX
  "roles": "{\"roles\":[\"consumer\"]}",  // ❌ FAUX
  "subscriptionType": null,            // ❌ FAUX
  "subscriptionStatus": "inactive",    // ❌ FAUX
  "kycStatus": null                    // ❌ FAUX
}
```

### Ce que Vous Devriez Avoir

```json
{
  "id": "your-user-id",
  "username": "RAFOU",
  "email": "bgmgaming00@gmail.com",
  "accountType": "producteur",            // ✅ CORRECT
  "roles": "{\"roles\":[\"producteur\"]}", // ✅ CORRECT
  "subscriptionType": "producteur",       // ✅ CORRECT
  "subscriptionStatus": "active",         // ✅ CORRECT
  "kycStatus": "verified"                 // ✅ CORRECT
}
```

---

## 🔄 LA SOLUTION EN 3 ÉTAPES

### Étape 1: Unifier les Enums en FRANÇAIS

Changer TOUS les enums du code pour qu'ils utilisent le français:

```javascript
// Au lieu de:
ACCOUNT_TYPES = { CONSUMER: 'consumer' }

// Utiliser:
ACCOUNT_TYPES = { CONSOMMATEUR: 'consommateur' }
```

**Où?**
- `server-new/middleware/permissions.js`
- `server-new/services/account.js`
- `server-new/routes/auth.js`
- `client/src/pages/account/ProfilePage.jsx`
- `client/src/utils/permissionSync.js`

### Étape 2: Migrer les Comptes Existants

Exécuter un script qui change TOUS les comptes de "consumer" → "consommateur":

```bash
node server-new/scripts/migrate-account-types-to-french.js
```

### Étape 3: Vous Assigner comme Producteur

Exécuter un script qui vous promeut:

```bash
node server-new/scripts/set-user-as-producer.js bgmgaming00@gmail.com
```

---

## 📋 CE QUI CHANGE APRÈS LA FIX

### Dans votre Profil (Settings)

```
AVANT:
┌─────────────────────────┐
│ RAFOU                   │
│ bgmgaming00@gmail.com   │
│ Type: Standard ❌       │ ← Incorrect!
│ [Gérer l'abonnement]    │ ← Visible
└─────────────────────────┘

APRÈS:
┌─────────────────────────┐
│ RAFOU                   │
│ bgmgaming00@gmail.com   │
│ Type: Producteur ✅     │ ← Correct!
│ [Gérer...] ← CACHÉ      │ ← Logique
└─────────────────────────┘
```

### Dans votre Profil Public

```
AVANT:
👤 RAFOU
(aucun badge)

APRÈS:
👤 RAFOU
🌱 Producteur Certifié  ← Badge affiché!
```

### Vos Droits d'Accès

```
AVANT: Accès Consumer (limité)
- Créer des reviews
- Exporter basique
- Pas de PhenoHunt
- Pas de templates personnalisés

APRÈS: Accès Producteur (complet)
- Créer des reviews
- Exporter avancé (SVG, CSV, JSON, PDF 300dpi)
- Accès PhenoHunt (génétique, phénotypes)
- Templates personnalisés
- Drag-and-drop layouts
- Tout! ✅
```

---

## ⏱️ TEMPS DE CORRECTION

| Étape | Durée | Complexité |
|-------|-------|-----------|
| 1. Unifier enums (code) | 15 min | ⭐ Facile |
| 2. Migrer BD | 5 min | ⭐ Facile |
| 3. Vous assigner | 5 min | ⭐ Facile |
| 4. Tester | 10 min | ⭐ Facile |
| **TOTAL** | **35 min** | **Très facile** |

---

## 🎬 COMMANDES EXACTES À EXÉCUTER

### 1️⃣ Modifier le Code (sur votre machine locale)

Voir le fichier: `PLAN_ACTION_CORRECTION_FRENCH.md` pour les changements détaillés.

En résumé:
```bash
# Éditer ces fichiers et remplacer les enums:
# - server-new/middleware/permissions.js
# - server-new/services/account.js
# - server-new/routes/auth.js
# - client/src/pages/account/ProfilePage.jsx
# - client/src/utils/permissionSync.js

git add -A
git commit -m "refactor: Use French enums for account types"
git push origin refactor/project-structure
```

### 2️⃣ Sur le VPS (après push)

```bash
cd ~/Reviews-Maker
git pull origin refactor/project-structure

# Migration 1: Comptes existants
cd server-new
node scripts/migrate-account-types-to-french.js

# Migration 2: Vous assigner producteur
node scripts/set-user-as-producer.js bgmgaming00@gmail.com

# Restart
pm2 restart ecosystem.config.cjs
pm2 logs ecosystem
```

### 3️⃣ Dans le Navigateur

```
1. Aller à: https://terpologie.eu/account/settings
   ✅ Vérifier "Producteur" au lieu de "Standard"

2. Aller à: https://terpologie.eu/account/profile
   ✅ Vérifier le badge 🌱 "Producteur Certifié"

3. Appuyer F12 → Console
   ✅ Pas d'erreurs rouges
```

---

## 🚨 POURQUOI ÇA ARRIVE

### Raison 1: Mélange Français/Anglais

La base de code est **française**, mais les enums étaient en **anglais**. Confusion!

### Raison 2: Pas d'Admin Panel

Il n'y a pas encore d'interface pour assigner les rôles. Donc une fois inscrit, vous restez "consumer".

### Raison 3: Dev vs Production

En développement, le mock data utilisait l'anglais. En production, le backend retourne parfois français, parfois anglais.

---

## ✅ CHECKLIST AVANT/APRÈS

### Avant la Correction
- [ ] ❌ Code mélange français/anglais
- [ ] ❌ "Standard" affiché au lieu de "Producteur"
- [ ] ❌ Pas de badge sur profil
- [ ] ❌ Accès limité aux features producteur
- [ ] ❌ Inconsistance entre DB et frontend

### Après la Correction
- [ ] ✅ Code unifié en français
- [ ] ✅ "Producteur" affiché correctement
- [ ] ✅ Badge 🌱 sur profil
- [ ] ✅ Accès COMPLET producteur
- [ ] ✅ Tout cohérent partout

---

## 🎯 LE RÉSULTAT FINAL

Vous verrez ceci dans votre SettingsPage:

```
┌───────────────────────────────────────┐
│         ⚙️ PARAMÈTRES                 │
├───────────────────────────────────────┤
│                                       │
│  RAFOU                                │
│  bgmgaming00@gmail.com                │
│  Type de compte : Producteur ✨       │  ← BINGO!
│                                       │
│  Connecté via Discord                 │
│  Membre depuis 16/01/2026             │
│  [Gérer l'abonnement] ← CACHÉ         │
│                                       │
└───────────────────────────────────────┘
```

Et dans votre profil public:

```
┌──────────────────────┐
│                      │
│  👤 RAFOU            │
│  🌱 Producteur Cert. │  ← VOILÀ!
│                      │
│  [Voir reviews...]   │
│                      │
└──────────────────────┘
```

---

## 📚 DOCUMENTS DISPONIBLES

1. **AUDIT_COMPLET_DATABASE_V1_MVP.md** - Audit détaillé (70 points)
2. **PLAN_ACTION_CORRECTION_FRENCH.md** - Guide étape par étape (code exact)
3. **AUDIT_FINAL_POUR_RAFOU.md** - Synthèse visual
4. **server-new/scripts/migrate-account-types-to-french.js** - Script migration
5. **server-new/scripts/set-user-as-producer.js** - Script promotion

---

## 🎬 NEXT STEPS

1. ✅ Lire ce document (vous le faites)
2. ✅ Consulter `PLAN_ACTION_CORRECTION_FRENCH.md` pour le code
3. ⏳ Modifier les 5 fichiers mentionnés
4. ⏳ Committer et pusher
5. ⏳ Exécuter les scripts sur VPS
6. ⏳ Vérifier dans le navigateur
7. ✅ Profitez du statut Producteur!

---

## 💬 EN RÉSUMÉ POUR LES PRESSÉS

**Q: Pourquoi je vois "Standard"?**  
R: Vous êtes en "consumer" en DB, et il y a incohérence enums français/anglais.

**Q: Comment ça se fix?**  
R: 3 étapes (15 min code + 20 min scripts) = vous êtes "producteur".

**Q: Ça risque de casser quelque chose?**  
R: Non, changements très simples et localisés.

**Q: Après, j'aurai accès à quoi?**  
R: TOUT. PhenoHunt, templates personnalisés, export 300dpi SVG/CSV/JSON, etc.

---

**Statut**: 🟢 Prêt à implémenter  
**Durée**: 35-45 minutes  
**Risque**: Très faible  
**Bénéfice**: Accès COMPLET producteur

**Allez-y!** 🚀
