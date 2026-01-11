# 🏗️ ARCHITECTURE & WORKFLOW - SYSTÈME GÉNÉTIQUE REFONDÉ

**Date:** 11 Janvier 2026  
**Version:** 1.0 - Architecture Proposée

---

## 1. ARCHITECTURE GLOBALE

### 1.1 Vue d'ensemble Système

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Pages Principales                          │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  1️⃣ GeneticsManagement (/genetics)                          │   │
│  │     ├─ TreesList         - Lister/filtrer arbres            │   │
│  │     ├─ TreeEditor        - CRUD complet                     │   │
│  │     └─ UnifiedGeneticsCanvas                                │   │
│  │                                                               │   │
│  │  2️⃣ CreateFlowerReview (mode inline)                        │   │
│  │     └─ Genetiques Section                                   │   │
│  │        └─ UnifiedGeneticsCanvas (mode="inline")             │   │
│  │                                                               │   │
│  │  3️⃣ Library (Bibliothèque Personnelle)                      │   │
│  │     └─ Onglet "Arbres Généalogiques"                        │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ▲                                       │
│                              │ Props & Callbacks                     │
│                              │                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Components (Genetics Suite)                     │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  📦 UnifiedGeneticsCanvas (Cœur du système)                 │   │
│  │     ├─ React Flow Integration                               │   │
│  │     ├─ Drag-drop cultivars                                  │   │
│  │     ├─ Node/Edge editing                                    │   │
│  │     └─ Export management                                    │   │
│  │                                                               │   │
│  │  📦 GeneticsLibrarySidebar                                  │   │
│  │     ├─ Cultivar list (with search/filter)                   │   │
│  │     ├─ Drag initiator                                       │   │
│  │     └─ Stats display                                        │   │
│  │                                                               │   │
│  │  📦 NodeEditor / EdgeEditor                                 │   │
│  │     ├─ Data modification                                    │   │
│  │     └─ Delete actions                                       │   │
│  │                                                               │   │
│  │  📦 GeneticsExport                                          │   │
│  │     ├─ JSON export                                          │   │
│  │     ├─ SVG render                                           │   │
│  │     └─ Share code generation                                │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ▲                                       │
│                              │ useGeneticsStore + useGeneticsApi    │
│                              │                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              State Management & API Layer                    │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  🏪 useGeneticsStore (Zustand - Global State)              │   │
│  │     ├─ geneticTrees[]        - Arbres utilisateur           │   │
│  │     ├─ cultivarLibrary[]     - Cultivars disponibles        │   │
│  │     ├─ activeTreeId          - Arbre en édition             │   │
│  │     └─ Actions (load, create, update, delete, etc)          │   │
│  │                                                               │   │
│  │  🔌 useGeneticsApi (Fetch wrapper)                          │   │
│  │     ├─ getTrees()            - GET /api/genetic-trees       │   │
│  │     ├─ createTree()          - POST /api/genetic-trees      │   │
│  │     ├─ addNode()             - POST /api/.../nodes          │   │
│  │     ├─ addEdge()             - POST /api/.../edges          │   │
│  │     └─ deleteCultivar()      - DELETE /api/cultivars/:id    │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                  ┌───────────────┼───────────────┐
                  │               │               │
                  ▼               ▼               ▼
        ┌──────────────────┐  ┌─────────────┐  ┌──────────────┐
        │ HTTP Requests    │  │  REST API   │  │ WebSocket?   │
        │ (JSON)           │  │ (Express)   │  │ (future)     │
        └──────────────────┘  └─────────────┘  └──────────────┘
                  │               │
                  └───────────────┼───────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────────┐
