# 📊 Component Reorganization Mapping

## Files to Move (60 Files → 17 Subdirectories)

### 1️⃣ UI Components → `/ui/` (3 files)
- Button.jsx → Already exists or move to ui/
- EmptyState.jsx → ui/EmptyState.jsx
- ErrorMessage.jsx → ui/ErrorMessage.jsx

### 2️⃣ Liquid Design System → `/liquid/` (9 files)
- LiquidAlert.jsx → liquid/LiquidAlert.jsx
- LiquidBadge.jsx → liquid/LiquidBadge.jsx
- LiquidButton.jsx → liquid/LiquidButton.jsx
- LiquidCard.jsx → liquid/LiquidCard.jsx
- LiquidInput.jsx → liquid/LiquidInput.jsx
- LiquidModal.jsx → liquid/LiquidModal.jsx
- LiquidMultiSelect.jsx → liquid/LiquidMultiSelect.jsx
- LiquidSelect.jsx → liquid/LiquidSelect.jsx
- LiquidSlider.jsx → liquid/LiquidSlider.jsx

### 3️⃣ Forms → `/forms/` (7 files)
- CreateReviewFormWrapper.jsx → forms/CreateReviewFormWrapper.jsx
- CulturePipelineForm.jsx → forms/CulturePipelineForm.jsx
- CuringPipelineForm.jsx → forms/CuringPipelineForm.jsx
- FertilizationPipeline.jsx → forms/FertilizationPipeline.jsx
- PurificationPipeline.jsx → forms/PurificationPipeline.jsx
- RecipeSection.jsx → forms/RecipeSection.jsx
- SubstratMixer.jsx → forms/SubstratMixer.jsx

### 4️⃣ Genetics/Breeding → `/genetics/` (3 files - merge with existing)
- CanevasPhenoHunt.jsx → genetics/CanevasPhenoHunt.jsx
- CultivarLibraryModal.jsx → genetics/CultivarLibraryModal.jsx
- CultivarList.jsx → genetics/CultivarList.jsx

### 5️⃣ Review Display → `/review/` (4 files)
- ReviewCard.jsx → review/ReviewCard.jsx
- ReviewFullDisplay.jsx → review/ReviewFullDisplay.jsx
- ReviewPreview.jsx → review/ReviewPreview.jsx
- HomeReviewCard.jsx → review/HomeReviewCard.jsx (or home/)

### 6️⃣ Gallery → `/gallery/` (2 files)
- AdvancedSearchBar.jsx → gallery/AdvancedSearchBar.jsx
- FilterBar.jsx → gallery/FilterBar.jsx

### 7️⃣ Selectors/Pickers → `/selectors/` (3 files)
- ProductSourceSelector.jsx → selectors/ProductSourceSelector.jsx
- ProductTypeCards.jsx → selectors/ProductTypeCards.jsx
- WheelSelector.jsx → selectors/WheelSelector.jsx
- EffectSelector.jsx → selectors/EffectSelector.jsx

### 8️⃣ Sections/Displays → `/sections/` (5 files)
- CategoryRatings.jsx → sections/CategoryRatings.jsx
- CategoryRatingSummary.jsx → sections/CategoryRatingSummary.jsx
- GlobalRating.jsx → sections/GlobalRating.jsx
- CompletionBar.jsx → sections/CompletionBar.jsx
- HeroSection.jsx → home/HeroSection.jsx OR sections/

### 9️⃣ Layout/Shared → `/shared/` (4 files)
- Layout.jsx → shared/Layout.jsx
- SidebarHierarchique.jsx → shared/SidebarHierarchique.jsx
- SectionNavigator.jsx → shared/SectionNavigator.jsx
- ResponsiveCreateReviewLayout.jsx → shared/ResponsiveCreateReviewLayout.jsx
- ResponsiveFormComponents.jsx → shared/ResponsiveFormComponents.jsx

