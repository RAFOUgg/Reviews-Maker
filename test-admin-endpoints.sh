#!/bin/bash

# ============================================
# Quick Test Admin Panel Endpoints
# ============================================
# Usage: bash test-admin-endpoints.sh
# Prerequisites: Server running on port 3001, ADMIN_MODE=true in .env

echo "🧪 Testing Admin Panel Endpoints..."
echo ""

BASE_URL="http://localhost:3001"
ADMIN_API="$BASE_URL/api/admin"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# Test 1: Check Admin Auth
# ============================================
echo -n "1️⃣  Testing GET /api/admin/check-auth ... "
RESPONSE=$(curl -s "$ADMIN_API/check-auth")
if echo "$RESPONSE" | grep -q "isAdmin"; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "   Response: $RESPONSE"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   Response: $RESPONSE"
fi
echo ""

# ============================================
# Test 2: Get Users List
# ============================================
echo -n "2️⃣  Testing GET /api/admin/users ... "
RESPONSE=$(curl -s "$ADMIN_API/users")
if echo "$RESPONSE" | grep -q "users"; then
    echo -e "${GREEN}✅ PASS${NC}"
    USER_COUNT=$(echo "$RESPONSE" | grep -o '"id"' | wc -l)
    echo "   Found $USER_COUNT users"
    
    # Extract first user ID for other tests
    FIRST_USER=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   First user ID: $FIRST_USER"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   Response: $RESPONSE"
    exit 1
fi
echo ""

# ============================================
# Test 3: Get User Details
# ============================================
if [ -n "$FIRST_USER" ]; then
    echo -n "3️⃣  Testing GET /api/admin/users/:id ... "
    RESPONSE=$(curl -s "$ADMIN_API/users/$FIRST_USER")
    if echo "$RESPONSE" | grep -q "id"; then
        echo -e "${GREEN}✅ PASS${NC}"
        echo "   User: $(echo "$RESPONSE" | grep -o '"username":"[^"]*' | cut -d'"' -f4)"
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Response: $RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} (no user ID)"
fi
echo ""

# ============================================
# Test 4: Get Stats
# ============================================
echo -n "4️⃣  Testing GET /api/admin/stats ... "
RESPONSE=$(curl -s "$ADMIN_API/stats")
if echo "$RESPONSE" | grep -q "totalUsers"; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "   $(echo "$RESPONSE" | grep -o '"totalUsers":[0-9]*' | cut -d':' -f2)"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   Response: $RESPONSE"
fi
echo ""

# ============================================
# Test 5: Change Account Type (CRITICAL)
# ============================================
if [ -n "$FIRST_USER" ]; then
    echo -n "5️⃣  Testing PATCH /api/admin/users/:id/account-type ... "
    
    # First, check current type
    CURRENT=$(curl -s "$ADMIN_API/users/$FIRST_USER" | grep -o '"accountType":"[^"]*' | cut -d'"' -f4)
    echo ""
    echo "   Current type: $CURRENT"
    
    # Change to different type
    NEW_TYPE="influencer"
    if [ "$CURRENT" = "influencer" ]; then
        NEW_TYPE="consumer"
    fi
    
    echo -n "   Changing to: $NEW_TYPE ... "
    RESPONSE=$(curl -s -X PATCH "$ADMIN_API/users/$FIRST_USER/account-type" \
        -H "Content-Type: application/json" \
        -d "{\"accountType\":\"$NEW_TYPE\"}")
    
    if echo "$RESPONSE" | grep -q "$NEW_TYPE"; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Response: $RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} (no user ID)"
fi
echo ""

# ============================================
# Test 6: Update Subscription
# ============================================
if [ -n "$FIRST_USER" ]; then
    echo -n "6️⃣  Testing PATCH /api/admin/users/:id/subscription ... "
    RESPONSE=$(curl -s -X PATCH "$ADMIN_API/users/$FIRST_USER/subscription" \
        -H "Content-Type: application/json" \
        -d '{"subscriptionStatus":"active"}')
    
    if echo "$RESPONSE" | grep -q "subscriptionStatus"; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Response: $RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} (no user ID)"
fi
echo ""

# ============================================
# Summary
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Admin Panel Endpoints Testing Complete${NC}"
echo ""
echo "Next steps:"
echo "1. Verify browser can access: http://localhost:5173/admin"
echo "2. Test changing account types in UI"
echo "3. Verify permission changes take effect"
echo ""
