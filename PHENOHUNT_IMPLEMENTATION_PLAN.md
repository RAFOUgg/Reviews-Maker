# Phenohunt Genetics System - Comprehensive Implementation Plan

**Phase:** 2  
**Status:** 📋 Planning & Architecture  
**Start Date:** January 22, 2026  
**Target Completion:** February 2026

---

## 1. Feature Overview

### What is Phenohunt?
Phenohunt is a **genetic tree management system** that allows producers to:
- Create and manage a library of cannabis cultivars
- Track genetic lineage (parent-child relationships)
- Manage pheno hunts (phenotype hunting projects)
- Visualize genetics as interactive trees/graphs
- Export and share genetic data

### Who Uses It?
- **Producteur (Paid $29.99/month):** Full access
- **Influenceur (Paid $15.99/month):** View-only access
- **Amateur:** No access

---

## 2. Architecture Design

### Data Model

```sql
-- Core genetics entities
genetic_trees
├── id (UUID)
├── userId (FK to users)
├── name (varchar)
├── description (text)
├── projectType ('phenohunt' | 'cultivation' | 'research')
├── isPublic (boolean)
├── shareCode (unique varchar)
├── sharedWith (JSON array)
├── createdAt (timestamp)
└── updatedAt (timestamp)

gen_nodes (tree nodes - represent cultivars)
├── id (UUID)
├── treeId (FK to genetic_trees)
├── cultivarId (FK to cultivars - nullable)
├── cultivarName (varchar)
├── position (JSON {x, y, z})
├── color (hex color)
├── image (URL)
├── genetics (JSON {indica%, sativa%, cbd%, thc%})
├── notes (text)
├── createdAt (timestamp)
└── updatedAt (timestamp)

gen_edges (relationships)
├── id (UUID)
├── treeId (FK to genetic_trees)
├── parentNodeId (FK to gen_nodes)
├── childNodeId (FK to gen_nodes)
├── relationshipType ('parent' | 'mother' | 'father' | 'sibling')
├── notes (text)
├── createdAt (timestamp)
└── updatedAt (timestamp)

cultivars (user's cultivar library)
├── id (UUID)
├── userId (FK to users)
├── name (varchar - unique per user)
├── breeder (varchar)
├── type ('indica' | 'sativa' | 'hybrid')
├── indicaRatio (0-100)
├── parentage (text)
├── phenotype (varchar)
├── notes (text)
├── useCount (integer)
├── createdAt (timestamp)
└── updatedAt (timestamp)
```

### Frontend Component Hierarchy

```
GeneticsManagementPage
├── Sidebar
│   ├── LibraryTab
│   │   ├── CultivarList
│   │   │   └── CultivarItem (drag-able)
│   │   └── SearchFilter
│   └── PhenoHuntTab
│       ├── ProjectList
│       │   └── ProjectItem
│       └── CreateProjectForm
│
└── MainCanvas
    ├── GeneticTreeCanvas (ReactFlow)
    │   ├── GeneticNode (custom node)
    │   │   ├── Avatar/Image
    │   │   ├── Cultivar Name
    │   │   ├── Genetics Info
    │   │   └── Actions Menu
    │   ├── GeneticEdge (connection lines)
    │   └── CanvasControls
    │       ├── Zoom In/Out
    │       ├── Pan
    │       ├── Auto-Layout
    │       └── Export
    │
    └── NodeDetailsPanel
        ├── CultivarInfo
        ├── GeneticsInfo
        ├── EditForm
        └── DeleteButton
```

---

## 3. Implementation Tasks

### Phase 2.1: Database Schema & Backend Setup

#### Task 1: Create Prisma Schema
**File:** `server-new/prisma/schema.prisma`

