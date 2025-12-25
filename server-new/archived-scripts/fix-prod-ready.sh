#!/usr/bin/env bash
set -euo pipefail

# Archived: fix-prod-ready.sh
# This script was moved from `scripts/` to `archived-scripts/` during a production cleanup.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "(ARCHIVE) Fixing repository for production readiness..."

if git ls-files --error-unmatch server-new/.env.save > /dev/null 2>&1; then
  echo "(ARCHIVE) Removing tracked server-new/.env.save from git..."
  git rm --cached server-new/.env.save || true
  git commit -m "chore: remove tracked env save file from repo" || true
else
  echo "(ARCHIVE) server-new/.env.save is not tracked; skipping removal"
fi

if ! grep -q "server-new/.env.save" .gitignore 2>/dev/null; then
  echo "(ARCHIVE) Adding server-new/.env.save to .gitignore"
  echo "server-new/.env.save" >> .gitignore
  git add .gitignore
  git commit -m "chore: ignore env save files" || true
else
  echo "(ARCHIVE) .env.save already ignored"
fi

echo "(ARCHIVE) Ensuring server-new/.env exists..."
if [ ! -f server-new/.env ]; then
  cp server-new/.env.example server-new/.env
  echo "Created server-new/.env from example; remember to set your secrets manually (do not keep them in the repo)"
fi

echo "(ARCHIVE) Locking .env permission and owner to current user"
chmod 600 server-new/.env || true
chown $(whoami):$(whoami) server-new/.env || true

echo "(ARCHIVE) Running environment checks..."
node server-new/scripts/check-env.js || true

echo "(ARCHIVE) Reloading pm2 ecosystem (if pm2 available and ecosystem file exists)"
if command -v pm2 >/dev/null 2>&1; then
  if [ -f server-new/ecosystem.config.cjs ]; then
    pm2 startOrReload server-new/ecosystem.config.cjs --env production || true
    echo "PM2 reload asked (check output)"
  else
    echo "No ecosystem config found"
  fi
else
  echo "PM2 not found in PATH"
fi

echo "(ARCHIVE) Done. Please rotate secrets immediately if they were exposed in the repo history."
