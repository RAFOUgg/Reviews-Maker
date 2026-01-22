# 📘 PHENOHUNT IMPLEMENTATION GUIDE - COMPLET

**Durée**: 24 heures  
**Scope**: Canvas UI + Backend généralisé + Library intégration  
**Pour**: Créer système généalogique cannabis (Fleurs priority, tous produits supportés)

---

## 🎯 ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────┐
│  GENETICS WORKSPACE (GeneticsWorkspace.jsx)              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────────────────┐  │
│  │  SIDEBAR     │         │  CANVAS                  │  │
│  │              │         │                          │  │
│  │ • Projects   │         │  ┌─────────────────┐    │  │
│  │ • Cultivars  │         │  │ CultivarNode    │    │  │
│  │ • Library    │         │  │  (drag-drop)    │    │  │
│  │ • Favorites  │         │  └─────────────────┘    │  │
│  │              │         │      │                  │  │
│  └──────────────┘         │      ├→ Relationship    │  │
│                            │      │   Lines         │  │
│  ┌──────────────┐         │      ├→ CultivarNode   │  │
│  │  PROJECT MGR │         │      │   (child)       │  │
│  │              │         │      └─────────────────┘  │
│  │ • Save/Load  │         │                          │
│  │ • Duplicate  │         │  Zoom/Pan with drag    │  │
│  │ • Export     │         │  right-click menu      │  │
│  │ • Share      │         │                          │  │
│  └──────────────┘         └──────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 DATABASE SCHEMA (Prisma)

### Modèles à créer/mettre à jour

```prisma
// ============================================================================
// PHENOHUNT PROJECTS
// ============================================================================
model PhenoHuntProject {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  
  name              String      @db.VarChar(255)
  description       String?     @db.Text
  productType       String      // 'flower', 'hash', 'concentrate', 'edible'
  
  // Settings
  isPublic          Boolean     @default(false)
  tags              String[]    @default([])
  notes             String?     @db.Text
  
  // Relations
  geneticTrees      GeneticTree[]
  phases            PhenoHuntPhase[]
  savedPhenos       SavedPheno[]
  
  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId])
  @@fulltext([name, description])
}

// ============================================================================
// GENETIC TREES (already exists - expand)
// ============================================================================
model GeneticTree {
  id                String      @id @default(cuid())
  projectId         String
  project           PhenoHuntProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  cultivarId        String?     // Reference to saved cultivar
  cultivar          Cultivar?   @relation(fields: [cultivarId], references: [id])
  
  rootNodeId        String?     // Root node of tree
  
  // Tree metadata
  name              String      @db.VarChar(255)
  genetics          Json?       // {breeder, type, percentage, lineage}
  
  // Canvas data
  canvasData        Json?       // {x, y, zoom, panX, panY}
  
  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  nodes             GeneticTreeNode[]
  relationships     GeneticRelationship[]
  
  @@index([projectId])
  @@index([cultivarId])
}

// ============================================================================
// GENETIC TREE NODES (cultivars in project)
// ============================================================================
model GeneticTreeNode {
  id                String      @id @default(cuid())
  treeId            String
  tree              GeneticTree @relation(fields: [treeId], references: [id], onDelete: Cascade)
  
  // Cultivar info
  cultivarName      String      @db.VarChar(255)
  genetics          Json?       // {breeder, type, percentage}
  pheno             String?     // Phenotype selection (e.g., "P1", "Hunt #3")
  
  // Visual properties
  canvasX           Float       @default(0)
  canvasY           Float       @default(0)
  color             String      @default("#E8F5E9")
  
  // Node metadata
  notes             String?     @db.Text
  characteristics   Json?       // {height, yield, potency, terps, effects}
  
  // Parents/Children
  parentId          String?
  parent            GeneticTreeNode?  @relation("TreeParentChild", fields: [parentId], references: [id])
  children          GeneticTreeNode[]  @relation("TreeParentChild")
  
  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([treeId])
  @@index([parentId])
}

// ============================================================================
// GENETIC RELATIONSHIPS (explicit parent-child tracking)
// ============================================================================
model GeneticRelationship {
  id                String      @id @default(cuid())
  treeId            String
  tree              GeneticTree @relation(fields: [treeId], references: [id], onDelete: Cascade)
  
  parentNodeId      String
  parentNode        GeneticTreeNode @relation("ParentOf", fields: [parentNodeId], references: [id])
  
  childNodeId       String
  childNode         GeneticTreeNode @relation("ChildOf", fields: [childNodeId], references: [id])
  
  // Relationship type
  type              String      // 'direct_cross', 'backcross', 'pheno_selection', 'sibling'
  notes             String?     @db.Text
  
  @@unique([treeId, parentNodeId, childNodeId])
  @@index([treeId])
  @@index([parentNodeId])
  @@index([childNodeId])
  
  relation ParentOf
  relation ChildOf
}

// ============================================================================
// SAVED PHENOTYPES (favorite discoveries)
// ============================================================================
model SavedPheno {
  id                String      @id @default(cuid())
  projectId         String
  project           PhenoHuntProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  cultivarName      String      @db.VarChar(255)
  phenoSelection    String      // "P1", "Hunt #3", etc.
  
  // Performance data
  characteristics   Json        // {yield, potency, terps, effects, vigor}
  growNotes         String?     @db.Text
  
  // Metadata
  discoveredAt      DateTime    @default(now())
  reviewId          String?     // Link to actual review
  
  isFavorite        Boolean     @default(false)
  tags              String[]    @default([])
  
  @@index([projectId])
}

// ============================================================================
// CULTIVAR LIBRARY (global + per-user)
// ============================================================================
model Cultivar {
  id                String      @id @default(cuid())
  userId            String?     // Null = global/system cultivar
  user              User?       @relation(fields: [userId], references: [id])
  
  name              String      @db.VarChar(255)
  breeder           String?     @db.VarChar(255)
  
  genetics          Json?       // {type, percentage, dominance}
  productType       String      // 'flower', 'hash', 'concentrate', 'edible'
  
  // Characteristics
  expectedYield     Float?      // g/m²
  expectedTHC       Float?      // %
  expectedCBD       Float?      // %
  expectedTerps     Json?       // {name: percentage}
  
  isPublic          Boolean     @default(false)
  isFavorite        Boolean     @default(false)
  tags              String[]    @default([])
  
  // Relations
  geneticTrees      GeneticTree[]
  savedPhenos       SavedPheno[]
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId])
  @@index([name])
  @@fulltext([name, breeder])
}

// Add to User model:
// cultivars       Cultivar[]
// phenoHuntProjects PhenoHuntProject[]
```

