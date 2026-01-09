# 🌿 Module PhénoHunt - Documentation Complète

## 📋 Vue d'ensemble

Le module **PhénoHunt** est un système avancé de gestion généalogique pour le cannabis. Il permet aux producteurs de:
- Créer et gérer des **arbres généalogiques** complets
- Documenter les **croisements génétiques** entre cultivars
- Visualiser les **relations parent-enfant** de manière interactive
- Valider la **cohérence génétique** (détection des cycles)
- Exporter et persister les données en temps réel

## 🏗️ Architecture Technique

### Stack Principal
```
Frontend:
├── React 18+ (Hooks, Context)
├── React Flow (Canvas interactif)
├── Zustand (State Management)
├── Tailwind CSS (Styling)
└── Lucide React (Icons)

State:
├── usePhenoHuntStore (Zustand)
│   ├── phenoTrees (arbres généalogiques)
│   ├── activeTreeId (arbre sélectionné)
│   ├── cultivarLibrary (bibliothèque cultivars)
│   └── Méthodes CRUD (add/delete/update nodes & edges)
└── localStorage (persistence automatique)

API Endpoints:
├── GET  /api/phenotrees/{id}
├── PATCH /api/phenotrees/{id}
├── GET  /api/cultivars
└── POST /api/phenotrees
```

### Structure de Fichiers
```
client/src/
├── store/
│   └── usePhenoHuntStore.js (store Zustand complet)
├── pages/
│   └── PhénoHuntPage.jsx (page principale)
└── components/phenohunt/
    ├── SidebarHierarchique.jsx (liste des cultivars)
    ├── CanevasPhenoHunt.jsx (canvas React Flow)
    ├── PhenoNode.jsx (composant nœud)
    ├── PhenoEdge.jsx (composant edge)
    └── index.js (barrel exports)
```

## 📊 Modèle de Données

### Structure de l'Arbre (PhenoTree)
```javascript
{
    id: string (UUID),
    nodes: [
        {
            id: string (UUID),
            type: 'phenoNode',
            position: { x: number, y: number },
            data: {
                cultivarId: string,
                cultivarName: string,
                phenoCode: string, // ex: PHENO-00A7F2
                genetics: {
                    type: 'indica|sativa|hybride',
                    thcPercent?: number,
                    cbdPercent?: number
                },
                metadata: {
                    createdAt: ISO8601,
                    notes: string
                }
            }
        }
    ],
    edges: [
        {
            id: string,
            source: string (nodeId),
            target: string (nodeId),
            type: 'phenoEdge',
            label: string, // ex: "Croisement F1"
            data: {
                type: 'parent-child|sibling',
                notes: string
            }
        }
    ],
    metadata: {
        name: string,
        description: string,
        createdAt: ISO8601,
        updatedAt: ISO8601
    }
}
```

## 🎮 Guide d'Utilisation

### 1. Créer un Arbre
```typescript
const { createTree, setActiveTree } = usePhenoHuntStore();

const treeId = createTree({
    name: 'Phénohunt 2025',
    description: 'Selection émeute'
});
setActiveTree(treeId);
```

### 2. Ajouter un Nœud
```typescript
const { addNode } = usePhenoHuntStore();

addNode({
    cultivarId: 'cultivar-123',
    cultivarName: 'OG Kush',
    position: { x: 100, y: 200 },
    genetics: {
        type: 'indica',
        thcPercent: 19
    },
    notes: 'Phéno #3 à dominante cristalline'
});
```

### 3. Connecter les Nœuds
```typescript
const { addEdge } = usePhenoHuntStore();

addEdge({
    source: 'nodeId1', // parent
    target: 'nodeId2', // enfant
    label: 'Croisement F1',
    type: 'parent-child'
});
```

### 4. Validation des Cycles
Le store détecte automatiquement les cycles et empêche les connexions invalides:
```javascript
// Cette logique est intégrée dans addEdge()
if (store.hasCycle(sourceId, targetId)) {
    alert('Cycle détecté!');
    return null;
}
```

### 5. Dupliquer un Nœud
```typescript
const { duplicateNode } = usePhenoHuntStore();

const newNodeId = duplicateNode(originalNodeId);
// Crée un clone avec:
// - Nouveau phénoCode (suffixe aléatoire)
// - Position décalée (+50px)
// - Timestamp de création mis à jour
```

### 6. Sauvegarder l'Arbre
```typescript
const { saveTree } = usePhenoHuntStore();

try {
    const savedTree = await saveTree();
    console.log('✅ Arbre sauvegardé:', savedTree);
} catch (error) {
    console.error('❌ Erreur:', error.message);
}
```

## 🎨 Composants

### SidebarHierarchique
**Responsabilités:**
- Affiche les cultivars par groupe/catégorie
- Permet le drag-drop vers le canvas
- Ajoute des cultivars au canvas
- Duplication rapide (en implémentation)

**Props:**
```jsx
<SidebarHierarchique />
// Récupère les données directement du store
```

**Features:**
- Groupes expansibles/collapses
- Drag-and-drop (dataTransfer)
- Boutons d'action contextuels
- Scrollable avec custom scrollbar

### CanevasPhenoHunt
**Responsabilités:**
- Affiche le canvas React Flow
- Gère les interactions (zoom, pan, selection)
- Synchronise avec le store
- Sauvegarde automatique

**Shortcuts Clavier:**
- `Ctrl+D`: Dupliquer nœud sélectionné
- `Delete`: Supprimer nœud sélectionné
- Click sur nœud: Sélection
- Click sur canvas: Désélection

