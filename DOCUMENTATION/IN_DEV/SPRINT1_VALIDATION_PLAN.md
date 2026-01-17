# Sprint 1 Validation Plan - Permission System
**Date:** 2025-01-16  
**Objective:** Validate 3-tier permission system (Consumer/Influencer/Producer) is correctly enforced across frontend and backend  
**Status:** In Progress

---

## 1. Test Matrix Overview

### Account Types
| Type | Price | Duration | Capabilities |
|------|-------|----------|---|
| **Consumer (Amateur)** | Free | Unlimited | Basic sections + exports (PNG/JPG/PDF) |
| **Influencer** | 15.99€/month | Active subscription | Advanced exports (SVG/GIF) + stats |
| **Producer** | 29.99€/month | Active subscription | All features + genetics + pipelines |
| **Beta Tester** | Unlimited | Special | All features no restrictions |

### Feature Access Matrix

#### Sections (Review Creation)
```
Section                 Consumer  Influencer  Producer
─────────────────────────────────────────────────────
Info General              ✅         ✅         ✅
Visuel & Technique        ✅         ✅         ✅
Genetiques              ❌ (→UP)   ❌ (→UP)   ✅
Aromas                    ✅         ✅         ✅
Taste                     ✅         ✅         ✅
Texture                 ❌ (→UP)   ❌ (→UP)   ✅
Effects                   ✅         ✅         ✅
Pipeline Curing           ✅         ✅         ✅
Pipeline Culture        ❌ (→UP)   ❌ (→UP)   ✅
```

#### Export Formats
```
Format    Consumer  Influencer  Producer  Beta-Tester
──────────────────────────────────────────────────────
PNG         ✅         ✅         ✅         ✅
JPG         ✅         ✅         ✅         ✅
PDF         ✅         ✅         ✅         ✅
SVG       ❌ (→UP)    ✅         ✅         ✅
CSV       ❌ (→UP)   ❌ (→UP)    ✅         ✅
JSON      ❌ (→UP)   ❌ (→UP)    ✅         ✅
HTML      ❌ (→UP)   ❌ (→UP)    ✅         ✅
GIF       ❌ (→UP)    ✅         ✅         ✅
```

#### Templates
```
Template    Consumer  Influencer  Producer  Notes
─────────────────────────────────────────────────────
Compact        ✅         ✅         ✅    
Detailed       ✅         ✅         ✅    
Complete       ✅         ✅         ✅    
Influencer   ❌ (→UP)    ✅         ✅    Draft mode only
Custom       ❌ (→UP)   ❌ (→UP)    ✅    Drag & drop
```

#### Features
```
Feature                 Consumer  Influencer  Producer
──────────────────────────────────────────────────────
PhenoHunt Genetics      ❌         ❌         ✅
Custom Presets          ❌         ✅         ✅
Batch Export            ❌         ❌         ✅
Advanced Customization  ❌         ✅         ✅
Watermarks              ❌         ✅         ✅
```

---

## 2. Frontend Validation Tests

### Test 2.1: Section Visibility by Account Type

**Setup:**
- User account type: CONSUMER
- Navigate to review creation

**Expected Results:**
```javascript
// Sections visible
✅ Information Generale
✅ Visuel & Technique
✅ Odeurs
✅ Goûts
✅ Effets
✅ Pipeline CURING

// Sections hidden (show "Upgrade Required")
❌ Genetiques → FeatureUpgradeModal shown
❌ Texture → FeatureUpgradeModal shown
❌ Pipeline CULTURE → FeatureUpgradeModal shown
```

**Test Code (Expected):**
```javascript
import { render } from '@testing-library/react'
import CreateFlowerReview from './CreateFlowerReview'
import { useUserStore } from '@/store/user'

// Mock consumer user
jest.mock('@/store/user', () => ({
    useUserStore: jest.fn(() => ({
        user: { accountType: 'consumer' }
    }))
}))

test('Consumer sees limited sections', () => {
    const { getByText, queryByText } = render(<CreateFlowerReview />)
    
    expect(getByText('Information Generale')).toBeVisible()
    expect(queryByText('Genetiques')).toBeInTheDocument()
    expect(queryByText('Genetiques')).toHaveClass('opacity-50') // Disabled
})
```

### Test 2.2: Export Format Visibility

**Setup:**
- User account type: CONSUMER
- Open export menu

**Expected Results:**
```
✅ PNG - Enabled
✅ JPG - Enabled
✅ PDF - Enabled
❌ SVG - Disabled (dark, "Upgrade to Influencer+")
❌ CSV - Disabled (dark, "Upgrade to Producer")
❌ JSON - Disabled (dark, "Upgrade to Producer")
❌ HTML - Disabled (dark, "Upgrade to Producer")
```

### Test 2.3: Template Selection

**Setup:**
- User account type: CONSUMER
- Open Export Maker

**Expected Results:**
```
✅ Compact - Selectable
✅ Detailed - Selectable
✅ Complete - Selectable
❌ Influencer Mode - Grayed out (shows modal on click)
❌ Personnalisé (Custom) - Hidden/Grayed out
```

