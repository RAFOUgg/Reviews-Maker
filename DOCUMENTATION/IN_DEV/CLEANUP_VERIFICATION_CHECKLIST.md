# 🧹 CODE CLEANUP & VERIFICATION CHECKLIST

**Date**: 17 janvier 2026  
**Priority**: Before final testing

---

## 📋 DEAD CODE TO REMOVE

### 1. FlowerExportModal.jsx - UNUSED (100 lines)
```
Location: client/src/components/export/FlowerExportModal.jsx
Status: Not imported anywhere
Action: SAFE TO DELETE
Reason: Functionality moved to ExportMaker.jsx + OrchardPanel
```

**Verification command:**
```bash
grep -r "FlowerExportModal" client/src --include="*.jsx"
# Should return ZERO matches (except in the file itself)
```

### 2. PreferencesPage.jsx - INTEGRATED (214 lines)
```
Location: client/src/pages/account/PreferencesPage.jsx
Status: Content migrated to AccountPage.jsx
Action: SAFE TO DELETE (after verification)
Reason: No longer imported in App.jsx, all functionality in AccountPage
```

**Verification command:**
```bash
grep -r "PreferencesPage" client/src --include="*.jsx"
# Should return ZERO matches (except in the file itself)
```

### 3. Old normalizeReviewData() function - DEPRECATED
```
Location: client/src/components/shared/orchard/OrchardPanel.jsx (lines ~20-196)
Status: Replaced by normalizeReviewDataByType()
Action: OPTIONAL - Remove when tidying up (not blocking)
Reason: Now using generic version from normalizeByType.js
Lines to remove: ~180 lines of duplicate code
```

---

## ✅ BUILD VERIFICATION STEPS

### Step 1: Verify No Import Errors
```bash
cd client
npm run build 2>&1 | grep -i "error\|could not resolve"
```

**Expected**: Zero resolution errors

### Step 2: Verify App.jsx Routes
**Check**:
- [ ] No SettingsPage import
- [ ] No ProfileSettingsPage import
- [ ] /profile-settings route removed
- [ ] All other routes reference existing files

**Command**:
```bash
grep "SettingsPage\|ProfileSettingsPage" client/src/App.jsx
# Should return ZERO matches
```

### Step 3: Verify AccountPage Changes
**Check**:
- [ ] AccountPage.jsx imports Framer Motion
- [ ] AccountPage.jsx imports UsageQuotas
- [ ] AccountPage.jsx has 6 tab definitions
- [ ] No syntax errors

**Command**:
```bash
npm run build --prefix client 2>&1 | head -100
```

### Step 4: Verify OrchardPanel Changes
**Check**:
- [ ] OrchardPanel imports normalizeReviewDataByType
- [ ] OrchardPanel has productType prop
- [ ] No reference to old normalizeReviewData function call
- [ ] ProductType is passed from CreateReviewFormWrapper

**Command**:
```bash
grep -A 5 "function OrchardPanel" client/src/components/shared/orchard/OrchardPanel.jsx
# Should show: productType = 'flower'
```

---

## 🧪 FUNCTIONAL TESTING CHECKLIST

### Account Page Tests
- [ ] Navigate to `/account` → Loads without errors
- [ ] Tab 1 (Profile) → Shows user info, language selector, action buttons
- [ ] Tab 2 (Preferences) → Shows 6 preference toggles
- [ ] Tab 3 (Saved Data) → Shows placeholder for substrates, nutrients, equipment
- [ ] Tab 4 (Templates) → Shows placeholder template card
- [ ] Tab 5 (Watermarks) → Shows add button
- [ ] Tab 6 (Export) → Shows format/quality/template selectors
- [ ] Language change → Persists to localStorage
- [ ] Preference toggle → Persists to localStorage
- [ ] Logout button → Redirects to login

### Export Tests (Flower)
- [ ] Create Flower review → Orchard panel appears with productType='flower'
- [ ] Orchard panel normalizes flower data correctly
- [ ] Exports to PNG/PDF work
- [ ] Export preview shows correct flower data

