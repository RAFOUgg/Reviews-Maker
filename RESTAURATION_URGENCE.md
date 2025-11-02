# 🚨 RESTAURATION D'URGENCE - BASE DE DONNÉES

**PROBLÈME:** La migration automatique a renommé tes données localStorage, cassant l'authentification et les préférences.

**SOLUTION:** Restaurer immédiatement les anciennes clés.

---

## ⚡ RESTAURATION RAPIDE (30 secondes)

### Étape 1 : Ouvrir la console

1. Appuie sur **F12** dans ton navigateur
2. Va dans l'onglet **Console**

### Étape 2 : Exécuter le script de restauration

**Copie/colle ce code dans la console :**

```javascript
const keysToRestore = ['authToken', 'authEmail', 'discordUsername', 'discordId', 'siteTheme', 'previewMode'];
let restored = 0;
keysToRestore.forEach(key => {
    const newKey = 'rm_' + key;
    const migratedValue = localStorage.getItem(newKey);
    if (migratedValue !== null) {
        localStorage.setItem(key, migratedValue);
        localStorage.removeItem(newKey);
        console.log(`✅ Restauré: ${key}`);
        restored++;
    }
});
console.log(`✅ ${restored} clés restaurées. Recharge la page: location.reload();`);
```

### Étape 3 : Recharger la page

```javascript
location.reload();
```

---

## 🔍 Vérification

Après rechargement, vérifie que tout est revenu à la normale :

```javascript
// Dans la console
console.log('authToken:', localStorage.getItem('authToken') ? 'OK' : 'ABSENT');
console.log('authEmail:', localStorage.getItem('authEmail'));
```

---

## 📝 Ce qui s'est passé

1. **Migration automatique activée** : Le fichier `compat-layer.js` contenait une fonction qui s'exécutait au chargement
2. **Renommage des clés** : `authToken` → `rm_authToken`, etc.
3. **Suppression des anciennes** : Les clés originales ont été supprimées
4. **Code cassé** : L'ancien code cherchait `authToken` mais ne trouvait plus que `rm_authToken`

## ✅ Correctif Appliqué

J'ai **désactivé la migration automatique** dans `compat-layer.js` pour éviter que ça se reproduise.

La ligne problématique est maintenant commentée :

```javascript
// MIGRATION DÉSACTIVÉE : NE PAS MIGRER AUTOMATIQUEMENT !
// (fonction commentée)
```

---

## 🚀 Prochaines Étapes

1. ✅ **Exécuter le script de restauration** (ci-dessus)
2. ✅ **Recharger la page**
3. ✅ **Vérifier que tout fonctionne**
4. ❌ **NE PAS activer la migration** tant que le code n'est pas entièrement migré

---

## 💡 Pourquoi j'ai fait ça ?

J'ai créé une migration automatique pensant bien faire, mais :
- ❌ L'ancien code utilise **directement** localStorage sans préfixe
- ❌ La migration a cassé la compatibilité
- ✅ La solution : **cohabitation** des deux systèmes pendant la transition

---

**STATUS:** 🔴 Urgent - À faire MAINTENANT  
**Temps:** ⏱️ 30 secondes  
**Risque:** Aucun - Le script restaure simplement les données