```prisma
// Add to existing schema:

model GeneticTree {
  id            String      @id @default(cuid())
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
  name          String
  description   String?
  projectType   String      @default("phenohunt") // phenohunt, cultivation, research
  isPublic      Boolean     @default(false)
  shareCode     String?     @unique
  sharedWith    String      @default("[]") // JSON array of user IDs
  nodes         GenNode[]
  edges         GenEdge[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([userId])
  @@index([projectType])
  @@index([isPublic])
}

model GenNode {
  id            String      @id @default(cuid())
  tree          GeneticTree @relation(fields: [treeId], references: [id], onDelete: Cascade)
  treeId        String
  cultivar      Cultivar?   @relation(fields: [cultivarId], references: [id], onDelete: SetNull)
  cultivarId    String?
  cultivarName  String
  position      String      @default("{\"x\":0,\"y\":0,\"z\":0}") // JSON
  color         String      @default("#FF6B9D")
  image         String?
  genetics      String      @default("{}") // JSON {indica, sativa, cbd, thc}
  notes         String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  parentEdges   GenEdge[]   @relation("parent")
  childEdges    GenEdge[]   @relation("child")

  @@index([treeId])
  @@index([cultivarId])
}

model GenEdge {
  id                String    @id @default(cuid())
  tree              GeneticTree @relation(fields: [treeId], references: [id], onDelete: Cascade)
  treeId            String
  parentNode        GenNode   @relation("parent", fields: [parentNodeId], references: [id], onDelete: Cascade)
  parentNodeId      String
  childNode         GenNode   @relation("child", fields: [childNodeId], references: [id], onDelete: Cascade)
  childNodeId       String
  relationshipType  String    @default("parent") // parent, mother, father, sibling
  notes             String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([parentNodeId, childNodeId, relationshipType])
  @@index([treeId])
  @@index([parentNodeId])
  @@index([childNodeId])
}

model Cultivar {
  id            String      @id @default(cuid())
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
  name          String
  breeder       String?
  type          String?     // indica, sativa, hybrid
  indicaRatio   Int?        // 0-100
  parentage     String?
  phenotype     String?
  notes         String?
  useCount      Int         @default(0)
  genNodes      GenNode[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@unique([userId, name])
  @@index([userId])
  @@index([name])
}
```

#### Task 2: Create Database Migration
```bash
cd server-new
npx prisma migrate dev --name add_genetics_phenohunt
npx prisma generate
```

**Output:** Migration file in `server-new/prisma/migrations/`

---

### Phase 2.2: Backend API Routes

#### Task 3: Create Genetics Routes
**File:** `server-new/routes/genetics.js`

**Endpoints to Implement:**

```javascript
// Trees (Genetic Projects)
GET    /api/genetics/trees              - List user's trees
POST   /api/genetics/trees              - Create new tree
GET    /api/genetics/trees/:id          - Get tree details
PATCH  /api/genetics/trees/:id          - Update tree
DELETE /api/genetics/trees/:id          - Delete tree
GET    /api/genetics/trees/:id/export   - Export tree as JSON

// Nodes (Cultivars in tree)
POST   /api/genetics/trees/:id/nodes    - Add node to tree
GET    /api/genetics/nodes/:id          - Get node details
PATCH  /api/genetics/nodes/:id          - Update node
DELETE /api/genetics/nodes/:id          - Remove node

// Edges (Relationships)
POST   /api/genetics/trees/:id/edges    - Create relationship
GET    /api/genetics/edges/:id          - Get relationship
PATCH  /api/genetics/edges/:id          - Update relationship
DELETE /api/genetics/edges/:id          - Remove relationship

// Cultivars (Library)
GET    /api/genetics/cultivars          - List user's cultivars
POST   /api/genetics/cultivars          - Create cultivar
GET    /api/genetics/cultivars/:id      - Get cultivar details
PATCH  /api/genetics/cultivars/:id      - Update cultivar
DELETE /api/genetics/cultivars/:id      - Delete cultivar

// Sharing
POST   /api/genetics/trees/:id/share    - Create share code
GET    /api/genetics/shared/:code       - Access shared tree
DELETE /api/genetics/trees/:id/share    - Revoke share code
```

#### Task 4: Create Genetics Services
**File:** `server-new/services/genetics.js`

**Functions:**
- `createGeneticTree()` - Initialize new tree
- `addNodeToTree()` - Add cultivar to tree
- `createRelationship()` - Link parent-child
- `updateNodePosition()` - Save canvas position
- `getTreeWithRelations()` - Fetch full tree with edges
- `exportTree()` - Export as JSON/CSV
- `validateTreeAccess()` - Check permissions
- `shareTree()` - Generate share code

---

### Phase 2.3: Frontend Components

