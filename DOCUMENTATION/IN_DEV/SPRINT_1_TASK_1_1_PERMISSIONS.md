# SPRINT 1 - Task 1.1: Backend Permission Enforcement

**Status**: ⚡ In Development  
**Timeline**: Week 1 (Jan 20-24, 2026)  
**Owner**: Senior Backend Developer  
**Blocker Level**: 🔴 CRITICAL

---

## Overview

Implement backend permission enforcement middleware to enforce feature/section/export access control across all API routes. This is the **highest priority task** as it gates all other features and ensures business logic is correct before frontend.

**Key Constraint**: Must be deployed **before** any feature access from frontend is tested.

---

## Deliverables

### 1. Permission Middleware (`server-new/middleware/permissions.js`)
**Status**: ✅ EXISTS - Ready to use  
**What's Done**:
- ✅ Account type definitions (consumer/influencer/producer)
- ✅ Feature access matrix (60 features defined)
- ✅ Helper functions: `canAccessSection()`, `canUseTemplate()`, `canExportFormat()`
- ✅ Middleware functions: `requireAuth()`, `requireAccountType()`, `requireFeature()`
- ✅ Subscription validation: `isSubscriptionActive()`, `requireActiveSubscription()`

**What's Needed**:
- [ ] Integrate into all flower-reviews routes
- [ ] Integrate into export routes
- [ ] Integrate into library routes
- [ ] Integration tests

### 2. API Routes with Permission Guards
**Status**: 🟡 Partial  
**What's Done**:
- ✅ Routes exist in `server-new/routes/flower-reviews.js`
- ✅ Basic auth middleware in place

**What's Needed**:
```javascript
// Example: GET /api/flower-reviews/:id
router.get('/:id', 
  requireAuth,                              // Must be logged in
  asyncHandler(async (req, res) => {
    const review = await prisma.flowerReview.findUnique(...)
    res.json(review)
  })
)

// Example: POST /api/export/pdf (requires export.pdf permission)
router.post('/export/pdf',
  requireAuth,                              // Must be logged in
  requireFeature('export.pdf'),             // Must have permission
  requireActiveSubscription,                // Must have active sub (if influencer/producer)
  asyncHandler(async (req, res) => {
    // Export logic...
    res.json({ url: '/exports/file.pdf' })
  })
)

// Example: GET /api/phenohunt (producer only)
router.get('/genetics/phenohunt',
  requireAuth,
  requirePhenoHunt,                         // Producer-only feature
  asyncHandler(async (req, res) => {
    // PhenoHunt logic...
  })
)
```

**Required Integration Points**:
1. **Flower Reviews Routes** (`routes/flower-reviews.js`)
   - GET `/api/flower-reviews` → requireAuth only
   - GET `/api/flower-reviews/:id` → requireAuth only
   - POST `/api/flower-reviews` → requireAuth + requireSectionAccess('info')
   - PUT `/api/flower-reviews/:id/genetic` → requireAuth + requireSectionAccess('genetic') + requirePhenoHunt
   - PUT `/api/flower-reviews/:id/pipeline-culture` → requireAuth + requireSectionAccess('pipeline_culture')
   - Total: 8+ routes

2. **Export Routes** (`routes/export.js`)
   - POST `/api/export/{format}` → requireAuth + requireExportFormat(format) + requireActiveSubscription
   - GET `/api/export/templates` → requireAuth + requireTemplateAccess
   - POST `/api/export/preview` → requireAuth
   - Total: 4+ routes

3. **Library Routes** (`routes/library.js`)
   - GET `/api/library/reviews` → requireAuth
   - POST `/api/library/presets` → requireAuth + requireFeature('presets.custom')
   - PUT `/api/library/cultivars` → requireAuth + requirePhenoHunt
   - Total: 5+ routes

4. **Genetics Routes** (`routes/genetics.js`)
   - POST `/api/genetics/phenohunt` → requireAuth + requirePhenoHunt
   - GET `/api/genetics/cultivars` → requireAuth + requirePhenoHunt
   - Total: 3+ routes

### 3. Test Suite
**Status**: ✅ TEMPLATE CREATED  
**File**: `server-new/tests/permissions.test.js`  
**Coverage**: 60 permission test cases

**Tests Include**:
- [ ] Consumer access matrix (12 allowed, 8 restricted)
- [ ] Influencer access matrix (18 allowed, 2 restricted)
- [ ] Producer access matrix (20 allowed, 0 restricted)
- [ ] Middleware: `requireAccountType()`
- [ ] Middleware: `requireFeature()`
- [ ] Middleware: `requireExportFormat()`
- [ ] Subscription validation
- [ ] Error responses
- [ ] Feature combinations