### Test 2.4: Button States

**Setup:**
- User account type: CONSUMER
- On export page

**Expected Results:**
```
✅ "Export PNG" button - Enabled (blue)
✅ "Export PDF" button - Enabled (blue)
❌ "Export CSV" button - Disabled (gray)
   Hover shows: "CSV export requires Producer account"
❌ "Export JSON" button - Disabled (gray)
   Hover shows: "CSV export requires Producer account"
```

### Test 2.5: FeatureUpgradeModal Triggers

**Setup:**
- User account type: CONSUMER
- Try to access Producer features

**Expected Results:**
- Modal appears with title: "Upgrade Required"
- Shows feature name: "Genetics Canvas"
- Shows benefit: "Available in Producteur plan"
- Shows two buttons:
  - "See Plans" → Navigates to /pricing
  - "Cancel" → Closes modal

---

## 3. Backend Validation Tests

### Test 3.1: Create Review (Permission Check)

**Setup:**
- User account type: CONSUMER
- Prepare flower review payload

**Test Endpoint:** `POST /api/flower-reviews`

**Expected Results:**
```javascript
// CONSUMER request
POST /api/flower-reviews
Headers: { authorization: 'Bearer consumer_token' }
Body: {
    productName: "Test Flower",
    cultivar: "OG Kush",
    visualData: { color: 8, density: 7 },
    aromadata: { intensity: 8, notes: ['pine', 'earth'] },
    // ... other fields
}

Response (200 OK):
{
    success: true,
    review: {
        id: "review_123",
        authorId: "user_consumer",
        productName: "Test Flower",
        // ... data
    }
}
```

### Test 3.2: Export Format Access Control

**Endpoint:** `POST /api/export/csv`

**Test Case 3.2a: CONSUMER user**
```javascript
POST /api/export/csv
Headers: { authorization: 'Bearer consumer_token' }
Body: { reviewId: "review_123", templateName: "detailed" }

Response (403 FORBIDDEN):
{
    success: false,
    error: "EXPORT_FORMAT_NOT_ALLOWED",
    message: "CSV export requires Producer account",
    requiredTier: "producer"
}
```

**Test Case 3.2b: PRODUCER user**
```javascript
POST /api/export/csv
Headers: { authorization: 'Bearer producer_token' }
Body: { reviewId: "review_123", templateName: "detailed" }

Response (200 OK):
{
    success: true,
    file: { ... },
    filename: "review_123.csv"
}
```

### Test 3.3: Section-Specific Access (Genetics)

**Endpoint:** `POST /api/genetics/trees` (Create genetics tree)

**Test Case 3.3a: CONSUMER user**
```javascript
POST /api/genetics/trees
Headers: { authorization: 'Bearer consumer_token' }
Body: { 
    reviewId: "review_123",
    cultivarIds: ["cult_1", "cult_2"]
}

Response (403 FORBIDDEN):
{
    success: false,
    error: "FEATURE_NOT_AVAILABLE",
    message: "Genetics management is only available to Producer accounts",
    requiredTier: "producer"
}
```

**Test Case 3.3b: PRODUCER user**
```javascript
POST /api/genetics/trees
Headers: { authorization: 'Bearer producer_token' }

Response (201 CREATED):
{
    success: true,
    tree: { id: "tree_123", ... }
}
```

### Test 3.4: Subscription Status Check

**Endpoint:** Any Producer-only endpoint

**Setup:**
- User account type: PRODUCER
- Subscription: EXPIRED (last payment failed)

**Expected Results:**
```javascript
Response (402 PAYMENT_REQUIRED):
{
    success: false,
    error: "SUBSCRIPTION_INACTIVE",
    message: "Your Producer subscription has expired",
    renewUrl: "/billing/renew"
}
```

---

## 4. Integration Tests

### Test 4.1: Complete Consumer Workflow

**Steps:**
1. Login as CONSUMER user
2. Create flower review with:
   - Information Generale
   - Visuel & Technique
   - Odeurs (max 7 notes)
   - Goûts (intensity 1-10)
   - Effets (select 8 max)
   - Pipeline CURING (basic settings)
3. Attempt to add Genetiques section
4. Try to export as CSV
5. See FeatureUpgradeModal

**Expected Outcomes:**
```
✅ Review created successfully with 6 sections
✅ Genetiques section shows "Upgrade Required"
✅ CSV export button disabled with tooltip
✅ FeatureUpgradeModal appears on button hover
✅ Modal has "See Plans" link
✅ Logout and login as PRODUCER
✅ Both features now available
```

### Test 4.2: Feature Access After Upgrade

**Steps:**
1. Login as CONSUMER
2. Verify Genetiques is locked
3. Admin: Change account type to PRODUCER
4. User: Refresh page
5. Verify Genetiques section now visible
6. Create genetics tree

**Expected Outcomes:**
```
✅ Frontend permissions update after refresh
✅ Backend allows /api/genetics endpoints
✅ Genetics tree created successfully
```

---

## 5. Validation Checklist

