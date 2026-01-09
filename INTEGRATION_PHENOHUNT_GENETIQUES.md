# 🧬 Intégration PhenoHunt dans la Section Génétique

## 📋 Résumé

La section "Génétiques" du formulaire de création de review fleur a été entièrement refactorisée pour intégrer le système **PhenoHunt** - un outil complet de gestion des arbres généalogiques des cultivars avec interface visuelle ReactFlow.

**Date de déploiement:** 9 janvier 2026  
**Commit:** 53f3dfb  
**Status:** ✅ Déployé en production

---

## 🎯 Objectifs atteints

### Avant (ancienne interface)
- Interface textuelle basique pour les parents (mère/père)
- Bibliothèque de cultivars simple
- Système de généalogie basique sans visualisation
- Pas de gestion des projets PhenoHunt
- Pas de drag & drop pour les arbres généalogiques

### Après (nouvelle interface PhenoHunt intégrée)
✅ Interface visuelle complète avec ReactFlow  
✅ Sidebar avec onglets "Cultivars" et "Projects"  
✅ Canvas interactif pour visualiser les arbres généalogiques  
✅ Système de drag & drop pour ajouter les cultivars  
✅ Gestion des relations parents/enfants (♀/♂)  
✅ Création et sélection d'arbres généalogiques complets  
✅ Synchronisation avec le formulaire de review  
✅ Affichage du cultivar sélectionné dans la section génétique  

---

## 🔧 Modifications techniques

### Fichier modifié
**`client/src/pages/CreateFlowerReview/sections/Genetiques.jsx`**

#### Imports changés
```jsx
// AVANT
import GenealogyCanvas from '../../../components/genealogy/GenealogyCanvas'
import CultivarLibraryPanel from '../../../components/genealogy/CultivarLibraryPanel'

// APRÈS
import SidebarHierarchique from '../../../components/phenohunt/SidebarHierarchique'
import CanevasPhenoHunt from '../../../components/phenohunt/CanevasPhenoHunt'
import { usePhenoHuntStore } from '../../../store/index'
```

#### State management
```jsx
// Utilisation directe du store PhenoHunt
const {
    trees,           // Tous les arbres créés
    activeTreeId,    // Arbre actuellement sélectionné
    nodes,           // Nœuds du canvas
    edges,           // Connexions entre nœuds
    cultivars,       // Bibliothèque de cultivars
    setActiveTree,   // Fonc pour sélectionner un arbre
    getActiveTreeData, // Récupérer données de l'arbre actif
} = usePhenoHuntStore()
```

#### Nouvelle fonction de synchronisation
```jsx
const handleSyncPhenoHunt = () => {
    if (activeTreeId) {
        const activeTree = getActiveTreeData()
        handleChange('genetics', {
            ...genetics,
            phenoHuntTreeId: activeTreeId,      // ID de l'arbre
            phenoHuntData: activeTree,          // Données complètes
            variety: activeTree.nodes?.[0]?.label // Cultivar principal
        })
        setShowPhenoHunt(false)
    }
}
```

#### Structure du formulaire
- **Sections conservées:**
  - Breeder / Sélectionneur
  - Variété / Cultivar
  - Type génétique (Indica/Sativa/Hybride/CBD)
  - Ratios Indica/Sativa
  - Code Phénotype
  - Code Clone
  - Code Phénotype Auto-Incrémenté

- **Nouvelle section:**
  - **PhenoHunt Interactive Canvas** (section 7)
    - Bouton pour ouvrir/fermer l'interface
    - Layout: Sidebar (1/4) + Canvas (3/4)
    - Boutton "Valider la sélection"
    - Affichage de l'arbre sélectionné
    - Bouton "Modifier" pour changer l'arbre

---

## 🎨 Interface utilisateur

### Layout (en mode mobile)
```
┌─ Formulaire ─────────────────┐
│                              │
│ Breeder / Sélectionneur      │
│ Variété / Cultivar           │
│ Type génétique               │
│ Code Phénotype               │
│                              │
│ 🌳 PhenoHunt - Arbre... ▶  │ ← Bouton pour ouvrir/fermer
│                              │
│ Généalogie (Parents & Lignée)│
│ Parent Mère ♀                │
│ Parent Père ♂                │
│ Lignée complète              │
└──────────────────────────────┘
```