### 🔟 Auth → `/auth/` (3 files - merge with existing)
- AuthCallback.jsx → auth/AuthCallback.jsx (update imports)
- LegalConsentGate.jsx → legal/LegalConsentGate.jsx (better here)
- LegalWelcomeModal.jsx → legal/LegalWelcomeModal.jsx (better here)

### 1️⃣1️⃣ Modals → `/modals/` (5 files)
- AuthorStatsModal.jsx → modals/AuthorStatsModal.jsx
- ConfirmDialog.jsx → modals/ConfirmDialog.jsx
- QuickSelectModal.jsx → modals/QuickSelectModal.jsx
- PipelineStepModal.jsx → modals/PipelineStepModal.jsx (or pipeline/)
- CultivarLibraryModal.jsx → genetics/CultivarLibraryModal.jsx (better)

### 1️⃣2️⃣ Account/User → `/account/` (4 files - merge with existing)
- UserProfileDropdown.jsx → account/UserProfileDropdown.jsx
- UpgradePrompt.jsx → account/UpgradePrompt.jsx
- UsageQuotas.jsx → account/UsageQuotas.jsx
- ThemeSwitcher.jsx → account/ThemeSwitcher.jsx

### 1️⃣3️⃣ Home Page → `/home/` (3 files)
- HomeReviewCard.jsx → home/HomeReviewCard.jsx
- ProductTypeCards.jsx → home/ProductTypeCards.jsx
- HeroSection.jsx → home/HeroSection.jsx

### 1️⃣4️⃣ Feedback → `/feedback/` (3 files)
- ToastContainer.jsx → feedback/ToastContainer.jsx
- LoadingSpinner.jsx → feedback/LoadingSpinner.jsx
- LiquidAlert.jsx → liquid/ (design system)

### 1️⃣5️⃣ Pipeline → `/pipeline/` (3 files - merge with existing 39)
- UnifiedPipeline.jsx → pipeline/UnifiedPipeline.jsx
- TimelineGrid.jsx → pipeline/TimelineGrid.jsx
- PipelineWithCultivars.jsx → pipeline/PipelineWithCultivars.jsx

### 1️⃣6️⃣ Errors → `/errors/` (2 files)
- ErrorBoundary.jsx → errors/ErrorBoundary.jsx
- MobilePhotoGallery.jsx → review/MobilePhotoGallery.jsx (actually review)

### 1️⃣7️⃣ Stats → `/stats/` (2 files - stats folder exists)
- AuthorStatsModal.jsx → modals/AuthorStatsModal.jsx
- CategoryRatingSummary.jsx → stats/CategoryRatingSummary.jsx

---

## Summary of Moves

| Category | Count | Target Folder |
|----------|-------|----------------|
| UI | 3 | ui/ |
| Liquid | 9 | liquid/ |
| Forms | 7 | forms/ |
| Genetics | 3 | genetics/ |
| Review | 4 | review/ |
| Gallery | 2 | gallery/ |
| Selectors | 4 | selectors/ |
| Sections | 5 | sections/ |
| Shared | 5 | shared/ |
| Auth | 3 | auth/ + legal/ |
| Modals | 5 | modals/ |
| Account | 4 | account/ |
| Home | 3 | home/ |
| Feedback | 3 | feedback/ |
| Pipeline | 3 | pipeline/ |
| Errors | 2 | errors/ |
| Stats | 2 | stats/ |
| **TOTAL** | **60** | **17 folders** |

---

## Strategy

1. **Phase 1**: Move all 60 files to appropriate folders
2. **Phase 2**: Create index.js files in each folder for barrel exports
3. **Phase 3**: Update all import statements in moved files
4. **Phase 4**: Update all imports in pages/ that reference components
5. **Phase 5**: Test with `npm install && npm run dev`
6. **Phase 6**: Fix any remaining import errors
7. **Phase 7**: Delete old files at root level

---

Status: READY TO EXECUTE