---

## 🎨 FRONTEND COMPONENTS

### 1. **GeneticsWorkspace.jsx** (500 lines)
```javascript
// Main container - manages state, layout, modals

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GeneticsCanvas from './GeneticsCanvas';
import GeneticsSidebar from './GeneticsSidebar';
import ProjectManager from './ProjectManager';
import PhaseSelectionModal from './PhaseSelectionModal';
import { useGeneticsProject } from './hooks/useGeneticsProject';

export default function GeneticsWorkspace({ projectId = null }) {
  // State
  const { project, nodes, relationships, isLoading, error } = useGeneticsProject(projectId);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [draggedCultivar, setDraggedCultivar] = useState(null);
  
  // Canvas state
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  
  // Handlers
  const handleAddCultivar = useCallback((cultivar, x, y) => {
    // 1. Create node at x,y
    // 2. Post to /api/genetics/nodes
    // 3. Update state
  }, [project?.id]);
  
  const handleCreateRelationship = useCallback((parentId, childId, type) => {
    // 1. Post to /api/genetics/relationships
    // 2. Update state
  }, [project?.id]);
  
  const handleDeleteNode = useCallback((nodeId) => {
    // 1. Delete /api/genetics/nodes/{nodeId}
    // 2. Update state
  }, []);
  
  // Render
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorScreen error={error} />;
  
  return (
    <div className="flex h-full bg-neutral-50">
      {/* Sidebar */}
      <GeneticsSidebar
        project={project}
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        onNewProject={() => setShowProjectModal(true)}
        onDragCultivar={setDraggedCultivar}
      />
      
      {/* Canvas */}
      <motion.div className="flex-1 relative">
        <GeneticsCanvas
          nodes={nodes}
          relationships={relationships}
          selectedNodeId={selectedNodeId}
          draggedCultivar={draggedCultivar}
          zoom={canvasZoom}
          pan={canvasPan}
          onZoom={setCanvasZoom}
          onPan={setCanvasPan}
          onAddNode={handleAddCultivar}
          onCreateRelationship={handleCreateRelationship}
          onDeleteNode={handleDeleteNode}
          onSelectNode={setSelectedNodeId}
        />
      </motion.div>
      
      {/* Modals */}
      {showPhaseModal && (
        <PhaseSelectionModal
          onClose={() => setShowPhaseModal(false)}
          onSave={(pheno) => {
            // Save phenotype
            setShowPhaseModal(false);
          }}
        />
      )}
      
      {showProjectModal && (
        <ProjectManager
          project={project}
          onClose={() => setShowProjectModal(false)}
        />
      )}
    </div>
  );
}
```

