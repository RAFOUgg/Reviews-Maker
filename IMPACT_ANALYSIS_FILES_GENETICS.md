# 🗑️ IMPACT ANALYSIS - FICHIERS À SUPPRIMER/MODIFIER

**Date:** 11 Janvier 2026  
**Scope:** Refonte Section Génétique  
**Impact:** Architecture Frontend & Backend

---

## 📋 RÉSUMÉ EXÉCUTIF

- **Fichiers à supprimer:** 12
- **Fichiers à créer:** 11
- **Fichiers à modifier:** 8
- **Risque:** Moyen (bien scoped, pas de dépendances cachées)

---

## 🔴 FICHIERS À SUPPRIMER

### Frontend Components - À SUPPRIMER COMPLÈTEMENT

#### Dossier: `client/src/components/genealogy/`
```
client/src/components/genealogy/
├─ GenealogyCanvas.jsx                ❌ SUPPRIMER
│  └─ Raison: Canvas duplicate, remplacée par UnifiedGeneticsCanvas
│
├─ CultivarLibraryPanel.jsx           ❌ SUPPRIMER
│  └─ Raison: Logique fusionnée dans GeneticsLibrarySidebar
│
├─ GenealogyCanvas.jsx.bak            ❌ SUPPRIMER
└─ CultivarLibraryPanel.jsx.bak       ❌ SUPPRIMER
   └─ Raison: Fichiers backup inutiles (version contrôle avec Git)
```

**Impact:** Aucun composant existant les importe  
**Dépendances:** Aucune

#### Dossier: `client/src/components/phenohunt/`
```
client/src/components/phenohunt/
├─ CanevasPhenoHunt.jsx               ❌ SUPPRIMER
│  └─ Raison: Canvas React Flow remplacée par UnifiedGeneticsCanvas
│  └─ Importé par: pages/CreateFlowerReview/sections/Genetiques.jsx
│
├─ SidebarHierarchique.jsx            ❌ SUPPRIMER
│  └─ Raison: Logique fusionnée dans GeneticsLibrarySidebar
│  └─ Importé par: pages/CreateFlowerReview/sections/Genetiques.jsx
│
├─ PhenoNode.jsx                      ❌ SUPPRIMER
│  └─ Raison: Custom React Flow node remplacée par CultivarNode.jsx
│  └─ Importé par: CanevasPhenoHunt.jsx (à supprimer)
│
├─ PhenoEdge.jsx                      ❌ SUPPRIMER
│  └─ Raison: Custom React Flow edge remplacée par GeneticEdge.jsx
│  └─ Importé par: CanevasPhenoHunt.jsx (à supprimer)
│
└─ index.js                           ❌ SUPPRIMER
   └─ Raison: Barrel export du dossier (sera vide)
```

**Impact:** Imports à mettre à jour dans:
- `pages/CreateFlowerReview/sections/Genetiques.jsx`
  ```diff
  - import CanevasPhenoHunt from '../../../components/phenohunt/CanevasPhenoHunt'
  - import SidebarHierarchique from '../../../components/phenohunt/SidebarHierarchique'
  + import UnifiedGeneticsCanvas from '../../../components/genetics/UnifiedGeneticsCanvas'
  ```

**Dépendances:** Toutes internes au dossier

#### Dossier: `client/src/components/genetics/`
```
client/src/components/genetics/
├─ GeneticsLibraryCanvas.jsx          ❌ SUPPRIMER
│  └─ Raison: Blueprint non intégré, logique remplacée par UnifiedGeneticsCanvas
│  └─ Importé par: Aucun
│
├─ GeneticsLibraryCanvas.jsx.bak      ❌ SUPPRIMER
├─ PhenoCodeGenerator.jsx.bak         ❌ SUPPRIMER
│  └─ Raison: Backups (version contrôle avec Git)
│
└─ PhenoCodeGenerator.jsx             ✅ GARDER
   └─ Raison: Fonctionnalité utile conservée
   └─ Sera importé par: pages/CreateFlowerReview/sections/Genetiques.jsx
```

**Impact:** Aucun (GeneticsLibraryCanvas non importé)  
**Dépendances:** Aucune

### Store - À SUPPRIMER

