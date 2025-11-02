<#
.SYNOPSIS
Tests complets du serveur Reviews-Maker v2.0

.DESCRIPTION
Script PowerShell pour tester tous les endpoints de l'API après migration

.EXAMPLE
.\test_server_v2.ps1
.\test_server_v2.ps1 -BaseUrl "http://localhost:3001"
#>

param(
    [string]$BaseUrl = "http://localhost:3000",
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Couleurs
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Failure { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }

Write-Host "=" * 60 -ForegroundColor Blue
Write-Host "🧪 Tests Reviews-Maker Server v2.0" -ForegroundColor Blue
Write-Host "=" * 60 -ForegroundColor Blue
Write-Host "🌐 Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host ""

$TotalTests = 0
$PassedTests = 0
$FailedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Path,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    $global:TotalTests++
    
    try {
        $Uri = "$BaseUrl$Path"
        $Params = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $Params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        if ($Verbose) {
            Write-Info "Testing: $Method $Path"
        }
        
        $Response = Invoke-WebRequest @Params -UseBasicParsing
        
        if ($Response.StatusCode -eq $ExpectedStatus) {
            Write-Success "$Name"
            $global:PassedTests++
            return $true
        } else {
            Write-Failure "$Name (Status: $($Response.StatusCode), Expected: $ExpectedStatus)"
            $global:FailedTests++
            return $false
        }
    }
    catch {
        $StatusCode = $_.Exception.Response.StatusCode.value__
        if ($StatusCode -eq $ExpectedStatus) {
            Write-Success "$Name"
            $global:PassedTests++
            return $true
        } else {
            Write-Failure "$Name - $($_.Exception.Message)"
            if ($Verbose) {
                Write-Host $_.Exception -ForegroundColor Red
            }
            $global:FailedTests++
            return $false
        }
    }
}

# ========================================
# TEST 1: Health Check
# ========================================

Write-Host "`n📋 Test 1: Health Check" -ForegroundColor Yellow
Test-Endpoint -Name "Health check (with debug key)" `
              -Method "GET" `
              -Path "/api/admin/health?key=dev" `
              -ExpectedStatus 200

# ========================================
# TEST 2: Public Endpoints
# ========================================

Write-Host "`n📋 Test 2: Public Endpoints" -ForegroundColor Yellow
Test-Endpoint -Name "GET /api/reviews (liste publique)" `
              -Method "GET" `
              -Path "/api/reviews"

Test-Endpoint -Name "GET /api/public/reviews" `
              -Method "GET" `
              -Path "/api/public/reviews"

# ========================================
# TEST 3: Reviews CRUD
# ========================================

Write-Host "`n📋 Test 3: Reviews CRUD" -ForegroundColor Yellow

# POST sans auth (devrait échouer)
Test-Endpoint -Name "POST /api/reviews (sans auth - devrait échouer)" `
              -Method "POST" `
              -Path "/api/reviews" `
              -Body @{ 
                  holderName = "Test Holder"
                  productType = "Concentré"
                  overallRating = 8
                  reviewText = "Test review"
              } `
              -ExpectedStatus 401

# GET review inexistante
Test-Endpoint -Name "GET /api/reviews/99999 (inexistante)" `
              -Method "GET" `
              -Path "/api/reviews/99999" `
              -ExpectedStatus 404

# ========================================
# TEST 4: Authentication Flow
# ========================================

Write-Host "`n📋 Test 4: Authentication Flow" -ForegroundColor Yellow

# Send code avec email invalide
Test-Endpoint -Name "POST /api/auth/send-code (email invalide)" `
              -Method "POST" `
              -Path "/api/auth/send-code" `
              -Body @{ email = "invalid-email" } `
              -ExpectedStatus 400

# Send code avec email valide mais non existant
Test-Endpoint -Name "POST /api/auth/send-code (email inexistant)" `
              -Method "POST" `
              -Path "/api/auth/send-code" `
              -Body @{ email = "nonexistent@example.com" } `
              -ExpectedStatus 404

# Verify code sans données
Test-Endpoint -Name "POST /api/auth/verify-code (sans email)" `
              -Method "POST" `
              -Path "/api/auth/verify-code" `
              -Body @{ code = "123456" } `
              -ExpectedStatus 400

# GET /auth/me sans auth
Test-Endpoint -Name "GET /api/auth/me (sans auth)" `
              -Method "GET" `
              -Path "/api/auth/me" `
              -ExpectedStatus 401

# ========================================
# TEST 5: Votes
# ========================================

Write-Host "`n📋 Test 5: Votes System" -ForegroundColor Yellow

# GET votes pour review inexistante (devrait retourner 0 votes)
Test-Endpoint -Name "GET /api/votes/99999" `
              -Method "GET" `
              -Path "/api/votes/99999"

