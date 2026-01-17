#!/bin/bash

# Admin Panel Integration Verification
# This script verifies that all admin panel components are properly integrated

echo "🔍 Admin Panel Integration Verification"
echo "========================================"
echo ""

ERRORS=0

# Check 1: Backend file exists
echo -n "✓ Checking backend routes... "
if [ -f "server-new/routes/admin.js" ]; then
    echo "✅"
else
    echo "❌ File missing: server-new/routes/admin.js"
    ((ERRORS++))
fi

# Check 2: Frontend component exists
echo -n "✓ Checking frontend component... "
if [ -f "client/src/pages/admin/AdminPanel.jsx" ]; then
    echo "✅"
else
    echo "❌ File missing: client/src/pages/admin/AdminPanel.jsx"
    ((ERRORS++))
fi

# Check 3: Frontend styles exist
echo -n "✓ Checking frontend styles... "
if [ -f "client/src/pages/admin/AdminPanel.css" ]; then
    echo "✅"
else
    echo "❌ File missing: client/src/pages/admin/AdminPanel.css"
    ((ERRORS++))
fi

# Check 4: server.js includes admin routes
echo -n "✓ Checking server integration... "
if grep -q "import adminRoutes" "server-new/server.js" && grep -q "app.use('/api/admin'" "server-new/server.js"; then
    echo "✅"
else
    echo "❌ Admin routes not properly imported in server.js"
    ((ERRORS++))
fi

# Check 5: App.jsx includes admin route
echo -n "✓ Checking React router integration... "
if grep -q "AdminPanel" "client/src/App.jsx" && grep -q "path=\"/admin\"" "client/src/App.jsx"; then
    echo "✅"
else
    echo "❌ Admin route not properly added to App.jsx"
    ((ERRORS++))
fi

# Check 6: Environment variable is set
echo -n "✓ Checking environment configuration... "
if grep -q "ADMIN_MODE" "server-new/.env"; then
    echo "✅"
else
    echo "⚠️  ADMIN_MODE not in .env (add for development)"
fi

# Check 7: Documentation files exist
echo -n "✓ Checking documentation... "
DOC_COUNT=$(ls ADMIN_PANEL*.md 2>/dev/null | wc -l)
if [ "$DOC_COUNT" -ge 3 ]; then
    echo "✅ ($DOC_COUNT files)"
else
    echo "❌ Missing documentation files"
    ((ERRORS++))
fi

# Check 8: Deployment scripts exist
echo -n "✓ Checking deployment scripts... "
if [ -f "deploy-admin-panel.sh" ] && [ -f "test-admin-endpoints.sh" ]; then
    echo "✅"
else
    echo "❌ Deployment scripts missing"
    ((ERRORS++))
fi

# Check 9: Git status
echo -n "✓ Checking git status... "
if git log --oneline -1 | grep -q "admin"; then
    echo "✅ (Latest: $(git log --oneline -1 | cut -c1-40))"
else
    echo "⚠️  No recent admin-related commits"
fi

echo ""
echo "========================================"

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ All integration checks passed!"
    echo ""
    echo "Ready to:"
    echo "  1. Start development: npm run dev"
    echo "  2. Access admin panel: http://localhost:5173/admin"
    echo "  3. Deploy to VPS: ./deploy-admin-panel.sh"
    exit 0
else
    echo "❌ Found $ERRORS integration error(s)"
    echo ""
    echo "Please review the errors above and ensure all files are in place."
    exit 1
fi
