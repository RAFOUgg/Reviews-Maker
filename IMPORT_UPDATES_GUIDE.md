# 🔧 IMPORT UPDATES GUIDE - Phase 2

## Status: READY TO START

The file reorganization is DONE ✅  
Now we need to update all imports to match the new structure.

---

## 🎯 What Needs to be Updated

### Category 1: Component Imports in Pages
**Files to update**: All files in `/pages/` subdirectories
**Count**: ~22 files
**Priority**: 🔴 CRITICAL

### Category 2: Component Imports in Other Components
**Files to update**: Files in component subdirectories that import other components
**Count**: ~30+ files
**Priority**: 🔴 CRITICAL

### Category 3: Router Configuration
**Files to update**: App.jsx, router files
**Count**: 1-3 files
**Priority**: 🔴 CRITICAL

### Category 4: Service/Hook Imports
**Files to update**: Hooks, services that import components
**Count**: ~10 files
**Priority**: 🟠 IMPORTANT

---

## 📝 Import Pattern Examples

### OLD STRUCTURE (BROKEN NOW)
```javascript
// These imports won't work anymore!
import Button from '../Button';
import LiquidButton from '../LiquidButton';
import ReviewCard from '../ReviewCard';
import LegalConsentGate from '../LegalConsentGate';
import AuthCallback from '../AuthCallback';
import CreateReviewFormWrapper from '../CreateReviewFormWrapper';
```

### NEW STRUCTURE (USE THESE)
```javascript
// Option 1: Direct imports
import Button from '@/components/ui/Button';
import LiquidButton from '@/components/liquid/LiquidButton';
import ReviewCard from '@/components/review/ReviewCard';
import LegalConsentGate from '@/components/legal/LegalConsentGate';
import AuthCallback from '@/components/auth/AuthCallback';
import CreateReviewFormWrapper from '@/components/forms/CreateReviewFormWrapper';

// Option 2: Barrel exports (if index.js exists)
import { LiquidButton, LiquidInput } from '@/components/liquid';
import { ReviewCard, ReviewPreview } from '@/components/review';
```

---

## 📍 File Location Reference

### Component Paths
```
Button              → @/components/ui/Button
LiquidButton        → @/components/liquid/LiquidButton
LiquidInput         → @/components/liquid/LiquidInput
LiquidSelect        → @/components/liquid/LiquidSelect
LiquidModal         → @/components/liquid/LiquidModal
LiquidAlert         → @/components/liquid/LiquidAlert
LiquidBadge         → @/components/liquid/LiquidBadge
LiquidCard          → @/components/liquid/LiquidCard
LiquidMultiSelect   → @/components/liquid/LiquidMultiSelect
LiquidSlider        → @/components/liquid/LiquidSlider

CreateReviewFormWrapper → @/components/forms/CreateReviewFormWrapper
CulturePipelineForm     → @/components/forms/CulturePipelineForm
CuringPipelineForm      → @/components/forms/CuringPipelineForm
FertilizationPipeline   → @/components/forms/FertilizationPipeline
PurificationPipeline    → @/components/forms/PurificationPipeline
RecipeSection           → @/components/forms/RecipeSection
SubstratMixer           → @/components/forms/SubstratMixer

ReviewCard              → @/components/review/ReviewCard
ReviewFullDisplay       → @/components/review/ReviewFullDisplay
ReviewPreview           → @/components/review/ReviewPreview
HomeReviewCard          → @/components/review/HomeReviewCard
MobilePhotoGallery      → @/components/review/MobilePhotoGallery

CanevasPhenoHunt        → @/components/genetics/CanevasPhenoHunt
CultivarLibraryModal    → @/components/genetics/CultivarLibraryModal
CultivarList            → @/components/genetics/CultivarList

AdvancedSearchBar       → @/components/gallery/AdvancedSearchBar
FilterBar               → @/components/gallery/FilterBar

ProductSourceSelector   → @/components/selectors/ProductSourceSelector
ProductTypeCards        → @/components/selectors/ProductTypeCards
WheelSelector           → @/components/selectors/WheelSelector
EffectSelector          → @/components/selectors/EffectSelector
QuickSelectModal        → @/components/selectors/QuickSelectModal

CategoryRatings         → @/components/sections/CategoryRatings
CategoryRatingSummary   → @/components/sections/CategoryRatingSummary
GlobalRating            → @/components/sections/GlobalRating
CompletionBar           → @/components/sections/CompletionBar
HeroSection             → @/components/sections/HeroSection

Layout                  → @/components/shared/Layout
SidebarHierarchique     → @/components/shared/SidebarHierarchique
SectionNavigator        → @/components/shared/SectionNavigator
ResponsiveCreateReviewLayout → @/components/shared/ResponsiveCreateReviewLayout
ResponsiveFormComponents    → @/components/shared/ResponsiveFormComponents

AuthCallback            → @/components/auth/AuthCallback
LegalConsentGate        → @/components/legal/LegalConsentGate
LegalWelcomeModal       → @/components/legal/LegalWelcomeModal

AuthorStatsModal        → @/components/modals/AuthorStatsModal
ConfirmDialog           → @/components/modals/ConfirmDialog
PipelineStepModal       → @/components/modals/PipelineStepModal

UserProfileDropdown     → @/components/account/UserProfileDropdown
UpgradePrompt           → @/components/account/UpgradePrompt
UsageQuotas             → @/components/account/UsageQuotas
ThemeSwitcher           → @/components/account/ThemeSwitcher

ToastContainer          → @/components/feedback/ToastContainer
LoadingSpinner          → @/components/feedback/LoadingSpinner

UnifiedPipeline         → @/components/pipeline/UnifiedPipeline
TimelineGrid            → @/components/pipeline/TimelineGrid
PipelineWithCultivars   → @/components/pipeline/PipelineWithCultivars

ErrorBoundary           → @/components/errors/ErrorBoundary
EmptyState              → @/components/ui/EmptyState
ErrorMessage            → @/components/ui/ErrorMessage
```