**Run Tests**:
```bash
cd server-new
npm run test permissions.test.js
```

**Success Criteria**: All 60 tests passing ✅

### 4. Documentation
**Status**: ✅ Complete  
**Files**:
- `VALIDATION_V1_MVP_FLEURS.md` - Permission matrix (Part 1)
- `PLAN_EXECUTION_V1_MVP.md` - Sprint 1 tasks (T1.1-T1.4)
- `CAHIER_DES_CHARGES_V1_MVP_FLEURS.md` - Feature specifications

---

## Implementation Steps

### Step 1: Verify Middleware (1 hour)
```bash
# Review permission definitions
cat server-new/middleware/permissions.js

# Check account type definitions
grep -A 20 "ACCOUNT_TYPES =" server-new/middleware/permissions.js

# Review helper functions
grep -E "export const (canAccess|hasFeature|isSubscription)" server-new/middleware/permissions.js
```

**Validation**:
- [ ] All 3 account types defined
- [ ] All 60 features in matrix
- [ ] Helper functions exported
- [ ] Middleware functions exported

### Step 2: Integrate into Routes (3-4 hours)

#### 2a. Flower Reviews Routes
```javascript
// server-new/routes/flower-reviews.js - Add at top
import { 
  requireAuth, 
  requireFeature, 
  requireSectionAccess, 
  requirePhenoHunt,
  requireActiveSubscription 
} from '../middleware/permissions.js'

// Update routes:
router.post('/', 
  requireAuth,
  requireSectionAccess('info'),
  // ... existing logic
)

router.put('/:id/genetic', 
  requireAuth,
  requireSectionAccess('genetic'),
  requirePhenoHunt,           // NEW: Producer only
  requireActiveSubscription,  // NEW: Check subscription
  // ... existing logic
)

router.put('/:id/pipeline-culture',
  requireAuth,
  requireSectionAccess('pipeline_culture'),
  requireActiveSubscription,  // NEW: Check subscription
  // ... existing logic
)
```

#### 2b. Export Routes
```javascript
// server-new/routes/export.js - Update
import { requireExportFormat, requireTemplateAccess, requireActiveSubscription } from '../middleware/permissions.js'

router.post('/pdf',
  requireAuth,
  requireExportFormat('pdf'),        // NEW
  requireActiveSubscription,         // NEW
  // ... existing logic
)

router.post('/csv',
  requireAuth,
  requireExportFormat('csv'),        // NEW: Will block consumer/influencer
  requireActiveSubscription,         // NEW
  // ... existing logic
)

router.post('/custom',
  requireAuth,
  requireTemplateAccess('custom'),   // NEW: Producer only
  requireActiveSubscription,         // NEW
  // ... existing logic
)
```

#### 2c. Library Routes
```javascript
// server-new/routes/library.js - Update
import { requireFeature, requirePhenoHunt, requireActiveSubscription } from '../middleware/permissions.js'

router.post('/presets',
  requireAuth,
  requireFeature('presets.custom'),  // NEW: Influencer+
  // ... existing logic
)

router.put('/cultivars',
  requireAuth,
  requirePhenoHunt,                  // NEW: Producer only
  requireActiveSubscription,         // NEW
  // ... existing logic
)
```

### Step 3: Run Tests (30 min)
```bash
cd server-new
npm run test permissions.test.js

# Expected output:
# ✓ 60 tests passed
# ✓ 0 failures
# ✓ 100% coverage
```

### Step 4: Manual Validation (1 hour)
```bash
# 1. Test as consumer
curl -H "Authorization: Bearer consumer-token" \
  http://localhost:3000/api/export/csv
# Expected: 403 Forbidden

# 2. Test as influencer
curl -H "Authorization: Bearer influencer-token" \
  http://localhost:3000/api/export/pdf
# Expected: 200 OK

# 3. Test as producer
curl -H "Authorization: Bearer producer-token" \
  http://localhost:3000/api/export/csv
# Expected: 200 OK

# 4. Test subscription check
curl -H "Authorization: Bearer expired-influencer-token" \
  http://localhost:3000/api/export/pdf
# Expected: 403 Subscription expired
```

---

## Validation Checklist (From VALIDATION_V1_MVP_FLEURS.md)

### Permission Tests (60 total)
- [ ] Consumer: 12/12 allowed features passing
- [ ] Influencer: 18/20 allowed features passing
- [ ] Producer: 20/20 allowed features passing

### Error Handling
- [ ] Unauthenticated → 401 Unauthorized
- [ ] Wrong account type → 403 Forbidden (with required type)
- [ ] Inactive subscription → 403 Subscription required (with upgrade URL)
- [ ] Feature disabled → 403 with upgrade suggestion
- [ ] All errors include helpful upgrade links

