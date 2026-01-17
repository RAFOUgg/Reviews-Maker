#!/bin/bash

# Deploy Admin Panel to Production VPS
# This script deploys the admin panel to the VPS and restarts services

set -e

echo "🚀 Deploying Admin Panel to VPS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="${VPS_HOST:-vps-lafoncedalle}"
VPS_USER="${VPS_USER:-root}"
PROJECT_PATH="${PROJECT_PATH:-/home/reviews-maker}"
BRANCH="${BRANCH:-main}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  VPS Host: $VPS_HOST"
echo "  Project Path: $PROJECT_PATH"
echo "  Branch: $BRANCH"
echo ""

# 1. Pull latest code on VPS
echo -e "${YELLOW}Step 1: Pulling latest code from $BRANCH...${NC}"
ssh -t "$VPS_USER@$VPS_HOST" "cd $PROJECT_PATH && git checkout $BRANCH && git pull origin $BRANCH"

# 2. Install backend dependencies if needed
echo -e "${YELLOW}Step 2: Installing backend dependencies...${NC}"
ssh -t "$VPS_USER@$VPS_HOST" "cd $PROJECT_PATH/server-new && npm ci"

# 3. Install frontend dependencies if needed
echo -e "${YELLOW}Step 3: Installing frontend dependencies...${NC}"
ssh -t "$VPS_USER@$VPS_HOST" "cd $PROJECT_PATH/client && npm ci"

# 4. Build frontend
echo -e "${YELLOW}Step 4: Building frontend...${NC}"
ssh -t "$VPS_USER@$VPS_HOST" "cd $PROJECT_PATH/client && npm run build"

# 5. Restart PM2 services
echo -e "${YELLOW}Step 5: Restarting PM2 services...${NC}"
ssh -t "$VPS_USER@$VPS_HOST" "cd $PROJECT_PATH && pm2 restart ecosystem.config.cjs --env production"

# 6. Verify deployment
echo -e "${YELLOW}Step 6: Verifying deployment...${NC}"
sleep 3
RESPONSE=$(ssh "$VPS_USER@$VPS_HOST" "curl -s http://localhost:3000/api/health")

if echo "$RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo "  API Health: OK"
    echo ""
    echo -e "${GREEN}Admin Panel Access:${NC}"
    echo "  URL: https://reviews-maker.terpologie.fr/admin"
    echo "  Or: http://$VPS_HOST/admin"
    echo ""
    echo -e "${YELLOW}Features:${NC}"
    echo "  • Search and filter users by email or username"
    echo "  • Change account types: [C]onsumer, [I]nfluencer, [P]roducer"
    echo "  • Manage subscription status and ban users"
    echo "  • View user statistics and KYC status"
    exit 0
else
    echo -e "${RED}❌ Deployment verification failed!${NC}"
    echo "  API Health response: $RESPONSE"
    echo ""
    echo "Checking server logs..."
    ssh "$VPS_USER@$VPS_HOST" "pm2 logs --lines 50"
    exit 1
fi
