#!/bin/bash

# Test Admin API Endpoints
# This script tests all admin panel endpoints

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
ADMIN_API="$BASE_URL/api/admin"

echo "🧪 Testing Admin Panel API"
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_count=0
pass_count=0

test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    ((test_count++))
    echo -n "Test $test_count: $description... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$ADMIN_API$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$ADMIN_API$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ PASS (HTTP $http_code)${NC}"
        ((pass_count++))
    else
        echo -e "${RED}❌ FAIL (HTTP $http_code)${NC}"
        echo "  Response: $body"
    fi
}

# Test 1: Check admin auth
test_endpoint "GET" "/check-auth" "Check admin authentication"

# Test 2: Get all users
test_endpoint "GET" "/users" "Get all users"

# Test 3: Get stats
test_endpoint "GET" "/stats" "Get statistics"

# Test 4-7: Account type changes (requires user ID)
echo ""
echo -e "${YELLOW}Note: Account type and subscription tests require valid user IDs${NC}"
echo "      These tests would need actual user data from the database"
echo ""

# Summary
echo -e "\n${YELLOW}Test Summary:${NC}"
echo "  Total Tests: $test_count"
echo "  Passed: $pass_count"
echo "  Failed: $((test_count - pass_count))"

if [ $pass_count -eq $test_count ]; then
    echo -e "\n${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed!${NC}"
    exit 1
fi