### Integration Tests
- [ ] Consumer cannot POST to genetic section (403)
- [ ] Consumer cannot GET PhenoHunt (403)
- [ ] Influencer cannot export CSV (403)
- [ ] Influencer cannot use custom template (403)
- [ ] Producer can access all features (200)
- [ ] Expired subscription blocks paid features (403)

### Database Checks
- [ ] User.accountType enum: consumer, influencer, producer
- [ ] User.subscriptionStatus: active, cancelled, expired, inactive
- [ ] User.subscriptionExpiresAt datetime check works

---

## Success Criteria

### Code Quality ✅
- [ ] No hardcoded permission checks in routes
- [ ] All access control via middleware
- [ ] Consistent error responses
- [ ] Clear, descriptive error messages
- [ ] Audit logging (log all denials)

### Testing ✅
- [ ] 60/60 permission tests passing
- [ ] 100% middleware coverage
- [ ] All routes tested with wrong account type
- [ ] Subscription expiry tested
- [ ] Error responses tested

### Performance ✅
- [ ] Middleware < 5ms per request
- [ ] No N+1 queries for permission checks
- [ ] Subscription cache if needed

### Security ✅
- [ ] No permission bypass possible
- [ ] Frontend cannot override server permissions
- [ ] Tokens cannot be forged
- [ ] Subscription status verified server-side

---

## Risk Mitigation

### Risk: Middleware not applied everywhere
**Mitigation**: Automated check
```bash
# Before committing, verify all routes have permissions
grep -r "router\.(get|post|put|delete)" server-new/routes/*.js | \
  grep -v requireAuth | \
  wc -l
# Should be 0 (all routes protected)
```

### Risk: Permission matrix not matching frontend
**Mitigation**: Single source of truth
```javascript
// Export ACCOUNT_TYPES as API endpoint
router.get('/api/permissions/account-types', (req, res) => {
  res.json(getAllAccountTypes())
})

// Frontend fetches this and validates
```

### Risk: Subscription check fails for edge cases
**Mitigation**: Add grace period
```javascript
const SUBSCRIPTION_GRACE_PERIOD = 24 * 60 * 60 * 1000 // 1 day
export const isSubscriptionActive = (user) => {
  const now = new Date()
  const expiry = new Date(user.subscriptionExpiresAt)
  return user.subscriptionStatus === 'active' && 
         (now < expiry + SUBSCRIPTION_GRACE_PERIOD)
}
```

---

## Timeline

| Step | Duration | Cumulative |
|------|----------|-----------|
| 1. Verify middleware | 1h | 1h |
| 2. Integrate routes | 3h | 4h |
| 3. Run tests | 0.5h | 4.5h |
| 4. Manual validation | 1h | 5.5h |
| 5. Code review | 1.5h | 7h |
| **TOTAL** | | **7 hours** |

---

## Dependencies

- ✅ Prisma schema (User.accountType + subscriptionStatus)
- ✅ Authentication system (req.user available)
- ✅ Middleware system (Express middleware)
- ⏳ Database seeded with test users (consumer/influencer/producer)
- ⏳ Frontend permission checks (Part 1.2)

---

## What Happens Next (Part 1.2)

Once backend permissions are locked:

**Part 1.2 - Frontend Permission Guards** (Days 3-5):
- Hide restricted UI elements for each account type
- Add "Upgrade Required" modals
- Update feature help text with account requirements
- Test frontend + backend together

**Part 1.3 - Permission Integration Tests** (Day 5):
- E2E tests: Consumer → blocked, Influencer → partial, Producer → all
- API contract tests
- Permission matrix validation

**Part 1.4 - Permissions Documentation** (Day 5):
- Developer guide for adding new features
- Permission decision tree
- Troubleshooting guide

---

## Related Files

- `VALIDATION_V1_MVP_FLEURS.md` Part 1: Complete permission matrix
- `PLAN_EXECUTION_V1_MVP.md` Sprint 1: All T1.x tasks
- `DASHBOARD_V1_MVP_STATUS.md` Risks & mitigations
- `server-new/middleware/permissions.js` Implementation
- `server-new/tests/permissions.test.js` Test cases

---

## Author Notes

This is the **most critical task** for V1 MVP because:

1. **Business Logic**: Monetization depends on permission enforcement
2. **Security**: Prevents unauthorized feature access
3. **Upstream**: All other sprints depend on solid permissions
4. **Testing**: Must be locked before frontend dev

🔴 **DO NOT** start frontend permission work until backend tests pass 100%.

**Sign-off Required**: Senior dev + QA both approve before moving to 1.2

---

**Status**: Ready to start Jan 20, 2026 ✅  
**Estimate**: 7 hours (1 developer)  
**Blocker**: None - all dependencies available
