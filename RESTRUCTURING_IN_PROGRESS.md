# 🔨 RESTRUCTURING IN PROGRESS - Phase 1

## Current State Analysis

**Components root**: 60 JSX files scattered  
**Pages root**: 22 JSX files scattered  
**Status**: CHAOS MODE → ORGANIZED MODE

---

## Target Structure (Being Created Now)

### `/components/` (NEW)
```
components/
├── ui/                          # Reusable UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   ├── Card.jsx
│   └── Badge.jsx
├── liquid/                       # Apple-style liquid design system
│   ├── LiquidButton.jsx
│   ├── LiquidInput.jsx
│   ├── LiquidSelect.jsx
│   ├── LiquidModal.jsx
│   ├── LiquidAlert.jsx
│   ├── LiquidBadge.jsx
│   ├── LiquidCard.jsx
│   ├── LiquidMultiSelect.jsx
│   └── LiquidSlider.jsx
├── forms/                        # Form components
│   ├── CreateReviewFormWrapper.jsx
│   ├── CulturePipelineForm.jsx
│   ├── CuringPipelineForm.jsx
│   ├── FertilizationPipeline.jsx
│   ├── PurificationPipeline.jsx
│   ├── RecipeSection.jsx
│   └── SubstratMixer.jsx
├── pipeline/                     # Pipeline-specific components
│   ├── UnifiedPipeline.jsx
│   ├── TimelineGrid.jsx
│   ├── PipelineStepModal.jsx
│   ├── PipelineWithCultivars.jsx
│   └── FertilizationPipeline.jsx
├── genetics/                     # Genetics & breeding
│   ├── CanevasPhenoHunt.jsx
│   ├── CultivarLibraryModal.jsx
│   ├── CultivarList.jsx
│   ├── PhenoHuntCanvas.jsx
│   └── WheelSelector.jsx
├── review/                       # Review components
│   ├── ReviewCard.jsx
│   ├── ReviewFullDisplay.jsx
│   ├── ReviewPreview.jsx
│   ├── HomeReviewCard.jsx
│   └── MobilePhotoGallery.jsx
├── gallery/                      # Gallery components
│   ├── AdvancedSearchBar.jsx
│   ├── FilterBar.jsx
│   └── CategoryRatings.jsx
├── sections/                     # Review section components
│   ├── EffectSelector.jsx
│   ├── CategoryRatingSummary.jsx
│   ├── GlobalRating.jsx
│   └── HeroSection.jsx
├── selectors/                    # Selector/picker components
│   ├── ProductSourceSelector.jsx
│   ├── ProductTypeCards.jsx
│   ├── QuickSelectModal.jsx
│   ├── WheelSelector.jsx
│   └── EffectSelector.jsx
├── shared/                       # Shared/layout components
│   ├── Layout.jsx
│   ├── SidebarHierarchique.jsx
│   ├── SectionNavigator.jsx
│   ├── ResponsiveCreateReviewLayout.jsx
│   └── ResponsiveFormComponents.jsx
├── auth/                         # Auth components
│   ├── AuthCallback.jsx
│   ├── LegalConsentGate.jsx
│   └── LegalWelcomeModal.jsx
├── modals/                       # Modal components
│   ├── AuthorStatsModal.jsx
│   ├── ConfirmDialog.jsx
│   ├── QuickSelectModal.jsx
│   ├── CultivarLibraryModal.jsx
│   └── PipelineStepModal.jsx
├── account/                      # Account/user components
│   ├── UserProfileDropdown.jsx
│   ├── UpgradePrompt.jsx
│   ├── UsageQuotas.jsx
│   └── ThemeSwitcher.jsx
├── home/                         # Home page components
│   ├── HeroSection.jsx
│   ├── HomeReviewCard.jsx
│   └── ProductTypeCards.jsx
├── stats/                        # Stats/analytics components
│   ├── AuthorStatsModal.jsx
│   ├── GlobalRating.jsx
│   ├── CategoryRatingSummary.jsx
│   └── CompletionBar.jsx
├── errors/                       # Error handling components
│   ├── ErrorBoundary.jsx
│   ├── ErrorMessage.jsx
│   └── EmptyState.jsx
├── feedback/                     # Feedback components
│   ├── ToastContainer.jsx
│   ├── LiquidAlert.jsx
│   └── LoadingSpinner.jsx
└── index.js                      # Barrel exports
```

### `/pages/` (REORGANIZED)
```
pages/
├── auth/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ForgotPasswordPage.jsx
│   ├── ResetPasswordPage.jsx
│   ├── EmailVerificationPage.jsx
│   ├── AgeVerificationPage.jsx
│   └── LegalVerificationPage.jsx
├── reviews/
│   ├── CreateReviewPage.jsx
│   ├── EditReviewPage.jsx
│   ├── ReviewDetailPage.jsx
│   └── ReviewListPage.jsx
├── gallery/
│   ├── GalleryPage.jsx
│   └── ExportMakerPage.jsx
├── library/
│   ├── LibraryPage.jsx
│   ├── TemplatesPage.jsx
│   └── SavedExportsPage.jsx
├── genetics/
│   ├── GeneticsManagementPage.jsx
│   └── PhenoHuntPage.jsx
├── account/
│   ├── ProfilePage.jsx
│   ├── ProfileSettingsPage.jsx
│   ├── SettingsPage.jsx
│   ├── PreferencesPage.jsx
│   ├── StatsPage.jsx
│   ├── AccountChoicePage.jsx
│   ├── AccountSetupPage.jsx
│   └── PaymentPage.jsx
├── home/
│   └── HomePage.jsx
├── errors/
│   ├── 404Page.jsx
│   └── ErrorPage.jsx
└── index.js
```

---

## ACTION PLAN

### Phase 1: Create New Folder Structure ✅ STARTING
- Create all subdirectories under `/components/`
- Create all subdirectories under `/pages/`
- Create `index.js` barrel exports

### Phase 2: Move Files
- Move UI components (60 files → 17 subdirectories)
- Move page components (22 files → 8 subdirectories)
- Delete duplicates/backups

### Phase 3: Update Imports
- Update all relative imports (200+ locations)
- Test import paths
- Verify no circular dependencies

### Phase 4: Validation
- Run `npm install`
- Run `npm run dev`
- Test all pages load
- Check for console errors

---

**RESTRUCTURING STARTING NOW...**