#### Fichier: `client/src/store/usePhenoHuntStore.js`
```
usePhenoHuntStore.js                  ❌ SUPPRIMER
└─ Raison: Fusionné dans useGeneticsStore.js
└─ Importé par:
   - pages/CreateFlowerReview/sections/Genetiques.jsx
   - components/phenohunt/SidebarHierarchique.jsx
   - components/phenohunt/CanevasPhenoHunt.jsx
```

**Impact:** Imports à remplacer partout:
```diff
- import { usePhenoHuntStore } from '../../store/index'
+ import { useGeneticsStore } from '../../store/useGeneticsStore'

- const { trees, activeTreeId, ... } = usePhenoHuntStore()
+ const { geneticTrees, activeTreeId, ... } = useGeneticsStore()
```

**Dépendances:** Remplacées par useGeneticsStore

---

## 🟢 FICHIERS À CRÉER

### Frontend Components - NOUVEAUX

#### `client/src/components/genetics/UnifiedGeneticsCanvas.jsx`
```javascript
/**
 * Component principal unifié pour tous les usages
 * • Mode "inline" dans la création de review
 * • Mode "edit" dans la page /genetics
 * • Mode "view" pour affichage lecture seule
 * 
 * ~400+ lignes
 */
```

#### `client/src/components/genetics/GeneticsLibrarySidebar.jsx`
```javascript
/**
 * Sidebar avec liste cultivars
 * • Search/filter
 * • Drag initiator
 * • Stats display
 * 
 * ~200 lignes
 */
```

#### `client/src/components/genetics/CultivarLibraryItem.jsx`
```javascript
/**
 * Composant item pour cultivar
 * • Thumbnail image
 * • Name, breeder, type
 * • Drag handler
 * 
 * ~100 lignes
 */
```

#### `client/src/components/genetics/CultivarNode.jsx`
```javascript
/**
 * Custom React Flow node type
 * Remplace PhenoNode.jsx
 * • Display cultivar info
 * • Styling personnalisé
 * • Handles pour edges
 * 
 * ~150 lignes
 */
```

#### `client/src/components/genetics/GeneticEdge.jsx`
```javascript
/**
 * Custom React Flow edge type
 * Remplace PhenoEdge.jsx
 * • Arrow styling
 * • Relationship label
 * • Animation
 * 
 * ~120 lignes
 */
```

#### `client/src/components/genetics/NodeEditor.jsx`
```javascript
/**
 * Panel pour éditer nœud sélectionné
 * • Edit cultivar name
 * • Edit genetics data
 * • Delete button
 * 
 * ~180 lignes
 */
```

#### `client/src/components/genetics/EdgeEditor.jsx`
```javascript
/**
 * Panel pour éditer edge sélectionné
 * • Select relationship type
 * • Edit notes
 * • Delete button
 * 
 * ~150 lignes
 */
```

#### `client/src/components/genetics/GeneticsExport.jsx`
```javascript
/**
 * Export dialog
 * • Format selection (JSON, SVG, PNG)
 * • Download/copy options
 * • Share code generation
 * 
 * ~250 lignes
 */
```

#### `client/src/components/genetics/GeneticsShare.jsx`
```javascript
/**
 * Share dialog
 * • Generate share code
 * • Copy link
 * • Share to social (optional)
 * 
 * ~150 lignes
 */
```

#### `client/src/components/genetics/index.js`
```javascript
/**
 * Barrel export pour tous components genetics
 */
export { default as UnifiedGeneticsCanvas } from './UnifiedGeneticsCanvas'
export { default as GeneticsLibrarySidebar } from './GeneticsLibrarySidebar'
// ... etc
```

### Pages - NOUVEAUX

#### `client/src/pages/GeneticsManagement/index.jsx`
```javascript
/**
 * Page principale de gestion génétiques
 * Layout: Sidebar + Main canvas
 * • List trees, create, edit, delete
 * • Full CRUD
 * 
 * ~300 lignes
 */
```

#### `client/src/pages/GeneticsManagement/GeneticsManagementLayout.jsx`
```javascript
/**
 * Layout avec navigation
 * • Header avec titre, stats
 * • Sidebar avec tree list
 * • Main area avec canvas
 * 
 * ~200 lignes
 */
```

### Store - NOUVEAU

#### `client/src/store/useGeneticsStore.js`
```javascript
/**
 * Store unifié Zustand
 * Remplace usePhenoHuntStore
 * • Genetic trees management
 * • Cultivars management
 * • API integration
 * • Auto-persist (localStorage)
 * 
 * ~500+ lignes
 */
```

