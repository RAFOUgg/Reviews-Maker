#!/bin/bash

# Deployment script for Reviews-Maker admin panel

echo "🚀 Deploying Admin Panel Update to VPS..."

# Ensure we're in the right directory
cd ~/Reviews-Maker || exit 1

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main || exit 1

# Update .env if needed
echo "⚙️  Checking .env configuration..."
if ! grep -q "^ADMIN_MODE=true" server-new/.env; then
    echo "   Adding ADMIN_MODE=true to .env..."
    echo "ADMIN_MODE=true" >> server-new/.env
fi

# Rebuild frontend
echo "🔨 Building frontend..."
cd client && npm ci && npm run build && cd .. || exit 1

# Restart backend with PM2
echo "♻️  Restarting backend service..."
pm2 restart reviews-maker || exit 1

# Wait for service to stabilize
sleep 3

# Check status
echo "✅ Checking service status..."
pm2 status

# Check health endpoint
echo "🏥 Checking API health..."
curl -s http://localhost:3000/api/health | jq . || echo "   API responding"

echo ""
echo "✨ Deployment complete!"
echo "Admin panel available at: https://terpologie.eu/admin"
echo "Check logs with: pm2 logs reviews-maker"
