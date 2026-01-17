# 🎯 IMMEDIATE ACTION PLAN - V1 MVP Continuation

**Date**: January 16, 2026  
**Status**: ✅ Ready to Continue  
**Estimated Time**: 4-6 hours for full validation  

---

## 🟢 PHASE 1: SPRINT 1 FINALIZATION (1-2 hours)

### Checklist: Permissions End-to-End Validation

#### Backend Validation (30 min)

```bash
# 1. Check middleware are applied to all routes
grep -r "requireAuth\|requireSectionAccess" server-new/routes/

# 2. Verify permission matrix
- [ ] Amateur → Section 3 (Culture) returns 403 ✅
- [ ] Influenceur → Section 3 (Culture) returns 403 ✅
- [ ] Producteur → All sections ✅
- [ ] Review count limit enforced (Amateur: 10, Influenceur: 50)

# 3. Test API endpoints
POST http://localhost:3000/api/flower-reviews
  Headers: Authorization with 3 account types
  Expected: Amateur/Producteur/Influenceur all work for basic review

POST http://localhost:3000/api/genetics/trees
  Headers: Amateur token
  Expected: 403 Forbidden
  
POST http://localhost:3000/api/export/generate
  Params: ?format=json&accountType=amateur
  Expected: 403 (JSON export not allowed)
```

#### Frontend Validation (30 min)

```bash
# 1. Create test accounts in browser
- [ ] Amateur user account
- [ ] Producteur user account  
- [ ] Influenceur user account

# 2. Test Section visibility
- [ ] Amateur: See Sections 1, 4-9 ONLY
- [ ] Producteur: See ALL sections 1-10
- [ ] Influenceur: See 1, 2 (readonly), 4-10

# 3. Test Buttons/Exports
- [ ] "Export JSON" disabled for Amateur
- [ ] "Template Complète" disabled for Amateur
- [ ] "PhenoHunt" button hidden for Amateur
- [ ] UpgradeModal shows on locked feature click

# 4. Test Error Messages
- [ ] Click locked button → Toast: "Feature reserved for Producteur"
- [ ] Redirect to /upgrade available
```

#### Tests to Run

```bash
# Backend tests
cd server-new
npm test -- tests/permissions.integration.test.js

# Frontend tests  
cd client
npm test -- src/tests/permissions.integration.test.js
```

---

## 🟡 PHASE 2: SPRINT 2 PHENOHUNT (2-3 hours)

### Backend Work (1-2 hours)

#### Create `/api/genetics` endpoints

```javascript
// File: server-new/routes/genetics.js (already exists 537 lines)
// Validate these are implemented:

GET /api/genetics/trees                    // List user's trees
POST /api/genetics/trees                   // Create new tree
GET /api/genetics/trees/:treeId            // Get tree with nodes/edges
PUT /api/genetics/trees/:treeId            // Update tree
DELETE /api/genetics/trees/:treeId         // Delete tree

POST /api/genetics/trees/:treeId/nodes     // Add node to tree
PUT /api/genetics/trees/:treeId/nodes/:nodeId
DELETE /api/genetics/trees/:treeId/nodes/:nodeId

POST /api/genetics/trees/:treeId/edges     // Add relationship
PUT /api/genetics/trees/:treeId/edges/:edgeId
DELETE /api/genetics/trees/:treeId/edges/:edgeId

GET /api/genetics/cultivars                // List cultivars
POST /api/genetics/cultivars               // Create cultivar
```

**Validation**:
- [ ] All CRUD endpoints return proper HTTP status
- [ ] Permissions enforced (Producteur only for trees)
- [ ] Relationships save correctly (parent → child)
- [ ] Nodes contain: cultivarName, cultivarId, position, color, genetics

#### Prisma Models

```bash
# Check schema has:
- [ ] GeneticTree model (id, userId, name, description, nodes, edges)
- [ ] GeneticNode model (id, treeId, cultivarId, label, position, color)
- [ ] GeneticEdge model (id, treeId, parentNodeId, childNodeId, type)
- [ ] Cultivar model (id, userId, name, breeder, genetics, genetics_data)
```

### Frontend Work (1 hour)

#### Validate useGeneticsStore (already 518 lines)

```bash
# Checklist:
- [ ] fetchTrees() works
- [ ] loadTree(treeId) fetches nodes/edges
- [ ] createNode() sends POST to backend
- [ ] updateEdge() sends PUT for relationships
- [ ] saveTree() persists all data
- [ ] canDelete checks ownership
```

#### Test UnifiedGeneticsCanvas Component

```bash
# Checklist:
- [ ] Canvas renders with loaded nodes
- [ ] Drag-drop nodes possible
- [ ] Right-click context menu shows
- [ ] Create new node button works
- [ ] Create relationship (edge) works
- [ ] Save button persists to backend
- [ ] Zoom/pan controls functional
```