### 2. **GeneticsCanvas.jsx** (400 lines)
```javascript
// Canvas with drag-drop, zoom, pan, relationship drawing

import { useRef, useState } from 'react';
import CultivarNode from './CultivarNode';
import RelationshipLine from './RelationshipLine';

export default function GeneticsCanvas({
  nodes,
  relationships,
  selectedNodeId,
  draggedCultivar,
  zoom,
  pan,
  onZoom,
  onPan,
  onAddNode,
  onCreateRelationship,
  onDeleteNode,
  onSelectNode,
}) {
  // Canvas refs
  const canvasRef = useRef(null);
  const [drawingLine, setDrawingLine] = useState(null); // {fromNodeId, toX, toY}
  
  // Handlers
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (!draggedCultivar) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    onAddNode(draggedCultivar, x, y);
  };
  
  const handleNodeDragStart = (e, nodeId) => {
    setDrawingLine({ fromNodeId: nodeId, toX: e.clientX, toY: e.clientY });
  };
  
  const handleNodeDragEnd = (e, targetNodeId) => {
    if (drawingLine?.fromNodeId && drawingLine.fromNodeId !== targetNodeId) {
      onCreateRelationship(drawingLine.fromNodeId, targetNodeId, 'direct_cross');
    }
    setDrawingLine(null);
  };
  
  const handleCanvasWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    onZoom(Math.max(0.5, Math.min(3, zoom * delta)));
  };
  
  // Render
  return (
    <div
      ref={canvasRef}
      className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden cursor-grab active:cursor-grabbing"
      onDrop={handleCanvasDrop}
      onDragOver={(e) => e.preventDefault()}
      onWheel={handleCanvasWheel}
      style={{
        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
      }}
    >
      {/* Relationship lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {relationships.map((rel) => (
          <RelationshipLine
            key={rel.id}
            parentNode={nodes.find(n => n.id === rel.parentNodeId)}
            childNode={nodes.find(n => n.id === rel.childNodeId)}
            type={rel.type}
          />
        ))}
        {drawingLine && <line x1={drawingLine.x1} y1={drawingLine.y1} x2={drawingLine.toX} y2={drawingLine.toY} stroke="#999" strokeDasharray="5,5" />}
      </svg>
      
      {/* Cultivar nodes */}
      {nodes.map((node) => (
        <CultivarNode
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          onSelect={() => onSelectNode(node.id)}
          onDelete={() => onDeleteNode(node.id)}
          onDragStart={(e) => handleNodeDragStart(e, node.id)}
          onDragEnd={(e) => handleNodeDragEnd(e, node.id)}
        />
      ))}
    </div>
  );
}
```