### Hooks - NOUVEAU

#### `client/src/hooks/useGeneticsApi.js`
```javascript
/**
 * API wrapper pour genetics endpoints
 * • getTrees(), createTree(), updateTree(), deleteTree()
 * • addNode(), updateNode(), deleteNode()
 * • addEdge(), deleteEdge()
 * • getCultivars(), createCultivar(), etc.
 * 
 * ~300 lignes
 */
```

---

## 🟡 FICHIERS À MODIFIER

### Frontend

#### 1. `client/src/pages/CreateFlowerReview/sections/Genetiques.jsx`
```diff
AVANT:
- import CanevasPhenoHunt from '../../../components/phenohunt/CanevasPhenoHunt'
- import SidebarHierarchique from '../../../components/phenohunt/SidebarHierarchique'
- import { usePhenoHuntStore } from '../../../store/index'

+ Utilise: CanevasPhenoHunt en modal
+ State: showPhenoHunt, activeTreeId

APRÈS:
+ import UnifiedGeneticsCanvas from '../../../components/genetics/UnifiedGeneticsCanvas'
+ import { useGeneticsStore } from '../../../store/useGeneticsStore'

+ Utilise: UnifiedGeneticsCanvas en mode="inline"
+ State: modal ou inline selon option
+ Props: onChange, onSave callbacks
```

**Changement:** ~50 lignes modifiées / ~30 lignes supprimées / ~20 lignes ajoutées

#### 2. `client/src/store/index.js`
```diff
AVANT:
export { usePhenoHuntStore } from './usePhenoHuntStore'
export { useStore } from './useStore'

APRÈS:
export { useGeneticsStore } from './useGeneticsStore'  // NEW
// export { usePhenoHuntStore } from './usePhenoHuntStore'  // DEPRECATED
export { useStore } from './useStore'
```

**Changement:** ~3 lignes

#### 3. `client/src/App.jsx` ou Router principal
```diff
+ Ajouter route:
  <Route path="/genetics" element={<GeneticsManagement />} />

+ Ajouter lien menu:
  <NavLink to="/genetics">Génétiques</NavLink>
```

**Changement:** ~5 lignes

#### 4. `client/src/pages/Library/index.jsx` (Bibliothèque Personnelle)
```diff
+ Ajouter onglet "Arbres Généalogiques"
  <Tab label="Arbres">
    <TreesList trees={geneticTrees} />
  </Tab>

+ Intégrer useGeneticsStore pour afficher arbres
```

**Changement:** ~50-100 lignes ajoutées (nouveau tab)

#### 5. `client/src/pages/CreateFlowerReview/index.jsx`
```diff
+ Mettre à jour imports sections
- import Genetiques from './sections/Genetiques' (renommer path)
+ import Genetiques from './sections/Genetiques'

+ Ajuster props section Genetiques si nécessaire
```

**Changement:** ~5 lignes (minor)

### Backend

#### 6. `server-new/prisma/schema.prisma`
```diff
+ Ajouter 3 nouveaux models:
  model GeneticTree { ... }
  model GenNode { ... }
  model GenEdge { ... }

+ Ajouter relation à Cultivar:
  model Cultivar {
    genNodes    GenNode[]
  }

+ Ajouter relation à User:
  model User {
    geneticTrees    GeneticTree[]
  }
```

**Changement:** ~100 lignes ajoutées

#### 7. `server-new/server.js`
```diff
+ Ajouter import:
  const geneticsRoutes = require('./routes/genetics')

+ Ajouter dans app:
  app.use('/api', geneticsRoutes)
```

**Changement:** ~3 lignes

#### 8. `.env.example` / `.env`
```diff
+ Vérifier que DATABASE_URL est configurée
+ (Aucun changement si DB existante)
```

**Changement:** 0 lignes (vérification)

---

## 📊 TABLEAU RÉSUMÉ

| Catégorie | Type | Nombre | Impact |
|-----------|------|--------|--------|
| **Supprimer** | Components | 7 | 🟢 Faible |
| | Stores | 1 | 🟡 Moyen |
| | Backups | 4 | 🟢 Faible |
| **Créer** | Components | 9 | 🟡 Moyen |
| | Pages | 2 | 🟡 Moyen |
| | Store | 1 | 🟡 Moyen |
| | Hooks | 1 | 🟢 Faible |
| **Modifier** | Frontend files | 5 | 🟡 Moyen |
| | Backend files | 3 | 🟡 Moyen |
| **TOTAL** | | 33 fichiers | 🟡 MOYEN |