**UI Elements:**
- Toolbar: Zoom, Duplicate, Delete, Save
- Info Panel: Détails du nœud sélectionné
- MiniMap: Vue d'ensemble
- Background dots: Repères visuels

### PhenoNode
**Features:**
- Gradient vert sombre (#0f5132 → #059669)
- Handles top/bottom pour connexions
- Sélection avec effets visuels (glow, scale)
- Affiche: nom, code phéno, type génétique, notes, date

**États visuels:**
```
Non sélectionné: Border verte fade, ombre légère
Sélectionné: Border émeraude brillante, glow, scale 110%
Hover: Border renforcée, ombre augmentée
Connecting: Opacité 50%
```

### PhenoEdge
**Features:**
- Lignes courbées avec animation
- Labels éditables
- Marker d'arrivée (flèche)
- Animation sur sélection

## 🔄 Flux de Données

```
User Action (Sidebar Drag)
         ↓
CanevasPhenoHunt.onDragEnd
         ↓
usePhenoHuntStore.addNode()
         ↓
State Update (setNodes)
         ↓
React Flow Re-render
         ↓
User Interaction
         ↓
handleSave()
         ↓
API PATCH /api/phenotrees/{id}
         ↓
localStorage.persist (via Zustand)
         ↓
✅ Synchronisé
```

## 🔒 Validation & Règles Métier

### Validation des Nœuds
```javascript
// Profondeur maximale: 5 niveaux
if (getDepth(nodeId) >= 5) {
    throw new Error('Profondeur maximale atteinte');
}

// Pas de self-parent
if (sourceId === targetId) {
    throw new Error('Un nœud ne peut pas être son propre parent');
}
```

### Validation des Cycles
```javascript
// Détection bidirectionnelle
hasCycle(source, target) {
    // Chemine jusqu'à target depuis source
    // Détecte si un cycle existe dans le chemin
    const visited = new Set();
    const canReach = (from, to) => {
        if (from === to) return true;
        if (visited.has(from)) return false;
        
        visited.add(from);
        const children = edges.filter(e => e.source === from);
        return children.some(e => canReach(e.target, to));
    };
    
    return canReach(target, source);
}
```

## 📱 Responsive Design

### Desktop (≥1024px)
- Sidebar fixe 320px
- Canvas flex
- Tous les boutons visibles
- Info panel en bas

### Tablet (768px-1023px)
- Sidebar 80 réactif
- Canvas plus petit
- Boutons compacts
- Info panel réduit

### Mobile (<768px)
- Sidebar full-width
- Canvas caché/affiché au besoin
- Buttons en icônes uniquement
- Info panel sur swipe

## 🚀 Performance

### Optimisations
1. **Zustand persistence**: localStorage avec stratégie partielle
2. **React Flow**: useCallback pour handlers, memoization des nodes
3. **Code splitting**: PhénoHuntPage lazy-loaded
4. **Canvas**: Background pattern optimisé (dots)

### Limitations Actuelles
- Max 500 nodes/arbre (React Flow limitation)
- Profondeur max 5 niveaux
- 10 cultivars max sélectionnables

## 🔌 Intégration API

### Endpoints Requis (Backend)

```bash
# GET cultivars
curl -X GET /api/cultivars
Response: [{ id, name, genetics, group, phenoCode }, ...]

# CREATE tree
curl -X POST /api/phenotrees \
  -H "Content-Type: application/json" \
  -d '{ name, description, nodes, edges }'
Response: { id, ...tree }

# FETCH tree
curl -X GET /api/phenotrees/{id}
Response: { id, nodes, edges, metadata }

# PATCH tree
curl -X PATCH /api/phenotrees/{id} \
  -H "Content-Type: application/json" \
  -d '{ nodes, edges, metadata }'
Response: { success: true }

# DELETE tree
curl -X DELETE /api/phenotrees/{id}
Response: { success: true }
```

## 🐛 Troubleshooting

### Problème: Nœuds non affichés
**Solution**: Vérifier que `activeTreeId` est défini
```javascript
console.log(usePhenoHuntStore(s => s.activeTreeId));
```

### Problème: Cycle détecté faussement
**Solution**: Vérifier l'ordre des paramètres dans `addEdge`
```javascript
// ✅ Correct: parent → enfant
addEdge({ source: parentId, target: childId });

// ❌ Incorrect: enfant → parent
addEdge({ source: childId, target: parentId });
```

### Problème: Données perdues après refresh
**Solution**: Zustand persistence est activée, mais vérifier localStorage
```javascript
// Vérifier les données persistées
console.log(localStorage.getItem('phenohunt-store'));
```

### Problème: Canvas ne se charge pas
**Solution**: Vérifier ReactFlowProvider wrapping
```jsx
<ReactFlowProvider>
    <CanevasPhenoHunt />
</ReactFlowProvider>
```

## 🔮 Roadmap Future

- [ ] Export/Import JSON
- [ ] Statisitques génétiques (calcul d'inbreeding)
- [ ] Visualisation du profil terpénique par lignée
- [ ] Timeline animation des générations
- [ ] Collab multi-utilisateurs en temps réel
- [ ] Intégration GIF timeline (culture → harvest)
- [ ] Search & filter avancés par génétique
- [ ] Integration avec Review Fleurs (sync génétique)

## 📞 Support

Pour toute question ou bug:
1. Vérifier la console navigateur (F12)
2. Consulter les logs du store: `usePhenoHuntStore.getState()`
3. Tester avec des cas simples (2-3 nodes)
4. Recharger la page (clear cache)

---

**Développé avec ❤️ pour Terpologie.eu**
