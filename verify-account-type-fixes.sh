#!/bin/bash

# ============================================================================
# Account Type Display Fix - Verification Script
# ============================================================================
# This script verifies that all account type fixes are working correctly
# Run after deploying the fixes to check status
# ============================================================================

set -e

echo "🔍 Account Type Display Fix - Verification Script"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Verify backend auth.js has correct mock data
echo "📋 Check 1: Backend mock data in auth.js"
if grep -q "accountType: 'producer'" server-new/routes/auth.js; then
    echo -e "${GREEN}✅ PASS${NC}: Development mock user has correct accountType field"
else
    echo -e "${RED}❌ FAIL${NC}: Development mock user missing correct accountType field"
fi

if grep -q "tier: 'PRODUCTEUR'" server-new/routes/auth.js; then
    echo -e "${RED}⚠️ WARNING${NC}: Old 'tier' field still present in auth.js"
else
    echo -e "${GREEN}✅ PASS${NC}: No old 'tier' field in auth.js"
fi
echo ""

# Check 2: Verify SettingsPage uses correct field
echo "📋 Check 2: Frontend SettingsPage.jsx account type display"
if grep -q "user.accountType || 'Amateur'" client/src/pages/account/SettingsPage.jsx; then
    echo -e "${GREEN}✅ PASS${NC}: SettingsPage uses correct field: accountType"
else
    echo -e "${RED}❌ FAIL${NC}: SettingsPage not using correct accountType field"
fi

if grep -q "subscriptionType" client/src/pages/account/SettingsPage.jsx; then
    echo -e "${RED}⚠️ WARNING${NC}: Old 'subscriptionType' field still present in SettingsPage"
else
    echo -e "${GREEN}✅ PASS${NC}: No old 'subscriptionType' field in SettingsPage"
fi
echo ""

# Check 3: Verify SettingsPage subscribe button uses correct logic
echo "📋 Check 3: Frontend SettingsPage.jsx subscribe button logic"
if grep -q "user.accountType !== 'consumer'" client/src/pages/account/SettingsPage.jsx; then
    echo -e "${GREEN}✅ PASS${NC}: Subscribe button checks correct field and value"
else
    echo -e "${RED}❌ FAIL${NC}: Subscribe button not using correct logic"
fi
echo ""

# Check 4: Verify ProfilePage uses correct enum values
echo "📋 Check 4: Frontend ProfilePage.jsx badge logic"
if grep -q "profile.accountType === 'producer'" client/src/pages/account/ProfilePage.jsx; then
    echo -e "${GREEN}✅ PASS${NC}: Producer badge uses correct enum value"
else
    echo -e "${RED}❌ FAIL${NC}: Producer badge not using correct enum value"
fi

if grep -q "profile.accountType === 'influencer'" client/src/pages/account/ProfilePage.jsx; then
    echo -e "${GREEN}✅ PASS${NC}: Influencer badge uses correct enum value"
else
    echo -e "${RED}❌ FAIL${NC}: Influencer badge not using correct enum value"
fi

if grep -q "profile.accountType === 'Producteur'" client/src/pages/account/ProfilePage.jsx; then
    echo -e "${RED}⚠️ WARNING${NC}: Old French label 'Producteur' still present in ProfilePage"
else
    echo -e "${GREEN}✅ PASS${NC}: No old French labels in ProfilePage"
fi
echo ""

# Check 5: Verify permission sync has correct mappings
echo "📋 Check 5: Permission sync account type mappings"
if grep -q "consumer:.*label: 'Amateur'" client/src/utils/permissionSync.js; then
    echo -e "${GREEN}✅ PASS${NC}: Consumer correctly maps to 'Amateur'"
else
    echo -e "${RED}⚠️ WARNING${NC}: Consumer to 'Amateur' mapping may be incorrect"
fi

if grep -q "influencer:.*label: 'Influenceur'" client/src/utils/permissionSync.js; then
    echo -e "${GREEN}✅ PASS${NC}: Influencer correctly maps to 'Influenceur'"
else
    echo -e "${RED}⚠️ WARNING${NC}: Influencer to 'Influenceur' mapping may be incorrect"
fi

if grep -q "producer:.*label: 'Producteur'" client/src/utils/permissionSync.js; then
    echo -e "${GREEN}✅ PASS${NC}: Producer correctly maps to 'Producteur'"
else
    echo -e "${RED}⚠️ WARNING${NC}: Producer to 'Producteur' mapping may be incorrect"
fi
echo ""

# Check 6: Verify recent commits
echo "📋 Check 6: Git commit history"
echo "Recent commits related to account type fixes:"
git log --oneline --grep="account" -10 | head -5
echo ""

echo "=================================================="
echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "1. Pull latest changes: git pull origin refactor/project-structure"
echo "2. Restart backend: pm2 restart ecosystem.config.cjs"
echo "3. Clear browser cache and reload"
echo "4. Test login and verify account type displays correctly"
echo ""
