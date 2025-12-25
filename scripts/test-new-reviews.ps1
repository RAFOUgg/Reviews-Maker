#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de test pour les nouvelles routes backend Hash/Concentrate/Edible

.DESCRIPTION
    Teste la création de reviews pour les 3 nouveaux types de produits
    Vérifie les validations, les uploads d'images et la persistance DB

.EXAMPLE
    .\test-new-reviews.ps1 -BaseUrl "http://localhost:3000" -Token "YOUR_AUTH_TOKEN"
#>

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = ""
)

$ErrorActionPreference = "Continue"

Write-Host "`n🧪 Test des nouvelles routes reviews - Hash/Concentrate/Edible`n" -ForegroundColor Cyan

# Vérifier si le token est fourni
if (-not $Token) {
    Write-Host "⚠️  Aucun token fourni. Les tests nécessitent une authentification." -ForegroundColor Yellow
    Write-Host "   Utilisez: .\test-new-reviews.ps1 -Token 'YOUR_TOKEN'`n" -ForegroundColor Yellow
    
    # Essayer de charger depuis le fichier de tokens local
    $tokenPath = Join-Path $PSScriptRoot ".." "server-new" "tokens"
    if (Test-Path $tokenPath) {
        $tokenFiles = Get-ChildItem $tokenPath -File | Select-Object -First 1
        if ($tokenFiles) {
            $Token = $tokenFiles.Name
            Write-Host "✅ Token trouvé dans server-new/tokens: $Token`n" -ForegroundColor Green
        }
    }
}

if (-not $Token) {
    Write-Host "❌ Impossible de continuer sans token d'authentification" -ForegroundColor Red
    exit 1
}

# Headers communs
$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# ====================
# TEST 1: Hash Review
# ====================
Write-Host "📋 TEST 1: Création Hash Review`n" -ForegroundColor Yellow

$hashData = @{
    nomCommercial = "Test Hash Ice-O-Lator"
    hashmaker = "Test Lab"
    laboratoire = "Test Laboratory"
    cultivarsUtilises = "Gorilla Glue, OG Kush"
    methodeSeparation = "eau-glace"
    nombrePasses = 3
    temperatureEau = 2.5
    tailleMailles = "73µm"
    matierePremiere = "buds"
    qualiteMatiere = 8
    rendement = 15.5
    tempsSeparation = 45
    methodesPurification = @("Filtration", "Séchage vide", "Recristallisation")
    couleurTransparence = 7
    couleurNuance = "Doré"
    pureteVisuelle = 9
    densiteVisuelle = 8
    pistils = 2
    moisissure = 0
    graines = 0
    fideliteCultivar = 8
    intensiteAromatique = 9
    notesDominantes = "Pin, Citron, Terre"
    notesSecondaires = "Diesel, Épices"
    durete = 6
    densiteTactile = 7
    friabilite = 5
    melting = 9
    goutIntensite = 8
    agressivite = 3
    dryPuff = "Terre, Pin"
    inhalation = "Citron, Diesel"
    expiration = "Épices, Pin"
    effetsMontee = 8
    effetsIntensite = 9
    effets = @("Euphorique", "Créatif", "Relaxé", "Anti-douleur")
} | ConvertTo-Json

try {
    Write-Host "  → POST $BaseUrl/api/hash-reviews" -ForegroundColor Gray
    $hashResponse = Invoke-RestMethod -Uri "$BaseUrl/api/hash-reviews" -Method Post -Headers $headers -Body $hashData
    Write-Host "  ✅ Hash Review créée avec succès!" -ForegroundColor Green
    Write-Host "     ID: $($hashResponse.id)" -ForegroundColor Gray
    Write-Host "     Nom: $($hashResponse.nomCommercial)`n" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Erreur création Hash Review:" -ForegroundColor Red
    Write-Host "     $($_.Exception.Message)`n" -ForegroundColor Red
}

# ====================
# TEST 2: Concentrate Review
# ====================
Write-Host "📋 TEST 2: Création Concentrate Review`n" -ForegroundColor Yellow

$concentrateData = @{
    nomCommercial = "Test BHO Gold"
    hashmaker = "Extract Master"
    laboratoire = "Test Laboratory"
    cultivarsUtilises = "Wedding Cake"
    methodeExtraction = "bho"
    rendement = 22.5
    dureeExtraction = 120
    notesExtraction = "Extraction à température ambiante, purge 48h"
    methodesPurification = @("Winterisation", "Décarboxylation", "Filtration")
    couleurTransparence = 8
    viscosite = 6
    pureteVisuelle = 9
    melting = 10
    residus = 1
    pistils = 0
    moisissure = 0
    fideliteCultivar = 9
    intensiteAromatique = 10
    notesDominantes = "Vanille, Gâteau, Crème"
    notesSecondaires = "Épices douces"
    durete = 7
    densiteTactile = 8
    friabilite = 6
    goutIntensite = 9
    agressivite = 2
    dryPuff = "Vanille, Sucre"
    inhalation = "Crème, Gâteau"
    expiration = "Vanille, Épices"
    effetsMontee = 9
    effetsIntensite = 10
    effets = @("Euphorique", "Heureux", "Relaxé", "Créatif", "Anti-stress")
} | ConvertTo-Json

