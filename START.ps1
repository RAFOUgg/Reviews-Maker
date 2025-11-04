#!/usr/bin/env pwsh
# ============================================================================
# Reviews-Maker - Lanceur Principal
# ============================================================================
# Usage: .\START.ps1
# Ce script demarre automatiquement le backend ET le frontend
# ============================================================================

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "Reviews-Maker - Lanceur"

Write-Host "`n" -NoNewline
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "           REVIEWS-MAKER - DEMARRAGE                            " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier Node.js
Write-Host "Verification de l'environnement..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  [OK] Node.js: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "  [ERREUR] Node.js n'est pas installe !" -ForegroundColor Red
    Write-Host "    Telechargez-le sur https://nodejs.org" -ForegroundColor Red
    pause
    exit 1
}

# Arreter les anciens processus Node
Write-Host "`nNettoyage des anciens processus..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 1
    Write-Host "  [OK] Anciens processus arretes" -ForegroundColor Green
}
else {
    Write-Host "  [OK] Aucun processus a arreter" -ForegroundColor Green
}

# Verifier les dependances
Write-Host "`nVerification des dependances..." -ForegroundColor Yellow

if (!(Test-Path "server-new/node_modules")) {
    Write-Host "  Installation des dependances backend..." -ForegroundColor Gray
    Set-Location server-new
    npm install --silent
    Set-Location ..
    Write-Host "  [OK] Backend pret" -ForegroundColor Green
}
else {
    Write-Host "  [OK] Backend deja installe" -ForegroundColor Green
}

if (!(Test-Path "client/node_modules")) {
    Write-Host "  Installation des dependances frontend..." -ForegroundColor Gray
    Set-Location client
    npm install --silent
    Set-Location ..
    Write-Host "  [OK] Frontend pret" -ForegroundColor Green
}
else {
    Write-Host "  [OK] Frontend deja installe" -ForegroundColor Green
}

# Demarrer le backend
Write-Host "`nDemarrage du backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location server-new
    npm start
}
Start-Sleep -Seconds 3

# Verifier que le backend repond
$backendReady = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    }
    catch {
        Write-Host "  Tentative $i/10..." -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
}

if ($backendReady) {
    Write-Host "  [OK] Backend actif sur http://localhost:3000" -ForegroundColor Green
}
else {
    Write-Host "  [ERREUR] Le backend n'a pas demarre correctement" -ForegroundColor Red
    Stop-Job $backendJob
    Remove-Job $backendJob
    pause
    exit 1
}

# Demarrer le frontend
Write-Host "`nDemarrage du frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location client
    npm run dev
}
Start-Sleep -Seconds 3

# Verifier que le frontend repond
$frontendReady = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            break
        }
    }
    catch {
        Write-Host "  Tentative $i/10..." -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
}

if ($frontendReady) {
    Write-Host "  [OK] Frontend actif sur http://localhost:5173" -ForegroundColor Green
}
else {
    Write-Host "  [ERREUR] Le frontend n'a pas demarre correctement" -ForegroundColor Red
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
    pause
    exit 1
}

# Succes !
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "               REVIEWS-MAKER EST PRET !                         " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Site web : " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Backend : " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour arreter : Appuyez sur " -NoNewline -ForegroundColor Yellow
Write-Host "CTRL+C" -NoNewline -ForegroundColor White
Write-Host " dans cette fenetre" -ForegroundColor Yellow
Write-Host ""

# Ouvrir le navigateur automatiquement
Start-Sleep -Seconds 1
Start-Process "http://localhost:5173"

# Attendre et afficher les logs
Write-Host "Logs en direct (CTRL+C pour arreter):`n" -ForegroundColor Cyan

try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Verifier que les jobs tournent toujours
        if ($backendJob.State -ne "Running") {
            Write-Host "[ALERTE] Le backend s'est arrete !" -ForegroundColor Red
            break
        }
        if ($frontendJob.State -ne "Running") {
            Write-Host "[ALERTE] Le frontend s'est arrete !" -ForegroundColor Red
            break
        }
    }
}
finally {
    Write-Host "`nArret des serveurs..." -ForegroundColor Yellow
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "[OK] Tous les serveurs sont arretes" -ForegroundColor Green
}
