# 🚨 HOTFIX - Notes bloquées à 5/10

## 📅 Date : 11 novembre 2025

## ⚠️ Problème Signalé
Une review avec des notes à 9/10 s'enregistre à 5/10 dans la base de données.

## 🔍 Hypothèses

### 1. Problème de Calcul Frontend
- La fonction `calculateCategoryRatings()` ne récupère peut-être pas correctement les valeurs du `formData`
- Les noms de champs dans le mapping ne correspondent peut-être pas aux noms réels dans `formData`

### 2. Problème d'Envoi Backend
- Les données calculées ne sont peut-être pas correctement envoyées au serveur
- Le backend pourrait écraser la note calculée avec une valeur par défaut

### 3. Problème de Mapping Base de Données
- La BDD pourrait avoir une valeur par défaut de 5/10
- La migration précédente pourrait avoir introduit un bug

## 🔧 Actions de Debug Appliquées

### Ajout de Logs dans `calculateCategoryRatings()`
```javascript
console.log('🔍 calculateCategoryRatings:', { productType, formData });
// ... pour chaque champ
console.log(`  📊 ${category}.${fieldKey} = ${value}`);
// ... résultat
console.log('🎯 Résultat final:', { ...ratings, overall: overallRating });
```

### Correction `getCategoryIcon()`
**Avant** :
```jsx
<span className="opacity-70">{getCategoryIcon(category)}</span>
```

**Après** :
```jsx
<span className="opacity-70">{getCategoryIcon(productType, category)}</span>
```

## 🧪 Tests à Effectuer

### Test 1 : Créer Review Fleur
1. Ouvrir console navigateur (F12)
2. Créer review type Fleur
3. Remplir **Visual** avec notes élevées (8-10/10)
4. Remplir **Texture** avec notes élevées (8-10/10)
5. Remplir **Smell**, **Taste**, **Effects**
6. Observer les logs dans la console

### Vérifications
- [ ] Logs `🔍 calculateCategoryRatings` affichent les bonnes valeurs
- [ ] Logs `📊 visual.densite = X` montrent les valeurs saisies
- [ ] Logs `✅ visual = Y.Y` calculent correctement la moyenne
- [ ] Log `🎯 Résultat final` montre `overall` > 5

### Test 2 : Vérifier l'Envoi Backend
Dans CreateReviewPage.jsx ligne ~82-93 :
```javascript
const categoryRatingsData = calculateCategoryRatings();
submitData.append('categoryRatings', JSON.stringify(categoryRatingsData));
submitData.append('overallRating', categoryRatingsData.overall);
```

**Vérifier** :
- [ ] `categoryRatingsData.overall` contient la bonne valeur
- [ ] L'envoi FormData contient bien `overallRating`
- [ ] Le backend reçoit la bonne valeur (logs serveur)

### Test 3 : Vérifier Backend
Fichier `server-new/routes/reviews.js` :
```javascript
// Vérifier que le backend ne force pas note = 5
console.log('📥 Received overallRating:', req.body.overallRating);
```

## 📋 Checklist de Résolution

- [x] Ajouter logs debug dans `calculateCategoryRatings()`
- [x] Corriger signature `getCategoryIcon(productType, category)`
- [ ] Tester création review avec logs console
- [ ] Vérifier valeurs dans `formData`
- [ ] Vérifier calcul des moyennes
- [ ] Vérifier envoi backend
- [ ] Vérifier réception backend
- [ ] Vérifier insertion BDD

## 🔍 Causes Possibles Identifiées

### Si les logs montrent `⚠️ category = 0 (aucune valeur valide)`
→ **Les noms de champs dans le mapping ne correspondent pas aux noms réels du formData**

**Solution** : Comparer le mapping avec `productStructures.js` et ajuster

### Si les logs montrent les bonnes valeurs mais la BDD a 5/10
→ **Le backend écrase la valeur ou a une contrainte par défaut**

**Solution** : Vérifier `server-new/routes/reviews.js` et la définition du schéma Prisma

### Si `formData` est vide ou incomplet
→ **Problème de state management dans React**

**Solution** : Vérifier que `setFormData()` est bien appelé à chaque changement de slider

## 🎯 Prochaine Étape
1. **Lancer le serveur** : `cd client && npm run dev`
2. **Ouvrir console** : F12 dans le navigateur
3. **Créer une review** : Notes élevées sur tous les sliders
4. **Analyser les logs** : Identifier où le calcul échoue
5. **Appliquer le fix** selon la cause identifiée

---

**Status** : 🔄 En diagnostic avec logs activés  
**URL de test** : http://localhost:5174/create?type=Fleur