#### Test Genetiques Section Integration

```bash
# In CreateFlowerReview:
- [ ] "Créer un arbre vide" button works
- [ ] "Créer un arbre à partir de cette fleur" works
- [ ] Can import to existing tree (drag-drop from sidebar)
- [ ] Validation: "Validé la sélection" button syncs tree to form
- [ ] Selected tree displays at bottom
```

---

## 🟢 PHASE 3: SECTIONS 5-9 END-TO-END TEST (1 hour)

### Comprehensive Test Workflow

```bash
# Create a flower review (step by step):

1. Section 1: Infos Générales
   - [ ] Fill name, cultivar, farm
   - [ ] Upload 2-4 photos
   - [ ] Select type (Sativa/Indica)
   - [ ] Click "Suivant"

2. Section 2: Génétiques  
   - [ ] Fill breeder + variety
   - [ ] Select type + ratio if hybrid
   - [ ] Fill genealogy (parents)
   - [ ] Try PhenoHunt (as Producteur only)
   - [ ] Click "Suivant"

3. Section 3: Pipeline Culture (Producteur only)
   - [ ] Fill basic info (dates, space, environment)
   - [ ] Add some pipeline cells
   - [ ] Click "Suivant"

4. Section 4: Analytiques
   - [ ] Enter THC %, CBD %
   - [ ] Upload PDF or fill manually
   - [ ] Click "Suivant"

5. Section 5: Visuel Technique
   - [ ] Adjust color wheel (visual)
   - [ ] Set all sliders (couleur, densité, trichomes, etc.)
   - [ ] Preview weed color change
   - [ ] Click "Suivant"

6. Sections 6-9: Quick fill
   - [ ] Section 6 (Odeurs): Choose aromas
   - [ ] Section 7 (Goûts): Set taste notes  
   - [ ] Section 8 (Texture): Sliders
   - [ ] Section 9 (Effets): Effects checkboxes
   - [ ] All save to localStorage/state

7. Final: Export
   - [ ] Preview shows correctly
   - [ ] Select template (Compact/Détaillé/Complète)
   - [ ] Export to PNG/PDF works
   - [ ] Check file downloaded
```

---

## 📋 VALIDATION CHECKLIST

### Build & Setup
- [ ] No import errors (all fixed ✅)
- [ ] Vite alias @ configured ✅
- [ ] No console errors on page load
- [ ] All components render without crashes

### Permissions
- [ ] 3 account types testable
- [ ] Section visibility correct per type
- [ ] Button states correct (disabled/enabled)
- [ ] Error messages in French
- [ ] UpgradeModal appears on lock click

### Features
- [ ] Can create flower reviews (all sections)
- [ ] Can save draft (localStorage)
- [ ] Can edit existing review
- [ ] Can delete review
- [ ] Can export to PNG/PDF
- [ ] (Producteur only) Can create PhenoHunt tree
- [ ] (Producteur only) Can export to JSON/CSV

### Data
- [ ] Photos upload to /db/review_images/
- [ ] Form data saves to database
- [ ] Genetics tree data persists
- [ ] Export includes all sections filled

### UI/UX
- [ ] Pages load smoothly (no flashing)
- [ ] Forms responsive (mobile OK)
- [ ] Tooltips show helpful text
- [ ] Toast messages appear on action
- [ ] Loading spinners show during API calls
- [ ] Dark mode toggle works

---

## 🚨 KNOWN ISSUES TO MONITOR

1. **Node.js not in PATH on this PC**
   - Workaround: Use read/edit file tools for validation
   - Fix: Install Node.js or use WSL

2. **No way to run dev server locally without Node**
   - Temporary: Validate code changes via grep/read
   - Final: Will need Node for full testing

3. **React Flow library version**
   - Check if compatible with current setup
   - May need package.json update if issues arise

---

## 📞 SUPPORT QUICK LINKS

- **Permission System Docs**: `server-new/docs/PERMISSION_SYSTEM_EXAMPLES.md`
- **Genetics Store**: `client/src/store/useGeneticsStore.js` (518 lines)
- **Validation Checklist**: `VALIDATION_V1_MVP_FLEURS.md`
- **Architecture Guide**: `CAHIER_DES_CHARGES_V1_MVP_FLEURS.md`

---

## 🎯 SUCCESS CRITERIA

All of the following must be ✅ for Sprint 1+2 completion:

- ✅ All imports fixed (DONE)
- ✅ Vite alias configured (DONE)  
- [ ] Permissions validated end-to-end
- [ ] 3 account types work correctly
- [ ] PhenoHunt canvas functional
- [ ] All sections 1-10 create correctly
- [ ] Export generates files
- [ ] No console errors
- [ ] Database persistence works

**Target**: 4-6 hours to complete all above  
**Go-live**: Can deploy V1 MVP to VPS after this

