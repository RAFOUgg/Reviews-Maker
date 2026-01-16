# 🚀 PLAN D'ACTION - Correction de la Base de Données

## ⏰ Temps estimé: 45 minutes

---

## ÉTAPE 1️⃣: Unifier les Enums en FRANÇAIS (15 min)

### 1.1 Correction de `permissions.js`

**Fichier**: `server-new/middleware/permissions.js`

Remplacer les enums anglais par du français:

```javascript
// Avant:
const ACCOUNT_TYPES = {
    CONSUMER: 'consumer',
    INFLUENCER: 'influencer', 
    PRODUCER: 'producer'
}

// Après:
const ACCOUNT_TYPES = {
    CONSOMMATEUR: 'consommateur',
    INFLUENCEUR: 'influenceur',
    PRODUCTEUR: 'producteur'
}
```

Puis mettre à jour les utilisations:
```javascript
// Avant:
return ACCOUNT_TYPES.CONSUMER
return ACCOUNT_TYPES.INFLUENCER
return ACCOUNT_TYPES.PRODUCER

// Après:
return ACCOUNT_TYPES.CONSOMMATEUR
return ACCOUNT_TYPES.INFLUENCEUR
return ACCOUNT_TYPES.PRODUCTEUR
```

### 1.2 Correction de `account.js`

**Fichier**: `server-new/services/account.js`

Remplacer les enums:

```javascript
// Avant:
export const ACCOUNT_TYPES = {
    CONSUMER: 'consumer',
    INFLUENCER: 'influencer',
    PRODUCER: 'producer'
}

// Après:
export const ACCOUNT_TYPES = {
    CONSOMMATEUR: 'consommateur',
    INFLUENCEUR: 'influenceur',
    PRODUCTEUR: 'producteur'
}
```

Mettre à jour la fonction:
```javascript
// Avant:
export function getUserAccountType(user) {
    const roles = getRoles(user)
    
    if (roles.includes('producer') || user.isProducer) {
        return ACCOUNT_TYPES.PRODUCTEUR
    }
    if (roles.includes('influencer') || user.isInfluencer) {
        return ACCOUNT_TYPES.INFLUENCEUR
    }
    
    return ACCOUNT_TYPES.CONSOMMATEUR
}

// Après (français partout):
export function getUserAccountType(user) {
    const roles = getRoles(user)
    
    if (roles.includes('producteur') || user.isProducer) {
        return ACCOUNT_TYPES.PRODUCTEUR
    }
    if (roles.includes('influenceur') || user.isInfluencer) {
        return ACCOUNT_TYPES.INFLUENCEUR
    }
    
    return ACCOUNT_TYPES.CONSOMMATEUR
}
```

### 1.3 Correction de `auth.js`

**Fichier**: `server-new/routes/auth.js`

Vérifier la fonction `sanitizeUser`:

```javascript
// Avant:
const accountType = getUserAccountType(user)  // Retourne français
return {
    accountType,  // ✅ C'est bon
    ...
}

// Après: Vérifier que c'est cohérent
```

Vérifier les dev mock data (ligne ~275):

```javascript
// Avant:
const mockUser = {
    accountType: 'producer',  // ❌ Anglais
    ...
}

// Après:
const mockUser = {
    roles: JSON.stringify({ roles: ['producteur'] }),
    accountType: 'producteur',  // ✅ Français
    ...
}
```

---

## ÉTAPE 2️⃣: Corriger le Frontend (10 min)

### 2.1 Correction de `ProfilePage.jsx`

**Fichier**: `client/src/pages/account/ProfilePage.jsx`

Remplacer les enums anglais par français:

```javascript
// Avant (lignes ~95):
if (profile.accountType === 'producer') {
    badges.push({ icon: '🌱', label: 'Producteur Certifié', color: 'bg-emerald-500' })
} else if (profile.accountType === 'influencer') {
    badges.push({ icon: '⭐', label: 'Influenceur', color: '' })
}

// Après:
if (profile.accountType === 'producteur') {
    badges.push({ icon: '🌱', label: 'Producteur Certifié', color: 'bg-emerald-500' })
} else if (profile.accountType === 'influenceur') {
    badges.push({ icon: '⭐', label: 'Influenceur', color: '' })
}
```

### 2.2 Correction de `permissionSync.js`

**Fichier**: `client/src/utils/permissionSync.js`

Vérifier que les clés sont en français:

```javascript
// Vérifier que c'est:
export const DEFAULT_ACCOUNT_TYPES = {
    consommateur: { value: 'consommateur', label: 'Amateur', badge: '👤' },
    influenceur: { value: 'influenceur', label: 'Influenceur', badge: '⭐' },
    producteur: { value: 'producteur', label: 'Producteur', badge: '🌱' }
}
```

### 2.3 Vérification d'autres fichiers

Chercher tous les fichiers qui utilisent les enums:

```bash
cd client
grep -r "===.*'consumer'" src/
grep -r "===.*'influencer'" src/
grep -r "===.*'producer'" src/
```

Remplacer tous par les versions françaises.

---

## ÉTAPE 3️⃣: Migrer les Comptes Existants (10 min)

### 3.1 Exécuter le script de migration

```bash
cd ~/Reviews-Maker/server-new

# Exécuter la migration
node scripts/migrate-account-types-to-french.js
```

**Résultat attendu**:
```
🔄 Starting Account Types Migration (English → French)...

✅ Migrated 0 consumer → consommateur
✅ Migrated 0 influencer → influenceur
✅ Migrated 1 producer → producteur
✅ Migrated 5 users roles to French
✅ Migrated 0 subscriptionType consumer → consommateur
✅ Migrated 0 subscriptionType influencer → influenceur
✅ Migrated 0 subscriptionType producer → producteur

✅ Migration completed successfully!
```

