# 📌 QUICK REFERENCE - Restructuring Summary

## 🎉 What Was Done

**60 component files** reorganized into **17+ organized folders**  
**22 page files** reorganized into **8 domain-based folders**

✅ **FILES MOVED**  
⏳ **IMPORTS TO UPDATE** ← YOU ARE HERE

---

## 📍 Component Quick Reference

### 🎨 UI Components
| Old Path | New Path |
|----------|----------|
| Button.jsx | @/components/ui/Button |
| EmptyState.jsx | @/components/ui/EmptyState |
| ErrorMessage.jsx | @/components/ui/ErrorMessage |

### 💧 Liquid Design System
| Old Path | New Path |
|----------|----------|
| Liquid*.jsx | @/components/liquid/Liquid* |

### 📋 Forms
| Old Path | New Path |
|----------|----------|
| CreateReviewFormWrapper.jsx | @/components/forms/CreateReviewFormWrapper |
| *PipelineForm.jsx | @/components/forms/*PipelineForm |
| *Pipeline.jsx | @/components/forms/*Pipeline |
| RecipeSection.jsx | @/components/forms/RecipeSection |
| SubstratMixer.jsx | @/components/forms/SubstratMixer |

### 🧬 Genetics
| Old Path | New Path |
|----------|----------|
| CanevasPhenoHunt.jsx | @/components/genetics/CanevasPhenoHunt |
| CultivarLibraryModal.jsx | @/components/genetics/CultivarLibraryModal |
| CultivarList.jsx | @/components/genetics/CultivarList |

### 📱 Review Components
| Old Path | New Path |
|----------|----------|
| ReviewCard.jsx | @/components/review/ReviewCard |
| ReviewFullDisplay.jsx | @/components/review/ReviewFullDisplay |
| ReviewPreview.jsx | @/components/review/ReviewPreview |
| HomeReviewCard.jsx | @/components/review/HomeReviewCard |
| MobilePhotoGallery.jsx | @/components/review/MobilePhotoGallery |

### 🏛️ Gallery
| Old Path | New Path |
|----------|----------|
| AdvancedSearchBar.jsx | @/components/gallery/AdvancedSearchBar |
| FilterBar.jsx | @/components/gallery/FilterBar |

### 🎯 Selectors
| Old Path | New Path |
|----------|----------|
| ProductSourceSelector.jsx | @/components/selectors/ProductSourceSelector |
| ProductTypeCards.jsx | @/components/selectors/ProductTypeCards |
| WheelSelector.jsx | @/components/selectors/WheelSelector |
| EffectSelector.jsx | @/components/selectors/EffectSelector |
| QuickSelectModal.jsx | @/components/selectors/QuickSelectModal |

### 📊 Sections
| Old Path | New Path |
|----------|----------|
| CategoryRatings.jsx | @/components/sections/CategoryRatings |
| CategoryRatingSummary.jsx | @/components/sections/CategoryRatingSummary |
| GlobalRating.jsx | @/components/sections/GlobalRating |
| CompletionBar.jsx | @/components/sections/CompletionBar |
| HeroSection.jsx | @/components/sections/HeroSection |

### 🔀 Shared/Layout
| Old Path | New Path |
|----------|----------|
| Layout.jsx | @/components/shared/Layout |
| SidebarHierarchique.jsx | @/components/shared/SidebarHierarchique |
| SectionNavigator.jsx | @/components/shared/SectionNavigator |
| ResponsiveCreateReviewLayout.jsx | @/components/shared/ResponsiveCreateReviewLayout |
| ResponsiveFormComponents.jsx | @/components/shared/ResponsiveFormComponents |

### 🔑 Auth
| Old Path | New Path |
|----------|----------|
| AuthCallback.jsx | @/components/auth/AuthCallback |

### ⚖️ Legal
| Old Path | New Path |
|----------|----------|
| LegalConsentGate.jsx | @/components/legal/LegalConsentGate |
| LegalWelcomeModal.jsx | @/components/legal/LegalWelcomeModal |

### 🪟 Modals
| Old Path | New Path |
|----------|----------|
| AuthorStatsModal.jsx | @/components/modals/AuthorStatsModal |
| ConfirmDialog.jsx | @/components/modals/ConfirmDialog |
| PipelineStepModal.jsx | @/components/modals/PipelineStepModal |

### 👤 Account
| Old Path | New Path |
|----------|----------|
| UserProfileDropdown.jsx | @/components/account/UserProfileDropdown |
| UpgradePrompt.jsx | @/components/account/UpgradePrompt |
| UsageQuotas.jsx | @/components/account/UsageQuotas |
| ThemeSwitcher.jsx | @/components/account/ThemeSwitcher |

### 🔔 Feedback
| Old Path | New Path |
|----------|----------|
| ToastContainer.jsx | @/components/feedback/ToastContainer |
| LoadingSpinner.jsx | @/components/feedback/LoadingSpinner |

### ⏱️ Pipeline
| Old Path | New Path |
|----------|----------|
| UnifiedPipeline.jsx | @/components/pipeline/UnifiedPipeline |
| TimelineGrid.jsx | @/components/pipeline/TimelineGrid |
| PipelineWithCultivars.jsx | @/components/pipeline/PipelineWithCultivars |

### ⚠️ Errors
| Old Path | New Path |
|----------|----------|
| ErrorBoundary.jsx | @/components/errors/ErrorBoundary |

---

## 📄 Pages Quick Reference

### 🔐 Auth
| Old Path | New Path |
|----------|----------|
| LoginPage.jsx | @/pages/auth/LoginPage |
| RegisterPage.jsx | @/pages/auth/RegisterPage |
| ForgotPasswordPage.jsx | @/pages/auth/ForgotPasswordPage |
| ResetPasswordPage.jsx | @/pages/auth/ResetPasswordPage |
| EmailVerificationPage.jsx | @/pages/auth/EmailVerificationPage |
| AgeVerificationPage.jsx | @/pages/auth/AgeVerificationPage |

### 📝 Reviews
| Old Path | New Path |
|----------|----------|
| CreateReviewPage.jsx | @/pages/reviews/CreateReviewPage |
| EditReviewPage.jsx | @/pages/reviews/EditReviewPage |
| ReviewDetailPage.jsx | @/pages/reviews/ReviewDetailPage |

### 🏛️ Gallery
| Old Path | New Path |
|----------|----------|
| GalleryPage.jsx | @/pages/gallery/GalleryPage |

### 📚 Library
| Old Path | New Path |
|----------|----------|
| LibraryPage.jsx | @/pages/library/LibraryPage |

### 🧬 Genetics
| Old Path | New Path |
|----------|----------|
| GeneticsManagementPage.jsx | @/pages/genetics/GeneticsManagementPage |
| PhenoHuntPage.jsx | @/pages/genetics/PhenoHuntPage |

### 👤 Account
| Old Path | New Path |
|----------|----------|
| ProfilePage.jsx | @/pages/account/ProfilePage |
| ProfileSettingsPage.jsx | @/pages/account/ProfileSettingsPage |
| SettingsPage.jsx | @/pages/account/SettingsPage |
| PreferencesPage.jsx | @/pages/account/PreferencesPage |
| StatsPage.jsx | @/pages/account/StatsPage |
| AccountChoicePage.jsx | @/pages/account/AccountChoicePage |
| AccountSetupPage.jsx | @/pages/account/AccountSetupPage |
| PaymentPage.jsx | @/pages/account/PaymentPage |

### 🏠 Home
| Old Path | New Path |
|----------|----------|
| HomePage.jsx | @/pages/home/HomePage |

---

## 🔄 Find & Replace Patterns

### In VS Code (Ctrl+H)
```
Find:     from ['"]\.\.\/LiquidButton['"]
Replace:  from '@/components/liquid/LiquidButton'

Find:     from ['"]\.\.\/ReviewCard['"]
Replace:  from '@/components/review/ReviewCard'

etc...
```

---

## ✅ Verification Steps

1. ✅ All files moved
2. ⏳ Update all imports
3. ⏳ `npm run dev`
4. ⏳ Check console for errors
5. ⏳ Fix any remaining imports
6. ⏳ Test pages load

---

## 📚 Detailed Guides

| Guide | Purpose |
|-------|---------|
| RESTRUCTURING_COMPLETE.md | Full details |
| COMPONENT_MOVE_PLAN.md | File mapping |
| IMPORT_UPDATES_GUIDE.md | Step-by-step |
| ACTION_ITEMS.md | Next steps |

---

## 🚀 Next Command
```bash
npm run dev
```

Then fix any import errors! 💪
