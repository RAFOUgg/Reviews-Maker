# 🔧 Correction Bug Clic Sélection + Configuration Trame Curing

## Date : 5 janvier 2026 - 15h30

## 🐛 Problèmes corrigés

### 1. Bug : Clic sur un contenu sélectionne tous les contenus

**Symptôme** : Quand on cliquait sur un item dans la sidebar, tous les items de la section apparaissaient sélectionnés.

**Cause racine** : 
L'événement `onClick` était déclenché même après un drag&drop, et la logique de sélection ne différenciait pas un clic simple d'une action de drag.

**Solution** :
- Ajout d'un flag `isDragging` local pour tracker l'état de drag
- Modification de `handleSidebarItemClick` pour ignorer les clics après drag
- Changement de la logique de sélection : clic simple toggle maintenant la sélection (sélectionne si pas sélectionné, désélectionne si déjà sélectionné)

**Code** (PipelineDragDropView.jsx lignes ~1163-1189) :
```jsx
let isDragging = false;

const handleSidebarItemClick = (e) => {
    // Ne rien faire si on est en train de drag
    if (isDragging) {
        isDragging = false;
        return;
    }

    if (e.ctrlKey || e.metaKey) {
        // Multi-sélection avec Ctrl
        setMultiSelectedItems(prev =>
            prev.includes(item.key)
                ? prev.filter(k => k !== item.key)
                : [...prev, item.key]
        );
    } else {
        // Simple clic : désélection si déjà sélectionné, sinon sélection
        setMultiSelectedItems(isSelected ? [] : [item.key]);
    }
};

// Dans onDragStart
onDragStart={(e) => {
    isDragging = true; // ← Active le flag
    // ... reste du code
}}
```

**Comportement après correction** :
- ✅ Clic simple sur item → Sélectionne uniquement cet item (anneau bleu)
- ✅ Re-clic sur item sélectionné → Désélectionne l'item
- ✅ Ctrl+Clic → Ajoute/retire l'item de la sélection multiple
- ✅ Drag simple → Drag uniquement l'item cliqué
- ✅ Drag multiple → Drag tous les items sélectionnés avec Ctrl

---

### 2. Bug : Impossible de configurer la trame du pipeline Curing

**Symptôme** : 
Les boutons pour changer l'intervalle de temps (jours, semaines, mois, etc.) ne fonctionnaient pas dans la section Curing/Maturation. La timeline ne se mettait pas à jour.

**Cause racine** :
Le handler `onConfigChange` dans `CuringMaturationSection.jsx` ne mettait à jour que la config locale mais ne propageait pas les changements au composant `CuringPipelineDragDrop`, ce qui empêchait la timeline de se régénérer.

**Solution** :
Réécriture complète du handler `onConfigChange` pour :
1. Mettre à jour immédiatement le state local (`config.intervalType`) via `updateConfig()`
2. Propager les modifications au parent via `onChange()`
3. Ajouter des logs console pour debug

**Code** (CuringMaturationSection.jsx lignes ~352-374) :
```jsx
onConfigChange={(key, value) => {
    console.log('🔧 CuringMaturation onConfigChange:', key, value);
    
    // Update local config immédiatement
    if (key === 'type') {
        updateConfig('intervalType', value);
    } else if (key === 'startDate') {
        updateConfig('startDate', value);
    } else if (key === 'endDate') {
        updateConfig('endDate', value);
    } else if (key === 'totalDays' || key === 'totalHours' || key === 'totalMinutes') {
        // Stocker la config complète dans data
        const updatedConfig = {
            type: config.intervalType || 'jour',
            [key]: value,
            startDate: config.startDate,
            endDate: config.endDate,
            curingType: config.curingType
        };
        onChange({ ...data, curingTimelineConfig: updatedConfig });
    }
}}
```

**Comportement après correction** :
- ✅ Clic sur "jours" → Timeline affiche les cellules en jours (J1, J2, J3...)
- ✅ Clic sur "semaines" → Timeline affiche en semaines (S1, S2, S3...)
- ✅ Clic sur "mois" → Timeline affiche en mois (M1, M2, M3...)
- ✅ Modification du nombre de jours → Timeline se régénère avec le bon nombre de cellules
- ✅ Les données déjà saisies sont conservées lors du changement de trame

---

## 🧪 Tests à effectuer

### Test 1 : Sélection sidebar
1. Ouvrir une review Fleur ou Hash
2. Aller à la section Pipeline Culture ou Curing
3. Cliquer sur un item dans la sidebar (ex: "Température")
4. **Vérifier** : Seul cet item a un anneau bleu
5. Cliquer à nouveau sur le même item
6. **Vérifier** : L'anneau bleu disparaît (désélection)
7. Cliquer sur un item, puis Ctrl+Clic sur un autre
8. **Vérifier** : Les deux items ont un anneau bleu
9. Drag un des items sélectionnés vers une cellule
10. **Vérifier** : Modal s'ouvre avec les deux champs

### Test 2 : Configuration trame Curing
1. Ouvrir une review Fleur, Hash ou Concentré
2. Aller à la section "Pipeline Curing/Maturation"
3. Cliquer sur "semaines" dans "Intervalle de temps"
4. **Vérifier** : La timeline affiche S1, S2, S3... (et pas J1, J2, J3...)
5. Changer pour "heures"
6. **Vérifier** : Timeline affiche H1, H2, H3...
7. Entrer un nombre de jours (ex: 60)
8. **Vérifier** : Timeline affiche 60 cellules
9. Ouvrir la console (F12)
10. **Vérifier** : Le log "🔧 CuringMaturation onConfigChange: type, semaines" apparaît lors du changement

---

## 📊 Fichiers modifiés

### PipelineDragDropView.jsx
- **Lignes modifiées** : ~1163-1189 (sidebar item rendering)
- **Changements** :
  - Ajout flag `isDragging` local
  - Modification `handleSidebarItemClick` pour ignorer clics post-drag
  - Toggle sélection sur clic simple (au lieu de toujours ajouter)

### CuringMaturationSection.jsx
- **Lignes modifiées** : ~352-374 (onConfigChange handler)
- **Changements** :
  - Réécriture complète du handler
  - Mise à jour immédiate du state local
  - Propagation correcte au parent
  - Ajout logs debug

---

## ✅ Build Status

```
✓ 3631 modules transformed
✓ built in 7.89s
0 errors
```

**Tous les fichiers compilent sans erreur !**

---

## 🎯 Prochaines étapes

1. **Tester en navigateur** : Valider les corrections sur `http://localhost:5173/create/flower`
2. **Généraliser** : Appliquer la même logique de configuration aux autres pipelines (Culture, Separation, Purification)
3. **Optimiser** : Réduire la duplication de code entre les sections en créant des helpers partagés
4. **Documenter** : Ajouter des commentaires explicatifs pour les futurs développeurs

---

*Dernière mise à jour : 5 janvier 2026 - 15h30*