│                     Backend (Node.js + Express)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  API Routes (routes/genetics.js)             │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  GET    /api/genetic-trees          - Lister arbres          │   │
│  │  POST   /api/genetic-trees          - Créer arbre            │   │
│  │  PUT    /api/genetic-trees/:id      - Modifier arbre         │   │
│  │  DELETE /api/genetic-trees/:id      - Supprimer arbre        │   │
│  │                                                               │   │
│  │  POST   /api/genetic-trees/:id/nodes  - Ajouter nœud        │   │
│  │  PUT    /api/genetic-trees/:id/nodes/:nodeId                │   │
│  │  DELETE /api/genetic-trees/:id/nodes/:nodeId                │   │
│  │                                                               │   │
│  │  POST   /api/genetic-trees/:id/edges  - Ajouter edge        │   │
│  │  DELETE /api/genetic-trees/:id/edges/:edgeId                │   │
│  │                                                               │   │
│  │  POST   /api/genetic-trees/:id/share  - Code partage        │   │
│  │  GET    /api/genetic-trees/shared/:code - Récupérer arbre   │   │
│  │                                                               │   │
│  │  GET    /api/cultivars               - Lister cultivars      │   │
│  │  POST   /api/cultivars               - Créer cultivar        │   │
│  │  PUT    /api/cultivars/:id           - Modifier cultivar     │   │
│  │  DELETE /api/cultivars/:id           - Supprimer cultivar    │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ▲                                       │
│                              │ Prisma ORM                            │
│                              │                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Database Models (Prisma Schema)                 │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  📊 GeneticTree                                              │   │
│  │     ├─ id, userId, name, description                        │   │
│  │     ├─ projectType (library|phenohunt|breeding)             │   │
│  │     ├─ isPublic, shareCode                                  │   │
│  │     ├─ GenNode[] (one-to-many)                              │   │
│  │     └─ GenEdge[] (one-to-many)                              │   │
│  │                                                               │   │
│  │  📊 GenNode                                                  │   │
│  │     ├─ id, treeId (FK)                                      │   │
│  │     ├─ cultivarId (FK), cultivarName, label                │   │
│  │     ├─ position (JSON), genetics (JSON)                     │   │
│  │     └─ notes                                                │   │
│  │                                                               │   │
│  │  📊 GenEdge                                                  │   │
│  │     ├─ id, treeId (FK)                                      │   │
│  │     ├─ parentNodeId, childNodeId                            │   │
│  │     ├─ relationshipType (mother|father|sibling|clone)       │   │
│  │     └─ notes                                                │   │
│  │                                                               │   │
│  │  📊 Cultivar (UPDATED)                                       │   │
│  │     ├─ id, userId (FK), name, breeder, type                │   │
│  │     ├─ genetics (JSON), image                               │   │
│  │     ├─ GenNode[] (one-to-many) [NEW]                        │   │
│  │     └─ group, notes                                         │   │
│  │                                                               │   │
│  │  📊 User (UNCHANGED)                                         │   │
│  │     ├─ id, email, username                                  │   │
│  │     ├─ GeneticTree[] (one-to-many) [NEW]                    │   │
│  │     └─ Cultivar[] (one-to-many) [EXISTING]                  │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│                      PostgreSQL Database                             │
│                      (prod: remote)                                  │
│                      (dev: local)                                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. FLUX DE DONNÉES - EXEMPLE COMPLET

### 2.1 Workflow: Créer un Arbre Généalogique (Page /genetics)

```
User Action                      Frontend                        Backend/DB
─────────────────────────────────────────────────────────────────────────

1. Click "Créer Arbre"
   ───────────────────────→ GeneticsManagement.jsx
                           │
                           ├─ Form: name, description
                           │
                           ▼
2. Submit form
   ───────────────────────→ useGeneticsStore.createTree()
                           │
                           ├─ SET: isLoading = true
                           │
                           └─→ useGeneticsApi.createTree()
                              │
                              ▼
                              POST /api/genetic-trees
                              Body: { name, description, projectType }
                                                                        │
                                                                        ▼
                                                    routes/genetics.js
                                                    │
                                                    ├─ Validate request
                                                    │
                                                    ├─ Check auth (user.id)
                                                    │
                                                    ▼
                                                    prisma.geneticTree.create({
                                                      data: {
                                                        userId: req.user.id,
                                                        name, description,
                                                        projectType
                                                      }
                                                    })
                                                    │
                                                    ▼
                                                    PostgreSQL INSERT
                                                    │
                                                    ▼ Returns newTree
                                                    {
                                                      id: "xyz123",
                                                      userId: "user456",
                                                      name: "OG Kush Selection",
                                                      ...
                                                    }
                                                    │
                                                    │
3. Tree created successfully      ← Response 200 OK ←───────────────────
                                  {
                                    success: true,
                                    data: { id, name, ... }
                                  }
                                  │
                                  ▼
                           useGeneticsApi returns
                           │
                           ▼
4. Update store            useGeneticsStore.createTree() callback
                           │
                           ├─ SET: geneticTrees = [...old, newTree]
                           ├─ SET: activeTreeId = newTree.id
                           └─ SET: isLoading = false
                           │
                           ▼
5. Render updated UI       TreesList updated
                           │
                           ├─ Show new tree in list ✓
                           ├─ Highlight as active ✓
                           └─ Switch to TreeEditor ✓
                           │
                           ▼
6. Load TreeEditor         useGeneticsStore.getActiveTree()
                           │
                           ├─ Render UnifiedGeneticsCanvas
                           ├─ Pass initialTree = activeTree
                           └─ Show empty canvas (0 nodes)
```

