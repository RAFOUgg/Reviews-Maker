#!/usr/bin/env bash
# secure-deploy.sh
# Script to securely configure production environment and restart PM2
# Usage: sudo bash secure-deploy.sh

set -euo pipefail

ENV_FILE="$(pwd)/.env"
BACKUP_FILE="${ENV_FILE}.bak.$(date +%F_%H%M%S)"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Error: .env not found in $(pwd). Run this script from server-new/"
  exit 1
fi

echo "Backing up ${ENV_FILE} to ${BACKUP_FILE}"
cp "$ENV_FILE" "$BACKUP_FILE"
chmod 600 "$BACKUP_FILE"

# Ensure production defaults are set
read -p "Set FRONTEND_URL (e.g. https://reviews-maker.fr): " FRONTEND_URL
read -p "Set DISCORD_CLIENT_ID: " DISCORD_CLIENT_ID
read -p "Set DISCORD_CLIENT_SECRET (input will be hidden): " -s DISCORD_CLIENT_SECRET
echo
read -p "Set SESSION_SECRET (or enter to reuse a generated value): " -s SESSION_SECRET
if [ -z "$SESSION_SECRET" ]; then
  SESSION_SECRET=$(openssl rand -hex 32)
  echo "Generated random SESSION_SECRET"
fi

echo "Updating ${ENV_FILE} with provided values (sensitive values are not stored in git)"
cat > "$ENV_FILE" <<EOF
NODE_ENV=production
PORT=3000
FRONTEND_URL=${FRONTEND_URL}
DISCORD_REDIRECT_URI=${FRONTEND_URL}/api/auth/discord/callback
DATABASE_URL=\"file:../db/reviews.sqlite\"
DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
SESSION_SECURE=true
SESSION_DOMAIN=.reviews-maker.fr
SESSION_SAME_SITE=None
BASE_PATH=
EOF

# Lock file permissions
chmod 600 "$ENV_FILE"
chown $(whoami):$(whoami) "$ENV_FILE" || true

# Optional: inform PM2 to reload environment. This assumes PM2 is installed and managed by current user.
if command -v pm2 > /dev/null 2>&1; then
  echo "Reloading PM2 apps (using ecosystem if present)."
  if [ -f "../ecosystem.config.cjs" ]; then
    pm2 startOrReload ../ecosystem.config.cjs --env production
  else
    echo "No ecosystem.config.cjs found. You may need to restart pm2 processes manually."
  fi
else
  echo "PM2 not available in PATH. Please restart your process manager manually."
fi

# Post-check
node scripts/check-env.js

echo "Done. If any secrets were leaked in git history, please rotate them now (Discord client secret & session secret)." 

exit 0
