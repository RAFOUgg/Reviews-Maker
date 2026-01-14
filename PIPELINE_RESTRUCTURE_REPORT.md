# RAPPORT TECHNIQUE - Restructuration Pipeline
**Date:** 2026-01-14
**Statut:** ⚠️ BLOQUÉ - Erreur de balance JSX

---

## ❌ Problème Rencontré

Lors de la tentative de restructuration du layout de `PipelineDragDropView` pour passer d'une structure verticale (sidebar en haut) à horizontale (sidebar à gauche), une erreur de balance des balises JSX a été rencontrée.

### Erreur TypeScript
```
')' expected at line 2610
Declaration or statement expected
```

Cette erreur indique que le parser pense qu'il y a trop de `</div>` fermés, ce qui fait qu'il sort du contexte JSX prématurément.

---

## 🎯 Objectif Initial

Créer une structure unifiée pour toutes les pipelines :

```
┌─────────────────────────────────────────────────┐
│ LIQUID WRAPPER                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ FLEX-ROW CONTAINER                          │ │
│ │ ┌──────────┬───────────────────────────────┐│ │
│ │ │ SIDEBAR  │ TIMELINE                      ││ │
│ │ │ (gauche) │ - Header Config               ││ │
│ │ │          │ - Progress bar                ││ │
│ │ │          │ - Grid cellules               ││ │
│ │ └──────────┴───────────────────────────────┘│ │
│ └─────────────────────────────────────────────┘ │
│ MODALS (portails)                               │
└─────────────────────────────────────────────────┘
```

---

## ⚙️ Changements Effectués

### 1. Container Principal
**Avant:**
```jsx
<div className="flex flex-col gap-4...">
  {!isMobile && (
    <div className="w-full max-h-[300px]..."> {/* Sidebar horizontal */}
      ...
    </div>
  )}
  <div className="flex-1..."> {/* Timeline en bas */}
    ...
  </div>
</div>
```

**Après:**
```jsx
<div className="liquid-wrapper...">
  <div className="flex flex-row gap-4...">
    {!isMobile && (
      <div className="w-80 flex-shrink-0..."> {/* Sidebar vertical gauche */}
        ...
      </div>
    )}
    <div className="flex-1..."> {/* Timeline à droite */}
      ...
    </div>
  </div>
</div>
```

### 2. Sidebar
- Changé de `w-full max-h-[300px]` (horizontal) à `w-80` (vertical fixe)
- Ajouté `flex-col` pour stack vertical des sections
- Ajouté `overflow-y-auto` pour scroll interne

### 3. Timeline
- Conservé la structure interne (header + progress + grid)
- Changé seulement le container parent de `flex-1 min-h-0` à `flex-1 min-w-0`

---

## ❌ Problème de Balance JSX

La restructuration a créé un problème de balance des `<div>` / `</div>`. L'analyse suggère plusieurs causes potentielles :

1. **Duplication de div supprimée** (ligne 1817) ✅ Corrigée
2. **Fermeture prématurée du sidebar** - À vérifier
3. **Ternaire conditionnel** (cells.length) créant une fermeture supplémentaire
4. **Modals mal positionnés** dans la hiérarchie

Le fichier fait 2618 lignes, ce qui rend le debug manuel très difficile.

---

## 🔄 Solution Alternative Proposée

Plutôt que de modifier le core de `PipelineDragDropView`, créer un **wrapper component** qui gère le layout:

### PipelineLayoutWrapper.jsx
```jsx
const PipelineLayoutWrapper = ({ children }) => {
  return (
    <div className="liquid-wrapper">
      <div className="flex flex-row gap-4">
        {children}
      </div>
    </div>
  );
};
```

### Utilisation
```jsx
<PipelineLayoutWrapper>
  <SidebarContent />
  <PipelineDragDropView />
</PipelineLayoutWrapper>
```

**Avantages:**
- ✅ Ne touche pas au code complexe existant
- ✅ Plus facile à débugger
- ✅ Réutilisable pour tous les types de pipelines
- ✅ Séparation des responsabilités claire

---

## 📋 Actions Recommandées

1. ⏸️ **Annuler les changements** sur `PipelineDragDropView.jsx`
2. 🆕 **Créer** `PipelineLayoutWrapper.jsx`
3. ✅ **Extraire** le sidebar content dans un composant séparé
4. 🔧 **Adapter** les wrappers spécifiques (Culture, Curing, etc.)
5. ✅ **Tester** le nouveau layout

---

## 📊 Estimation

- Revert + nouvelle approche: **2-3 heures**
- Debug actuel (JSX balance): **temps indéterminé** ⚠️

**Recommandation:** Utiliser l'approche wrapper pour gagner du temps et réduire les risques.

---

## 🔗 Fichiers Concernés

- ❌ `client/src/components/pipelines/views/PipelineDragDropView.jsx` (bloqué)
- ⏭️ À créer: `client/src/components/pipelines/layouts/PipelineLayoutWrapper.jsx`
- ⏭️ À créer: `client/src/components/pipelines/layouts/PipelineSidebar.jsx`
- ⏭️ À mettre à jour: Tous les wrappers (Culture, Curing, etc.)

---

**Note:** Le schéma d'architecture et la documentation complète sont disponibles dans [PIPELINE_ARCHITECTURE.md](PIPELINE_ARCHITECTURE.md).
