#!/bin/bash
# Force VPS to sync with GitHub and restart

set -e

cd ~/Reviews-Maker

echo "🔄 Fetching latest from GitHub..."
git fetch origin

echo "🔄 Resetting to remote version..."
git reset --hard origin/refactor/project-structure

echo "✅ Git synchronized"

echo "🔄 Restarting PM2..."
pm2 restart reviews-maker

echo "⏳ Waiting for restart..."
sleep 3

echo "📊 Checking logs..."
pm2 logs reviews-maker --lines 30 --err

echo "✨ Done!"
