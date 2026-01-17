#!/bin/bash
# VPS: Complete rebuild to fix stale main chunk issue
# This ensures the main entry point chunk (index-*.js) includes updated code

set -e

echo "🔄 Starting complete rebuild on VPS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd ~/Reviews-Maker

# 1. Pull latest from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 2. Completely remove dist/ and node_modules to force rebuild
echo "🗑️  Cleaning build artifacts..."
rm -rf client/dist
rm -rf client/node_modules
rm -rf server-new/node_modules

# 3. Reinstall dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# 4. Clean Vite cache and rebuild
echo "🏗️  Rebuilding client with Vite..."
rm -rf .vite
npm run build

echo ""
echo "📋 Build output:"
ls -lh dist/assets/ | grep -E "index-|AccountPage"

# 5. Go back to root
cd ..

# 6. Install server dependencies (PM2 might depend on them)
echo "📦 Installing server dependencies..."
cd server-new
npm install
cd ..

# 7. Stop, clean, and restart PM2
echo "🛑 Restarting PM2 service..."
pm2 stop reviews-maker || true
sleep 2
pm2 start ecosystem.config.cjs
sleep 3

# 8. Check service status
echo ""
echo "✅ Service Status:"
pm2 status

echo ""
echo "📡 Checking main endpoint..."
curl -s https://terpologie.eu/account | grep -o "Complétez votre profil" && echo "✅ French text FOUND in response!" || echo "⚠️  French text NOT found in response"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Rebuild complete!"
echo ""
echo "📝 Next steps:"
echo "1. Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "2. Clear browser local storage if needed: F12 > Application > Storage > Clear All"
echo "3. Test /account page - should show French 'Complétez votre profil'"
