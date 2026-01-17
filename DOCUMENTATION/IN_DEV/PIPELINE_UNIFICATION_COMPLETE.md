# Pipeline Unification - Changements appliqués

## 📋 Résumé

Tous les pipelines utilisent maintenant **le même système visuel unifié** basé sur `PipelineDragDropView`.

---

## ✅ Changements effectués

### 1. **Définition des phases pour Curing**
**Fichier:** `client/src/config/pipelinePhases.js`

✅ **Avant:** `CURING_PHASES = null` → 0 cellules affichées  
✅ **Après:** 4 phases définies (Séchage, Début curing, Maturation, Fin)

```js
export const CURING_PHASES = {
    phases: [
        { id: 'drying', label: 'Séchage', order: 0, duration: 7 },
        { id: 'early-cure', label: 'Début curing', order: 1, duration: 14 },
        { id: 'maturation', label: 'Maturation/Affinage', order: 2, duration: 30 },
        { id: 'final', label: 'Fin', order: 3, duration: 30 }
    ]
}
```

---

### 2. **Création de SeparationPipelineDragDrop (wrapper unifié)**
**Fichier:** `client/src/components/pipelines/legacy/SeparationPipelineDragDrop.jsx`

✅ **Créé** : Wrapper qui utilise `PipelineDragDropView`  
✅ **Config** : Sidebar depuis `SEPARATION_SIDEBAR_CONTENT`  
✅ **Intervalles** : Secondes, minutes, heures

---

### 3. **Refactorisation de SeparationPipelineSection**
**Fichier:** `client/src/components/pipelines/sections/SeparationPipelineSection.jsx`

❌ **Avant:** 218 lignes avec LiquidCard, titres custom, UI personnalisée  
✅ **Après:** 60 lignes, adapter pur (useRef + handlers)

**Supprimé:**
- `<LiquidCard>` wrappers
- Header "Méthode de séparation"  
- Boutons de sélection custom
- UI des passes multiples

**Conservé:**
- Handlers `onConfigChange` / `onDataChange`
- Pattern useRef pour timelineDataRef

---

### 4. **Création de ExtractionPipelineDragDrop (wrapper unifié)**
**Fichier:** `client/src/components/pipelines/legacy/ExtractionPipelineDragDrop.jsx`

✅ **Créé** : Wrapper qui utilise `PipelineDragDropView`  
✅ **Config** : Sidebar depuis `EXTRACTION_SIDEBAR_CONTENT`  
✅ **Intervalles** : Secondes, minutes, heures

---

### 5. **Refactorisation de ExtractionPipelineSection**
**Fichier:** `client/src/components/pipelines/sections/ExtractionPipelineSection.jsx`

❌ **Avant:** 120 lignes avec LiquidCard, titres, méthodes custom  
✅ **Après:** 60 lignes, adapter pur

**Supprimé:**
- `<LiquidCard>` wrappers
- Header "Pipeline d'Extraction"
- Boutons de sélection méthode (BHO/Rosin/Alcohol)
- Inputs température/pression custom
- UI purification steps

**Conservé:**
- Handlers `onConfigChange` / `onDataChange`
- Pattern useRef

---

## 🎯 Résultat final

### Architecture unifiée (tous les pipelines) :

```
Section (adapter)
  ├─ useRef(timelineData)
  ├─ handleConfigChange
  ├─ handleDataChange
  └─ Render → LegacyWrapper
              └─ PipelineDragDropView
                  └─ Liquid wrapper
                      └─ Flex-row (sidebar w-80 + timeline flex-1)
```

### Les 4 pipelines sont maintenant identiques visuellement :

| Pipeline | Wrapper | Sidebar Content | Phases | Intervalles |
|----------|---------|-----------------|--------|-------------|
| **Culture** ✅ | `CulturePipelineDragDrop` | `CULTURE_SIDEBAR_CONTENT` | 12 phases | phases/jour/semaine |
| **Curing** ✅ | `CuringPipelineDragDrop` | `CURING_SIDEBAR_CONTENT` | 4 phases | phases/jour/semaine |
| **Separation** ✅ | `SeparationPipelineDragDrop` | `SEPARATION_SIDEBAR_CONTENT` | null (temps) | sec/min/heure |
| **Extraction** ✅ | `ExtractionPipelineDragDrop` | `EXTRACTION_SIDEBAR_CONTENT` | null (temps) | sec/min/heure |

---

## 🔍 Vérifications

### Build Status
✅ Compilation réussie (Vite 6.4.1)  
✅ Aucun warning JSX  
✅ Tous les imports résolus

### Visuel attendu
✅ Même layout horizontal (sidebar gauche + timeline droite)  
✅ Même wrapper liquid (backdrop-blur-xl, rounded-2xl)  
✅ Pas de titres/headers supplémentaires  
✅ Config en haut de timeline identique  
✅ Grille de cellules générée correctement

---

## 📝 Points d'attention

1. **Curing montrera maintenant 4 cellules** au lieu de 0  
2. **Separation n'a plus de gestion multi-passes** dans le header (sera dans sidebar si besoin)  
3. **Extraction n'a plus de boutons méthode** dans le header (sera dans sidebar)  
4. **Toutes les configs sont drag-droppables** depuis sidebar vers cellules

---

## 🚀 Prochaines étapes (si besoin)

- [ ] Tester visuellement chaque pipeline  
- [ ] Vérifier génération des cellules (Curing doit montrer 4 phases)  
- [ ] Valider drag & drop depuis sidebar  
- [ ] Adapter contenu sidebar si besoin spécifique  
- [ ] Tests avec données réelles

---

**Date:** 2024  
**Status:** ✅ UNIFIÉ - Tous les pipelines utilisent PipelineDragDropView