### 3. **GeneticsSidebar.jsx** (300 lines)
```javascript
// Sidebar with projects, cultivars, library access

import { useQuery } from '@tanstack/react-query';

export default function GeneticsSidebar({
  project,
  nodes,
  selectedNodeId,
  onSelectNode,
  onNewProject,
  onDragCultivar,
}) {
  // Queries
  const { data: myCultivars } = useQuery({
    queryKey: ['cultivars', 'my'],
    queryFn: () => fetch('/api/genetics/cultivars').then(r => r.json()),
  });
  
  const { data: favorites } = useQuery({
    queryKey: ['cultivars', 'favorites'],
    queryFn: () => fetch('/api/genetics/cultivars?favorites=true').then(r => r.json()),
  });
  
  return (
    <div className="w-80 bg-white border-r border-neutral-200 flex flex-col overflow-hidden">
      {/* Projects */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm mb-3">Projets</h2>
        <button
          onClick={onNewProject}
          className="w-full px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
        >
          + Nouveau Projet
        </button>
      </div>
      
      {/* Library Cultivars */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="font-semibold text-sm mb-3">Ma Bibliothèque</h3>
        
        {/* Search/Filter */}
        <input
          type="text"
          placeholder="Chercher cultivar..."
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm mb-3"
        />
        
        {/* Favorites */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-neutral-600 mb-2">⭐ Favoris</h4>
          <div className="space-y-2">
            {favorites?.map((cultivar) => (
              <div
                key={cultivar.id}
                draggable
                onDragStart={() => onDragCultivar(cultivar)}
                className="p-2 bg-amber-50 border border-amber-200 rounded-lg cursor-grab text-sm hover:bg-amber-100"
              >
                <div className="font-medium">{cultivar.name}</div>
                <div className="text-xs text-neutral-600">{cultivar.breeder}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* All Cultivars */}
        <h4 className="text-xs font-semibold text-neutral-600 mb-2">Tous</h4>
        <div className="space-y-2">
          {myCultivars?.map((cultivar) => (
            <div
              key={cultivar.id}
              draggable
              onDragStart={() => onDragCultivar(cultivar)}
              className="p-2 bg-neutral-50 border border-neutral-200 rounded-lg cursor-grab text-sm hover:bg-neutral-100"
            >
              <div className="font-medium">{cultivar.name}</div>
              <div className="text-xs text-neutral-600">{cultivar.breeder}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Node Info Panel */}
      {selectedNodeId && (
        <div className="p-4 border-t bg-neutral-50">
          <NodeInfoPanel nodeId={selectedNodeId} />
        </div>
      )}
    </div>
  );
}
```

### 4. **CultivarNode.jsx** (150 lines)
```javascript
// Single node on canvas - drag-drop enabled

export default function CultivarNode({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDragStart,
  onDragEnd,
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={`
        absolute w-32 p-3 rounded-lg border-2 cursor-move
        transition-all duration-200
        ${isSelected 
          ? 'bg-green-50 border-green-500 shadow-lg' 
          : 'bg-white border-neutral-200 shadow-sm hover:shadow-md'
        }
      `}
      style={{
        left: `${node.canvasX}px`,
        top: `${node.canvasY}px`,
      }}
    >
      {/* Header */}
      <div className="font-semibold text-sm mb-1 truncate">
        {node.cultivarName}
      </div>
      
      {/* Phenotype badge */}
      {node.pheno && (
        <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mb-2">
          {node.pheno}
        </div>
      )}
      
      {/* Stats */}
      {node.characteristics && (
        <div className="text-xs text-neutral-600 space-y-1 mb-3">
          {node.characteristics.potency && (
            <div>THC: {node.characteristics.potency}%</div>
          )}
          {node.characteristics.yield && (
            <div>Yield: {node.characteristics.yield}g/m²</div>
          )}
        </div>
      )}
      
      {/* Context menu button */}
      <div className="flex gap-2">
        <button
          onClick={() => onDelete()}
          className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Suppr.
        </button>
      </div>
    </div>
  );
}
```

### 5. **RelationshipLine.jsx** (100 lines)
```javascript
// Draw relationship lines between parent/child nodes

export default function RelationshipLine({ parentNode, childNode, type }) {
  if (!parentNode || !childNode) return null;
  
  const x1 = parentNode.canvasX + 64; // center
  const y1 = parentNode.canvasY + 60;
  const x2 = childNode.canvasX + 64;
  const y2 = childNode.canvasY;
  
  const getColor = () => {
    switch (type) {
      case 'direct_cross': return '#10b981';
      case 'backcross': return '#f59e0b';
      case 'pheno_selection': return '#3b82f6';
      case 'sibling': return '#8b5cf6';
      default: return '#6b7280';
    }
  };
  
  return (
    <>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={getColor()}
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
      {/* Type label in middle */}
      <text
        x={(x1 + x2) / 2}
        y={(y1 + y2) / 2}
        className="text-xs fill-neutral-600"
        textAnchor="middle"
      >
        {type}
      </text>
    </>
  );
}
```

