#!/usr/bin/env pwsh
# Deploy script for VPS - Reviews-Maker Critical Fixes Deployment (PowerShell)
# This script deploys the latest changes to the VPS

$ErrorActionPreference = "Stop"

Write-Host "🚀 PHASE 7: DEPLOY TO VPS" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host ""

$VPS_HOST = "vps-lafoncedalle"
$DEPLOY_PATH = "/home/ubuntu/Reviews-Maker"

Write-Host "📍 Connecting to VPS: $VPS_HOST" -ForegroundColor Cyan
Write-Host ""

try {
    # Step 1: Pull latest code
    Write-Host "📥 [Step 1/4] Pulling latest code from main..." -ForegroundColor Yellow
    ssh $VPS_HOST "cd $DEPLOY_PATH && git fetch origin && git checkout main && git pull origin main"
    
    # Step 2: Install dependencies
    Write-Host ""
    Write-Host "📦 [Step 2/4] Installing dependencies..." -ForegroundColor Yellow
    ssh $VPS_HOST "cd $DEPLOY_PATH/server-new && npm install --omit=dev"
    
    # Step 3: Run database migrations
    Write-Host ""
    Write-Host "🔄 [Step 3/4] Running database migrations..." -ForegroundColor Yellow
    ssh $VPS_HOST "cd $DEPLOY_PATH/server-new && npm run prisma:migrate -- --skip-generate" | Out-Null
    
    # Step 4: Restart PM2 process
    Write-Host ""
    Write-Host "🔃 [Step 4/4] Restarting PM2 processes..." -ForegroundColor Yellow
    ssh $VPS_HOST "cd $DEPLOY_PATH && pm2 restart reviews-maker || pm2 start ecosystem.config.cjs"
    
    Write-Host ""
    Write-Host "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
    Write-Host "  - Latest code pulled from GitHub"
    Write-Host "  - Dependencies installed"
    Write-Host "  - Database migrations applied"
    Write-Host "  - PM2 processes restarted"
    Write-Host ""
    Write-Host "🔗 Access your application at:" -ForegroundColor Cyan
    Write-Host "  - Frontend: npm run dev (localhost:5173)"
    Write-Host "  - Backend: http://vps-lafoncedalle:3000"
    Write-Host ""
    Write-Host "📋 To check logs:" -ForegroundColor Cyan
    Write-Host "  ssh $VPS_HOST 'pm2 logs reviews-maker --lines 50'"
    Write-Host ""

} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
}
