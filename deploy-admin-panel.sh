#!/bin/bash

# ============================================
# Deploy Admin Panel to VPS
# ============================================
# This script:
# 1. Pulls latest code from git
# 2. Rebuilds frontend and backend
# 3. Restarts PM2 services
# 4. Sets ADMIN_MODE for testing

set -e  # Exit on any error

echo "🚀 Starting deployment of Admin Panel..."

# ============================================
# 1. Pull latest code
# ============================================
echo "📥 Pulling latest code from git..."
git pull origin main

# ============================================
# 2. Install dependencies
# ============================================
echo "📦 Installing dependencies..."

# Frontend
echo "   → Frontend..."
cd client
npm ci --omit=dev
npm run build
echo "   ✅ Frontend built"

# Backend
echo "   → Backend..."
cd ../server-new
npm ci
echo "   ✅ Backend dependencies installed"

# ============================================
# 3. Setup environment
# ============================================
echo "⚙️  Setting up environment..."

# Ensure .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found in server-new/"
    exit 1
fi

# Add ADMIN_MODE for testing (can be set to false for production)
if ! grep -q "ADMIN_MODE" .env; then
    echo "" >> .env
    echo "# Admin Mode (for testing permissions)" >> .env
    echo "ADMIN_MODE=true" >> .env
    echo "   ✅ Added ADMIN_MODE to .env"
else
    echo "   ✅ ADMIN_MODE already configured"
fi

# ============================================
# 4. Database migrations
# ============================================
echo "🗄️  Running database migrations..."
npm run prisma:migrate

# ============================================
# 5. Restart PM2
# ============================================
echo "🔄 Restarting PM2 processes..."
pm2 restart ecosystem.config.cjs --update-env

# ============================================
# 6. Verify services
# ============================================
echo "🔍 Verifying services..."
sleep 3

# Check if services are running
if pm2 list | grep -q "Reviews-Maker-Server"; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server failed to start"
    pm2 logs Reviews-Maker-Server --lines 20
    exit 1
fi

# ============================================
# 7. Test admin endpoints
# ============================================
echo "🧪 Testing admin endpoints..."

# Wait for server to be ready
sleep 2

# Check admin auth endpoint
RESPONSE=$(curl -s http://localhost:3001/api/admin/check-auth)
if echo "$RESPONSE" | grep -q "isAdmin"; then
    echo "   ✅ Admin API is responding"
else
    echo "   ⚠️  Admin API not responding (may need authentication)"
fi

# ============================================
# 8. Done!
# ============================================
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📌 Next steps:"
echo "   1. Access admin panel at: https://vps-acc1787d/admin"
echo "   2. Login with your admin account"
echo "   3. Test changing account types"
echo "   4. Verify V1 MVP permissions are working"
echo ""
echo "📖 Documentation: See ADMIN_PANEL_GUIDE.md"
echo ""
echo "⚙️  Server logs:"
pm2 logs Reviews-Maker-Server --lines 5