### 6. **ProjectManager.jsx** (200 lines)
```javascript
// Modal for save/load/duplicate/export projects

export default function ProjectManager({ project, onClose }) {
  const handleSaveProject = async (name, description) => {
    const resp = await fetch('/api/genetics/projects', {
      method: project?.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: project?.id,
        name,
        description,
      }),
    });
    // Update state + close
  };
  
  const handleExport = async (format) => {
    // PNG, SVG, JSON
    const resp = await fetch(`/api/genetics/projects/${project.id}/export?format=${format}`);
    // Download file
  };
  
  return (
    <Modal onClose={onClose}>
      <h2>Gérer Projet</h2>
      
      {/* Save/Edit form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSaveProject(/* ... */);
      }}>
        <input name="name" placeholder="Nom du projet" required />
        <textarea name="description" placeholder="Description..." />
        <button type="submit">Enregistrer</button>
      </form>
      
      {/* Export buttons */}
      <div>
        <button onClick={() => handleExport('json')}>📥 Export JSON</button>
        <button onClick={() => handleExport('png')}>🖼 Export PNG</button>
        <button onClick={() => handleExport('svg')}>📐 Export SVG</button>
      </div>
      
      {/* Sharing */}
      <div>
        <input type="checkbox" id="isPublic" />
        <label htmlFor="isPublic">Rendre public?</label>
      </div>
    </Modal>
  );
}
```

### 7. **PhaseSelectionModal.jsx** (100 lines)
```javascript
// Name phenotype (e.g., "P1", "Hunt #3")

export default function PhaseSelectionModal({ onClose, onSave }) {
  const [phenoName, setPhenoName] = useState('');
  
  return (
    <Modal onClose={onClose}>
      <h2>Nommer Phénotype</h2>
      <p>Donnez un nom à cette sélection phénotypique</p>
      
      <div className="space-y-4">
        <div>
          <label>Format: P1, P2, Hunt#3, etc.</label>
          <input
            value={phenoName}
            onChange={(e) => setPhenoName(e.target.value)}
            placeholder="Ex: P1_High_Yield"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <button
          onClick={() => onSave(phenoName)}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          Sauvegarder Phénotype
        </button>
      </div>
    </Modal>
  );
}
```

---

## 🔧 BACKEND ROUTES

### `server-new/routes/phenohunt.js` (300 lines)

```javascript
import express from 'express';
import { prisma } from '../db.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// ============================================================================
// PROJECTS
// ============================================================================

// GET /api/genetics/projects
router.get('/projects', authenticateUser, async (req, res) => {
  const projects = await prisma.phenoHuntProject.findMany({
    where: { userId: req.user.id },
    include: { geneticTrees: { include: { nodes: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(projects);
});

// POST /api/genetics/projects
router.post('/projects', authenticateUser, async (req, res) => {
  const { name, description, productType } = req.body;
  const project = await prisma.phenoHuntProject.create({
    data: {
      userId: req.user.id,
      name,
      description,
      productType,
    },
  });
  res.json(project);
});

// PUT /api/genetics/projects/:id
router.put('/projects/:id', authenticateUser, async (req, res) => {
  const { name, description, isPublic, tags } = req.body;
  const project = await prisma.phenoHuntProject.update({
    where: { id: req.params.id },
    data: { name, description, isPublic, tags },
  });
  res.json(project);
});

// ============================================================================
// NODES
// ============================================================================

// POST /api/genetics/nodes
router.post('/nodes', authenticateUser, async (req, res) => {
  const { treeId, cultivarName, canvasX, canvasY } = req.body;
  const node = await prisma.geneticTreeNode.create({
    data: {
      treeId,
      cultivarName,
      canvasX,
      canvasY,
    },
  });
  res.json(node);
});

// PUT /api/genetics/nodes/:id
router.put('/nodes/:id', authenticateUser, async (req, res) => {
  const { canvasX, canvasY, characteristics, notes } = req.body;
  const node = await prisma.geneticTreeNode.update({
    where: { id: req.params.id },
    data: { canvasX, canvasY, characteristics, notes },
  });
  res.json(node);
});

// DELETE /api/genetics/nodes/:id
router.delete('/nodes/:id', authenticateUser, async (req, res) => {
  await prisma.geneticTreeNode.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ============================================================================
// RELATIONSHIPS
// ============================================================================

// POST /api/genetics/relationships
router.post('/relationships', authenticateUser, async (req, res) => {
  const { treeId, parentNodeId, childNodeId, type, notes } = req.body;
  const relationship = await prisma.geneticRelationship.create({
    data: {
      treeId,
      parentNodeId,
      childNodeId,
      type,
      notes,
    },
  });
  res.json(relationship);
});

// DELETE /api/genetics/relationships/:id
router.delete('/relationships/:id', authenticateUser, async (req, res) => {
  await prisma.geneticRelationship.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ============================================================================
// EXPORT
// ============================================================================

// GET /api/genetics/projects/:id/export?format=png|svg|json
router.get('/projects/:id/export', authenticateUser, async (req, res) => {
  const { format } = req.query;
  const project = await prisma.phenoHuntProject.findUnique({
    where: { id: req.params.id },
    include: { geneticTrees: { include: { nodes: true, relationships: true } } },
  });
  
  if (!project) return res.status(404).json({ error: 'Not found' });
  
  let file;
  switch (format) {
    case 'json':
      file = JSON.stringify(project, null, 2);
      res.set('Content-Type', 'application/json');
      res.send(file);
      break;
    case 'png':
    case 'svg':
      // Use html-to-image or similar
      break;
  }
});

export default router;
```

