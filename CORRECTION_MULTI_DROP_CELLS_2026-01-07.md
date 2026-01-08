# Correction bugs multi-drop et cellules multiples

**Date:** 07/01/2026  
**Fichiers modifiés:**
- `client/src/components/pipeline/PipelineDragDropView.jsx`
- `client/src/components/pipeline/PipelineDataModal.jsx`

---

## 🐛 Bugs identifiés

### Bug #1: Multi-drop ne sauvegarde qu'un seul champ
**Symptôme:** Lorsqu'on drop plusieurs données avec plusieurs valeurs assignées à une case, seule une donnée reste dans la case.

**Exemple:**
- Drop: Type d'irrigation, Fréquence d'arrosage, Volume par arrosage
- Résultat attendu: Les 3 champs sauvegardés
- Résultat obtenu: Seul "Volume par arrosage" reste

**Cause:** Le code itérait bien sur tous les items du multi-drop, MAIS n'appliquait les changements qu'à la cellule courante (`data.timestamp`), sans prendre en compte les cellules sélectionnées.

---

### Bug #2: Sélection multiple ne reçoit les données que sur la dernière case
**Symptôme:** Quand on sélectionne 4 cases (Ctrl+clic) et qu'on drop une ou plusieurs données dedans, seule la dernière case récupère les données.

**Exemple:**
- Sélection: J12, J13, J14, J15
- Drop: Volume par arrosage
- Résultat attendu: Les 4 cellules ont "Volume par arrosage"
- Résultat obtenu: Seule J15 a la donnée

**Cause:** Même racine que Bug #1 - `handleModalSave` traitait uniquement `data.timestamp` au lieu de boucler sur `selectedCells`.

---

## ✅ Solution implémentée

### 1. Refactoring complet de `handleModalSave`

**Ancienne logique:**
```javascript
// ❌ Traite uniquement data.timestamp
const prevData = getCellData(data.timestamp) || {};
onDataChange(data.timestamp, fieldKey, value);
```

**Nouvelle logique:**
```javascript
// ✅ Déterminer les cellules cibles
const targetTimestamps = (selectedCells.length > 0 && selectedCells.includes(data.timestamp))
    ? selectedCells           // Toutes les cellules sélectionnées
    : [data.timestamp];       // Uniquement la cellule courante

// ✅ Appliquer à TOUTES les cellules cibles
targetTimestamps.forEach(targetTimestamp => {
    const prevData = getCellData(targetTimestamp) || {};
    // ... traitement pour chaque cellule
    onDataChange(targetTimestamp, fieldKey, value);
});
```

**Bénéfices:**
- ✅ Multi-drop applique **tous les champs** à **toutes les cellules**
- ✅ Single drop applique **le champ** à **toutes les cellules sélectionnées**
- ✅ Édition manuelle fonctionne sur cellule unique ou sélection multiple
- ✅ Historique (undo/redo) enregistre tous les changements

---

### 2. Simplification de `handleSubmit` dans PipelineDataModal

**Ancienne logique:**
```javascript
// ❌ Boucle dans le modal
const targets = selectedCells.length > 0 ? selectedCells : [timestamp];
targets.forEach(ts => {
    onSave({ timestamp: ts, data: formData });
});
```

**Nouvelle logique:**
```javascript
// ✅ Appel unique, handleModalSave gère la distribution
onSave({
    timestamp: timestamp,
    data: formData
});
```

**Pourquoi ?**
- Évite la duplication de logique
- `handleModalSave` devient le point central pour toute la distribution multi-cellules
- Logs plus clairs et traçables

---

## 🧪 Scénarios de test

### Test 1: Multi-drop sur une cellule
1. Sélectionner 3 champs (Ctrl+clic): Type irrigation, Fréquence, Volume
2. Drag & drop sur J15
3. Remplir les valeurs dans le modal
4. Cliquer "Enregistrer"
5. ✅ **Attendu:** Les 3 champs sont sauvegardés dans J15
6. Réouvrir J15 pour vérifier

### Test 2: Single drop sur plusieurs cellules
1. Sélectionner 4 cases (Ctrl+clic): J12, J13, J14, J15
2. Drag & drop "Volume par arrosage"
3. Entrer une valeur (ex: "2.5")
4. Cliquer "Enregistrer"
5. ✅ **Attendu:** Les 4 cellules ont "Volume par arrosage = 2.5"
6. Vérifier chaque cellule