# POST vote sans auth
Test-Endpoint -Name "POST /api/votes/1 (sans auth)" `
              -Method "POST" `
              -Path "/api/votes/1" `
              -Body @{ vote = 1 } `
              -ExpectedStatus 401

# POST vote invalide (devrait échouer même avec auth)
Test-Endpoint -Name "POST /api/votes/1 (vote invalide)" `
              -Method "POST" `
              -Path "/api/votes/1" `
              -Body @{ vote = 5 } `
              -ExpectedStatus 401  # Échouera sur auth d'abord

# ========================================
# TEST 6: Admin Endpoints (sans auth)
# ========================================

Write-Host "`n📋 Test 6: Admin Endpoints (sans auth)" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/admin/stats (sans auth)" `
              -Method "GET" `
              -Path "/api/admin/stats" `
              -ExpectedStatus 403

Test-Endpoint -Name "GET /api/admin/leaderboard (sans auth)" `
              -Method "GET" `
              -Path "/api/admin/leaderboard" `
              -ExpectedStatus 403

Test-Endpoint -Name "GET /api/admin/tokens (sans auth)" `
              -Method "GET" `
              -Path "/api/admin/tokens" `
              -ExpectedStatus 403

# ========================================
# TEST 7: Validation
# ========================================

Write-Host "`n📋 Test 7: Input Validation" -ForegroundColor Yellow

# ID invalide
Test-Endpoint -Name "GET /api/reviews/abc (ID invalide)" `
              -Method "GET" `
              -Path "/api/reviews/abc" `
              -ExpectedStatus 400

# ID négatif
Test-Endpoint -Name "GET /api/reviews/-1 (ID négatif)" `
              -Method "GET" `
              -Path "/api/reviews/-1" `
              -ExpectedStatus 400

# Vote invalide structure
Test-Endpoint -Name "GET /api/votes/abc (ID invalide)" `
              -Method "GET" `
              -Path "/api/votes/abc" `
              -ExpectedStatus 400

# ========================================
# TEST 8: Upload
# ========================================

Write-Host "`n📋 Test 8: Upload" -ForegroundColor Yellow

# Upload sans fichier
try {
    $Response = Invoke-WebRequest -Uri "$BaseUrl/api/upload" `
                                  -Method POST `
                                  -UseBasicParsing
    Write-Failure "POST /api/upload (sans fichier) - devrait échouer"
    $global:FailedTests++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Success "POST /api/upload (sans fichier) - erreur attendue"
        $global:PassedTests++
    } else {
        Write-Failure "POST /api/upload (sans fichier) - mauvais code erreur"
        $global:FailedTests++
    }
}
$global:TotalTests++

# ========================================
# TEST 9: Error Handling
# ========================================

Write-Host "`n📋 Test 9: Error Handling" -ForegroundColor Yellow

# Endpoint inexistant
Test-Endpoint -Name "GET /api/nonexistent (404)" `
              -Method "GET" `
              -Path "/api/nonexistent" `
              -ExpectedStatus 404

# Méthode non supportée
Test-Endpoint -Name "PATCH /api/reviews (méthode non supportée)" `
              -Method "PATCH" `
              -Path "/api/reviews" `
              -ExpectedStatus 404

# ========================================
# TEST 10: Path Rewriting
# ========================================

Write-Host "`n📋 Test 10: Path Rewriting (/reviews/api/*)" -ForegroundColor Yellow

Test-Endpoint -Name "GET /reviews/api/reviews (path rewriting)" `
              -Method "GET" `
              -Path "/reviews/api/reviews"

# ========================================
# RÉSULTATS
# ========================================

Write-Host "`n" + ("=" * 60) -ForegroundColor Blue
Write-Host "📊 RÉSULTATS DES TESTS" -ForegroundColor Blue
Write-Host ("=" * 60) -ForegroundColor Blue

Write-Host "`n📈 Total de tests: $TotalTests"
Write-Success "Tests réussis: $PassedTests"
if ($FailedTests -gt 0) {
    Write-Failure "Tests échoués: $FailedTests"
}

$SuccessRate = [math]::Round(($PassedTests / $TotalTests) * 100, 2)
Write-Host "`n🎯 Taux de réussite: $SuccessRate%" -ForegroundColor $(if ($SuccessRate -ge 90) { "Green" } elseif ($SuccessRate -ge 70) { "Yellow" } else { "Red" })

if ($FailedTests -eq 0) {
    Write-Host "`n✨ Tous les tests sont passés! Le serveur est prêt." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Certains tests ont échoué. Vérifiez les logs." -ForegroundColor Red
    Write-Host "💡 Consultez 'pm2 logs reviews-maker' pour plus de détails" -ForegroundColor Gray
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Blue

exit $(if ($FailedTests -eq 0) { 0 } else { 1 })
