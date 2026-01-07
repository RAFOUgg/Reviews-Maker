# RAPPORT DE CORRECTIONS - PIPELINES
**Date:** 2026-01-07  
**Analysé par:** GitHub Copilot  
**Fichiers concernés:**
- `client/src/components/pipeline/PipelineDragDropView.jsx`
- `client/src/components/pipeline/PipelineDataModal.jsx`
- `client/src/pages/CreateFlowerReview/sections/CulturePipelineSection.jsx`

---

## 🐛 BUGS IDENTIFIÉS

### 1. ❌ Champ effacé mais données persistent
**Localisation:** `PipelineDataModal.jsx` lignes 373-390 (FieldWrapper)  
**Problème:**  
- Le bouton de suppression appelle `onFieldDelete(timestamp, itemKey)`
- Mais `PipelineDragDropView` le reçoit dans `handleFieldDelete()` ligne 1301
- Cette fonction envoie `onDataChange(ts, fieldKey, null)` 
- **MAIS** `setFormData()` locale supprime bien la clé
- Cependant, `formData` est réinitialisé depuis `cellData` à chaque ouverture (useEffect ligne 289)
- Si la donnée persiste dans le parent (timelineData), elle réapparaît

**Solution:**
1. S'assurer que `onDataChange(ts, fieldKey, null)` **supprime réellement** la propriété au lieu de la mettre à `null`
2. Dans `CulturePipelineSection.jsx`, le handler doit supprimer la clé au lieu de l'assigner à `null`

---

### 2. ❌ Drop groupe de préréglages n'assigne pas toutes les données
**Localisation:** `PipelineDragDropView.jsx` lignes 1048-1075 (handleDrop)  
**Problème:**
```javascript
if (draggedContent.type === 'grouped' && draggedContent.group) {
    const group = draggedContent.group;
    const fields = group.fields || [];
    
    // Applique bien chaque champ
    fields.forEach(f => {
        if (f.key && f.value !== undefined && f.value !== '') {
            onDataChange(timestamp, f.key, f.value);
        }
    });
}
```

**Le code semble correct**, mais possible que:
- `fields` ne soit pas un array `[{key, value}]` mais un objet `{key: value}`
- Vérifier le format dans `GroupedPresetModal`

**Solution:**
- Vérifier le format des données du groupe
- Ajouter des logs pour déboguer
- S'assurer que `group.fields` est bien `Array<{key: string, value: any}>`

---

### 3. ❌ Multi-sélection items → drop → pas de modal attribution
**Localisation:** `PipelineDragDropView.jsx` lignes 1680-1704  
**Problème:**
```javascript
onDragStart={(e) => {
    isDragging = true;
    // Si multi-sélection
    if (!isSelected || multiSelectedItems.length === 1) {
        handleDragStart(e, item); // Drag simple
    } else {
        // Multi-items drag
        const selectedItems = multiSelectedItems.map(...).filter(Boolean);
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'multi-items',
            items: selectedItems
        }));
        setDraggedContent({ type: 'multi-items', items: selectedItems });
    }
})
```

Puis dans `handleDrop` ligne 1048:
```javascript
// Pas de gestion du cas `type === 'multi-items'` !!!
```

**Solution:**
Ajouter dans `handleDrop` **AVANT** le check `grouped`:
```javascript
// MULTI-ITEMS: Ouvrir modal avec tous les items sélectionnés
if (draggedContent.type === 'multi-items' && draggedContent.items) {
    setCurrentCellTimestamp(timestamp);
    setDroppedItem({
        timestamp,
        content: { type: 'multi', items: draggedContent.items }
    });
    setIsModalOpen(true);
    setDraggedContent(null);
    return;
}
```

Puis dans `PipelineDataModal`, supporter `droppedItem.content.type === 'multi'` :
```javascript
const getItemsToDisplay = () => {
    if (droppedItem) {
        if (droppedItem.content.type === 'multi' && Array.isArray(droppedItem.content.items)) {
            return droppedItem.content.items; // Afficher tous
        }
        return [droppedItem.content]; // Un seul
    }
    // ...
}
```

---

### 4. ❌ "Appliquer aux N cases" applique seulement à la dernière
**Localisation:** `PipelineDataModal.jsx` lignes 349-361 (handleSubmit)  
**Problème:**
```javascript
const handleSubmit = (e) => {
    e.preventDefault();
    
    const targets = (selectedCells && selectedCells.length > 0) 
        ? selectedCells 
        : [timestamp];

    targets.forEach(ts => {
        onSave({
            timestamp: ts,
            data: formData
        });
    });
    
    onClose();
};
```

**Le code semble correct** ! Mais vérifier dans `handleModalSave` de `PipelineDragDropView` ligne 816:

```javascript
const handleModalSave = (data) => {
    if (droppedItem && droppedItem.timestamp === data.timestamp) {
        // PROBLÈME ICI : vérifie timestamp === data.timestamp
        // Si on applique à plusieurs, seul le premier match !
    } else {
        // Applique à tous
        Object.entries(data.data || {}).forEach(([key, value]) => {
            onDataChange(data.timestamp, key, value);
        });
    }
}
```