### 2.2 Workflow: Ajouter Cultivar à l'Arbre

```
User Action                      Frontend                        Backend/DB
─────────────────────────────────────────────────────────────────────────

1. Drag cultivar from sidebar
   ───────────────────────→ UnifiedGeneticsCanvas
                           │
                           ├─ onDrop event fired
                           │
                           ├─ Parse: cultivarData from drag
                           │
                           ├─ screenToFlowPosition(cursor)
                           │
                           ▼
2. Add node to state       const newNode = {
                             id: "node-1234",
                             data: { cultivarName, cultivar, ... },
                             position: { x, y },
                             type: "cultivar"
                           }
                           │
                           ├─ setNodes([...nodes, newNode])
                           │
                           ├─ onChange({ nodes, edges })
                           │
                           └─→ useGeneticsStore.addNode()
                              │
                              ▼
                              POST /api/genetic-trees/{treeId}/nodes
                              Body: {
                                cultivarId: "cultivar-xyz",
                                cultivarName: "OG Kush",
                                position: { x: 100, y: 200 },
                                genetics: { type: "hybrid", ... }
                              }
                                                                        │
                                                                        ▼
                                                    routes/genetics.js
                                                    │
                                                    ├─ Validate nodeData
                                                    │
                                                    ├─ Check tree ownership
                                                    │
                                                    ▼
                                                    prisma.genNode.create({
                                                      treeId: req.params.treeId,
                                                      cultivarId: data.cultivarId,
                                                      cultivarName: data.name,
                                                      position: data.position,
                                                      genetics: data.genetics
                                                    })
                                                    │
                                                    ▼
                                                    PostgreSQL INSERT
                                                    │
                                                    ▼ Returns createdNode
                                                    {
                                                      id: "node-db-xyz",
                                                      treeId, cultivarId,
                                                      position, genetics
                                                    }
                                                    │
                                                    │
3. Node persisted          ← Response 200 OK ←───────────────────────
                           { success: true, data: createdNode }
                           │
                           ▼
4. Update store            useGeneticsStore.addNode() callback
                           │
                           ├─ Update node.id to DB ID
                           ├─ SET: geneticTrees[activeTreeId].nodes
                           │  = [...old, returnedNode]
                           │
                           ▼
5. Render canvas           UnifiedGeneticsCanvas
                           │
                           ├─ Display new node on canvas ✓
                           ├─ Animate entry
                           └─ Show cultivar image/name
                           │
                           ▼
6. Node visible on canvas  User can now:
                           ├─ Drag this node to move it
                           ├─ Create edges from this node
                           └─ Edit node properties
```

### 2.3 Workflow: Créer une Relation (Edge)

```
User Action                      Frontend                        Backend/DB
─────────────────────────────────────────────────────────────────────────

1. Drag from parent node
   ───────────────────────→ React Flow: onConnect
                           │
                           ├─ Parse: parent → child
                           │
                           ▼
2. Add edge to state       const newEdge = {
                             id: "edge-5678",
                             source: "node-1",
                             target: "node-2",
                             type: "genetic",
                             data: {
                               relationshipType: null,
                               notes: null
                             },
                             animated: true
                           }
                           │
                           ├─ setEdges([...edges, newEdge])
                           │
                           ├─ onChange({ nodes, edges })
                           │
                           └─→ useGeneticsStore.addEdge()
                              │
                              ▼
                              POST /api/genetic-trees/{treeId}/edges
                              Body: {
                                parentNodeId: "node-db-xyz",
                                childNodeId: "node-db-abc",
                                relationshipType: "mother",  // optional
                                notes: ""
                              }
                                                                        │
                                                                        ▼
                                                    routes/genetics.js
                                                    │
                                                    ├─ Validate parent/child
                                                    │
                                                    ├─ Check no circular
                                                    │
                                                    ├─ Check ownership
                                                    │
                                                    ▼
                                                    prisma.genEdge.create({
                                                      treeId,
                                                      parentNodeId,
                                                      childNodeId,
                                                      relationshipType
                                                    })
                                                    │
                                                    ▼
                                                    PostgreSQL INSERT
                                                    │
                                                    ▼ Returns createdEdge
                                                    │
                                                    │
3. Edge persisted          ← Response 200 OK ←──────────────────────
                           { success: true, data: createdEdge }
                           │
                           ▼
4. Update store            useGeneticsStore.addEdge() callback
                           │
                           ├─ SET: geneticTrees[activeTreeId].edges
                           │  = [...old, returnedEdge]
                           │
                           ▼
5. Render canvas           UnifiedGeneticsCanvas
                           │
                           ├─ Display arrow parent → child ✓
                           ├─ Show relationship label
                           └─ Animate edge drawing
                           │
                           ▼
6. User can now edit edge  Click edge → EdgeEditor
                           │
                           ├─ Select relationshipType (mother|father)
                           ├─ Add notes
                           └─ Update/Delete
```