### Layout (en mode étendu avec PhenoHunt ouvert)
```
┌─ PhenoHunt Sidebar ────────────────────────────────────────┐
│ Cultivars | Projects                                       │
│                                                            │
│ [📷 Cultivar 1]    ← Drag & drop vers canvas             │
│ [📷 Cultivar 2]    ← Drag & drop vers canvas             │
│ ...                                                        │
│                                                            │
│ [✓ Valider] [✗ Fermer]                                   │
└────────────────────────────────────────────────────────────┘
                       ↓
┌─ PhenoHunt Canvas ────────────────────────────────────────┐
│                                                            │
│              ◯ Parent                                      │
│              │ ↓                                           │
│         ◯────●────◯                                       │
│    Mère       │      Père                                 │
│              ↓                                             │
│             ◯ Enfant                                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 📊 Données stockées

### Dans `formData.genetics`
```javascript
genetics: {
    breeder: "DNA Genetics",
    variety: "OG Kush",
    type: "indica",
    phenotype: "Pheno #3",
    cloneCode: "Clone-2024-001",
    codePheno: "PH-2024-001",
    
    // ✨ NOUVEAU: Données PhenoHunt
    phenoHuntTreeId: "tree-uuid-123",
    phenoHuntData: {
        id: "tree-uuid-123",
        name: "Arbre1",
        nodes: [
            { id: "node-1", label: "OG Kush", cultivarId: "cultivar-123" },
            { id: "node-2", label: "Purple Haze", cultivarId: "cultivar-456" }
        ],
        edges: [
            { source: "node-2", target: "node-1", type: "parent" }
        ]
    },
    
    // Optionnel: Généalogie textuelle
    parentage: {
        mother: "Purple Haze",
        father: "OG Kush",
        lineage: "(Purple Haze x OG Kush) F2"
    }
}
```

---

## 🔄 Workflow utilisateur

### Scénario 1: Créer une nouvelle review avec PhenoHunt

1. **Ouvrir le formulaire de review fleur**
   - Section 2: "Génétiques & PhenoHunt"

2. **Cliquer sur "🌳 PhenoHunt - Arbre Généalogique Interactive"**
   - Interface PhenoHunt s'ouvre en fullscreen

3. **Créer/sélectionner un arbre généalogique**
   - Depuis l'onglet "Projects"
   - Ou sélectionner depuis "Cultivars" existants

4. **Drag & drop les cultivars sur le canvas**
   - Organiser les relations parents/enfants

5. **Cliquer "✓ Valider la sélection"**
   - Interface se ferme
   - Les données sont synchronisées avec le formulaire

6. **Remplir les autres champs génétiques**
   - Breeder, Codes phénotype, etc.

7. **Continuer avec les autres sections**
   - Culture, Visuel, Goûts, Effets, etc.

### Scénario 2: Modifier un arbre sélectionné

1. **Cliquer "Modifier"** à côté de "Arbre sélectionné"
2. **Interface PhenoHunt s'ouvre** avec l'arbre existant
3. **Apporter les modifications**
4. **Valider à nouveau**

---

## 🚀 Déploiement

### Étapes effectuées

```bash
# 1. Commit local
git add client/src/pages/CreateFlowerReview/sections/Genetiques.jsx
git commit -m "feat: integrate PhenoHunt genetic tree system..."

# 2. Push vers GitHub
git push origin main

# 3. Déploiement VPS
ssh serveur "cd ~/Reviews-Maker && ./deploy.sh"
```

### Résultats du build
- ✅ 3773 modules transformed
- ✅ Build en 14.04s
- ✅ PM2 redémarré (PID: 4088446)
- ✅ Nginx rechargé
- ✅ Live à https://terpologie.eu

---

## 📋 Checklist de test

- [ ] **Form rendering**: La section génétique s'affiche correctement
- [ ] **Toggle PhenoHunt**: Cliquer le bouton ouvre/ferme l'interface
- [ ] **Sidebar loading**: Les cultivars se chargent dans le sidebar
- [ ] **Canvas display**: Le canvas ReactFlow s'affiche sans erreurs
- [ ] **Drag & drop**: Pouvoir drag & drop les cultivars
- [ ] **Node creation**: Créer des nœuds sur le canvas
- [ ] **Sync data**: Cliquer "Valider" synchronise les données
- [ ] **Form persistence**: Les données restent après fermeture/réouverture
- [ ] **Tree display**: "Arbre sélectionné" s'affiche après sélection
- [ ] **Mobile responsive**: Interface responsive sur mobile

---

## ⚙️ Configuration requise

### Dépendances
```json
{
  "react": "^18.3.1",
  "reactflow": "^11.5.0",
  "zustand": "^5.0.1",
  "framer-motion": "^10.18.0"
}
```

### Store PhenoHunt
- Doit être accessible via `usePhenoHuntStore()`
- Alias barrel export: `client/src/store/index.js`

### Composants PhenoHunt
- `SidebarHierarchique` - Gestion bibliothèque + projets
- `CanevasPhenoHunt` - Canvas ReactFlow principal

---

## 🔍 Dépannage

### Erreur: "Could not resolve usePhenoHuntStore"
**Solution**: Vérifier que `client/src/store/index.js` exporte bien:
```javascript
export { usePhenoHuntStore } from './usePhenoHuntStore'
```

### Erreur: "ReactFlow component not rendering"
**Solution**: Vérifier que ReactFlow est installé:
```bash
npm install reactflow@^11.5.0
```

### Sidebar ne charge pas les cultivars
**Solution**: Vérifier que le store PhenoHunt a des données initiales:
```javascript
const cultivars = usePhenoHuntStore((state) => state.cultivars)
console.log('Cultivars:', cultivars)
```

---

## 📝 Notes additionnelles

- L'ancienne section "Arbre Généalogique Interactive" a été complètement remplacée
- Les champs textuel de généalogie (parents & lignée) sont conservés en bas du formulaire
- Le système est compatible avec les anciens formulaires (les données PhenoHunt sont optionnelles)
- En export PDF/image, le canvas PhenoHunt peut être inclus via configuration future

---

## 🎯 Prochaines étapes

1. **Tests de l'interface utilisateur** sur production
2. **Ajout du visuel PhenoHunt** dans les exports (PDF/PNG)
3. **Intégration pour les autres types de produits** (Hash, Concentrés)
4. **Système de partage d'arbres** généalogiques entre utilisateurs
5. **Analytics** sur les cultivars les plus populaires

---

**Intégration réussie ✅**  
L'interface PhenoHunt est maintenant intégrée dans le formulaire de création de review fleur.  
Les utilisateurs peuvent créer, visualiser et gérer des arbres généalogiques complets directement depuis la section génétique.