**Solution:**
Ne pas vérifier `droppedItem.timestamp === data.timestamp`, mais plutôt:
```javascript
if (droppedItem) {
    const fieldKey = droppedItem.content.id || droppedItem.content.key || droppedItem.content.type;
    // Appliquer SEULEMENT le champ droppé (pas tous les champs)
    if (data.data && data.data[fieldKey] !== undefined) {
        onDataChange(data.timestamp, fieldKey, data.data[fieldKey]);
    }
} else {
    // Appliquer TOUS les champs
    Object.entries(data.data || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            onDataChange(data.timestamp, key, null);
        } else {
            onDataChange(data.timestamp, key, value);
        }
    });
}
```

---

### 5. ❌ Drop sur cellule existante → pas de confirmation écrasement
**Localisation:** `PipelineDragDropView.jsx` ligne 1048 (handleDrop)  
**Problème:**  
Aucune vérification si la cellule contient déjà des données avant d'ouvrir le modal.

**Solution:**
```javascript
const handleDrop = (e, timestamp) => {
    e.preventDefault();
    setHoveredCell(null);

    if (!draggedContent || !timestamp) return;

    // VÉRIFIER SI DONNÉES EXISTANTES
    const existingData = getCellData(timestamp);
    const hasExistingData = existingData && Object.keys(existingData).some(k => 
        !['timestamp', '_meta', 'date', 'label', 'phase'].includes(k)
    );

    // Si données existantes ET on drop un nouveau champ
    if (hasExistingData && draggedContent.type !== 'grouped') {
        const fieldKey = draggedContent.id || draggedContent.key || draggedContent.type;
        const fieldExists = existingData[fieldKey] !== undefined;
        
        if (fieldExists) {
            setConfirmState({
                open: true,
                title: 'Écraser les données ?',
                message: `La cellule ${timestamp} contient déjà une valeur pour "${draggedContent.label}". Voulez-vous la remplacer ?`,
                onConfirm: () => {
                    // Ouvrir modal
                    setCurrentCellTimestamp(timestamp);
                    setDroppedItem({ timestamp, content: draggedContent });
                    setIsModalOpen(true);
                    setDraggedContent(null);
                    setConfirmState(prev => ({ ...prev, open: false }));
                }
            });
            return;
        }
    }

    // Continuer normalement si pas de conflit
    // ... reste du code
}
```

---

## 📝 PLAN D'ACTION

### Phase 1: Correctif suppression (Bug #1)
1. ✅ Modifier `CulturePipelineSection.jsx` - `handleDataChange` pour **supprimer la clé** au lieu de `null`
2. ✅ Tester avec champ effacé → réouvrir modal → vérifier absence

### Phase 2: Correctif drop multi-items (Bug #3)
1. ✅ Ajouter gestion `type === 'multi-items'` dans `handleDrop`
2. ✅ Modifier `getItemsToDisplay()` dans `PipelineDataModal` pour supporter multi
3. ✅ Tester Ctrl+clic sur 3 items → drag → drop → modal avec 3 champs

### Phase 3: Correctif application multiple (Bug #4)
1. ✅ Corriger `handleModalSave` pour ne pas filtrer par timestamp
2. ✅ Tester sélection 5 cases → appliquer données → vérifier 5 cases modifiées

### Phase 4: Confirmation écrasement (Bug #5)
1. ✅ Ajouter check dans `handleDrop` avant ouverture modal
2. ✅ Utiliser `ConfirmModal` existant
3. ✅ Tester drop sur cellule remplie → confirmation → action

### Phase 5: Vérification drop groupe (Bug #2)
1. ✅ Ajouter logs dans `handleDrop` cas `grouped`
2. ✅ Vérifier format `group.fields`
3. ✅ Corriger si nécessaire

---

## 🧪 TESTS À EFFECTUER

1. **Suppression:**
   - Remplir une cellule → Supprimer un champ → Réouvrir → Champ absent ✅

2. **Drop groupe:**
   - Créer groupe 5 champs → Drop sur cellule → Tous présents ✅

3. **Multi-drop:**
   - Ctrl+clic 3 champs → Drop → Modal avec 3 champs input ✅

4. **Application multiple:**
   - Sélectionner 10 cases → Ouvrir modal → Remplir → "Appliquer aux 10 cases" → 10 modifiées ✅

5. **Confirmation écrasement:**
   - Cellule remplie → Drop nouveau champ existant → Popup confirmation ✅

---

## 📦 FICHIERS À MODIFIER

1. `client/src/pages/CreateFlowerReview/sections/CulturePipelineSection.jsx` 
2. `client/src/components/pipeline/PipelineDragDropView.jsx`
3. `client/src/components/pipeline/PipelineDataModal.jsx`

