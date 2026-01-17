# Sprint 2: Quick Implementation Checklist
**Status:** Ready to implement once Node.js available  
**Estimated Time:** 3-5 hours total  
**Priority:** CRITICAL → HIGH → MEDIUM

---

## 🔴 CRITICAL FIXES (45 minutes)

### [C1] Add Producer Permission Middleware
**File:** `/server-new/routes/genetics.js`  
**Lines:** 40, 60, 90, 120, 150, 180, 220, 250, 280, 310, 340, 370, 400  
**Change:** Add `requireProducerOrBeta` to middleware chain  
**Test:** `npm test -- --grep "permission"`  
**✓ Action:**
```bash
# In genetics.js, change line 40 from:
router.get("/trees", requireAuth, async (req, res) => {
# To:
router.get("/trees", requireAuth, requireProducerOrBeta, async (req, res) => {
# Apply to ALL routes
```

### [C2] Add Frontend Permission Checks
**File:** `/client/src/components/genetics/UnifiedGeneticsCanvas.jsx`  
**Lines:** 1-50  
**Change:** Check permission before rendering edit UI  
**Test:** Manual verification that Consumer sees upgrade modal  
**✓ Action:**
```bash
# Add at top of component:
const { isProducer } = usePermissions();
if (!isProducer) return <FeatureUpgradeModal feature="phenohunt" />;
```

### [C3] Prevent Self-Edges
**File:** `/server-new/routes/genetics.js`  
**Lines:** 300-310  
**Change:** Add validation check  
**Test:** `npm test -- --grep "self-edge"`  
**✓ Action:**
```bash
# Add validation:
if (parentNodeId === childNodeId) {
    return res.status(400).json({ error: "Self-edges not allowed" });
}
```

---

## 🟠 HIGH PRIORITY FIXES (1 hour)

### [H1] Validate Cultivar Exists
**File:** `/server-new/routes/genetics.js`  
**Lines:** 150-180  
**Change:** Query cultivars table before create  
**Test:** `npm test -- --grep "cultivar"`  
**✓ Action:**
```bash
# Add before node creation:
if (cultivarId) {
    const cultivar = await prisma.cultivar.findUnique({ where: { id: cultivarId } });
    if (!cultivar) return res.status(400).json({ error: "Cultivar not found" });
}
```

### [H2] Validate Relationship Type
**File:** `/server-new/prisma/schema.prisma`  
**Lines:** GeneticEdge model  
**Change:** Add RelationshipType enum  
**Test:** `npx prisma migrate dev`  
**✓ Action:**
```bash
# Add enum to schema.prisma:
enum RelationshipType {
    PARENT_CHILD
    SIBLING
    CROSS
}
# Update model: relationshipType RelationshipType
# Run: npx prisma migrate dev --name add_relationship_type_enum
```

### [H3] Update genetics.js for Enum
**File:** `/server-new/routes/genetics.js`  
**Lines:** 300-310  
**Change:** Validate enum values  
**Test:** `npm test -- --grep "relationship"`  
**✓ Action:**
```bash
# Add validation:
const validTypes = ['PARENT_CHILD', 'SIBLING', 'CROSS'];
if (!validTypes.includes(relationshipType)) {
    return res.status(400).json({ error: "Invalid relationship type" });
}
```

---

## 🟡 MEDIUM PRIORITY FIXES (45 minutes)

### [M1] Add Rollback Logic for Position Updates
**File:** `/client/src/components/genetics/UnifiedGeneticsCanvas.jsx`  
**Lines:** 115-130  
**Change:** Store original position, rollback on error  
**Test:** Manual UAT - drag node, turn off network, verify rollback  
**✓ Action:**
```bash
# Wrap position update in try-catch with rollback:
const originalPosition = node.position;
try {
    await store.updateNodePosition(...);
} catch (error) {
    setNodes(prev => prev.map(n => 
        n.id === node.id ? {...n, position: originalPosition} : n
    ));
}
```

### [M2] Prevent Duplicate Edges
**File:** `/server-new/routes/genetics.js`  
**Lines:** 280-290  
**Change:** Check existing edge before create  
**Test:** `npm test -- --grep "duplicate"`  
**✓ Action:**
```bash
# Add before edge creation:
const existing = await prisma.geneticEdge.findFirst({
    where: { treeId, parentNodeId, childNodeId }
});
if (existing) return res.status(400).json({ error: "Edge exists" });
```

### [M3] Robust JSON Parsing
**File:** `/client/src/store/useGeneticsStore.js`  
**Lines:** 85  
**Change:** Add try-catch around JSON.parse  
**Test:** Manual verification that malformed JSON doesn't crash  
**✓ Action:**
```bash
# Wrap JSON.parse in try-catch:
try {
    return typeof pos === 'string' ? JSON.parse(pos) : pos;
} catch { return { x: 0, y: 0 }; }
```

---

## 📋 IMPLEMENTATION ORDER

### Phase 1: Backend Infrastructure (20 min)
1. [ ] [C1] Add permission middleware (15 min)
2. [ ] [C3] Add self-edge validation (5 min)
3. **Test:** `npm test -- genetics`

### Phase 2: Database Schema (10 min)
1. [ ] [H2] Add RelationshipType enum to Prisma
2. [ ] Run migration: `npx prisma migrate dev`
3. **Test:** `npx prisma db validate`

