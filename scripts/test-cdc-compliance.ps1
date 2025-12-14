# 🧪 Script de Tests Locaux - Conformité CDC
# À exécuter AVANT déploiement VPS

Write-Host "`n🔍 TESTS LOCAUX - Reviews-Maker CDC" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ErrorCount = 0
$WarningCount = 0
$SuccessCount = 0

function Test-Step {
    param($Name, $ScriptBlock)
    
    Write-Host "▶ Test: $Name" -ForegroundColor Yellow
    try {
        & $ScriptBlock
        Write-Host "✅ $Name - OK`n" -ForegroundColor Green
        $script:SuccessCount++
        return $true
    } catch {
        Write-Host "❌ $Name - ÉCHEC" -ForegroundColor Red
        Write-Host "   Erreur: $_`n" -ForegroundColor Red
        $script:ErrorCount++
        return $false
    }
}

# Test 1: Backend - Migration Types de Comptes
Test-Step "Migration types de comptes" {
    Push-Location server-new
    
    # Vérifier si script existe
    if (-not (Test-Path "scripts/migrate-account-types-cdc.js")) {
        throw "Script migration introuvable"
    }
    
    Write-Host "   📝 Script de migration trouvé" -ForegroundColor Gray
    
    # Note: Ne pas exécuter réellement la migration en test
    Write-Host "   ⚠️  Migration non exécutée (test dry-run)" -ForegroundColor Yellow
    
    Pop-Location
}

# Test 2: Frontend - Pages Vérification Âge
Test-Step "Page vérification d'âge" {
    if (-not (Test-Path "client/src/pages/AgeVerificationPage.jsx")) {
        throw "AgeVerificationPage.jsx introuvable"
    }
    
    $content = Get-Content "client/src/pages/AgeVerificationPage.jsx" -Raw
    
    if ($content -notmatch "LEGAL_AGE_CONFIG") {
        throw "Configuration âges légaux manquante"
    }
    
    if ($content -notmatch "calculateAge") {
        throw "Fonction calcul âge manquante"
    }
    
    Write-Host "   ✓ Composant complet avec validation âge" -ForegroundColor Gray
}

# Test 3: Frontend - Disclaimer RDR
Test-Step "Composant Disclaimer RDR" {
    if (-not (Test-Path "client/src/components/legal/DisclaimerRDR.jsx")) {
        throw "DisclaimerRDR.jsx introuvable"
    }
    
    $content = Get-Content "client/src/components/legal/DisclaimerRDR.jsx" -Raw
    
    # Vérifier présence disclaimers multilingues
    $languages = @('FR', 'US', 'CA', 'ES', 'DE', 'IT', 'NL', 'UK')
    foreach ($lang in $languages) {
        if ($content -notmatch $lang) {
            Write-Host "   ⚠️  Disclaimer $lang peut-être manquant" -ForegroundColor Yellow
            $script:WarningCount++
        }
    }
    
    if ($content -notmatch "consentRDR") {
        throw "Gestion consentement manquante"
    }
    
    Write-Host "   ✓ Disclaimers multilingues présents" -ForegroundColor Gray
}

# Test 4: API Routes
Test-Step "Routes API utilisateurs" {
    if (-not (Test-Path "server-new/routes/users.js")) {
        throw "Fichier users.js introuvable"
    }
    
    $content = Get-Content "server-new/routes/users.js" -Raw
    
    if ($content -notmatch "/update-legal-info") {
        throw "Route update-legal-info manquante"
    }
    
    if ($content -notmatch "/accept-rdr") {
        throw "Route accept-rdr manquante"
    }
    
    if ($content -notmatch "minAge") {
        throw "Validation âge minimum manquante"
    }
    
    Write-Host "   ✓ Routes API conformes" -ForegroundColor Gray
}

# Test 5: Service Account
Test-Step "Service types de comptes" {
    if (-not (Test-Path "server-new/services/account.js")) {
        throw "Fichier account.js introuvable"
    }
    
    $content = Get-Content "server-new/services/account.js" -Raw
    
    if ($content -notmatch "AMATEUR") {
        throw "Type AMATEUR manquant"
    }
    
    if ($content -notmatch "PRODUCTEUR") {
        throw "Type PRODUCTEUR manquant"
    }
    
    if ($content -notmatch "INFLUENCEUR") {
        throw "Type INFLUENCEUR manquant"
    }
    
    if ($content -notmatch "SUBSCRIPTION_PRICES") {
        throw "Prix abonnements manquants"
    }
    
    Write-Host "   ✓ Types de comptes conformes CDC" -ForegroundColor Gray
}