### 2.4 Workflow: Sauvegarder Arbre Complet (Alternative Locale)

```
User Action                      Frontend
─────────────────────────────────────────────

1. Click "Sauvegarder"
   ───────────────────────→ onSave callback triggered
                           │
                           ├─ Collect nodes + edges from canvas
                           │
                           ├─ Optional: Validate structure
                           │
                           ▼
2. Batch update (Optional) For each node/edge changed:
                           │
                           ├─ useGeneticsStore.updateNode()
                           │  → PATCH /api/genetic-trees/{id}/nodes/{nid}
                           │
                           └─ Already covered in workflow 2.2
                           │
                           ▼
3. Success notification    Show toast: "Arbre sauvegardé ✓"
                           │
                           ├─ Persist to localStorage (backup)
                           │
                           └─ Sync store with server
```

---

## 3. INTÉGRATION DANS LA CRÉATION DE REVIEW

### 3.1 Workflow: Utiliser Arbre dans Review

```
Page: CreateFlowerReview
Section: Genetiques

┌─────────────────────────────────────────────┐
│ Section Génétiques                          │
├─────────────────────────────────────────────┤
│                                              │
│ [Input] Breeder / Sélectionneur             │
│ [Input] Variété / Cultivar                  │
│ [Select] Type (Indica|Sativa|Hybrid)        │
│ [Slider] Indica/Sativa ratio (si hybrid)    │
│ [Input] Code Phénotype                      │
│ [Input] Code Clone                          │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ [🌳] PhenoHunt - Arbre Généalogique │   │  ← Collapsed
│ │  Interactive                         │   │
│ └──────────────────────────────────────┘   │
│                                              │
│  (Click to expand)                          │
│     │                                        │
│     ▼                                        │
│ ┌──────────────────────────────────────┐   │
│ │ EXPANDED MODAL                       │   │
│ ├──────────────────────────────────────┤   │
│ │                                      │   │
│ │  ┌──────────────┐  ┌──────────────┐ │   │
│ │  │ Sidebar      │  │ Canvas       │ │   │
│ │  │ (Cultivars)  │  │ (React Flow) │ │   │
│ │  │              │  │              │ │   │
│ │  │ • OG Kush    │  │   🌱 🌱      │ │   │
│ │  │ • Sour D.    │  │    ▲         │ │   │
│ │  │ • GSC        │  │    │         │ │   │
│ │  │              │  │   🌱        │ │   │
│ │  │ [Drag here]  │  │   (empty)   │ │   │
│ │  └──────────────┘  └──────────────┘ │   │
│ │                                      │   │
│ │ [✓ Valider] [Close]                  │   │
│ │                                      │   │
│ └──────────────────────────────────────┘   │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ Généalogie (Parents & Lignée)        │   │
│ ├──────────────────────────────────────┤   │
│ │ Parent Mère ♀: [______]             │   │
│ │ Parent Père ♂: [______]             │   │
│ │ Lignée complète:                     │   │
│ │ [_________________________]          │   │
│ │                                      │   │
│ └──────────────────────────────────────┘   │
│                                              │
└─────────────────────────────────────────────┘

User Flow:
1. Click 🌳 Expand modal
   │
2. See existing trees in sidebar
   OR create new tree in canvas
   │
3. Option A: Select from library
   - Click existing tree
   - Modal shows tree
   - Validate selection
   
4. Option B: Create new in modal
   - Drag cultivars
   - Create edges
   - Save
   │
5. Click "Valider"
   │
   ├─ formData.genetics.genealogy = selectedTree
   ├─ formData.genetics.phenomenHuntTreeId = treeId
   │
6. Close modal
   │
7. Continue review form
```

---

## 4. STRUCTURE DIRECTOIRE FINALE