### Test 3: Multi-drop sur plusieurs cellules
1. Sélectionner 3 cases: J10, J11, J12
2. Sélectionner 2 champs (Ctrl+clic): Température, Humidité
3. Drag & drop sur la sélection
4. Remplir les valeurs
5. Cliquer "Enregistrer"
6. ✅ **Attendu:** Les 3 cellules ont les 2 champs avec les mêmes valeurs
7. Vérifier chaque cellule

### Test 4: Vérification logs console
1. Ouvrir la console F12
2. Effectuer un multi-drop sur 3 cellules sélectionnées
3. ✅ **Attendu dans les logs:**
```
🎯 Application des données à 3 cellule(s): [timestamp1, timestamp2, timestamp3]
  ✓ Multi-items drop sur timestamp1: 2 champs
    → typeIrrigation = Goutte à goutte
    → volumeArrosage = 2.5
  ✓ Multi-items drop sur timestamp2: 2 champs
    → typeIrrigation = Goutte à goutte
    → volumeArrosage = 2.5
  ✓ Multi-items drop sur timestamp3: 2 champs
    → typeIrrigation = Goutte à goutte
    → volumeArrosage = 2.5
✅ Sauvegarde terminée: 3 cellule(s) modifiée(s)
```

### Test 5: Undo/Redo
1. Effectuer un multi-drop sur 4 cellules
2. Appuyer sur Ctrl+Z (undo)
3. ✅ **Attendu:** Les 4 cellules sont vidées (pas seulement une)
4. Appuyer sur Ctrl+Y (redo)
5. ✅ **Attendu:** Les 4 cellules retrouvent leurs valeurs

---

## 📝 Détails techniques

### Structure du droppedItem
```javascript
// Single item
droppedItem = {
    content: { id: 'volumeArrosage', label: 'Volume', type: 'number' }
}

// Multi items
droppedItem = {
    content: {
        type: 'multi',
        items: [
            { id: 'typeIrrigation', label: 'Type', type: 'select' },
            { id: 'frequence', label: 'Fréquence', type: 'number' },
            { id: 'volumeArrosage', label: 'Volume', type: 'number' }
        ]
    }
}
```

### Flux de données complet

1. **User action:** Drop sur cellule(s) sélectionnée(s)
2. **handleDrop:** Détecte le drop, stocke `droppedItem`, ouvre modal
3. **PipelineDataModal:** User remplit les champs
4. **handleSubmit (modal):** Appelle `onSave({ timestamp, data })`
5. **handleModalSave (PipelineDragDropView):**
   - Calcule `targetTimestamps` (1 ou N cellules)
   - Boucle sur chaque `targetTimestamp`
   - Pour chaque cellule: applique tous les champs via `onDataChange`
   - Enregistre historique pour undo/redo
6. **Result:** Toutes les cellules cibles ont toutes les données

---

## 🎯 Impact sur le CDC

Ces corrections garantissent:
- ✅ **CDC §3.2.1** - Saisie structurée multi-champs fonctionnelle
- ✅ **CDC §3.2.4** - Application en masse aux cellules sélectionnées
- ✅ **CDC §5.1** - Traçabilité complète (historique undo/redo)
- ✅ **UX fluide** - L'utilisateur peut remplir plusieurs cases en un seul geste

---

## 🚀 Déploiement

```bash
# Commit local
git add client/src/components/pipeline/PipelineDragDropView.jsx
git add client/src/components/pipeline/PipelineDataModal.jsx
git add CORRECTION_MULTI_DROP_CELLS_2026-01-07.md
git commit -m "fix(pipeline): multi-drop et sélection multiple cellules

- handleModalSave applique maintenant aux selectedCells
- Multi-drop sauvegarde tous les champs (pas juste le dernier)
- Logs détaillés pour debug
- Simplification handleSubmit dans modal"

# Push vers le VPS
git push origin feat/templates-backend

# Déployer sur le VPS
ssh vps-lafoncedalle
cd /var/www/terpologie
git pull
cd client && npm run build
pm2 restart reviews-maker
```

---

## 📊 Checklist validation

- [ ] Test 1: Multi-drop sur une cellule ✅
- [ ] Test 2: Single drop sur plusieurs cellules ✅
- [ ] Test 3: Multi-drop sur plusieurs cellules ✅
- [ ] Test 4: Vérification logs console ✅
- [ ] Test 5: Undo/Redo fonctionne ✅
- [ ] Pas de régression sur drop simple
- [ ] Pas de régression sur édition manuelle
- [ ] Confirmation d'écrasement fonctionne encore
- [ ] Performance acceptable (< 100ms pour 10 cellules)

---

**Statut:** ✅ Correction implémentée et prête pour tests
