# Complete reorganization of remaining files
$clientSrc = "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src"
$componentRoot = "$clientSrc\components"
$pageRoot = "$clientSrc\pages"

# Ensure directories exist
$dirs = @(
    "$pageRoot\auth",
    "$pageRoot\genetics",
    "$pageRoot\demo",
    "$componentRoot\sections",
    "$componentRoot\review",
    "$componentRoot\modals",
    "$componentRoot\selectors",
    "$componentRoot\shared",
    "$componentRoot\feedback"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "Dossier cree: $dir"
    }
}

# Move remaining PAGES (8 files)
$pageMovements = @(
    @{ src = "$pageRoot\AgeVerificationPage.jsx"; dest = "$pageRoot\auth\AgeVerificationPage.jsx" }
    @{ src = "$pageRoot\EmailVerificationPage.jsx"; dest = "$pageRoot\auth\EmailVerificationPage.jsx" }
    @{ src = "$pageRoot\ExamplePipelineIntegration.jsx"; dest = "$pageRoot\demo\ExamplePipelineIntegration.jsx" }
    @{ src = "$pageRoot\ForgotPasswordPage.jsx"; dest = "$pageRoot\auth\ForgotPasswordPage.jsx" }
    @{ src = "$pageRoot\PhenoHuntPage.jsx"; dest = "$pageRoot\genetics\PhenoHuntPage.jsx" }
    @{ src = "$pageRoot\RegisterPage.jsx"; dest = "$pageRoot\auth\RegisterPage.jsx" }
    @{ src = "$pageRoot\ResetPasswordPage.jsx"; dest = "$pageRoot\auth\ResetPasswordPage.jsx" }
    @{ src = "$pageRoot\TemplatesDemo.jsx"; dest = "$pageRoot\demo\TemplatesDemo.jsx" }
)

$pagesMoved = 0
foreach ($movement in $pageMovements) {
    if (Test-Path $movement.src) {
        Move-Item -Path $movement.src -Destination $movement.dest -Force
        Write-Host "OK $($movement.src | Split-Path -Leaf) -> auth/genetics/demo/"
        $pagesMoved++
    } else {
        Write-Host "MANQUANT: $($movement.src)"
    }
}

# Move remaining COMPONENTS (17 files)
$componentMovements = @(
    @{ src = "$componentRoot\CategoryRatingSummary.jsx"; dest = "$componentRoot\sections\CategoryRatingSummary.jsx" }
    @{ src = "$componentRoot\CompletionBar.jsx"; dest = "$componentRoot\sections\CompletionBar.jsx" }
    @{ src = "$componentRoot\ConfirmDialog.jsx"; dest = "$componentRoot\modals\ConfirmDialog.jsx" }
    @{ src = "$componentRoot\EffectSelector.jsx"; dest = "$componentRoot\selectors\EffectSelector.jsx" }
    @{ src = "$componentRoot\FilterBar.jsx"; dest = "$componentRoot\gallery\FilterBar.jsx" }
    @{ src = "$componentRoot\GlobalRating.jsx"; dest = "$componentRoot\sections\GlobalRating.jsx" }
    @{ src = "$componentRoot\HomeReviewCard.jsx"; dest = "$componentRoot\review\HomeReviewCard.jsx" }
    @{ src = "$componentRoot\LoadingSpinner.jsx"; dest = "$componentRoot\feedback\LoadingSpinner.jsx" }
    @{ src = "$componentRoot\MobilePhotoGallery.jsx"; dest = "$componentRoot\review\MobilePhotoGallery.jsx" }
    @{ src = "$componentRoot\PipelineStepModal.jsx"; dest = "$componentRoot\modals\PipelineStepModal.jsx" }
    @{ src = "$componentRoot\QuickSelectModal.jsx"; dest = "$componentRoot\selectors\QuickSelectModal.jsx" }
    @{ src = "$componentRoot\ResponsiveCreateReviewLayout.jsx"; dest = "$componentRoot\shared\ResponsiveCreateReviewLayout.jsx" }
    @{ src = "$componentRoot\ResponsiveFormComponents.jsx"; dest = "$componentRoot\shared\ResponsiveFormComponents.jsx" }
    @{ src = "$componentRoot\ReviewFullDisplay.jsx"; dest = "$componentRoot\review\ReviewFullDisplay.jsx" }
    @{ src = "$componentRoot\ReviewPreview.jsx"; dest = "$componentRoot\review\ReviewPreview.jsx" }
    @{ src = "$componentRoot\SectionNavigator.jsx"; dest = "$componentRoot\shared\SectionNavigator.jsx" }
    @{ src = "$componentRoot\WheelSelector.jsx"; dest = "$componentRoot\selectors\WheelSelector.jsx" }
)

$componentsMoved = 0
foreach ($movement in $componentMovements) {
    if (Test-Path $movement.src) {
        Move-Item -Path $movement.src -Destination $movement.dest -Force
        Write-Host "OK $($movement.src | Split-Path -Leaf) -> components/..."
        $componentsMoved++
    } else {
        Write-Host "MANQUANT: $($movement.src)"
    }
}

Write-Host "`nRESULTATS:"
Write-Host "Pages deplacees: $pagesMoved/8"
Write-Host "Composants deplaces: $componentsMoved/17"
Write-Host "`nRestructuration COMPLETE!"
