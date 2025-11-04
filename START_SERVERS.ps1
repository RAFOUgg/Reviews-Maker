#!/usr/bin/env pwsh
# Script de démarrage des serveurs Reviews-Maker

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🚀 REVIEWS-MAKER - START SERVERS 🚀             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Arrêter tous les anciens processus node
Write-Host "🛑 Arrêt des anciens processus Node..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Fait!" -ForegroundColor Green
Write-Host ""

# Démarrer le backend
Write-Host "▶️  Démarrage du BACKEND (port 3000)..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\server-new"
    & npm start 2>&1
} -Name "backend"
Write-Host "✅ Backend lancé (Job ID: $($backendJob.Id))" -ForegroundColor Green

Start-Sleep -Seconds 3

# Démarrer le frontend
Write-Host "▶️  Démarrage du FRONTEND (port 5173)..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client"
    & npm run dev 2>&1
} -Name "frontend"
Write-Host "✅ Frontend lancé (Job ID: $($frontendJob.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            ✨ SERVEURS OPÉRATIONNELS ✨                ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║ 🌐 Frontend : http://localhost:5173                    ║" -ForegroundColor Green
Write-Host "║ ⚙️  Backend  : http://localhost:3000                    ║" -ForegroundColor Green
Write-Host "║ 📊 Health   : http://localhost:3000/api/health         ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "║ Appuie Ctrl+C pour arrêter les serveurs               ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Attendre que les jobs tournent
Get-Job | Wait-Job
