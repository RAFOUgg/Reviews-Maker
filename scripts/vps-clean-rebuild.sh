#!/bin/bash

###########################################################################
# VPS Clean Rebuild Script
# Purpose: Complete cleanup and rebuild to remove stale artifacts
###########################################################################

set -e

PROJECT_DIR="/home/ubuntu/Reviews-Maker"
CLIENT_DIR="$PROJECT_DIR/client"
SERVER_DIR="$PROJECT_DIR/server-new"
BACKUP_DIR="$PROJECT_DIR/.backup-$(date +%Y%m%d-%H%M%S)"

echo "==============================================="
echo "🔄 COMPLETE CLEANUP & REBUILD"
echo "==============================================="

# 1. Create backup of dist folder
echo ""
echo "📦 Creating backup of current dist..."
if [ -d "$CLIENT_DIR/dist" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$CLIENT_DIR/dist" "$BACKUP_DIR/dist-backup"
    echo "✅ Backup created at: $BACKUP_DIR"
else
    echo "ℹ️  No existing dist folder to backup"
fi

# 2. Remove dist folder completely
echo ""
echo "🗑️  Removing dist folder..."
rm -rf "$CLIENT_DIR/dist"
echo "✅ dist/ removed"

# 3. Remove .vite cache
echo ""
echo "🗑️  Removing Vite cache..."
rm -rf "$CLIENT_DIR/.vite"
echo "✅ .vite removed"

# 4. Remove node_modules to ensure clean state
echo ""
echo "🗑️  Removing node_modules (clean install)..."
rm -rf "$CLIENT_DIR/node_modules" "$SERVER_DIR/node_modules"
echo "✅ node_modules removed"

# 5. Git status before fresh install
echo ""
echo "📋 Git status..."
cd "$PROJECT_DIR"
git status

# 6. Fresh npm install for client
echo ""
echo "📥 Installing client dependencies..."
cd "$CLIENT_DIR"
npm install --legacy-peer-deps
echo "✅ Client dependencies installed"

# 7. Fresh npm install for server
echo ""
echo "📥 Installing server dependencies..."
cd "$SERVER_DIR"
npm install --legacy-peer-deps
echo "✅ Server dependencies installed"

# 8. Clean rebuild
echo ""
echo "🏗️  Building client (clean build)..."
cd "$CLIENT_DIR"
npm run build
echo "✅ Build complete"

# 9. List new dist structure
echo ""
echo "📁 New dist structure:"
du -sh "$CLIENT_DIR/dist"
echo ""
echo "Assets in dist/assets:"
ls -lh "$CLIENT_DIR/dist/assets" | grep -E "AccountSetup|AccountPage|\.js$" | head -10

# 10. Verify NO old AccountSetupPage chunks
echo ""
echo "🔍 Verifying old artifacts are gone..."
if find "$CLIENT_DIR/dist" -name "*AccountSetup*" 2>/dev/null; then
    echo "⚠️  WARNING: Old AccountSetup files still found!"
    find "$CLIENT_DIR/dist" -name "*AccountSetup*" -ls
else
    echo "✅ No old AccountSetup artifacts found"
fi

# 11. Restart services
echo ""
echo "🔄 Restarting services..."
pm2 restart reviews-maker
sleep 2
pm2 status
echo "✅ Services restarted"

# 12. Check service health
echo ""
echo "🏥 Checking service health..."
if pm2 describe reviews-maker | grep -q "online"; then
    echo "✅ Service is online"
    echo ""
    echo "📋 Recent logs:"
    pm2 logs reviews-maker --lines 15
else
    echo "❌ Service is NOT online!"
    pm2 logs reviews-maker --lines 30
    exit 1
fi

echo ""
echo "==============================================="
echo "✅ CLEAN REBUILD COMPLETE"
echo "==============================================="
echo ""
echo "📝 NOTES:"
echo "1. Backup saved to: $BACKUP_DIR"
echo "2. Old dist/ completely removed and rebuilt"
echo "3. All artifacts refreshed"
echo "4. Services restarted with new build"
echo ""
echo "🧪 TESTING:"
echo "- Visit: https://terpologie.eu/login"
echo "- Try registering new account"
echo "- Try logging in"
echo "- Navigate to /account - should show French modal if profile incomplete"
echo ""
