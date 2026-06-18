#!/usr/bin/env pwsh
# Deploy script for VPS - Reviews-Maker Critical Fixes Deployment (PowerShell)
# This script deploys the latest changes to the VPS

$ErrorActionPreference = "Stop"

Write-Host "🚀 PHASE 7: DEPLOY TO VPS" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host ""

$VPS_HOST = "vps-lafoncedalle"
$DEPLOY_PATH = "/home/ubuntu/Reviews-Maker"
$WEB_ROOT = "/var/www/reviews-maker/client/dist"

Write-Host "📍 Connecting to VPS: $VPS_HOST" -ForegroundColor Cyan
Write-Host ""

try {
    # Step 1: Pull latest code
    Write-Host "📥 [Step 1/6] Pulling latest code from main..." -ForegroundColor Yellow
    ssh $VPS_HOST "cd $DEPLOY_PATH && git fetch origin && git checkout main && git pull origin main"

    # Step 2: Install server dependencies
    Write-Host ""
    Write-Host "📦 [Step 2/6] Installing server dependencies..." -ForegroundColor Yellow
    ssh $VPS_HOST "cd $DEPLOY_PATH/server-new && npm install --omit=dev"

    # Step 3: Build frontend
    Write-Host ""
    Write-Host "🏗️  [Step 3/6] Building frontend (Vite)..." -ForegroundColor Yellow
    ssh $VPS_HOST "cd $DEPLOY_PATH/client && npm install && npm run build"

    # Step 4: Sync built frontend to the actual Nginx web root
    # NOTE: Nginx serves from $WEB_ROOT, NOT from $DEPLOY_PATH/client/dist directly.
    # Without this step, deployed builds never reach the live site.
    Write-Host ""
    Write-Host "📤 [Step 4/6] Syncing build to Nginx web root ($WEB_ROOT)..." -ForegroundColor Yellow
    ssh $VPS_HOST "sudo rsync -a --delete $DEPLOY_PATH/client/dist/ $WEB_ROOT/ && sudo chown -R www-data:www-data $WEB_ROOT"

    # Step 5: Run database migrations
    Write-Host ""
    Write-Host "🔄 [Step 5/6] Running database migrations..." -ForegroundColor Yellow
    ssh $VPS_HOST "cd $DEPLOY_PATH/server-new && npx prisma migrate deploy"

    # Step 6: Restart PM2 process
    Write-Host ""
    Write-Host "🔃 [Step 6/6] Restarting PM2 processes..." -ForegroundColor Yellow
    ssh $VPS_HOST "cd $DEPLOY_PATH && npx pm2 restart reviews-maker"

    Write-Host ""
    Write-Host "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
    Write-Host "  - Latest code pulled from GitHub"
    Write-Host "  - Server dependencies installed"
    Write-Host "  - Frontend built (Vite)"
    Write-Host "  - Build synced to Nginx web root"
    Write-Host "  - Database migrations applied"
    Write-Host "  - PM2 process restarted"
    Write-Host ""
    Write-Host "🔗 Access your application at:" -ForegroundColor Cyan
    Write-Host "  - Frontend: npm run dev (localhost:5173)"
    Write-Host "  - Backend: http://vps-lafoncedalle:3000"
    Write-Host ""
    Write-Host "📋 To check logs:" -ForegroundColor Cyan
    Write-Host "  ssh $VPS_HOST 'pm2 logs reviews-maker --lines 50'"
    Write-Host ""

}
catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
}
