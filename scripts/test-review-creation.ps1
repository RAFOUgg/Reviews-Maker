# Test de création de review avec le nouveau système de notes par catégorie
Write-Host "🧪 Test de création de review - Type Fleur" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api/reviews"

# Préparation des données de test
$testData = @{
    productType                = "Fleur"
    holderName                 = "Test Auto CategoryRatings"
    cultivars                  = "Test Strain"
    breeder                    = "Test Breeder"
    farm                       = "Test Farm"
    strainType                 = "Équilibré"
    
    # Notes par catégorie (nouveau système)
    "categoryRatings[visual]"  = "8.5"
    "categoryRatings[smell]"   = "9"
    "categoryRatings[taste]"   = "7.5"
    "categoryRatings[effects]" = "8"
    
    # Ancien champ pour compatibilité
    overallRating              = "8.25"
    
    # Champs techniques
    apparence                  = "8"
    structure                  = "7.5"
    trichomes                  = "9"
    
    # Durée des effets
    dureeEffet                 = "2h-4h"
    
    # Description optionnelle
    description                = "Test automatique du système de notes par catégorie. Toutes les fonctionnalités semblent opérationnelles."
    
    # Autres champs
    aromas                     = '["Fruité","Citronné"]'
    tastes                     = '["Sucré","Épicé"]'
    effects                    = '["Relaxant","Créatif"]'
}

Write-Host "📋 Données de test préparées:" -ForegroundColor Yellow
$testData | Format-Table -AutoSize

Write-Host ""
Write-Host "📤 Envoi de la requête POST..." -ForegroundColor Yellow

try {
    # Note: Pour un vrai test, il faudrait inclure des images
    # Pour l'instant, on teste juste la structure de données
    
    $boundary = [System.Guid]::NewGuid().ToString()
    $bodyLines = @()
    
    foreach ($key in $testData.Keys) {
        $bodyLines += "--$boundary"
        $bodyLines += "Content-Disposition: form-data; name=`"$key`""
        $bodyLines += ""
        $bodyLines += $testData[$key]
    }
    
    $bodyLines += "--$boundary--"
    $body = $bodyLines -join "`r`n"
    
    $response = Invoke-WebRequest -Uri $apiUrl -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $body -UseBasicParsing
    
    Write-Host "✅ Réponse HTTP: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Contenu de la réponse:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
    
}
catch {
    Write-Host "❌ Erreur lors de la requête:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📄 Détails de l'erreur:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}

Write-Host ""
Write-Host "🔍 Vérification des logs serveur..." -ForegroundColor Cyan
Write-Host "Consultez la console du serveur backend pour voir les logs détaillés"
