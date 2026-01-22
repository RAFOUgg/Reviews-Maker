#!/bin/bash
# Restart Reviews-Maker Backend on VPS

echo "🔄 Restarting Reviews-Maker backend..."

# Navigate to project
cd /home/ubuntu/Reviews-Maker

# Restart PM2 process
echo "Stopping current process..."
npx pm2 stop reviews-maker 2>/dev/null || true
sleep 2

echo "Starting process..."
npx pm2 start ecosystem.config.cjs --name reviews-maker

# Wait for startup
sleep 3

# Check status
echo "Status:"
npx pm2 status

# Show recent logs
echo ""
echo "Recent logs:"
npx pm2 logs reviews-maker --lines 20 --nostream

echo ""
echo "✅ Backend restarted successfully"