---

## 🎯 HOOKS (State Management)

### `client/src/components/genetics/hooks/useGeneticsProject.js`

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useGeneticsProject(projectId) {
  const queryClient = useQueryClient();
  
  // Fetch project data
  const { data: project, isLoading } = useQuery({
    queryKey: ['genetics', projectId],
    queryFn: () => fetch(`/api/genetics/projects/${projectId}`).then(r => r.json()),
    enabled: !!projectId,
  });
  
  // Fetch all nodes
  const { data: nodes = [] } = useQuery({
    queryKey: ['geneticNodes', projectId],
    queryFn: () => fetch(`/api/genetics/projects/${projectId}/nodes`).then(r => r.json()),
    enabled: !!projectId,
  });
  
  // Fetch relationships
  const { data: relationships = [] } = useQuery({
    queryKey: ['geneticRelationships', projectId],
    queryFn: () => fetch(`/api/genetics/projects/${projectId}/relationships`).then(r => r.json()),
    enabled: !!projectId,
  });
  
  // Mutations
  const addNodeMutation = useMutation({
    mutationFn: (nodeData) => fetch('/api/genetics/nodes', {
      method: 'POST',
      body: JSON.stringify(nodeData),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geneticNodes', projectId] });
    },
  });
  
  return {
    project,
    nodes,
    relationships,
    isLoading,
    addNode: addNodeMutation.mutate,
  };
}
```

---

## 📋 INTEGRATION WITH LIBRARY

When user saves a phenotype in Phenohunt, it should:
1. Create SavedPheno record
2. Link to SavedReview (if exists)
3. Show in Library sidebar
4. Allow quick-import to new reviews

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Database & Backend (6h)
- [ ] Update Prisma schema (add all models)
- [ ] Run migration
- [ ] Create phenohunt.js routes
- [ ] Create geneticsHelper.js utility
- [ ] Test API endpoints with Postman

### Phase 2: UI Canvas (8h)
- [ ] Create GeneticsWorkspace.jsx
- [ ] Create GeneticsCanvas.jsx with drag-drop
- [ ] Create CultivarNode.jsx
- [ ] Create RelationshipLine.jsx
- [ ] Test drag-drop interactions

### Phase 3: Sidebar & Controls (6h)
- [ ] Create GeneticsSidebar.jsx
- [ ] Create ProjectManager.jsx
- [ ] Create PhaseSelectionModal.jsx
- [ ] Test UI interactions

### Phase 4: Library Integration (2h)
- [ ] Link saved phenotypes to Library
- [ ] Add quick-import to reviews
- [ ] Test end-to-end flow

### Phase 5: Testing & Polish (2h)
- [ ] Full QA testing
- [ ] Performance testing
- [ ] Error handling
- [ ] Mobile responsiveness

---

**Total**: 24 hours  
**Status**: Ready to implement

