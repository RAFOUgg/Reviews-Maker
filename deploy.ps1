# Script de déploiement Reviews-Maker v2.0 (Windows PowerShell)
# Usage: .\deploy.ps1 [-Environment "production"]

param(
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Déploiement Reviews-Maker - Environnement: $Environment" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Étape 1: Pull dernières modifications
Write-Host "`n📦 Étape 1: Pull dernières modifications" -ForegroundColor Green
git pull origin prod/from-vps-2025-10-28

# Étape 2: Backend
Write-Host "`n📦 Étape 2: Installation dépendances Backend" -ForegroundColor Green
Set-Location server-new
npm ci --production
npx prisma generate
npx prisma migrate deploy
Set-Location ..

# Étape 3: Frontend
Write-Host "`n📦 Étape 3: Build Frontend" -ForegroundColor Green
Set-Location client
npm ci
npm run build
Set-Location ..

# Étape 4: Backup
Write-Host "`n📦 Étape 4: Backup base de données" -ForegroundColor Green
$backupDate = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "db/backups/reviews-$backupDate.sqlite"
New-Item -ItemType Directory -Path "db/backups" -Force | Out-Null
Copy-Item "db/reviews.sqlite" $backupFile
Write-Host "✅ Backup créé: $backupFile" -ForegroundColor Green

# Étape 5: PM2
Write-Host "`n📦 Étape 5: Redémarrage PM2" -ForegroundColor Green
if ($Environment -eq "production") {
    pm2 restart reviews-backend --env production
    if ($LASTEXITCODE -ne 0) {
        pm2 start ecosystem.config.cjs --env production
    }
}
else {
    pm2 restart reviews-backend
    if ($LASTEXITCODE -ne 0) {
        pm2 start ecosystem.config.cjs
    }
}

pm2 save

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "✅ DÉPLOIEMENT TERMINÉ !" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "`n📊 Commandes utiles:" -ForegroundColor Yellow
Write-Host "   pm2 logs reviews-backend    # Voir les logs"
Write-Host "   pm2 status                  # Statut PM2"
Write-Host "   pm2 restart reviews-backend # Redémarrer"
Write-Host "`n🌐 Application:" -ForegroundColor Yellow
Write-Host "   Backend API: http://localhost:3000"
Write-Host "   Frontend: Servir client/dist avec Nginx ou serveur statique"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray
