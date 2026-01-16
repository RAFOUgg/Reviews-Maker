# Sprint 2: Critical Fixes Implementation Guide
**Priority:** CRITICAL - Complete before testing  
**Estimated Time:** 2-3 hours (once Node.js available)  
**Impact:** Security & Data Integrity

---

## Fix #1: Add Producer Permission Middleware (CRITICAL)

### Location: `/server-new/routes/genetics.js`

**Current Code (Lines 1-50):**
```javascript
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Current - NO permission check
router.get("/trees", requireAuth, async (req, res) => {
```

**Fixed Code:**
```javascript
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireProducerOrBeta } = require('../middleware/permissions');

// FIXED - Added Producer check
router.get("/trees", requireAuth, requireProducerOrBeta, async (req, res) => {
```

**Apply to ALL routes in genetics.js:**
- Line 40: GET /trees
- Line 60: POST /trees
- Line 90: GET /trees/:id
- Line 120: PUT /trees/:id
- Line 150: DELETE /trees/:id
- Line 180: POST /trees/:id/nodes (and all other node routes)
- Line 250: POST /trees/:id/edges (and all other edge routes)

**Test After Fix:**
```bash
npm test -- --testNamePattern="Producer permission"
# Should PASS for producer accounts
# Should FAIL with 403 for consumer accounts
```

---

## Fix #2: Add Frontend Permission Checks (CRITICAL)

### Location: `/client/src/components/genetics/UnifiedGeneticsCanvas.jsx`

**Current Code (Lines 1-50):**
```javascript
const UnifiedGeneticsCanvas = ({ treeId, readOnly = false }) => {
    const store = useGeneticsStore();
    
    // NO permission check - shows UI for all users
    return (
        <div className="canvas">
            {/* Edit buttons shown to all users */}
        </div>
    );
};
```

**Fixed Code:**
```javascript
import { usePermissions } from '../../hooks/usePermissions';
import { FeatureUpgradeModal } from '../modals/FeatureUpgradeModal';

const UnifiedGeneticsCanvas = ({ treeId, readOnly = false }) => {
    const store = useGeneticsStore();
    const { accountType, isProducer } = usePermissions();
    
    // FIXED - Check permission
    if (!isProducer && !readOnly) {
        return (
            <FeatureUpgradeModal 
                feature="phenohunt" 
                message="Genetic trees are available for Producers"
            />
        );
    }
    
    // Show read-only or edit mode based on permission
    const isEditable = isProducer || !readOnly;
    
    return (
        <div className={`canvas ${isEditable ? 'editable' : 'readonly'}`}>
            {/* Edit buttons only if isEditable */}
            {isEditable && <EditToolbar />}
        </div>
    );
};
```

**Also update:**
- `/client/src/components/genetics/NodeContextMenu.jsx` - Hide delete/edit options if not editable
- `/client/src/components/genetics/TreeFormModal.jsx` - Hide form if not editable
- `/client/src/components/genetics/NodeFormModal.jsx` - Disable inputs if not editable

**Test After Fix:**
```bash
npm test -- --testNamePattern="Permission checks"
# Should show FeatureUpgradeModal for Consumer
# Should show editable canvas for Producer
```

---

## Fix #3: Prevent Self-Edges (CRITICAL)

### Location: `/server-new/routes/genetics.js` (Edge creation)

**Current Code (Lines 280-310):**
```javascript
router.post("/trees/:id/edges", requireAuth, requireProducerOrBeta, async (req, res) => {
    try {
        const { parentNodeId, childNodeId, relationshipType } = req.body;
        
        // NO validation for self-edge
        const edge = await prisma.geneticEdge.create({
            data: {
                treeId: req.params.id,
                parentNodeId,
                childNodeId,
                relationshipType,
            }
        });
```

**Fixed Code:**
```javascript
router.post("/trees/:id/edges", requireAuth, requireProducerOrBeta, async (req, res) => {
    try {
        const { parentNodeId, childNodeId, relationshipType } = req.body;
        
        // FIXED - Validate nodes are different
        if (parentNodeId === childNodeId) {
            return res.status(400).json({ 
                error: "Cannot create edge: parent and child must be different nodes",
                code: "SELF_EDGE_NOT_ALLOWED"
            });
        }
        
        // Validate relationship type
        const validTypes = ['parent-child', 'sibling', 'cross'];
        if (!validTypes.includes(relationshipType)) {
            return res.status(400).json({ 
                error: `Invalid relationship type. Must be one of: ${validTypes.join(', ')}`,
                code: "INVALID_RELATIONSHIP_TYPE"
            });
        }
        
        const edge = await prisma.geneticEdge.create({
            data: {
                treeId: req.params.id,
                parentNodeId,
                childNodeId,
                relationshipType,
            }
        });
```

**Test After Fix:**
```bash
npm test -- --testNamePattern="Self-edge validation"
# Should fail when parentNodeId === childNodeId
# Should fail with invalid relationshipType
```

---

## Fix #4: Validate Cultivar Exists (HIGH)

### Location: `/server-new/routes/genetics.js` (Node creation)

**Current Code (Lines 150-180):**
```javascript
router.post("/trees/:id/nodes", requireAuth, requireProducerOrBeta, async (req, res) => {
    try {
        const { cultivarId, cultivarName, genetics, position, color } = req.body;
        
        // NO check if cultivar exists
        const node = await prisma.geneticNode.create({
            data: {
                treeId: req.params.id,
                cultivarId,
                cultivarName,
                // ...
            }
        });
```

**Fixed Code:**
```javascript
router.post("/trees/:id/nodes", requireAuth, requireProducerOrBeta, async (req, res) => {
    try {
        const { cultivarId, cultivarName, genetics, position, color } = req.body;
        
        // FIXED - Validate cultivar exists in library
        if (cultivarId) {
            const cultivar = await prisma.cultivar.findUnique({
                where: { id: cultivarId }
            });
            if (!cultivar) {
                return res.status(400).json({ 
                    error: "Cultivar not found",
                    code: "CULTIVAR_NOT_FOUND"
                });
            }
        }
        
        const node = await prisma.geneticNode.create({
            data: {
                treeId: req.params.id,
                cultivarId,
                cultivarName,
                // ...
            }
        });
```

---

## Fix #5: Enum Constraint on Relationship Type (HIGH)

### Location: `/server-new/prisma/schema.prisma`

**Current Schema:**
```prisma
model GeneticEdge {
    id String @id @default(cuid())
    treeId String
    parentNodeId String
    childNodeId String
    relationshipType String  // NO constraint
    createdAt DateTime @default(now())
}
```

**Fixed Schema:**
```prisma
enum RelationshipType {
    PARENT_CHILD
    SIBLING
    CROSS
}

model GeneticEdge {
    id String @id @default(cuid())
    treeId String
    parentNodeId String
    childNodeId String
    relationshipType RelationshipType  // FIXED - Enum
    createdAt DateTime @default(now())
    
    tree GeneticTree @relation(fields: [treeId], references: [id], onDelete: Cascade)
    parentNode GeneticNode @relation("parent", fields: [parentNodeId], references: [id], onDelete: Cascade)
    childNode GeneticNode @relation("child", fields: [childNodeId], references: [id], onDelete: Cascade)
}
```

**After schema update:**
```bash
cd server-new
npx prisma migrate dev --name add_relationship_type_enum
```

---

## Fix #6: Position Update Race Condition (MEDIUM)

### Location: `/client/src/components/genetics/UnifiedGeneticsCanvas.jsx`

**Current Code (Lines 110-130):**
```javascript
const handleNodeDragStop = async (event, node) => {
    // UI updates BEFORE server confirmation
    setNodes(prevNodes =>
        prevNodes.map(n => n.id === node.id ? node : n)
    );
    
    // Server call may fail but UI already updated
    try {
        await store.updateNodePosition(node.id, { x: node.position.x, y: node.position.y });
    } catch (error) {
        console.error("Failed to save position", error);
        // No rollback - user sees wrong position
    }
};
```

**Fixed Code:**
```javascript
const handleNodeDragStop = async (event, node) => {
    // Store original position for rollback
    const originalNode = store.nodes.find(n => n.id === node.id);
    const oldPosition = originalNode.position;
    
    // Update UI optimistically
    setNodes(prevNodes =>
        prevNodes.map(n => n.id === node.id ? node : n)
    );
    
    // Save to server with error handling and rollback
    try {
        await store.updateNodePosition(node.id, { 
            x: node.position.x, 
            y: node.position.y 
        });
    } catch (error) {
        // FIXED - Rollback UI on failure
        setNodes(prevNodes =>
            prevNodes.map(n => 
                n.id === node.id 
                    ? { ...n, position: oldPosition } 
                    : n
            )
        );
        
        // Show error message to user
        store.setError(`Failed to save position: ${error.message}`);
        
        // Re-sync from server
        await store.loadTree(store.selectedTreeId);
    }
};
```

---

## Fix #7: Duplicate Edge Prevention (MEDIUM)

### Location: `/server-new/routes/genetics.js`

**Current Code:**
```javascript
router.post("/trees/:id/edges", ..., async (req, res) => {
    // NO check for duplicate edges
    const edge = await prisma.geneticEdge.create({
```

**Fixed Code:**
```javascript
router.post("/trees/:id/edges", ..., async (req, res) => {
    const { parentNodeId, childNodeId } = req.body;
    
    // FIXED - Check for existing edge
    const existingEdge = await prisma.geneticEdge.findFirst({
        where: {
            treeId: req.params.id,
            parentNodeId,
            childNodeId,
        }
    });
    
    if (existingEdge) {
        return res.status(400).json({ 
            error: "Edge already exists between these nodes",
            code: "DUPLICATE_EDGE"
        });
    }
    
    const edge = await prisma.geneticEdge.create({
```

---

## Fix #8: JSON Field Robustness (LOW)

### Location: `/client/src/store/useGeneticsStore.js`

**Current Code (Line 85):**
```javascript
const position = typeof n.position === 'string' ? JSON.parse(n.position) : n.position;
// Fragile - could throw on bad JSON
```

**Fixed Code:**
```javascript
const parsePosition = (pos) => {
    if (!pos) return { x: 0, y: 0 };
    
    try {
        return typeof pos === 'string' ? JSON.parse(pos) : pos;
    } catch (e) {
        console.warn('Invalid position data:', pos, e);
        return { x: 0, y: 0 };
    }
};

// Usage:
const position = parsePosition(n.position);
```

---

## Implementation Checklist

### Phase 1: Backend Fixes (1 hour)
- [ ] Fix #1: Add Producer permission middleware to all genetics routes
- [ ] Fix #3: Add self-edge validation
- [ ] Fix #4: Add cultivar existence validation
- [ ] Test: `npm test -- genetics` (should have failures for permissions)

### Phase 2: Database Schema (30 min)
- [ ] Fix #5: Add RelationshipType enum to Prisma schema
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Update seed data if needed

### Phase 3: Frontend Fixes (1 hour)
- [ ] Fix #2: Add permission checks to UnifiedGeneticsCanvas
- [ ] Fix #6: Add rollback logic for position updates
- [ ] Fix #8: Make JSON parsing robust

### Phase 4: Edge Cases (30 min)
- [ ] Fix #7: Add duplicate edge prevention
- [ ] Add constraint in Prisma schema for duplicate edges
- [ ] Test all edge cases

### Phase 5: Testing (1 hour)
- [ ] Run full test suite: `npm test`
- [ ] Manual UAT: Create tree → Add nodes → Create edges → Export
- [ ] Verify permission enforcement
- [ ] Verify error messages

---

## Deployment Checklist

Before merging to main:
- [ ] All fixes implemented
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Migration tested on staging DB
- [ ] Manual UAT complete
- [ ] Documentation updated

---

## Estimated Completion

**With fixes applied:** ~2-3 hours  
**Testing:** ~1-2 hours  
**Total:** ~3-5 hours (assuming Node.js available)

**New Status After Fixes:** 90% Ready ✅

---