#### Task 5: Create Genetics Management Page
**File:** `client/src/pages/GeneticsManagementPage.jsx`

**Main Container:**
- Two-column layout (sidebar + canvas)
- Responsive design
- Dark mode support

#### Task 6: Create Sidebar Components
**Files:**
- `client/src/components/genetics/LibraryTab.jsx` - Cultivar library
- `client/src/components/genetics/PhenoHuntTab.jsx` - Project management
- `client/src/components/genetics/CultivarList.jsx` - Scrollable list
- `client/src/components/genetics/CreateProjectForm.jsx` - New project

#### Task 7: Create Canvas Components
**Files:**
- `client/src/components/genetics/GeneticTreeCanvas.jsx` - Main canvas (ReactFlow)
- `client/src/components/genetics/GeneticNode.jsx` - Node component
- `client/src/components/genetics/GeneticEdge.jsx` - Connection lines
- `client/src/components/genetics/NodeDetailsPanel.jsx` - Side panel

#### Task 8: Create Utilities
**Files:**
- `client/src/utils/geneticsLayouter.js` - Auto-layout algorithms
- `client/src/utils/geneticsExport.js` - Export functions
- `client/src/utils/geneticsValidator.js` - Data validation

---

### Phase 2.4: Advanced Features

#### Task 9: Implement Drag & Drop
- Drag cultivars from library onto canvas
- Drag nodes on canvas
- Drop to create relationships

#### Task 10: Implement Auto-Layout
- Hierarchical tree layout
- Force-directed layout
- Circular layout

#### Task 11: Implement Sharing
- Generate unique share codes
- Public/private trees
- View-only access for non-owners

#### Task 12: Implement Export
- JSON export
- CSV export
- Image export (with html2canvas)
- PDF export (with jsPDF)

---

## 4. Technology Stack

### Frontend
- **React 18** - UI framework
- **ReactFlow** - Node/edge visualization
- **React DnD** - Drag & drop
- **Zustand** - State management
- **React Router** - Navigation
- **CSS3** - Styling

### Backend
- **Express.js** - API framework
- **Prisma** - ORM
- **Node.js** - Runtime

### Database
- **SQLite** - Database (via Prisma)

### Utilities
- **html2canvas** - Canvas to image
- **jsPDF** - PDF generation

---

## 5. Implementation Timeline

```
Week 1 (Jan 22-28):
├── Database schema & migrations
├── Backend routes & services
└── API documentation

Week 2 (Jan 29 - Feb 4):
├── Frontend pages & components
├── Canvas implementation
└── Drag & drop functionality

Week 3 (Feb 5-11):
├── Auto-layout algorithms
├── Sharing functionality
├── Export features

Week 4 (Feb 12-18):
├── Testing & QA
├── Performance optimization
└── Production deployment
```

---

## 6. Database Queries Performance

### Indexes to Create:
```sql
CREATE INDEX idx_genetic_trees_userId ON genetic_trees(userId);
CREATE INDEX idx_genetic_trees_isPublic ON genetic_trees(isPublic);
CREATE INDEX idx_gen_nodes_treeId ON gen_nodes(treeId);
CREATE INDEX idx_gen_nodes_cultivarId ON gen_nodes(cultivarId);
CREATE INDEX idx_gen_edges_treeId ON gen_edges(treeId);
CREATE INDEX idx_gen_edges_parentNodeId ON gen_edges(parentNodeId);
CREATE INDEX idx_gen_edges_childNodeId ON gen_edges(childNodeId);
CREATE INDEX idx_cultivars_userId ON cultivars(userId);
CREATE UNIQUE INDEX idx_cultivars_userId_name ON cultivars(userId, name);
```

**Performance Targets:**
- List trees: < 100ms
- Get tree with relations: < 500ms
- Create node: < 100ms
- Export tree: < 1000ms

---

## 7. API Response Examples

