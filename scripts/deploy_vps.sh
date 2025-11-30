#!/usr/bin/env bash
set -euo pipefail
echo "== DEPLOY SCRIPT START: $(date) =="
cd "$HOME/Reviews-Maker" || { echo "ERROR: repo not found at $HOME/Reviews-Maker"; exit 2; }

echo "-> git fetch && reset"
git fetch --all --prune
git checkout prod-restore-20251128
git reset --hard origin/prod-restore-20251128
git pull origin prod-restore-20251128

# Build client
if [ -d client ]; then
  echo "-> client: npm ci && npm run build"
  cd client
  npm ci
  npm run build
  cd ..
else
  echo "-> client dir missing"
fi

# Server deps + pm2
if [ -d server-new ]; then
  echo "-> server-new: npm ci --production"
  cd server-new
  npm ci --production
  if command -v pm2 >/dev/null 2>&1; then
    pm2 update || true
    pm2 restart reviews-backend --update-env || pm2 start ecosystem.config.cjs --env production || true
  else
    echo "pm2 not found, please install pm2 on the VPS"
  fi
fi

echo "== DEPLOY SCRIPT END: $(date) =="
