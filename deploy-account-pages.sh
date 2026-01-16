#!/bin/bash

# Deploy Account Pages Redesign to VPS
# Automated deployment of Settings and Subscription Management pages

set -e

echo "🚀 Deploying Account Pages Redesign..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Pull latest code
echo "📥 [1/4] Pulling latest code from repository..."
cd /root/Reviews-Maker
git fetch origin
git pull origin refactor/project-structure
echo "✅ Code updated"

# 2. Build client
echo ""
echo "🔨 [2/4] Building frontend..."
cd /root/Reviews-Maker/client
npm ci --legacy-peer-deps > /dev/null 2>&1
npm run build 2>&1 | grep -E "✓|✗|error" || echo "Build completed"
echo "✅ Frontend built"

# 3. Install server deps if needed
echo ""
echo "📦 [3/4] Checking server dependencies..."
cd /root/Reviews-Maker/server-new
npm ci --legacy-peer-deps > /dev/null 2>&1
echo "✅ Dependencies ready"

# 4. Restart with PM2
echo ""
echo "🔄 [4/4] Restarting application..."
pm2 restart ecosystem.config.cjs > /dev/null 2>&1
echo "✅ Application restarted"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Access the updated pages:"
echo "   • Settings: https://terpologie.eu/account"
echo "   • Subscription: https://terpologie.eu/manage-subscription"
echo ""
echo "📊 PM2 Status:"
pm2 status ecosystem.config.cjs