---

## 🔗 DÉPENDANCES & IMPACTS

### Cascade Impact Analysis

#### Niveau 1: Suppression PhenoHunt
```
usePhenoHuntStore.js (À supprimer)
└─ Importé par:
   ├─ pages/CreateFlowerReview/sections/Genetiques.jsx
   │  └─ Faire: Remplacer par useGeneticsStore
   ├─ components/phenohunt/SidebarHierarchique.jsx
   │  └─ Faire: Supprimer composant entier
   └─ components/phenohunt/CanevasPhenoHunt.jsx
      └─ Faire: Supprimer composant entier
```

#### Niveau 2: Suppression Phenohunt Components
```
components/phenohunt/* (À supprimer)
└─ Utilisé par:
   └─ pages/CreateFlowerReview/sections/Genetiques.jsx
      └─ Faire: Remplacer imports par UnifiedGeneticsCanvas
```

#### Niveau 3: Création New Components
```
components/genetics/UnifiedGeneticsCanvas.jsx (Nouveau)
└─ Utilisé par:
   ├─ pages/CreateFlowerReview/sections/Genetiques.jsx (mode="inline")
   └─ pages/GeneticsManagement/index.jsx (mode="edit")

useGeneticsStore.js (Nouveau)
└─ Utilisé par:
   ├─ pages/CreateFlowerReview/sections/Genetiques.jsx
   ├─ pages/GeneticsManagement/index.jsx
   └─ useGeneticsApi.js
```

### Ordre Suppression Sûr

Pour éviter les erreurs, suivre cet ordre:

1. **Créer d'abord tous les nouveaux fichiers:**
   - useGeneticsStore.js
   - useGeneticsApi.js
   - UnifiedGeneticsCanvas.jsx
   - Tous les nouveaux components

2. **Puis modifier les imports existants:**
   - pages/CreateFlowerReview/sections/Genetiques.jsx
   - store/index.js
   - App.jsx

3. **Puis supprimer les anciens:**
   - components/phenohunt/*
   - components/genealogy/*
   - usePhenoHuntStore.js

---

## ✅ CHECKLIST PRÉ-SUPPRESSION

Avant de supprimer quoi que ce soit:

- [ ] Tous les nouveaux fichiers créés et testés
- [ ] Tous les imports mis à jour
- [ ] Les builds passent sans erreur
- [ ] Aucune référence restante aux anciens components
- [ ] Git commit avec message: "chore: remove deprecated genetics components"
- [ ] Personne n'utilise les ancien components localement

---

## 🚨 POINTS D'ATTENTION

### Risques Identifiés

| Risque | Probabilité | Mitigation |
|--------|-------------|-----------|
| Import manqué après suppression | 🟡 Moyen | Chercher tous usages avant suppression |
| DB migration problème | 🟢 Faible | Test migration en dev d'abord |
| Regression en review creation | 🟡 Moyen | Tests e2e complets |
| Performance impact | 🟢 Faible | Profiler Redux DevTools |

### Tests Critiques

Après chaque changement majeur:
- [ ] `npm run build` sans erreur
- [ ] `npm run dev` démarre sans erreur
- [ ] Test page /genetics fonctionne
- [ ] Test création review > section génétiques
- [ ] Test export/share functionality

---

## 📈 MIGRATION SCRIPT (Optional)

Pour automatiser la migration de stores:

```bash
# Script de migration (bash)
#!/bin/bash

# 1. Créer les nouveaux fichiers
echo "Creating new store..."
cp templates/useGeneticsStore.js client/src/store/

# 2. Chercher et remplacer imports
echo "Updating imports..."
find client/src -type f -name "*.jsx" -o -name "*.js" | xargs sed -i \
  's/usePhenoHuntStore/useGeneticsStore/g'

# 3. Vérifier les changements
echo "Verifying changes..."
git diff --name-only

echo "Done! Review changes and test."
```

---

## 📞 SUPPORT

**Questions sur la suppression?**
Vérifier d'abord:
1. Le fichier est-il importé ailleurs? → `grep -r "filename" client/`
2. Y a-t-il des références dans les tests? → Chercher dans `*.test.js`
3. Est-ce utilisé dans les pages? → Chercher dans `pages/`

---

*Impact analysis complète. Prêt pour exécution.*