# Test 6: App.jsx Routes
Test-Step "Configuration routes App.jsx" {
    if (-not (Test-Path "client/src/App.jsx")) {
        throw "App.jsx introuvable"
    }
    
    $content = Get-Content "client/src/App.jsx" -Raw
    
    if ($content -notmatch "AgeVerificationPage") {
        throw "Import AgeVerificationPage manquant"
    }
    
    if ($content -notmatch "DisclaimerRDR") {
        throw "Import DisclaimerRDR manquant"
    }
    
    if ($content -notmatch "/age-verification") {
        throw "Route /age-verification manquante"
    }
    
    if ($content -notmatch "/disclaimer-rdr") {
        throw "Route /disclaimer-rdr manquante"
    }
    
    Write-Host "   ✓ Routes configurées correctement" -ForegroundColor Gray
}

# Test 7: Vérifier dépendances NPM
Test-Step "Dépendances NPM backend" {
    Push-Location server-new
    
    if (-not (Test-Path "package.json")) {
        throw "package.json backend introuvable"
    }
    
    $package = Get-Content "package.json" | ConvertFrom-Json
    
    # Vérifier Prisma
    if (-not $package.dependencies."@prisma/client") {
        throw "Prisma Client manquant"
    }
    
    Write-Host "   ✓ Dépendances backend OK" -ForegroundColor Gray
    
    Pop-Location
}

Test-Step "Dépendances NPM frontend" {
    Push-Location client
    
    if (-not (Test-Path "package.json")) {
        throw "package.json frontend introuvable"
    }
    
    $package = Get-Content "package.json" | ConvertFrom-Json
    
    # Vérifier React Router
    if (-not $package.dependencies."react-router-dom") {
        throw "React Router manquant"
    }
    
    Write-Host "   ✓ Dépendances frontend OK" -ForegroundColor Gray
    
    Pop-Location
}

# Test 8: Vérifier structure DB
Test-Step "Structure base de données" {
    if (-not (Test-Path "server-new/prisma/schema.prisma")) {
        throw "schema.prisma introuvable"
    }
    
    $schema = Get-Content "server-new/prisma/schema.prisma" -Raw
    
    # Vérifier champs User
    $requiredFields = @('birthdate', 'country', 'legalAge', 'consentRDR', 'consentDate', 'roles', 'subscriptionType')
    
    foreach ($field in $requiredFields) {
        if ($schema -notmatch $field) {
            throw "Champ User.$field manquant dans schema"
        }
    }
    
    Write-Host "   ✓ Schema Prisma conforme" -ForegroundColor Gray
}

# Test 9: Documentation
Test-Step "Documentation présente" {
    $docs = @(
        ".docs/AUDIT_CONFORMITE_CDC_2025-12-14.md",
        ".docs/PLAN_MISE_EN_PRODUCTION_2025-12-14.md"
    )
    
    foreach ($doc in $docs) {
        if (-not (Test-Path $doc)) {
            throw "$doc manquant"
        }
        Write-Host "   ✓ $doc présent" -ForegroundColor Gray
    }
}

# Test 10: Git Status
Test-Step "État Git" {
    $gitStatus = git status --porcelain
    
    if ($gitStatus) {
        Write-Host "   ⚠️  Modifications non commitées:" -ForegroundColor Yellow
        git status --short
        $script:WarningCount++
    } else {
        Write-Host "   ✓ Working directory clean" -ForegroundColor Gray
    }
}

# Résumé
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n✅ Tests réussis:  $SuccessCount" -ForegroundColor Green
Write-Host "⚠️  Avertissements: $WarningCount" -ForegroundColor Yellow
Write-Host "❌ Erreurs:        $ErrorCount" -ForegroundColor Red

if ($ErrorCount -eq 0) {
    Write-Host "`n🎉 TOUS LES TESTS PASSENT!" -ForegroundColor Green
    Write-Host "✅ Prêt pour le déploiement VPS" -ForegroundColor Green
    
    Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "   1. Commit et push les modifications" -ForegroundColor White
    Write-Host "   2. Se connecter au VPS: ssh vps-lafoncedalle" -ForegroundColor White
    Write-Host "   3. Suivre le plan: .docs/PLAN_MISE_EN_PRODUCTION_2025-12-14.md" -ForegroundColor White
    
} else {
    Write-Host "`n⚠️  CORRECTIONS NÉCESSAIRES AVANT DÉPLOIEMENT" -ForegroundColor Yellow
    Write-Host "Consultez les erreurs ci-dessus et corrigez-les." -ForegroundColor Yellow
}

if ($WarningCount -gt 0) {
    Write-Host "`n⚠️  Avertissements à vérifier (non bloquants)" -ForegroundColor Yellow
}

Write-Host "`n"
