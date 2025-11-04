#!/usr/bin/env pwsh
# ============================================================================
# 🚀 Reviews-Maker - Lanceur Principal
# ============================================================================
# Usage: .\START.ps1
# Ce script démarre automatiquement le backend ET le frontend
# ============================================================================

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "Reviews-Maker - Lanceur"

Write-Host "`n" -NoNewline
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🌿 REVIEWS-MAKER - DÉMARRAGE                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier Node.js
Write-Host "🔍 Vérification de l'environnement..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js n'est pas installé !" -ForegroundColor Red
    Write-Host "    Téléchargez-le sur https://nodejs.org" -ForegroundColor Red
    pause
    exit 1
}

# Arrêter les anciens processus Node
Write-Host "`n🛑 Nettoyage des anciens processus..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 1
    Write-Host "  ✓ Anciens processus arrêtés" -ForegroundColor Green
} else {
    Write-Host "  ✓ Aucun processus à arrêter" -ForegroundColor Green
}

# Vérifier les dépendances
Write-Host "`n📦 Vérification des dépendances..." -ForegroundColor Yellow

if (!(Test-Path "server-new/node_modules")) {
    Write-Host "  → Installation des dépendances backend..." -ForegroundColor Gray
    Set-Location server-new
    npm install --silent
    Set-Location ..
    Write-Host "  ✓ Backend prêt" -ForegroundColor Green
} else {
    Write-Host "  ✓ Backend déjà installé" -ForegroundColor Green
}

if (!(Test-Path "client/node_modules")) {
    Write-Host "  → Installation des dépendances frontend..." -ForegroundColor Gray
    Set-Location client
    npm install --silent
    Set-Location ..
    Write-Host "  ✓ Frontend prêt" -ForegroundColor Green
} else {
    Write-Host "  ✓ Frontend déjà installé" -ForegroundColor Green
}

# Démarrer le backend
Write-Host "`n🔧 Démarrage du backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location server-new
    npm start
}
Start-Sleep -Seconds 3

# Vérifier que le backend répond
$backendReady = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {
        Write-Host "  ⏳ Tentative $i/10..." -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
}

if ($backendReady) {
    Write-Host "  ✓ Backend actif sur http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "  ✗ Le backend n'a pas démarré correctement" -ForegroundColor Red
    Stop-Job $backendJob
    Remove-Job $backendJob
    pause
    exit 1
}

# Démarrer le frontend
Write-Host "`n🎨 Démarrage du frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location client
    npm run dev
}
Start-Sleep -Seconds 3

# Vérifier que le frontend répond
$frontendReady = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            break
        }
    } catch {
        Write-Host "  ⏳ Tentative $i/10..." -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
}

if ($frontendReady) {
    Write-Host "  ✓ Frontend actif sur http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "  ✗ Le frontend n'a pas démarré correctement" -ForegroundColor Red
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
    pause
    exit 1
}

# Succès !
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║               ✅ REVIEWS-MAKER EST PRÊT !                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Accédez au site : " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 API Backend     : " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Pour arrêter : Appuyez sur " -NoNewline -ForegroundColor Yellow
Write-Host "CTRL+C" -NoNewline -ForegroundColor White
Write-Host " dans cette fenêtre" -ForegroundColor Yellow
Write-Host ""

# Ouvrir le navigateur automatiquement
Start-Sleep -Seconds 1
Start-Process "http://localhost:5173"

# Attendre et afficher les logs
Write-Host "📋 Logs en direct (CTRL+C pour arrêter):`n" -ForegroundColor Cyan

try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Vérifier que les jobs tournent toujours
        if ($backendJob.State -ne "Running") {
            Write-Host "⚠️  Le backend s'est arrêté !" -ForegroundColor Red
            break
        }
        if ($frontendJob.State -ne "Running") {
            Write-Host "⚠️  Le frontend s'est arrêté !" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "`n🛑 Arrêt des serveurs..." -ForegroundColor Yellow
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ Tous les serveurs sont arrêtés" -ForegroundColor Green
}