### Export Tests (Hash)
- [ ] Create Hash review → Orchard panel appears with productType='hash'
- [ ] Orchard panel normalizes hash data correctly
- [ ] Uses HASH_CATEGORY_FIELDS (not flower fields)
- [ ] Exports work properly

### Export Tests (Concentrate)
- [ ] Create Concentrate review → Orchard panel appears with productType='concentrate'
- [ ] Orchard panel normalizes concentrate data correctly
- [ ] Uses CONCENTRATE_CATEGORY_FIELDS
- [ ] Exports work properly

### Export Tests (Edible)
- [ ] Create Edible review → Orchard panel appears with productType='edible'
- [ ] Orchard panel normalizes edible data correctly
- [ ] Uses EDIBLE_CATEGORY_FIELDS (no visual/smell/texture)
- [ ] Exports work properly

---

## 📦 FILES TO CLEAN UP AFTER VERIFICATION

### Safe to Delete (No References)
```
❌ client/src/components/export/FlowerExportModal.jsx
❌ client/src/pages/account/PreferencesPage.jsx
```

### Marked as Deprecated (Optional Cleanup)
```
⚠️  Old normalizeReviewData() in OrchardPanel.jsx (keep if concerned about regressions)
```

---

## 🔐 SAFETY CHECKS BEFORE DELETION

### For FlowerExportModal.jsx:
```bash
# 1. Verify not imported
grep -r "FlowerExportModal" client/src --include="*.jsx"

# 2. Verify not in git history (last commit)
git log --oneline -n 20 | grep -i "flower.*export\|export.*flower"

# 3. Check if in tests (if tests exist)
grep -r "FlowerExportModal" client/src/tests --include="*.jsx" 2>/dev/null || echo "No test references found"
```

### For PreferencesPage.jsx:
```bash
# 1. Verify not imported
grep -r "PreferencesPage" client/src --include="*.jsx"

# 2. Verify App.jsx routes don't reference /preferences
grep "/preferences" client/src/App.jsx

# 3. Check AccountPage has all PreferencesPage content
grep -c "Données sauvegardées\|Templates favoris\|Filigranes\|Export" client/src/pages/account/AccountPage.jsx
# Should return 4 (all sections present)
```

---

## 🚨 ROLLBACK PLAN (If Issues)

All changes are **minimal and isolated**:

1. **If AccountPage breaks**: Revert to original, no other files affected
2. **If OrchardPanel breaks**: productType is additive, defaults to 'flower'
3. **If imports fail**: Only removed phantom imports, can restore if needed
4. **If tests fail**: No test files modified, tests should still pass

**Git commands for rollback:**
```bash
# Rollback entire branch
git reset --hard HEAD~1

# Rollback specific files
git checkout HEAD -- client/src/App.jsx
git checkout HEAD -- client/src/pages/account/AccountPage.jsx
git checkout HEAD -- client/src/components/shared/orchard/OrchardPanel.jsx
```

---

## 📊 CODE METRICS

### Lines Changed
- AccountPage.jsx: +232 lines (integrated PreferencesPage)
- OrchardPanel.jsx: -180 lines (removed old normalizeReviewData), +2 lines (new prop)
- App.jsx: -2 lines (removed phantom imports)
- **Total**: ~50 net lines added (new utility files)

### Files Modified: 4
- client/src/App.jsx
- client/src/pages/account/AccountPage.jsx
- client/src/components/shared/orchard/OrchardPanel.jsx
- client/src/components/export/*.jsx (no changes yet)

### Files Created: 2
- client/src/utils/orchard/productTypeMappings.js
- client/src/utils/orchard/normalizeByType.js

### Files To Delete: 2
- client/src/pages/account/PreferencesPage.jsx
- client/src/components/export/FlowerExportModal.jsx (optional)

---

## ✅ FINAL SIGN-OFF CHECKLIST

- [ ] Build passes without errors
- [ ] No SettingsPage/ProfileSettingsPage imports
- [ ] AccountPage loads with all 6 tabs
- [ ] All preferences work
- [ ] Flower export works
- [ ] Hash export works
- [ ] Concentrate export works
- [ ] Edible export works
- [ ] Prefer to delete obsolete files (manual after testing)
- [ ] Documentation updated

---

**Status**: Ready for testing phase ✅
