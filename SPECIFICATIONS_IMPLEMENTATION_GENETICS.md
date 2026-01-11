# 📐 SPÉCIFICATIONS TECHNIQUES - REFONTE SECTION GÉNÉTIQUE
**Date:** 11 Janvier 2026  
**Version:** 1.0  
**Priorité:** 🔴 CRITIQUE

---

## TABLE DES MATIÈRES
1. [Architecture Global](#1-architecture-global)
2. [Backend Specs](#2-backend-specs)
3. [Frontend Unified Canvas](#3-frontend-unified-canvas)
4. [Store Management](#4-store-management)
5. [Pages & Routing](#5-pages--routing)
6. [API Integration](#6-api-integration)
7. [UI/UX Specifications](#7-uiux-specifications)
8. [Mobile Adaptations](#8-mobile-adaptations)

---

## 1. ARCHITECTURE GLOBAL

### 1.1 Structure Dossiers (Proposée)

```
client/src/
├── components/
│   ├── genetics/
│   │   ├── UnifiedGeneticsCanvas.jsx      [NOUVEAU - Principal]
│   │   ├── GeneticsLibrarySidebar.jsx     [NOUVEAU]
│   │   ├── CultivarLibraryItem.jsx        [NOUVEAU]
│   │   ├── NodeEditor.jsx                 [NOUVEAU]
│   │   ├── EdgeEditor.jsx                 [NOUVEAU]
│   │   ├── GeneticsExport.jsx             [NOUVEAU]
│   │   ├── GeneticsShare.jsx              [NOUVEAU]
│   │   ├── PhenoCodeGenerator.jsx         [EXISTING - Conservation]
│   │   ├── GeneticsLibraryCanvas.jsx      [À SUPPRIMER]
│   │   ├── GeneticsLibraryCanvas.jsx.bak  [À SUPPRIMER]
│   │   └── PhenoCodeGenerator.jsx.bak     [À SUPPRIMER]
│   ├── genealogy/
│   │   ├── GenealogyCanvas.jsx            [À SUPPRIMER]
│   │   └── CultivarLibraryPanel.jsx       [À SUPPRIMER]
│   └── phenohunt/
│       ├── CanevasPhenoHunt.jsx           [À SUPPRIMER]
│       ├── SidebarHierarchique.jsx        [À SUPPRIMER]
│       ├── PhenoNode.jsx                  [À SUPPRIMER]
│       ├── PhenoEdge.jsx                  [À SUPPRIMER]
│       └── index.js                       [À SUPPRIMER]
│
├── pages/
│   ├── GeneticsManagement/                [NOUVEAU]
│   │   ├── index.jsx                      [Principal]
│   │   ├── GeneticsManagementLayout.jsx
│   │   ├── TreesList.jsx
│   │   └── TreeEditor.jsx
│   └── CreateFlowerReview/
│       └── sections/
│           └── Genetiques.jsx             [REFACTOR]
│
├── store/
│   ├── useGeneticsStore.js                [NOUVEAU - Fusionné]
│   ├── usePhenoHuntStore.js               [OBSOLÈTE - À RETIRER]
│   └── index.js                           [UPDATE]
│
└── hooks/
    └── useGeneticsApi.js                  [NOUVEAU]

server-new/
├── prisma/
│   └── schema.prisma                      [UPDATE: Ajouter GeneticTree models]
├── routes/
│   └── genetics.js                        [NOUVEAU: API routes]
├── controllers/
│   └── geneticsController.js              [NOUVEAU]
├── middleware/
│   └── validateGenetics.js                [NOUVEAU: Validation]
└── server.js                              [UPDATE: Ajouter route]
```

---

## 2. BACKEND SPECS

### 2.1 Prisma Schema (server-new/prisma/schema.prisma)

```prisma
// ============================================
// GENETIC TREE - Arbres généalogiques
// ============================================
model GeneticTree {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation("geneticTrees", fields: [userId], references: [id], onDelete: Cascade)
  
  // Metadata
  name          String
  description   String?
  projectType   String        @default("library")  // "library" | "phenohunt" | "breeding"
  isPublic      Boolean       @default(false)
  
  // Sharing
  shareCode     String?       @unique
  sharedWith    String[]      @default([])  // userIds
  
  // Content
  nodes         GenNode[]
  edges         GenEdge[]
  
  // Tracking
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@index([userId])
  @@index([shareCode])
}

// ============================================
// GENETIC NODE - Nœuds de l'arbre
// ============================================
model GenNode {
  id            String        @id @default(cuid())
  treeId        String
  tree          GeneticTree   @relation(fields: [treeId], references: [id], onDelete: Cascade)
  
  // Reference au cultivar
  cultivarId    String?
  cultivar      Cultivar?     @relation(fields: [cultivarId], references: [id], onDelete: SetNull)
  
  // Données du nœud
  cultivarName  String        // Fallback si pas de cultivarId
  label         String?       // Display name (peut différer de cultivarName)
  
  // Position et visuals
  position      Json          // { x: number, y: number }
  color         String?       // #XXXXXX pour nœud
  image         String?       // URL image
  
  // Genetics data (snapshot au moment création)
  genetics      Json          // { type, breeder, thc, cbd, ... }
  notes         String?
  
  // Metadata
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@index([treeId])
  @@index([cultivarId])
}

// ============================================
// GENETIC EDGE - Relations parent/enfant
// ============================================
model GenEdge {
  id                  String        @id @default(cuid())
  treeId              String
  tree                GeneticTree   @relation(fields: [treeId], references: [id], onDelete: Cascade)
  
  // Nodes
  parentNodeId        String
  childNodeId         String
  
  // Relationship
  relationshipType    String?       // "mother" | "father" | "sibling" | "clone" | "hybrid"
  notes               String?
  
  createdAt           DateTime      @default(now())
  
  @@unique([treeId, parentNodeId, childNodeId])
  @@index([treeId])
}

// Update Cultivar model (add relation)
model Cultivar {
  // ... existing fields ...
  
  // New relations
  genNodes    GenNode[]     // Nœuds utilisant ce cultivar
  
  @@index([userId])
}
```

### 2.2 API Routes (server-new/routes/genetics.js)

```javascript
/**
 * routes/genetics.js
 * CRUD API pour arbres généalogiques et cultivars
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../server');
const { authenticateToken } = require('../middleware/auth');
const { validateTree, validateNode, validateEdge } = require('../middleware/validateGenetics');

// ============================================
// GENETIC TREES - CRUD
// ============================================

/**
 * GET /api/genetic-trees
 * Récupérer tous les arbres généalogiques de l'utilisateur
 * Query: ?sort=createdAt&order=desc&limit=20&offset=0
 */
router.get('/genetic-trees', authenticateToken, async (req, res) => {
  try {
    const { sort = 'createdAt', order = 'desc', limit = 20, offset = 0 } = req.query;
    
    const trees = await prisma.geneticTree.findMany({
      where: { userId: req.user.id },
      include: {
        nodes: { select: { id: true, cultivarName: true, position: true } },
        edges: { select: { id: true } }
      },
      orderBy: { [sort]: order.toLowerCase() },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.geneticTree.count({
      where: { userId: req.user.id }
    });

    res.json({ success: true, data: trees, total });
  } catch (error) {
    console.error('GET /genetic-trees error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/genetic-trees/:id
 * Récupérer un arbre spécifique avec tous ses nodes/edges
 */
router.get('/genetic-trees/:id', authenticateToken, async (req, res) => {
  try {
    const tree = await prisma.geneticTree.findUnique({
      where: { id: req.params.id },
      include: {
        nodes: {
          include: {
            cultivar: {
              select: { id: true, name: true, breeder: true, type: true, image: true }
            }
          }
        },
        edges: true
      }
    });

    if (!tree) {
      return res.status(404).json({ success: false, error: 'Tree not found' });
    }

    // Check authorization (owner or shared)
    if (tree.userId !== req.user.id && !tree.sharedWith.includes(req.user.id)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/genetic-trees
 * Créer un nouvel arbre généalogique
 * Body: { name, description, projectType, isPublic }
 */
router.post('/genetic-trees', authenticateToken, validateTree, async (req, res) => {
  try {
    const { name, description, projectType = 'library', isPublic = false } = req.body;

    const tree = await prisma.geneticTree.create({
      data: {
        userId: req.user.id,
        name,
        description,
        projectType,
        isPublic,
        nodes: [],
        edges: []
      }
    });

    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/genetic-trees/:id
 * Mettre à jour métadata arbre
 * Body: { name, description, projectType, isPublic }
 */
router.put('/genetic-trees/:id', authenticateToken, validateTree, async (req, res) => {
  try {
    const tree = await prisma.geneticTree.findUnique({
      where: { id: req.params.id }
    });

    if (!tree || tree.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const updated = await prisma.geneticTree.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/genetic-trees/:id
 * Supprimer un arbre généalogique
 */
router.delete('/genetic-trees/:id', authenticateToken, async (req, res) => {
  try {
    const tree = await prisma.geneticTree.findUnique({
      where: { id: req.params.id }
    });

    if (!tree || tree.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await prisma.geneticTree.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Tree deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GENETIC NODES - CRUD
// ============================================

/**
 * POST /api/genetic-trees/:treeId/nodes
 * Ajouter un nœud à l'arbre
 * Body: { cultivarId?, cultivarName, position: { x, y }, genetics, notes }
 */
router.post('/genetic-trees/:treeId/nodes', authenticateToken, validateNode, async (req, res) => {
  try {
    const { treeId } = req.params;
    const { cultivarId, cultivarName, position, genetics, notes, label } = req.body;

    // Vérifier autorisation
    const tree = await prisma.geneticTree.findUnique({
      where: { id: treeId }
    });

    if (!tree || tree.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const node = await prisma.genNode.create({
      data: {
        treeId,
        cultivarId: cultivarId || null,
        cultivarName,
        label,
        position,
        genetics: genetics || {},
        notes
      }
    });

    res.json({ success: true, data: node });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/genetic-trees/:treeId/nodes/:nodeId
 * Mettre à jour un nœud
 */
router.put('/genetic-trees/:treeId/nodes/:nodeId', authenticateToken, validateNode, async (req, res) => {
  try {
    const { treeId, nodeId } = req.params;
    const { position, genetics, notes, label } = req.body;

    // Vérifier autorisation
    const tree = await prisma.geneticTree.findUnique({
      where: { id: treeId }
    });

    if (!tree || tree.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const node = await prisma.genNode.update({
      where: { id: nodeId },
      data: {
        position: position || undefined,
        genetics: genetics || undefined,
        notes: notes || undefined,
        label: label || undefined
      }
    });

    res.json({ success: true, data: node });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/genetic-trees/:treeId/nodes/:nodeId
 * Supprimer un nœud et ses edges associées
 */
router.delete('/genetic-trees/:treeId/nodes/:nodeId', authenticateToken, async (req, res) => {
  try {
    const { treeId, nodeId } = req.params;

    // Vérifier autorisation
    const tree = await prisma.geneticTree.findUnique({
      where: { id: treeId }
    });

    if (!tree || tree.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Supprimer edges associées
    await prisma.genEdge.deleteMany({
      where: {
        treeId,
        OR: [
          { parentNodeId: nodeId },
          { childNodeId: nodeId }
        ]
      }
    });

    // Supprimer nœud
    await prisma.genNode.delete({
      where: { id: nodeId }
    });

    res.json({ success: true, message: 'Node deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GENETIC EDGES - CRUD
// ============================================

/**
 * POST /api/genetic-trees/:treeId/edges
 * Créer une relation parent-enfant
 * Body: { parentNodeId, childNodeId, relationshipType, notes }
 */
router.post('/genetic-trees/:treeId/edges', authenticateToken, validateEdge, async (req, res) => {
  try {
    const { treeId } = req.params;
    const { parentNodeId, childNodeId, relationshipType, notes } = req.body;

    // Vérifier autorisation
    const tree = await prisma.geneticTree.findUnique({
      where: { id: treeId }
    });

    if (!tree || tree.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const edge = await prisma.genEdge.create({
      data: {
        treeId,
        parentNodeId,
        childNodeId,
        relationshipType,
        notes
      }
    });

    res.json({ success: true, data: edge });
  } catch (error) {
    // Duplicate edge error
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Relationship already exists' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/genetic-trees/:treeId/edges/:edgeId
 * Supprimer une relation
 */
router.delete('/genetic-trees/:treeId/edges/:edgeId', authenticateToken, async (req, res) => {
  try {
    const { treeId, edgeId } = req.params;

    // Vérifier autorisation
    const tree = await prisma.geneticTree.findUnique({
      where: { id: treeId }
    });

    if (!tree || tree.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await prisma.genEdge.delete({
      where: { id: edgeId }
    });

    res.json({ success: true, message: 'Edge deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SHARING & EXPORT
// ============================================

/**
 * POST /api/genetic-trees/:id/share
 * Générer un code de partage
 */
router.post('/genetic-trees/:id/share', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tree = await prisma.geneticTree.findUnique({
      where: { id }
    });

    if (!tree || tree.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const shareCode = `tree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const updated = await prisma.geneticTree.update({
      where: { id },
      data: { shareCode, isPublic: true }
    });

    res.json({ success: true, shareCode, shareUrl: `/genetics/shared/${shareCode}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/genetic-trees/shared/:shareCode
 * Récupérer un arbre partagé
 */
router.get('/genetic-trees/shared/:shareCode', async (req, res) => {
  try {
    const tree = await prisma.geneticTree.findUnique({
      where: { shareCode: req.params.shareCode },
      include: {
        nodes: {
          include: {
            cultivar: { select: { id: true, name: true, breeder: true, type: true, image: true } }
          }
        },
        edges: true,
        user: { select: { id: true, username: true } }
      }
    });

    if (!tree || !tree.isPublic) {
      return res.status(404).json({ success: false, error: 'Tree not found or not public' });
    }

    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### 2.3 Middleware Validation (server-new/middleware/validateGenetics.js)

```javascript
/**
 * middleware/validateGenetics.js
 * Validation schemas pour genetic trees
 */

const validateTree = (req, res, next) => {
  const { name, projectType, isPublic } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required and must be a string' });
  }

  if (projectType && !['library', 'phenohunt', 'breeding'].includes(projectType)) {
    return res.status(400).json({ error: 'Invalid projectType' });
  }

  if (typeof isPublic !== 'undefined' && typeof isPublic !== 'boolean') {
    return res.status(400).json({ error: 'isPublic must be a boolean' });
  }

  next();
};

const validateNode = (req, res, next) => {
  const { cultivarName, position } = req.body;

  if (!cultivarName || typeof cultivarName !== 'string') {
    return res.status(400).json({ error: 'cultivarName is required' });
  }

  if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    return res.status(400).json({ error: 'position must have x and y coordinates' });
  }

  next();
};

const validateEdge = (req, res, next) => {
  const { parentNodeId, childNodeId } = req.body;

  if (!parentNodeId || !childNodeId) {
    return res.status(400).json({ error: 'parentNodeId and childNodeId are required' });
  }

  if (parentNodeId === childNodeId) {
    return res.status(400).json({ error: 'A node cannot be its own parent' });
  }

  next();
};

module.exports = { validateTree, validateNode, validateEdge };
```

### 2.4 Intégration dans server.js

```javascript
// server-new/server.js
const geneticsRoutes = require('./routes/genetics');

// ... setup existant ...

// Ajouter routes génétiques
app.use('/api', geneticsRoutes);

// ... reste du serveur ...
```

---

## 3. FRONTEND UNIFIED CANVAS

### 3.1 UnifiedGeneticsCanvas.jsx (Component Principal)

```javascript
/**
 * components/genetics/UnifiedGeneticsCanvas.jsx
 * Canvas généalogique unifié avec React Flow
 * 
 * Features:
 * - Drag & drop cultivars depuis sidebar
 * - Création/suppression nœuds
 * - Création/suppression edges (relations parent-enfant)
 * - Auto-layout (optional)
 * - Export (JSON, SVG, PNG)
 * - Responsive design
 * 
 * Props:
 * - initialTree?: GeneticTree
 * - cultivarLibrary?: Cultivar[]
 * - mode?: 'view' | 'edit' | 'inline'
 * - onChange?: (tree) => void
 * - onSave?: (tree) => Promise<void>
 * - showMinimap?: boolean
 * - height?: string
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  useReactFlow,
  MarkerType,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Plus, Trash2, Download, Share2, Copy, Save, AlertCircle, Loader } from 'lucide-react';
import GeneticsLibrarySidebar from './GeneticsLibrarySidebar';
import GeneticsExport from './GeneticsExport';
import NodeEditor from './NodeEditor';
import EdgeEditor from './EdgeEditor';

const nodeTypes = {
  cultivar: CultivarNode,
};

const edgeTypes = {
  genetic: GeneticEdge,
};

export default function UnifiedGeneticsCanvas({
  initialTree = null,
  cultivarLibrary = [],
  mode = 'edit',
  onChange = () => {},
  onSave = null,
  showMinimap = true,
  height = '600px',
  readonly = false
}) {
  const { fitView, screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showExport, setShowExport] = useState(false);

  // Initialiser depuis arbre existant
  useEffect(() => {
    if (initialTree?.nodes && initialTree?.edges) {
      const flowNodes = initialTree.nodes.map((node, idx) => ({
        id: node.id,
        data: {
          cultivarName: node.cultivarName,
          cultivar: cultivarLibrary.find(c => c.id === node.cultivarId),
          genetics: node.genetics,
          notes: node.notes
        },
        position: node.position || { x: idx * 250, y: 0 },
        type: 'cultivar'
      }));

      const flowEdges = initialTree.edges.map(edge => ({
        id: edge.id,
        source: edge.parentNodeId,
        target: edge.childNodeId,
        data: {
          relationshipType: edge.relationshipType,
          notes: edge.notes
        },
        type: 'genetic',
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: true
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [initialTree]);

  // Callback drag over
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Drop cultivar depuis sidebar
  const onDrop = useCallback((event) => {
    if (readonly) return;

    event.preventDefault();
    const cultivarData = JSON.parse(event.dataTransfer.getData('application/json'));
    
    if (!cultivarData?.id) {
      setError('Cultivar invalide');
      return;
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    const newNode = {
      id: `node-${Date.now()}`,
      data: {
        cultivarName: cultivarData.name,
        cultivar: cultivarData,
        genetics: cultivarData.genetics || {}
      },
      position,
      type: 'cultivar'
    };

    setNodes((nds) => [...nds, newNode]);
    onChange({ nodes: [...nodes, newNode], edges });
  }, [readonly, screenToFlowPosition, nodes, edges]);

  // Ajouter edge (connection)
  const onConnect = useCallback((connection) => {
    if (readonly) return;

    const newEdge = {
      ...connection,
      type: 'genetic',
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: true
    };

    setEdges((eds) => addEdge(newEdge, eds));
    onChange({ nodes, edges: [...edges, newEdge] });
  }, [readonly, nodes, edges]);

  // Supprimer nœud sélectionné
  const handleDeleteNode = useCallback(() => {
    if (!selectedNode || readonly) return;

    setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter(
      e => e.source !== selectedNode.id && e.target !== selectedNode.id
    ));
    setSelectedNode(null);
  }, [selectedNode, readonly]);

  // Supprimer edge sélectionné
  const handleDeleteEdge = useCallback(() => {
    if (!selectedEdge || readonly) return;

    setEdges((eds) => eds.filter(e => e.id !== selectedEdge.id));
    setSelectedEdge(null);
  }, [selectedEdge, readonly]);

  // Sauvegarder
  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      const tree = {
        nodes: nodes.map(n => ({
          id: n.id,
          cultivarName: n.data.cultivarName,
          cultivarId: n.data.cultivar?.id,
          position: n.position,
          genetics: n.data.genetics,
          notes: n.data.notes
        })),
        edges: edges.map(e => ({
          id: e.id,
          parentNodeId: e.source,
          childNodeId: e.target,
          relationshipType: e.data?.relationshipType,
          notes: e.data?.notes
        }))
      };

      await onSave(tree);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-layout (Dagre - optional)
  const handleAutoLayout = useCallback(() => {
    // Implémentation future avec Dagre
    // Pour MVP: ignorer
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header Actions */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Arbre Généalogique
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {nodes.length} cultivars, {edges.length} relations
          </p>
        </div>

        <div className="flex gap-2">
          {error && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            onClick={() => setShowExport(true)}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            disabled={nodes.length === 0 || readonly}
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>

          {onSave && (
            <button
              onClick={handleSave}
              disabled={isSaving || readonly}
              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sauvegarder
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex gap-4 flex-1 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Sidebar */}
        {mode !== 'view' && (
          <GeneticsLibrarySidebar
            cultivarLibrary={cultivarLibrary}
            selectedNodes={nodes.map(n => n.data.cultivarId).filter(Boolean)}
            readonly={readonly}
          />
        )}

        {/* Canvas */}
        <div className="flex-1" style={{ height }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={(_, node) => setSelectedNode(node)}
            onEdgeClick={(_, edge) => setSelectedEdge(edge)}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Background />
            <Controls />
            {showMinimap && <MiniMap />}
          </ReactFlow>
        </div>
      </div>

      {/* Node Editor */}
      {selectedNode && !readonly && (
        <NodeEditor
          node={selectedNode}
          onUpdate={(data) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === selectedNode.id ? { ...n, data } : n
              )
            );
          }}
          onDelete={handleDeleteNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Edge Editor */}
      {selectedEdge && !readonly && (
        <EdgeEditor
          edge={selectedEdge}
          onUpdate={(data) => {
            setEdges((eds) =>
              eds.map((e) =>
                e.id === selectedEdge.id ? { ...e, data } : e
              )
            );
          }}
          onDelete={handleDeleteEdge}
          onClose={() => setSelectedEdge(null)}
        />
      )}

      {/* Export Dialog */}
      {showExport && (
        <GeneticsExport
          tree={{ nodes, edges }}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
```

**Suite dans le document suivant due to length...**

---

## 4. STORE MANAGEMENT

### 4.1 useGeneticsStore.js (Zustand Store Unifié)

```javascript
/**
 * store/useGeneticsStore.js
 * Store unifié pour gestion génétique + cultivars
 * Replaces: usePhenoHuntStore.js
 */

import { create } = 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { fetchGeneticsAPI } from '../hooks/useGeneticsApi';

export const useGeneticsStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ============================================
        // STATE
        // ============================================
        
        // Genetic Trees
        geneticTrees: [],
        activeTreeId: null,
        isLoadingTrees: false,
        
        // Cultivars Library
        cultivarLibrary: [],
        isLoadingCultivars: false,
        
        // Selection
        selectedNodeId: null,
        selectedEdgeId: null,
        
        // UI
        error: null,
        
        // ============================================
        // GENETIC TREES ACTIONS
        // ============================================
        
        /**
         * Charger tous les arbres généalogiques utilisateur
         */
        loadTrees: async () => {
          set({ isLoadingTrees: true, error: null });
          try {
            const { data } = await fetchGeneticsAPI.getTrees();
            set({ geneticTrees: data, isLoadingTrees: false });
          } catch (error) {
            set({ error: error.message, isLoadingTrees: false });
          }
        },

        /**
         * Charger un arbre spécifique
         */
        loadTree: async (treeId) => {
          try {
            const { data } = await fetchGeneticsAPI.getTree(treeId);
            set((state) => ({
              geneticTrees: state.geneticTrees.map((t) =>
                t.id === treeId ? data : t
              ),
              activeTreeId: treeId
            }));
          } catch (error) {
            set({ error: error.message });
          }
        },

        /**
         * Créer un nouvel arbre généalogique
         */
        createTree: async (name, description, projectType = 'library') => {
          try {
            const { data } = await fetchGeneticsAPI.createTree({
              name,
              description,
              projectType
            });
            set((state) => ({
              geneticTrees: [...state.geneticTrees, data],
              activeTreeId: data.id
            }));
            return data;
          } catch (error) {
            set({ error: error.message });
            throw error;
          }
        },

        /**
         * Mettre à jour métadata arbre
         */
        updateTree: async (treeId, updates) => {
          try {
            const { data } = await fetchGeneticsAPI.updateTree(treeId, updates);
            set((state) => ({
              geneticTrees: state.geneticTrees.map((t) =>
                t.id === treeId ? data : t
              )
            }));
          } catch (error) {
            set({ error: error.message });
          }
        },

        /**
         * Supprimer un arbre
         */
        deleteTree: async (treeId) => {
          try {
            await fetchGeneticsAPI.deleteTree(treeId);
            set((state) => ({
              geneticTrees: state.geneticTrees.filter((t) => t.id !== treeId),
              activeTreeId:
                state.activeTreeId === treeId ? null : state.activeTreeId
            }));
          } catch (error) {
            set({ error: error.message });
          }
        },

        /**
         * Dupliquer un arbre
         */
        duplicateTree: async (treeId) => {
          const state = get();
          const tree = state.geneticTrees.find((t) => t.id === treeId);
          if (!tree) throw new Error('Tree not found');

          try {
            const newTree = await get().createTree(
              `${tree.name} (copie)`,
              tree.description,
              tree.projectType
            );
            
            // Copier les nœuds et edges
            for (const node of tree.nodes || []) {
              await get().addNode(newTree.id, {
                cultivarId: node.cultivarId,
                cultivarName: node.cultivarName,
                position: node.position,
                genetics: node.genetics,
                notes: node.notes
              });
            }

            return newTree;
          } catch (error) {
            set({ error: error.message });
            throw error;
          }
        },

        /**
         * Sélectionner un arbre comme actif
         */
        setActiveTree: (treeId) => {
          set({ activeTreeId: treeId });
        },

        // ============================================
        // GENETIC NODES ACTIONS
        // ============================================

        /**
         * Ajouter un nœud à l'arbre actif
         */
        addNode: async (treeId, nodeData) => {
          try {
            const { data } = await fetchGeneticsAPI.addNode(treeId, nodeData);
            set((state) => ({
              geneticTrees: state.geneticTrees.map((t) =>
                t.id === treeId
                  ? { ...t, nodes: [...(t.nodes || []), data] }
                  : t
              )
            }));
            return data;
          } catch (error) {
            set({ error: error.message });
            throw error;
          }
        },

        /**
         * Mettre à jour un nœud
         */
        updateNode: async (treeId, nodeId, updates) => {
          try {
            const { data } = await fetchGeneticsAPI.updateNode(
              treeId,
              nodeId,
              updates
            );
            set((state) => ({
              geneticTrees: state.geneticTrees.map((t) =>
                t.id === treeId
                  ? {
                      ...t,
                      nodes: t.nodes.map((n) =>
                        n.id === nodeId ? data : n
                      )
                    }
                  : t
              )
            }));
          } catch (error) {
            set({ error: error.message });
          }
        },

        /**
         * Supprimer un nœud
         */
        deleteNode: async (treeId, nodeId) => {
          try {
            await fetchGeneticsAPI.deleteNode(treeId, nodeId);
            set((state) => ({
              geneticTrees: state.geneticTrees.map((t) =>
                t.id === treeId
                  ? {
                      ...t,
                      nodes: t.nodes.filter((n) => n.id !== nodeId),
                      edges: t.edges.filter(
                        (e) => e.parentNodeId !== nodeId && e.childNodeId !== nodeId
                      )
                    }
                  : t
              )
            }));
          } catch (error) {
            set({ error: error.message });
          }
        },

        // ============================================
        // GENETIC EDGES ACTIONS
        // ============================================

        /**
         * Ajouter une relation parent-enfant
         */
        addEdge: async (treeId, parentNodeId, childNodeId, relationshipType = 'parent') => {
          try {
            const { data } = await fetchGeneticsAPI.addEdge(treeId, {
              parentNodeId,
              childNodeId,
              relationshipType
            });
            set((state) => ({
              geneticTrees: state.geneticTrees.map((t) =>
                t.id === treeId
                  ? { ...t, edges: [...(t.edges || []), data] }
                  : t
              )
            }));
            return data;
          } catch (error) {
            set({ error: error.message });
            throw error;
          }
        },

        /**
         * Supprimer une relation
         */
        deleteEdge: async (treeId, edgeId) => {
          try {
            await fetchGeneticsAPI.deleteEdge(treeId, edgeId);
            set((state) => ({
              geneticTrees: state.geneticTrees.map((t) =>
                t.id === treeId
                  ? { ...t, edges: t.edges.filter((e) => e.id !== edgeId) }
                  : t
              )
            }));
          } catch (error) {
            set({ error: error.message });
          }
        },

        // ============================================
        // CULTIVAR LIBRARY ACTIONS
        // ============================================

        /**
         * Charger la bibliothèque de cultivars utilisateur
         */
        loadCultivars: async () => {
          set({ isLoadingCultivars: true });
          try {
            const { data } = await fetchGeneticsAPI.getCultivars();
            set({ cultivarLibrary: data, isLoadingCultivars: false });
          } catch (error) {
            set({ error: error.message, isLoadingCultivars: false });
          }
        },

        /**
         * Ajouter un cultivar à la bibliothèque
         */
        addCultivar: async (cultivarData) => {
          try {
            const { data } = await fetchGeneticsAPI.createCultivar(cultivarData);
            set((state) => ({
              cultivarLibrary: [...state.cultivarLibrary, data]
            }));
            return data;
          } catch (error) {
            set({ error: error.message });
            throw error;
          }
        },

        /**
         * Mettre à jour un cultivar
         */
        updateCultivar: async (cultivarId, updates) => {
          try {
            const { data } = await fetchGeneticsAPI.updateCultivar(cultivarId, updates);
            set((state) => ({
              cultivarLibrary: state.cultivarLibrary.map((c) =>
                c.id === cultivarId ? data : c
              )
            }));
          } catch (error) {
            set({ error: error.message });
          }
        },

        /**
         * Supprimer un cultivar
         */
        deleteCultivar: async (cultivarId) => {
          try {
            await fetchGeneticsAPI.deleteCultivar(cultivarId);
            set((state) => ({
              cultivarLibrary: state.cultivarLibrary.filter((c) => c.id !== cultivarId)
            }));
          } catch (error) {
            set({ error: error.message });
          }
        },

        // ============================================
        // UTILITY ACTIONS
        // ============================================

        /**
         * Obtenir l'arbre actif
         */
        getActiveTree: () => {
          const { geneticTrees, activeTreeId } = get();
          return geneticTrees.find((t) => t.id === activeTreeId) || null;
        },

        /**
         * Obtenir cultivar par ID
         */
        getCultivarById: (cultivarId) => {
          const { cultivarLibrary } = get();
          return cultivarLibrary.find((c) => c.id === cultivarId);
        },

        /**
         * Effacer erreur
         */
        clearError: () => set({ error: null }),

        /**
         * Reset store
         */
        reset: () =>
          set({
            geneticTrees: [],
            activeTreeId: null,
            cultivarLibrary: [],
            selectedNodeId: null,
            selectedEdgeId: null,
            error: null,
            isLoadingTrees: false,
            isLoadingCultivars: false
          })
      }),
      {
        name: 'genetics-store',
        partialize: (state) => ({
          cultivarLibrary: state.cultivarLibrary,
          // Ne pas persister geneticTrees (rechargement depuis API)
        })
      }
    )
  )
);
```

---

Fin de la spécification complète. La refonte est documentée en détail avec:

✅ Architecture globale  
✅ Backend schema + API routes  
✅ Frontend unified canvas  
✅ Store management  
✅ Et plus...

Voir suite dans document "SPECIFICATIONS_IMPLEMENTATION_GENETICS_CONTINUED.md" pour pages, routing, API integration, UX specs et mobile adaptations.
