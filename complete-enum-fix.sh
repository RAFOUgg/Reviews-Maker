#!/bin/bash

# Complete migration and promotion script
# Usage: bash complete-enum-fix.sh bgmgaming09@gmail.com

EMAIL="${1:-bgmgaming09@gmail.com}"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}🚀 COMPLETE ENUM FIX & PROMOTION${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${YELLOW}Email target: ${EMAIL}${NC}"
echo ""

# Step 1: Pull latest code
echo -e "${YELLOW}[1/4] Pulling latest code...${NC}"
cd ~/Reviews-Maker
git pull origin refactor/project-structure
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Pull successful${NC}"
echo ""

# Step 2: List users to verify email exists
echo -e "${YELLOW}[2/4] Listing users to verify email...${NC}"
cd server-new
node scripts/list-users.js | grep -A 5 "$EMAIL"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Email not found in database${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Email found${NC}"
echo ""

# Step 3: Run promotion script
echo -e "${YELLOW}[3/4] Promoting user to PRODUCTEUR...${NC}"
node scripts/set-user-as-producer.js "$EMAIL"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Promotion script failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ User promoted${NC}"
echo ""

# Step 4: Restart backend
echo -e "${YELLOW}[4/4] Restarting backend...${NC}"
cd ..
pm2 restart ecosystem.config.cjs
sleep 3
echo -e "${GREEN}✅ Backend restarted${NC}"
echo ""

# Verify
echo -e "${YELLOW}🔍 Testing API...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -I https://terpologie.eu/api/auth/me)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ API responding correctly (HTTP 200)${NC}"
elif [ "$HTTP_CODE" == "401" ]; then
    echo -e "${YELLOW}⚠️  HTTP 401 (requires authentication - normal)${NC}"
else
    echo -e "${RED}❌ API error (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✅ ALL STEPS COMPLETED!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${YELLOW}Next steps in browser:${NC}"
echo "1. Clear browser cache: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "2. Reload: https://terpologie.eu/account/settings"
echo "3. Should show: 'Type d'abonnement : Producteur' (not 'Standard')"
echo "4. Check profile page for 🌱 badge"
echo ""
