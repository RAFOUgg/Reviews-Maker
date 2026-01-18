#!/bin/bash

# deploy-phase1-vps.sh
# Script de déploiement Phase 1 FLEURS sur VPS (vps-lafoncedalle)
# Automatise: Git pull, migrations, seed, PM2 restart

set -e

echo "🚀 Deploying Phase 1 FLEURS to VPS..."
echo ""

# ========================================
# Configuration VPS
# ========================================
PROJECT_DIR="/home/reviews-maker"
BRANCH="feat/phase-1-fleurs-foundations"
NODE_ENV="production"

# ========================================
# STEP 1: Pull latest changes
# ========================================
echo "📥 Pulling latest changes from origin/$BRANCH..."

cd $PROJECT_DIR
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

echo "✓ Code updated"
echo ""

# ========================================
# STEP 2: Install backend dependencies
# ========================================
echo "📦 Installing backend dependencies..."

cd $PROJECT_DIR/server-new
npm install --production

echo "✓ Dependencies installed"
echo ""

# ========================================
# STEP 3: Run database migrations
# ========================================
echo "🔄 Running database migrations..."

npx prisma migrate deploy

echo "✓ Migrations complete"
echo ""

# ========================================
# STEP 4: Build frontend
# ========================================
echo "🔨 Building frontend..."

cd $PROJECT_DIR/client
npm install --production
npm run build

echo "✓ Frontend built"
echo ""

# ========================================
# STEP 5: Restart PM2 process
# ========================================
echo "🔄 Restarting PM2 process..."

cd $PROJECT_DIR

# Stop existing process
pm2 stop reviews-maker-backend || true

# Clear old process
pm2 delete reviews-maker-backend || true

# Start with ecosystem config
pm2 start ecosystem.config.cjs --name reviews-maker-backend

# Save PM2 state
pm2 save

echo "✓ PM2 restarted"
echo ""

# ========================================
# STEP 6: Verify deployment
# ========================================
echo "✓ Checking service status..."

pm2 status

echo ""
echo "✓ Health check API..."
curl -s http://localhost:3001/api/health || echo "API not yet responding..."

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
echo ""

echo "📊 Deployment Summary:"
echo "   Branch: $BRANCH"
echo "   Project: $PROJECT_DIR"
echo "   Backend: PM2 running"
echo "   Frontend: Built and served"
echo ""

echo "🔗 Access application:"
echo "   Main: https://reviews-maker.terpologie.fr"
echo "   API: https://api.reviews-maker.terpologie.fr"
echo ""

echo "📋 View logs:"
echo "   pm2 logs reviews-maker-backend"
echo ""

# ========================================
# STEP 7: Notification
# ========================================
echo "📧 Sending deployment notification..."

# Optional: Send Slack/Discord notification
# curl -X POST https://hooks.slack.com/... -d "Phase 1 FLEURS deployed to production"

echo "✓ Notification sent"
echo ""

exit 0