### Avant Refonte
```
components/
├── genealogy/
│   ├── GenealogyCanvas.jsx           ❌ À supprimer
│   └── CultivarLibraryPanel.jsx      ❌ À supprimer
├── genetics/
│   ├── GeneticsLibraryCanvas.jsx     ❌ À supprimer (blueprint)
│   └── PhenoCodeGenerator.jsx        ✅ Garder
└── phenohunt/
    ├── CanevasPhenoHunt.jsx          ❌ À supprimer
    ├── SidebarHierarchique.jsx       ❌ À supprimer
    ├── PhenoNode.jsx                 ❌ À supprimer
    ├── PhenoEdge.jsx                 ❌ À supprimer
    └── index.js                      ❌ À supprimer
```

### Après Refonte
```
components/
├── genetics/                          ✨ NOUVEAU RÉPERTOIRE
│   ├── UnifiedGeneticsCanvas.jsx      ✨ PRINCIPAL
│   ├── GeneticsLibrarySidebar.jsx     ✨ NOUVEAU
│   ├── CultivarLibraryItem.jsx        ✨ NOUVEAU
│   ├── CultivarNode.jsx               ✨ NOUVEAU (React Flow node)
│   ├── GeneticEdge.jsx                ✨ NOUVEAU (React Flow edge)
│   ├── NodeEditor.jsx                 ✨ NOUVEAU
│   ├── EdgeEditor.jsx                 ✨ NOUVEAU
│   ├── GeneticsExport.jsx             ✨ NOUVEAU
│   ├── GeneticsShare.jsx              ✨ NOUVEAU
│   ├── PhenoCodeGenerator.jsx         ✅ Migré (garde ancien)
│   └── index.js                       ✨ NOUVEAU (barrel export)
└── [genealogy/] → À supprimer
└── [phenohunt/] → À supprimer

pages/
├── CreateFlowerReview/
│   └── sections/
│       └── Genetiques.jsx             🔄 REFACTORISÉ
└── GeneticsManagement/               ✨ NOUVEAU
    ├── index.jsx                     ✨ PRINCIPAL
    ├── GeneticsManagementLayout.jsx  ✨ NOUVEAU
    ├── TreesList.jsx                 ✨ NOUVEAU
    └── TreeEditor.jsx                ✨ NOUVEAU

store/
├── useGeneticsStore.js               ✨ NOUVEAU (fusionné)
├── usePhenoHuntStore.js              ❌ À supprimer (remplacé)
└── index.js                          🔄 UPDATE (exports)

hooks/
└── useGeneticsApi.js                 ✨ NOUVEAU

server-new/
├── prisma/
│   └── schema.prisma                 🔄 UPDATE (ajouter models)
├── routes/
│   └── genetics.js                   ✨ NOUVEAU
├── middleware/
│   └── validateGenetics.js           ✨ NOUVEAU
└── server.js                         🔄 UPDATE (routes)
```

---

## 5. DIAGRAMME D'ÉTAT - LIFECYCLE ARBRE

```
┌─────────────────────────────────────────────────┐
│           GeneticTree Lifecycle                 │
└─────────────────────────────────────────────────┘

                    CREATED
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
      EMPTY        EDITING       SHARED
      (0 nodes)  (+nodes/-nodes)  (public)
         │             │             │
         │             └──────┬──────┘
         │                    │
         └────────┬───────────┘
                  │
                  ▼
              PUBLISHED
            (in review or
             public gallery)
                  │
                  ▼
              ARCHIVED (optional)
         (read-only, no edit)
                  │
                  ▼
              DELETED
          (DB soft-delete)

Transitions:
├─ CREATED → EDITING (add nodes/edges)
├─ CREATED → DELETED (not used)
├─ EDITING → EDITING (continuous changes)
├─ EDITING → PUBLISHED (save to review)
├─ EDITING → SHARED (share code)
├─ PUBLISHED → EDITING (edit again)
├─ PUBLISHED → DELETED (cleanup)
├─ SHARED → PUBLISHED (anyone with code)
└─ * → ARCHIVED (optional cleanup)
```

---

## 6. TIMELINE VISUELLE

```
Week 1: Phase 1 + Phase 2
├─ Day 1: Backend setup (Prisma + API routes)
├─ Day 2: Frontend canvas unifiée
├─ Day 3: Store integration + tests
└─ Day 4: Polish Phase 2

Week 2: Phase 3 + Phase 4
├─ Day 1: Page GeneticsManagement
├─ Day 2: Library integration
├─ Day 3: Export system + sharing
└─ Day 4: Final QA + deployment

Total: 12-16h développement
```

---

**Architecture & Workflow complets. Prêt pour implémentation.**