---

## 🔍 How to Find & Update All Imports

### Method 1: VS Code Find & Replace (RECOMMENDED)

1. **Open Find & Replace**: `Ctrl+H` (or `Cmd+H`)

2. **For each component, replace**:
```
Find:     import (.+) from ['"]\.\.\/LiquidButton
Replace:  import $1 from '@/components/liquid/LiquidButton

Find:     import (.+) from ['"]\.\.\/ReviewCard
Replace:  import $1 from '@/components/review/ReviewCard

... etc for all components
```

3. **Do this for relative paths**:
```
Find:     from ['"]\.\.\/Button
Replace:  from '@/components/ui/Button

Find:     from ['"]\.\.\/LiquidButton
Replace:  from '@/components/liquid/LiquidButton

etc...
```

### Method 2: Global Search & Replace (BATCH)

**File**: `src/`
**Find regex**: `from ['"]\.\.\/([A-Za-z]+)\.jsx?['"]`
**Replace**: `from '@/components/{APPROPRIATE_FOLDER}/$1'`

**⚠️ WARNING**: This needs to be done carefully per component type!

---

## 📋 Priority Order to Update

### Step 1: Pages (CRITICAL)
Update all imports in:
- `/pages/auth/`
- `/pages/reviews/`
- `/pages/gallery/`
- `/pages/library/`
- `/pages/genetics/`
- `/pages/account/`
- `/pages/home/`

### Step 2: Main Router
Update App.jsx or main router file:
```javascript
// OLD
import CreateReviewPage from './pages/CreateReviewPage';
import LoginPage from './pages/LoginPage';

// NEW
import CreateReviewPage from './pages/reviews/CreateReviewPage';
import LoginPage from './pages/auth/LoginPage';
```

### Step 3: Components Importing Components
Update files like:
- `/components/shared/Layout.jsx`
- `/components/forms/*`
- Other components that import other components

### Step 4: Hooks & Services
Update files that import components for display

---

## ✅ Checklist

- [ ] Updated all imports in `/pages/`
- [ ] Updated router configuration
- [ ] Updated all component-to-component imports
- [ ] Updated hook/service imports
- [ ] Run `npm run dev`
- [ ] Check browser console for errors
- [ ] Test clicking through pages
- [ ] All pages load without errors
- [ ] Commit changes with git

---

## 🚀 When You're Ready to Test

```bash
cd client
npm install
npm run dev
```

Then:
1. Open http://localhost:5173
2. Open DevTools Console (F12)
3. Check for import errors (red text)
4. Fix any remaining broken imports
5. Test each page works

---

## 🆘 Common Issues

### Issue: "Module not found"
**Cause**: Import path is wrong
**Fix**: Check path against reference table above

### Issue: "Default export expected"
**Cause**: Using named import when should be default
**Fix**: Check if component exports as `export default` or `export`

### Issue: Cannot find module '@/components/...'
**Cause**: Path alias not configured
**Fix**: Check `vite.config.js` has `@` alias set to `src/`

### Issue: Circular dependency
**Cause**: Component A imports B which imports A
**Fix**: Refactor to break the cycle (rare issue)

---

## 📊 Files Likely to Need Updates

| File | Imports to Update | Priority |
|------|-------------------|----------|
| App.jsx | All page imports | 🔴 CRITICAL |
| Layout.jsx | UI, Liquid components | 🔴 CRITICAL |
| CreateReviewPage.jsx | Form components | 🔴 CRITICAL |
| HomePage.jsx | Home components | 🔴 CRITICAL |
| GalleryPage.jsx | Gallery components | 🔴 CRITICAL |
| All pages/* | Various | 🔴 CRITICAL |
| Components importing components | Various | 🟠 IMPORTANT |
| Hooks that render | Various | 🟠 IMPORTANT |

---

## 💡 Pro Tips

1. **Use Find & Replace wisely** - Test on a few files first
2. **Use barrel exports** - Shorter imports when available
3. **Check vite.config.js** - Make sure `@` alias exists
4. **Test frequently** - Don't wait until all changes to test
5. **Use git** - Revert if something breaks

---

## Next Command

When done with imports, run:
```bash
npm run dev
```

If there are errors, the console will tell you what's broken!

---

**Status**: READY FOR IMPORT UPDATES  
**Estimated Time**: 2-3 hours  
**Difficulty**: Medium (mostly copy-paste)

Let me know when you want to start! 🚀