### GET /api/genetics/trees/:id
```json
{
  "id": "tree-123",
  "name": "2024 Pheno Hunt",
  "description": "My 2024 phenotype hunting project",
  "projectType": "phenohunt",
  "isPublic": false,
  "nodes": [
    {
      "id": "node-1",
      "cultivarName": "Northern Lights",
      "position": {"x": 100, "y": 100, "z": 0},
      "color": "#FF6B9D",
      "genetics": {"indica": 100, "sativa": 0, "cbd": 0.5, "thc": 18.5},
      "notes": "Strong pheno, good yields"
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "parentNodeId": "node-1",
      "childNodeId": "node-2",
      "relationshipType": "mother",
      "notes": "F1 generation"
    }
  ]
}
```

### POST /api/genetics/trees/:id/nodes
```json
Request:
{
  "cultivarId": "cultivar-456",
  "cultivarName": "Blue Dream",
  "position": {"x": 300, "y": 100, "z": 0},
  "genetics": {"indica": 40, "sativa": 60},
  "notes": "Pheno #3"
}

Response:
{
  "id": "node-456",
  "treeId": "tree-123",
  "cultivarId": "cultivar-456",
  "status": "success",
  "message": "Node added successfully"
}
```

---

## 8. Testing Strategy

### Unit Tests
- Service functions
- Validation logic
- Calculation functions

### Integration Tests
- API endpoints
- Database operations
- Authorization checks

### E2E Tests
- Create tree -> Add node -> Create edge -> Export
- Drag node on canvas
- Share tree and verify access
- Export in different formats

---

## 9. UI/UX Design Specifications

### Color Scheme
- Primary: #FF6B9D (signature pink)
- Secondary: #667EEA (blue)
- Neutral: #F3F4F6 (light gray)
- Dark mode: #1F2937 background

### Typography
- Headlines: Inter, Bold, 24px
- Body text: Inter, Regular, 14px
- Code: Courier New, 12px

### Spacing
- Small: 8px
- Medium: 16px
- Large: 24px
- XL: 32px

### Component Heights
- Sidebar: 60% viewport width
- Canvas: 40% viewport width
- Nodes: 80px height
- Node radius: 40px

---

## 10. Security & Permissions

### Access Control
```
Amateur:        ❌ No access
Producteur:     ✅ Full access (own trees only)
Influenceur:    ✅ View-only (public + shared trees)
Admin:          ✅ Full access (all trees)
```

### Validation Rules
- Tree name: 3-100 characters
- Cultivar name: 2-50 characters
- Share code: 8 characters, alphanumeric
- Max nodes per tree: 1000
- Max edges per tree: 5000

---

## 11. Monitoring & Analytics

### Metrics to Track
- Trees created per day
- Active users on genetics page
- Export counts by format
- Share link clicks
- Canvas interaction metrics

### Error Tracking
- Failed node creation
- Invalid relationship errors
- Storage limit exceeded
- Permission denied attempts

---

## 12. Documentation Requirements

### For Developers
- API documentation (Swagger/OpenAPI)
- Database schema diagram
- Component hierarchy diagram
- Code comments and JSDoc

### For Users
- Tutorial video
- Step-by-step guide
- FAQ section
- Keyboard shortcuts

---

## 13. Success Criteria

✅ **Must Have:**
- Create/edit/delete genetic trees
- Add/manage cultivar nodes
- Create parent-child relationships
- Visual tree representation
- Export functionality
- Permission-based access

⚡ **Nice to Have:**
- Auto-layout algorithms
- Sharing with specific users
- Analytics dashboard
- Mobile app support
- Real-time collaboration

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Large tree performance | High | Implement pagination, lazy loading |
| Complex drag & drop | Medium | Use established library (ReactFlow) |
| User data loss | High | Implement auto-save, backup |
| Sharing exploitation | Medium | Rate limiting, access logs |
| Mobile compatibility | Medium | Responsive design, touch support |

---

## 15. Deployment Checklist

- [ ] Database migrations applied
- [ ] Backend routes tested
- [ ] Frontend components tested
- [ ] End-to-end tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation complete
- [ ] User acceptance testing
- [ ] Deployment to staging
- [ ] Deployment to production
- [ ] Monitoring enabled
- [ ] User notifications sent

---

**Next Steps:**
1. Review and approve this plan
2. Begin Task 1: Create Prisma Schema
3. Set up development environment
4. Start implementing backend first
5. Parallel frontend development

**Questions?** Review the detailed documentation or contact the development team.

---

*This plan will be updated as we learn more during implementation.*