---

## ÉTAPE 4️⃣: Vous Assigner comme Producteur (5 min)

### 4.1 Exécuter le script d'assignation

```bash
cd ~/Reviews-Maker/server-new

# Vous assigner comme producteur
node scripts/set-user-as-producer.js bgmgaming00@gmail.com
```

**Résultat attendu**:
```
🔧 Setting user as PRODUCTEUR (Producer)...

📋 Found user: RAFOU (bgmgaming00@gmail.com)
Current type: consommateur

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

## ÉTAPE 5️⃣: Redémarrer et Tester (5 min)

### 5.1 Redémarrer le Backend

```bash
# Arrêter
pm2 stop ecosystem.config.cjs

# Vérifier les changements
git diff server-new/

# Vérifier les changements frontend
git diff client/

# Redémarrer
pm2 start ecosystem.config.cjs

# Vérifier
pm2 logs ecosystem --lines 20
```

### 5.2 Vérifier dans le Navigateur

1. **Aller à Settings** (`https://terpologie.eu/account/settings`)
   - ✅ Vérifier que vous voyez "Producteur" (pas "Standard")
   - ✅ Vérifier que le bouton "Gérer l'abonnement" est CACHÉ (car vous êtes producteur)

2. **Aller à Profile** (`https://terpologie.eu/account/profile`)
   - ✅ Vérifier que vous voyez le badge 🌱 "Producteur Certifié"

3. **Vérifier la Console** (F12)
   - ✅ Pas d'erreurs console
   - ✅ Pas de warnings sur account types

### 5.3 Tester l'API

```bash
# Vérifier que /api/auth/me retourne les bonnes données
curl https://terpologie.eu/api/auth/me \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  | jq '.accountType'

# Devrait afficher: "producteur"
```

---

## 🎯 CHECKLIST FINALE

Avant de considérer c'est fait, vérifier:

### Code (Back + Front)
- [ ] `permissions.js` utilise ACCOUNT_TYPES français
- [ ] `account.js` utilise ACCOUNT_TYPES français
- [ ] `auth.js` dev mock data en français
- [ ] `ProfilePage.jsx` compare avec valeurs françaises
- [ ] `permissionSync.js` utilise clés françaises
- [ ] Tous les autres fichiers ne comparent que français

### Base de Données
- [ ] Tous les comptes migrés (consumer → consommateur)
- [ ] Votre compte est "producteur"
- [ ] Votre compte a role "producteur"
- [ ] Votre KYC est "verified"

### Interface Utilisateur
- [ ] SettingsPage affiche "Producteur"
- [ ] ProfilePage affiche badge 🌱
- [ ] Subscribe button est caché
- [ ] Pas d'erreurs console

### Deploy
- [ ] Changements committés
- [ ] Changements pushés
- [ ] Backend redémarré
- [ ] Testé en production

---

## 📝 COMMANDES À EXÉCUTER (Ordre exact)

```bash
# 1. Stager les changements code
git add server-new/middleware/permissions.js
git add server-new/services/account.js
git add server-new/routes/auth.js
git add client/src/pages/account/ProfilePage.jsx
git add client/src/utils/permissionSync.js

# 2. Committer
git commit -m "refactor: Unify account type enums to French (consommateur/influenceur/producteur)"

# 3. Pusher
git push origin refactor/project-structure

# 4. Exécuter les scripts sur le serveur
cd ~/Reviews-Maker/server-new
node scripts/migrate-account-types-to-french.js
node scripts/set-user-as-producer.js bgmgaming00@gmail.com

# 5. Redémarrer
pm2 restart ecosystem.config.cjs

# 6. Tester en local ou en production
# Ouvrir https://terpologie.eu/account/settings
# Ouvrir https://terpologie.eu/account/profile
# F12 → Console (pas d'erreurs)
```

---

## 🚨 EN CAS DE PROBLÈME

### Problème: "Still seeing Standard"

**Solution**:
1. Hard refresh navigateur: `Ctrl+Shift+R`
2. Vérifier que le backend a redémarré: `pm2 status`
3. Vérifier les logs: `pm2 logs ecosystem --lines 50 | grep -i "account\|type"`
4. Vérifier la DB: `SELECT accountType, roles FROM User WHERE email = 'bgmgaming00@gmail.com'`

### Problème: Erreur "Cannot find migration script"

**Solution**:
```bash
# Vérifier que le fichier existe
ls -la ~/Reviews-Maker/server-new/scripts/migrate-account-types-to-french.js

# Si n'existe pas, créer le fichier et copier le contenu fourni
```

### Problème: "AccountType is not defined"

**Solution**:
1. Vérifier que vous avez changé TOUTES les références
2. Vérifier les imports: `import { ACCOUNT_TYPES } from ...`
3. Vérifier que les clés correspondent aux valeurs

---

## ✅ SUCCÈS = Vous verrez

```
┌─────────────────────────────────────┐
│  ⚙️ Paramètres                      │
│  Personaliser votre expérience      │
├─────────────────────────────────────┤
│                                     │
│  👤 RAFOU                          │
│  bgmgaming00@gmail.com              │
│  Type de compte : Producteur ✅     │  ← Au lieu de "Standard"
│                                     │
│  [Connecté via Discord]             │
│  [Gérer l'abonnement] ← CACHÉ       │
│                                     │
└─────────────────────────────────────┘

ET dans le profil:

🌱 Producteur Certifié ✅  ← Badge affiché
```

---

**Durée totale**: ~45 minutes  
**Complexité**: ⭐ Facile (changements simples)  
**Risque**: ⭐ Très faible (changements localisés)  
**Bénéfice**: ⭐⭐⭐⭐⭐ Accès COMPLET producteur
