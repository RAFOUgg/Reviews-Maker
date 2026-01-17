# Script to find and restore all corrupted JS/JSX files
$corruptedFiles = @()
$restoredFiles = @()
$manualFiles = @()

cd "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker"

# Mapping of current paths to old paths (before the reorganization in commit 1f83efb)
$pathMappings = @{
    # Account pages
    'client/src/pages/account/SettingsPage.jsx' = 'client/src/pages/SettingsPage.jsx'
    'client/src/pages/account/ProfilePage.jsx' = 'client/src/pages/ProfilePage.jsx'
    'client/src/pages/account/AccountChoicePage.jsx' = 'client/src/pages/AccountChoicePage.jsx'
    'client/src/pages/account/AccountSetupPage.jsx' = 'client/src/pages/AccountSetupPage.jsx'
    'client/src/pages/account/PaymentPage.jsx' = 'client/src/pages/PaymentPage.jsx'
    'client/src/pages/account/PreferencesPage.jsx' = 'client/src/pages/PreferencesPage.jsx'
    'client/src/pages/account/ProfileSettingsPage.jsx' = 'client/src/pages/ProfileSettingsPage.jsx'
    'client/src/pages/account/StatsPage.jsx' = 'client/src/pages/StatsPage.jsx'
    # Auth pages
    'client/src/pages/auth/AgeVerificationPage.jsx' = 'client/src/pages/AgeVerificationPage.jsx'
    'client/src/pages/auth/EmailVerificationPage.jsx' = 'client/src/pages/EmailVerificationPage.jsx'
    'client/src/pages/auth/ForgotPasswordPage.jsx' = 'client/src/pages/ForgotPasswordPage.jsx'
    'client/src/pages/auth/LoginPage.jsx' = 'client/src/pages/LoginPage.jsx'
    'client/src/pages/auth/RegisterPage.jsx' = 'client/src/pages/RegisterPage.jsx'
    'client/src/pages/auth/ResetPasswordPage.jsx' = 'client/src/pages/ResetPasswordPage.jsx'
    # Review pages
    'client/src/pages/reviews/CreateReviewPage.jsx' = 'client/src/pages/CreateReviewPage.jsx'
    'client/src/pages/reviews/EditReviewPage.jsx' = 'client/src/pages/EditReviewPage.jsx'
    'client/src/pages/reviews/ReviewDetailPage.jsx' = 'client/src/pages/ReviewDetailPage.jsx'
    # Gallery
    'client/src/pages/gallery/GalleryPage.jsx' = 'client/src/pages/GalleryPage.jsx'
    # Genetics/Phenohunt
    'client/src/pages/genetics/PhenoHuntPage.jsx' = 'client/src/pages/PhenoHuntPage.jsx'
    # Home
    'client/src/pages/home/HomePage.jsx' = 'client/src/pages/HomePage.jsx'
    # Library
    'client/src/pages/library/LibraryPage.jsx' = 'client/src/pages/LibraryPage.jsx'
    # Create Review pages
    'client/src/pages/CreateConcentrateReview/index.jsx' = 'client/src/pages/CreateConcentrateReview/index.jsx'
    'client/src/pages/CreateEdibleReview/index.jsx' = 'client/src/pages/CreateEdibleReview/index.jsx'
    'client/src/pages/CreateFlowerReview/index.jsx' = 'client/src/pages/CreateFlowerReview/index.jsx'
    'client/src/pages/CreateHashReview/index.jsx' = 'client/src/pages/CreateHashReview/index.jsx'
}

$maxIterations = 50
$iteration = 0

while ($iteration -lt $maxIterations) {
    $iteration++
    Write-Host "`n=== Iteration $iteration ===" -ForegroundColor Cyan
    
    # Run build and capture output
    $buildOutput = (npm run build 2>&1) | Out-String
    
    # Check if build succeeded
    if ($buildOutput -match 'built in') {
        Write-Host "✓ Build succeeded!" -ForegroundColor Green
        break
    }
    
    # Extract the corrupted file path from error
    if ($buildOutput -match '([C:][^:]*\.jsx?):\d+:0: ERROR:') {
        $filePathMatch = [regex]::Match($buildOutput, '([C:][^:]*\.jsx?):\d+:0: ERROR:')
        if ($filePathMatch.Success) {
            $filePath = $filePathMatch.Groups[1].Value
            $relPath = $filePath -replace 'C:/Users/Rafi/Documents/.0AMes-Logiciel/Reviews-Maker/', '' -replace '/', '\'
            
            Write-Host "Found corrupted file: $relPath" -ForegroundColor Yellow
            $corruptedFiles += $relPath
            
            # Try to find and restore from git
            $oldPath = $pathMappings[$relPath]
            if (-not $oldPath) {
                # Try to infer the old path
                $oldPath = $relPath -replace '([^\\]*)\\index\.jsx', '$1/index.jsx' `
                                   -replace 'pages\\(account|auth|reviews|gallery|library|genetics|home)\\', 'pages/' `
                                   -replace '\\', '/'
            }
            
            Write-Host "Attempting restore from: $oldPath" -ForegroundColor Gray
            
            $result = & git show "1f83efb~1:$oldPath" 2>&1
            if ($LASTEXITCODE -eq 0) {
                $result | Out-File $filePath -Encoding UTF8
                Write-Host "✓ Restored successfully" -ForegroundColor Green
                $restoredFiles += $relPath
            } else {
                Write-Host "✗ Git restore failed" -ForegroundColor Red
                $manualFiles += $relPath
            }
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Total iterations: $iteration"
Write-Host "Corrupted files found: $($corruptedFiles.Count)" -ForegroundColor Yellow
Write-Host "Successfully restored: $($restoredFiles.Count)" -ForegroundColor Green
if ($restoredFiles.Count -gt 0) {
    $restoredFiles | ForEach-Object { Write-Host "  ✓ $_" -ForegroundColor Green }
}

if ($manualFiles.Count -gt 0) {
    Write-Host "Files needing manual fix: $($manualFiles.Count)" -ForegroundColor Red
    $manualFiles | ForEach-Object { Write-Host "  ✗ $_" -ForegroundColor Red }
}

Write-Host "`nDone!" -ForegroundColor Cyan
