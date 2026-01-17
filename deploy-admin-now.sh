#!/bin/bash
# Quick Admin Panel Deployment for VPS
# Run this exact command on VPS SSH terminal

cd ~/Reviews-Maker && \
echo "🔄 Pulling latest code..." && \
git pull origin main && \
echo "📦 Building frontend..." && \
npm run build --prefix client && \
echo "🔄 Restarting server..." && \
pm2 restart reviews-maker && \
sleep 3 && \
echo "📋 Recent logs:" && \
pm2 logs reviews-maker --lines 50 --nostream

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Open: https://terpologie.eu/admin"
echo "2. Press: Ctrl+Shift+R (hard refresh)"
echo "3. Press: F12 (open console)"
echo "4. Check for console logs:"
echo "   - 📄 AdminPanel.jsx module loaded!"
echo "   - 🔨 AdminPanel component function called!"
echo "   - 🔧 AdminPanel useEffect - checking auth..."
echo "   - 🔐 Calling /api/admin/check-auth"
