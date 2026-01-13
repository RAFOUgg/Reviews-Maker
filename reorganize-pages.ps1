#!/usr/bin/env pwsh

$pages = "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src\pages"
cd $pages

Write-Host "🚀 Organizing Pages..." -ForegroundColor Cyan

# Auth pages
$auth = @('LoginPage','RegisterPage','ForgotPasswordPage','ResetPasswordPage','EmailVerificationPage','AgeVerificationPage')
foreach ($f in $auth) {
    Move-Item "$f.jsx" "auth/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ auth/$f.jsx" }
}

# Review pages
$reviews = @('CreateReviewPage','EditReviewPage','ReviewDetailPage')
foreach ($f in $reviews) {
    Move-Item "$f.jsx" "reviews/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ reviews/$f.jsx" }
}

# Gallery
Move-Item "GalleryPage.jsx" "gallery/" -Force -ErrorAction SilentlyContinue
if ($?) { Write-Host "  ✅ gallery/GalleryPage.jsx" }

# Library
Move-Item "LibraryPage.jsx" "library/" -Force -ErrorAction SilentlyContinue
if ($?) { Write-Host "  ✅ library/LibraryPage.jsx" }

# Genetics
$gen = @('GeneticsManagementPage','PhenoHuntPage')
foreach ($f in $gen) {
    Move-Item "$f.jsx" "genetics/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ genetics/$f.jsx" }
}

# Account
$acc = @('ProfilePage','ProfileSettingsPage','SettingsPage','PreferencesPage','StatsPage','AccountChoicePage','AccountSetupPage','PaymentPage')
foreach ($f in $acc) {
    Move-Item "$f.jsx" "account/" -Force -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  ✅ account/$f.jsx" }
}

# Home
Move-Item "HomePage.jsx" "home/" -Force -ErrorAction SilentlyContinue
if ($?) { Write-Host "  ✅ home/HomePage.jsx" }

Write-Host "`n✅ Pages reorganized!" -ForegroundColor Green
Write-Host "Files remaining at root:" -ForegroundColor Yellow
Get-ChildItem "*.jsx" -ErrorAction SilentlyContinue | Select-Object Name | ForEach-Object { Write-Host "  $_" }