### Phase 3: Backend Validation (15 min)
1. [ ] [H1] Add cultivar validation (8 min)
2. [ ] [H3] Update genetics.js for enum (7 min)
3. [ ] [M2] Add duplicate edge prevention (5 min)
4. **Test:** `npm test -- genetics` (should pass)

### Phase 4: Frontend Fixes (15 min)
1. [ ] [C2] Add permission checks to canvas (8 min)
2. [ ] [M1] Add rollback logic (5 min)
3. [ ] [M3] Robust JSON parsing (2 min)
4. **Test:** Manual UAT of canvas

### Phase 5: Full Validation (30 min)
1. [ ] Run full test suite: `npm test`
2. [ ] Manual UAT: Create → Add → Connect → Export
3. [ ] Test permission enforcement
4. [ ] Verify all error messages

---

## 🧪 TESTING AFTER EACH PHASE

**After Phase 1:**
```bash
npm test -- --grep "permission|self-edge"
```

**After Phase 2:**
```bash
npx prisma db validate
npm run prisma:migrate  # if not auto
```

**After Phase 3:**
```bash
npm test -- --grep "genetics"
```

**After Phase 4:**
```bash
npm run dev  # Start both client & server
# Test manually: create tree, add node, drag to new position
```

**After Phase 5:**
```bash
npm test  # Full suite
npm run build  # Build check
```

---

## 🚀 QUICK START COMMANDS

```bash
# Clone latest
git pull origin develop

# Create feature branch
git checkout -b fix/sprint2-critical-issues

# Install deps if needed
cd server-new && npm install
cd ../client && npm install

# Start development
cd server-new && npm run dev &  # Terminal 1
cd client && npm run dev &      # Terminal 2

# Run tests (in server-new)
npm test                        # All tests
npm test -- genetics           # Only genetics tests
npm test -- --grep "permission" # Only permission tests

# After fixes - commit
git add .
git commit -m "fix(sprint2): Add permission checks and validation

- Add requireProducerOrBeta middleware to genetics endpoints
- Add self-edge validation in edge creation
- Add cultivar existence validation
- Add RelationshipType enum to prevent invalid types
- Add rollback logic for position updates
- Add duplicate edge prevention
- Add robust JSON parsing

Fixes 8 issues (3 critical, 3 high, 2 medium)
Tests: All genetics tests passing"

# Push and create PR
git push origin fix/sprint2-critical-issues
# Create PR in GitHub

# Merge when approved
git checkout develop
git pull
git merge --no-ff fix/sprint2-critical-issues
git push origin develop
```

---

## ✅ COMPLETION CHECKLIST

### Before Starting
- [ ] Node.js installed and running
- [ ] Latest code pulled from Git
- [ ] npm dependencies installed
- [ ] Feature branch created

### CRITICAL Fixes
- [ ] [C1] Permission middleware added to all genetics routes
- [ ] [C2] Frontend permission checks implemented
- [ ] [C3] Self-edge validation added
- [ ] Tests passing for permissions and validation

### HIGH Fixes
- [ ] [H1] Cultivar validation implemented
- [ ] [H2] RelationshipType enum added to Prisma
- [ ] [H3] Enum validation in genetics.js
- [ ] Database migration successful

### MEDIUM Fixes
- [ ] [M1] Position update rollback implemented
- [ ] [M2] Duplicate edge prevention added
- [ ] [M3] Robust JSON parsing implemented

### Testing
- [ ] All unit tests passing (genetics)
- [ ] All integration tests passing
- [ ] Manual UAT complete
- [ ] Permission enforcement verified
- [ ] Error messages clear and helpful

### Deployment
- [ ] Code review completed
- [ ] Merge conflict resolved (if any)
- [ ] PR approved
- [ ] Merged to develop/main
- [ ] Pipeline checks passing
- [ ] Deployment to staging complete

---

## 📊 ESTIMATED TIMELINE

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Backend infrastructure | 20 min | ⏳ Ready |
| 2 | Database schema | 10 min | ⏳ Ready |
| 3 | Backend validation | 15 min | ⏳ Ready |
| 4 | Frontend fixes | 15 min | ⏳ Ready |
| 5 | Full validation | 30 min | ⏳ Ready |
| **TOTAL** | **All fixes** | **90 min** | **⏳ Ready** |

**Plus testing & UAT:** 1-2 hours  
**Total time to production:** 3-4 hours

---

## 🆘 TROUBLESHOOTING

### If Prisma migration fails:
```bash
npx prisma migrate resolve --rolled-back "timestamp"
npx prisma migrate dev
```

### If tests fail:
```bash
npm test -- --verbose    # See detailed output
npm test -- --no-coverage # Skip coverage
npm run test:debug       # Debug mode
```

### If permission checks cause issues:
```bash
# Check middleware order in express app
# requireAuth must come BEFORE requireProducerOrBeta
# Order: [route] → requireAuth → requireProducerOrBeta → handler
```

### If frontend won't build:
```bash
npm run build:check
npm run lint:fix  # Fix linting issues
npm cache clean --force
npm install
npm run dev
```

---

**Good luck! 🚀**  
**Expected completion:** 3-4 hours once Node.js available  
**Questions?** Check `SPRINT2_CRITICAL_FIXES_GUIDE.md` for detailed explanations

