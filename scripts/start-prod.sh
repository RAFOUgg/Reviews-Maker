#!/usr/bin/env bash
# Build & deploy script for production (VPS)
# Usage: ./scripts/start-prod.sh
set -euo pipefail

WORKDIR="/home/ubuntu/Reviews-Maker"
CLIENT_DIR="$WORKDIR/client"
SERVER_DIR="$WORKDIR/server-new"
FRONT_DIST="$CLIENT_DIR/dist"
# The directory served by Nginx in docs/PLAN_IMPLEMENTATION.md was /var/www/reviews-maker/client/dist
PROD_STATIC_DIR="/var/www/reviews-maker/client/dist"
ECOSYSTEM="$SERVER_DIR/ecosystem.config.cjs"

if [ "$USER" = "root" ]; then
  echo "Run as ubuntu user (non-root), otherwise PM2 PATH issues may happen"
  exit 1
fi

# Build client
cd "$CLIENT_DIR"
echo "Building client..."
npm ci
# Ensure build uses the correct API base for production
export VITE_API_BASE="/api"
npm run build

# Copy build to static folder
sudo mkdir -p "$PROD_STATIC_DIR"
sudo rsync -a --delete "$FRONT_DIST/" "$PROD_STATIC_DIR/"

# Ensure correct file ownership
sudo chown -R ubuntu:ubuntu "$PROD_STATIC_DIR"

# Load env and restart PM2
cd "$SERVER_DIR"
if [ -f "$ECOSYSTEM" ]; then
  pm2 startOrReload "$ECOSYSTEM" --env production
else
  pm2 restart reviews-backend --update-env || pm2 start ./server.js --name reviews-backend -i 1 --update-env
fi

# Print status
pm2 list
ss -tulpn | grep :3000 || true

echo "Deploy finished. Check logs: pm2 logs reviews-backend --lines 200"
