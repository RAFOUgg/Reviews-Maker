$componentsDir = "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src\components"
cd $componentsDir

# Ensure directories exist
@('liquid', 'forms', 'ui', 'genetics', 'review', 'gallery', 'selectors', 'sections', 'shared', 'auth', 'legal', 'modals', 'account', 'home', 'feedback', 'pipeline', 'errors', 'orchardPanel') | % {
    if (-not (Test-Path $_)) { mkdir $_ | Out-Null }
}

# Mapping of component files to target folders
$mappings = @{
    # Liquid components
    'LiquidAlert.jsx' = 'liquid'
    'LiquidBadge.jsx' = 'liquid'
    'LiquidButton.jsx' = 'liquid'
    'LiquidCard.jsx' = 'liquid'
    'LiquidInput.jsx' = 'liquid'
    'LiquidModal.jsx' = 'liquid'
    'LiquidMultiSelect.jsx' = 'liquid'
    'LiquidSelect.jsx' = 'liquid'
    'LiquidSlider.jsx' = 'liquid'
    'Button.jsx' = 'liquid'
    
    # Forms
    'CreateReviewFormWrapper.jsx' = 'forms'
    'CulturePipelineForm.jsx' = 'forms'
    'CuringPipelineForm.jsx' = 'forms'
    'SubstratMixer.jsx' = 'forms'
    'PurificationPipeline.jsx' = 'forms'
    'FertilizationPipeline.jsx' = 'forms'
    'RecipeSection.jsx' = 'forms'
    
    # UI
    'EmptyState.jsx' = 'ui'
    'ErrorMessage.jsx' = 'ui'
    'AnimatedMeshGradient.jsx' = 'ui'
    
    # Genetics
    'CanevasPhenoHunt.jsx' = 'genetics'
    'CultivarLibraryModal.jsx' = 'genetics'
    'CultivarList.jsx' = 'genetics'
    
    # Review
    'ReviewCard.jsx' = 'review'
    
    # Gallery
    'AdvancedSearchBar.jsx' = 'gallery'
    
    # Selectors
    'ProductSourceSelector.jsx' = 'selectors'
    
    # Sections
    'CategoryRatings.jsx' = 'sections'
    
    # Shared/Layout
    'SidebarHierarchique.jsx' = 'shared'
    'Layout.jsx' = 'shared'
    
    # Auth
    'AuthCallback.jsx' = 'auth'
    
    # Legal
    'LegalConsentGate.jsx' = 'legal'
    'LegalWelcomeModal.jsx' = 'legal'
    
    # Modals
    'AuthorStatsModal.jsx' = 'modals'
    
    # Account
    'UserProfileDropdown.jsx' = 'account'
    'UpgradePrompt.jsx' = 'account'
    'UsageQuotas.jsx' = 'account'
    'AccountSelector.jsx' = 'account'
    
    # Home
    'ProductTypeCards.jsx' = 'home'
    'HeroSection.jsx' = 'home'
    'ThemeSwitcher.jsx' = 'account'
    
    # Feedback
    'ToastContainer.jsx' = 'feedback'
    
    # Pipeline
    'UnifiedPipeline.jsx' = 'pipeline'
    'TimelineGrid.jsx' = 'pipeline'
    'PipelineWithCultivars.jsx' = 'pipeline'
    
    # Errors
    'ErrorBoundary.jsx' = 'errors'
}

$moved = 0
$notfound = 0
$skipped = 0

foreach ($file in (Get-ChildItem -File -Filter "*.jsx")) {
    if ($mappings.ContainsKey($file.Name)) {
        $target = $mappings[$file.Name]
        # Check if already in correct folder (don't move if already nested)
        if ($file.DirectoryName -eq $componentsDir) {
            Move-Item $file.FullName "$target\" -Force 2>&1
            Write-Host "Moved $($file.Name) to $target\"
            $moved++
        } else {
            $skipped++
        }
    } else {
        # Files we don't have a mapping for
        $notfound++
    }
}

Write-Host ""
Write-Host "====== COMPONENTS REORGANIZATION COMPLETE ======"
Write-Host "Moved: $moved files"
Write-Host "Skipped: $skipped files (already nested)"
Write-Host "Not mapped: $notfound files"

# Count files in each folder
Write-Host ""
Write-Host "Final structure:"
@('liquid', 'forms', 'ui', 'genetics', 'review', 'gallery', 'selectors', 'sections', 'shared', 'auth', 'legal', 'modals', 'account', 'home', 'feedback', 'pipeline', 'errors') | % {
    $count = ((Get-ChildItem "$_" -Filter "*.jsx" -ErrorAction SilentlyContinue) | Measure-Object).Count
    if ($count -gt 0) {
        Write-Host "  $_/ : $count files"
    }
}
