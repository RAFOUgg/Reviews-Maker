#!/usr/bin/env pwsh
# Correction automatique de tous les imports
# Après réorganisation des composants et pages

$projectRoot = "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src"
$filesModified = 0

$replacements = @{
    # Liquid Components
    "from './components/LiquidAlert'" = "from '@/components/liquid/LiquidAlert'"
    'from "./components/LiquidAlert"' = 'from "@/components/liquid/LiquidAlert"'
    "from './components/LiquidBadge'" = "from '@/components/liquid/LiquidBadge'"
    'from "./components/LiquidBadge"' = 'from "@/components/liquid/LiquidBadge"'
    "from './components/LiquidButton'" = "from '@/components/liquid/LiquidButton'"
    'from "./components/LiquidButton"' = 'from "@/components/liquid/LiquidButton"'
    "from './components/LiquidCard'" = "from '@/components/liquid/LiquidCard'"
    'from "./components/LiquidCard"' = 'from "@/components/liquid/LiquidCard"'
    "from './components/LiquidInput'" = "from '@/components/liquid/LiquidInput'"
    'from "./components/LiquidInput"' = 'from "@/components/liquid/LiquidInput"'
    "from './components/LiquidModal'" = "from '@/components/liquid/LiquidModal'"
    'from "./components/LiquidModal"' = 'from "@/components/liquid/LiquidModal"'
    "from './components/LiquidMultiSelect'" = "from '@/components/liquid/LiquidMultiSelect'"
    'from "./components/LiquidMultiSelect"' = 'from "@/components/liquid/LiquidMultiSelect"'
    "from './components/LiquidSelect'" = "from '@/components/liquid/LiquidSelect'"
    'from "./components/LiquidSelect"' = 'from "@/components/liquid/LiquidSelect"'
    "from './components/LiquidSlider'" = "from '@/components/liquid/LiquidSlider'"
    'from "./components/LiquidSlider"' = 'from "@/components/liquid/LiquidSlider"'
    
    # Button & UI
    "from './components/Button'" = "from '@/components/ui/Button'"
    'from "./components/Button"' = 'from "@/components/ui/Button"'
    "from './components/Layout'" = "from '@/components/shared/Layout'"
    'from "./components/Layout"' = 'from "@/components/shared/Layout"'
    
    # Auth
    "from './components/AuthCallback'" = "from '@/components/auth/AuthCallback'"
    'from "./components/AuthCallback"' = 'from "@/components/auth/AuthCallback"'
    
    # Legal
    "from './components/legal/RDRBanner'" = "from '@/components/legal/RDRBanner'"
    'from "./components/legal/RDRBanner"' = 'from "@/components/legal/RDRBanner"'
    "from './components/legal/AgeVerification'" = "from '@/components/legal/AgeVerification'"
    'from "./components/legal/AgeVerification"' = 'from "@/components/legal/AgeVerification"'
    "from './components/legal/ConsentModal'" = "from '@/components/legal/ConsentModal'"
    'from "./components/legal/ConsentModal"' = 'from "@/components/legal/ConsentModal"'
    "from './components/legal/DisclaimerRDRModal'" = "from '@/components/legal/DisclaimerRDRModal'"
    'from "./components/legal/DisclaimerRDRModal"' = 'from "@/components/legal/DisclaimerRDRModal"'
    "from './components/legal/DisclaimerRDR'" = "from '@/components/legal/DisclaimerRDR'"
    'from "./components/legal/DisclaimerRDR"' = 'from "@/components/legal/DisclaimerRDR"'
    "from './components/LegalConsentGate'" = "from '@/components/legal/LegalConsentGate'"
    'from "./components/LegalConsentGate"' = 'from "@/components/legal/LegalConsentGate"'
    
    # Account
    "from './components/account/AccountSelector'" = "from '@/components/account/AccountSelector'"
    'from "./components/account/AccountSelector"' = 'from "@/components/account/AccountSelector"'
    
    # Feedback
    "from './components/ToastContainer'" = "from '@/components/feedback/ToastContainer'"
    'from "./components/ToastContainer"' = 'from "@/components/feedback/ToastContainer"'
    "from './components/ErrorBoundary'" = "from '@/components/errors/ErrorBoundary'"
    'from "./components/ErrorBoundary"' = 'from "@/components/errors/ErrorBoundary"'
    
    # PAGES
    "from './pages/HomePage'" = "from '@/pages/home/HomePage'"
    'from "./pages/HomePage"' = 'from "@/pages/home/HomePage"'
    "from './pages/LoginPage'" = "from '@/pages/auth/LoginPage'"
    'from "./pages/LoginPage"' = 'from "@/pages/auth/LoginPage"'
    "from './pages/RegisterPage'" = "from '@/pages/auth/RegisterPage'"
    'from "./pages/RegisterPage"' = 'from "@/pages/auth/RegisterPage"'
    "from './pages/ForgotPasswordPage'" = "from '@/pages/auth/ForgotPasswordPage'"
    'from "./pages/ForgotPasswordPage"' = 'from "@/pages/auth/ForgotPasswordPage"'
    "from './pages/ResetPasswordPage'" = "from '@/pages/auth/ResetPasswordPage'"
    'from "./pages/ResetPasswordPage"' = 'from "@/pages/auth/ResetPasswordPage"'
    "from './pages/EmailVerificationPage'" = "from '@/pages/auth/EmailVerificationPage'"
    'from "./pages/EmailVerificationPage"' = 'from "@/pages/auth/EmailVerificationPage"'
    "from './pages/AgeVerificationPage'" = "from '@/pages/auth/AgeVerificationPage'"
    'from "./pages/AgeVerificationPage"' = 'from "@/pages/auth/AgeVerificationPage"'
    "from './pages/ReviewDetailPage'" = "from '@/pages/reviews/ReviewDetailPage'"
    'from "./pages/ReviewDetailPage"' = 'from "@/pages/reviews/ReviewDetailPage"'
    "from './pages/CreateReviewPage'" = "from '@/pages/reviews/CreateReviewPage'"
    'from "./pages/CreateReviewPage"' = 'from "@/pages/reviews/CreateReviewPage"'
    "from './pages/EditReviewPage'" = "from '@/pages/reviews/EditReviewPage'"
    'from "./pages/EditReviewPage"' = 'from "@/pages/reviews/EditReviewPage"'
    "from './pages/CreateFlowerReview'" = "from '@/pages/reviews/CreateFlowerReview'"
    'from "./pages/CreateFlowerReview"' = 'from "@/pages/reviews/CreateFlowerReview"'
    "from './pages/CreateHashReview'" = "from '@/pages/reviews/CreateHashReview'"
    'from "./pages/CreateHashReview"' = 'from "@/pages/reviews/CreateHashReview"'
    "from './pages/CreateConcentrateReview'" = "from '@/pages/reviews/CreateConcentrateReview'"
    'from "./pages/CreateConcentrateReview"' = 'from "@/pages/reviews/CreateConcentrateReview"'
    "from './pages/CreateEdibleReview'" = "from '@/pages/reviews/CreateEdibleReview'"
    'from "./pages/CreateEdibleReview"' = 'from "@/pages/reviews/CreateEdibleReview"'
    "from './pages/LibraryPage'" = "from '@/pages/library/LibraryPage'"
    'from "./pages/LibraryPage"' = 'from "@/pages/library/LibraryPage"'
    "from './pages/GalleryPage'" = "from '@/pages/gallery/GalleryPage'"
    'from "./pages/GalleryPage"' = 'from "@/pages/gallery/GalleryPage"'
    "from './pages/StatsPage'" = "from '@/pages/account/StatsPage'"
    'from "./pages/StatsPage"' = 'from "@/pages/account/StatsPage"'
    "from './pages/SettingsPage'" = "from '@/pages/account/SettingsPage'"
    'from "./pages/SettingsPage"' = 'from "@/pages/account/SettingsPage"'
    "from './pages/ProfilePage'" = "from '@/pages/account/ProfilePage'"
    'from "./pages/ProfilePage"' = 'from "@/pages/account/ProfilePage"'
    "from './pages/ProfileSettingsPage'" = "from '@/pages/account/ProfileSettingsPage'"
    'from "./pages/ProfileSettingsPage"' = 'from "@/pages/account/ProfileSettingsPage"'
    "from './pages/AccountSetupPage'" = "from '@/pages/account/AccountSetupPage'"
    'from "./pages/AccountSetupPage"' = 'from "@/pages/account/AccountSetupPage"'
    "from './pages/AccountChoicePage'" = "from '@/pages/account/AccountChoicePage'"
    'from "./pages/AccountChoicePage"' = 'from "@/pages/account/AccountChoicePage"'
    "from './pages/PaymentPage'" = "from '@/pages/account/PaymentPage'"
    'from "./pages/PaymentPage"' = 'from "@/pages/account/PaymentPage"'
    "from './pages/PreferencesPage'" = "from '@/pages/account/PreferencesPage'"
    'from "./pages/PreferencesPage"' = 'from "@/pages/account/PreferencesPage"'
    "from './pages/GeneticsManagementPage'" = "from '@/pages/genetics/GeneticsManagementPage'"
    'from "./pages/GeneticsManagementPage"' = 'from "@/pages/genetics/GeneticsManagementPage"'
    "from './pages/PhenoHuntPage'" = "from '@/pages/genetics/PhenoHuntPage'"
    'from "./pages/PhenoHuntPage"' = 'from "@/pages/genetics/PhenoHuntPage"'
}

Write-Host "🔧 Correction des imports..." -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem -Path $projectRoot -Include "*.jsx", "*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $content = $content -replace [regex]::Escape($old), $new
    }
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -Encoding UTF8
        $filesModified++
        Write-Host "✅ $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ FAIT - $filesModified fichiers modifiés" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
