#!/bin/bash
set -e

echo "🚀 FULL DEPLOYMENT - Account Pages Redesign"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="/root/Reviews-Maker"
cd $PROJECT_DIR

# 1. Reset to clean state
echo -e "${YELLOW}[1/6]${NC} Cleaning up..."
git reset --hard HEAD
git clean -fd
echo -e "${GREEN}✅ Clean state${NC}"

# 2. Pull latest code
echo -e "\n${YELLOW}[2/6]${NC} Pulling latest code..."
git fetch --all
git checkout refactor/project-structure
git pull origin refactor/project-structure --force
echo -e "${GREEN}✅ Code updated${NC}"

# Verify files are there
if [ ! -f "client/src/pages/account/ManageSubscription.jsx" ]; then
    echo -e "${RED}❌ ManageSubscription.jsx not found!${NC}"
    exit 1
fi
echo "   ✓ ManageSubscription.jsx present"

if grep -q "bg-gradient-to-br from-indigo-50" "client/src/pages/account/SettingsPage.jsx"; then
    echo "   ✓ SettingsPage redesign verified"
else
    echo -e "${RED}❌ SettingsPage not updated!${NC}"
    exit 1
fi

# 3. Build client
echo -e "\n${YELLOW}[3/6]${NC} Building frontend (this may take 1-2 minutes)..."
cd $PROJECT_DIR/client
rm -rf node_modules dist
npm ci --legacy-peer-deps --silent
echo "   Building with Vite..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    cat /tmp/build.log
    exit 1
fi

# 4. Server setup
echo -e "\n${YELLOW}[4/6]${NC} Setting up server..."
cd $PROJECT_DIR/server-new
npm ci --legacy-peer-deps --silent
echo -e "${GREEN}✅ Server ready${NC}"

# 5. Stop and restart PM2
echo -e "\n${YELLOW}[5/6]${NC} Restarting application..."
pm2 stop ecosystem.config.cjs 2>/dev/null || true
sleep 2
pm2 delete ecosystem.config.cjs 2>/dev/null || true
sleep 2
pm2 start ecosystem.config.cjs
sleep 3
echo -e "${GREEN}✅ Application restarted${NC}"

# 6. Verification
echo -e "\n${YELLOW}[6/6]${NC} Verifying deployment..."
pm2 status ecosystem.config.cjs

echo ""
echo "=================================================="
echo -e "${GREEN}✨ DEPLOYMENT COMPLETE!${NC}"
echo "=================================================="
echo ""
echo "🌐 Verify at:"
echo "   • https://terpologie.eu/account"
echo "   • https://terpologie.eu/manage-subscription"
echo ""
echo "📋 Check logs:"
echo "   pm2 logs ecosystem | tail -50"
echo ""