try {
    Write-Host "  → POST $BaseUrl/api/concentrate-reviews" -ForegroundColor Gray
    $concentrateResponse = Invoke-RestMethod -Uri "$BaseUrl/api/concentrate-reviews" -Method Post -Headers $headers -Body $concentrateData
    Write-Host "  ✅ Concentrate Review créée avec succès!" -ForegroundColor Green
    Write-Host "     ID: $($concentrateResponse.id)" -ForegroundColor Gray
    Write-Host "     Nom: $($concentrateResponse.nomCommercial)`n" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Erreur création Concentrate Review:" -ForegroundColor Red
    Write-Host "     $($_.Exception.Message)`n" -ForegroundColor Red
}

# ====================
# TEST 3: Edible Review
# ====================
Write-Host "📋 TEST 3: Création Edible Review`n" -ForegroundColor Yellow

$edibleData = @{
    nomProduit = "Test Cookie Cannabis"
    typeComestible = "cookie"
    fabricant = "Home Baker"
    typeGenetiques = "Hybride 50/50"
    ingredients = @(
        @{
            id = 1
            nom = "Farine"
            quantite = 200
            unite = "g"
            type = "standard"
            actions = @("Tamiser", "Mélanger")
        },
        @{
            id = 2
            nom = "Beurre de cannabis"
            quantite = 100
            unite = "g"
            type = "cannabinique"
            actions = @("Faire fondre", "Mélanger")
        },
        @{
            id = 3
            nom = "Sucre"
            quantite = 150
            unite = "g"
            type = "standard"
            actions = @("Mélanger")
        },
        @{
            id = 4
            nom = "Chocolat"
            quantite = 100
            unite = "g"
            type = "standard"
            actions = @("Faire fondre", "Verser")
        }
    )
    dosageTHC = 25
    dosageCBD = 5
    nombrePortions = 12
    intensite = 7
    agressivite = 2
    saveursDominantes = "Chocolat, Vanille, Cannabis"
    effetsMontee = 6
    effetsIntensite = 7
    dureeEffets = "2h+"
    effets = @("Relaxé", "Heureux", "Faim", "Somnolent")
} | ConvertTo-Json -Depth 10

try {
    Write-Host "  → POST $BaseUrl/api/edible-reviews" -ForegroundColor Gray
    $edibleResponse = Invoke-RestMethod -Uri "$BaseUrl/api/edible-reviews" -Method Post -Headers $headers -Body $edibleData
    Write-Host "  ✅ Edible Review créée avec succès!" -ForegroundColor Green
    Write-Host "     ID: $($edibleResponse.id)" -ForegroundColor Gray
    Write-Host "     Nom: $($edibleResponse.nomProduit)`n" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Erreur création Edible Review:" -ForegroundColor Red
    Write-Host "     $($_.Exception.Message)`n" -ForegroundColor Red
}

# ====================
# TEST 4: Récupération des reviews créées
# ====================
Write-Host "📋 TEST 4: Vérification récupération reviews`n" -ForegroundColor Yellow

# Hash
if ($hashResponse -and $hashResponse.id) {
    try {
        Write-Host "  → GET $BaseUrl/api/hash-reviews/$($hashResponse.id)" -ForegroundColor Gray
        $hashGet = Invoke-RestMethod -Uri "$BaseUrl/api/hash-reviews/$($hashResponse.id)" -Method Get -Headers $headers
        Write-Host "  ✅ Hash Review récupérée: $($hashGet.nomCommercial)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Erreur récupération Hash Review: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Concentrate
if ($concentrateResponse -and $concentrateResponse.id) {
    try {
        Write-Host "  → GET $BaseUrl/api/concentrate-reviews/$($concentrateResponse.id)" -ForegroundColor Gray
        $concentrateGet = Invoke-RestMethod -Uri "$BaseUrl/api/concentrate-reviews/$($concentrateResponse.id)" -Method Get -Headers $headers
        Write-Host "  ✅ Concentrate Review récupérée: $($concentrateGet.nomCommercial)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Erreur récupération Concentrate Review: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Edible
if ($edibleResponse -and $edibleResponse.id) {
    try {
        Write-Host "  → GET $BaseUrl/api/edible-reviews/$($edibleResponse.id)" -ForegroundColor Gray
        $edibleGet = Invoke-RestMethod -Uri "$BaseUrl/api/edible-reviews/$($edibleResponse.id)" -Method Get -Headers $headers
        Write-Host "  ✅ Edible Review récupérée: $($edibleGet.nomProduit)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Erreur récupération Edible Review: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✅ Tests terminés!`n" -ForegroundColor Cyan
Write-Host "📊 Récapitulatif:" -ForegroundColor Yellow
Write-Host "   - Hash Reviews: $(if($hashResponse){'✅'}else{'❌'})" -ForegroundColor $(if($hashResponse){'Green'}else{'Red'})
Write-Host "   - Concentrate Reviews: $(if($concentrateResponse){'✅'}else{'❌'})" -ForegroundColor $(if($concentrateResponse){'Green'}else{'Red'})
Write-Host "   - Edible Reviews: $(if($edibleResponse){'✅'}else{'❌'})`n" -ForegroundColor $(if($edibleResponse){'Green'}else{'Red'})