### Frontend Checklist (✅ = Pass)
- [ ] Consumer: 6 sections visible, 3 sections hidden with upgrade prompt
- [ ] Consumer: 3 export formats enabled (PNG/JPG/PDF), 5 disabled
- [ ] Consumer: 3 templates enabled, 2 disabled
- [ ] Influencer: 8+ export formats enabled including SVG/GIF
- [ ] Producer: All sections visible and enabled
- [ ] Producer: All export formats enabled
- [ ] Producer: Custom template mode available
- [ ] FeatureUpgradeModal shows correct tier requirement
- [ ] Buttons correctly disabled/enabled based on account type
- [ ] Keyboard navigation works on upgrade modals
- [ ] Mobile: All elements responsive and accessible

### Backend Checklist (✅ = Pass)
- [ ] requireAuth middleware blocks unauthenticated requests
- [ ] requireExportFormat middleware blocks disallowed formats
- [ ] Producer sections (genetics) return 403 for non-producers
- [ ] Subscription status checked for paid features
- [ ] Error messages include requiredTier for upgrades
- [ ] Batch operations respect account limits
- [ ] Rate limiting applied to exports (daily limits)
- [ ] All 23+ protected endpoints properly gated
- [ ] Middleware order correct (auth → permissions → business logic)

### Database Checklist (✅ = Pass)
- [ ] Test users exist for all 3 account types
- [ ] Producer user has active subscription
- [ ] Influencer user has active subscription
- [ ] Consumer user has no subscription
- [ ] Seed data includes sample reviews for testing

---

## 6. Critical Issues Found & Fixed

### Issue 6.1: Missing FeatureUpgradeModal Import ✅ FIXED
**File:** `components/guards/SectionGuard.jsx`  
**Problem:** Tried to import from non-existent `./UpgradeModal`  
**Solution:** Changed to import from `usePermissions` hook where component actually exported

### Issue 6.2: Import Path Corrections ✅ FIXED
**Files:** 18 total (PipelineCore, forms, shared components, etc.)  
**Problem:** Component reorganization broke relative imports  
**Solution:** Corrected all ../ depths and added Vite @ alias

---

## 7. Test Execution Results

### Date: 2025-01-16

#### Manual Code Review ✅
- [x] Permission middleware exists: `server-new/middleware/permissions.js` (560 lines)
- [x] Export routes have permission checks: `server-new/routes/export.js` (365 lines)
- [x] Frontend permission hook complete: `client/src/hooks/usePermissions.jsx` (373 lines)
- [x] 18 import fixes applied and committed
- [x] Vite @ alias configured in `vite.config.js`

#### Remaining Tests
- [ ] Runtime: Create Consumer account and test section visibility
- [ ] Runtime: Create Producer account and test genetics access
- [ ] Runtime: Test export format restrictions
- [ ] Runtime: Test subscription expiry handling
- [ ] E2E: Complete flower review workflow

---

## 8. Status Summary

**Completed (This Session):**
- ✅ All import paths fixed (18 files)
- ✅ Vite configuration updated
- ✅ Backend permission middleware analyzed and verified
- ✅ Frontend permission system structure confirmed
- ✅ Import errors preventing compilation resolved

**In Progress (Next Steps):**
- 🔄 Runtime permission validation (needs Node.js/npm)
- 🔄 Create test accounts and verify UI behavior
- 🔄 Test export format restrictions
- 🔄 Test section accessibility guards

**Not Started:**
- ⬜ PhenoHunt integration tests
- ⬜ Pipeline system E2E tests
- ⬜ Export file generation tests

---

## 9. Notes for Continued Work

### Environment Setup Needed
```bash
cd server-new
npm install
npm run prisma:generate
npm run dev  # Start server

cd ../client
npm install
npm run dev  # Start frontend (Vite)
```

### Key Test Accounts to Create
```javascript
// .env.test or database seed
CONSUMER_TEST_USER = {
    email: "test-consumer@example.com",
    accountType: "consumer",
    subscription: null
}

INFLUENCER_TEST_USER = {
    email: "test-influencer@example.com",
    accountType: "influencer",
    subscription: { status: "active", tier: "influencer" }
}

PRODUCER_TEST_USER = {
    email: "test-producer@example.com",
    accountType: "producer",
    subscription: { status: "active", tier: "producer" }
}
```

### Backend Permission Middleware Chain
```javascript
// All protected routes follow this pattern:
router.post('/endpoint',
    requireAuth,           // Step 1: Verify user is logged in
    requireExportFormat,   // Step 2: Check if format allowed
    requireActiveSubscription, // Step 3: Check subscription (if paid feature)
    asyncHandler(async (req, res) => {
        // Step 4: Business logic
    })
)
```

### Frontend Permission Check Pattern
```javascript
const { canExport, hasSection, accountType } = usePermissions()

// In render:
{hasSection('genetics') ? (
    <GeneticsSection />
) : (
    <SectionGuard section="genetics" label="Genetics Canvas">
        <div>Upgrade to Producteur</div>
    </SectionGuard>
)}
```

---

**Next Session Goal:** Execute runtime tests on local dev environment once Node.js is installed.

