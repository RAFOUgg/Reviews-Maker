#!/usr/bin/env pwsh

$base = "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src\components"
cd $base

Write-Host "🚀 Starting Component Reorganization..." -ForegroundColor Cyan

# Liquid Design System
$liquid = @('LiquidAlert','LiquidBadge','LiquidButton','LiquidCard','LiquidInput','LiquidModal','LiquidMultiSelect','LiquidSelect','LiquidSlider')
foreach ($f in $liquid) {
    Move-Item "$f.jsx" "liquid/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ liquid/$f.jsx" }
}

# Forms
$forms = @('CreateReviewFormWrapper','CulturePipelineForm','CuringPipelineForm','FertilizationPipeline','PurificationPipeline','RecipeSection','SubstratMixer')
foreach ($f in $forms) {
    Move-Item "$f.jsx" "forms/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ forms/$f.jsx" }
}

# UI
$ui = @('Button','EmptyState','ErrorMessage')
foreach ($f in $ui) {
    Move-Item "$f.jsx" "ui/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ ui/$f.jsx" }
}

# Genetics
$gen = @('CanevasPhenoHunt','CultivarLibraryModal','CultivarList')
foreach ($f in $gen) {
    Move-Item "$f.jsx" "genetics/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ genetics/$f.jsx" }
}

# Review
$rev = @('ReviewCard','ReviewFullDisplay','ReviewPreview','HomeReviewCard','MobilePhotoGallery')
foreach ($f in $rev) {
    Move-Item "$f.jsx" "review/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ review/$f.jsx" }
}

# Gallery
$gal = @('AdvancedSearchBar','FilterBar')
foreach ($f in $gal) {
    Move-Item "$f.jsx" "gallery/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ gallery/$f.jsx" }
}

# Selectors
$sel = @('ProductSourceSelector','ProductTypeCards','WheelSelector','EffectSelector','QuickSelectModal')
foreach ($f in $sel) {
    Move-Item "$f.jsx" "selectors/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ selectors/$f.jsx" }
}

# Sections
$sec = @('CategoryRatings','CategoryRatingSummary','GlobalRating','CompletionBar','HeroSection')
foreach ($f in $sec) {
    Move-Item "$f.jsx" "sections/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ sections/$f.jsx" }
}

# Shared
$shr = @('Layout','SidebarHierarchique','SectionNavigator','ResponsiveCreateReviewLayout','ResponsiveFormComponents')
foreach ($f in $shr) {
    Move-Item "$f.jsx" "shared/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ shared/$f.jsx" }
}

# Auth
$aut = @('AuthCallback')
foreach ($f in $aut) {
    Move-Item "$f.jsx" "auth/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ auth/$f.jsx" }
}

# Legal (not auth)
$lgl = @('LegalConsentGate','LegalWelcomeModal')
foreach ($f in $lgl) {
    Move-Item "$f.jsx" "legal/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ legal/$f.jsx" }
}

# Modals
$mod = @('AuthorStatsModal','ConfirmDialog','PipelineStepModal')
foreach ($f in $mod) {
    Move-Item "$f.jsx" "modals/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ modals/$f.jsx" }
}

# Account
$acc = @('UserProfileDropdown','UpgradePrompt','UsageQuotas','ThemeSwitcher')
foreach ($f in $acc) {
    Move-Item "$f.jsx" "account/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ account/$f.jsx" }
}

# Home
$hom = @('ProductTypeCards','HeroSection')
foreach ($f in $hom) {
    Move-Item "$f.jsx" "home/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ home/$f.jsx" }
}

# Feedback
$fdb = @('ToastContainer','LoadingSpinner')
foreach ($f in $fdb) {
    Move-Item "$f.jsx" "feedback/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ feedback/$f.jsx" }
}

# Pipeline
$pip = @('UnifiedPipeline','TimelineGrid','PipelineWithCultivars')
foreach ($f in $pip) {
    Move-Item "$f.jsx" "pipeline/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ pipeline/$f.jsx" }
}

# Errors
$err = @('ErrorBoundary')
foreach ($f in $err) {
    Move-Item "$f.jsx" "errors/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ errors/$f.jsx" }
}

Write-Host "`n✅ Component reorganization complete!" -ForegroundColor Green
Write-Host "Files remaining at root:" -ForegroundColor Yellow
Get-ChildItem "*.jsx" -ErrorAction SilentlyContinue | Select-Object Name
